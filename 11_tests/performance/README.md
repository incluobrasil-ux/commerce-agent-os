# 11_tests/performance

Testes que verificam **latência, throughput e custo** contra **budgets explícitos**. Falha quando budget é ultrapassado.

## Por que existir

- Custo LLM tende a explodir em silêncio. Budget assertion é freio.
- Latência p95 de orchestrator afeta UX do admin-app.
- Throughput de pipelines afeta SLA (ex.: webhook Shopify exige < 500ms).

## O que cobrir

| Métrica | Alvo (rascunho — confirmar) | Onde mede |
|---|---|---|
| Orchestrator p95 — intent simples | < 30s | benchmark sintético |
| Webhook Shopify ingest → 200 | < 500ms | benchmark + mock provider |
| Agente `product-feed-seo` cost por SKU | < USD 0.10 | benchmark com fixture |
| Agente `creative-copy-assets` cost por variante | < USD 0.50 (image) / < USD 0.05 (copy) | benchmark |
| HogQL query padrão (`funnel-standard.v1`) | < 5s | benchmark contra PostHog staging |
| Memory bundle (`memory-context`) | < 3s para 50 sources | benchmark |
| Throughput `process-review` worker | ≥ 100 reviews/min | benchmark fila |

## Stack

- vitest com custom matcher de budget OU benchmark tool dedicada (`tinybench` candidato).
- Resultados publicados como artifact em CI.
- Tracking histórico de baseline em `12_reports/perf-baselines/<date>.md` (futuro).

## Convenções

- Nome: `<scope>.perf.test.ts`.
- Cada teste declara **budget explícito** no topo (constante).
- Falha = budget ultrapassado em ≥ 2 runs consecutivas (não 1, para reduzir flake).
- Roda em CI principal, **não pre-commit**.

## Testes previstos

| Arquivo | Alvo |
|---|---|
| `orchestrator-simple.perf.test.ts` | latência p95 |
| `shopify-webhook-ingest.perf.test.ts` | tempo de resposta |
| `feed-seo-cost.perf.test.ts` | USD por SKU |
| `creative-assets-cost.perf.test.ts` | USD por variante |
| `hogql-funnel-standard.perf.test.ts` | latência query |
| `memory-context-bundle.perf.test.ts` | latência bundle |

## Política de baseline

- Baseline registrada em `12_reports/perf-baselines/` no primeiro green.
- Regressão > 20% em latência ou > 10% em custo → bloqueia merge automaticamente.
- Mudança de baseline aceita exige PR consciente alterando o budget no teste.

## Status

Stub. Budgets são rascunho — confirmar em ADR após implementação primária.
