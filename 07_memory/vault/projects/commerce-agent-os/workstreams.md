---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-27T17:55:00Z
tags: [workstreams, parallel-tracks]
source: mixed
confidence: 1.0
---

# Workstreams

**Para que serve:** dividir a operação em **trilhas paralelas** com responsabilidade clara e status próprio. Em vez de um backlog único onde tudo compete, cada trilha tem foco e próximo marco — operadores diferentes podem puxar de trilhas diferentes sem colidir.

**Como usar:** ao escolher item em [next-actions.md](next-actions.md) ou [operational-priorities.md](operational-priorities.md), ver de qual trilha vem. Trilhas com 🟢 podem ser paralelizadas; trilhas em 🔴 bloqueiam apenas elas mesmas.

**Output que gera:** mapa de "onde dá pra trabalhar em paralelo agora".

**Convenções:**
- Status: 🟢 ativa / 🟡 parcial / 🔴 bloqueada / ⚪ não iniciada.
- "Próximo marco" = primeiro entregável visível da trilha.
- "Dono sugerido" = papel, não pessoa.

---

## W1 — Bootstrap / Runtime

| | |
|---|---|
| Status | 🟢 |
| Escopo | núcleo `@cao/*` (core, llm, memory, guardrails, observability, runtime); QA stack; CI; convenções |
| Último marco | Sub-fase 2.2 verde local + repo-auditor + 52 testes verdes |
| Próximo marco | trabalho local commitado e mergeado em `main` |
| Dono sugerido | dev |
| Depende de | — |
| Itens ativos | P1 (commit + PR) |
| Refs | [`2026-05-23-test-milestone-sub-phase-2-2-suite-green.md`](run-summaries/2026-05-23-test-milestone-sub-phase-2-2-suite-green.md) |

## W2 — Agentes

| | |
|---|---|
| Status | 🟢 (**20 agentes reais** de 22; N26 + N20.2 + N21 concluídos; Chefe OS consolidado) |
| Escopo | 22 agentes declarativos executáveis + camada de orquestração (`@cao/orchestration`). |
| Último marco | **Dispatcher real do Chefe** (2026-05-27) — `pnpm chief --execute` invoca agentes via shell. Writeback-gate verifica `requiredPolicies` do bundle contra `legal-profile.existingPolicies`. Suíte 378+ verdes. |
| Próximo marco | **(a) cada loja real configura `legal-profile.json`** próprio; **(b) adotar exit code `3` (SKIPPED) nos 17 agentes LLM** (hoje só `catalog-feed-ops` segue a convenção — dispatcher mapeia exit code → StageStatus mas agentes não emitem `3`); **(c) primeiro `pnpm chief --execute --mode=writeback` real após token Shopify provisionado**. |
| Dono sugerido | dev + ops (creds) |
| Depende de | (a) decisão produto por loja; (b) refactor mecânico bulk; (c) `SHOPIFY_ADMIN_TOKEN` em `.env.local`. |
| Itens ativos | N27 (writeback real), exit-code-3 follow-up, legal-profile per-store — ver [next-actions.md](next-actions.md). |
| Refs | [03_agents/](../../../../03_agents/) · [`2026-05-27-impl-milestone-chief-dispatcher-real.md`](run-summaries/2026-05-27-impl-milestone-chief-dispatcher-real.md) · [`2026-05-26-impl-milestone-chief-os-consolidation.md`](run-summaries/2026-05-26-impl-milestone-chief-os-consolidation.md) |

## W3 — Shopify connect

| | |
|---|---|
| Status | 🟡 (Admin GraphQL + writeback funcional via CLI; OAuth Public App + webhooks ainda não) |
| Escopo | `05_integrations/shopify/` (Admin client + writeback + OAuth helpers); `04_apps/shopify-admin-app` (scripts) + `04_apps/shopify-theme` (scaffolds). |
| Último marco | **Sub-fase 2.6 writeback minimal + N26.a/e/T2 aplicados (2026-05-26)** — `pnpm shopify:writeback` parser MD → diff → dry-run/apply → audit log; 50 mutations Shopify reais aplicadas; loja Incluo ALL GREEN no scorer (50🟢/0🟡/0🔴). |
| Próximo marco | (a) primeiro `pnpm chief --execute --mode=writeback` real após token + legal-profile (N27); (b) OAuth Public App funcionando para multi-store no mesmo processo. |
| Dono sugerido | dev + ops |
| Depende de | `SHOPIFY_ADMIN_TOKEN` em `.env.local` (B6); revisão jurídica do compliance HIGH antes de PDPs sensíveis. |
| Itens ativos | N27 (writeback real), OAuth Public App. |
| Refs | [`05_integrations/shopify/`](../../../../05_integrations/shopify/) · [`2026-05-26-impl-milestone-shopify-writeback-minimal.md`](run-summaries/2026-05-26-impl-milestone-shopify-writeback-minimal.md) · [`2026-05-26-impl-milestone-t2-applied-sku-normalized.md`](run-summaries/2026-05-26-impl-milestone-t2-applied-sku-normalized.md) |

## W4 — Merchant feed

| | |
|---|---|
| Status | ⚪ |
| Escopo | `04_apps/merchant-service` + `04_apps/feed-service` + `05_integrations/google-merchant/`. Pipelines de SKU, compliance, disapproval monitor. |
| Último marco | Scaffolds + contratos (Macro-fase 1 pré-trabalho de Fase 9) |
| Próximo marco | 1 pipeline `optimize-skus` end-to-end (sem aplicar) |
| Dono sugerido | dev |
| Depende de | W3 (precisa de Shopify lendo SKUs) + ADR-0011 (feedgen) + ADR-0008 (queue) |
| Itens ativos | — |
| Refs | [`12_reports/audits/merchant-feed-seo-readiness.md`](../../../../12_reports/audits/merchant-feed-seo-readiness.md) |

## W5 — Analytics

| | |
|---|---|
| Status | ⚪ |
| Escopo | `04_apps/analytics-service` + `05_integrations/posthog/`. Taxonomia canônica, instrumentação, HogQL. |
| Último marco | Taxonomia + scaffold + adapter (Macro-fase 1 pré-trabalho de Fase 10) |
| Próximo marco | `agent.invoked` do `repo-auditor` instrumentado em PostHog dev |
| Dono sugerido | dev |
| Depende de | W2 (1º agente rodando) + ADR-0013 (PostHog cloud/self-host) + projeto PostHog dev criado |
| Itens ativos | — |
| Refs | [`02_architecture/integrations/posthog-map.md`](../../../../02_architecture/integrations/), [`12_reports/audits/analytics-readiness.md`](../../../../12_reports/audits/analytics-readiness.md) |

## W6 — Reviews + Marketing/Creative

| | |
|---|---|
| Status | ⚪ |
| Escopo | `04_apps/review-service`, `04_apps/creative-ops-service`, `05_integrations/review-apps/`, `05_integrations/higgsfield/`. |
| Último marco | Scaffolds + contratos + benchmark de marketing-creative-stack (Macro-fase 1) |
| Próximo marco | ingest Judge.me end-to-end OU 1 criativo via provider de mídia |
| Dono sugerido | dev + produto |
| Depende de | ADR-0012 (reviews default), ADR-0014/0015 (mídia + storage), upstreams higgsfield clonados |
| Itens ativos | — |
| Refs | [`12_reports/benchmarks/marketing-creative-stack.md`](../../../../12_reports/benchmarks/marketing-creative-stack.md), [`12_reports/audits/reviews-readiness.md`](../../../../12_reports/audits/reviews-readiness.md) |

## W7 — Memory / Ops / Cérebro

| | |
|---|---|
| Status | 🟢 |
| Escopo | `07_memory/` (este cérebro + vault tenants), `10_ops/` (runbooks, security, scripts), políticas de retenção, secret manager, ferramentas auxiliares de operador (`prompt-master` opcional). |
| Último marco | Cérebro operacional v1 estruturado para multi-operador + `prompt-master` documentado como skill auxiliar user-level (2026-05-27). |
| Próximo marco | uso real do protocolo em ≥ 2 sessões de operadores diferentes + 1 handoff funcional |
| Dono sugerido | ops |
| Depende de | — |
| Itens ativos | — (manutenção contínua) |
| Refs | [project-home.md](project-home.md), [sync-protocol.md](sync-protocol.md), [source-of-truth.md](source-of-truth.md), [PROMPT_MASTER.md](../../../../10_ops/scripts/PROMPT_MASTER.md) |

## W8 — Security / QA / Hardening

| | |
|---|---|
| Status | 🟡 |
| Escopo | gitleaks ativo, simple-git-hooks ativo, SAST, performance baselines, override humano de `block`, política de retenção. |
| Último marco | QA stack aceita (ADR-0006); CI lint+typecheck+smoke+commitlint OK |
| Próximo marco | `gitleaks` binário instalado + pre-commit ativo |
| Dono sugerido | ops |
| Depende de | — (algumas decisões futuras: ADR-0016 secret manager) |
| Itens ativos | P11 (em `próximo`) |
| Refs | [`10_ops/security/security-checklist.md`](../../../../10_ops/security/), [`12_reports/audits/security-qa-readiness.md`](../../../../12_reports/audits/security-qa-readiness.md) |

---

## Trilhas paralelizáveis agora

Sem colisão se feitas simultaneamente:

- W1 (commit + PR) ⟂ W7 (uso do protocolo) ⟂ W8 (polish residual).

Após W1 mergeada:
- W2 desbloqueia → W5 desbloqueia em sequência.
- W3 paraleliza com W2 se houver 2 devs (W2 não precisa Shopify; W3 não precisa LLM).

---

## Regras

- Trilha nova → ADR ou justificativa em [decision-index.md](decision-index.md).
- Status muda → bater `updated_at` aqui + atualizar [current-state.md](current-state.md) se for trilha crítica (W1, W2, W7).
- Trilha 🔴 sustentada por > 2 sessões consecutivas → revisar bloqueio em [blockers-and-risks.md](blockers-and-risks.md).
