---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-27T18:30:00Z
tags: [brief, status]
source: mixed
confidence: 1.0
---

# Ops Brief

**Para que serve:** brief operacional vivo. Em 1 minuto, dá pra saber em que estado cada bloco do sistema está e quais são os próximos 3 focos.

**Como usar:** revisar 1× por semana ou ao trocar de sub-fase. Mantém-se curto. Para "onde estamos agora **mesmo**", ir antes em [current-state.md](current-state.md). Para fila completa, [operational-priorities.md](operational-priorities.md). Para trilhas paralelas, [workstreams.md](workstreams.md).

**Output que gera:** semáforo do projeto + foco de execução.

---

## Semáforo dos blocos

Legenda: 🟢 funciona / 🟡 parcial / 🔴 não funciona / ⚪ não iniciado.

| Bloco | Estado | Observação |
|---|---|---|
| Estrutura do monorepo | 🟢 | 28+ workspaces, project references OK |
| QA stack (lint/test/typecheck/smoke) | 🟢 | **378 testes verdes em 42 arquivos** + smoke 17/17 + doctor 10🟢/0🟡/0🔴 |
| `@cao/core` | 🟢 | errors / result / clock / id / retry + branded types multi-tenant + assertions |
| `@cao/observability` | 🟢 | console + silent providers + audit hook |
| `@cao/guardrails` | 🟢 | validate(zod) + PII + secrets |
| `@cao/memory` | 🟢 | CRUD markdown com isolamento por tenant/store |
| `@cao/llm` | 🟢 | Anthropic real validado + noop fallback + `pnpm llm:smoke` |
| `@cao/runtime` | 🟢 | fluxo completo invocado em runtime via `audit-synthesizer` + outros LLM |
| `@cao/brain-bridge` | 🟢 | captura em `vault/tenants/<t>/[stores/<s>/]` com `--capture` |
| **`@cao/orchestration`** | 🟢 | **Chefe OS consolidado** — registry 22 agentes, 8 playbooks, planner, runner com checkpoints, writeback-gate, camada legal BR/EU/US, dispatcher real via child_process |
| **`pnpm chief` CLI** | 🟢 | entrypoint operacional NL → playbook → rota → dispatcher → checkpoint retomável |
| **Camada legal BR/EU/US** | 🟢 | 11 regras hard/soft + 9 risk types + 5 decisions + auto-load de `legal-profile.json` do vault + writeback-gate bloqueia por `requiredPolicies` |
| 20 agentes REAL_EXECUTABLE | 🟢 | repo-auditor · audit-synthesizer · learning-memory-curation · memory-context · catalog-feed-ops · customer-journey-ops · finance-margin-radar · visual-asset-ops · ads-launchpad · orchestrator-master · governance-risk-qa · market-intelligence · competitor-benchmark · reviews-ops · product-offer · merchant-compliance · marketing-director · creative-copy-assets · design-ux-localization · traffic-campaigns |
| `product-feed-seo` | 🟡 | library-only (consumido por catalog-feed-ops) |
| `analytics-optimization` | 🔴 | stub, aguarda demanda PostHog |
| Pre-commit (biome+smoke+gitleaks+commitlint) | 🟢 | ativo, gitleaks 8.30.1 |
| Apps (`04_apps/`) | 🟡 | `shopify-admin-app/scripts/writeback.ts` operacional; outros scaffolds |
| Integrações (`05_integrations/`) | 🟢 (shopify) / 🟡 (outras) | `shopify/{client,oauth,writeback}` funcional; google-merchant client OK; demais com contratos |
| Upstreams (`01_upstreams/`) | 🟡 | 2/10 clonados (langgraph + shopify-app-template). Outros 8 sob demanda. |
| Memória (`07_memory/`) | 🟢 | _template + cérebro multi-operador + templates (legal-profile) + tenants/incluo local |
| CI | 🟢 | lint+typecheck+smoke+commitlint em PR |
| CD | ⚪ | sem deploy ainda |
| Security operacional | 🟡 | secret-scan ativo; sem secret manager central, retenção não definida |
| Ferramenta auxiliar `prompt-master` | 🟢 | opcional, user-level em `~/.claude/skills/`, fora do core (doc em `10_ops/scripts/PROMPT_MASTER.md`) |

Quem precisa do estado **agora mesmo** (verde/bloqueado, sem detalhe) → [current-state.md](current-state.md).
Quem precisa de divisão por trilha → [workstreams.md](workstreams.md).

## Marcos alcançados

- 2026-05-23 — Macro-fase 1 (scaffold) + bootstrap funcional + repo público + tag `v0.1.0-architecture-baseline`.
- 2026-05-23 — Cérebro operacional v1 (multi-operador) estruturado.
- 2026-05-23 — Primeiros agentes reais: `repo-auditor`, `audit-synthesizer` (1ª chamada LLM real, $0.0099), `learning-memory-curation`, `memory-context`.
- 2026-05-24 — `@cao/brain-bridge` (`--capture` + `pnpm ops:capture`).
- 2026-05-25 — Bloco B (4 agentes novos: marketing/creative/design/traffic) + Merchant audit MVP + Multi-tenant/multi-store hardening (309 testes verdes).
- 2026-05-26 — N20.1/N20.2 scorer com claims terapêuticos PT-BR; N21 pipeline LLM real Incluo ($0.174); N26 com 8 mutations Shopify aplicadas + T2 + SKU normalization (50 mutations totais, Incluo ALL GREEN no scorer).
- 2026-05-26 — Sub-fase 2.6 writeback minimal merged (PR #18).
- 2026-05-26 — **`@cao/orchestration` consolidado** ([summary](run-summaries/2026-05-26-impl-milestone-chief-os-consolidation.md)): registry + ContextBundle estendido + planner + runner + writeback-gate + camada legal BR/EU/US + 8 playbooks + CLI `pnpm chief`.
- 2026-05-27 — **Dispatcher real do Chefe** ([summary](run-summaries/2026-05-27-impl-milestone-chief-dispatcher-real.md)): `noopDispatcher` substituído por `makeShellDispatcher` que invoca `pnpm <agent-cmd>` via child_process; auto-load de `legal-profile.json`; `bundle.requiredPolicies` populado.
- 2026-05-27 — Writeback-gate bloqueia quando `requiredPolicies` ausentes no `legalProfile.existingPolicies`.
- 2026-05-27 — `prompt-master` integrado como skill auxiliar user-level (fora do repo).

## Próximos 3 focos

1. **N29** — criar `legal-profile.json` para Incluo (e outras lojas reais) em `vault/tenants/<t>/stores/<s>/` — template pronto, ~5 min por loja.
2. **N27 / B6** — provisionar `SHOPIFY_ADMIN_TOKEN` em `.env.local` (~3 min em Partners) + primeiro `pnpm chief --execute --mode=writeback` real em SKU de baixo risco.
3. **N28** — adotar exit code `3` (SKIPPED gracioso) nos 17 agentes LLM (hoje só `catalog-feed-ops` segue convenção). Bulk, ~2-3h, baixa prioridade.

## Critério para "Chefe OS pronto para uso operacional do time"

- ✅ Registry + playbooks + planner + runner + writeback-gate + camada legal completos.
- ✅ Dispatcher real (não-noop) que invoca agentes via shell com checkpoint/resume.
- ✅ Auto-load de `legal-profile.json` do vault.
- ✅ `bundle.requiredPolicies` enforcement no gate.
- ✅ 378 testes verdes em 42 arquivos, doctor 10🟢.
- ✅ Doc para equipe: `COMMANDS.md`, `SETUP_LOCAL.md`, `PROMPT_MASTER.md`, vault `README.md`.
- ⏳ Primeira execução `--mode=writeback` real em loja Incluo (depende de SHOPIFY_ADMIN_TOKEN + legal-profile + revisão jurídica).
