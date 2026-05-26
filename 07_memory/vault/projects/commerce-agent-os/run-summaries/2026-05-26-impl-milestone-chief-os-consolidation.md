---
created_at: 2026-05-26T23:30:00Z
updated_at: 2026-05-26T23:30:00Z
tags: [chief, orchestration, registry, playbooks, legal, br, eu, us, impl-milestone]
source: orchestrator-master + new @cao/orchestration package
kind: impl-milestone
result: green
confidence: 1.0
related:
  - 06_packages/orchestration/
  - 06_packages/orchestration/scripts/chief-cli.ts
---

# `@cao/orchestration` + `pnpm chief` — Chefe operacional consolidado (BR/EU/US)

## Contexto

Usuário pediu retomada operacional do projeto após sessão anterior. Objetivo: transformar o `orchestrator-master` em **Chefe real** com capability registry, playbooks oficiais, ContextBundle padronizado, checkpoints/resume, decision policy, multi-store hardening, writeback gate seguro **e camada jurídica internacional BR/EU/US**.

Regras: não reescrever arquitetura, não criar sistema paralelo, não quebrar CLIs existentes, evolução incremental compatível.

## O que foi entregue

### Novo package `@cao/orchestration` (8 módulos + 28 testes verdes)

| Módulo | Responsabilidade |
|---|---|
| `registry.ts` | Capability map de 22 agentes: tier, modes, credentials, kind (deterministic/llm/mixed), contextSupport (tenant-only/tenant-or-store), inputs/outputs, predecessors/successors, sideEffects, executable status. |
| `legal.ts` | Matrix regulatória BR (LGPD+CDC+CONAR), EU (GDPR+CRD+Omnibus), US-FED (FTC) + US-CA (CCPA/CPRA). 11 regras determinísticas. `StoreLegalProfile` + `evaluateOperation()` → allowed / allowed_with_warnings / blocked_pending_legal_review / blocked_missing_policy / blocked_missing_market_profile. |
| `bundle.ts` | `OrchestrationBundle` estende ContextBundle do `@cao/core`: objective, executionScope, executionMode, stage, status (9 estados), plannedRoute, artifacts, findings, blockers, decisionTrail, confidence, nextRecommendedStep, + campos legais (jurisdictions, legalRiskLevel, legalFindings, requiredPolicies, requiresHumanApproval, legalEscalationReason). |
| `policy.ts` | `shouldRunAgent` (filtra por credencial + escopo + modo) + `selectRouteLength` (short/full) + `shouldEscalateGovernance` + `shouldStop`. Determinístico. |
| `playbooks.ts` | 8 playbooks oficiais: merchant-audit, offer-improvement, marketing-creative-chain, pdp-ux-review, governance-review, store-readiness, cross-store-diagnostic, safe-shopify-writeback. Cada um declara steps, prerequisites, stopCriteria, expectedOutputs, credentialsHelpful, requiresHumanApproval, supportedJurisdictions, relevantLegalRisks, requiredPolicies, canAuditOnly. |
| `planner.ts` | `classifyIntent` (10 categorias rule-based, sem LLM) + `pickPlaybook` (mapping) + `planRun` (gera ExecutionPlan completo com bundle inicial, filtragem por credenciais, rebaixamento writeback→dry-run quando faltar token/store, integração legal). |
| `runner.ts` | State machine + checkpoints em `vault/tenants/<t>/[stores/<s>/]runs/<runId>.json`. `runPlan()` itera rota, despacha steps via dispatcher abstrato, persiste a cada step, `resumeFromCheckpoint()` para retomada. |
| `writeback-gate.ts` | `gateWriteback()` — porta de segurança antes de qualquer mutation Shopify. Verifica token, escopo, perfil legal, sensibilidade da operação, aprovação humana. Devolve allow/blocked com effectiveMode (writeback / dry-run / blocked). |

### CLI principal `pnpm chief`

Entrypoint unificado: `06_packages/orchestration/scripts/chief-cli.ts`.

```bash
pnpm chief --tenant=<id> [--store=<id>] --objective="<NL>" \
  [--playbook=<id>] [--mode=read-only|dry-run|writeback] \
  [--jurisdictions=BR,EU,US-CA,US-FED] [--legal-profile=<path>] \
  [--execute] [--resume=<runId>]
```

- Plan-only por default. `--execute` despacha.
- `--resume` lê checkpoint do vault e continua.
- Mode writeback sem `--store` ou sem `SHOPIFY_ADMIN_TOKEN` rebaixa automaticamente para dry-run com warning.
- Camada jurídica ativada quando `--legal-profile` presente.

### Camada jurídica BR/EU/US — regras implementadas

**BR (LGPD + CDC + CONAR + ANVISA):**
- `BR-LGPD-PRIVACY-PAGE` (hard) — privacy policy obrigatória.
- `BR-CDC-COMPANY-IDENTITY` (hard) — CNPJ/razão social no PDP (Art. 31).
- `BR-CDC-RETURNS-7-DAYS` (hard) — direito de arrependimento (Art. 49).
- `BR-CONAR-CLAIMS-MEDICAL` (hard) — bloqueia "cura/TDAH/TEA/autismo/terapêutico/autorregulação sensorial" sem registro ANVISA.

**EU (GDPR + Consumer Rights Directive + Omnibus):**
- `EU-GDPR-PRIVACY-PAGE` (hard) — Art. 13/14.
- `EU-GDPR-CONSENT-COOKIES` (hard) — opt-in estrito para cookies não-essenciais.
- `EU-CRD-RIGHT-OF-WITHDRAWAL-14-DAYS` (hard) — 14 dias de withdrawal.
- `EU-OMNIBUS-PRICE-DISCLOSURE` (soft) — menor preço dos últimos 30 dias em ads de desconto.

**US-FED (FTC):**
- `US-FTC-CLAIMS-SUBSTANTIATION` (hard) — bloqueia "guaranteed/cure/100%/best in the world/clinically proven" sem evidência.
- `US-FTC-ENDORSEMENT-DISCLOSURE` (soft) — disclosure em reviews/endossos pagos (16 CFR 255).

**US-CA (CCPA/CPRA):**
- `US-CCPA-NOTICE-AT-COLLECTION` (hard) — privacy policy específica CCPA.
- `US-CCPA-OPT-OUT-LINK` (hard) — link "Do Not Sell or Share My Personal Information" + GPC-aware.

### Multi-store hardening

- Registry marca `contextSupport: 'tenant-or-store' | 'tenant-only' | 'global-only'` por agente.
- Planner usa `storeId` para definir `executionScope=store` automaticamente.
- Writeback exige scope=store (gate enforça).
- Runner persiste checkpoint em path scoped por tenant/store.
- Helper `storeAwareAgents()` lista quem suporta `--store` de verdade.

### Documentos atualizados

- `README.md` — TL;DR com 3 exemplos `pnpm chief`.
- `10_ops/scripts/COMMANDS.md` — seção `pnpm chief` completa com flags e modos.
- `10_ops/scripts/SETUP_LOCAL.md` — bloco "Rodar o Chefe" + multi-loja.
- `.env.example` — schema mínimo de `StoreLegalProfile`.
- `00_meta/PROJECT_STATUS.md` — marco do Chefe + paths dos módulos.
- `07_memory/vault/global/current-state.md` — refresh.

## Validações

- `pnpm typecheck` ✅
- `pnpm build` ✅
- `pnpm vitest run 06_packages/orchestration` → 28/28 verdes
- `pnpm test:smoke` → 17/17 verdes
- `pnpm chief --tenant=incluo --store=main --objective="auditar"` → roteia para playbook `merchant-audit`, mostra 3 steps
- `pnpm chief --mode=writeback` sem token → rebaixa automaticamente para dry-run com warning

## Como usar (dia a dia da equipe)

```bash
# 1. Quero auditar minha loja Incluo
pnpm chief --tenant=incluo --store=main --objective="auditar catálogo"

# 2. Quero entender melhor o catálogo cross-loja
pnpm chief --tenant=incluo --objective="comparar todas as lojas" --playbook=cross-store-diagnostic

# 3. Quero aplicar uma mudança no Shopify (com gates)
pnpm chief --tenant=incluo --store=main --objective="aplicar fix de preço" --mode=writeback \
  --legal-profile=07_memory/vault/tenants/incluo-tenant/stores/main/legal-profile.json --execute

# 4. Quero retomar um run interrompido
pnpm chief --tenant=incluo --resume=run-<id>
```

## Próximos passos de maior ROI

1. **Provisionar `SHOPIFY_ADMIN_TOKEN`** + criar `legal-profile.json` para Incluo → habilita `pnpm chief --execute --mode=writeback`.
2. **N20.3** — expor `variantSku` no `FeedRow` para scorer detectar SKU pattern `\d+:\d+#` automaticamente.
3. **Próxima iteração SKU** — ~50 produtos das pgs 2/3 do Incluo (fora da fixture local) com SKU ALI ainda não normalizados.
4. **Dispatcher real do runner** — atualmente o runner usa noopDispatcher (marca como completed sem executar de fato). Próxima iteração: dispatcher que invoca `pnpm <agent-command>` via child_process e parseia o output.

## Bloqueios externos restantes

- B1 — `ANTHROPIC_API_KEY` rotacionada (17 agentes LLM saem SKIPPED graciosamente sem ela).
- B6 — `SHOPIFY_ADMIN_TOKEN` (writeback real bloqueado).
- B7 — `GOOGLE_MERCHANT_CREDENTIALS` (upload real ao GMC).

---
_Gerado durante a sessão "retomada operacional + Chefe + legal BR/EU/US" de 2026-05-26 23:30 BRT._
