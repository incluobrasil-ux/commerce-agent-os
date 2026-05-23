# @cao/skills

Catálogo de skills reutilizáveis (copy, validação, pricing, UX, compliance, stats).

## Organização prevista
- `src/copy/` — copy skills (Higgsfield + marketingskills cherry-pick).
- `src/pricing/` — heurísticas (cost-plus, value-based, dynamic).
- `src/ux/` — UX blueprints.
- `src/feed-optimization/` — adaptado de `feedgen`.
- `src/compliance/` — validadores GTIN, taxonomia.
- `src/voc/` — extração de voz do cliente.
- `src/stats/` — sample size, MDE, etc.
- `src/localization/` — locale/currency formatting.

## Convenções
- Skill = função pura ou stateful com interface tipada — invocável como tool pelo runtime.
- Cada skill tem cabeçalho de procedência (upstream original, SHA, licença, adaptações).

## Upstream
- `01_upstreams/higgsfield-skills` (principal — cherry-pick).
- `01_upstreams/ecommerce-skills`, `01_upstreams/marketingskills` (cherry-pick).
- `01_upstreams/feedgen` (lógica adaptada).

## Consumido por
- Quase todos os agentes via `@cao/runtime`.

## Status
Stub.
