import { describe, expect, it } from 'vitest';
import {
  type ShopifyProductInput,
  type TransformOptions,
  productToFeedRow,
  validateFeedRow,
} from './feed-row.js';

const baseProduct: ShopifyProductInput = {
  id: 'gid://shopify/Product/1',
  handle: 'product-one',
  title: 'Sample Product',
  status: 'ACTIVE',
  updatedAt: '2026-05-23T12:00:00Z',
  descriptionHtml: '<p>A <strong>great</strong> product.</p>',
  vendor: 'Acme',
  productType: 'Apparel',
  price: { amount: '29.90', currencyCode: 'USD' },
  imageUrl: 'https://cdn.shopify.com/x.jpg',
  availability: 'in_stock',
};

const baseOpts: TransformOptions = {
  shopDomain: 'acme.myshopify.com',
  contentLanguage: 'en',
  feedLabel: 'US',
};

describe('productToFeedRow', () => {
  it('produz row válida com todos os campos preenchidos', () => {
    const r = productToFeedRow(baseProduct, baseOpts);
    expect(r.row.id).toBe('online:en:US:product-one');
    expect(r.row.title).toBe('Sample Product');
    expect(r.row.description).toBe('A great product.');
    expect(r.row.link).toBe('https://acme.myshopify.com/products/product-one');
    expect(r.row.price.amount).toBe('29.90');
    expect(r.row.brand).toBe('Acme');
    expect(r.warnings).toHaveLength(0);

    const v = validateFeedRow(r.row);
    expect(v.ok).toBe(true);
  });

  it('warnings quando descriptionHtml ausente', () => {
    const r = productToFeedRow({ ...baseProduct, descriptionHtml: undefined }, baseOpts);
    expect(r.warnings.some((w) => w.includes('descrição derivada'))).toBe(true);
  });

  it('derive availability do status quando product não traz', () => {
    const r = productToFeedRow(
      { ...baseProduct, availability: undefined, status: 'ARCHIVED' },
      baseOpts,
    );
    expect(r.row.availability).toBe('out_of_stock');
    expect(r.warnings.some((w) => w.includes('availability derivada'))).toBe(true);
  });

  it('respeita defaultPrice quando product.price ausente', () => {
    const r = productToFeedRow(
      { ...baseProduct, price: undefined },
      { ...baseOpts, defaultPrice: { amount: '0.00', currencyCode: 'USD' } },
    );
    expect(r.row.price.amount).toBe('0.00');
    expect(r.warnings.some((w) => w.includes('price ausente'))).toBe(true);
  });

  it('título e offerId truncados aos limites Merchant', () => {
    const longTitle = 'x'.repeat(300);
    const longHandle = 'y'.repeat(100);
    const r = productToFeedRow({ ...baseProduct, title: longTitle, handle: longHandle }, baseOpts);
    expect(r.row.title.length).toBe(150);
    expect(r.row.offerId.length).toBe(50);
  });

  it('id formato channel:lang:label:offerId', () => {
    const r = productToFeedRow(baseProduct, { ...baseOpts, channel: 'local' });
    expect(r.row.id).toMatch(/^local:en:US:/);
  });
});

describe('validateFeedRow', () => {
  it('aceita row completo válido', () => {
    const r = productToFeedRow(baseProduct, baseOpts);
    expect(validateFeedRow(r.row).ok).toBe(true);
  });

  it('rejeita amount com formato inválido', () => {
    const r = productToFeedRow(baseProduct, baseOpts);
    const v = validateFeedRow({ ...r.row, price: { amount: 'abc', currencyCode: 'USD' } });
    expect(v.ok).toBe(false);
    expect(v.errors.some((e) => e.path.includes('price.amount'))).toBe(true);
  });

  it('rejeita currency code com tamanho errado', () => {
    const r = productToFeedRow(baseProduct, baseOpts);
    const v = validateFeedRow({ ...r.row, price: { amount: '10.00', currencyCode: 'USDX' } });
    expect(v.ok).toBe(false);
  });

  it('rejeita link inválido', () => {
    const r = productToFeedRow(baseProduct, baseOpts);
    const v = validateFeedRow({ ...r.row, link: 'not-a-url' });
    expect(v.ok).toBe(false);
    expect(v.errors.some((e) => e.path === 'link')).toBe(true);
  });

  it('rejeita title vazio', () => {
    const r = productToFeedRow(baseProduct, baseOpts);
    const v = validateFeedRow({ ...r.row, title: '' });
    expect(v.ok).toBe(false);
  });
});
