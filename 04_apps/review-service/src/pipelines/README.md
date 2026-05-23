# src/pipelines/

Pipelines deterministicos. Cada pipeline é uma sequência ordenada de steps, com observabilidade por step.

## Pipelines

| Pipeline | Steps |
|---|---|
| `ingest-review` | `verify-source` → `normalize` → `redact-pii` → `persist` → `enqueue-draft-if-needed` |
| `synthesize-voc` | `gather-reviews` → `extract-themes` → `classify-claims` → `persist-voc` → `notify-consumers` |
| `draft-response` | `load-context` → `compose` → `tag-tone` → `submit-for-moderation` |
| `publish-response` | `verify-approval` → `provider-respond` → `persist-audit` |
| `aggregate-rating-sync` | `aggregate-by-product` → `write-shopify-metafield` |

## Convenções

- Pipeline é **stateless**.
- Cada step com timeout próprio.
- Output sempre inclui `step_status[]`.

## Status

Stub.
