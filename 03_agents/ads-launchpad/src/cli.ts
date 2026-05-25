#!/usr/bin/env node
// CLI: pnpm ads:plan --product-name="..." --description="..." --audience="..."
//   --goal="..." --budget=500 --channel=meta --channel=google [--capture]

import { resolve } from 'node:path';
import { captureRun } from '@cao/brain-bridge';
import { makeAnthropicComplete } from '@cao/llm';
import { Memory } from '@cao/memory';
import { ConsoleProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { adsLaunchpadAgent, adsPath, adsTimestamp, renderAdsPlan } from './index.js';

type Channel = 'meta' | 'google' | 'tiktok' | 'pinterest' | 'youtube' | 'other';
const VALID_CHANNELS: Channel[] = ['meta', 'google', 'tiktok', 'pinterest', 'youtube', 'other'];

interface CliArgs {
  tenantId: string;
  productName: string;
  productDescription: string;
  offerHighlights: string[];
  audience: string;
  conversionGoal: string;
  monthlyBudgetUsd: number;
  channels: Channel[];
  brandVoice: string;
  constraints: string[];
  vocContext: string;
  capture: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    tenantId: '_test',
    productName: '',
    productDescription: '',
    offerHighlights: [],
    audience: '',
    conversionGoal: 'first purchase',
    monthlyBudgetUsd: 0,
    channels: [],
    brandVoice: '',
    constraints: [],
    vocContext: '',
    capture: false,
  };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--tenant=')) args.tenantId = a.slice('--tenant='.length);
    else if (a.startsWith('--product-name=')) args.productName = a.slice('--product-name='.length);
    else if (a.startsWith('--description='))
      args.productDescription = a.slice('--description='.length);
    else if (a.startsWith('--highlight='))
      args.offerHighlights.push(a.slice('--highlight='.length));
    else if (a.startsWith('--audience=')) args.audience = a.slice('--audience='.length);
    else if (a.startsWith('--goal=')) args.conversionGoal = a.slice('--goal='.length);
    else if (a.startsWith('--budget=')) {
      const v = Number(a.slice('--budget='.length));
      if (!Number.isFinite(v) || v < 0) fail(`--budget inválido: ${a}`);
      args.monthlyBudgetUsd = v;
    } else if (a.startsWith('--channel=')) {
      const v = a.slice('--channel='.length) as Channel;
      if (!VALID_CHANNELS.includes(v)) fail(`--channel inválido: ${v}`);
      args.channels.push(v);
    } else if (a.startsWith('--voice=')) args.brandVoice = a.slice('--voice='.length);
    else if (a.startsWith('--constraint=')) args.constraints.push(a.slice('--constraint='.length));
    else if (a.startsWith('--voc-context=')) args.vocContext = a.slice('--voc-context='.length);
    else if (a === '--capture') args.capture = true;
    else if (a.startsWith('--')) fail(`Flag desconhecida: ${a}`);
    else fail(`Argumento inesperado: ${a}`);
  }
  if (!args.productName) fail('--product-name é obrigatório');
  if (!args.productDescription) fail('--description é obrigatório');
  if (!args.audience) fail('--audience é obrigatório');
  if (args.channels.length === 0) fail('pelo menos um --channel é obrigatório');
  return args;
}

function fail(msg: string): never {
  process.stderr.write(`[ads:plan] ${msg}\n`);
  process.exit(2);
}

function skipped(msg: string): never {
  process.stdout.write(`[ads:plan] SKIPPED — ${msg}\n`);
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
    productName: args.productName,
    productDescription: args.productDescription,
    offerHighlights: args.offerHighlights,
    audience: args.audience,
    conversionGoal: args.conversionGoal,
    monthlyBudgetUsd: args.monthlyBudgetUsd,
    channels: args.channels,
    brandVoice: args.brandVoice,
    constraints: args.constraints,
    vocContext: args.vocContext,
  };

  const result = await runAgent(
    adsLaunchpadAgent,
    input,
    { tenantId: args.tenantId },
    { complete, memory, observability },
  );

  const ts = adsTimestamp();
  const relPath = adsPath(args.productName, ts);
  const generatedAt = new Date().toISOString();
  const md = renderAdsPlan(input, result.output, {
    runId: result.runId,
    model: result.model,
    costUsd: result.costUsd,
    generatedAt,
  });
  await memory.write(relPath, md);
  const absPath = resolve(repoRoot, '07_memory/vault', args.tenantId, relPath);

  const out = result.output;
  process.stdout.write(
    `[ads:plan] angles=${out.angles.length} segments=${out.audienceSegments.length} copies=${out.copySets.length} creatives=${out.creativeBriefs.length}\n`,
  );
  process.stdout.write(`[ads:plan] plan: ${absPath}\n`);
  process.stdout.write(
    `[ads:plan] cost=$${result.costUsd.toFixed(6)} model=${result.model} ${result.durationMs}ms\n`,
  );

  if (args.capture) {
    const slugTenant = args.tenantId.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const slugProduct = args.productName
      .replace(/[^a-z0-9-]/gi, '-')
      .toLowerCase()
      .slice(0, 30);
    const overall: 'green' | 'yellow' | 'red' = out.riskFlags.length > 0 ? 'yellow' : 'green';
    const cap = await captureRun({
      kind: 'agent-run',
      slug: `ads-launchpad-${slugTenant}-${slugProduct}`.slice(0, 60),
      result: overall,
      title: `Ads plan: ${args.productName} (${args.channels.join('+')})`,
      source: 'agent:ads-launchpad',
      tags: ['ads-launchpad', 'tier-3', 'paid-media', ...args.channels, overall],
      body: {
        context: `pnpm ads:plan gera plano paga para ${args.productName} em ${args.channels.join(', ')}.`,
        whatHappened: [
          `Tenant: ${args.tenantId}.`,
          `Budget mensal: $${args.monthlyBudgetUsd.toFixed(2)}.`,
          `Angles: ${out.angles.length}. Segments: ${out.audienceSegments.length}.`,
          `Copy sets: ${out.copySets.length}. Creative briefs: ${out.creativeBriefs.length}.`,
          `Plan salvo em vault/${args.tenantId}/${relPath}.`,
          `Custo: $${result.costUsd.toFixed(6)} (${result.model}).`,
        ],
        findings: [
          ...out.angles.map((a) => `[angle] ${a.name}`),
          ...out.audienceSegments.map((s) => `[segment] ${s.name}`),
          ...out.riskFlags.map((r) => `[risk] ${r}`),
        ],
        impact: `${out.angles.length} angles · ${out.audienceSegments.length} segments · ${out.copySets.length} copies · ${out.kpiTargets.length} KPI targets.`,
        references: [`07_memory/vault/${args.tenantId}/${relPath}`],
      },
      sessionLogLine: `ads-launchpad: ${args.productName} → ${out.angles.length} angles, ${out.copySets.length} copy sets.`,
    });
    process.stdout.write(`[ads:plan] capture → ${cap.summaryPath}\n`);
  }

  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[ads:plan] erro: ${msg}\n`);
  if (msg.includes('401') || msg.includes('invalid x-api-key')) {
    process.stderr.write('[ads:plan] → key inválida. Atualize .env.local.\n');
  }
  process.exit(1);
});
