# Project status — fonte única do estado real

> Documento curto. Atualizado a cada sub-fase fechada. Para narrativa longa: cérebro operacional em `07_memory/vault/projects/commerce-agent-os/`.

**Última atualização:** 2026-05-27
**Branch ativa:** `feat/orchestrator-os-consolidation`
**Suíte:** 376 testes em 42 arquivos · smoke: 17 · orchestration: 38

## Marco mais recente — Dispatcher real do Chefe (2026-05-27)

Fechado o **último gap operacional** do `@cao/orchestration`: o runner agora invoca agentes de verdade via shell (`pnpm <agent-command> --tenant --store`) em child_process. Exit codes mapeiam para `StageStatus` (0=completed, 3=skipped_gracefully, *=failed_recoverable). Mais 2 melhorias: (i) `legal-profile.json` é auto-carregado do vault por convenção de path (store-level → tenant fallback), com template em `07_memory/vault/templates/`; (ii) `bundle.requiredPolicies` é populado pelo planner a partir do playbook. **+10 testes** (4 dispatcher + 5 legal-loader + 1 requiredPolicies).

## Marco anterior — Chefe operacional consolidado (2026-05-26)

Pacote `@cao/orchestration` consolida: capability registry (22 agentes), ContextBundle estendido (9 estados), decision policy, 8 playbooks oficiais, planner rule-based, runner com state machine + checkpoints, writeback safety gate, e **camada jurídica internacional BR/EU/US** (11 regras LGPD+CDC+CONAR+ANVISA, GDPR+CRD+Omnibus, FTC+CCPA/CPRA). CLI `pnpm chief` é o entrypoint operacional do sistema.

| Componente | Local |
|---|---|
| Capability registry (22 agentes) | `06_packages/orchestration/src/registry.ts` |
| Camada jurídica (BR LGPD/CDC/CONAR + EU GDPR/CRD/Omnibus + US FTC/CCPA) | `06_packages/orchestration/src/legal.ts` |
| ContextBundle + estados (queued/running/blocked_external/awaiting_approval/...) | `06_packages/orchestration/src/bundle.ts` |
| Policy / guardrails (rota curta vs longa, escalação governance, stop conditions) | `06_packages/orchestration/src/policy.ts` |
| 8 playbooks oficiais | `06_packages/orchestration/src/playbooks.ts` |
| Planner rule-based + intent classification | `06_packages/orchestration/src/planner.ts` |
| Runner com checkpoint/resume | `06_packages/orchestration/src/runner.ts` |
| Writeback safety gate | `06_packages/orchestration/src/writeback-gate.ts` |
| CLI principal | `06_packages/orchestration/scripts/chief-cli.ts` → `pnpm chief` |
| Shell dispatcher real | `06_packages/orchestration/src/dispatcher.ts` |
| Legal-profile auto-loader | `06_packages/orchestration/src/legal-loader.ts` |
| Template legal-profile | `07_memory/vault/templates/legal-profile.example.json` (+ README) |

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

- **6 de 20 agentes** suportam `--store=<id>` (merchant:audit, merchant:compliance, product:offer, marketing:plan, creative:assets, design:ux). Os outros 14 aceitam `--tenant` mas seguem tenant-only — migração incremental sob demanda usa pattern de `catalog-feed-ops/audit-cli.ts`.
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

## Cérebro operacional — 3 camadas

| Camada | Onde mora | Quando ler | Versionado? |
|---|---|---|---|
| **Global** | `07_memory/vault/global/` | quando precisar visão cross-tenant ou padrão arquitetural | ✅ no repo |
| **Tenant** | `07_memory/vault/tenants/<tenantId>/` | quando coordenar operação cross-store ou tomar decisão de produto | ❌ local-only |
| **Store** | `07_memory/vault/tenants/<tenantId>/stores/<storeId>/` | quando executar ação operacional numa loja específica | ❌ local-only |
| **Dev/project** | `07_memory/vault/projects/commerce-agent-os/` | histórico canônico de implementação, ADRs, run-summaries técnicos | ✅ no repo |

**Como evitar misturar contexto:** nunca leia/escreva o vault de outro tenant. Os helpers `assertTenantContext`/`assertTenantStoreContext` garantem que agentes falham cedo se você esquecer. Brain captures vão para o path do tenant/store passado em `--tenant` + `--store`.

## Próximo bloco recomendado

1. **Aplicar findings reais do pipeline LLM Incluo** (compliance review + correções N26.a-d). Ver `vault/tenants/incluo-tenant/stores/incluo/next-actions.md`.
2. **N24 — Handoff entre agentes via memory-context + ContextBundle** (depende de N21 validado ✅).
3. **Migrar próximos agentes** (`traffic-campaigns`, `governance-risk-qa`, etc.) para `--store=<id>` sob demanda.
4. **Ampliar `GMC_CATEGORY_OVERRIDES`** com mais categorias além de 3793.

Detalhe em [next-actions](../07_memory/vault/projects/commerce-agent-os/next-actions.md).
