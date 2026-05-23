# src/webhooks/

Handlers HTTP de webhooks recebidos. Validação HMAC + dedup já feita pelo adapter `05_integrations/shopify/webhooks/`. Aqui ficam apenas os handlers específicos do merchant-service.

## Handlers previstos

| Arquivo | Topic | Ação |
|---|---|---|
| `products-mutated.ts` | `products/create`, `products/update` | enqueue worker `reanalyze-product` |
| `products-deleted.ts` | `products/delete` | enqueue worker `remove-from-gmc` |
| `app-uninstalled.ts` | `app/uninstalled` | enqueue worker `tenant-cleanup` |

## Contrato

Cada handler:
1. Recebe payload já validado (HMAC + schema runtime).
2. Faz enqueue no worker queue.
3. Retorna sem chamar API externa síncrona.

Tempo de resposta < 500ms por contrato Shopify (caso contrário Shopify reenvia).

## Status

Stub.
