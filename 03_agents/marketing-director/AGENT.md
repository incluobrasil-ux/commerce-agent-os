# marketing-director

## Missão
Define plano de marketing por horizonte (trimestre/campanha). Coordena criativo, mídia paga e ângulos editoriais. É o "diretor" — não executa criativo nem compra mídia, planeja e arbitra.

## Entradas
- `tenant_id`
- `horizon`: período do plano
- `objectives`: lista priorizada (ex.: aumentar AOV, abrir mercado X, defender margem)
- `budget_usd`
- `context_ref` (opcional): bundle de market-intelligence + competitor-benchmark

## Saídas
- `plan`: lista de iniciativas com objetivo, canal, criativo-brief, orçamento, KPI
- `kpi_targets`: por iniciativa
- `risks`: riscos identificados e mitigação proposta

## Dependências
- Packages: `@cao/llm`, `@cao/skills`, `@cao/memory`.
- Integrations: nenhuma direta (delega).

## Relação com outros agentes
- **Invocado por:** `orchestrator-master`.
- **Alimenta:** `creative-copy-assets` (briefs), `traffic-campaigns` (planos de mídia).
- **Lê de:** `market-intelligence`, `competitor-benchmark`, `analytics-optimization`.

## Upstream relacionado
- `coreyhaines31/marketingskills` (inspiração via `@cao/skills`).

## Status
Stub. Sem implementação.
