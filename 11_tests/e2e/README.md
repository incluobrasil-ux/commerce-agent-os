# 11_tests/e2e

Testes **end-to-end** em ambiente **staging completo**. Validam fluxos reais com credenciais reais (mas em lojas de dev / projetos isolados).

## O que cobrir (cenários, não componentes)

| Cenário | Componentes envolvidos | Critério |
|---|---|---|
| **Onboard tenant** | shopify-admin-app OAuth → criar memory vault → instrumentar PostHog | tenant aparece em memory + admin loga |
| **Otimizar feed** | shopify-admin-app → orchestrator → product-feed-seo → governance → catalog-feed-ops (dry-run) | proposed_changes salvos; nada publicado |
| **Aplicar feed aprovado** | continuação do anterior com `governance.decision=approve` | mudanças em Shopify + GMC; productstatus checa pending → approved |
| **Reagir a disapproval** | seed disapproval em GMC → disapproval-monitor → merchant-compliance → product-feed-seo replay | SKU volta para approved após replay |
| **Ingerir review e responder** | Judge.me webhook seed → process-review → reviews-ops draft → governance → publish | resposta aparece em Judge.me |
| **Coletar evento onsite** | usuário simulado navega no tema → product.viewed em PostHog | evento aparece com initiative_id se UTM presente |
| **Plano de marketing** | admin-app → marketing-director → propose plan + creative briefs | plan persistido; briefs prontos para creative-copy-assets |

## Stack

- Playwright para UI (admin-app + tema).
- HTTP client direto para webhooks/jobs/APIs.
- Ambiente: **staging**, não prod.
  - Loja Shopify de dev separada.
  - GMC sub-account com dados sintéticos.
  - PostHog projeto staging.
  - Conta dev de cada provider de review.

## Convenções

- Nome: `<cenario>.e2e.test.ts`.
- **Idempotente** — rodar 2× não corrompe estado de staging.
- **Cleanup** explícito ao fim (não confiar em GC; resetar memory + Shopify metafields + GMC products).
- Tempo: até **30min** para o conjunto.

## Quando roda

- Nightly em staging.
- Pre-release: precisa estar verde.
- **Não roda em pre-commit nem em PR de feature** (caro + lento + flaky se infra de staging quebrar).

## Diferença vs integration

- E2E **fala com Shopify de verdade** (ainda que dev store).
- Integration **mocka** Shopify.
- E2E pode flakar por motivos externos (Shopify devagar, GMC eventual consistency). Toleramos retry; integration não.

## Status

Stub. Implementação acompanha milestones (primeiro cenário viável: "Onboard tenant" após Fase 8).
