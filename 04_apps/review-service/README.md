# review-service

Serviço headless de **ingestão de reviews**, **síntese de VoC** e **rascunho de respostas**. Consome o adapter multi-provedor em `05_integrations/review-apps/`.

## Stack

- Node 20+ / TypeScript
- Worker queue (mesmo redis do merchant-service em dev)
- HTTP fino: health endpoint + webhooks de provedores que suportam (Judge.me, Yotpo, ...)

## Estrutura

```
review-service/
├─ src/
│  ├─ server.ts              entrada HTTP (webhooks de providers que suportam + health)
│  ├─ webhooks/              handlers por provider
│  ├─ ingesters/             pollers por provider (para providers sem webhook)
│  ├─ workers/               processadores de fila (process-review, synthesize-voc, draft-response, publish-response)
│  ├─ pipelines/             ingest → synthesize → draft → moderate → publish
│  └─ orchestration/         invocações ao @cao/runtime / reviews-ops
├─ package.json
├─ tsconfig.json
├─ .env.example
└─ .gitignore
```

## Jobs e workers previstos

| Item | Trigger | Função |
|---|---|---|
| `poll-reviews` (job) | a cada 15min por provider configurado | descobre reviews novos onde provider não tem webhook |
| `process-review` (worker) | fila `reviews.ingested` | normaliza, redact PII, persiste em `07_memory/<tenant>/working/reviews/` |
| `synthesize-voc` (worker) | fila `reviews.synthesize` (manual + semanal automático) | invoca `reviews-ops` Fluxo 2 |
| `draft-response` (worker) | fila `reviews.draft_needed` (rating ≤ 3 ou flagged) | invoca `reviews-ops` Fluxo 3 |
| `publish-response` (worker) | aprovação por `governance-risk-qa` | chama adapter.respondToReview |
| `aggregate-rating-sync` (job) | diário | recalcula AggregateRating por produto; expõe via Shopify metafields para o tema |

## Webhooks suportados (varia por provider)

| Provider | Webhook? | Notas |
|---|---|---|
| Judge.me | sim | `reviews/create`, `reviews/update` |
| Yotpo | sim | callbacks por evento |
| Loox | parcial | webhook de novos reviews |
| Stamped | sim | review-events |
| Okendo | sim | review-events |
| Shopify nativo (Product Reviews legacy) | não | só via API REST polling |

Por convenção, sempre temos fallback de polling (job `poll-reviews`) — webhook é otimização.

## Deps internas

- `@cao/runtime` — invocar `reviews-ops`
- `@cao/llm`, `@cao/memory`, `@cao/guardrails`, `@cao/observability`
- `@cao/shared-types`, `@cao/shared-schemas`, `@cao/shared-config`
- `05_integrations/review-apps` — multi-provedor
- `05_integrations/shopify` — escrever metafields de AggregateRating e VoC summary

## Conexão com o resto

| Quem | Para quê |
|---|---|
| `shopify-admin-app` | UI de moderação manual + dashboard de VoC |
| `shopify-theme` | consome metafields de AggregateRating + Review JSON-LD para SEO (schema.org) |
| `analytics-service` | sinais (review count, avg rating, VoC themes) → `analytics-optimization` |
| `marketing-director` | mensagem central derivada de VoC |
| `product-feed-seo` | claims positivos de VoC podem virar atributos / bullets |

## Não fazer aqui

- Lógica de domínio profunda. Vai para `reviews-ops`.
- Cálculo de schema.org / JSON-LD. Vai para o tema (Liquid).
- Decidir provider. Cada tenant escolhe o seu — config em `merchant-service` ou tabela de tenants.

## Status

Esqueleto criado. Pendente: decisão de provider default suportado + clone/leitura da doc de cada provider.

## Pendências

- Confirmar conjunto inicial suportado (sugestão: começar com 1-2: Judge.me + Shopify nativo).
- Token storage por tenant (segredos do provider).
- Política de retenção de PII em `07_memory/<tenant>/working/reviews/`.
