// Runner — máquina de estados + checkpoint/resume.
//
// Recebe um ExecutionPlan e progride o bundle step-by-step, persistindo no
// vault entre cada checkpoint. Por design, o runner NÃO executa diretamente
// os agentes Tier-2+ — ele despacha via shell (pnpm <command>) ou retorna o
// próximo step esperado para que o caller (CLI) execute.
//
// Isso mantém zero dependência circular com os pacotes de agentes.

import { promises as fs } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { OrchestrationBundle, StageStatus } from './bundle.js';
import { advanceStage, blockBundle } from './bundle.js';
import type { ExecutionPlan } from './planner.js';
import { shouldStop } from './policy.js';

export interface RunnerOptions {
  /** Raiz do vault para persistir runs. */
  vaultRoot: string;
}

/** Local canônico do checkpoint persistido. */
export function runCheckpointPath(opts: RunnerOptions, bundle: OrchestrationBundle): string {
  const scope =
    bundle.executionScope === 'store' && bundle.storeId !== '_no-store_'
      ? `tenants/${bundle.tenantId}/stores/${bundle.storeId}/runs`
      : `tenants/${bundle.tenantId}/runs`;
  return resolve(opts.vaultRoot, scope, `${bundle.runId}.json`);
}

/** Persiste o bundle atual no vault. Cria dir se necessário. */
export async function checkpoint(
  opts: RunnerOptions,
  bundle: OrchestrationBundle,
): Promise<string> {
  const path = runCheckpointPath(opts, bundle);
  await fs.mkdir(dirname(path), { recursive: true });
  await fs.writeFile(path, JSON.stringify(bundle, null, 2), 'utf8');
  return path;
}

/** Carrega checkpoint do vault, se existir. */
export async function resumeFromCheckpoint(
  opts: RunnerOptions,
  runId: string,
  tenantId: string,
  storeId?: string,
): Promise<OrchestrationBundle | null> {
  const scope = storeId ? `tenants/${tenantId}/stores/${storeId}/runs` : `tenants/${tenantId}/runs`;
  const path = resolve(opts.vaultRoot, scope, `${runId}.json`);
  try {
    const content = await fs.readFile(path, 'utf8');
    return JSON.parse(content) as OrchestrationBundle;
  } catch {
    return null;
  }
}

export interface StepResult {
  stage: number;
  agent: string;
  status: StageStatus;
  skipReason?: string;
  artifacts?: string[];
  durationMs: number;
}

/**
 * Dispatcher abstrato — caller implementa como executar um step.
 * Recebe o step + bundle atual; deve devolver StepResult.
 */
export type StepDispatcher = (
  step: { agent: string; purpose: string },
  bundle: OrchestrationBundle,
) => Promise<StepResult>;

/**
 * Loop principal do runner. Itera sobre a rota, dispara cada step via o
 * dispatcher, atualiza bundle, faz checkpoint, decide se para.
 */
export async function runPlan(
  plan: ExecutionPlan,
  opts: RunnerOptions,
  dispatch: StepDispatcher,
): Promise<OrchestrationBundle> {
  let bundle = plan.bundle;
  bundle = { ...bundle, status: 'running' };
  await checkpoint(opts, bundle);

  for (let i = 0; i < plan.effectiveSteps.length; i++) {
    const step = plan.effectiveSteps[i];
    if (!step) break;
    const stop = shouldStop(bundle);
    if (stop.stop) {
      bundle = { ...bundle, status: bundle.status === 'running' ? 'completed' : bundle.status };
      break;
    }

    if (step.willSkip) {
      bundle = advanceStage(bundle, {
        agentName: step.agent,
        decisionKind: 'skip',
        reason: step.skipReason ?? 'skipped',
      });
      bundle = { ...bundle, status: 'skipped_gracefully' };
      await checkpoint(opts, bundle);
      continue;
    }

    bundle = advanceStage(bundle, {
      agentName: step.agent,
      decisionKind: 'pick_next',
      reason: step.purpose,
    });
    await checkpoint(opts, bundle);

    try {
      const result = await dispatch(step, bundle);
      bundle = {
        ...bundle,
        status: result.status,
        artifacts: result.artifacts
          ? [
              ...bundle.artifacts,
              ...result.artifacts.map((uri) => ({
                uri,
                kind: 'unknown',
                producedBy: step.agent,
                producedAtStage: result.stage,
              })),
            ]
          : bundle.artifacts,
      };
      await checkpoint(opts, bundle);
      if (result.status === 'failed_terminal' || result.status === 'blocked_external') break;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      bundle = blockBundle(
        bundle,
        { kind: 'external_error', message: `${step.agent} failed: ${msg}` },
        'failed_recoverable',
      );
      await checkpoint(opts, bundle);
    }
  }

  if (bundle.status === 'running') bundle = { ...bundle, status: 'completed' };
  await checkpoint(opts, bundle);
  return bundle;
}

/**
 * Default dispatcher — apenas marca o step como completed.
 * Usado em modo planning/dry-run quando o caller não quer executar de verdade.
 */
export const noopDispatcher: StepDispatcher = async (step, bundle) => ({
  stage: bundle.stage,
  agent: step.agent,
  status: 'completed',
  durationMs: 0,
});
