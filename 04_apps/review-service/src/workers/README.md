# src/workers/

Workers consumindo a fila interna.

## Workers

| Worker | Fila | Função |
|---|---|---|
| `process-review` | `reviews.ingested` | normaliza, redact PII, persiste em `07_memory/<tenant>/working/reviews/`, enqueue draft se necessário |
| `synthesize-voc` | `reviews.synthesize` | invoca `reviews-ops` Fluxo 2 |
| `draft-response` | `reviews.draft_needed` | invoca `reviews-ops` Fluxo 3 |
| `publish-response` | `reviews.publish` (aprovação) | chama adapter.respondToReview |
| `aggregate-rating-sync` | `reviews.aggregate_sync` (cron) | recalcula AggregateRating; escreve metafields no Shopify |

## Convenções

- Concurrency baixa em workers LLM (default 2); alta em `process-review` (default 8).
- Retry: 2 tentativas para transient; terminal → DLQ + notificação humana.
- Toda chamada LLM passa por `@cao/observability` (cost + latency).

## Status

Stub.
