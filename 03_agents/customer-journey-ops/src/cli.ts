#!/usr/bin/env node
// CLI: pnpm journey:map --brand=acme --product-line="..." --audience="..."
//   --goal="..." [--touchpoint=... --pain=... --voc-context=... --capture]

import { resolve } from 'node:path';
import { captureRun } from '@cao/brain-bridge';
import { makeAnthropicComplete } from '@cao/llm';
import { Memory } from '@cao/memory';
import { ConsoleProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { customerJourneyOpsAgent, journeyPath, journeyTimestamp, renderJourney } from './index.js';

interface CliArgs {
  tenantId: string;
  brandName: string;
  productLineSummary: string;
  audience: string;
  region: string;
  currentTouchpoints: string[];
  knownPainPoints: string[];
  goals: string[];
  vocContext: string;
  capture: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    tenantId: '_test',
    brandName: '',
    productLineSummary: '',
    audience: '',
    region: '',
    currentTouchpoints: [],
    knownPainPoints: [],
    goals: [],
    vocContext: '',
    capture: false,
  };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--tenant=')) args.tenantId = a.slice('--tenant='.length);
    else if (a.startsWith('--brand=')) args.brandName = a.slice('--brand='.length);
    else if (a.startsWith('--product-line='))
      args.productLineSummary = a.slice('--product-line='.length);
    else if (a.startsWith('--audience=')) args.audience = a.slice('--audience='.length);
    else if (a.startsWith('--region=')) args.region = a.slice('--region='.length);
    else if (a.startsWith('--touchpoint='))
      args.currentTouchpoints.push(a.slice('--touchpoint='.length));
    else if (a.startsWith('--pain=')) args.knownPainPoints.push(a.slice('--pain='.length));
    else if (a.startsWith('--goal=')) args.goals.push(a.slice('--goal='.length));
    else if (a.startsWith('--voc-context=')) args.vocContext = a.slice('--voc-context='.length);
    else if (a === '--capture') args.capture = true;
    else if (a.startsWith('--')) fail(`Flag desconhecida: ${a}`);
    else fail(`Argumento inesperado: ${a}`);
  }
  if (!args.brandName) fail('--brand é obrigatório');
  if (!args.productLineSummary) fail('--product-line é obrigatório');
  if (!args.audience) fail('--audience é obrigatório');
  if (args.goals.length === 0) fail('pelo menos um --goal é obrigatório');
  return args;
}

function fail(msg: string): never {
  process.stderr.write(`[journey:map] ${msg}\n`);
  process.exit(2);
}

function skipped(msg: string): never {
  process.stdout.write(`[journey:map] SKIPPED — ${msg}\n`);
  process.exit(0);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);

  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    skipped('ANTHROPIC_API_KEY ausente em .env.local. Brief lido; execução pendente.');
  }

  const repoRoot = resolve(process.cwd());
  const memory = new Memory({
    vaultRoot: resolve(repoRoot, '07_memory/vault'),
    tenantId: args.tenantId,
  });
  await memory.ensureBaseDir();

  const observability = new ConsoleProvider();
  const complete = makeAnthropicComplete();

  const input = {
    tenantId: args.tenantId,
    brandName: args.brandName,
    productLineSummary: args.productLineSummary,
    audience: args.audience,
    region: args.region,
    currentTouchpoints: args.currentTouchpoints,
    knownPainPoints: args.knownPainPoints,
    goals: args.goals,
    vocContext: args.vocContext,
  };

  const result = await runAgent(
    customerJourneyOpsAgent,
    input,
    { tenantId: args.tenantId },
    { complete, memory, observability },
  );

  const ts = journeyTimestamp();
  const relPath = journeyPath(args.brandName, ts);
  const generatedAt = new Date().toISOString();
  const md = renderJourney(input, result.output, {
    runId: result.runId,
    model: result.model,
    costUsd: result.costUsd,
    generatedAt,
  });
  await memory.write(relPath, md);
  const absPath = resolve(repoRoot, '07_memory/vault', args.tenantId, relPath);

  const out = result.output;
  process.stdout.write(
    `[journey:map] stages=${out.journeyStages.length} moves=${out.priorityMoves.length} risks=${out.riskFlags.length}\n`,
  );
  process.stdout.write(`[journey:map] journey: ${absPath}\n`);
  process.stdout.write(
    `[journey:map] cost=$${result.costUsd.toFixed(6)} model=${result.model} ${result.durationMs}ms\n`,
  );

  if (args.capture) {
    const slugTenant = args.tenantId.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const slugBrand = args.brandName
      .replace(/[^a-z0-9-]/gi, '-')
      .toLowerCase()
      .slice(0, 30);
    const overall: 'green' | 'yellow' | 'red' = out.riskFlags.length > 0 ? 'yellow' : 'green';
    const cap = await captureRun({
      kind: 'agent-run',
      slug: `customer-journey-${slugTenant}-${slugBrand}`.slice(0, 60),
      result: overall,
      title: `Journey: ${args.brandName} (${out.journeyStages.length} stages)`,
      source: 'agent:customer-journey-ops',
      tags: ['customer-journey-ops', 'tier-3', 'cx', overall],
      body: {
        context: `pnpm journey:map mapeia jornada para ${args.brandName}.`,
        whatHappened: [
          `Tenant: ${args.tenantId}.`,
          `Stages mapeados: ${out.journeyStages.length}.`,
          `Priority moves: ${out.priorityMoves.length}.`,
          `Journey salvo em vault/${args.tenantId}/${relPath}.`,
          `Custo: $${result.costUsd.toFixed(6)} (${result.model}).`,
        ],
        findings: [
          ...out.priorityMoves.map(
            (m) => `[move:${m.stage}/${m.effort}-${m.expectedImpact}] ${m.move}`,
          ),
          ...out.riskFlags.map((r) => `[risk] ${r}`),
        ],
        impact: `${out.journeyStages.length} stages · ${out.priorityMoves.length} priority moves · ${out.measurementSuggestions.length} measurement suggestions.`,
        references: [`07_memory/vault/${args.tenantId}/${relPath}`],
      },
      sessionLogLine: `customer-journey-ops: ${args.brandName} → ${out.journeyStages.length} stages, ${out.priorityMoves.length} moves.`,
    });
    process.stdout.write(`[journey:map] capture → ${cap.summaryPath}\n`);
  }

  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[journey:map] erro: ${msg}\n`);
  if (msg.includes('401') || msg.includes('invalid x-api-key')) {
    process.stderr.write('[journey:map] → key inválida. Atualize .env.local.\n');
  }
  process.exit(1);
});
