import { describe, expect, it, vi } from 'vitest';
import { ShopifyAuthError, ShopifyGraphQLError, ShopifyRateLimitError } from '../errors/index.js';
import {
  ADMIN_API_VERSION,
  AdminGraphQLClient,
  getProductByHandle,
  listProducts,
  updateProduct,
} from './admin-graphql.js';

function mockFetch(response: {
  status?: number;
  body?: unknown;
  headers?: Record<string, string>;
}): typeof fetch {
  const init = {
    status: response.status ?? 200,
    headers: new Headers(response.headers ?? { 'content-type': 'application/json' }),
  };
  const body =
    typeof response.body === 'string' ? response.body : JSON.stringify(response.body ?? {});
  return vi.fn(async () => new Response(body, init)) as unknown as typeof fetch;
}

describe('AdminGraphQLClient', () => {
  it('monta endpoint com API version pinada', async () => {
    const fetchImpl = mockFetch({ body: { data: { shop: { name: 'Acme' } } } });
    const c = new AdminGraphQLClient({
      shop: 'acme.myshopify.com',
      accessToken: 'token',
      fetchImpl,
    });
    await c.query('{ shop { name } }');
    const call = (fetchImpl as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
    expect(call?.[0]).toBe(
      `https://acme.myshopify.com/admin/api/${ADMIN_API_VERSION}/graphql.json`,
    );
  });

  it('envia header X-Shopify-Access-Token e body GraphQL', async () => {
    const fetchImpl = mockFetch({ body: { data: { ok: true } } });
    const c = new AdminGraphQLClient({
      shop: 'acme.myshopify.com',
      accessToken: 'shpat_abc',
      fetchImpl,
    });
    await c.query('{ ok }', { foo: 'bar' });
    const call = (fetchImpl as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
    const init = call?.[1] as RequestInit;
    expect((init.headers as Record<string, string>)['X-Shopify-Access-Token']).toBe('shpat_abc');
    const parsed = JSON.parse(init.body as string);
    expect(parsed).toEqual({ query: '{ ok }', variables: { foo: 'bar' } });
  });

  it('lança ShopifyAuthError em 401', async () => {
    const c = new AdminGraphQLClient({
      shop: 'acme.myshopify.com',
      accessToken: 'bad',
      fetchImpl: mockFetch({ status: 401, body: { error: 'unauthorized' } }),
    });
    await expect(c.query('{ shop { name } }')).rejects.toBeInstanceOf(ShopifyAuthError);
  });

  it('lança ShopifyRateLimitError em 429 com retry-after', async () => {
    const c = new AdminGraphQLClient({
      shop: 'acme.myshopify.com',
      accessToken: 'tok',
      fetchImpl: mockFetch({ status: 429, body: {}, headers: { 'retry-after': '5' } }),
    });
    await expect(c.query('{ shop { name } }')).rejects.toMatchObject({
      code: 'SHOPIFY_RATE_LIMIT',
      retryAfterMs: 5000,
    });
  });

  it('lança ShopifyGraphQLError quando data missing', async () => {
    const c = new AdminGraphQLClient({
      shop: 'acme.myshopify.com',
      accessToken: 'tok',
      fetchImpl: mockFetch({ body: { errors: [{ message: 'Field unknown' }] } }),
    });
    await expect(c.query('{ shop { name } }')).rejects.toBeInstanceOf(ShopifyGraphQLError);
  });
});

describe('listProducts', () => {
  const sampleResponse = {
    data: {
      products: {
        edges: [
          {
            node: {
              id: 'gid://shopify/Product/1',
              handle: 'product-one',
              title: 'Product One',
              status: 'ACTIVE',
              updatedAt: '2026-05-23T12:00:00Z',
            },
          },
          {
            node: {
              id: 'gid://shopify/Product/2',
              handle: 'product-two',
              title: 'Product Two',
              status: 'DRAFT',
              updatedAt: '2026-05-23T13:00:00Z',
            },
          },
        ],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    },
  };

  it('mapeia edges para array de produtos', async () => {
    const c = new AdminGraphQLClient({
      shop: 'acme.myshopify.com',
      accessToken: 'tok',
      fetchImpl: mockFetch({ body: sampleResponse }),
    });
    const r = await listProducts(c, { first: 10 });
    expect(r.items).toHaveLength(2);
    expect(r.items[0]?.title).toBe('Product One');
    expect(r.items[1]?.status).toBe('DRAFT');
    expect(r.hasNextPage).toBe(false);
  });

  it('limita first entre 1 e 250', async () => {
    const fetchImpl = mockFetch({ body: sampleResponse });
    const c = new AdminGraphQLClient({ shop: 'acme.myshopify.com', accessToken: 't', fetchImpl });
    await listProducts(c, { first: 9999 });
    const call = (fetchImpl as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
    const body = JSON.parse((call?.[1] as RequestInit).body as string);
    expect(body.variables.first).toBe(250);
  });

  it('default first = 10', async () => {
    const fetchImpl = mockFetch({ body: sampleResponse });
    const c = new AdminGraphQLClient({ shop: 'acme.myshopify.com', accessToken: 't', fetchImpl });
    await listProducts(c);
    const call = (fetchImpl as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
    const body = JSON.parse((call?.[1] as RequestInit).body as string);
    expect(body.variables.first).toBe(10);
  });
});

describe('getProductByHandle', () => {
  it('retorna ProductSnapshot quando encontrado', async () => {
    const fetchImpl = mockFetch({
      body: {
        data: {
          productByHandle: {
            id: 'gid://shopify/Product/123',
            handle: 'conjunto-montessori',
            title: 'Conjunto Montessori',
            descriptionHtml: '<p>desc</p>',
            status: 'ACTIVE',
            vendor: 'Incluo',
            productType: 'Brinquedo',
            tags: ['t1', 't2'],
            updatedAt: '2026-05-26T10:00:00Z',
          },
        },
      },
    });
    const c = new AdminGraphQLClient({ shop: 'i.myshopify.com', accessToken: 't', fetchImpl });
    const p = await getProductByHandle(c, 'conjunto-montessori');
    expect(p).not.toBeNull();
    expect(p?.id).toBe('gid://shopify/Product/123');
    expect(p?.descriptionHtml).toBe('<p>desc</p>');
    expect(p?.tags).toEqual(['t1', 't2']);
  });

  it('retorna null quando produto não existe', async () => {
    const fetchImpl = mockFetch({ body: { data: { productByHandle: null } } });
    const c = new AdminGraphQLClient({ shop: 'i.myshopify.com', accessToken: 't', fetchImpl });
    const p = await getProductByHandle(c, 'nao-existe');
    expect(p).toBeNull();
  });
});

describe('updateProduct', () => {
  it('envia mutation com input correto e mapeia response', async () => {
    const fetchImpl = mockFetch({
      body: {
        data: {
          productUpdate: {
            product: {
              id: 'gid://shopify/Product/1',
              handle: 'foo',
              title: 'Foo',
              descriptionHtml: '<p>novo</p>',
              status: 'ACTIVE',
              vendor: null,
              productType: null,
              tags: [],
              updatedAt: '2026-05-26T11:00:00Z',
            },
            userErrors: [],
          },
        },
      },
    });
    const c = new AdminGraphQLClient({ shop: 'i.myshopify.com', accessToken: 't', fetchImpl });
    const res = await updateProduct(c, {
      id: 'gid://shopify/Product/1',
      descriptionHtml: '<p>novo</p>',
    });
    expect(res.product?.descriptionHtml).toBe('<p>novo</p>');
    expect(res.userErrors).toEqual([]);
    const call = (fetchImpl as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
    const body = JSON.parse((call?.[1] as RequestInit).body as string);
    expect(body.variables.input).toEqual({
      id: 'gid://shopify/Product/1',
      descriptionHtml: '<p>novo</p>',
    });
  });

  it('propaga userErrors retornados pela Shopify', async () => {
    const fetchImpl = mockFetch({
      body: {
        data: {
          productUpdate: {
            product: null,
            userErrors: [{ field: ['input', 'descriptionHtml'], message: 'too long' }],
          },
        },
      },
    });
    const c = new AdminGraphQLClient({ shop: 'i.myshopify.com', accessToken: 't', fetchImpl });
    const res = await updateProduct(c, {
      id: 'gid://shopify/Product/1',
      descriptionHtml: 'x',
    });
    expect(res.product).toBeNull();
    expect(res.userErrors).toHaveLength(1);
    expect(res.userErrors[0]?.message).toBe('too long');
  });
});
