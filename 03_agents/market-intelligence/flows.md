# Flows — market-intelligence

Pesquisa de mercado por categoria/segmento. Agente **read-only** (não modifica nada externo); emite sinais estruturados para outros tiers consumirem.

## Fluxo 1 — Snapshot inicial de categoria

**Trigger:** `orchestrator-master` recebe intent `research_market` (manual ou ao onboardar novo tenant).

```
[1] receber scope (category + region) + horizon
    │
    ▼
[2] memory-context bundle: contexto do tenant (marca, ICP) já registrado
    │
    ▼
[3] em paralelo:
    │   brightdata_serp(top-keywords)     → top players + share of voice
    │   brightdata_dataset(category)      → preços médios, ranges, atributos
    │   posthog_query(funnel-baseline)    → sinais internos: o que converte hoje
    │
    ▼
[4] llm_synthesize:
    │   tendências detectadas, players relevantes, gaps de oferta
    │   confiança 0..1 baseada em quantidade e diversidade das fontes
    │
    ▼
[5] estruturar signals_outbound[]:
    │   ex.: { kind: "rising_search", detail: "...", evidence: [...] }
    │
    ▼
[6] persistir em 07_memory/<tenant>/working/market/<category>-<timestamp>.md
[7] retornar para orchestrator
```

**Saída usada por:** `product-offer` (input para definir oferta), `marketing-director` (input para plano), `competitor-benchmark` (descobre players para watchlist).

## Fluxo 2 — Refresh periódico

**Trigger:** job semanal no `creative-ops-service` ou `analytics-service`.

```
[1] varrer categorias ativas do tenant
[2] para cada, rodar Fluxo 1 com horizon=d30
[3] comparar com snapshot anterior → detecta mudança significativa
[4] mudança ≥ threshold → emite alert via @cao/observability
```

## Fluxo 3 — Pesquisa dirigida (under-defined intent)

**Trigger:** `marketing-director` precisa de input específico ("qual é o ângulo emergente em X?").

```
[1] receber pergunta + escopo
[2] mesma estrutura do Fluxo 1, mas com prompt mais específico
[3] saída focada: 3-5 ângulos com evidência
[4] confidence < 0.5 → marcar "needs_human_review"
```

## Desvios e erros

| Situação | Ação |
|---|---|
| Bright Data quota esgotada | seguir sem essa fonte; logar warning; `confidence` reduzida |
| Categoria sem suficiente sinal | erro `InsufficientData` |
| Budget LLM excedido | parar; retornar parcial com `truncated=true` |
| Region não suportada por dataset | sinal `region_not_supported` + sugestão de fallback |

## Inputs/Outputs canônicos

- Schemas em `contract.yaml`.
- Fixtures em `tests/fixtures/`.

## Dependências de upstream

| Upstream | Como ajuda |
|---|---|
| `brightdata/competitive-intelligence` | dependência via adapter (SERPs + datasets) |
| `FlatNineOrg/ecommerce-skills` | inspiração de prompts/heurísticas de leitura de categoria (via `@cao/skills`) |
| `coreyhaines31/marketingskills` | inspiração de framing de ICP / posicionamento para enriquecer signals |
