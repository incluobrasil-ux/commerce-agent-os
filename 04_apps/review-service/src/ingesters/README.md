# src/ingesters/

Pollers periódicos para providers que **não têm webhook** ou onde webhook é parcial. Lê cursor por tenant em DB; pega novos reviews desde o último cursor.

## Ingesters previstos

| Arquivo | Provider | Frequência |
|---|---|---|
| `shopify-native.ts` | Shopify Product Reviews (legacy) | a cada 15min |
| `loox.ts` | Loox (complementa webhook) | a cada 30min |
| `judge-me.ts` | Judge.me (fallback se webhook falhar) | a cada 1h |

## Convenção

- Cursor persistido em DB por `(tenant, provider)`.
- Idempotência por `(provider, external_id)` — reingestão não duplica.
- Falha em um tenant não impede outros.
- Telemetria de duração + count em `@cao/observability`.

## Status

Stub.
