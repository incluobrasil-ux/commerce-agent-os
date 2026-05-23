# Shopify integration map

Mapa detalhado da camada Shopify. Complementa o resumo em [`shopify.md`](./shopify.md) com superfícies de API, scopes, webhooks, OAuth e consumidores.

## Componentes Shopify envolvidos

| Componente | Onde mora no monorepo | Função |
|---|---|---|
| **Storefront/tema** | `04_apps/shopify-theme/` | renderização pública (Liquid) |
| **App embedded** | `04_apps/shopify-admin-app/` | UI dentro do admin Shopify |
| **Adapter Admin GraphQL** | `05_integrations/shopify/client/` | client tipado |
| **Adapter Webhooks** | `05_integrations/shopify/webhooks/` | HMAC verify + dedup + roteamento |
| **Tipos do domínio Shopify** | `05_integrations/shopify/types/` | tipos mapeados para nosso domínio |
| **Erros normalizados** | `05_integrations/shopify/errors/` | `ShopifyAuthError`, `ShopifyRateLimitError`, etc. |
| **Helpers compartilhados** | `06_packages/shopify-client/` | paginação, cache, batching |

## Surfaces de Shopify usadas

### 1. Admin GraphQL API

- **Endpoint:** `https://{shop}.myshopify.com/admin/api/{version}/graphql.json`.
- **API version:** pinada por env (ex.: `2025-01`). Atualização é PR consciente.
- **Auth:** access token offline (do OAuth) ou online session token (App Bridge).
- **Rate limits:** [GraphQL cost model](https://shopify.dev/docs/api/usage/rate-limits) — 1000 pontos/bucket, leak 50/s. Toda chamada via adapter passa por `costGuard`.

Operações previstas (não implementadas):

| Resource | Operações iniciais |
|---|---|
| Product | `products` (list paginado), `product` (read), `productUpdate`, `productVariantsBulkUpdate` |
| Collection | `collections`, `collection`, `collectionUpdate` |
| Order | `orders` (list, read) — sem write em v1 |
| Customer | `customers` (list, read) — sem write em v1 |
| InventoryLevel | `inventoryLevels` (read) |
| Theme | `themes`, `themeFiles` (apenas se necessário) |
| Metafield | `metafieldsSet` / read embedded em outras queries |

### 2. App Bridge (cliente)

- Library: `@shopify/app-bridge-react`.
- Funções: session token, navegação interna, toast/Modal/Picker no admin.
- **Não chamar Admin API direto do front** — sempre via loaders/actions do React Router que rodam server-side.

### 3. Polaris

- UI default. Sem customização agressiva — manter consistência com admin Shopify.

### 4. Webhooks

- Verificação **HMAC obrigatória** com `SHOPIFY_API_SECRET`.
- Deduplicação por header `X-Shopify-Webhook-Id`.
- Idempotency: handler por topic deve ser idempotente (retry pode acontecer).
- **API version do webhook** declarada em `shopify.app.toml` (mesma da Admin GraphQL).

Topics previstos (catálogo completo em `05_integrations/shopify/webhook-topics.yaml`):

| Topic | Por quê |
|---|---|
| `app/uninstalled` | limpeza de session + tenant data |
| `shop/redact` (GDPR) | obrigatório para apps publicados |
| `customers/data_request`, `customers/redact` (GDPR) | obrigatórios |
| `products/update` | invalidar cache, agendar reanálise de feed |
| `products/delete` | invalidar feed |
| `orders/create` | sinal para VoC/analytics — opt-in por tenant |

### 5. OAuth 2.0

Fluxo offline access (token persiste):

```
[1] Admin instala app → redirect para
    /auth/login?shop=<shop>.myshopify.com
[2] Shopify exibe consentimento com nossos scopes (de shopify.app.toml)
[3] Após consentimento → /auth/callback?code=...
[4] Trocamos code por offline access_token
[5] Persistimos Session (Prisma) com access_token + scope + shop
[6] Posterior: requests usam access_token via X-Shopify-Access-Token
```

Sessões **online** (App Bridge session token) usadas em runtime do app embedded — não persistidas; renovadas pelo App Bridge.

## Scopes solicitados (rascunho)

Definidos em `04_apps/shopify-admin-app/shopify.app.toml` e refletidos em `05_integrations/shopify/scopes.yaml`. Justificativa por scope abaixo.

| Scope | Por quê | Agentes consumidores |
|---|---|---|
| `read_products` | leitura de catálogo | product-feed-seo, merchant-compliance, design-ux-localization, reviews-ops |
| `write_products` | aplicar mudanças de feed/SEO | catalog-feed-ops |
| `read_orders` | sinais de venda (pacing, VoC indireto) | analytics-optimization, reviews-ops |
| `read_customers` | base para segmentação (somente leitura) | marketing-director (futuro), reviews-ops |
| `read_inventory` | restrições de oferta (estoque zero) | product-offer |
| `read_themes` | mapear sections disponíveis no tema do tenant | design-ux-localization |
| `write_themes` | aplicar blueprint do tema (com confirmação humana) | design-ux-localization (apply) |

**Scopes não solicitados** (intencionalmente):
- `write_orders` / `write_customers` — fora de escopo; não tocamos pedido nem cliente.
- `write_shipping` / `write_fulfillments` — out-of-scope.
- `write_inventory` — não gerimos estoque; só lemos.

Princípio: **scope mínimo viável** (least privilege). Adicionar scope é decisão consciente com ADR.

## Fluxo de dados Shopify → agentes

```
[Admin admin store]
    │
    ├── instala app ──────► [shopify-admin-app] (OAuth, sessão persistida)
    │
    │
[Storefront cliente] ─── webhook ──► [shopify-admin-app/webhooks]
                                          │
                                          ├── HMAC verify
                                          ├── dedup (X-Shopify-Webhook-Id)
                                          └── routing → adapter [05_integrations/shopify/webhooks/]
                                                                │
                                                                └─► orchestrator-master
                                                                    │
                                                                    ├─► product-feed-seo
                                                                    ├─► catalog-feed-ops
                                                                    ├─► merchant-compliance
                                                                    ├─► reviews-ops
                                                                    └─► design-ux-localization
```

## Multi-tenant

- `session.shop` (ex.: `acme.myshopify.com`) → derivado o `tenant_id` canônico (ver `@cao/shared-types` `TenantId` branded type).
- Toda chamada Shopify carrega o `tenant_id` no contexto e usa **apenas** o access token daquele tenant.
- `07_memory/vault/<tenant_id>/...` espelha o shop.

## Erros normalizados

`05_integrations/shopify/errors/` declara:

| Classe | Quando |
|---|---|
| `ShopifyAuthError` | OAuth falhou, token expirado, escopo insuficiente |
| `ShopifyRateLimitError` | resposta com `errors[].extensions.code = THROTTLED` ou HTTP 429 |
| `ShopifyGraphQLError` | erro de GraphQL não recuperável (validação) |
| `ShopifyWebhookHmacError` | verificação HMAC falhou |
| `ShopifyWebhookDuplicateError` | já processado (dedup) — não é erro real, mas sinaliza skip |
| `ShopifyResourceNotFound` | produto/coleção/pedido inexistente |

Adapter mapeia respostas brutas Shopify para essas classes. Consumidores nunca pegam erros raw.

## API version policy

- Versão atual fixada (`API_VERSION` em `@cao/shared-config`, default `2025-01`).
- Upgrade é PR consciente, com checklist:
  1. Conferir changelog Shopify.
  2. Rodar smoke contra dev store.
  3. Atualizar `shopify.app.toml` (webhooks api_version) + adapter.
- Suporte simultâneo a múltiplas versões: **não**.

## Decisões em aberto

- DB de produção para `Session` (continuar SQLite vs Postgres). Bloqueia parte do deploy.
- Estratégia para customers GDPR webhooks (`shop/redact`, `customers/redact`, `customers/data_request`) — handler real precisa apagar `07_memory/<tenant>/*` e dumps relacionados.
- Theme app extensions vs editar tema diretamente para blocos como "review badge" — preferir extensions.
- Suporte a Shopify Plus (Functions, B2B) — fora de v0/v1; reavaliar.
