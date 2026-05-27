---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-27T00:50:00Z
tags: [current-state, status]
source: mixed
confidence: 1.0
---

# Current State

**Para que serve:** snapshot **curtíssimo** do estado da operação. Quem abre isto deve saber em 60 segundos onde estamos. Sem narrativa, sem links — só status.

**Como usar:** atualizar **toda vez** que mudar fase, marco, bloqueio ou status verde/vermelho. Quem fizer a alteração também atualiza `updated_at` no frontmatter.

**Output que gera:** snapshot único e atual da operação.

**Regra:** ≤ 25 linhas no corpo. Se estiver crescendo, alguma informação deveria estar em `ops-brief.md` ou `workstreams.md`.

---

## Fase

| | |
|---|---|
| Macro-fase | 2 — Implementação |
| Sub-fase | 2.5 ✅ + 2.6 (caminho mínimo ✅ + writeback minimal ✅) + 2.7 ✅ + 2.8 ✅ + N26 ✅ + N20.1 ✅ + 2.9 ✅ + 2.9.1 ✅ + N21 ✅ + **N20.2 ✅** + **N26.a/e ✅** |
| Último marco (2026-05-27) | **Dispatcher real do Chefe** — `pnpm chief --execute` invoca agentes de verdade via child_process (`pnpm <cmd> --tenant --store`). Exit code → StageStatus. Auto-load de `legal-profile.json` do vault por convenção. `bundle.requiredPolicies` populado. Template versionado em `07_memory/vault/templates/legal-profile.example.json`. **+10 testes** (orchestration: 28→38). Suíte total: **376 testes em 42 arquivos**. [run-summary](run-summaries/2026-05-27-impl-milestone-chief-dispatcher-real.md). |
| Marco anterior (2026-05-26 noite) | **Chefe OS consolidado** — `@cao/orchestration` (registry 22 agentes + 8 playbooks + ContextBundle estendido + planner + runner com checkpoints + writeback gate + camada jurídica BR/EU/US 11 regras). [run-summary](run-summaries/2026-05-26-impl-milestone-chief-os-consolidation.md). |
| Próximo marco técnico | **(a) cada loja real precisa do `legal-profile.json` próprio** em `tenants/<t>/stores/<s>/` (template + README disponíveis). **(b) provisionar `SHOPIFY_ADMIN_TOKEN`** para destravar `--mode=writeback` real. **(c) adotar exit code `3` (SKIPPED gracioso)** nos 17 agentes LLM quando key ausente — melhora precisão do bundle.status. **(d) writeback-gate bloquear** quando `requiredPolicies` não estiverem em `profile.existingPolicies`. Detalhe em [next-actions.md](next-actions.md). |

## Verde

- `pnpm install / typecheck / lint / test / test:smoke / doctor` — todos OK (333 testes em 39 arquivos).
- **20 agentes REAL_EXECUTABLE** de 22 catalogados (ver [agents-catalog.md](agents-catalog.md) ou rodar audit):
  - **Bloco A (5/5):** orchestrator-master · governance-risk-qa · market-intelligence · competitor-benchmark · reviews-ops
  - **Bloco B (6/6):** product-offer · merchant-compliance · marketing-director · creative-copy-assets · design-ux-localization · traffic-campaigns
  - **Outros (9):** repo-auditor · audit-synthesizer · learning-memory-curation · memory-context · catalog-feed-ops · customer-journey-ops · finance-margin-radar · visual-asset-ops · ads-launchpad
  - **Library-only:** product-feed-seo (usado por catalog-feed-ops)
  - **STUB sem demanda:** analytics-optimization (não scaffoldado)
- **24 comandos `pnpm <verbo>:<noun>`** registrados em [package.json](../../../../package.json) (incluindo `shopify:writeback`).
- **`pnpm merchant:audit [--source=fixture|json|shopify]`** — audit catalog-level determinístico: score por SKU + findings classificados + remediações. **100% local sem LLM, sem credenciais.** Relatório em `12_reports/merchant-audits/`.
- **`pnpm shopify:writeback`** — parser compliance MD → diff → dry-run (default) ou `--apply` (gate explícito) → audit log sempre escrito em `vault/tenants/<t>/stores/<s>/shopify-writeback/`. Dry-run end-to-end validado em Incluo.
- **6 packages `@cao/*`** + 5 integrations + brain-bridge funcionando.
- `repo-auditor` modo determinístico (sem credenciais).
- `pnpm feed:dry-run` — pipeline Merchant completo, 100% local com fixture, gera relatório em `12_reports/merchant-dry-runs/`.
- `@cao/brain-bridge.captureRun()` + `--capture` em agentes que escrevem outputs.
- `pnpm doctor` — 10 checks cross-platform.
- Pre-commit gitleaks ativo (8.30.1).
- CI no GitHub Actions; branch protection em `main`; tag `v0.1.0-architecture-baseline`.
- 8 ADRs aceitos.
- Cérebro operacional v1 multi-operador estruturado.

## Bloqueado

- **B1** — `.env.local` precisa Anthropic key rotacionada (todos os 17 agentes LLM saem `SKIPPED` graceful sem ela; nada quebra).
- **B6** — `SHOPIFY_SHOP` + `SHOPIFY_ADMIN_TOKEN` ausentes (criar custom app em dev store ~3 min destrava primeira demo Shopify real).
- **B7** — Google Merchant creds (apenas para upload real; `pnpm feed:dry-run` já funciona local com fixture).

## Resumo em 1 linha

> Sub-fase 2.6 writeback minimal ✅: loop compliance MD → diff → dry-run/apply → audit log fechado em código. Dry-run validado em Incluo (9 revisões parsed, 2 placeholders skipados, 7 not-found por falta de token). **333 testes verdes** (+24). Bloqueador para `--apply` real: provisionar `SHOPIFY_ADMIN_TOKEN` + revisão jurídica do compliance HIGH.

Detalhe em [blockers-and-risks.md](blockers-and-risks.md).
