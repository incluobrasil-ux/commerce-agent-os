# src/pipelines/

Pipelines determinísticos que orquestram steps. Cada pipeline é uma função (input → output) com observabilidade em cada step.

## Pipelines previstos

| Pipeline | Steps |
|---|---|
| `optimize-skus` | `ingest` → `optimize` → `propose` → `return` |
| `remediate-disapproval` | `read-disapprovals` → `optimize-targeted` → `return` |
| `localize-skus` | `ingest` → `localize` → `propose` → `return` |

## Convenções

- Pipeline **não** chama provider externo direto — sempre via `@cao/llm` / integrations.
- Pipeline pode falhar em qualquer step; output sempre inclui `step_status[]`.
- Pipeline é **stateless** — todo estado vive no input/output.
- Cada step tem timeout próprio configurável.

## Status

Stub.
