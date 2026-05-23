# Flows — competitor-benchmark

Monitora concorrentes nomeados. Cada execução produz um snapshot + delta vs `since`.

## Fluxo 1 — Snapshot único (sem deltas)

**Trigger:** primeira execução para um competitor, ou refresh manual.

```
[1] receber competitors[] + dimensions[]
    │
    ▼
[2] para cada competitor em paralelo:
    │   brightdata_scrape(página alvo) por dimensão:
    │     price          → coletar preço de SKUs equivalentes
    │     catalog        → contagem + categorias
    │     copy           → títulos e descrições top
    │     reviews        → rating médio + count
    │     serp           → posição em queries-alvo
    │
    ▼
[3] memory_snapshot persiste em
    07_memory/<tenant>/competitor-benchmark/<competitor>/<timestamp>.md
    (frontmatter com dimensions cobertas)
    │
    ▼
[4] deltas[] vazio (primeira execução)
[5] alert_policy: sem comparação, sem alerts
[6] retornar snapshot completo
```

## Fluxo 2 — Snapshot com delta

**Trigger:** execução periódica (job semanal no analytics-service ou creative-ops-service).

```
[1] mesma coleta do Fluxo 1
[2] memory_snapshot calcula delta vs `since` (último snapshot)
[3] deltas[] com {competitor, dimension, from, to}
[4] alert_policy classifica:
    │   price ±15%        → critical
    │   catalog ±20%      → warning
    │   reviews delta avg > 0.3 → warning
    │   copy mudança significativa → info
[5] retornar snapshot + deltas + alerts
```

## Fluxo 3 — Watch dirigida por sinal

**Trigger:** `marketing-director` ou `product-offer` pede leitura específica ("compare nosso SKU X com X de competidor Y").

```
[1] receber comparison_pair → scope reduzido (1×1 SKU)
[2] coleta cirúrgica, evitar custo Bright Data
[3] retornar diff lado a lado
```

## ToS e legalidade

- Toda coleta passa pelo adapter Bright Data — verificações de ToS são responsabilidade do adapter/guardrails.
- Nunca coletar PII de clientes dos concorrentes.
- Erro `LegalBlocked` para um competitor não derruba os outros.

## Desvios

| Situação | Ação |
|---|---|
| Competitor indisponível (404, 5xx persistente) | `CompetitorUnreachable` apenas nele; outros continuam |
| Bright Data ToS-bloqueia | `LegalBlocked`; competitor omitido do snapshot; log |
| Snapshot anterior corrompido | tratar como sem `since` → Fluxo 1 |
| Budget esgotado mid-run | retornar parcial; marcar quais competitors faltaram |

## Inputs/Outputs canônicos

- Schemas em `contract.yaml`.
- Fixtures em `tests/fixtures/`.

## Dependências de upstream

| Upstream | Como ajuda |
|---|---|
| `brightdata/competitive-intelligence` | dependência direta — datasets + scrape + SERP |
