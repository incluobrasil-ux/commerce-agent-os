#!/usr/bin/env node
// CLI: pnpm finance:radar --lines-file=path/lines.json --currency=BRL
//   --target-margin=35 --fixed-costs=12000 [--label="..." --capture]
// lines.json: [{ name, unitCost, sellPrice, channelFees, shippingAvg,
//                monthlyUnitsEstimate }, ...]

import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import { captureRun } from '@cao/brain-bridge';
import { makeAnthropicComplete } from '@cao/llm';
import { Memory } from '@cao/memory';
import { ConsoleProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { financeMarginRadarAgent, radarPath, radarTimestamp, renderRadar } from './index.js';

interface CliArgs {
  tenantId: string;
  currency: string;
  linesJson: string;
  linesFile: string;
  targetMarginPct: number;
  fixedCostsMonth: number;
  observations: string;
  label: string;
  capture: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    tenantId: '_test',
    currency: 'USD',
    linesJson: '',
    linesFile: '',
    targetMarginPct: 30,
    fixedCostsMonth: 0,
    observations: '',
    label: '',
    capture: false,
  };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--tenant=')) args.tenantId = a.slice('--tenant='.length);
    else if (a.startsWith('--currency=')) args.currency = a.slice('--currency='.length);
    else if (a.startsWith('--lines=')) args.linesJson = a.slice('--lines='.length);
    else if (a.startsWith('--lines-file=')) args.linesFile = a.slice('--lines-file='.length);
    else if (a.startsWith('--target-margin=')) {
      const v = Number(a.slice('--target-margin='.length));
      if (!Number.isFinite(v) || v < 0 || v > 100) fail('--target-margin inválido (0–100)');
      args.targetMarginPct = v;
    } else if (a.startsWith('--fixed-costs=')) {
      const v = Number(a.slice('--fixed-costs='.length));
      if (!Number.isFinite(v) || v < 0) fail('--fixed-costs inválido');
      args.fixedCostsMonth = v;
    } else if (a.startsWith('--observations='))
      args.observations = a.slice('--observations='.length);
    else if (a.startsWith('--label=')) args.label = a.slice('--label='.length);
    else if (a === '--capture') args.capture = true;
    else if (a.startsWith('--')) fail(`Flag desconhecida: ${a}`);
    else fail(`Argumento inesperado: ${a}`);
  }
  if (!args.linesJson && !args.linesFile)
    fail('--lines=<json> OU --lines-file=<path> é obrigatório');
  return args;
}

function fail(msg: string): never {
  process.stderr.write(`[finance:radar] ${msg}\n`);
  process.exit(2);
}

function skipped(msg: string): never {
  process.stdout.write(`[finance:radar] SKIPPED — ${msg}\n`);
  process.exit(0);
}

interface RawLine {
  name?: string;
  unitCost?: number;
  sellPrice?: number;
  channelFees?: number;
  shippingAvg?: number;
  monthlyUnitsEstimate?: number;
}

interface NormalizedLine {
  name: string;
  unitCost: number;
  sellPrice: number;
  channelFees: number;
  shippingAvg: number;
  monthlyUnitsEstimate: number;
}

function normalizeLines(raw: unknown): NormalizedLine[] {
  if (!Array.isArray(raw)) fail('lines deve ser um array');
  return raw.map((r: RawLine, i): NormalizedLine => {
    if (typeof r !== 'object' || r === null) fail(`line #${i + 1}: não é objeto`);
    if (!r.name || typeof r.name !== 'string') fail(`line #${i + 1}: name ausente`);
    const num = (k: keyof RawLine): number => {
      const v = r[k];
      if (typeof v !== 'number' || !Number.isFinite(v) || v < 0)
        fail(`line #${i + 1}: ${String(k)} inválido (esperado number ≥ 0)`);
      return v;
    };
    return {
      name: r.name,
      unitCost: num('unitCost'),
      sellPrice: num('sellPrice'),
      channelFees: num('channelFees'),
      shippingAvg: num('shippingAvg'),
      monthlyUnitsEstimate: num('monthlyUnitsEstimate'),
    };
  });
}

async function loadLines(args: CliArgs): Promise<NormalizedLine[]> {
  const raw = args.linesFile
    ? JSON.parse(await fs.readFile(resolve(args.linesFile), 'utf8'))
    : JSON.parse(args.linesJson);
  return normalizeLines(raw);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  const productLines = await loadLines(args);

  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    skipped(
      `ANTHROPIC_API_KEY ausente em .env.local. ${productLines.length} linha(s) lida(s); execução pendente.`,
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

  const input = {
    tenantId: args.tenantId,
    currency: args.currency,
    productLines,
    targetMarginPct: args.targetMarginPct,
    fixedCostsMonth: args.fixedCostsMonth,
    observations: args.observations,
  };

  const result = await runAgent(
    financeMarginRadarAgent,
    input,
    { tenantId: args.tenantId },
    { complete, memory, observability },
  );

  const ts = radarTimestamp();
  const label = args.label || `radar-${args.tenantId}`;
  const relPath = radarPath(label, ts);
  const generatedAt = new Date().toISOString();
  const md = renderRadar(input, result.output, {
    runId: result.runId,
    model: result.model,
    costUsd: result.costUsd,
    generatedAt,
    label,
  });
  await memory.write(relPath, md);
  const absPath = resolve(repoRoot, '07_memory/vault', args.tenantId, relPath);

  const out = result.output;
  process.stdout.write(
    `[finance:radar] overallHealth=${out.overallHealth.toUpperCase()} lines=${out.marginAnalysis.length}\n`,
  );
  process.stdout.write(
    `[finance:radar] pricingMoves=${out.pricingMoves.length} risks=${out.risksAndWatchouts.length}\n`,
  );
  process.stdout.write(`[finance:radar] radar: ${absPath}\n`);
  process.stdout.write(
    `[finance:radar] cost=$${result.costUsd.toFixed(6)} model=${result.model} ${result.durationMs}ms\n`,
  );

  if (args.capture) {
    const slugTenant = args.tenantId.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const slugLabel = label
      .replace(/[^a-z0-9-]/gi, '-')
      .toLowerCase()
      .slice(0, 30);
    const healthToColor: Record<string, 'green' | 'yellow' | 'red'> = {
      strong: 'green',
      healthy: 'green',
      tight: 'yellow',
      critical: 'red',
    };
    const overall = healthToColor[out.overallHealth] ?? 'yellow';
    const cap = await captureRun({
      kind: 'agent-run',
      slug: `finance-radar-${slugTenant}-${slugLabel}`.slice(0, 60),
      result: overall,
      title: `Finance radar: ${label} (${out.overallHealth})`,
      source: 'agent:finance-margin-radar',
      tags: ['finance-margin-radar', 'tier-3', 'finance', overall, out.overallHealth],
      body: {
        context: `pnpm finance:radar revisa ${productLines.length} linha(s) de ${args.tenantId}.`,
        whatHappened: [
          `Tenant: ${args.tenantId}. Currency: ${args.currency}.`,
          `Overall health: ${out.overallHealth}.`,
          `Lines analisadas: ${out.marginAnalysis.length}.`,
          `Pricing moves: ${out.pricingMoves.length}.`,
          `Radar salvo em vault/${args.tenantId}/${relPath}.`,
          `Custo: $${result.costUsd.toFixed(6)} (${result.model}).`,
        ],
        findings: [
          ...out.marginAnalysis.map(
            (m) => `[line:${m.health}] ${m.productName} (${m.grossMarginPct.toFixed(1)}%)`,
          ),
          ...out.risksAndWatchouts.map((r) => `[risk] ${r}`),
        ],
        impact: `${out.marginAnalysis.length} margens analisadas · ${out.pricingMoves.length} pricing moves · ${out.recommendedExperiments.length} experimentos.`,
        references: [`07_memory/vault/${args.tenantId}/${relPath}`],
      },
      sessionLogLine: `finance-margin-radar: ${label} → ${out.overallHealth}, ${out.marginAnalysis.length} lines.`,
    });
    process.stdout.write(`[finance:radar] capture → ${cap.summaryPath}\n`);
  }

  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[finance:radar] erro: ${msg}\n`);
  if (msg.includes('401') || msg.includes('invalid x-api-key')) {
    process.stderr.write('[finance:radar] → key inválida. Atualize .env.local.\n');
  }
  process.exit(1);
});
