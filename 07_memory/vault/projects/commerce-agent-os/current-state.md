---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-25T22:10:16.504Z
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
| Sub-fase | 2.5 ✅ Bloco A+B + 2.6 ✅ + 2.7 ✅ + 2.8 ✅ Merchant audit MVP + **N26 ✅ audit real Incluo** |
| Último marco (2026-05-25) | **N26 — Audit real do catálogo Incluo** via MCP Shopify (50 SKUs, score médio **81.9/100**, 49🟢/0🟡/1🔴). 4 follow-ups operacionais (N26.a-d) + 3 gaps de regra para N20.1. Detalhe em [run-summary](run-summaries/2026-05-25-audit-merchant-audit-incluo-json.md). **241 testes verdes** (nenhum código novo nesta rodada). |
| Próximo marco técnico | **N26.a-d** — follow-ups acionáveis do audit Incluo (corrigir price=0 / decisão GTIN / mapping GMC taxonomy / bulk title brand). Depois N20.1 (presets do scorer) + N21 (pipeline LLM real). Detalhe em [next-actions.md](next-actions.md). |

## Verde

- `pnpm install / typecheck / lint / test / test:smoke / doctor` — todos OK.
- **20 agentes REAL_EXECUTABLE** de 22 catalogados (ver [agents-catalog.md](agents-catalog.md) ou rodar audit):
  - **Bloco A (5/5):** orchestrator-master · governance-risk-qa · market-intelligence · competitor-benchmark · reviews-ops
  - **Bloco B (6/6):** product-offer · merchant-compliance · marketing-director · creative-copy-assets · design-ux-localization · traffic-campaigns
  - **Outros (9):** repo-auditor · audit-synthesizer · learning-memory-curation · memory-context · catalog-feed-ops · customer-journey-ops · finance-margin-radar · visual-asset-ops · ads-launchpad
  - **Library-only:** product-feed-seo (usado por catalog-feed-ops)
  - **STUB sem demanda:** analytics-optimization (não scaffoldado)
- **23 comandos `pnpm <verbo>:<noun>`** registrados em [package.json](../../../../package.json).
- **`pnpm merchant:audit [--source=fixture|json|shopify]`** — audit catalog-level determinístico: score por SKU + findings classificados + remediações. **100% local sem LLM, sem credenciais.** Relatório em `12_reports/merchant-audits/`.
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

> 20/22 agentes reais + Merchant audit MVP rodado em catálogo real Incluo (50 SKUs, score 81.9/100, 1 SKU red acionável + 4 follow-ups). 241 testes verdes. Próximo: executar N26.a-d (ops) e N20.1 (dev: presets de regra por categoria).

Detalhe em [blockers-and-risks.md](blockers-and-risks.md).
