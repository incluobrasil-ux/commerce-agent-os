#!/usr/bin/env node
// CLI: pnpm marketing:plan --horizon="Q3 2026" --objective="..." --budget=50000 [...]

import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import { captureRun } from '@cao/brain-bridge';
import { assertTenantContext, assertTenantStoreContext } from '@cao/core';
import { makeAnthropicComplete } from '@cao/llm';
import { Memory } from '@cao/memory';
import { ConsoleProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { marketingDirectorAgent, planPath, planTimestamp, renderPlan } from './index.js';

interface CliArgs {
  tenantId: string;
  storeId: string;
  horizon: string;
  objectives: string[];
  budgetUsd: number;
  brandVoice: string;
  audienceContext: string;
  marketContext: string;
  competitorContext: string;
  portfolio: string;
  constraints: string[];
  contextFile: string;
  capture: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    tenantId: '_test',
    storeId: '',
    horizon: '',
    objectives: [],
    budgetUsd: 0,
    brandVoice: '',
    audienceContext: '',
    marketContext: '',
    competitorContext: '',
    portfolio: '',
    constraints: [],
    contextFile: '',
    capture: false,
  };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--tenant=')) args.tenantId = a.slice('--tenant='.length);
    else if (a.startsWith('--store=')) args.storeId = a.slice('--store='.length);
    else if (a.startsWith('--horizon=')) args.horizon = a.slice('--horizon='.length);
    else if (a.startsWith('--objective=')) args.objectives.push(a.slice('--objective='.length));
    else if (a.startsWith('--budget=')) args.budgetUsd = Number(a.slice('--budget='.length));
    else if (a.startsWith('--voice=')) args.brandVoice = a.slice('--voice='.length);
    else if (a.startsWith('--audience-context='))
      args.audienceContext = a.slice('--audience-context='.length);
    else if (a.startsWith('--market-context='))
      args.marketContext = a.slice('--market-context='.length);
    else if (a.startsWith('--competitor-context='))
      args.competitorContext = a.slice('--competitor-context='.length);
    else if (a.startsWith('--portfolio=')) args.portfolio = a.slice('--portfolio='.length);
    else if (a.startsWith('--constraint=')) args.constraints.push(a.slice('--constraint='.length));
    else if (a.startsWith('--context-file=')) args.contextFile = a.slice('--context-file='.length);
    else if (a === '--capture') args.capture = true;
    else if (a.startsWith('--')) fail(`Flag desconhecida: ${a}`);
    else fail(`Argumento inesperado: ${a}`);
  }
  if (!args.horizon) fail('--horizon é obrigatório (ex.: --horizon="Q3 2026")');
  if (args.objectives.length === 0) fail('pelo menos um --objective="..." é obrigatório');
  if (!args.brandVoice) fail('--voice é obrigatório');
  if (!Number.isFinite(args.budgetUsd) || args.budgetUsd <= 0) fail('--budget deve ser número > 0');
  return args;
}

function fail(msg: string): never {
  process.stderr.write(`[marketing:plan] ${msg}\n`);
  process.exit(2);
}

function skipped(msg: string): never {
  process.stdout.write(`[marketing:plan] SKIPPED — ${msg}\n`);
  process.exit(0);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);

  if (args.storeId) {
    assertTenantStoreContext({ tenantId: args.tenantId, storeId: args.storeId }, 'marketing:plan');
  } else {
    assertTenantContext({ tenantId: args.tenantId }, 'marketing:plan');
  }

  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    skipped('ANTHROPIC_API_KEY ausente em .env.local. Brief lido; execução pendente.');
  }

  const repoRoot = resolve(process.cwd());
  let portfolio = args.portfolio;
  if (args.contextFile) {
    const txt = await fs.readFile(resolve(repoRoot, args.contextFile), 'utf-8');
    portfolio = portfolio ? `${portfolio}\n\n${txt}` : txt;
  }

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
    horizon: args.horizon,
    objectives: args.objectives,
    budgetUsd: args.budgetUsd,
    brandVoice: args.brandVoice,
    audienceContext: args.audienceContext,
    marketContext: args.marketContext,
    competitorContext: args.competitorContext,
    productPortfolio: portfolio,
    constraints: args.constraints,
  };

  const result = await runAgent(
    marketingDirectorAgent,
    input,
    { tenantId: args.tenantId, ...(args.storeId ? { storeId: args.storeId } : {}) },
    { complete, memory, observability },
  );

  const ts = planTimestamp();
  const relPath = planPath(args.horizon, ts);
  const generatedAt = new Date().toISOString();
  const md = renderPlan(input, result.output, {
    runId: result.runId,
    model: result.model,
    costUsd: result.costUsd,
    generatedAt,
  });
  await memory.write(relPath, md);
  const absPath = args.storeId
    ? resolve(repoRoot, '07_memory/vault', args.tenantId, 'stores', args.storeId, relPath)
    : resolve(repoRoot, '07_memory/vault', args.tenantId, relPath);

  const out = result.output;
  process.stdout.write(`[marketing:plan] plan="${out.planTitle.slice(0, 60)}"\n`);
  process.stdout.write(
    `[marketing:plan] initiatives=${out.initiatives.length} kpis=${out.kpiTargets.length} risks=${out.riskFlags.length}\n`,
  );
  process.stdout.write(`[marketing:plan] saved: ${absPath}\n`);
  process.stdout.write(
    `[marketing:plan] cost=$${result.costUsd.toFixed(6)} model=${result.model} ${result.durationMs}ms\n`,
  );

  if (args.capture) {
    const slugTenant = args.tenantId.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const slugStore = args.storeId ? args.storeId.replace(/[^a-z0-9-]/gi, '-').toLowerCase() : '';
    const slugHorizon = args.horizon
      .replace(/[^a-z0-9-]/gi, '-')
      .toLowerCase()
      .slice(0, 30);
    const overall: 'green' | 'yellow' | 'red' = out.riskFlags.length > 0 ? 'yellow' : 'green';
    const captureSlug = slugStore
      ? `marketing-director-${slugTenant}-${slugStore}-${slugHorizon}`
      : `marketing-director-${slugTenant}-${slugHorizon}`;
    const titleScope = args.storeId
      ? `tenant=${args.tenantId}/store=${args.storeId}`
      : `tenant=${args.tenantId}`;
    const vaultRel = args.storeId
      ? `07_memory/vault/tenants/${args.tenantId}/stores/${args.storeId}/${relPath}`
      : `07_memory/vault/${args.tenantId}/${relPath}`;
    const cap = await captureRun({
      kind: 'agent-run',
      slug: captureSlug.slice(0, 60),
      result: overall,
      title: `Marketing plan: ${out.planTitle} (${titleScope})`,
      source: 'agent:marketing-director',
      tags: args.storeId
        ? ['marketing-director', 'tier-2', 'plan', 'store-scoped', overall]
        : ['marketing-director', 'tier-2', 'plan', overall],
      body: {
        context: `pnpm marketing:plan gera plano para ${args.horizon} em ${titleScope}.`,
        whatHappened: [
          `Escopo: ${titleScope}.`,
          `Horizon: ${args.horizon}, budget USD ${args.budgetUsd}.`,
          `Iniciativas: ${out.initiatives.length}.`,
          `Plano salvo em ${vaultRel}.`,
          `Custo: $${result.costUsd.toFixed(6)} (${result.model}).`,
        ],
        findings: [
          ...out.initiatives.map((i) => `[init] ${i.name} → ${i.primaryChannel}`),
          ...out.riskFlags.map((r) => `[risk] ${r}`),
        ],
        impact: `${out.initiatives.length} iniciativas · ${out.kpiTargets.length} KPIs · ${out.budgetSplit.length} categorias de budget.`,
        references: [vaultRel],
      },
      sessionLogLine: `marketing-director: ${args.horizon} (${titleScope}) → ${out.initiatives.length} iniciativas, ${out.riskFlags.length} risk flags.`,
      tenantId: args.tenantId,
      ...(args.storeId ? { storeId: args.storeId } : {}),
    });
    process.stdout.write(`[marketing:plan] capture → ${cap.summaryPath}\n`);
  }

  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[marketing:plan] erro: ${msg}\n`);
  if (msg.includes('401') || msg.includes('invalid x-api-key')) {
    process.stderr.write('[marketing:plan] → key inválida. Atualize .env.local.\n');
  }
  process.exit(1);
});
