# src/pipelines/

Pipelines determinísticos compondo query → analyze → propose.

## Pipelines

| Pipeline | Steps |
|---|---|
| `funnel-diagnose` | `load-baseline` → `query-funnel` → `compute-drops` → `enrich-with-side-signals` → `propose-experiments` |
| `campaign-attribution` | `query-events` → `attribute-by-utm` → `compute-roas` → `recommend` |
| `feed-impact` | `load-feed-changes` → `query-pre-post` → `compute-lift` → `report` |
| `cost-vs-outcome` | `query-agent-invocations` → `match-downstream-value` → `compute-ratio` |

## Convenções

- Pipeline **stateless**.
- Cada step com timeout próprio + entry em `step_status[]`.
- HogQL queries vivem em `src/queries/`, não inline.

## Status

Stub.
