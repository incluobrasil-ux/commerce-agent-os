// Fixture interna de 3 produtos — usada quando `--from-fixture` ou quando
// credenciais Shopify não estão presentes. Permite o dry-run rodar 100% local.

import type { ShopifyProductInput } from '@cao/integration-google-merchant';

export const sampleProducts: ShopifyProductInput[] = [
  {
    id: 'gid://shopify/Product/sample-001',
    handle: 'classic-cotton-tee',
    title: 'Classic Cotton Tee',
    status: 'ACTIVE',
    updatedAt: '2026-05-23T10:00:00Z',
    descriptionHtml: '<p>Soft <strong>100% cotton</strong> t-shirt. Pre-shrunk. Regular fit.</p>',
    vendor: 'Acme Apparel',
    productType: 'T-Shirts',
    price: { amount: '29.90', currencyCode: 'USD' },
    imageUrl: 'https://cdn.acme.test/products/classic-cotton-tee.jpg',
    availability: 'in_stock',
    gtin: '0012345678905',
    mpn: 'TEE-CLASS-BLK-M',
  },
  {
    id: 'gid://shopify/Product/sample-002',
    handle: 'minimal-canvas-tote',
    title: 'Minimal Canvas Tote',
    status: 'ACTIVE',
    updatedAt: '2026-05-23T11:00:00Z',
    descriptionHtml: '<p>Heavy canvas tote bag with reinforced handles.</p>',
    vendor: 'Acme Goods',
    productType: 'Bags',
    price: { amount: '19.50', currencyCode: 'USD' },
    imageUrl: 'https://cdn.acme.test/products/minimal-canvas-tote.jpg',
    availability: 'in_stock',
    gtin: null,
    mpn: 'TOTE-CNV-NAT',
  },
  {
    id: 'gid://shopify/Product/sample-003',
    handle: 'limited-edition-sticker-pack',
    title: 'Limited Edition Sticker Pack',
    status: 'DRAFT',
    updatedAt: '2026-05-23T12:00:00Z',
    // Sem descriptionHtml, sem price → caso "campos faltando" para testar fallback/warnings
    vendor: null,
    productType: 'Accessories',
    gtin: null,
    mpn: null,
  },
];
