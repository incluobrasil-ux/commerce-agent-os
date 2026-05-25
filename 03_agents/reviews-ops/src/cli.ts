#!/usr/bin/env node
// CLI: pnpm reviews:ops --reviews-json='[{...}]' --product-name="..." --goal="..."
// OU: pnpm reviews:ops --reviews-file=path/to.json --product-name="..." --goal="..."

import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import { captureRun } from '@cao/brain-bridge';
import { makeAnthropicComplete } from '@cao/llm';
import { Memory } from '@cao/memory';
import { ConsoleProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { type ReviewItem, renderVoc, reviewsOpsAgent, vocPath, vocTimestamp } from './index.js';

interface CliArgs {
  tenantId: string;
  reviewsJson: string;
  reviewsFile: string;
  productName: string;
  locale: string;
  analysisGoal: string;
  capture: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    tenantId: '_test',
    reviewsJson: '',
    reviewsFile: '',
    productName: '',
    locale: '',
    analysisGoal: 'extrair VoC para uso em copy e CX',
    capture: false,
  };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--tenant=')) args.tenantId = a.slice('--tenant='.length);
    else if (a.startsWith('--reviews-json=')) args.reviewsJson = a.slice('--reviews-json='.length);
    else if (a.startsWith('--reviews-file=')) args.reviewsFile = a.slice('--reviews-file='.length);
    else if (a.startsWith('--product-name=')) args.productName = a.slice('--product-name='.length);
    else if (a.startsWith('--locale=')) args.locale = a.slice('--locale='.length);
    else if (a.startsWith('--goal=')) args.analysisGoal = a.slice('--goal='.length);
    else if (a === '--capture') args.capture = true;
    else if (a.startsWith('--')) fail(`Flag desconhecida: ${a}`);
    else fail(`Argumento inesperado: ${a}`);
  }
  if (!args.reviewsJson && !args.reviewsFile)
    fail('--reviews-json=<json> OU --reviews-file=<path> é obrigatório');
  return args;
}

function fail(msg: string): never {
  process.stderr.write(`[reviews:ops] ${msg}\n`);
  process.exit(2);
}

function skipped(msg: string): never {
  process.stdout.write(`[reviews:ops] SKIPPED — ${msg}\n`);
  process.exit(0);
}

interface RawReview {
  rating?: number;
  text?: string;
  source?: string;
  date?: string;
}

function normalizeReviews(raw: unknown): ReviewItem[] {
  if (!Array.isArray(raw)) fail('reviews JSON deve ser um array');
  return raw.map((r: RawReview, i) => {
    if (typeof r !== 'object' || r === null) fail(`review #${i + 1} inválida: não é objeto`);
    const rating = typeof r.rating === 'number' ? r.rating : Number.NaN;
    const text = typeof r.text === 'string' ? r.text : '';
    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
      fail(`review #${i + 1}: rating inválido (esperado número 1–5)`);
    }
    if (!text || text.length < 2) {
      fail(`review #${i + 1}: text vazio ou < 2 chars`);
    }
    return {
      rating,
      text,
      source: typeof r.source === 'string' ? r.source : '',
      date: typeof r.date === 'string' ? r.date : '',
    };
  });
}

async function loadReviews(args: CliArgs): Promise<ReviewItem[]> {
  const raw = args.reviewsFile
    ? JSON.parse(await fs.readFile(resolve(args.reviewsFile), 'utf8'))
    : JSON.parse(args.reviewsJson);
  return normalizeReviews(raw);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  const reviews = await loadReviews(args);

  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    skipped(
      `ANTHROPIC_API_KEY ausente em .env.local. ${reviews.length} review(s) lida(s) e validada(s); execução pendente.`,
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

  const result = await runAgent(
    reviewsOpsAgent,
    {
      tenantId: args.tenantId,
      reviews,
      productName: args.productName,
      locale: args.locale,
      analysisGoal: args.analysisGoal,
    },
    { tenantId: args.tenantId },
    { complete, memory, observability },
  );

  const ts = vocTimestamp();
  const slug = args.productName || `voc-${args.tenantId}`;
  const relPath = vocPath(slug, ts);
  const generatedAt = new Date().toISOString();
  const md = renderVoc(
    {
      tenantId: args.tenantId,
      reviews,
      productName: args.productName,
      locale: args.locale,
      analysisGoal: args.analysisGoal,
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
  const absPath = resolve(repoRoot, '07_memory/vault', args.tenantId, relPath);

  const out = result.output;
  process.stdout.write(
    `[reviews:ops] sample=${out.sampleSize} avg=${out.averageRating.toFixed(2)}/5\n`,
  );
  process.stdout.write(
    `[reviews:ops] themes=${out.topThemes.length} pains=${out.painPoints.length} risks=${out.riskFlags.length}\n`,
  );
  process.stdout.write(`[reviews:ops] voc: ${absPath}\n`);
  process.stdout.write(
    `[reviews:ops] cost=$${result.costUsd.toFixed(6)} model=${result.model} ${result.durationMs}ms\n`,
  );

  if (args.capture) {
    const slugTenant = args.tenantId.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const slugProduct = (args.productName || 'tenant')
      .replace(/[^a-z0-9-]/gi, '-')
      .toLowerCase()
      .slice(0, 30);
    const overall: 'green' | 'yellow' | 'red' = out.riskFlags.length > 0 ? 'yellow' : 'green';
    const cap = await captureRun({
      kind: 'agent-run',
      slug: `reviews-ops-${slugTenant}-${slugProduct}`.slice(0, 60),
      result: overall,
      title: `VoC: ${args.productName || args.tenantId} (${out.sampleSize} reviews)`,
      source: 'agent:reviews-ops',
      tags: ['reviews-ops', 'tier-1', 'voc', overall],
      body: {
        context: `pnpm reviews:ops ingere ${out.sampleSize} reviews para ${args.productName || args.tenantId}.`,
        whatHappened: [
          `Tenant: ${args.tenantId}.`,
          `Sample: ${out.sampleSize} reviews · média ${out.averageRating.toFixed(2)}/5.`,
          `VoC salvo em vault/${args.tenantId}/${relPath}.`,
          `Custo: $${result.costUsd.toFixed(6)} (${result.model}).`,
        ],
        findings: [
          ...out.painPoints.map((p) => `[pain] ${p}`),
          ...out.topThemes.map((t) => `[theme] ${t}`),
          ...out.riskFlags.map((r) => `[risk] ${r}`),
        ],
        impact: `${out.topThemes.length} tema(s) recorrente(s) extraído(s). ${out.actionIdeas.length} ação(ões) propostas.`,
        references: [`07_memory/vault/${args.tenantId}/${relPath}`],
      },
      sessionLogLine: `reviews-ops: ${out.sampleSize} reviews → ${out.topThemes.length} temas, ${out.riskFlags.length} risk flags.`,
    });
    process.stdout.write(`[reviews:ops] capture → ${cap.summaryPath}\n`);
  }

  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[reviews:ops] erro: ${msg}\n`);
  if (msg.includes('401') || msg.includes('invalid x-api-key')) {
    process.stderr.write('[reviews:ops] → key inválida. Atualize .env.local.\n');
  }
  process.exit(1);
});
