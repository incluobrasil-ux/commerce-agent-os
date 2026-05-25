#!/usr/bin/env node
// Smoke real Shopify: lista até N produtos do dev store.
//
// Uso: pnpm shopify:list-products [--first=10]
//
// Pré-req em .env.local:
//   SHOPIFY_SHOP=acme.myshopify.com         (sem https://, sem barra)
//   SHOPIFY_ADMIN_TOKEN=shpat_xxxx...        (Admin API access token de Custom App)
//
// Como obter o token (custom app, caminho mais curto):
//   1. Admin do dev store → Settings → Apps and sales channels → Develop apps
//   2. Create an app → API credentials → Configure Admin API scopes
//      → marcar pelo menos `read_products` → Save
//   3. Install app → Reveal token once → copiar para .env.local

import {
  AdminGraphQLClient,
  ShopifyAuthError,
  isValidShopDomain,
  listProducts,
} from '@cao/integration-shopify';

interface CliArgs {
  first: number;
}

function parseArgs(argv: string[]): CliArgs {
  let first = 10;
  for (const a of argv.slice(2)) {
    if (a.startsWith('--first=')) {
      first = Number.parseInt(a.slice('--first='.length), 10);
      if (Number.isNaN(first) || first < 1) {
        fail(`--first inválido: ${a}`);
      }
    } else {
      fail(`Argumento desconhecido: ${a}`);
    }
  }
  return { first };
}

function fail(msg: string): never {
  process.stderr.write(`[shopify:list-products] ${msg}\n`);
  process.exit(2);
}

function skipped(msg: string): never {
  process.stdout.write(`[shopify:list-products] SKIPPED — ${msg}\n`);
  process.exit(0);
}

async function main(): Promise<void> {
  const { first } = parseArgs(process.argv);

  const shop = process.env.SHOPIFY_SHOP?.trim();
  const accessToken = process.env.SHOPIFY_ADMIN_TOKEN?.trim();

  if (!shop || !accessToken) {
    skipped(
      'SHOPIFY_SHOP ou SHOPIFY_ADMIN_TOKEN ausentes em .env.local.\n' +
        '[shopify:list-products] Veja instruções no topo de 04_apps/shopify-admin-app/scripts/list-products.ts.\n' +
        '[shopify:list-products] Nada quebrou; baseline continua válido.',
    );
  }
  if (!isValidShopDomain(shop)) {
    fail(
      `SHOPIFY_SHOP inválido: "${shop}". Esperado formato: <slug>.myshopify.com (sem https://, sem barra).`,
    );
  }

  process.stdout.write(`[shopify:list-products] consultando ${shop} (first=${first})...\n`);

  const client = new AdminGraphQLClient({ shop, accessToken });

  const startMs = Date.now();
  let result: Awaited<ReturnType<typeof listProducts>>;
  try {
    result = await listProducts(client, { first });
  } catch (err) {
    if (err instanceof ShopifyAuthError) {
      fail(
        `falha de autenticação: ${err.message}. Verifique SHOPIFY_ADMIN_TOKEN e os scopes da Custom App (precisa pelo menos read_products).`,
      );
    }
    throw err;
  }
  const wallMs = Date.now() - startMs;

  const lines = [
    `[shopify:list-products] ok em ${wallMs}ms`,
    `[shopify:list-products] ${result.items.length} produto(s) retornado(s); hasNextPage=${result.hasNextPage}`,
  ];
  process.stdout.write(`${lines.join('\n')}\n`);

  for (const p of result.items) {
    process.stdout.write(`  - ${p.handle} | ${p.title} | ${p.status} | ${p.updatedAt}\n`);
  }

  process.stdout.write('[shopify:list-products] OK\n');
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[shopify:list-products] erro: ${msg}\n`);
  process.exit(1);
});
