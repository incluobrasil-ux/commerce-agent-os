# Flows — marketing-director

Planeja iniciativas e arbitra entre objetivos. **Não executa criativo nem compra mídia** — decide o quê, por que e com que orçamento; depois delega.

## Fluxo 1 — Plano de horizonte (trimestre / campanha)

**Trigger:** `orchestrator-master` recebe intent `plan_marketing_horizon`.

```
[1] receber horizon (from→to) + objectives priorizados + budget_usd + context_ref opcional
    │
    ▼
[2] memory_read context_ref:
    │   market-intelligence: tendências, ângulos
    │   competitor-benchmark: posicionamento dos players
    │   analytics-optimization: baselines de KPI internos (CAC, AOV, CR)
    │   reviews-ops VoC: voz do cliente (atributos valorizados)
    │
    ▼
[3] skills_marketing_plan: templates por objetivo
    │   ex.: objetivo=AOV ↑ → templates de bundling + threshold de frete
    │   objetivo=novo mercado X → templates de testing budget + criativo localizado
    │
    ▼
[4] arbitrar quando objetivos competem:
    │   ex.: maximizar volume vs preservar margem
    │   escrever trade-off em risks[]
    │
    ▼
[5] llm_compose monta plan[]:
    │   cada iniciativa = {initiative_id, objective_key, channel, creative_brief, budget_usd, kpi}
    │   sum(budget_usd) deve igualar budget_usd total (invariante)
    │
    ▼
[6] kpi_targets por iniciativa (com baseline de PostHog quando existe)
[7] risks[]: trade-offs + dependências externas
[8] retornar para orchestrator
```

**Saída usada por:**
- `creative-copy-assets` consome `plan[].creative_brief` (handoff para criativo).
- `traffic-campaigns` (futuro) consome `plan[].channel + budget_usd` (mídia paga).
- `shopify-admin-app` mostra dashboard humano.

## Fluxo 2 — Re-priorização mid-quarter

**Trigger:** mudança grande nos sinais (`market-intelligence` alert, `competitor-benchmark` movimento crítico, `analytics-optimization` revela iniciativa fracassando).

```
[1] receber novo input + plan atual
[2] avaliar quais iniciativas continuam fazendo sentido
[3] propor mudanças (pause, redirect budget, kill)
[4] retornar `plan_diff` (não substitui plan inteiro)
[5] handoff a humano para confirmar (decisão estratégica nunca autônoma)
```

## Fluxo 3 — Brief dirigido (criativo isolado)

**Trigger:** lojista pede "criar campanha para SKU X em 2 semanas".

```
[1] receber scope reduzido (1 SKU, 1 ou 2 channels)
[2] Fluxo 1 simplificado — 1 iniciativa, brief detalhado
[3] handoff direto para creative-copy-assets
```

## Invariantes

- `sum(plan[i].budget_usd) === budget_usd` total.
- Cada iniciativa tem `kpi.target` e `kpi.unit` populados.
- Conflito de objetivo → entrada em `risks[]` explicando trade-off.
- Não inventar canal sem confirmar com adapter — `channel ∈ {organic_seo, organic_social, email, paid_google, paid_meta, ...}`.

## Desvios

| Situação | Ação |
|---|---|
| Budget insuficiente para objetivos prio≤2 | erro `BudgetUnderfunded` |
| Conflito hard de objetivos (margem max + volume max sem trade-off resolvível) | `ConflictingObjectives` com sugestão de despriorizar 1 |
| Contexto ralo (sem market-intel) | confidence baixa em risks; sugerir rodar market-intel primeiro |

## Inputs/Outputs canônicos

- Schemas em `contract.yaml`.
- Fixtures em `tests/fixtures/`.

## Dependências de upstream

| Upstream | Como ajuda |
|---|---|
| `coreyhaines31/marketingskills` | base operacional via `@cao/skills/marketing` — templates de plano por objetivo, ICP framing, copy direction |
| `FlatNineOrg/ecommerce-skills` | heurísticas de merchandising / bundling cruzando com `product-offer` |
| `agency-ai-solutions/ad-factory-agent` | inspira estrutura de `creative_brief` (handoff para criativo) sem ser copiado |
