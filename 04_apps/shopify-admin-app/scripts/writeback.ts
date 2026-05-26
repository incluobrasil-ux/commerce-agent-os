#!/usr/bin/env node
// Loop fechado: compliance → diff → (dry-run | apply) → audit log.
//
// Uso:
//   pnpm shopify:writeback \
//     --tenant=<id> --store=<id> \
//     --revisions-file=<path/to/compliance.md> \
//     --product-handle=<handle> \
//     [--field=descriptionHtml]   # default
//     [--apply]                   # GATE EXPLÍCITO. Default = dry-run.
//
// Por que dry-run é default:
//   - Revisões de compliance são triagem, NÃO substituto de revisão jurídica.
//   - Apply silencioso pode publicar conteúdo arriscado.
//   - Operador deve ver o diff antes de --apply.
//
// Pré-req --apply: SHOPIFY_SHOP + SHOPIFY_ADMIN_TOKEN em .env.local.
// Dry-run: SHOPIFY_SHOP + SHOPIFY_ADMIN_TOKEN são opcionais — se ausentes,
// roda só o parser/diff (não busca produto remoto) e produz audit log.

import { promises as fs } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { assertTenantStoreContext } from '@cao/core';
import {
  AdminGraphQLClient,
  ShopifyAuthError,
  applyRevisions,
  buildAuditEntry,
  buildAuditFilename,
  getProductByHandle,
  isValidShopDomain,
  parseComplianceMarkdown,
  renderApplyDiff,
  renderAuditMarkdown,
  updateProduct,
} from '@cao/integration-shopify';

interface CliArgs {
  tenantId: string;
  storeId: string;
  revisionsFile: string;
  productHandle: string;
  field: 'descriptionHtml' | 'title';
  apply: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    tenantId: '',
    storeId: '',
    revisionsFile: '',
    productHandle: '',
    field: 'descriptionHtml',
    apply: false,
  };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--tenant=')) args.tenantId = a.slice('--tenant='.length);
    else if (a.startsWith('--store=')) args.storeId = a.slice('--store='.length);
    else if (a.startsWith('--revisions-file='))
      args.revisionsFile = a.slice('--revisions-file='.length);
    else if (a.startsWith('--product-handle='))
      args.productHandle = a.slice('--product-handle='.length);
    else if (a.startsWith('--field=')) {
      const f = a.slice('--field='.length);
      if (f !== 'descriptionHtml' && f !== 'title') {
        fail(`--field deve ser descriptionHtml ou title (got: ${f})`);
      }
      args.field = f;
    } else if (a === '--apply') args.apply = true;
    else fail(`Flag desconhecida: ${a}`);
  }
  if (!args.tenantId) fail('--tenant é obrigatório');
  if (!args.storeId) fail('--store é obrigatório');
  if (!args.revisionsFile) fail('--revisions-file é obrigatório');
  if (!args.productHandle) fail('--product-handle é obrigatório');
  return args;
}

function fail(msg: string): never {
  process.stderr.write(`[shopify:writeback] ${msg}\n`);
  process.exit(2);
}

function log(line: string): void {
  process.stdout.write(`[shopify:writeback] ${line}\n`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  assertTenantStoreContext({ tenantId: args.tenantId, storeId: args.storeId }, 'shopify:writeback');

  const repoRoot = resolve(process.cwd());
  const sourcePath = resolve(args.revisionsFile);
  const md = await fs.readFile(sourcePath, 'utf8');
  const parsed = parseComplianceMarkdown(md);

  log(
    `parser: ${parsed.revisions.length} revisão(ões) | severity=${parsed.overallSeverity ?? 'n/a'} | label=${parsed.label ?? 'n/a'}`,
  );

  if (parsed.revisions.length === 0) {
    fail('Nenhuma revisão extraída do markdown — verifique formato do arquivo.');
  }
  if (parsed.overallSeverity === 'high') {
    log('⚠ severity=HIGH detectada. --apply requer revisão jurídica humana.');
  }

  const shop = process.env.SHOPIFY_SHOP?.trim();
  const accessToken = process.env.SHOPIFY_ADMIN_TOKEN?.trim();
  const hasCreds = Boolean(shop && accessToken);

  if (args.apply && !hasCreds) {
    fail('--apply exige SHOPIFY_SHOP + SHOPIFY_ADMIN_TOKEN em .env.local.');
  }
  if (args.apply && shop && !isValidShopDomain(shop)) {
    fail(`SHOPIFY_SHOP inválido: "${shop}". Esperado <slug>.myshopify.com.`);
  }

  // Busca produto remoto se possível. Em dry-run sem credenciais, usa o
  // markdown como fonte ÚNICA — parser só, nenhuma I/O remota.
  let beforeField = '';
  let productId: string | null = null;
  let client: AdminGraphQLClient | null = null;

  if (hasCreds && shop && accessToken && isValidShopDomain(shop)) {
    client = new AdminGraphQLClient({ shop, accessToken });
    log(`fetch: ${shop}/products/${args.productHandle}`);
    try {
      const product = await getProductByHandle(client, args.productHandle);
      if (!product) {
        fail(`Produto handle="${args.productHandle}" não encontrado em ${shop}.`);
      }
      productId = product.id;
      beforeField = args.field === 'title' ? product.title : product.descriptionHtml;
      log(`fetch: ok | id=${productId} | ${args.field}.length=${beforeField.length}`);
    } catch (err) {
      if (err instanceof ShopifyAuthError) {
        fail(
          `auth falhou: ${err.message}. Verifique SHOPIFY_ADMIN_TOKEN e scopes (write_products).`,
        );
      }
      throw err;
    }
  } else {
    log('SHOPIFY_SHOP/TOKEN ausentes — dry-run apenas do parser (sem fetch remoto).');
    beforeField = '(produto remoto não consultado — credenciais ausentes)';
  }

  const result = applyRevisions(beforeField, parsed.revisions);
  log(
    `diff: applied=${result.appliedCount} not-found=${result.notFoundCount} placeholder-skipped=${result.placeholderSkippedCount} changed=${result.changed}`,
  );
  process.stdout.write('\n');
  process.stdout.write(renderApplyDiff(result));
  process.stdout.write('\n\n');

  let shopifyResponse: Parameters<typeof buildAuditEntry>[0]['shopifyResponse'] | undefined;

  if (args.apply) {
    if (!result.changed) {
      log('⚠ apply: nada mudou (0 revisões aplicáveis) — nenhuma mutation enviada.');
    } else if (!client || !productId) {
      // Não deve ocorrer: já validamos hasCreds antes.
      fail('apply: cliente Shopify ou productId ausentes — estado inconsistente.');
    } else {
      log(`apply: enviando productUpdate para ${productId}...`);
      const updateInput = {
        id: productId,
        ...(args.field === 'title' ? { title: result.after } : { descriptionHtml: result.after }),
      };
      const res = await updateProduct(client, updateInput);
      shopifyResponse = {
        productId: res.product?.id ?? null,
        updatedAt: res.product?.updatedAt ?? null,
        userErrors: res.userErrors,
      };
      if (res.userErrors.length > 0) {
        for (const e of res.userErrors) {
          log(`apply userError: [${e.field?.join('.') ?? '?'}] ${e.message}`);
        }
        log(`apply: ${res.userErrors.length} userError(s) — produto NÃO foi atualizado.`);
      } else {
        log(`apply: ok | updatedAt=${res.product?.updatedAt}`);
      }
    }
  } else {
    log('mode: DRY-RUN (use --apply para enviar mutation a Shopify)');
  }

  // Audit log SEMPRE (dry-run inclusive) — histórico de intenções importa.
  const entry = buildAuditEntry({
    mode: args.apply ? 'apply' : 'dry-run',
    tenantId: args.tenantId,
    storeId: args.storeId,
    shop: shop ?? '(none)',
    productHandle: args.productHandle,
    productId,
    field: args.field,
    sourcePath: sourcePath,
    parsed,
    result,
    ...(shopifyResponse ? { shopifyResponse } : {}),
  });
  const auditRel = buildAuditFilename(args.productHandle);
  const auditAbs = resolve(
    repoRoot,
    '07_memory/vault/tenants',
    args.tenantId,
    'stores',
    args.storeId,
    auditRel,
  );
  await fs.mkdir(dirname(auditAbs), { recursive: true });
  await fs.writeFile(auditAbs, renderAuditMarkdown(entry), 'utf8');
  log(`audit → ${auditAbs}`);

  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[shopify:writeback] erro: ${msg}\n`);
  process.exit(1);
});
