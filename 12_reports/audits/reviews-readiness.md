# Reviews readiness audit

Estado da camada de reviews em 2026-05-23.

## Resumo

| Área | Status |
|---|---|
| Agente `reviews-ops` | schema completo (AGENT/prompt/contract/tools) + **flows.md novo** + fixtures JSON |
| `04_apps/review-service` | esqueleto Node (package.json + tsconfig + .env + src/{server, webhooks, ingesters, workers, pipelines, orchestration} com READMEs) |
| `05_integrations/review-apps` | adapter multi-provedor com `ReviewProvider` interface; 6 providers em stub; `providers.yaml` comparativo |
| Doc arquitetural | `reviews-map.md` (detalhado) — fluxo, moderação, SEO, conversão |
| Upstreams | **nenhum aplicável** — não há repo entre os 20 estudados que cubra reviews |
| Provider escolhido | **pendente** — recomendação inicial: Judge.me + Shopify nativo (fallback) |

## O que cada peça entrega hoje

### `03_agents/reviews-ops/`

- `flows.md` novo: 4 fluxos (ingest, synthesize, draft_responses, publish interno).
- `tests/fixtures/` com input/output exemplo para modo `synthesize`.
- AGENT.md/prompt.md/contract.yaml/tools.yaml existentes (Fase 3b).

### `04_apps/review-service/`

- `package.json` (workspace `@cao/review-service`), `tsconfig.json`, `.env.example`, `.gitignore`.
- `src/server.ts` placeholder com endpoints HTTP previstos.
- `src/webhooks/`, `src/ingesters/`, `src/workers/`, `src/pipelines/`, `src/orchestration/` — todos com README descrevendo função.
- 5 workers, 3 jobs, 5 webhook handlers (1 por provider com webhook), 3 ingesters (polling) declarados.

### `05_integrations/review-apps/`

- Workspace package `@cao/integration-review-apps`.
- `index.ts` — barrel + `declare function makeProvider(tenant, name)`.
- `types/index.ts` — `Review` normalizado (rating 1.0–5.0, language ISO 639-1, media, author com PII isolada, response, sentiment opcional).
- `errors/index.ts` — 7 classes normalizadas (Auth, RateLimit, NotFound, Unavailable, WebhookSignature, ReplyForbidden, ModerationConflict). Cada erro carrega `provider`.
- `providers.yaml` — 6 providers com flags `webhook`, `reply_api`, `photo_reviews`, `free_tier`, `pricing_notes`, `status`.
- `providers/<name>/index.ts` em stub para 6 providers (judge-me, shopify-native, yotpo, loox, stamped, okendo).
- `providers/README.md` com convenção e ordem de implementação sugerida.

### `02_architecture/integrations/reviews-map.md`

- Mapa end-to-end (ASCII) cobrindo:
  - 6 fontes possíveis com trade-offs.
  - Ingestão (webhook vs polling).
  - PII handling.
  - Moderação (resposta de saída + sinalização de entrada).
  - Publicação + falha.
  - **Impacto SEO** (schema.org JSON-LD + metafields).
  - **Impacto conversão** (AggregateRating, photo carousel, badges, VoC summary).
  - Conexão com outros agentes (product-offer, design-ux-localization, marketing-director, product-feed-seo, merchant-compliance, analytics-optimization).

## Pré-requisitos externos (não controlados pelo monorepo)

| Item | Necessário para | Notas |
|---|---|---|
| Conta no provider escolhido | qualquer call | Judge.me free tier não exige cartão |
| API token do provider por tenant | autenticação | armazenado por tenant em secret manager |
| Webhook secret do provider | verificação HMAC | obtido no dashboard do provider |
| App instalado na loja Shopify | conexão com produto | provider precisa ter dados do shop |
| Shopify metafields namespace `cao` | escrever AggregateRating + VoC summary | criar via Admin GraphQL na primeira sync |
| Redis (worker queue) | jobs + workers | compartilhado com merchant-service em dev |
| Provedor LLM | VoC synthesis + drafts | Anthropic ou Gemini |

## Decisão pendente: provider default

**Recomendação técnica:** começar com **Judge.me + Shopify nativo**.

Justificativa Judge.me:
- Free tier viável para dev e small merchants.
- Webhooks (`reviews/create`, `reviews/update`).
- Reply API formal.
- Photo + video reviews.
- API documentada e comunidade ativa.

Justificativa Shopify nativo (fallback):
- Zero custo extra (já está incluso).
- Cobre lojistas mais simples que não querem app extra.
- Limitações aceitas (sem webhook → polling, sem mídia, reply parcial).

**Decisão pendente** — o usuário precisa confirmar antes de Fase 11.

Alternativas (cada uma só faz sentido se o tenant já usa):
- Yotpo: robusto mas caro; mid-market+.
- Loox: forte em photo/video; sem free tier.
- Stamped: balanceado.
- Okendo: mid-market+.

## Riscos identificados

| Risco | Mitigação |
|---|---|
| Provider muda schema/breaking | normalize.ts isolado por provider; quebrar 1 não afeta outros |
| Custo de provider escala (Yotpo/Okendo) | escolha v0 (Judge.me free) evita early; outros conforme demanda |
| Reviews falsos / spam | sinalização ao lojista; sem filtragem automática |
| Publish falha (rede, deleted) | resposta para `07_memory/audit/responses/`; retry manual |
| PII em logs/memória | scrub agressivo + política de retenção + delete endpoint por tenant |
| Schema.org spam por incluir reviews fracos | threshold: rating ≥ 4 + verified para entrar em JSON-LD |
| Provider sem reply API | fallback markdown + humano publica |
| Webhook storm em flash sale | fila com concurrency limit; debounce em workers caros |

## Decisões em aberto

- [ ] **Provider default** (Judge.me + Shopify nativo proposto).
- [ ] Política de retenção de PII em `working/reviews/`.
- [ ] Token storage por tenant (secret manager vs DB).
- [ ] Threshold de auto-resposta (rating ≤ 3 proposto).
- [ ] Threshold de inclusão em JSON-LD (rating ≥ 4 + verified proposto).
- [ ] Programa Google Customer Reviews / Product Ratings em GMC — quando ativar.
- [ ] Q&A integrado ou não (postergado).
- [ ] Sentiment classifier: heurística vs LLM (LLM proposto, com classifier rápido como fallback).

## Checklist "pronto para Fase 11"

- [ ] Decisão de provider confirmada.
- [ ] Conta criada + API token + webhook secret obtidos (em loja de dev).
- [ ] Redis disponível em dev.
- [ ] `@cao/runtime` mínimo (Fase 7).
- [ ] Fase 8 (Shopify connect) concluída — sem produto Shopify lido, não há vinculação SKU↔review.
- [ ] `@cao/memory` mínimo para `07_memory/<tenant>/working/reviews/`.
- [ ] `@cao/guardrails` com PII scrub funcional.
- [ ] Decisões da seção anterior resolvidas (ou conscientemente deferidas).

## Próximo passo recomendado

Reviews depende fortemente de Shopify (precisa de produtos vinculados). Sequência sugerida:
1. Fase 5 (bootstrap funcional).
2. Fase 6 (clone upstreams).
3. Fase 7 (`@cao/runtime` mínimo).
4. Fase 8 (Shopify connect).
5. Confirmar provider de reviews.
6. **Fase 11** (esta camada): implementar provider escolhido + 1 fluxo end-to-end (ingest → synthesize VoC em sample).
