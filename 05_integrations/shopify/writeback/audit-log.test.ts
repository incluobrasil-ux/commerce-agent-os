import { describe, expect, it } from 'vitest';
import { applyRevisions } from './apply-revisions.js';
import { buildAuditEntry, buildAuditFilename, renderAuditMarkdown } from './audit-log.js';
import type { ParsedComplianceFile } from './compliance-parser.js';

const parsedSample: ParsedComplianceFile = {
  label: 'contas-madeira-pdp-review',
  overallSeverity: 'high',
  generatedAt: '2026-05-26T17:47:12.623Z',
  runId: 'run-xyz',
  revisions: [{ original: 'foo', suggested: 'bar', reason: 'r' }],
  legalRiskCount: 5,
};

describe('buildAuditEntry', () => {
  it('preenche todos os campos obrigatórios', () => {
    const result = applyRevisions('foo baz', parsedSample.revisions);
    const entry = buildAuditEntry({
      mode: 'dry-run',
      tenantId: 'incluo-tenant',
      storeId: 'incluo',
      shop: 'incluobrasil.myshopify.com',
      productHandle: 'conjunto-montessori',
      productId: 'gid://shopify/Product/1',
      field: 'descriptionHtml',
      sourcePath: '/abs/path/to/compliance.md',
      parsed: parsedSample,
      result,
      now: new Date('2026-05-26T20:00:00Z'),
    });
    expect(entry.mode).toBe('dry-run');
    expect(entry.tenantId).toBe('incluo-tenant');
    expect(entry.storeId).toBe('incluo');
    expect(entry.productHandle).toBe('conjunto-montessori');
    expect(entry.field).toBe('descriptionHtml');
    expect(entry.source.runId).toBe('run-xyz');
    expect(entry.source.overallSeverity).toBe('high');
    expect(entry.apply.appliedCount).toBe(1);
    expect(entry.apply.changed).toBe(true);
    expect(entry.ts).toBe('2026-05-26T20:00:00.000Z');
  });

  it('inclui shopifyResponse quando passado', () => {
    const result = applyRevisions('foo', parsedSample.revisions);
    const entry = buildAuditEntry({
      mode: 'apply',
      tenantId: 't',
      storeId: 's',
      shop: 's.myshopify.com',
      productHandle: 'h',
      productId: 'gid://shopify/Product/9',
      field: 'descriptionHtml',
      sourcePath: '/p',
      parsed: parsedSample,
      result,
      shopifyResponse: {
        productId: 'gid://shopify/Product/9',
        updatedAt: '2026-05-26T21:00:00Z',
        userErrors: [],
      },
    });
    expect(entry.shopifyResponse?.productId).toBe('gid://shopify/Product/9');
    expect(entry.shopifyResponse?.userErrors).toEqual([]);
  });

  it('exclui shopifyResponse em dry-run sem resposta', () => {
    const result = applyRevisions('foo', parsedSample.revisions);
    const entry = buildAuditEntry({
      mode: 'dry-run',
      tenantId: 't',
      storeId: 's',
      shop: 's.myshopify.com',
      productHandle: 'h',
      productId: null,
      field: 'descriptionHtml',
      sourcePath: '/p',
      parsed: parsedSample,
      result,
    });
    expect(entry.shopifyResponse).toBeUndefined();
  });

  it('trunca beforeExcerpt e afterExcerpt em 500 chars', () => {
    const long = 'x'.repeat(2000);
    const result = applyRevisions(long, []);
    const entry = buildAuditEntry({
      mode: 'dry-run',
      tenantId: 't',
      storeId: 's',
      shop: 's',
      productHandle: 'h',
      productId: null,
      field: 'descriptionHtml',
      sourcePath: '/p',
      parsed: parsedSample,
      result,
    });
    expect(entry.beforeExcerpt.length).toBeLessThanOrEqual(500);
    expect(entry.beforeExcerpt.endsWith('…')).toBe(true);
  });
});

describe('renderAuditMarkdown', () => {
  it('inclui seções obrigatórias', () => {
    const result = applyRevisions('foo baz', parsedSample.revisions);
    const entry = buildAuditEntry({
      mode: 'dry-run',
      tenantId: 'incluo-tenant',
      storeId: 'incluo',
      shop: 's.myshopify.com',
      productHandle: 'conjunto-montessori',
      productId: 'gid://shopify/Product/1',
      field: 'descriptionHtml',
      sourcePath: '/p',
      parsed: parsedSample,
      result,
    });
    const md = renderAuditMarkdown(entry);
    expect(md).toContain('# Shopify writeback — conjunto-montessori');
    expect(md).toContain('**Modo:** DRY-RUN');
    expect(md).toContain('## Source');
    expect(md).toContain('## Apply summary');
    expect(md).toContain('## Before excerpt');
    expect(md).toContain('## After excerpt');
    expect(md).not.toContain('## Shopify response');
  });

  it('inclui Shopify response e userErrors quando presente', () => {
    const result = applyRevisions('foo', parsedSample.revisions);
    const entry = buildAuditEntry({
      mode: 'apply',
      tenantId: 't',
      storeId: 's',
      shop: 's',
      productHandle: 'h',
      productId: 'gid://shopify/Product/9',
      field: 'descriptionHtml',
      sourcePath: '/p',
      parsed: parsedSample,
      result,
      shopifyResponse: {
        productId: 'gid://shopify/Product/9',
        updatedAt: '2026-05-26T21:00:00Z',
        userErrors: [{ field: ['input', 'descriptionHtml'], message: 'Too long' }],
      },
    });
    const md = renderAuditMarkdown(entry);
    expect(md).toContain('## Shopify response');
    expect(md).toContain('[input.descriptionHtml] Too long');
  });
});

describe('buildAuditFilename', () => {
  it('gera caminho relativo com timestamp + handle slugificado', () => {
    const path = buildAuditFilename('Conjunto Montessori!', new Date('2026-05-26T20:30:45Z'));
    expect(path).toBe('shopify-writeback/20260526-203045-conjunto-montessori-.md');
  });

  it('trunca handle a 40 chars', () => {
    const longHandle = 'a'.repeat(100);
    const path = buildAuditFilename(longHandle, new Date('2026-05-26T20:30:45Z'));
    expect(path).toMatch(/^shopify-writeback\/20260526-203045-a{40}\.md$/);
  });
});
