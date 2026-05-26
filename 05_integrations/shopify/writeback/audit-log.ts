// Audit log de writebacks Shopify. Cada entrada (dry-run OU apply) gera 1 markdown
// em `vault/tenants/<t>/stores/<s>/shopify-writeback/<ts>-<handle>.md` com o
// payload completo para auditoria humana.
//
// Crítico: dry-run também é registrado — quem audita precisa ver o histórico de
// intenções, não só de aplicações.

import type { ApplyResult } from './apply-revisions.js';
import type { ParsedComplianceFile } from './compliance-parser.js';

export interface WritebackAuditEntry {
  ts: string; // ISO 8601
  mode: 'dry-run' | 'apply';
  tenantId: string;
  storeId: string;
  shop: string;
  productHandle: string;
  productId: string | null;
  field: string;
  source: {
    type: 'compliance-md';
    path: string;
    runId: string | null;
    label: string | null;
    overallSeverity: string | null;
  };
  apply: {
    appliedCount: number;
    notFoundCount: number;
    placeholderSkippedCount: number;
    changed: boolean;
  };
  shopifyResponse?: {
    productId: string | null;
    updatedAt: string | null;
    userErrors: Array<{ field: string[] | null; message: string }>;
  };
  beforeExcerpt: string; // primeiros 500 chars
  afterExcerpt: string;
}

export function buildAuditEntry(params: {
  mode: 'dry-run' | 'apply';
  tenantId: string;
  storeId: string;
  shop: string;
  productHandle: string;
  productId: string | null;
  field: string;
  sourcePath: string;
  parsed: ParsedComplianceFile;
  result: ApplyResult;
  shopifyResponse?: WritebackAuditEntry['shopifyResponse'];
  now?: Date;
}): WritebackAuditEntry {
  const now = params.now ?? new Date();
  return {
    ts: now.toISOString(),
    mode: params.mode,
    tenantId: params.tenantId,
    storeId: params.storeId,
    shop: params.shop,
    productHandle: params.productHandle,
    productId: params.productId,
    field: params.field,
    source: {
      type: 'compliance-md',
      path: params.sourcePath,
      runId: params.parsed.runId,
      label: params.parsed.label,
      overallSeverity: params.parsed.overallSeverity,
    },
    apply: {
      appliedCount: params.result.appliedCount,
      notFoundCount: params.result.notFoundCount,
      placeholderSkippedCount: params.result.placeholderSkippedCount,
      changed: params.result.changed,
    },
    ...(params.shopifyResponse ? { shopifyResponse: params.shopifyResponse } : {}),
    beforeExcerpt: excerpt(params.result.before),
    afterExcerpt: excerpt(params.result.after),
  };
}

function excerpt(s: string, n = 500): string {
  if (s.length <= n) return s;
  return `${s.slice(0, n - 1)}…`;
}

export function renderAuditMarkdown(entry: WritebackAuditEntry): string {
  const lines: string[] = [];
  lines.push(`# Shopify writeback — ${entry.productHandle}`);
  lines.push('');
  lines.push(`- **Modo:** ${entry.mode.toUpperCase()}`);
  lines.push(`- **Timestamp:** ${entry.ts}`);
  lines.push(`- **Tenant:** ${entry.tenantId}`);
  lines.push(`- **Store:** ${entry.storeId}`);
  lines.push(`- **Shop domain:** ${entry.shop}`);
  lines.push(`- **Product handle:** ${entry.productHandle}`);
  lines.push(`- **Product ID:** ${entry.productId ?? '(unresolved)'}`);
  lines.push(`- **Field:** ${entry.field}`);
  lines.push('');
  lines.push('## Source');
  lines.push('');
  lines.push(`- Type: ${entry.source.type}`);
  lines.push(`- Path: ${entry.source.path}`);
  lines.push(`- Compliance run ID: ${entry.source.runId ?? '(none)'}`);
  lines.push(`- Compliance label: ${entry.source.label ?? '(none)'}`);
  lines.push(`- Compliance overall severity: ${entry.source.overallSeverity ?? '(none)'}`);
  lines.push('');
  lines.push('## Apply summary');
  lines.push('');
  lines.push(`- Applied: ${entry.apply.appliedCount}`);
  lines.push(`- Not found: ${entry.apply.notFoundCount}`);
  lines.push(`- Placeholder-skipped: ${entry.apply.placeholderSkippedCount}`);
  lines.push(`- Field changed: ${entry.apply.changed}`);
  lines.push('');
  if (entry.shopifyResponse) {
    lines.push('## Shopify response');
    lines.push('');
    lines.push(`- Returned product ID: ${entry.shopifyResponse.productId ?? '(null)'}`);
    lines.push(`- Returned updatedAt: ${entry.shopifyResponse.updatedAt ?? '(null)'}`);
    lines.push(`- userErrors: ${entry.shopifyResponse.userErrors.length}`);
    if (entry.shopifyResponse.userErrors.length > 0) {
      for (const err of entry.shopifyResponse.userErrors) {
        const field = err.field?.join('.') ?? '(no field)';
        lines.push(`  - [${field}] ${err.message}`);
      }
    }
    lines.push('');
  }
  lines.push('## Before excerpt');
  lines.push('');
  lines.push('```');
  lines.push(entry.beforeExcerpt);
  lines.push('```');
  lines.push('');
  lines.push('## After excerpt');
  lines.push('');
  lines.push('```');
  lines.push(entry.afterExcerpt);
  lines.push('```');
  lines.push('');
  lines.push('---');
  lines.push('_Gerado por `@cao/integration-shopify/writeback`._');
  return lines.join('\n');
}

export function buildAuditFilename(productHandle: string, now: Date = new Date()): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  const ts =
    `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}` +
    `-${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}`;
  const slug = productHandle
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);
  return `shopify-writeback/${ts}-${slug}.md`;
}
