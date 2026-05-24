#!/usr/bin/env node
// CLI: pnpm feed:dry-run [options]
//
// Lê produtos (fixture interna OU Shopify se credenciais presentes), opcionalmente
// otimiza via product-feed-seo (se ANTHROPIC_API_KEY presente), transforma para
// Merchant feed rows, valida, e gera dry-run report em 12_reports/merchant-dry-runs/.
//
// NENHUM upload real para Google. Sem credenciais Google necessárias.
//
// Flags:
//   --source=fixture|shopify   (default: fixture)
//   --first=N                  (default: 3; máx 50)
//   --seo                      (ativa otimização SEO via Claude; requer ANTHROPIC_API_KEY)
//   --tenant=<id>              (default: _test)
//   --shop-domain=<domain>     (default: $SHOPIFY_SHOP ou acme.myshopify.com)
//   --feed-label=<label>       (default: US)
//   --content-language=<lang>  (default: en)

import { resolve } from 'node:path';
import { captureRun } from '@cao/brain-bridge';
import { type ShopifyProductInput, writeDryRunReport } from '@cao/integration-google-merchant';
import { AdminGraphQLClient, isValidShopDomain, listProducts } from '@cao/integration-shopify';
import { makeAnthropicComplete, tryMakeAnthropicComplete } from '@cao/llm';
import { Memory } from '@cao/memory';
import { ConsoleProvider } from '@cao/observability';
import { sampleProducts } from './fixture.js';
import { runFeedPipeline } from './pipeline.js';

interface CliArgs {
  source: 'fixture' | 'shopify';
  first: number;
  seo: boolean;
  tenant: string;
  shopDomain: string;
  feedLabel: string;
  contentLanguage: string;
  capture: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    source: 'fixture',
    first: 3,
    seo: false,
    tenant: '_test',
    shopDomain: process.env.SHOPIFY_SHOP?.trim() ?? 'acme.myshopify.com',
    feedLabel: 'US',
    contentLanguage: 'en',
    capture: false,
  };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--source=')) {
      const v = a.slice('--source='.length);
      if (v !== 'fixture' && v !== 'shopify') fail(`--source inválido: ${v}`);
      args.source = v;
    } else if (a.startsWith('--first=')) {
      args.first = Math.min(Math.max(Number.parseInt(a.slice('--first='.length), 10), 1), 50);
    } else if (a === '--seo') {
      args.seo = true;
    } else if (a.startsWith('--tenant=')) {
      args.tenant = a.slice('--tenant='.length);
    } else if (a.startsWith('--shop-domain=')) {
      args.shopDomain = a.slice('--shop-domain='.length);
    } else if (a.startsWith('--feed-label=')) {
      args.feedLabel = a.slice('--feed-label='.length);
    } else if (a.startsWith('--content-language=')) {
      args.contentLanguage = a.slice('--content-language='.length);
    } else if (a === '--capture') {
      args.capture = true;
    } else if (a.startsWith('--')) {
      fail(`Flag desconhecida: ${a}`);
    } else {
      fail(`Argumento inesperado: ${a}`);
    }
  }
  return args;
}

function fail(msg: string): never {
  process.stderr.write(`[feed:dry-run] ${msg}\n`);
  process.exit(2);
}

async function loadProducts(args: CliArgs): Promise<{
  products: ShopifyProductInput[];
  sourceUsed: 'fixture' | 'shopify';
}> {
  if (args.source === 'shopify') {
    const token = process.env.SHOPIFY_ADMIN_TOKEN?.trim();
    if (!token || !args.shopDomain) {
      process.stdout.write(
        '[feed:dry-run] --source=shopify pedido mas SHOPIFY_SHOP/SHOPIFY_ADMIN_TOKEN ausente. Caindo para fixture.\n',
      );
      return { products: sampleProducts.slice(0, args.first), sourceUsed: 'fixture' };
    }
    if (!isValidShopDomain(args.shopDomain)) fail(`shop-domain inválido: ${args.shopDomain}`);
    const c = new AdminGraphQLClient({ shop: args.shopDomain, accessToken: token });
    const r = await listProducts(c, { first: args.first });
    return {
      products: r.items.map((p) => ({
        id: p.id,
        handle: p.handle,
        title: p.title,
        status: p.status,
        updatedAt: p.updatedAt,
      })),
      sourceUsed: 'shopify',
    };
  }
  return { products: sampleProducts.slice(0, args.first), sourceUsed: 'fixture' };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  const repoRoot = resolve(process.cwd());

  const { products, sourceUsed } = await loadProducts(args);
  process.stdout.write(
    `[feed:dry-run] carregados ${products.length} produto(s) via ${sourceUsed}\n`,
  );

  // SEO step — opcional + tolerante a credencial ausente
  let seoOpts: Parameters<typeof runFeedPipeline>[1]['seo'] | undefined;
  if (args.seo) {
    const resolution = tryMakeAnthropicComplete();
    if (resolution.mode === 'noop') {
      process.stdout.write(
        `[feed:dry-run] --seo pedido mas ${resolution.reason}. SEO desativado neste run.\n`,
      );
    } else {
      const memory = new Memory({
        vaultRoot: resolve(repoRoot, '07_memory/vault'),
        tenantId: args.tenant,
      });
      await memory.ensureBaseDir();
      seoOpts = {
        complete: makeAnthropicComplete(),
        memory,
        observability: new ConsoleProvider(),
      };
      process.stdout.write('[feed:dry-run] SEO ativo (Claude Sonnet)\n');
    }
  }

  const pipelineResult = await runFeedPipeline(products, {
    tenantId: args.tenant,
    transform: {
      shopDomain: args.shopDomain,
      contentLanguage: args.contentLanguage,
      feedLabel: args.feedLabel,
      defaultAvailability: 'in_stock',
      defaultPrice: { amount: '0.00', currencyCode: 'USD' },
    },
    ...(seoOpts ? { seo: seoOpts } : {}),
  });

  const report = await writeDryRunReport({
    rows: pipelineResult.rows.map((r) => r.row),
    validations: pipelineResult.rows.map((r) => r.validation),
    warningsPerRow: pipelineResult.rows.map((r) => r.warnings),
    tenantId: args.tenant,
  });

  const lines = [
    `[feed:dry-run] ${report.okCount} ok / ${report.failCount} fail / ${report.warningCount} warnings`,
  ];
  if (pipelineResult.totalSeoCostUsd > 0) {
    lines.push(`[feed:dry-run] SEO custo total: $${pipelineResult.totalSeoCostUsd.toFixed(6)}`);
  }
  lines.push(`[feed:dry-run] report: ${report.markdownPath}`);
  lines.push(`[feed:dry-run] json:   ${report.jsonPath}`);
  process.stdout.write(`${lines.join('\n')}\n`);

  if (args.capture) {
    const overall = report.failCount > 0 ? 'red' : report.warningCount > 0 ? 'yellow' : 'green';
    const slugTenant = args.tenant.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const cap = await captureRun({
      kind: 'agent-run',
      slug: `feed-dry-run-${slugTenant}-${sourceUsed}`.slice(0, 60),
      result: overall,
      title: `Merchant dry-run (${sourceUsed}, ${products.length} prod, tenant=${args.tenant})`,
      source: 'agent:catalog-feed-ops',
      tags: ['merchant', 'dry-run', 'feed', overall],
      body: {
        context: `pnpm feed:dry-run --source=${sourceUsed}${args.seo ? ' --seo' : ''} carregou ${products.length} produto(s) e gerou relatório.`,
        whatHappened: [
          `Fonte: ${sourceUsed} (${products.length} produto(s)).`,
          args.seo
            ? `SEO via Claude aplicado (custo $${pipelineResult.totalSeoCostUsd.toFixed(6)}).`
            : 'SEO desativado.',
          `Validação: ${report.okCount} OK / ${report.failCount} fail / ${report.warningCount} warnings.`,
        ],
        findings: pipelineResult.rows
          .filter((r) => !r.validation.ok)
          .map(
            (r) =>
              `[fail] ${r.row.offerId}: ${r.validation.errors.map((e) => `${e.path}: ${e.message}`).join('; ')}`,
          ),
        impact:
          report.failCount > 0
            ? `${report.failCount} row(s) bloqueada(s) — corrigir antes de upload real.`
            : 'Pipeline pronta para upload real (depende de credenciais Google + cliente HTTP Merchant).',
        references: [report.markdownPath, report.jsonPath],
      },
      sessionLogLine: `feed:dry-run (${sourceUsed}, ${args.tenant}): ${report.okCount} ok / ${report.failCount} fail / ${report.warningCount} warnings.`,
    });
    process.stdout.write(`[feed:dry-run] capture → ${cap.summaryPath}\n`);
    process.stdout.write(
      `[feed:dry-run] capture: ${cap.filesUpdated.length} arquivo(s) do cérebro atualizado(s)\n`,
    );
  }

  // Exit 1 se houver row com fail — útil em CI futuro
  if (report.failCount > 0) process.exit(1);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[feed:dry-run] erro: ${msg}\n`);
  process.exit(1);
});
