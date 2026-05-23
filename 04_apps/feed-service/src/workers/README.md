# src/workers/

Workers consumindo a fila vinda do `merchant-service`.

## Workers

| Worker | Topic | Pipeline |
|---|---|---|
| `optimize-batch` | `feed.optimize_skus` | `optimize-skus` |
| `remediate` | `feed.remediate_disapproval` | `remediate-disapproval` |
| `localize` | `feed.localize_skus` | `localize-skus` |

## Convenções

- Concurrency baixa (default 2) — chamadas LLM são caras.
- Retry: 2 tentativas para falhas transient (timeout, 5xx).
- Failure terminal → DLQ + notificação humana via `analytics-service`.
- Toda chamada LLM passa por `@cao/observability` (cost + latency tracking).

## Status

Stub.
