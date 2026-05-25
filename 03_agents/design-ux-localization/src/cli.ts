#!/usr/bin/env node
// CLI: pnpm design:ux --scope=product --name="..." --summary="..." --market=pt-BR:BRL:BR [...]

import { resolve } from 'node:path';
import { captureRun } from '@cao/brain-bridge';
import { makeAnthropicComplete } from '@cao/llm';
import { Memory } from '@cao/memory';
import { ConsoleProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { designPath, designTimestamp, designUxAgent, renderDesign } from './index.js';

interface MarketArg {
  locale: string;
  currency: string;
  region: string;
}

interface CliArgs {
  tenantId: string;
  scopeKind: 'product' | 'collection';
  name: string;
  summary: string;
  brandStyle: string;
  markets: MarketArg[];
  conversionGoal: string;
  accessibility: string[];
  constraints: string[];
  capture: boolean;
}

function parseMarket(raw: string): MarketArg {
  const parts = raw.split(':');
  if (parts.length < 3) {
    fail(`--market deve ser "locale:currency:region" (ex.: pt-BR:BRL:BR). Recebido: ${raw}`);
  }
  return {
    locale: parts[0] as string,
    currency: parts[1] as string,
    region: parts.slice(2).join(':'),
  };
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    tenantId: '_test',
    scopeKind: 'product',
    name: '',
    summary: '',
    brandStyle: '',
    markets: [],
    conversionGoal: 'first purchase',
    accessibility: [],
    constraints: [],
    capture: false,
  };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--tenant=')) args.tenantId = a.slice('--tenant='.length);
    else if (a.startsWith('--scope=')) {
      const v = a.slice('--scope='.length);
      if (v !== 'product' && v !== 'collection') fail('--scope deve ser "product" ou "collection"');
      args.scopeKind = v;
    } else if (a.startsWith('--name=')) args.name = a.slice('--name='.length);
    else if (a.startsWith('--summary=')) args.summary = a.slice('--summary='.length);
    else if (a.startsWith('--style=')) args.brandStyle = a.slice('--style='.length);
    else if (a.startsWith('--market=')) args.markets.push(parseMarket(a.slice('--market='.length)));
    else if (a.startsWith('--goal=')) args.conversionGoal = a.slice('--goal='.length);
    else if (a.startsWith('--a11y=')) args.accessibility.push(a.slice('--a11y='.length));
    else if (a.startsWith('--constraint=')) args.constraints.push(a.slice('--constraint='.length));
    else if (a === '--capture') args.capture = true;
    else if (a.startsWith('--')) fail(`Flag desconhecida: ${a}`);
    else fail(`Argumento inesperado: ${a}`);
  }
  if (!args.name) fail('--name é obrigatório');
  if (!args.summary) fail('--summary é obrigatório');
  if (!args.brandStyle) fail('--style é obrigatório');
  if (args.markets.length === 0) fail('pelo menos um --market é obrigatório (ex.: pt-BR:BRL:BR)');
  return args;
}

function fail(msg: string): never {
  process.stderr.write(`[design:ux] ${msg}\n`);
  process.exit(2);
}

function skipped(msg: string): never {
  process.stdout.write(`[design:ux] SKIPPED — ${msg}\n`);
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
    productOrCollection: args.name,
    scopeKind: args.scopeKind,
    productSummary: args.summary,
    brandStyle: args.brandStyle,
    targetMarkets: args.markets,
    conversionGoal: args.conversionGoal,
    accessibilityRequirements: args.accessibility,
    constraints: args.constraints,
  };

  const result = await runAgent(
    designUxAgent,
    input,
    { tenantId: args.tenantId },
    { complete, memory, observability },
  );

  const ts = designTimestamp();
  const relPath = designPath(args.name, ts);
  const generatedAt = new Date().toISOString();
  const md = renderDesign(input, result.output, {
    runId: result.runId,
    model: result.model,
    costUsd: result.costUsd,
    generatedAt,
  });
  await memory.write(relPath, md);
  const absPath = resolve(repoRoot, '07_memory/vault', args.tenantId, relPath);

  const out = result.output;
  process.stdout.write(`[design:ux] scope="${args.scopeKind}:${args.name}"\n`);
  process.stdout.write(
    `[design:ux] blocks=${out.pageBlueprint.length} locales=${out.localizedCopy.length} a11y=${out.accessibilityNotes.length} risks=${out.riskFlags.length}\n`,
  );
  process.stdout.write(`[design:ux] saved: ${absPath}\n`);
  process.stdout.write(
    `[design:ux] cost=$${result.costUsd.toFixed(6)} model=${result.model} ${result.durationMs}ms\n`,
  );

  if (args.capture) {
    const slugTenant = args.tenantId.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const slugName = args.name
      .replace(/[^a-z0-9-]/gi, '-')
      .toLowerCase()
      .slice(0, 30);
    const overall: 'green' | 'yellow' | 'red' =
      out.culturalFlags.length + out.riskFlags.length > 0 ? 'yellow' : 'green';
    const cap = await captureRun({
      kind: 'agent-run',
      slug: `design-ux-${slugTenant}-${slugName}`.slice(0, 60),
      result: overall,
      title: `Design: ${args.scopeKind} ${args.name}`,
      source: 'agent:design-ux-localization',
      tags: ['design-ux-localization', 'tier-2', 'design', overall],
      body: {
        context: `pnpm design:ux blueprinta ${args.scopeKind} ${args.name} para ${out.localizedCopy.length} mercados (${args.tenantId}).`,
        whatHappened: [
          `Tenant: ${args.tenantId}.`,
          `Scope: ${args.scopeKind} — ${args.name}.`,
          `Blueprint: ${out.pageBlueprint.length} blocos.`,
          `Mercados localizados: ${out.localizedCopy.map((l) => l.locale).join(', ')}.`,
          `Arquivo salvo em vault/${args.tenantId}/${relPath}.`,
          `Custo: $${result.costUsd.toFixed(6)} (${result.model}).`,
        ],
        findings: [
          ...out.uxNotes.slice(0, 5).map((u) => `[ux] ${u}`),
          ...out.accessibilityNotes.slice(0, 5).map((a) => `[a11y] ${a}`),
          ...out.culturalFlags.map((c) => `[cultural] ${c}`),
          ...out.riskFlags.map((r) => `[risk] ${r}`),
        ],
        impact: `${out.pageBlueprint.length} blocos · ${out.localizedCopy.length} locales · ${out.accessibilityNotes.length} a11y notes.`,
        references: [`07_memory/vault/${args.tenantId}/${relPath}`],
      },
      sessionLogLine: `design-ux-localization: ${args.scopeKind}/${args.name} → ${out.localizedCopy.length} locales, ${out.riskFlags.length} risk flags.`,
    });
    process.stdout.write(`[design:ux] capture → ${cap.summaryPath}\n`);
  }

  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[design:ux] erro: ${msg}\n`);
  if (msg.includes('401') || msg.includes('invalid x-api-key')) {
    process.stderr.write('[design:ux] → key inválida. Atualize .env.local.\n');
  }
  process.exit(1);
});
