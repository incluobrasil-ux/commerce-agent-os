# Project status — fonte única do estado real

> Documento curto. Atualizado a cada sub-fase fechada. Para narrativa longa: cérebro operacional em `07_memory/vault/projects/commerce-agent-os/`.

**Última atualização:** 2026-05-25
**Branch ativa:** `feat/system-retomada-operacional` (5 commits ahead de `main`)
**Suíte:** 309 testes em 36 arquivos · smoke: 17

---

## O que está funcional (zero credencial)

| Capacidade | Comando | Output |
|---|---|---|
| Auditor determinístico de repo | `pnpm audit:repo .` | `12_reports/audits/repo-auditor/` |
| Pipeline Merchant dry-run com fixture | `pnpm feed:dry-run` | `12_reports/merchant-dry-runs/` |
| **Merchant audit com scoring + remediação por SKU** | `pnpm merchant:audit --source=json --file=<path>` | `12_reports/merchant-audits/<tenant>/[stores/<store>/]` |
| Multi-tenant/multi-store isolation | smoke `pnpm test:smoke` | 12 testes isolamento |
| Capture run no cérebro | `--capture` em audit:repo, feed:dry-run, merchant:audit | `07_memory/vault/...run-summaries/` |

## O que está funcional (requer credencial)

| Capacidade | Credencial | Comando |
|---|---|---|
| 17 agentes LLM (marketing, criativo, ofertas, etc.) | `ANTHROPIC_API_KEY` | `pnpm marketing:plan`, `creative:assets`, `design:ux`, `traffic:plan`, `product:offer`, `merchant:compliance`, etc. |
| Listar produtos Shopify real | `SHOPIFY_SHOP` + `SHOPIFY_ADMIN_TOKEN` | `pnpm shopify:list-products` |
| Pipeline catalog→SEO→Merchant real | Anthropic + Shopify | `pnpm feed:dry-run --source=shopify --seo` |

## O que está parcial / não migrado ainda

- 5 agentes (`merchant-compliance`, `product-offer`, `marketing-director`, `creative-copy-assets`, `design-ux-localization`) aceitam `--tenant` mas **ainda não aceitam `--store=<id>`**. Pattern estabelecido em `catalog-feed-ops/audit-cli.ts`; migração ~30min por agente.
- `agent.invoked` events vão para `ConsoleProvider` (sem PostHog ativo).
- Shopify client suporta 1 store por processo. Multi-store paralelo no mesmo processo exige store registry (pendente).

## Agentes catalogados (22 total)

| Status | Quantidade | Lista |
|---|---|---|
| REAL_EXECUTABLE | 20 | repo-auditor · audit-synthesizer · learning-memory-curation · memory-context · catalog-feed-ops · customer-journey-ops · finance-margin-radar · visual-asset-ops · ads-launchpad · orchestrator-master · governance-risk-qa · market-intelligence · competitor-benchmark · reviews-ops · product-offer · merchant-compliance · marketing-director · creative-copy-assets · design-ux-localization · traffic-campaigns |
| Library-only (sem CLI) | 1 | product-feed-seo (usado por catalog-feed-ops) |
| Stub | 1 | analytics-optimization (aguardando demanda PostHog) |

## Bloqueios externos (resolva quando precisar)

| ID | Bloqueio | Esforço | Destrava |
|---|---|---|---|
| B1 | `ANTHROPIC_API_KEY` em `.env.local` | 5 min | 17 agentes LLM |
| B6 | Shopify dev store + admin token | ~3 min em Partners | listagem Shopify real + Shopify-source audits |
| B7 | Google Merchant creds (OAuth + account) | 30-60 min | upload real ao GMC (não bloqueia dry-run nem audit local) |

## Próximo bloco recomendado

1. **Migrar 5 agentes restantes para `--store=<id>`** (Opção A, ~30min cada, baixo risco).
2. **N21 — Pipeline LLM real end-to-end** se Anthropic key configurada.
3. **Ampliar `GMC_CATEGORY_OVERRIDES`** com mais categorias além de 3793.

Detalhe em [next-actions](../07_memory/vault/projects/commerce-agent-os/next-actions.md).
