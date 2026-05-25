#!/usr/bin/env node
// CLI: pnpm market:intelligence --question="..." --source-text="..." [...]
//
// Sintetiza inteligência de mercado a partir de textos colados. Sem fetcher real.
// SKIPPED graceful sem ANTHROPIC_API_KEY.

import { resolve } from 'node:path';
import { captureRun } from '@cao/brain-bridge';
import { makeAnthropicComplete } from '@cao/llm';
import { Memory } from '@cao/memory';
import { ConsoleProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { marketIntelligenceAgent } from './index.js';

interface CliArgs {
  tenantId: string;
  marketQuestion: string;
  sourceTexts: string[];
  sourceLabels: string[];
  category: string;
  region: string;
  timeframe: string;
  constraints: string[];
  capture: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    tenantId: '_test',
    marketQuestion: '',
    sourceTexts: [],
    sourceLabels: [],
    category: '',
    region: '',
    timeframe: '',
    constraints: [],
    capture: false,
  };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--tenant=')) args.tenantId = a.slice('--tenant='.length);
    else if (a.startsWith('--question=')) args.marketQuestion = a.slice('--question='.length);
    else if (a.startsWith('--source-text='))
      args.sourceTexts.push(a.slice('--source-text='.length));
    else if (a.startsWith('--source-label='))
      args.sourceLabels.push(a.slice('--source-label='.length));
    else if (a.startsWith('--category=')) args.category = a.slice('--category='.length);
    else if (a.startsWith('--region=')) args.region = a.slice('--region='.length);
    else if (a.startsWith('--timeframe=')) args.timeframe = a.slice('--timeframe='.length);
    else if (a.startsWith('--constraint=')) args.constraints.push(a.slice('--constraint='.length));
    else if (a === '--capture') args.capture = true;
    else if (a.startsWith('--')) fail(`Flag desconhecida: ${a}`);
    else fail(`Argumento inesperado: ${a}`);
  }
  if (!args.marketQuestion) fail('--question é obrigatório');
  if (args.sourceTexts.length === 0) fail('pelo menos 1 --source-text="..." é obrigatório');
  return args;
}

function fail(msg: string): never {
  process.stderr.write(`[market:intelligence] ${msg}\n`);
  process.exit(2);
}

function skipped(msg: string): never {
  process.stdout.write(`[market:intelligence] SKIPPED — ${msg}\n`);
  process.exit(0);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);

  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    skipped('ANTHROPIC_API_KEY ausente em .env.local.');
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
    marketIntelligenceAgent,
    {
      tenantId: args.tenantId,
      marketQuestion: args.marketQuestion,
      sourceTexts: args.sourceTexts,
      sourceLabels: args.sourceLabels,
      category: args.category,
      region: args.region,
      timeframe: args.timeframe,
      constraints: args.constraints,
    },
    { tenantId: args.tenantId },
    { complete, memory, observability },
  );

  const out = result.output;
  process.stdout.write(`[market:intelligence] summary: ${out.summary.slice(0, 200)}...\n`);
  process.stdout.write(
    `[market:intelligence] signals=${out.signals.length} opportunities=${out.opportunities.length} threats=${out.threats.length}\n`,
  );
  process.stdout.write(
    `[market:intelligence] cost=$${result.costUsd.toFixed(6)} model=${result.model} ${result.durationMs}ms\n`,
  );

  if (args.capture) {
    const slugQuestion = args.marketQuestion
      .replace(/[^a-z0-9-]/gi, '-')
      .toLowerCase()
      .slice(0, 30);
    const slugTenant = args.tenantId.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const overall: 'green' | 'yellow' | 'red' = out.threats.length > 3 ? 'yellow' : 'green';
    const cap = await captureRun({
      kind: 'agent-run',
      slug: `market-intel-${slugTenant}-${slugQuestion}`.slice(0, 60),
      result: overall,
      title: `Market intel: ${args.marketQuestion.slice(0, 80)}`,
      source: 'agent:market-intelligence',
      tags: ['market-intelligence', 'tier-1', overall],
      body: {
        context: `pnpm market:intelligence --question="${args.marketQuestion}" sources=${args.sourceTexts.length}`,
        whatHappened: [
          `Tenant: ${args.tenantId}.`,
          `${args.sourceTexts.length} fonte(s) processada(s).`,
          `Sinais: ${out.signals.length}. Oportunidades: ${out.opportunities.length}. Ameaças: ${out.threats.length}.`,
          `Custo: $${result.costUsd.toFixed(6)} (${result.model}).`,
        ],
        findings: out.signals.map(
          (s) => `[${s.confidence}] ${s.signal} — ${s.evidence.slice(0, 100)}`,
        ),
        impact: out.summary,
        references:
          args.sourceLabels.length > 0
            ? args.sourceLabels
            : [`${args.sourceTexts.length} fontes inline`],
      },
      sessionLogLine: `market-intelligence: ${out.signals.length} sinal(is) / ${out.opportunities.length} oportunidade(s) sobre "${args.marketQuestion.slice(0, 50)}".`,
    });
    process.stdout.write(`[market:intelligence] capture → ${cap.summaryPath}\n`);
  }

  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[market:intelligence] erro: ${msg}\n`);
  if (msg.includes('401') || msg.includes('invalid x-api-key')) {
    process.stderr.write('[market:intelligence] → key inválida. Atualize .env.local.\n');
  }
  process.exit(1);
});
