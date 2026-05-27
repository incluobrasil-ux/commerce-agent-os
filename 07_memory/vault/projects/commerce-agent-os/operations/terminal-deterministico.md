---
aliases: [Terminal 1, Terminal Determinístico, Determinístico, Zero-Credencial]
tags: [operations-map, role:terminal-deterministic]
icon: icons/terminal-deterministico.svg
category: agents-deterministic
color: "#16A34A"
technical_name: Agentes determinísticos (sem LLM)
technical_path: 03_agents/{repo-auditor,catalog-feed-ops}, 05_integrations/google-merchant
---

# Terminal de Execução 1 — Determinístico

**Papel:** rodar agentes sem LLM. Saída previsível, custo zero, sem credencial. Ideal para auditoria, scoring, validação local.

**Agentes:**
- **`repo-auditor`** — audita estrutura/licenças de qualquer repo (`pnpm audit:repo <path>`)
- **`catalog-feed-ops`** — scoring de catálogo Shopify contra políticas Google Merchant (`pnpm merchant:audit`)
- **`audit-synthesizer`** modo deterministic — consolida findings em síntese
- **Shopify writeback dry-run** — parser MD → diff → audit log (sem `--apply`)

**Quem chama:** [[chefe-da-operacao]] em playbooks `merchant-audit`, `store-readiness`, `cross-store-diagnostic`. Ou diretamente via [[painel-do-operador]].

**Saída:** `12_reports/merchant-audits/<tenant>/[stores/<store>/]<file>.md`

**Bloqueio:** nenhum (zero credencial).
