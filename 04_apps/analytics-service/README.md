# analytics-service

Consome eventos PostHog, gera relatórios agendados e propõe experimentos via `analytics-optimization`. **Read-only sobre PostHog**: nunca cria/altera experimentos no PostHog automaticamente.

## Stack

- Node 20+ / TypeScript
- Jobs agendados (cron interno ou worker queue do `merchant-service`)
- HTTP fino: health endpoint

## Estrutura

```
analytics-service/
├─ src/
│  ├─ server.ts             health + boot
│  ├─ jobs/                 análises agendadas (funnel-daily, campaign-weekly, etc.)
│  ├─ pipelines/            query → analyze → propose
│  ├─ queries/              HogQL canônicos (centralizado para reuso)
│  └─ orchestration/        invocações ao @cao/runtime
├─ package.json
├─ tsconfig.json
├─ .env.example
└─ .gitignore
```

## Jobs previstos

| Job | Frequência | Função |
|---|---|---|
| `funnel-daily` | diário | invoca `analytics-optimization` Fluxo 1 com baseline anterior |
| `campaign-performance-weekly` | semanal | invoca Fluxo 2 — analisa initiative_id × asset_id |
| `feed-change-impact` | sob demanda | invoca Fluxo 3 — pareia commit de feed com janela 14d |
| `cross-signal-weekly` | semanal | Fluxo 4 — correlação VoC × CR, reviews × repeat |
| `cost-vs-outcome-daily` | diário | resumo de custo de agentes vs impacto estimado (LLM observability) |

## Por que `queries/` existe

HogQL queries são frágeis: campos mudam, eventos evoluem. Centralizar:

- **Single source of truth** por query (uma definição, não copy-paste).
- **Versionamento** por arquivo (`funnel-standard.v1.hql`, `funnel-standard.v2.hql`).
- **Testabilidade** com fixtures de eventos.

Queries previstas:
- `funnel-standard` — visit → product_view → add_to_cart → begin_checkout → purchase.
- `campaign-attribution` — initiative_id → onsite events (UTM-based).
- `agent-cost-vs-outcome` — agent_invoked → downstream value events.
- `voc-vs-cr` — review themes → conversion rate.

## Deps internas

- `@cao/runtime`, `@cao/llm`, `@cao/observability`
- `@cao/shared-types`, `@cao/shared-schemas`, `@cao/shared-config`
- `05_integrations/posthog` — fonte primária

## Conexão com outros serviços

| Quem | Como |
|---|---|
| `merchant-service`, `feed-service`, `review-service`, `creative-ops-service`, `shopify-admin-app` | **escrevem** eventos via `@cao/observability` → PostHog |
| `marketing-director` | consome relatórios para re-priorização |
| `traffic-campaigns` | consome attribution para pacing |
| `product-feed-seo`, `catalog-feed-ops` | consome impacto de feed |
| `reviews-ops` | publica eventos VoC consumidos cross-correlação |

## Não fazer aqui

- **Criar/alterar experimentos no PostHog.** Agente apenas propõe; humano cria.
- Mutação de feature flags. PostHog feature flags ficam read-only daqui.
- Lógica de domínio. Vive em `analytics-optimization`.
- Instrumentação de eventos. Cada serviço instrumenta o seu — taxonomia compartilhada em `05_integrations/posthog/events-taxonomy.yaml`.

## Status

Esqueleto criado. Sem implementação. Decisão pendente: PostHog cloud vs self-host.

## Pendências

- Confirmar PostHog cloud (US/EU) vs self-host (afeta LGPD/GDPR).
- Aprovar taxonomia de eventos (`05_integrations/posthog/events-taxonomy.yaml`).
- Definir baseline de cada KPI antes de tirar conclusões.
