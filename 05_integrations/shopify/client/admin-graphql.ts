// Cliente real Admin GraphQL — caminho mínimo para autenticar + ler dados.
// Sem OAuth completo: aceita accessToken já obtido (via custom app no admin
// do dev store OU via OAuth handshake — ver ../oauth/).
//
// API version pinada a 2025-01 (current stable). Atualizar exige decisão.

import { ShopifyAuthError, ShopifyGraphQLError, ShopifyRateLimitError } from '../errors/index.js';
import type { ShopifyProduct, ShopifyShopDomain } from '../types/index.js';

export const ADMIN_API_VERSION = '2025-01' as const;

export interface AdminGraphQLOptions {
  /** Domínio da loja: `acme.myshopify.com` (sem https://). */
  shop: string;
  /** Access token (custom app no admin OU resultado do OAuth). */
  accessToken: string;
  /** Substituível para teste (default: fetch global). */
  fetchImpl?: typeof fetch;
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; extensions?: Record<string, unknown> }>;
  extensions?: { cost?: Record<string, unknown> };
}

export class AdminGraphQLClient {
  private readonly shop: ShopifyShopDomain;
  private readonly accessToken: string;
  private readonly fetchImpl: typeof fetch;
  private readonly endpoint: string;

  constructor(opts: AdminGraphQLOptions) {
    this.shop = opts.shop as ShopifyShopDomain;
    this.accessToken = opts.accessToken;
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.endpoint = `https://${opts.shop}/admin/api/${ADMIN_API_VERSION}/graphql.json`;
  }

  async query<T = unknown>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const res = await this.fetchImpl(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
      },
      body: JSON.stringify({ query, ...(variables ? { variables } : {}) }),
    });

    if (res.status === 401 || res.status === 403) {
      throw new ShopifyAuthError(
        `Shopify ${res.status} on ${this.shop} — verifique o access token.`,
      );
    }
    if (res.status === 429) {
      const retryAfter = Number(res.headers.get('retry-after') ?? '2') * 1000;
      throw new ShopifyRateLimitError('Rate limited by Shopify', retryAfter);
    }
    if (!res.ok) {
      const body = await res.text().catch(() => '<no body>');
      throw new ShopifyGraphQLError(`Shopify HTTP ${res.status}: ${body.slice(0, 200)}`);
    }

    const parsed = (await res.json()) as GraphQLResponse<T>;
    if (parsed.errors && parsed.errors.length > 0) {
      const msg = parsed.errors.map((e) => e.message).join('; ');
      throw new ShopifyGraphQLError(`GraphQL errors: ${msg}`);
    }
    if (parsed.data === undefined) {
      throw new ShopifyGraphQLError('GraphQL response missing data field');
    }
    return parsed.data;
  }
}

// ===== Operações de produto (caminho mínimo) =====

const LIST_PRODUCTS_QUERY = `
  query ListProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          handle
          title
          status
          updatedAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

interface ListProductsRaw {
  products: {
    edges: Array<{
      node: {
        id: string;
        handle: string;
        title: string;
        status: string;
        updatedAt: string;
      };
    }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

export type MinimalProduct = Pick<
  ShopifyProduct,
  'id' | 'handle' | 'title' | 'status' | 'updatedAt'
>;

export interface ListProductsResult {
  items: MinimalProduct[];
  hasNextPage: boolean;
  endCursor: string | null;
}

export async function listProducts(
  client: AdminGraphQLClient,
  opts: { first?: number } = {},
): Promise<ListProductsResult> {
  const first = Math.min(Math.max(opts.first ?? 10, 1), 250);
  const data = await client.query<ListProductsRaw>(LIST_PRODUCTS_QUERY, { first });
  return {
    items: data.products.edges.map((e) => ({
      id: e.node.id as ShopifyProduct['id'],
      handle: e.node.handle,
      title: e.node.title,
      status: e.node.status as ShopifyProduct['status'],
      updatedAt: e.node.updatedAt,
    })),
    hasNextPage: data.products.pageInfo.hasNextPage,
    endCursor: data.products.pageInfo.endCursor,
  };
}

// ===== Get product by handle (read antes do writeback) =====

const GET_PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      handle
      title
      descriptionHtml
      status
      vendor
      productType
      tags
      updatedAt
    }
  }
`;

interface GetProductByHandleRaw {
  productByHandle: {
    id: string;
    handle: string;
    title: string;
    descriptionHtml: string;
    status: string;
    vendor: string | null;
    productType: string | null;
    tags: string[];
    updatedAt: string;
  } | null;
}

export interface ProductSnapshot {
  id: ShopifyProduct['id'];
  handle: string;
  title: string;
  descriptionHtml: string;
  status: ShopifyProduct['status'];
  vendor: string | null;
  productType: string | null;
  tags: string[];
  updatedAt: string;
}

export async function getProductByHandle(
  client: AdminGraphQLClient,
  handle: string,
): Promise<ProductSnapshot | null> {
  const data = await client.query<GetProductByHandleRaw>(GET_PRODUCT_BY_HANDLE_QUERY, { handle });
  const p = data.productByHandle;
  if (!p) return null;
  return {
    id: p.id as ShopifyProduct['id'],
    handle: p.handle,
    title: p.title,
    descriptionHtml: p.descriptionHtml,
    status: p.status as ShopifyProduct['status'],
    vendor: p.vendor,
    productType: p.productType,
    tags: p.tags,
    updatedAt: p.updatedAt,
  };
}

// ===== productUpdate mutation (writeback) =====
// Suporta hoje: title, descriptionHtml, tags, status. Expandir conforme necessidade
// — manter superfície mínima reduz surprise blast radius.

const PRODUCT_UPDATE_MUTATION = `
  mutation ProductUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        handle
        title
        descriptionHtml
        status
        tags
        updatedAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface ProductUpdateInput {
  id: string;
  title?: string;
  descriptionHtml?: string;
  tags?: string[];
  status?: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
}

export interface ProductUpdateResult {
  product: ProductSnapshot | null;
  userErrors: Array<{ field: string[] | null; message: string }>;
}

interface ProductUpdateRaw {
  productUpdate: {
    product: GetProductByHandleRaw['productByHandle'];
    userErrors: Array<{ field: string[] | null; message: string }>;
  };
}

export async function updateProduct(
  client: AdminGraphQLClient,
  input: ProductUpdateInput,
): Promise<ProductUpdateResult> {
  const data = await client.query<ProductUpdateRaw>(PRODUCT_UPDATE_MUTATION, { input });
  const p = data.productUpdate.product;
  return {
    product: p
      ? {
          id: p.id as ShopifyProduct['id'],
          handle: p.handle,
          title: p.title,
          descriptionHtml: p.descriptionHtml,
          status: p.status as ShopifyProduct['status'],
          vendor: p.vendor,
          productType: p.productType,
          tags: p.tags,
          updatedAt: p.updatedAt,
        }
      : null,
    userErrors: data.productUpdate.userErrors,
  };
}

export function buildProductUpdateMutation(): string {
  return PRODUCT_UPDATE_MUTATION;
}
