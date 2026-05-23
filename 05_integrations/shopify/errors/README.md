# shopify/errors/

Erros normalizados. Consumidores nunca pegam erro raw do client GraphQL — sempre uma destas classes.

## Classes

| Classe | Quando |
|---|---|
| `ShopifyAuthError` | OAuth falhou, token expirado, escopo insuficiente |
| `ShopifyRateLimitError` | `errors[].extensions.code = THROTTLED` ou HTTP 429; carrega `retryAfter` |
| `ShopifyGraphQLError` | erro de GraphQL (validação, query inválida) — não recuperável |
| `ShopifyResourceNotFound` | produto/coleção/pedido inexistente |
| `ShopifyWebhookHmacError` | verificação HMAC falhou |
| `ShopifyWebhookDuplicateError` | duplicate por `X-Shopify-Webhook-Id` (skip silencioso) |
| `ShopifyApiVersionMismatch` | resposta com header de versão diferente da pinada |

## Convenção

Todas estendem `BaseError` de `@cao/core` (quando existir). Cada erro inclui:
- `code`: string estável para roteamento programático.
- `cause`: erro original (opcional).
- `context`: `{ tenant, op, vars }` mascarado (sem tokens).

## Status

Stub. Implementação na Fase 8.
