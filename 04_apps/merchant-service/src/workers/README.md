# src/workers/

Processadores de fila. Cada worker consome um topic interno e invoca o orchestrator com a intent apropriada.

## Workers previstos

| Worker | Trigger | Intent invocada |
|---|---|---|
| `reanalyze-product` | webhook `products/create`+`products/update` | `analyze_skus` (orchestrator → product-feed-seo + merchant-compliance) |
| `remove-from-gmc` | webhook `products/delete` | `remove_from_feed` (catalog-feed-ops) |
| `tenant-cleanup` | webhook `app/uninstalled` | `cleanup_tenant` (revoga sessão + agenda GDPR redact após janela) |
| `apply-changes` | output aprovado do feed-service | `apply_feed_changes` (catalog-feed-ops Fluxo 1) |

## Convenções

- **Idempotente** sempre — retries do queue não devem duplicar mudanças.
- Concurrency configurável por worker (default baixo para GMC writes).
- Falhas categorizadas em transient (retry) vs terminal (DLQ).
- Audit log por job (sucesso, falha, retry count).

## Status

Stub.
