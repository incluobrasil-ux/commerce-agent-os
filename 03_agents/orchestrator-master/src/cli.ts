#!/usr/bin/env node
// CLI: pnpm orchestrate:master --objective="..." --available=<a,b,c> [opts]
//
// Modo plan: produz rota JSON via Claude. Modo dispatch: idêntico ao plan
// (execução stateful real fica para iteração futura — sinalizado em
// nextActions/risks pelo próprio agente).

import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import { captureRun } from '@cao/brain-bridge';
import { makeAnthropicComplete } from '@cao/llm';
import { Memory } from '@cao/memory';
import { ConsoleProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { KNOWN_AGENTS, orchestratorMasterAgent } from './index.js';

interface CliArgs {
  tenantId: string;
  objective: string;
  contextBriefPath: string;
  availableAgents: string[];
  constraints: string[];
  maxSteps: number;
  mode: 'plan' | 'dispatch';
  capture: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    tenantId: '_test',
    objective: '',
    contextBriefPath: '',
    availableAgents: [],
    constraints: [],
    maxSteps: 5,
    mode: 'plan',
    capture: false,
  };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--tenant=')) args.tenantId = a.slice('--tenant='.length);
    else if (a.startsWith('--objective=')) args.objective = a.slice('--objective='.length);
    else if (a.startsWith('--context-brief='))
      args.contextBriefPath = a.slice('--context-brief='.length);
    else if (a.startsWith('--available='))
      args.availableAgents = a
        .slice('--available='.length)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    else if (a.startsWith('--constraint='))
      args.constraints.push(a.slice('--constraint='.length).trim());
    else if (a.startsWith('--max-steps='))
      args.maxSteps = Math.min(
        Math.max(Number.parseInt(a.slice('--max-steps='.length), 10), 1),
        20,
      );
    else if (a.startsWith('--mode=')) {
      const m = a.slice('--mode='.length);
      if (m !== 'plan' && m !== 'dispatch') fail(`--mode inválido: ${m}`);
      args.mode = m;
    } else if (a === '--capture') args.capture = true;
    else if (a.startsWith('--')) fail(`Flag desconhecida: ${a}`);
    else fail(`Argumento inesperado: ${a}`);
  }
  if (!args.objective) fail('--objective é obrigatório');
  if (args.availableAgents.length === 0) {
    args.availableAgents = [...KNOWN_AGENTS];
  }
  return args;
}

function fail(msg: string): never {
  process.stderr.write(`[orchestrate:master] ${msg}\n`);
  process.exit(2);
}

function skipped(msg: string): never {
  process.stdout.write(`[orchestrate:master] SKIPPED — ${msg}\n`);
  process.exit(0);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);

  // SKIPPED graceful sem key
  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    skipped('ANTHROPIC_API_KEY ausente em .env.local. Adicione a key para usar o orquestrador.');
  }

  // Lê context brief se path fornecido
  let contextBrief = '';
  if (args.contextBriefPath) {
    try {
      contextBrief = await fs.readFile(resolve(args.contextBriefPath), 'utf8');
    } catch (err) {
      fail(
        `não consegui ler ${args.contextBriefPath}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  // Aviso se mode=dispatch (não suportado neste MVP)
  if (args.mode === 'dispatch') {
    process.stdout.write(
      '[orchestrate:master] aviso: mode=dispatch ainda não executa agentes; ' +
        'output é idêntico a mode=plan. Operador deve invocar cada step manualmente.\n',
    );
  }

  const repoRoot = resolve(process.cwd());
  const memory = new Memory({
    vaultRoot: resolve(repoRoot, '07_memory/vault'),
    tenantId: args.tenantId,
  });
  await memory.ensureBaseDir();

  const observability = new ConsoleProvider();
  const complete = makeAnthropicComplete();

  const result = await runAgent(
    orchestratorMasterAgent,
    {
      tenantId: args.tenantId,
      objective: args.objective,
      contextBrief,
      availableAgents: args.availableAgents,
      constraints: args.constraints,
      maxSteps: args.maxSteps,
      mode: args.mode,
    },
    { tenantId: args.tenantId },
    { complete, memory, observability },
  );

  const out = result.output;
  process.stdout.write(`[orchestrate:master] route (${out.route.length} step(s)):\n`);
  out.route.forEach((s, i) => {
    process.stdout.write(`  ${i + 1}. ${s.agent} → ${s.purpose}\n`);
    process.stdout.write(`     why: ${s.reason}\n`);
  });
  process.stdout.write(`[orchestrate:master] summary: ${out.aggregatedSummary}\n`);
  process.stdout.write(
    `[orchestrate:master] cost=$${result.costUsd.toFixed(6)} model=${result.model} ${result.durationMs}ms\n`,
  );
  if (out.risks.length > 0) {
    process.stdout.write(`[orchestrate:master] risks: ${out.risks.join('; ')}\n`);
  }

  if (args.capture) {
    const slugObjective = args.objective
      .replace(/[^a-z0-9-]/gi, '-')
      .toLowerCase()
      .slice(0, 30);
    const slugTenant = args.tenantId.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const overall: 'green' | 'yellow' | 'red' = out.risks.length > 2 ? 'yellow' : 'green';
    const cap = await captureRun({
      kind: 'agent-run',
      slug: `orchestrate-master-${slugTenant}-${slugObjective}`.slice(0, 60),
      result: overall,
      title: `Orchestrator route: ${args.objective.slice(0, 80)}`,
      source: 'agent:orchestrator-master',
      tags: ['orchestrator', 'route', 'tier-0', overall],
      body: {
        context: `pnpm orchestrate:master --objective="${args.objective}" mode=${args.mode} maxSteps=${args.maxSteps}.`,
        whatHappened: [
          `Tenant: ${args.tenantId}.`,
          `Available agents: ${args.availableAgents.join(', ')}.`,
          `Route: ${out.route.length} step(s). ${out.route.map((s) => s.agent).join(' → ')}.`,
          `Cost: $${result.costUsd.toFixed(6)} (${result.model}).`,
        ],
        findings: out.route.map((s) => `${s.agent}: ${s.purpose} (${s.reason})`),
        impact: out.aggregatedSummary,
        references: out.artifacts,
      },
      sessionLogLine: `orchestrator-master rotou ${out.route.length} step(s) para "${args.objective.slice(0, 60)}".`,
    });
    process.stdout.write(`[orchestrate:master] capture → ${cap.summaryPath}\n`);
    process.stdout.write(
      `[orchestrate:master] capture: ${cap.filesUpdated.length} arquivo(s) do cérebro atualizado(s)\n`,
    );
  }

  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[orchestrate:master] erro: ${msg}\n`);
  if (msg.includes('401') || msg.includes('invalid x-api-key')) {
    process.stderr.write('[orchestrate:master] → key inválida. Atualize .env.local.\n');
  }
  process.exit(1);
});
