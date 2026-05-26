#!/usr/bin/env node
// CLI: pnpm visual:asset --product-name="..." --description="..." --channel=pdp
//   --brand-style="..." --audience="..." [--mood=... --constraint=... --capture]

import { resolve } from 'node:path';
import { captureRun } from '@cao/brain-bridge';
import { makeAnthropicComplete } from '@cao/llm';
import { Memory } from '@cao/memory';
import { ConsoleProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { renderVisualBrief, visualAssetOpsAgent, visualPath, visualTimestamp } from './index.js';

type Channel = 'pdp' | 'instagram' | 'tiktok' | 'meta-ads' | 'google-ads' | 'email' | 'other';
const VALID_CHANNELS: Channel[] = [
  'pdp',
  'instagram',
  'tiktok',
  'meta-ads',
  'google-ads',
  'email',
  'other',
];

interface CliArgs {
  tenantId: string;
  productName: string;
  productDescription: string;
  brandStyle: string;
  audience: string;
  channel: Channel;
  locale: string;
  mood: string;
  constraints: string[];
  existingAssetsNotes: string;
  capture: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    tenantId: '_test',
    productName: '',
    productDescription: '',
    brandStyle: '',
    audience: '',
    channel: 'pdp',
    locale: '',
    mood: '',
    constraints: [],
    existingAssetsNotes: '',
    capture: false,
  };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--tenant=')) args.tenantId = a.slice('--tenant='.length);
    else if (a.startsWith('--product-name=')) args.productName = a.slice('--product-name='.length);
    else if (a.startsWith('--description='))
      args.productDescription = a.slice('--description='.length);
    else if (a.startsWith('--brand-style=')) args.brandStyle = a.slice('--brand-style='.length);
    else if (a.startsWith('--audience=')) args.audience = a.slice('--audience='.length);
    else if (a.startsWith('--channel=')) {
      const v = a.slice('--channel='.length) as Channel;
      if (!VALID_CHANNELS.includes(v)) fail(`--channel inválido: ${v}`);
      args.channel = v;
    } else if (a.startsWith('--locale=')) args.locale = a.slice('--locale='.length);
    else if (a.startsWith('--mood=')) args.mood = a.slice('--mood='.length);
    else if (a.startsWith('--constraint=')) args.constraints.push(a.slice('--constraint='.length));
    else if (a.startsWith('--existing-assets='))
      args.existingAssetsNotes = a.slice('--existing-assets='.length);
    else if (a === '--capture') args.capture = true;
    else if (a.startsWith('--')) fail(`Flag desconhecida: ${a}`);
    else fail(`Argumento inesperado: ${a}`);
  }
  if (!args.productName) fail('--product-name é obrigatório');
  if (!args.productDescription) fail('--description é obrigatório');
  if (!args.brandStyle) fail('--brand-style é obrigatório');
  if (!args.audience) fail('--audience é obrigatório');
  return args;
}

function fail(msg: string): never {
  process.stderr.write(`[visual:asset] ${msg}\n`);
  process.exit(2);
}

function skipped(msg: string): never {
  process.stdout.write(`[visual:asset] SKIPPED — ${msg}\n`);
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
    brandStyle: args.brandStyle,
    audience: args.audience,
    channel: args.channel,
    locale: args.locale,
    mood: args.mood,
    constraints: args.constraints,
    existingAssetsNotes: args.existingAssetsNotes,
  };

  const result = await runAgent(
    visualAssetOpsAgent,
    input,
    { tenantId: args.tenantId },
    { complete, memory, observability },
  );

  const ts = visualTimestamp();
  const relPath = visualPath(args.productName, args.channel, ts);
  const generatedAt = new Date().toISOString();
  const md = renderVisualBrief(input, result.output, {
    runId: result.runId,
    model: result.model,
    costUsd: result.costUsd,
    generatedAt,
  });
  await memory.write(relPath, md);
  const absPath = resolve(repoRoot, '07_memory/vault/tenants', args.tenantId, relPath);

  const out = result.output;
  process.stdout.write(
    `[visual:asset] shots=${out.shotList.length} risks=${out.riskFlags.length}\n`,
  );
  process.stdout.write(`[visual:asset] brief: ${absPath}\n`);
  process.stdout.write(
    `[visual:asset] cost=$${result.costUsd.toFixed(6)} model=${result.model} ${result.durationMs}ms\n`,
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
      slug: `visual-asset-${slugTenant}-${slugProduct}`.slice(0, 60),
      result: overall,
      title: `Visual brief: ${args.productName} (${args.channel})`,
      source: 'agent:visual-asset-ops',
      tags: ['visual-asset-ops', 'tier-3', 'visual', args.channel, overall],
      body: {
        context: `pnpm visual:asset gera shot list para ${args.productName} no canal ${args.channel}.`,
        whatHappened: [
          `Tenant: ${args.tenantId}.`,
          `Channel: ${args.channel}. Audience: ${args.audience}.`,
          `Shots: ${out.shotList.length}.`,
          `Brief salvo em vault/${args.tenantId}/${relPath}.`,
          `Custo: $${result.costUsd.toFixed(6)} (${result.model}).`,
        ],
        findings: [
          ...out.shotList.map((s) => `[shot:${s.shotId}] ${s.intent}`),
          ...out.riskFlags.map((r) => `[risk] ${r}`),
        ],
        impact: `${out.shotList.length} shots · ${out.styleGuide.length} style notes · ${out.doNotInclude.length} do-not-include.`,
        references: [`07_memory/vault/tenants/${args.tenantId}/${relPath}`],
      },
      sessionLogLine: `visual-asset-ops: ${args.productName}/${args.channel} → ${out.shotList.length} shots.`,
    });
    process.stdout.write(`[visual:asset] capture → ${cap.summaryPath}\n`);
  }

  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[visual:asset] erro: ${msg}\n`);
  if (msg.includes('401') || msg.includes('invalid x-api-key')) {
    process.stderr.write('[visual:asset] → key inválida. Atualize .env.local.\n');
  }
  process.exit(1);
});
