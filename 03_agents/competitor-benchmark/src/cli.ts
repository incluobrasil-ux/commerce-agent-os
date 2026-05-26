#!/usr/bin/env node
// CLI: pnpm competitor:benchmark --competitor=acme --source-type=html --source-value="..." --goal="..."

import { resolve } from 'node:path';
import { captureRun } from '@cao/brain-bridge';
import { makeAnthropicComplete } from '@cao/llm';
import { Memory } from '@cao/memory';
import { ConsoleProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import {
  competitorBenchmarkAgent,
  renderSnapshot,
  snapshotPath,
  snapshotTimestamp,
} from './index.js';

interface CliArgs {
  tenantId: string;
  competitor: string;
  sourceType: 'url' | 'html' | 'text';
  sourceValue: string;
  benchmarkGoal: string;
  compareAgainst: string[];
  capture: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    tenantId: '_test',
    competitor: '',
    sourceType: 'text',
    sourceValue: '',
    benchmarkGoal: '',
    compareAgainst: [],
    capture: false,
  };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--tenant=')) args.tenantId = a.slice('--tenant='.length);
    else if (a.startsWith('--competitor='))
      args.competitor = a
        .slice('--competitor='.length)
        .replace(/[^a-z0-9-]/gi, '-')
        .toLowerCase();
    else if (a.startsWith('--source-type=')) {
      const v = a.slice('--source-type='.length);
      if (v !== 'url' && v !== 'html' && v !== 'text') fail(`--source-type inválido: ${v}`);
      args.sourceType = v;
    } else if (a.startsWith('--source-value='))
      args.sourceValue = a.slice('--source-value='.length);
    else if (a.startsWith('--goal=')) args.benchmarkGoal = a.slice('--goal='.length);
    else if (a.startsWith('--compare-against='))
      args.compareAgainst.push(a.slice('--compare-against='.length));
    else if (a === '--capture') args.capture = true;
    else if (a.startsWith('--')) fail(`Flag desconhecida: ${a}`);
    else fail(`Argumento inesperado: ${a}`);
  }
  if (!args.competitor) fail('--competitor é obrigatório (kebab-case)');
  if (!args.sourceValue) fail('--source-value é obrigatório');
  if (!args.benchmarkGoal) fail('--goal é obrigatório');
  return args;
}

function fail(msg: string): never {
  process.stderr.write(`[competitor:benchmark] ${msg}\n`);
  process.exit(2);
}

function skipped(msg: string): never {
  process.stdout.write(`[competitor:benchmark] SKIPPED — ${msg}\n`);
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
    competitorBenchmarkAgent,
    {
      tenantId: args.tenantId,
      competitor: args.competitor,
      sourceType: args.sourceType,
      sourceValue: args.sourceValue,
      benchmarkGoal: args.benchmarkGoal,
      compareAgainst: args.compareAgainst,
    },
    { tenantId: args.tenantId },
    { complete, memory, observability },
  );

  // Snapshot imutável em <tenant>/competitor-benchmark/<competitor>/<ts>.md
  const ts = snapshotTimestamp();
  const relPath = snapshotPath(args.competitor, ts);
  const generatedAt = new Date().toISOString();
  const md = renderSnapshot(
    {
      tenantId: args.tenantId,
      competitor: args.competitor,
      sourceType: args.sourceType,
      sourceValue: args.sourceValue,
      benchmarkGoal: args.benchmarkGoal,
      compareAgainst: args.compareAgainst,
    },
    result.output,
    {
      runId: result.runId,
      model: result.model,
      costUsd: result.costUsd,
      generatedAt,
    },
  );

  await memory.write(relPath, md);
  const absSnapshotPath = resolve(repoRoot, '07_memory/vault/tenants', args.tenantId, relPath);

  const out = result.output;
  process.stdout.write(`[competitor:benchmark] competitor=${args.competitor}\n`);
  process.stdout.write(`[competitor:benchmark] snapshot: ${absSnapshotPath}\n`);
  process.stdout.write(
    `[competitor:benchmark] pricing=${out.pricingSignals.length} messaging=${out.messagingPatterns.length} strengths=${out.strengths.length} weaknesses=${out.weaknesses.length}\n`,
  );
  process.stdout.write(
    `[competitor:benchmark] cost=$${result.costUsd.toFixed(6)} model=${result.model} ${result.durationMs}ms\n`,
  );

  if (args.capture) {
    const overall: 'green' | 'yellow' | 'red' =
      out.weaknesses.length === 0 && out.strengths.length === 0 ? 'yellow' : 'green';
    const cap = await captureRun({
      kind: 'agent-run',
      slug: `competitor-${args.competitor}-${ts}`.slice(0, 60),
      result: overall,
      title: `Competitor snapshot: ${args.competitor}`,
      source: 'agent:competitor-benchmark',
      tags: ['competitor-benchmark', 'tier-1', overall],
      body: {
        context: `pnpm competitor:benchmark --competitor=${args.competitor} --source-type=${args.sourceType} --goal="${args.benchmarkGoal}"`,
        whatHappened: [
          `Tenant: ${args.tenantId}.`,
          `Competidor: ${args.competitor}.`,
          `Snapshot imutável salvo em vault/${args.tenantId}/${relPath}.`,
          `Custo: $${result.costUsd.toFixed(6)} (${result.model}).`,
        ],
        findings: [
          ...out.strengths.map((s) => `[strength] ${s}`),
          ...out.weaknesses.map((w) => `[weakness] ${w}`),
          ...out.watchouts.map((w) => `[watchout] ${w}`),
        ],
        impact: out.positioningSummary,
        references: [`07_memory/vault/tenants/${args.tenantId}/${relPath}`],
      },
      sessionLogLine: `competitor-benchmark capturou ${args.competitor}: ${out.strengths.length} forças, ${out.weaknesses.length} fraquezas.`,
    });
    process.stdout.write(`[competitor:benchmark] capture → ${cap.summaryPath}\n`);
  }

  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[competitor:benchmark] erro: ${msg}\n`);
  if (msg.includes('401') || msg.includes('invalid x-api-key')) {
    process.stderr.write('[competitor:benchmark] → key inválida. Atualize .env.local.\n');
  }
  process.exit(1);
});
