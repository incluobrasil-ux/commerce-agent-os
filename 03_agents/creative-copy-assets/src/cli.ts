#!/usr/bin/env node
// CLI: pnpm creative:assets --campaign="..." --theme="..." --audience="..." [...]

import { resolve } from 'node:path';
import { captureRun } from '@cao/brain-bridge';
import { assertTenantContext, assertTenantStoreContext } from '@cao/core';
import { makeAnthropicComplete } from '@cao/llm';
import { Memory } from '@cao/memory';
import { ConsoleProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { creativeCopyAgent, creativePath, creativeTimestamp, renderCreative } from './index.js';

interface CliArgs {
  tenantId: string;
  storeId: string;
  campaignName: string;
  theme: string;
  audience: string;
  brandVoice: string;
  offerSummary: string;
  channels: string[];
  formats: string[];
  locales: string[];
  constraints: string[];
  capture: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    tenantId: '_test',
    storeId: '',
    campaignName: '',
    theme: '',
    audience: '',
    brandVoice: '',
    offerSummary: '',
    channels: [],
    formats: [],
    locales: [],
    constraints: [],
    capture: false,
  };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--tenant=')) args.tenantId = a.slice('--tenant='.length);
    else if (a.startsWith('--store=')) args.storeId = a.slice('--store='.length);
    else if (a.startsWith('--campaign=')) args.campaignName = a.slice('--campaign='.length);
    else if (a.startsWith('--theme=')) args.theme = a.slice('--theme='.length);
    else if (a.startsWith('--audience=')) args.audience = a.slice('--audience='.length);
    else if (a.startsWith('--voice=')) args.brandVoice = a.slice('--voice='.length);
    else if (a.startsWith('--offer=')) args.offerSummary = a.slice('--offer='.length);
    else if (a.startsWith('--channel=')) args.channels.push(a.slice('--channel='.length));
    else if (a.startsWith('--format=')) args.formats.push(a.slice('--format='.length));
    else if (a.startsWith('--locale=')) args.locales.push(a.slice('--locale='.length));
    else if (a.startsWith('--constraint=')) args.constraints.push(a.slice('--constraint='.length));
    else if (a === '--capture') args.capture = true;
    else if (a.startsWith('--')) fail(`Flag desconhecida: ${a}`);
    else fail(`Argumento inesperado: ${a}`);
  }
  if (!args.campaignName) fail('--campaign é obrigatório');
  if (!args.theme) fail('--theme é obrigatório');
  if (!args.audience) fail('--audience é obrigatório');
  if (!args.brandVoice) fail('--voice é obrigatório');
  if (!args.offerSummary) fail('--offer é obrigatório');
  if (args.channels.length === 0) fail('pelo menos um --channel é obrigatório');
  if (args.formats.length === 0) fail('pelo menos um --format é obrigatório');
  if (args.locales.length === 0) fail('pelo menos um --locale é obrigatório');
  return args;
}

function fail(msg: string): never {
  process.stderr.write(`[creative:assets] ${msg}\n`);
  process.exit(2);
}

function skipped(msg: string): never {
  process.stdout.write(`[creative:assets] SKIPPED — ${msg}\n`);
  process.exit(0);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);

  if (args.storeId) {
    assertTenantStoreContext({ tenantId: args.tenantId, storeId: args.storeId }, 'creative:assets');
  } else {
    assertTenantContext({ tenantId: args.tenantId }, 'creative:assets');
  }

  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    skipped('ANTHROPIC_API_KEY ausente em .env.local. Brief lido; execução pendente.');
  }

  const repoRoot = resolve(process.cwd());
  const memory = new Memory({
    vaultRoot: resolve(repoRoot, '07_memory/vault'),
    tenantId: args.tenantId,
    ...(args.storeId ? { storeId: args.storeId } : {}),
  });
  await memory.ensureBaseDir();

  const observability = new ConsoleProvider();
  const complete = makeAnthropicComplete();

  const input = {
    tenantId: args.tenantId,
    campaignName: args.campaignName,
    theme: args.theme,
    audience: args.audience,
    brandVoice: args.brandVoice,
    offerSummary: args.offerSummary,
    channels: args.channels,
    formats: args.formats,
    locales: args.locales,
    constraints: args.constraints,
  };

  const result = await runAgent(
    creativeCopyAgent,
    input,
    { tenantId: args.tenantId, ...(args.storeId ? { storeId: args.storeId } : {}) },
    { complete, memory, observability },
  );

  const ts = creativeTimestamp();
  const relPath = creativePath(args.campaignName, ts);
  const generatedAt = new Date().toISOString();
  const md = renderCreative(input, result.output, {
    runId: result.runId,
    model: result.model,
    costUsd: result.costUsd,
    generatedAt,
  });
  await memory.write(relPath, md);
  const absPath = args.storeId
    ? resolve(repoRoot, '07_memory/vault/tenants', args.tenantId, 'stores', args.storeId, relPath)
    : resolve(repoRoot, '07_memory/vault/tenants', args.tenantId, relPath);

  const out = result.output;
  process.stdout.write(`[creative:assets] campaign="${args.campaignName}"\n`);
  process.stdout.write(
    `[creative:assets] variants=${out.variants.length} ctas=${out.ctaPool.length} risks=${out.riskFlags.length}\n`,
  );
  process.stdout.write(`[creative:assets] saved: ${absPath}\n`);
  process.stdout.write(
    `[creative:assets] cost=$${result.costUsd.toFixed(6)} model=${result.model} ${result.durationMs}ms\n`,
  );

  if (args.capture) {
    const slugTenant = args.tenantId.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const slugStore = args.storeId ? args.storeId.replace(/[^a-z0-9-]/gi, '-').toLowerCase() : '';
    const slugCampaign = args.campaignName
      .replace(/[^a-z0-9-]/gi, '-')
      .toLowerCase()
      .slice(0, 30);
    const overall: 'green' | 'yellow' | 'red' = out.riskFlags.length > 0 ? 'yellow' : 'green';
    const captureSlug = slugStore
      ? `creative-copy-${slugTenant}-${slugStore}-${slugCampaign}`
      : `creative-copy-${slugTenant}-${slugCampaign}`;
    const titleScope = args.storeId
      ? `tenant=${args.tenantId}/store=${args.storeId}`
      : `tenant=${args.tenantId}`;
    const vaultRel = args.storeId
      ? `07_memory/vault/tenants/${args.tenantId}/stores/${args.storeId}/${relPath}`
      : `07_memory/vault/tenants/${args.tenantId}/${relPath}`;
    const cap = await captureRun({
      kind: 'agent-run',
      slug: captureSlug.slice(0, 60),
      result: overall,
      title: `Creative: ${args.campaignName} (${titleScope})`,
      source: 'agent:creative-copy-assets',
      tags: args.storeId
        ? ['creative-copy-assets', 'tier-2', 'creative', 'store-scoped', overall]
        : ['creative-copy-assets', 'tier-2', 'creative', overall],
      body: {
        context: `pnpm creative:assets gera copy para ${args.campaignName} em ${titleScope}.`,
        whatHappened: [
          `Escopo: ${titleScope}.`,
          `Campaign: ${args.campaignName}.`,
          `Variantes: ${out.variants.length}.`,
          `Arquivo salvo em ${vaultRel}.`,
          `Custo: $${result.costUsd.toFixed(6)} (${result.model}).`,
        ],
        findings: [
          ...out.variants
            .slice(0, 5)
            .map((v) => `[variant] ${v.channel}/${v.locale}: ${v.headline.slice(0, 60)}`),
          ...out.riskFlags.map((r) => `[risk] ${r}`),
        ],
        impact: `${out.variants.length} variantes · ${out.ctaPool.length} CTA pool · ${out.reviewerChecklist.length} review items.`,
        references: [vaultRel],
      },
      sessionLogLine: `creative-copy-assets: ${args.campaignName} (${titleScope}) → ${out.variants.length} variantes, ${out.riskFlags.length} risk flags.`,
      tenantId: args.tenantId,
      ...(args.storeId ? { storeId: args.storeId } : {}),
    });
    process.stdout.write(`[creative:assets] capture → ${cap.summaryPath}\n`);
  }

  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[creative:assets] erro: ${msg}\n`);
  if (msg.includes('401') || msg.includes('invalid x-api-key')) {
    process.stderr.write('[creative:assets] → key inválida. Atualize .env.local.\n');
  }
  process.exit(1);
});
