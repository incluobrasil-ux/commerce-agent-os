# Flows — analytics-optimization

Agente **read-only sobre PostHog + memória**. Identifica oportunidades, propõe experimentos com tamanho de amostra defensável. **Não roda experimentos**; só propõe e mede.

## Fluxo 1 — Diagnóstico de funnel

**Trigger:** `orchestrator-master` recebe intent `diagnose_funnel`.

```
[1] receber surface=funnel + window + baseline_ref opcional
    │
    ▼
[2] posthog_query: funnel padrão
    visit → product_view → add_to_cart → begin_checkout → purchase
    com breakdown por device, channel, locale
    │
    ▼
[3] identificar maior drop-off relativo a baseline (ou histórico)
    │
    ▼
[4] enriquecer com sinais paralelos:
    │   reviews-ops VoC themes (motivos de fricção)
    │   competitor-benchmark (price gap recente)
    │   feed disapprovals que afetam SKUs no funnel
    │
    ▼
[5] stats_power: dado o volume atual, qual é MDE realista?
    │
    ▼
[6] llm_summarize: gera summary.markdown + experiments_proposed[]
    cada experiment com hypothesis, variant, primary_metric, MDE, sample_size, duration_estimate_days
    │
    ▼
[7] retornar findings + experiments_proposed
```

## Fluxo 2 — Performance de criativo (canal × variante)

**Trigger:** `marketing-director` precisa avaliar onde alocar mais budget mid-quarter.

```
[1] receber surface=campaign + window
    │
    ▼
[2] posthog_query: eventos pareados
    `campaign.launched` ↔ `purchase` por initiative_id + asset_id
    CTR por `creative_variant`
    CR por `landing_variant`
    │
    ▼
[3] consolidar por initiative_id:
    spent_usd, impressions, clicks, CR, ROAS
    │
    ▼
[4] findings: quais variantes/canais merecem dobrar; quais matar
[5] experiments_proposed: novas variantes a testar
[6] retornar para marketing-director (que decide; agente não decide)
```

## Fluxo 3 — Avaliação de mudança de feed

**Trigger:** `catalog-feed-ops` aplicou mudanças há ≥ window.

```
[1] receber surface=feed + window=14d desde apply
    │
    ▼
[2] posthog_query:
    impressions / clicks / sessions / CR para SKUs afetados
    comparar com baseline pré-mudança
    │
    ▼
[3] estimated_impact_usd se possível atribuir
[4] findings: SKUs ganharam vs perderam vs sem mudança estatisticamente
[5] retornar para product-feed-seo + catalog-feed-ops
```

## Fluxo 4 — Cross-signal (descobrir correlação)

**Trigger:** job semanal.

```
[1] surface=funnel, mas com tags expandidas
[2] posthog_query: cruzar VoC themes × CR; reviews rating × repeat purchase
[3] findings com `delta_vs_baseline` apenas se tiver baseline
[4] sem conclusões causais — apenas correlação + sugestão de A/B
```

## Invariantes

- Toda finding cita `metric` + `window` (sem isso, rejeitar).
- Cada `experiments_proposed[i]` tem `primary_metric`, `minimum_detectable_effect`, `sample_size`.
- `delta_vs_baseline` só aparece se `baseline_ref` foi passado.
- Nenhuma escrita em PostHog — agente é read-only.

## Desvios

| Situação | Ação |
|---|---|
| Métrica não existe em PostHog | erro `MetricNotFound` |
| Janela sem dados suficientes | erro `InsufficientData` (sugerindo janela maior ou MDE maior) |
| Multi-tenant: dados cross-tenant | rejeitar — toda query filtra por `tenant_id` |
| Budget LLM excedido em summarize | retornar findings sem summary.markdown |

## Inputs/Outputs canônicos

Schemas em `contract.yaml`. Fixtures em `tests/fixtures/`.

## Dependências de upstream

| Upstream | Como ajuda |
|---|---|
| `PostHog/posthog` | SDK + HogQL — fonte primária de eventos |
| `google-marketing-solutions/feedx` | inspiração metodológica de A/B em feeds (uso quando volume justificar) |
