// Schema runtime + transformer + validator para Google Merchant feed rows.
// Aceita produto Shopify minimal e produz GMCProduct validado por zod.
// Tudo local — sem rede.

import { z } from 'zod';
import type { GMCChannel, GMCProduct, GMCProductId, Money } from '../types/index.js';

// ===== zod schema do GMCProduct (validação runtime do feed row) =====

const moneySchema = z.object({
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,4})?$/, 'amount deve ser número string (precision-safe)')
    .refine((v) => Number.parseFloat(v) > 0, 'amount deve ser > 0 (Google Merchant rejeita 0)'),
  currencyCode: z.string().length(3, 'currencyCode deve ser ISO 4217 (3 letras)'),
});

const availabilitySchema = z.enum(['in_stock', 'out_of_stock', 'preorder', 'backorder']);
const channelSchema = z.enum(['online', 'local']);

export const feedRowSchema = z.object({
  id: z.string().min(1),
  channel: channelSchema,
  contentLanguage: z.string().min(2).max(5),
  feedLabel: z.string().min(1).max(20),
  offerId: z.string().min(1).max(50),
  title: z.string().min(1).max(150, 'title máx 150 chars (Google Merchant)'),
  description: z.string().min(1).max(5000),
  link: z.string().url(),
  imageLink: z.string().url(),
  availability: availabilitySchema,
  price: moneySchema,
  brand: z.string().nullable(),
  gtin: z.string().nullable(),
  mpn: z.string().nullable(),
  googleProductCategory: z.string().nullable(),
  productTypes: z.array(z.string()),
});

export type FeedRowInput = z.input<typeof feedRowSchema>;
export type FeedRow = z.output<typeof feedRowSchema>;

export interface ValidationResult {
  ok: boolean;
  errors: Array<{ path: string; message: string }>;
}

export function validateFeedRow(row: unknown): ValidationResult {
  const r = feedRowSchema.safeParse(row);
  if (r.success) return { ok: true, errors: [] };
  return {
    ok: false,
    errors: r.error.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    })),
  };
}

// ===== Transformer: Shopify MinimalProduct → GMCProduct =====

/**
 * Subset do MinimalProduct do Shopify que precisamos. Não importamos direto
 * de @cao/integration-shopify para evitar circular dep — campos são compatíveis.
 */
export interface ShopifyProductInput {
  id: string;
  handle: string;
  title: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
  updatedAt: string;
  // Campos opcionais — caller preenche se tiver via query expandida ou hidrata depois.
  // `| undefined` explícito para coexistir com exactOptionalPropertyTypes.
  descriptionHtml?: string | undefined;
  vendor?: string | null | undefined;
  productType?: string | null | undefined;
  price?: { amount: string; currencyCode: string } | undefined;
  imageUrl?: string | undefined;
  availability?: 'in_stock' | 'out_of_stock' | 'preorder' | 'backorder' | undefined;
  gtin?: string | null | undefined;
  mpn?: string | null | undefined;
}

export interface TransformOptions {
  /** Domínio público da loja: `acme.myshopify.com` ou domínio custom. */
  shopDomain: string;
  /** ISO 639-1 do feed (ex.: "pt", "en"). */
  contentLanguage: string;
  /** Label do feed conforme configurado em GMC (ex.: "BR", "US"). */
  feedLabel: string;
  /** Channel — 'online' default. */
  channel?: GMCChannel;
  /** Default availability quando o produto não traz. */
  defaultAvailability?: 'in_stock' | 'out_of_stock';
  /** Default price quando produto não tem (usado p/ valida com placeholder). */
  defaultPrice?: Money;
  /** URL placeholder de imagem quando produto não tem. */
  defaultImageUrl?: string;
  /**
   * Map de productType (string exato Shopify) → GMC category ID (string).
   * Quando o productType do produto bate, googleProductCategory é preenchido
   * com o ID correspondente, evitando o finding `googleProductCategory:missing`.
   */
  gmcCategoryByProductType?: Record<string, string>;
  /**
   * Fallback GMC category ID quando productType não está no mapping (ou ausente).
   * Útil para catálogos majoritariamente em uma única categoria.
   */
  defaultGmcCategoryId?: string;
}

export interface TransformResult {
  row: FeedRow;
  warnings: string[];
}

/**
 * Converte produto Shopify para feed row Merchant. Aplica defaults para
 * campos obrigatórios faltantes (registra como warning, não erro).
 */
export function productToFeedRow(
  product: ShopifyProductInput,
  opts: TransformOptions,
): TransformResult {
  const warnings: string[] = [];
  const channel: GMCChannel = opts.channel ?? 'online';

  const offerId = product.handle.slice(0, 50);
  const id = `${channel}:${opts.contentLanguage}:${opts.feedLabel}:${offerId}`;

  const description = stripHtml(product.descriptionHtml ?? product.title);
  if (!product.descriptionHtml) {
    warnings.push('descrição derivada do title (descriptionHtml ausente)');
  }

  const link = `https://${opts.shopDomain}/products/${product.handle}`;

  let imageLink = product.imageUrl ?? opts.defaultImageUrl ?? '';
  if (!product.imageUrl) {
    warnings.push(
      product.imageUrl === undefined && !opts.defaultImageUrl
        ? 'imageLink vazio (Google Merchant exige) — vai falhar validação'
        : 'imageLink usou defaultImageUrl',
    );
  }
  if (!imageLink) {
    imageLink = `https://${opts.shopDomain}/products/${product.handle}.jpg`;
    warnings.push('imageLink placeholder gerado a partir do handle');
  }

  let availability = product.availability;
  if (!availability) {
    availability =
      product.status === 'ACTIVE' ? (opts.defaultAvailability ?? 'in_stock') : 'out_of_stock';
    warnings.push(`availability derivada do status Shopify (${product.status})`);
  }

  const price = product.price ?? opts.defaultPrice;
  if (!product.price) {
    warnings.push(
      opts.defaultPrice
        ? 'price ausente no produto — usou defaultPrice'
        : 'price ausente — row vai falhar validação',
    );
  }

  let googleProductCategory: string | null = null;
  if (opts.gmcCategoryByProductType && product.productType) {
    googleProductCategory = opts.gmcCategoryByProductType[product.productType] ?? null;
  }
  if (!googleProductCategory && opts.defaultGmcCategoryId) {
    googleProductCategory = opts.defaultGmcCategoryId;
  }

  const row: FeedRow = {
    id: id as GMCProductId,
    channel,
    contentLanguage: opts.contentLanguage,
    feedLabel: opts.feedLabel,
    offerId,
    title: product.title.slice(0, 150),
    description: description.slice(0, 5000),
    link,
    imageLink,
    availability,
    price: price ?? { amount: '0.00', currencyCode: 'USD' },
    brand: product.vendor ?? null,
    gtin: product.gtin ?? null,
    mpn: product.mpn ?? null,
    googleProductCategory,
    productTypes: product.productType ? [product.productType] : [],
  };

  return { row, warnings };
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

// ===== Helper: produz GMCProduct tipado a partir do row validado =====

export function toGMCProduct(row: FeedRow): GMCProduct {
  return row as unknown as GMCProduct;
}
