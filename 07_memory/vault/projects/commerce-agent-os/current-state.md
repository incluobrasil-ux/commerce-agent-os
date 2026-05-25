---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-25T18:10:00.000Z
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
| Sub-fase | 2.5 ✅ Bloco A+B + 2.6 ✅ + 2.7 ✅ + **2.8 ✅ Merchant audit MVP** |
| Último marco (2026-05-25) | **Merchant MVP útil de verdade** — `pnpm merchant:audit --source=json --file=<path>` produz relatório SKU-level com score 0-100, findings categorizados (critical/high/medium/low), remediações concretas. Determinístico (sem LLM). Validado em fixture de 5 SKUs: score médio 37.4, 6 critical/2 high/17 medium/7 low findings, exit 1 se há red SKU. **241 testes verdes em 34 arquivos** (+13 do scorer). |
| Próximo marco técnico | Conectar `.env.local` (Anthropic + Shopify) para runs reais LLM + Shopify real. OU evoluir audit (mais regras, presets por categoria, GMC API real). |

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

> Sub-fase 2.5 ✅ + **2.8 ✅ Merchant audit MVP** — 20/22 agentes reais, **241 testes verdes**, `pnpm merchant:audit` gera score+remediações por SKU sem LLM/creds; bloqueios externos B1/B6/B7 são apenas para runs reais end-to-end, **não travam desenvolvimento**.

Detalhe em [blockers-and-risks.md](blockers-and-risks.md).
