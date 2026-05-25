#!/usr/bin/env node
// CLI: pnpm merchant:audit [options]
//
// Carrega produtos (fixture interna, arquivo JSON local, ou Shopify) e gera
// audit consolidado: SKU-level score (0-100), findings categorizados por
// severidade (critical/high/medium/low), remediações concretas e estatísticas
// agregadas. Output em 12_reports/merchant-audits/ (markdown + JSON).
//
// NENHUM upload real para Google. NENHUMA chamada LLM (audit é determinístico).
//
// Flags:
//   --source=fixture|json|shopify   (default: fixture)
//   --file=path                     (obrigatório com --source=json)
//   --first=N                       (default: 50; máx 500)
//   --tenant=<id>                   (default: _test)
//   --shop-domain=<domain>          (default: $SHOPIFY_SHOP)
//   --feed-label=<label>            (default: US)
//   --content-language=<lang>       (default: en)
//   --capture                       (registra run no cérebro)

import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import { captureRun } from '@cao/brain-bridge';
import {
  type ShopifyProductInput,
  productToFeedRow,
  scoreRow,
  summarizeAudit,
  validateFeedRow,
  writeAuditReport,
} from '@cao/integration-google-merchant';
import { AdminGraphQLClient, isValidShopDomain, listProducts } from '@cao/integration-shopify';
import { sampleProducts } from './fixture.js';

interface CliArgs {
  source: 'fixture' | 'json' | 'shopify';
  file: string;
  first: number;
  tenant: string;
  shopDomain: string;
  feedLabel: string;
  contentLanguage: string;
  capture: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    source: 'fixture',
    file: '',
    first: 50,
    tenant: '_test',
    shopDomain: process.env.SHOPIFY_SHOP?.trim() ?? 'acme.myshopify.com',
    feedLabel: 'US',
    contentLanguage: 'en',
    capture: false,
  };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--source=')) {
      const v = a.slice('--source='.length);
      if (v !== 'fixture' && v !== 'json' && v !== 'shopify') {
        fail(`--source inválido: ${v} (use fixture | json | shopify)`);
      }
      args.source = v;
    } else if (a.startsWith('--file=')) {
      args.file = a.slice('--file='.length);
    } else if (a.startsWith('--first=')) {
      args.first = Math.min(Math.max(Number.parseInt(a.slice('--first='.length), 10), 1), 500);
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
  if (args.source === 'json' && !args.file) {
    fail('--source=json requer --file=<path>');
  }
  return args;
}

function fail(msg: string): never {
  process.stderr.write(`[merchant:audit] ${msg}\n`);
  process.exit(2);
}

async function loadFromJson(file: string): Promise<ShopifyProductInput[]> {
  const txt = await fs.readFile(resolve(process.cwd(), file), 'utf-8');
  let data: unknown;
  try {
    data = JSON.parse(txt);
  } catch (e) {
    fail(`JSON inválido em ${file}: ${e instanceof Error ? e.message : String(e)}`);
  }
  if (!Array.isArray(data)) fail(`${file} deve conter um array de produtos no topo.`);
  // Aceita formato leve — apenas valida campos críticos. Pipeline + scorer
  // tratam ausências como warnings/findings ao invés de erros fatais.
  return (data as unknown[]).map((raw, i) => {
    const p = raw as Record<string, unknown>;
    if (typeof p.handle !== 'string') fail(`produto[${i}] sem handle (obrigatório).`);
    if (typeof p.title !== 'string') fail(`produto[${i}] sem title (obrigatório).`);
    return {
      id: (p.id as string) ?? `gid://json/${p.handle}`,
      handle: p.handle,
      title: p.title,
      status: (p.status as ShopifyProductInput['status']) ?? 'ACTIVE',
      updatedAt: (p.updatedAt as string) ?? new Date().toISOString(),
      descriptionHtml: p.descriptionHtml as string | undefined,
      vendor: p.vendor as string | null | undefined,
      productType: p.productType as string | null | undefined,
      price: p.price as ShopifyProductInput['price'],
      imageUrl: p.imageUrl as string | undefined,
      availability: p.availability as ShopifyProductInput['availability'],
      gtin: p.gtin as string | null | undefined,
      mpn: p.mpn as string | null | undefined,
    };
  });
}

async function loadProducts(args: CliArgs): Promise<{
  products: ShopifyProductInput[];
  sourceUsed: 'fixture' | 'json' | 'shopify';
}> {
  if (args.source === 'json') {
    const items = await loadFromJson(args.file);
    return { products: items.slice(0, args.first), sourceUsed: 'json' };
  }
  if (args.source === 'shopify') {
    const token = process.env.SHOPIFY_ADMIN_TOKEN?.trim();
    if (!token || !args.shopDomain) {
      process.stdout.write(
        '[merchant:audit] --source=shopify pedido mas SHOPIFY_SHOP/SHOPIFY_ADMIN_TOKEN ausente. Caindo para fixture.\n',
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

  const { products, sourceUsed } = await loadProducts(args);
  process.stdout.write(
    `[merchant:audit] carregados ${products.length} produto(s) via ${sourceUsed}\n`,
  );

  if (products.length === 0) {
    process.stdout.write('[merchant:audit] nada para auditar — saindo.\n');
    process.exit(0);
  }

  const transformOpts = {
    shopDomain: args.shopDomain,
    contentLanguage: args.contentLanguage,
    feedLabel: args.feedLabel,
    defaultAvailability: 'in_stock' as const,
    defaultPrice: { amount: '0.00', currencyCode: 'USD' },
  };

  const rowScores = products.map((p) => {
    const { row, warnings } = productToFeedRow(p, transformOpts);
    const validation = validateFeedRow(row);
    return scoreRow({ row, validation, warnings });
  });

  const summary = summarizeAudit(rowScores);

  const report = await writeAuditReport({
    tenantId: args.tenant,
    source: sourceUsed,
    rowScores,
    summary,
  });

  process.stdout.write(
    `[merchant:audit] score médio: ${summary.averageScore}/100 — ` +
      `🟢 ${summary.greenCount} · 🟡 ${summary.yellowCount} · 🔴 ${summary.redCount}\n`,
  );
  process.stdout.write(
    `[merchant:audit] findings: 🔴 ${summary.bySeverity.critical} crit · ` +
      `🟠 ${summary.bySeverity.high} high · ` +
      `🟡 ${summary.bySeverity.medium} medium · ` +
      `🔵 ${summary.bySeverity.low} low\n`,
  );
  process.stdout.write(`[merchant:audit] report: ${report.markdownPath}\n`);
  process.stdout.write(`[merchant:audit] json:   ${report.jsonPath}\n`);

  if (args.capture) {
    const overall: 'green' | 'yellow' | 'red' =
      summary.redCount > 0 ? 'red' : summary.yellowCount > summary.greenCount ? 'yellow' : 'green';
    const slugTenant = args.tenant.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const cap = await captureRun({
      kind: 'audit',
      slug: `merchant-audit-${slugTenant}-${sourceUsed}`.slice(0, 60),
      result: overall,
      title: `Merchant audit (${sourceUsed}, ${products.length} SKUs, tenant=${args.tenant})`,
      source: 'agent:catalog-feed-ops',
      tags: ['merchant', 'audit', 'catalog', overall],
      body: {
        context: `pnpm merchant:audit --source=${sourceUsed} avaliou ${products.length} SKUs.`,
        whatHappened: [
          `Fonte: ${sourceUsed} (${products.length} SKUs).`,
          `Score médio: ${summary.averageScore}/100.`,
          `Distribuição: 🟢 ${summary.greenCount} · 🟡 ${summary.yellowCount} · 🔴 ${summary.redCount}.`,
          `Findings: ${summary.bySeverity.critical} crit / ${summary.bySeverity.high} high / ${summary.bySeverity.medium} med / ${summary.bySeverity.low} low.`,
        ],
        findings: summary.topFindings.map(
          (f) => `[${f.severity}] ${f.code} — ${f.count} ocorrência(s)`,
        ),
        impact:
          summary.redCount > 0
            ? `${summary.redCount} SKU(s) em vermelho — corrigir antes de submeter ao GMC.`
            : `${summary.greenCount}/${summary.totalRows} SKU(s) prontos para submissão.`,
        references: [report.markdownPath, report.jsonPath],
      },
      sessionLogLine: `merchant:audit (${sourceUsed}, ${args.tenant}): score médio ${summary.averageScore} — ${summary.redCount} red, ${summary.yellowCount} yellow, ${summary.greenCount} green.`,
    });
    process.stdout.write(`[merchant:audit] capture → ${cap.summaryPath}\n`);
  }

  // Exit 1 se houver SKU red — útil em CI futuro.
  if (summary.redCount > 0) process.exit(1);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[merchant:audit] erro: ${msg}\n`);
  process.exit(1);
});
