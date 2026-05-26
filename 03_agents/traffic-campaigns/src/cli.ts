#!/usr/bin/env node
// CLI: pnpm traffic:plan --campaign="..." --total-budget=10000 --cpa-target=35 [...]

import { resolve } from 'node:path';
import { captureRun } from '@cao/brain-bridge';
import { makeAnthropicComplete } from '@cao/llm';
import { Memory } from '@cao/memory';
import { ConsoleProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import {
  renderTraffic,
  totalChannelBudget,
  trafficCampaignsAgent,
  trafficPath,
  trafficTimestamp,
} from './index.js';

interface CliArgs {
  tenantId: string;
  campaignName: string;
  totalBudgetUsd: number;
  dailyBudgetCapUsd: number;
  cpaTargetUsd: number;
  conversionTarget: string;
  channels: string[];
  audiencesContext: string;
  productContext: string;
  priorPerformanceContext: string;
  constraints: string[];
  capture: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    tenantId: '_test',
    campaignName: '',
    totalBudgetUsd: 0,
    dailyBudgetCapUsd: 0,
    cpaTargetUsd: 0,
    conversionTarget: 'first purchase',
    channels: [],
    audiencesContext: '',
    productContext: '',
    priorPerformanceContext: '',
    constraints: [],
    capture: false,
  };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--tenant=')) args.tenantId = a.slice('--tenant='.length);
    else if (a.startsWith('--campaign=')) args.campaignName = a.slice('--campaign='.length);
    else if (a.startsWith('--total-budget='))
      args.totalBudgetUsd = Number(a.slice('--total-budget='.length));
    else if (a.startsWith('--daily-cap='))
      args.dailyBudgetCapUsd = Number(a.slice('--daily-cap='.length));
    else if (a.startsWith('--cpa-target='))
      args.cpaTargetUsd = Number(a.slice('--cpa-target='.length));
    else if (a.startsWith('--conversion-target='))
      args.conversionTarget = a.slice('--conversion-target='.length);
    else if (a.startsWith('--channel=')) args.channels.push(a.slice('--channel='.length));
    else if (a.startsWith('--audience-context='))
      args.audiencesContext = a.slice('--audience-context='.length);
    else if (a.startsWith('--product=')) args.productContext = a.slice('--product='.length);
    else if (a.startsWith('--prior-perf='))
      args.priorPerformanceContext = a.slice('--prior-perf='.length);
    else if (a.startsWith('--constraint=')) args.constraints.push(a.slice('--constraint='.length));
    else if (a === '--capture') args.capture = true;
    else if (a.startsWith('--')) fail(`Flag desconhecida: ${a}`);
    else fail(`Argumento inesperado: ${a}`);
  }
  if (!args.campaignName) fail('--campaign é obrigatório');
  if (!args.productContext) fail('--product é obrigatório');
  if (args.channels.length === 0) fail('pelo menos um --channel é obrigatório');
  if (!Number.isFinite(args.totalBudgetUsd) || args.totalBudgetUsd <= 0)
    fail('--total-budget deve ser número > 0');
  if (!Number.isFinite(args.dailyBudgetCapUsd) || args.dailyBudgetCapUsd <= 0)
    fail('--daily-cap deve ser número > 0');
  if (!Number.isFinite(args.cpaTargetUsd) || args.cpaTargetUsd <= 0)
    fail('--cpa-target deve ser número > 0');
  return args;
}

function fail(msg: string): never {
  process.stderr.write(`[traffic:plan] ${msg}\n`);
  process.exit(2);
}

function skipped(msg: string): never {
  process.stdout.write(`[traffic:plan] SKIPPED — ${msg}\n`);
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
    campaignName: args.campaignName,
    totalBudgetUsd: args.totalBudgetUsd,
    dailyBudgetCapUsd: args.dailyBudgetCapUsd,
    cpaTargetUsd: args.cpaTargetUsd,
    conversionTarget: args.conversionTarget,
    channels: args.channels,
    audiencesContext: args.audiencesContext,
    productContext: args.productContext,
    priorPerformanceContext: args.priorPerformanceContext,
    constraints: args.constraints,
    mode: 'dry_run' as const,
  };

  const result = await runAgent(
    trafficCampaignsAgent,
    input,
    { tenantId: args.tenantId },
    { complete, memory, observability },
  );

  const ts = trafficTimestamp();
  const relPath = trafficPath(args.campaignName, ts);
  const generatedAt = new Date().toISOString();
  const md = renderTraffic(input, result.output, {
    runId: result.runId,
    model: result.model,
    costUsd: result.costUsd,
    generatedAt,
  });
  await memory.write(relPath, md);
  const absPath = resolve(repoRoot, '07_memory/vault/tenants', args.tenantId, relPath);

  const out = result.output;
  const allocated = totalChannelBudget(out.channelMix);
  const overBudget = allocated > args.totalBudgetUsd;
  process.stdout.write(`[traffic:plan] campaign="${args.campaignName}" (DRY-RUN)\n`);
  process.stdout.write(
    `[traffic:plan] channels=${out.channelMix.length} audiences=${out.audiences.length} hypotheses=${out.creativeHypotheses.length} risks=${out.riskFlags.length}\n`,
  );
  process.stdout.write(
    `[traffic:plan] allocated=USD ${allocated} / total=USD ${args.totalBudgetUsd}${
      overBudget ? ' ⚠ OVER' : ''
    }\n`,
  );
  process.stdout.write(`[traffic:plan] saved: ${absPath}\n`);
  process.stdout.write(
    `[traffic:plan] cost=$${result.costUsd.toFixed(6)} model=${result.model} ${result.durationMs}ms\n`,
  );

  if (args.capture) {
    const slugTenant = args.tenantId.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const slugCampaign = args.campaignName
      .replace(/[^a-z0-9-]/gi, '-')
      .toLowerCase()
      .slice(0, 30);
    const overall: 'green' | 'yellow' | 'red' =
      overBudget || out.riskFlags.length > 2 ? 'yellow' : 'green';
    const cap = await captureRun({
      kind: 'agent-run',
      slug: `traffic-${slugTenant}-${slugCampaign}`.slice(0, 60),
      result: overall,
      title: `Traffic plan: ${args.campaignName}`,
      source: 'agent:traffic-campaigns',
      tags: ['traffic-campaigns', 'tier-2', 'media-plan', 'dry-run', overall],
      body: {
        context: `pnpm traffic:plan (dry-run) gera plano de mídia para ${args.campaignName} (${args.tenantId}).`,
        whatHappened: [
          `Tenant: ${args.tenantId}.`,
          `Campaign: ${args.campaignName}.`,
          `Channel mix: ${out.channelMix.map((c) => c.channel).join(', ')}.`,
          `Alocado: USD ${allocated} de ${args.totalBudgetUsd}.`,
          `Arquivo salvo em vault/${args.tenantId}/${relPath}.`,
          `Custo: $${result.costUsd.toFixed(6)} (${result.model}).`,
        ],
        findings: [
          ...out.channelMix.map((c) => `[mix] ${c.channel} (${c.role}) ${c.allocationPct}%`),
          ...(overBudget
            ? [`[over-budget] alocado USD ${allocated} > USD ${args.totalBudgetUsd}`]
            : []),
          ...out.riskFlags.map((r) => `[risk] ${r}`),
        ],
        impact: `${out.channelMix.length} canais · ${out.audiences.length} audiências · ${out.creativeHypotheses.length} hipóteses criativas.`,
        references: [`07_memory/vault/tenants/${args.tenantId}/${relPath}`],
      },
      sessionLogLine: `traffic-campaigns: ${args.campaignName} (dry-run) → ${out.channelMix.length} canais, ${out.riskFlags.length} risk flags.`,
    });
    process.stdout.write(`[traffic:plan] capture → ${cap.summaryPath}\n`);
  }

  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[traffic:plan] erro: ${msg}\n`);
  if (msg.includes('401') || msg.includes('invalid x-api-key')) {
    process.stderr.write('[traffic:plan] → key inválida. Atualize .env.local.\n');
  }
  process.exit(1);
});
