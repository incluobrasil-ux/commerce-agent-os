// Shell dispatcher — invoca agentes via `pnpm <command>` em child_process.
//
// Substitui o noopDispatcher quando o Chefe deve executar de verdade (flag
// --execute). Mantém a abstração StepDispatcher do runner: caller permanece
// agnóstico ao mecanismo de invocação.
//
// Princípios:
// 1. Lê o pnpmCommand do registry (single source of truth).
// 2. Propaga --tenant/--store sempre que aplicável.
// 3. Mapeia exit code → StageStatus (0=completed, 3=skipped_gracefully, *=failed_recoverable).
// 4. Não interpreta stdout — apenas registra. Artefatos ficam no vault do agente.
// 5. Cross-platform: usa `shell: true` no Windows para resolver `pnpm` no PATH.

import { spawn } from 'node:child_process';
import type { OrchestrationBundle, StageStatus } from './bundle.js';
import { getAgent } from './registry.js';
import type { StepDispatcher, StepResult } from './runner.js';

export interface ShellDispatcherOptions {
  /** Diretório de trabalho onde os comandos pnpm são resolvidos (raiz do monorepo). */
  cwd: string;
  /** Logger para streaming de stdout/stderr dos agentes. */
  logger?: (line: string) => void;
  /** Se true, spawna de verdade. Se false, faz dry-plan (só registra "would run"). */
  executable: boolean;
  /** Timeout por step em ms. 0 = sem timeout. Default: 300000 (5 min). */
  timeoutMs?: number;
}

/**
 * Constrói um dispatcher que invoca agentes via shell.
 *
 * Convenção de exit code dos agentes (definida em SETUP_LOCAL.md):
 *   0 = sucesso
 *   1 = erro recuperável (continuar run)
 *   2 = arg inválido (não deveria acontecer — falha terminal)
 *   3 = SKIPPED gracioso (credenciais faltando)
 */
export function makeShellDispatcher(opts: ShellDispatcherOptions): StepDispatcher {
  return async (step, bundle) => {
    const t0 = Date.now();
    const agent = getAgent(step.agent);

    if (!agent) {
      opts.logger?.(`[dispatcher] agente ${step.agent} não encontrado no registry\n`);
      return failResult(step.agent, bundle, t0, 'agent_not_in_registry');
    }

    if (!agent.pnpmCommand) {
      opts.logger?.(`[dispatcher] ${step.agent} é library-only (sem CLI) — pulando\n`);
      return skipResult(step.agent, bundle, t0);
    }

    const args = buildAgentArgs(agent.pnpmCommand, bundle);

    if (!opts.executable) {
      opts.logger?.(`[dispatcher] dry-plan: pnpm ${args.join(' ')}\n`);
      return okResult(step.agent, bundle, t0);
    }

    opts.logger?.(`[dispatcher] → pnpm ${args.join(' ')}\n`);
    const exitCode = await runChildProcess(args, opts);
    const durationMs = Date.now() - t0;
    const status = mapExitCode(exitCode);
    opts.logger?.(
      `[dispatcher] ← ${step.agent} exit=${exitCode} status=${status} (${durationMs}ms)\n`,
    );
    return { stage: bundle.stage, agent: step.agent, status, durationMs };
  };
}

function buildAgentArgs(pnpmCommand: string, bundle: OrchestrationBundle): string[] {
  const args = [pnpmCommand, `--tenant=${bundle.tenantId}`];
  if (bundle.storeId && bundle.storeId !== '_no-store_') {
    args.push(`--store=${bundle.storeId}`);
  }
  return args;
}

async function runChildProcess(args: string[], opts: ShellDispatcherOptions): Promise<number> {
  return new Promise((resolveExit) => {
    const child = spawn('pnpm', args, {
      cwd: opts.cwd,
      shell: process.platform === 'win32',
      env: process.env,
    });

    child.stdout?.on('data', (data: Buffer) => opts.logger?.(data.toString()));
    child.stderr?.on('data', (data: Buffer) => opts.logger?.(data.toString()));

    const timeoutMs = opts.timeoutMs ?? 300_000;
    const timer =
      timeoutMs > 0
        ? setTimeout(() => {
            opts.logger?.(`[dispatcher] timeout após ${timeoutMs}ms — matando processo\n`);
            child.kill('SIGTERM');
          }, timeoutMs)
        : null;

    child.on('exit', (code) => {
      if (timer) clearTimeout(timer);
      resolveExit(code ?? 1);
    });
    child.on('error', (err) => {
      if (timer) clearTimeout(timer);
      opts.logger?.(`[dispatcher] spawn error: ${err.message}\n`);
      resolveExit(1);
    });
  });
}

function mapExitCode(code: number): StageStatus {
  if (code === 0) return 'completed';
  if (code === 3) return 'skipped_gracefully';
  if (code === 2) return 'failed_terminal';
  return 'failed_recoverable';
}

function okResult(agent: string, bundle: OrchestrationBundle, t0: number): StepResult {
  return { stage: bundle.stage, agent, status: 'completed', durationMs: Date.now() - t0 };
}

function skipResult(agent: string, bundle: OrchestrationBundle, t0: number): StepResult {
  return {
    stage: bundle.stage,
    agent,
    status: 'skipped_gracefully',
    skipReason: 'library_only_or_no_cli',
    durationMs: Date.now() - t0,
  };
}

function failResult(
  agent: string,
  bundle: OrchestrationBundle,
  t0: number,
  reason: string,
): StepResult {
  return {
    stage: bundle.stage,
    agent,
    status: 'failed_recoverable',
    skipReason: reason,
    durationMs: Date.now() - t0,
  };
}
