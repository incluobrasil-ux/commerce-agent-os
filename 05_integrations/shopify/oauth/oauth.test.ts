import { describe, expect, it, vi } from 'vitest';
import { ShopifyAuthError } from '../errors/index.js';
import { buildAuthorizeUrl, exchangeCodeForToken, isValidShopDomain } from './index.js';

describe('buildAuthorizeUrl', () => {
  it('monta URL com todos os parâmetros obrigatórios', () => {
    const url = buildAuthorizeUrl({
      shop: 'acme.myshopify.com',
      apiKey: 'apikey123',
      scopes: 'read_products,write_products',
      redirectUri: 'https://app.example.com/auth/callback',
      state: 'random-nonce',
    });
    const u = new URL(url);
    expect(u.origin).toBe('https://acme.myshopify.com');
    expect(u.pathname).toBe('/admin/oauth/authorize');
    expect(u.searchParams.get('client_id')).toBe('apikey123');
    expect(u.searchParams.get('scope')).toBe('read_products,write_products');
    expect(u.searchParams.get('redirect_uri')).toBe('https://app.example.com/auth/callback');
    expect(u.searchParams.get('state')).toBe('random-nonce');
    expect(u.searchParams.get('grant_options[]')).toBeNull();
  });

  it('adiciona grant_options[]=per-user quando online=true', () => {
    const url = buildAuthorizeUrl({
      shop: 'acme.myshopify.com',
      apiKey: 'k',
      scopes: 'read_products',
      redirectUri: 'https://x.com/cb',
      state: 'n',
      online: true,
    });
    expect(new URL(url).searchParams.get('grant_options[]')).toBe('per-user');
  });
});

describe('isValidShopDomain', () => {
  it('aceita domínios válidos myshopify.com', () => {
    expect(isValidShopDomain('acme.myshopify.com')).toBe(true);
    expect(isValidShopDomain('store-with-dashes.myshopify.com')).toBe(true);
    expect(isValidShopDomain('a1b2.myshopify.com')).toBe(true);
  });

  it('rejeita domínios maliciosos ou inválidos', () => {
    expect(isValidShopDomain('evil.com')).toBe(false);
    expect(isValidShopDomain('acme.myshopify.com.evil.com')).toBe(false);
    expect(isValidShopDomain('http://acme.myshopify.com')).toBe(false);
    expect(isValidShopDomain('-bad.myshopify.com')).toBe(false);
    expect(isValidShopDomain('UPPER.myshopify.com')).toBe(false);
  });
});

describe('exchangeCodeForToken', () => {
  it('faz POST e retorna access token', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ access_token: 'shpat_xyz', scope: 'read_products' }), {
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
        }),
    ) as unknown as typeof fetch;

    const r = await exchangeCodeForToken({
      shop: 'acme.myshopify.com',
      apiKey: 'k',
      apiSecret: 's',
      code: 'auth-code',
      fetchImpl,
    });
    expect(r.accessToken).toBe('shpat_xyz');
    expect(r.scope).toBe('read_products');

    const call = (fetchImpl as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
    expect(call?.[0]).toBe('https://acme.myshopify.com/admin/oauth/access_token');
    const body = JSON.parse((call?.[1] as RequestInit).body as string);
    expect(body).toEqual({ client_id: 'k', client_secret: 's', code: 'auth-code' });
  });

  it('lança ShopifyAuthError em falha HTTP', async () => {
    const fetchImpl = vi.fn(
      async () => new Response('{"error":"invalid_request"}', { status: 400 }),
    ) as unknown as typeof fetch;
    await expect(
      exchangeCodeForToken({
        shop: 'acme.myshopify.com',
        apiKey: 'k',
        apiSecret: 's',
        code: 'bad',
        fetchImpl,
      }),
    ).rejects.toBeInstanceOf(ShopifyAuthError);
  });

  it('lança ShopifyAuthError se resposta vier sem access_token', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ scope: 'read_products' }), {
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
        }),
    ) as unknown as typeof fetch;
    await expect(
      exchangeCodeForToken({
        shop: 'acme.myshopify.com',
        apiKey: 'k',
        apiSecret: 's',
        code: 'c',
        fetchImpl,
      }),
    ).rejects.toBeInstanceOf(ShopifyAuthError);
  });
});
