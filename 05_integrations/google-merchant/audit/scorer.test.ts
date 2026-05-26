import { describe, expect, it } from 'vitest';
import type { FeedRow, ValidationResult } from '../client/feed-row.js';
import { scoreRow, summarizeAudit } from './scorer.js';

function makeRow(overrides: Partial<FeedRow> = {}): FeedRow {
  return {
    id: 'online:en:US:test-offer',
    channel: 'online',
    contentLanguage: 'en',
    feedLabel: 'US',
    offerId: 'test-offer',
    // Brand "Acme" prefix incluído para passar a regra title:no-brand (sempre-on).
    title: 'Acme Classic Cotton Tee — Heavyweight 100% Organic',
    description:
      '100% organic cotton t-shirt. Pre-shrunk, reinforced stitch at shoulders and hem. ' +
      'Pigment dyed for soft hand-feel. Available in 4 colors. Sized M to XL. Made in Brazil.',
    link: 'https://acme.test/products/test-offer',
    imageLink: 'https://acme.test/products/test-offer.jpg',
    availability: 'in_stock',
    price: { amount: '29.90', currencyCode: 'USD' },
    brand: 'Acme',
    gtin: '0012345678905',
    mpn: 'TEE-001',
    googleProductCategory: '212',
    productTypes: ['T-Shirts'],
    ...overrides,
  };
}

const okValidation: ValidationResult = { ok: true, errors: [] };

describe('scoreRow', () => {
  it('row perfeita score = 100 / band green', () => {
    const r = scoreRow({ row: makeRow(), validation: okValidation, warnings: [] });
    expect(r.score).toBe(100);
    expect(r.band).toBe('green');
    expect(r.findings).toHaveLength(0);
  });

  it('row com validation error critical reduz score em 40', () => {
    const row = makeRow({ title: '' });
    const validation: ValidationResult = {
      ok: false,
      errors: [{ path: 'title', message: 'title máx 150 chars (Google Merchant)' }],
    };
    const r = scoreRow({ row, validation, warnings: [] });
    expect(r.score).toBeLessThanOrEqual(60);
    expect(r.findings.some((f) => f.severity === 'critical')).toBe(true);
    expect(r.findings.some((f) => f.field === 'title')).toBe(true);
  });

  it('imageLink placeholder gera finding critical', () => {
    const r = scoreRow({
      row: makeRow(),
      validation: okValidation,
      warnings: ['imageLink placeholder gerado a partir do handle'],
    });
    expect(r.findings.some((f) => f.code === 'imageLink:generated-placeholder')).toBe(true);
    expect(r.findings.find((f) => f.code === 'imageLink:generated-placeholder')?.severity).toBe(
      'critical',
    );
  });

  it('descrição derivada do title gera finding medium', () => {
    const r = scoreRow({
      row: makeRow({ description: 'Short' }),
      validation: okValidation,
      warnings: ['descrição derivada do title (descriptionHtml ausente)'],
    });
    expect(r.findings.some((f) => f.code === 'description:derived-from-title')).toBe(true);
  });

  it('row sem brand/gtin gera findings medium', () => {
    const r = scoreRow({
      row: makeRow({ brand: null, gtin: null }),
      validation: okValidation,
      warnings: [],
    });
    expect(r.findings.some((f) => f.code === 'brand:missing')).toBe(true);
    expect(r.findings.some((f) => f.code === 'gtin:missing')).toBe(true);
    expect(r.score).toBeLessThan(100);
  });

  it('high-risk keyword gera finding high', () => {
    const r = scoreRow({
      row: makeRow({ title: 'Miracle organic tee — best in the world' }),
      validation: okValidation,
      warnings: [],
    });
    expect(r.findings.some((f) => f.severity === 'high' && f.code.startsWith('claim:risk'))).toBe(
      true,
    );
  });

  it('title curto gera finding medium', () => {
    const r = scoreRow({
      row: makeRow({ title: 'Tee' }),
      validation: okValidation,
      warnings: [],
    });
    expect(r.findings.some((f) => f.code === 'title:too-short')).toBe(true);
  });

  it('score nunca cai abaixo de 0', () => {
    const validation: ValidationResult = {
      ok: false,
      errors: Array.from({ length: 20 }, (_, i) => ({
        path: `field${i}`,
        message: 'invalid',
      })),
    };
    const r = scoreRow({ row: makeRow(), validation, warnings: [] });
    expect(r.score).toBe(0);
    expect(r.band).toBe('red');
  });

  it('band green ≥ 80, yellow 50-79, red < 50', () => {
    const rGreen = scoreRow({
      row: makeRow({ mpn: null }),
      validation: okValidation,
      warnings: [],
    });
    expect(rGreen.band).toBe('green');

    const rYellow = scoreRow({
      row: makeRow({ brand: null, gtin: null, googleProductCategory: null, description: 'short' }),
      validation: okValidation,
      warnings: ['descrição derivada do title (descriptionHtml ausente)'],
    });
    expect(rYellow.band).toBe('yellow');

    const rRed = scoreRow({
      row: makeRow({ description: 'x' }),
      validation: {
        ok: false,
        errors: [
          { path: 'imageLink', message: 'invalid URL' },
          { path: 'price.amount', message: 'must be > 0' },
        ],
      },
      warnings: ['imageLink placeholder gerado a partir do handle'],
    });
    expect(rRed.band).toBe('red');
  });

  // ===== N20.1 — regras evolutivas vindas do run real Incluo (N26) =====

  it('title:no-brand fires regardless of title length when brand absent', () => {
    const r = scoreRow({
      row: makeRow({ title: 'Curto', brand: 'Acme' }),
      validation: okValidation,
      warnings: [],
    });
    // Mesmo com title curto (< 70 chars), regra title:no-brand dispara.
    expect(r.findings.some((f) => f.code === 'title:no-brand')).toBe(true);
  });

  it('title:no-brand NÃO fires quando brand está no título', () => {
    const r = scoreRow({
      row: makeRow({ title: 'Acme Pequeno Tee', brand: 'Acme' }),
      validation: okValidation,
      warnings: [],
    });
    expect(r.findings.some((f) => f.code === 'title:no-brand')).toBe(false);
  });

  it('description terminando em "..." gera description:truncated (low), não description:too-short', () => {
    const r = scoreRow({
      row: makeRow({ description: 'Short desc...' }),
      validation: okValidation,
      warnings: [],
    });
    expect(r.findings.some((f) => f.code === 'description:truncated')).toBe(true);
    expect(r.findings.some((f) => f.code === 'description:too-short')).toBe(false);
    expect(r.findings.find((f) => f.code === 'description:truncated')?.severity).toBe('low');
  });

  it('description terminando em "…" (single char) também trata como truncated', () => {
    const r = scoreRow({
      row: makeRow({ description: 'Short with ellipsis…' }),
      validation: okValidation,
      warnings: [],
    });
    expect(r.findings.some((f) => f.code === 'description:truncated')).toBe(true);
  });

  it('gtin:missing é low quando googleProductCategory = 3793 (Educational Toys)', () => {
    const r = scoreRow({
      row: makeRow({ gtin: null, googleProductCategory: '3793' }),
      validation: okValidation,
      warnings: [],
    });
    const gtinFinding = r.findings.find((f) => f.code === 'gtin:missing');
    expect(gtinFinding?.severity).toBe('low');
  });

  it('gtin:missing é medium quando googleProductCategory diferente', () => {
    const r = scoreRow({
      row: makeRow({ gtin: null, googleProductCategory: '5872' }),
      validation: okValidation,
      warnings: [],
    });
    const gtinFinding = r.findings.find((f) => f.code === 'gtin:missing');
    expect(gtinFinding?.severity).toBe('medium');
  });

  it('gtin:missing é medium quando googleProductCategory ausente (default behavior preserved)', () => {
    const r = scoreRow({
      row: makeRow({ gtin: null, googleProductCategory: null }),
      validation: okValidation,
      warnings: [],
    });
    const gtinFinding = r.findings.find((f) => f.code === 'gtin:missing');
    expect(gtinFinding?.severity).toBe('medium');
  });

  // ===== N20.2 — claims terapêuticos PT-BR + handle scanning (audit Incluo 2026-05-26) =====

  it('claim terapêutico em description dispara finding high (ANVISA/CONAR/CDC)', () => {
    const r = scoreRow({
      row: makeRow({
        description: 'Brinquedo educativo que ajuda no manejo de autismo e TDAH em crianças.',
      }),
      validation: okValidation,
      warnings: [],
    });
    const hit = r.findings.find((f) => f.code.startsWith('claim:therapeutic'));
    expect(hit).toBeDefined();
    expect(hit?.severity).toBe('high');
  });

  it('claim terapêutico no link/URL dispara finding high mesmo com title/description limpos', () => {
    const r = scoreRow({
      row: makeRow({
        title: 'Acme Cubo Fidget - Foco e Conforto',
        description:
          'Cubo de manipulação com 12 lados texturizados. Material ABS. Ideal para uso recreativo.',
        link: 'https://acme.test/products/12-lados-fidget-cubo-alivia-estresse-anti-depressao-tdah-autismo',
      }),
      validation: okValidation,
      warnings: [],
    });
    const hit = r.findings.find((f) => f.code.startsWith('link:therapeutic-claim'));
    expect(hit).toBeDefined();
    expect(hit?.severity).toBe('high');
    expect(hit?.field).toBe('link');
  });

  it('link limpo NÃO dispara link:therapeutic-claim', () => {
    const r = scoreRow({
      row: makeRow({
        link: 'https://acme.test/products/cubo-fidget-12-lados-foco-conforto',
      }),
      validation: okValidation,
      warnings: [],
    });
    expect(r.findings.some((f) => f.code.startsWith('link:therapeutic-claim'))).toBe(false);
  });

  it('keywords PT-BR de claim terapêutico são case-insensitive', () => {
    for (const variant of ['AUTISMO', 'TDAH', 'Ansiedade', 'Depressão', 'alívio']) {
      const r = scoreRow({
        row: makeRow({ description: `texto com ${variant} no meio.` }),
        validation: okValidation,
        warnings: [],
      });
      expect(
        r.findings.some((f) => f.code.startsWith('claim:therapeutic')),
        `variant "${variant}" should match`,
      ).toBe(true);
    }
  });

  it('produto sem claim terapêutico não dispara nenhuma finding N20.2', () => {
    const r = scoreRow({
      row: makeRow({
        description:
          'Brinquedo de madeira para alinhavo. Desenvolve coordenação motora fina por meio do brincar.',
        link: 'https://acme.test/products/contas-madeira-alinhavo',
      }),
      validation: okValidation,
      warnings: [],
    });
    expect(r.findings.some((f) => f.code.startsWith('claim:therapeutic'))).toBe(false);
    expect(r.findings.some((f) => f.code.startsWith('link:therapeutic-claim'))).toBe(false);
  });
});

describe('summarizeAudit', () => {
  it('rowScores vazio retorna stats zeradas', () => {
    const s = summarizeAudit([]);
    expect(s.totalRows).toBe(0);
    expect(s.averageScore).toBe(0);
    expect(s.topFindings).toHaveLength(0);
  });

  it('agrega contagens por band corretamente', () => {
    const r1 = scoreRow({ row: makeRow(), validation: okValidation, warnings: [] });
    const r2 = scoreRow({ row: makeRow({ brand: null }), validation: okValidation, warnings: [] });
    const r3 = scoreRow({
      row: makeRow({ description: 'x' }),
      validation: {
        ok: false,
        errors: [{ path: 'imageLink', message: 'invalid' }],
      },
      warnings: ['imageLink placeholder gerado a partir do handle'],
    });
    const s = summarizeAudit([r1, r2, r3]);
    expect(s.totalRows).toBe(3);
    expect(s.greenCount).toBeGreaterThanOrEqual(1);
    expect(s.redCount + s.yellowCount).toBeGreaterThanOrEqual(1);
  });

  it('topFindings ordena por frequência', () => {
    const rows = Array.from({ length: 5 }, () =>
      scoreRow({
        row: makeRow({ brand: null, gtin: null }),
        validation: okValidation,
        warnings: [],
      }),
    );
    const s = summarizeAudit(rows);
    const top = s.topFindings[0];
    expect(top?.count).toBeGreaterThanOrEqual(5);
  });

  it('bySeverity conta total de findings por nível', () => {
    const r = scoreRow({
      row: makeRow({ brand: null, gtin: null }),
      validation: okValidation,
      warnings: [],
    });
    const s = summarizeAudit([r, r]);
    expect(s.bySeverity.medium).toBeGreaterThanOrEqual(4);
  });
});
