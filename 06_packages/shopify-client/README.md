# @cao/shopify-client

Utilitários compartilhados sobre o adapter `05_integrations/shopify` (caches, helpers de paginação GraphQL, batching). Mantém o adapter fino e evita repetir boilerplate em consumidores.

## API prevista
- `paginate(query, vars)` — iterator sobre paginação Shopify GraphQL.
- `bulkOperation(query)` — wrapper sobre Bulk Operations API.
- `cache(key, fetcher, ttl)` — cache leve para reads frequentes.
- `metafield(namespace, key, type)` — helper tipado.

## Por que existe (e não está em `05_integrations/shopify`)
- O adapter expõe operações brutas; este package compõe padrões reutilizáveis em cima.
- Permite múltiplos consumidores sem duplicar lógica.

## Consumido por
- `04_apps/shopify-admin-app`, `merchant-service`, `feed-service`, `review-service`.

## Status
Stub.
