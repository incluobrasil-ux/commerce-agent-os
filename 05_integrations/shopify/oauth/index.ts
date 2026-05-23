// OAuth helpers Shopify — funções puras (nenhuma rotina de servidor).
// Para uso futuro com Remix (04_apps/shopify-admin-app) ou outro framework.
// O caminho mínimo de demo NÃO usa estas funções — usa custom app token direto.

import { ShopifyAuthError } from '../errors/index.js';

const ADMIN_API_VERSION = '2025-01';

export interface AuthorizeUrlOptions {
  /** `acme.myshopify.com` (sem https://). */
  shop: string;
  /** API Key da app (Partners > app > API credentials). */
  apiKey: string;
  /** Scopes solicitados (ex.: `read_products,write_products`). */
  scopes: string;
  /** Callback URL HTTPS. Em dev local: tunnel (cloudflared/ngrok). */
  redirectUri: string;
  /** Anti-CSRF — gerar aleatoriamente e validar no callback. */
  state: string;
  /** Online (per-user) vs offline (default — token persistente). */
  online?: boolean;
}

/**
 * Constrói a URL de autorização. Operador (ou app) redireciona o merchant para ela.
 * Após aprovar, Shopify chama `redirectUri?shop=...&code=...&state=...&hmac=...`.
 */
export function buildAuthorizeUrl(opts: AuthorizeUrlOptions): string {
  const base = `https://${opts.shop}/admin/oauth/authorize`;
  const params = new URLSearchParams({
    client_id: opts.apiKey,
    scope: opts.scopes,
    redirect_uri: opts.redirectUri,
    state: opts.state,
  });
  if (opts.online) {
    params.set('grant_options[]', 'per-user');
  }
  return `${base}?${params.toString()}`;
}

export interface ExchangeTokenOptions {
  shop: string;
  apiKey: string;
  apiSecret: string;
  /** Vem do query string do callback após o merchant aprovar. */
  code: string;
  /** Substituível para teste. */
  fetchImpl?: typeof fetch;
}

export interface AccessTokenResult {
  /** Token persistente para usar como `X-Shopify-Access-Token`. */
  accessToken: string;
  /** Scopes efetivamente concedidos (pode ser subset do solicitado). */
  scope: string;
}

/**
 * Troca o code do callback por um access token persistente.
 * Em uso real, chamar de dentro do handler de callback após validar `state` e `hmac`.
 */
export async function exchangeCodeForToken(opts: ExchangeTokenOptions): Promise<AccessTokenResult> {
  const f = opts.fetchImpl ?? fetch;
  const res = await f(`https://${opts.shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: opts.apiKey,
      client_secret: opts.apiSecret,
      code: opts.code,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '<no body>');
    throw new ShopifyAuthError(
      `Token exchange failed (${res.status}) for ${opts.shop}: ${body.slice(0, 200)}`,
    );
  }
  const parsed = (await res.json()) as { access_token?: string; scope?: string };
  if (!parsed.access_token) {
    throw new ShopifyAuthError(`Token exchange response missing access_token for ${opts.shop}.`);
  }
  return {
    accessToken: parsed.access_token,
    scope: parsed.scope ?? '',
  };
}

/**
 * Valida o domínio da shop: deve ser `<slug>.myshopify.com` (ou domínio custom).
 * Bloqueia tentativas óbvias de redirecionamento malicioso.
 */
export function isValidShopDomain(shop: string): boolean {
  return /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop);
}
