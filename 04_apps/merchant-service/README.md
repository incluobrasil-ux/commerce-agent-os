# merchant-service

Serviço headless que sincroniza Shopify ↔ Google Merchant Center. Hospeda jobs agendados, ingere webhooks Shopify relevantes a catálogo, mantém estado operacional de feed e orquestra `catalog-feed-ops` + `merchant-compliance`.

## Por que existe (separado de `feed-service`)

- **`merchant-service`** é **operacional**: pacing, retries, idempotency, status de feed, GDPR redact, jobs.
- **`feed-service`** é **cognitivo**: chama LLM para gerar mudanças (lógica adaptada de `feedgen`).
- Separar evita que carga de inferência LLM (cara, lenta) compita com loops de sincronização (curtos, frequentes).

## Stack

- Node 20+ / TypeScript
- Worker queue (a definir — BullMQ candidato default)
- HTTP fino para webhooks Shopify relacionados a produto
- Cron interno ou worker periódico para jobs agendados

## Estrutura

```
merchant-service/
├─ src/
│  ├─ server.ts              entrada HTTP (webhooks + health)
│  ├─ webhooks/              handlers Shopify (products/*, orders/*, app/uninstalled)
│  ├─ workers/               processadores de fila
│  ├─ orchestration/         camada que invoca @cao/runtime
│  └─ jobs/                  jobs agendados (drift sync, compliance sweep)
├─ package.json
├─ tsconfig.json
├─ .env.example
└─ .gitignore
```

## Jobs previstos

| Job | Frequência | Agente invocado |
|---|---|---|
| `drift-sync` | a cada 1h | `catalog-feed-ops` (Fluxo 2) |
| `compliance-sweep` | semanal | `merchant-compliance` (Fluxo 3) |
| `disapproval-monitor` | a cada 30min | `merchant-compliance` (Fluxo 2) + opcional replay via `product-feed-seo` |
| `feed-pacing-report` | diário | `analytics-optimization` |

## Webhooks ingeridos (subset de Shopify)

Recebidos de fato pelo `shopify-admin-app`; reencaminhados internamente (worker queue) para este serviço quando o topic é relevante a catálogo:

| Topic | Ação |
|---|---|
| `products/create` | reanálise (push para fila de compliance) |
| `products/update` | reanálise + drift check |
| `products/delete` | remover do GMC |
| `app/uninstalled` | cleanup tenant (cancelar jobs) |

## Deps internas

- `@cao/runtime` — invocar orchestrator
- `@cao/core`, `@cao/observability`, `@cao/config`
- `@cao/shared-types`, `@cao/shared-schemas`, `@cao/shared-config`
- `05_integrations/shopify`
- `05_integrations/google-merchant`

## Como rodar (quando configurado)

```
cd 04_apps/merchant-service
pnpm install
pnpm dev          # placeholder
```

## Status

Esqueleto criado (`src/server.ts` + dirs + placeholders comentados). Sem implementação. Pendências em `12_reports/audits/merchant-feed-seo-readiness.md`.

## Não fazer aqui

- Chamadas LLM. Vão para `feed-service` (delegação via orchestrator).
- UI. Vai para `shopify-admin-app`.
- Lógica de domínio profunda. Vai para `03_agents/`.
