import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { writeDryRunReport } from './dry-run.js';
import { productToFeedRow, validateFeedRow } from './feed-row.js';

let tmp = '';

beforeEach(async () => {
  tmp = await fs.mkdtemp(join(tmpdir(), 'merchant-dry-run-test-'));
});

afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

describe('writeDryRunReport', () => {
  it('escreve JSON + Markdown e retorna summary', async () => {
    const r1 = productToFeedRow(
      {
        id: 'gid://shopify/Product/1',
        handle: 'p1',
        title: 'P1',
        status: 'ACTIVE',
        updatedAt: '2026-05-23T00:00:00Z',
        descriptionHtml: '<p>desc</p>',
        price: { amount: '10.00', currencyCode: 'USD' },
        imageUrl: 'https://cdn.acme.com/p1.jpg',
      },
      { shopDomain: 'acme.myshopify.com', contentLanguage: 'en', feedLabel: 'US' },
    );

    const r2 = productToFeedRow(
      {
        id: 'gid://shopify/Product/2',
        handle: 'p2',
        title: 'P2',
        status: 'ACTIVE',
        updatedAt: '2026-05-23T00:00:00Z',
      },
      { shopDomain: 'acme.myshopify.com', contentLanguage: 'en', feedLabel: 'US' },
    );
    // r2 vai falhar — sem price, sem imageUrl etc.

    const result = await writeDryRunReport({
      rows: [r1.row, r2.row],
      validations: [validateFeedRow(r1.row), validateFeedRow(r2.row)],
      warningsPerRow: [r1.warnings, r2.warnings],
      tenantId: 'tenant-test',
      outDir: tmp,
    });

    expect(result.okCount).toBe(1);
    // r2 sem price + sem defaultPrice → amount '0.00' rejeitado por schema (refine > 0)
    expect(result.failCount).toBe(1);
    expect(result.warningCount).toBeGreaterThan(0);

    const json = JSON.parse(await fs.readFile(result.jsonPath, 'utf8'));
    expect(json.summary.total).toBe(2);
    expect(json.rows).toHaveLength(2);

    const md = await fs.readFile(result.markdownPath, 'utf8');
    expect(md).toMatch(/# Merchant dry-run/);
    expect(md).toMatch(/tenant-test/);
    expect(md).toMatch(/\| 1 \| `p1` \|/);
  });

  it('summary com todas as rows falhando', async () => {
    const result = await writeDryRunReport({
      rows: [],
      validations: [{ ok: false, errors: [{ path: 'fake', message: 'bad' }] }],
      warningsPerRow: [['w1']],
      tenantId: 't',
      outDir: tmp,
    });
    expect(result.failCount).toBe(1);
    expect(result.warningCount).toBe(1);
  });
});
