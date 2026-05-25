---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-25T17:15:00.000Z
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
| Sub-fase | 2.5 ✅ Bloco A+B completos (20/22 agentes reais) + 2.6 ✅ + 2.7 ✅ |
| Último marco (2026-05-25) | **4 agentes Bloco B implementados** — `marketing-director`, `creative-copy-assets`, `design-ux-localization`, `traffic-campaigns`. Suíte saltou 202 → **228 testes verdes em 33 arquivos**. Lint OK, doctor verde. |
| Próximo marco técnico | Phase 4 — enhance Merchant MVP (score por SKU, findings detalhados) **OU** conectar `.env.local` (Anthropic + Shopify) para runs reais end-to-end. |

## Verde

- `pnpm install / typecheck / lint / test / test:smoke / doctor` — todos OK.
- **20 agentes REAL_EXECUTABLE** de 22 catalogados (ver [agents-catalog.md](agents-catalog.md) ou rodar audit):
  - **Bloco A (5/5):** orchestrator-master · governance-risk-qa · market-intelligence · competitor-benchmark · reviews-ops
  - **Bloco B (6/6):** product-offer · merchant-compliance · marketing-director · creative-copy-assets · design-ux-localization · traffic-campaigns
  - **Outros (9):** repo-auditor · audit-synthesizer · learning-memory-curation · memory-context · catalog-feed-ops · customer-journey-ops · finance-margin-radar · visual-asset-ops · ads-launchpad
  - **Library-only:** product-feed-seo (usado por catalog-feed-ops)
  - **STUB sem demanda:** analytics-optimization (não scaffoldado)
- **22 comandos `pnpm <verbo>:<noun>`** registrados em [package.json](../../../../package.json).
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

> Sub-fase 2.5 ✅ Bloco A+B completo (**20/22 agentes reais**, 228 testes verdes); pipeline `Shopify → SEO → Merchant` 100% local com fixture; bloqueios externos B1/B6/B7 são apenas para runs reais end-to-end, **não travam desenvolvimento**.

Detalhe em [blockers-and-risks.md](blockers-and-risks.md).
