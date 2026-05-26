#!/usr/bin/env node
// CLI: pnpm product:offer --product-name="..." --description="..." [...]

import { resolve } from 'node:path';
import { captureRun } from '@cao/brain-bridge';
import { assertTenantContext, assertTenantStoreContext } from '@cao/core';
import { makeAnthropicComplete } from '@cao/llm';
import { Memory } from '@cao/memory';
import { ConsoleProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { offerPath, offerTimestamp, productOfferAgent, renderOffer } from './index.js';

interface CliArgs {
  tenantId: string;
  storeId: string;
  productName: string;
  description: string;
  price: string;
  currency: string;
  category: string;
  audience: string;
  voice: string;
  locale: string;
  goal: string;
  vocContext: string;
  competitorContext: string;
  constraints: string[];
  capture: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    tenantId: '_test',
    storeId: '',
    productName: '',
    description: '',
    price: '',
    currency: '',
    category: '',
    audience: '',
    voice: '',
    locale: '',
    goal: 'first purchase',
    vocContext: '',
    competitorContext: '',
    constraints: [],
    capture: false,
  };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--tenant=')) args.tenantId = a.slice('--tenant='.length);
    else if (a.startsWith('--store=')) args.storeId = a.slice('--store='.length);
    else if (a.startsWith('--product-name=')) args.productName = a.slice('--product-name='.length);
    else if (a.startsWith('--description=')) args.description = a.slice('--description='.length);
    else if (a.startsWith('--price=')) args.price = a.slice('--price='.length);
    else if (a.startsWith('--currency=')) args.currency = a.slice('--currency='.length);
    else if (a.startsWith('--category=')) args.category = a.slice('--category='.length);
    else if (a.startsWith('--audience=')) args.audience = a.slice('--audience='.length);
    else if (a.startsWith('--voice=')) args.voice = a.slice('--voice='.length);
    else if (a.startsWith('--locale=')) args.locale = a.slice('--locale='.length);
    else if (a.startsWith('--goal=')) args.goal = a.slice('--goal='.length);
    else if (a.startsWith('--voc-context=')) args.vocContext = a.slice('--voc-context='.length);
    else if (a.startsWith('--competitor-context='))
      args.competitorContext = a.slice('--competitor-context='.length);
    else if (a.startsWith('--constraint=')) args.constraints.push(a.slice('--constraint='.length));
    else if (a === '--capture') args.capture = true;
    else if (a.startsWith('--')) fail(`Flag desconhecida: ${a}`);
    else fail(`Argumento inesperado: ${a}`);
  }
  if (!args.productName) fail('--product-name é obrigatório');
  if (!args.description) fail('--description é obrigatório');
  if (!args.audience) fail('--audience é obrigatório');
  if (!args.voice) fail('--voice é obrigatório');
  return args;
}

function fail(msg: string): never {
  process.stderr.write(`[product:offer] ${msg}\n`);
  process.exit(2);
}

function skipped(msg: string): never {
  process.stdout.write(`[product:offer] SKIPPED — ${msg}\n`);
  process.exit(0);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);

  // Multi-tenant safety: assertion explícita antes de qualquer I/O.
  if (args.storeId) {
    assertTenantStoreContext({ tenantId: args.tenantId, storeId: args.storeId }, 'product:offer');
  } else {
    assertTenantContext({ tenantId: args.tenantId }, 'product:offer');
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
    product: {
      name: args.productName,
      currentDescription: args.description,
      price: args.price,
      currency: args.currency,
      category: args.category,
    },
    targetAudience: args.audience,
    brandVoice: args.voice,
    locale: args.locale,
    conversionGoal: args.goal,
    vocContext: args.vocContext,
    competitorContext: args.competitorContext,
    constraints: args.constraints,
  };

  const result = await runAgent(
    productOfferAgent,
    input,
    { tenantId: args.tenantId, ...(args.storeId ? { storeId: args.storeId } : {}) },
    { complete, memory, observability },
  );

  const ts = offerTimestamp();
  const relPath = offerPath(args.productName, ts);
  const generatedAt = new Date().toISOString();
  const md = renderOffer(input, result.output, {
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
  process.stdout.write(`[product:offer] hero="${out.heroHeadline.slice(0, 60)}"\n`);
  process.stdout.write(
    `[product:offer] valueProps=${out.valueProps.length} bundles=${out.bundleSuggestions.length} ctas=${out.ctaOptions.length} risks=${out.riskFlags.length}\n`,
  );
  process.stdout.write(`[product:offer] offer: ${absPath}\n`);
  process.stdout.write(
    `[product:offer] cost=$${result.costUsd.toFixed(6)} model=${result.model} ${result.durationMs}ms\n`,
  );

  if (args.capture) {
    const slugTenant = args.tenantId.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const slugStore = args.storeId ? args.storeId.replace(/[^a-z0-9-]/gi, '-').toLowerCase() : '';
    const slugProduct = args.productName
      .replace(/[^a-z0-9-]/gi, '-')
      .toLowerCase()
      .slice(0, 30);
    const overall: 'green' | 'yellow' | 'red' = out.riskFlags.length > 0 ? 'yellow' : 'green';
    const captureSlug = slugStore
      ? `product-offer-${slugTenant}-${slugStore}-${slugProduct}`
      : `product-offer-${slugTenant}-${slugProduct}`;
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
      title: `Offer: ${args.productName} (${titleScope})`,
      source: 'agent:product-offer',
      tags: args.storeId
        ? ['product-offer', 'tier-2', 'copy', 'store-scoped', overall]
        : ['product-offer', 'tier-2', 'copy', overall],
      body: {
        context: `pnpm product:offer gera oferta para ${args.productName} em ${titleScope}.`,
        whatHappened: [
          `Escopo: ${titleScope}.`,
          `Hero: ${out.heroHeadline}.`,
          `Offer salvo em ${vaultRel}.`,
          `Custo: $${result.costUsd.toFixed(6)} (${result.model}).`,
        ],
        findings: [
          ...out.valueProps.map((v) => `[value] ${v}`),
          ...out.riskFlags.map((r) => `[risk] ${r}`),
        ],
        impact: `${out.valueProps.length} value props · ${out.bundleSuggestions.length} bundles · ${out.ctaOptions.length} CTA variants.`,
        references: [vaultRel],
      },
      sessionLogLine: `product-offer: ${args.productName} (${titleScope}) → ${out.valueProps.length} value props, ${out.riskFlags.length} risk flags.`,
      tenantId: args.tenantId,
      ...(args.storeId ? { storeId: args.storeId } : {}),
    });
    process.stdout.write(`[product:offer] capture → ${cap.summaryPath}\n`);
  }

  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[product:offer] erro: ${msg}\n`);
  if (msg.includes('401') || msg.includes('invalid x-api-key')) {
    process.stderr.write('[product:offer] → key inválida. Atualize .env.local.\n');
  }
  process.exit(1);
});
