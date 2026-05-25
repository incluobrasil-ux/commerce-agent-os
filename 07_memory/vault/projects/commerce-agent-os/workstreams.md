---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-25T18:40:00Z
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
| Status | 🟢 (**20 agentes reais** de 22; Bloco A+B + Merchant audit MVP em 2026-05-25) |
| Escopo | 22 agentes declarativos virando executáveis. |
| Último marco | **Merchant audit MVP** — `pnpm merchant:audit` produz score por SKU + findings categorizados + remediações (determinístico, 241 testes verdes). |
| Próximo marco | **N26** — rodar Merchant audit em catálogo Shopify real (Catálogo); depois **N21** ligar pipeline LLM Marketing → Criativo → Vitrine → Catálogo → Produtos → Merchant. |
| Dono sugerido | dev + ops (creds) |
| Depende de | Shopify dev store + token (N26); ANTHROPIC_API_KEY (N21). Nada para desenvolvimento. |
| Itens ativos | N26 (prioridade imediata), N21, N20.1, N24 — ver [next-actions.md](next-actions.md). |
| Refs | [03_agents/](../../../../03_agents/), [`2026-05-25-impl-milestone-merchant-audit-mvp.md`](run-summaries/2026-05-25-impl-milestone-merchant-audit-mvp.md), [`2026-05-25-impl-milestone-four-new-agents.md`](run-summaries/2026-05-25-impl-milestone-four-new-agents.md) |

## W3 — Shopify connect

| | |
|---|---|
| Status | ⚪ |
| Escopo | `04_apps/shopify-admin-app` + `04_apps/shopify-theme` + `05_integrations/shopify/`. OAuth, webhooks, Admin GraphQL. |
| Último marco | Scaffolds completos (Macro-fase 1 pré-trabalho de Fase 8) |
| Próximo marco | OAuth funcionando em loja de dev + 1 webhook handler real |
| Dono sugerido | dev |
| Depende de | W1 mergeada, upstream `shopify-app-template` clonado, dev store criada (Shopify Partners) |
| Itens ativos | P5 (clonar template), P12, P13 (em `depois`) |
| Refs | [`02_architecture/integrations/shopify-map.md`](../../../../02_architecture/integrations/), [`12_reports/audits/shopify-readiness.md`](../../../../12_reports/audits/shopify-readiness.md) |

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
| Escopo | `07_memory/` (este cérebro + vault tenants), `10_ops/` (runbooks, security, scripts), políticas de retenção, secret manager. |
| Último marco | Cérebro operacional v1 estruturado para multi-operador |
| Próximo marco | uso real do protocolo em ≥ 2 sessões de operadores diferentes + 1 handoff funcional |
| Dono sugerido | ops |
| Depende de | — |
| Itens ativos | — (manutenção contínua) |
| Refs | [project-home.md](project-home.md), [sync-protocol.md](sync-protocol.md), [source-of-truth.md](source-of-truth.md) |

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
