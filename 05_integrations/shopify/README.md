# shopify

Adapter para Shopify Admin (GraphQL + App Bridge + Webhooks).

## Superfície
- Admin GraphQL API
- App Bridge / session tokens
- Webhooks (orders, products, app/uninstalled, ...)
- OAuth offline

## Estrutura
- `client/` — GraphQL client + auth (session token + offline access token).
- `types/` — tipos do domínio mapeados (`Product`, `Variant`, `Order`, `Customer`).
- `errors/` — `ShopifyAuthError`, `ShopifyRateLimitError`, `ShopifyGraphQLError`.
- `webhooks/` — handlers HMAC + dedup por `X-Shopify-Webhook-Id`.

## Auth
- `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_SCOPES`

## Consumido por
- `04_apps/shopify-admin-app`, `merchant-service`, `feed-service`, `review-service`
- Agentes: `product-offer`, `design-ux-localization`, `product-feed-seo`, `catalog-feed-ops`, `merchant-compliance`, `reviews-ops`

## Upstream
- `01_upstreams/shopify-app-template-react-router` (template a clonar).
- `01_upstreams/dawn` (inspiração de tema).

## Status
Stub. Sem implementação. Subdirs `client/types/errors/webhooks` reservados.
