# Roadmap

Roadmap por fases. Cada fase fecha entregáveis antes da próxima.

- Versão: 0.3
- Data: 2026-05-23
- Status: vivo

> **Macro-fase 1 (setup/scaffold) concluída.** Cobre Fases 0–4 abaixo + pré-trabalhos das Fases 8–12. Sumário: [`../12_reports/releases/phase-1-setup-summary.md`](../12_reports/releases/phase-1-setup-summary.md). Gaps: [`../12_reports/audits/phase-1-gap-analysis.md`](../12_reports/audits/phase-1-gap-analysis.md).
>
> **Macro-fase 2 (implementação) começa na Fase 5.** Checklist: [`../10_ops/scripts/NEXT_STEPS.md`](../10_ops/scripts/NEXT_STEPS.md).

## Fase 0 — Scaffold (concluída)

- [x] Estrutura de pastas raiz numerada (00_meta → 12_reports).
- [x] Arquivos-base (CLAUDE.md, README.md, .gitignore, .editorconfig).
- [x] Workspace pnpm placeholder.

## Fase 1 — Repo audit (concluída)

- [x] `00_meta/REPO_SELECTION.md` com 20 upstreams classificados.
- [x] 20 audits individuais em `02_architecture/repo-audits/`.
- [x] 6 docs por provedor em `02_architecture/integrations/`.

## Fase 2 — Arquitetura (concluída)

- [x] Project map, integration map, security overview.
- [x] ADR-0001 (monorepo), ADR-0002 (upstreams), ADR-0003 (agentes).
- [x] Catálogos: 17 agentes, 7 apps, 6 integrações, 9 packages.

## Fase 3a — Scaffold técnico do workspace (concluída)

- [x] `tsconfig.base.json` + `tsconfig.json` raiz com project references.
- [x] Scripts de workspace.
- [x] 9 packages `@cao/*` stub com package.json + tsconfig + src/index.ts.

## Fase 3b — Scaffold de agentes/apps/integrações (concluída)

- [x] 17 agentes (AGENT.md + prompt + contract + tools + tests).
- [x] 4 state-machine.md em agentes stateful.
- [x] 7 apps com README + estrutura prevista.
- [x] 6 integrações com README + subdirs.
- [x] 9 packages com README.

## Fase 4 — Fundação operacional (concluída)

- [x] Docs de fundação UPPERCASE em `00_meta/` (PROJECT_SCOPE, SUCCESS_CRITERIA, ROADMAP, DECISIONS, STACK_RULES).
- [x] 3 packages compartilhados novos: `shared-types`, `shared-schemas`, `shared-config`.
- [x] Vault template em `07_memory/vault/_template/`.
- [x] Scripts placeholder em `10_ops/scripts/`.
- [x] Smoke tests stub em `11_tests/smoke/`.
- [x] ADR-0004 (shared packages), ADR-0005 (memory vault) registradas em `02_architecture/adr/`.

## Fase 5 — Bootstrap funcional (próxima)

Objetivo: tornar o esqueleto **executável** (build + smoke verde) sem ainda implementar domínio.

- [ ] Adicionar `typescript`, `vitest`, `tsx` como devDeps da raiz; rodar `pnpm install`.
- [ ] `pnpm typecheck` verde em todos packages.
- [ ] `pnpm test:smoke` verde.
- [ ] Definir scope npm (`@cao/`?) e confirmar em todos `package.json`.
- [ ] CI mínimo em `10_ops/` (lint + typecheck + smoke).

## Fase 6 — Ingestão de upstreams de alta prioridade

- [ ] Clonar em `01_upstreams/`: langgraph, shopify-app-template, higgsfield-skills, higgsfield-cli, basic-memory, agentshield, merchant-api-samples, feedgen, ad-factory-agent, dawn.
- [ ] Atualizar audits com observações pós-clone (campos `⚠ verificar` resolvidos).
- [ ] Confirmar licença de cada um.

## Fase 7 — Primeiro agente end-to-end

- [ ] Implementar `@cao/runtime` mínimo sobre LangGraph (TS).
- [ ] Implementar `@cao/memory` mínimo sobre vault markdown.
- [ ] Implementar `@cao/guardrails` mínimo (schema validate + audit log).
- [ ] Implementar `repo-auditor` como primeiro agente real (sem dependência de Shopify).
- [ ] Smoke test que invoca `repo-auditor` em um upstream local.

## Fase 8 — Shopify connect (v1 milestone-1)

**Pré-trabalho concluído** (sessão atual):
- [x] Scaffold de `04_apps/shopify-theme/` (estrutura Liquid completa).
- [x] Scaffold de `04_apps/shopify-admin-app/` (configs + app/ placeholders + prisma stub).
- [x] Contratos em `05_integrations/shopify/` (client/types/errors/webhooks + scopes.yaml + webhook-topics.yaml).
- [x] Docs: `shopify-map.md` (detalhe) + `shopify-readiness.md` (audit).

**A fazer:**
- [ ] Materializar `app/root.tsx`, `app/shopify.server.ts`, `app/db.server.ts` a partir do template clonado.
- [ ] Implementar client real em `05_integrations/shopify/client/` (Admin GraphQL).
- [ ] Implementar 1 webhook handler real (`app/uninstalled` ou GDPR).
- [ ] OAuth funcionando em loja de dev.
- [ ] Smoke test que autentica e lê 1 produto.

## Fase 9 — Merchant feed (v1 milestone-2)

**Pré-trabalho concluído** (sessão atual):
- [x] `flows.md` + fixtures em `product-feed-seo`, `catalog-feed-ops`, `merchant-compliance`.
- [x] Scaffold de `04_apps/merchant-service/` (workers, jobs, webhooks, orchestration READMEs + configs).
- [x] Scaffold de `04_apps/feed-service/` (pipelines, prompts, workers, orchestration READMEs + configs).
- [x] Contratos em `05_integrations/google-merchant/` (client/types/errors + resources.yaml + report-types.yaml).
- [x] Docs: `google-merchant-map.md` (detalhe + papel dos 4 upstreams) + `merchant-feed-seo-readiness.md` (audit).

**A fazer:**
- [ ] Implementar client real em `05_integrations/google-merchant/client/`.
- [ ] Implementar 1 pipeline (`optimize-skus` title rewrite) end-to-end em `feed-service`.
- [ ] Implementar `catalog-feed-ops` aplicando dry-run.
- [ ] Disapproval monitor job rodando em `merchant-service`.
- [ ] Smoke test que: lê 10 SKUs do Shopify → propõe diff → audita compliance → mostra plan (sem aplicar).

## Fase 10 — Analytics (v1 milestone-3)

**Pré-trabalho concluído** (sessão atual):
- [x] `flows.md` + fixtures em `03_agents/analytics-optimization` (4 fluxos).
- [x] Scaffold `04_apps/analytics-service` (jobs, pipelines, queries, orchestration + config).
- [x] Adapter `05_integrations/posthog/` com **taxonomia canônica** (events-taxonomy.yaml + properties-taxonomy.yaml).
- [x] Docs: `posthog-map.md` (detalhe com funil + attribution UTM + PII) + `analytics-readiness.md` (audit).

**A fazer:**
- [ ] Confirmar PostHog Cloud (EU/US) vs self-host.
- [ ] Criar projeto PostHog + obter API keys (dev).
- [ ] Implementar `@cao/observability` consumindo o adapter.
- [ ] Instrumentar 1 evento end-to-end: `agent.invoked` do `repo-auditor` (sem dependência de Shopify).
- [ ] Adicionar instrumentação em apps conforme implementam (cresce com Fases 8/9/11).
- [ ] Criar primeira HogQL canônica em `analytics-service/src/queries/funnel-standard.v1.hql`.

## Fase 11 — Reviews + Marketing (v1 milestone-4)

**Pré-trabalho concluído** (sessão atual — escopo reviews):
- [x] `flows.md` + fixtures em `03_agents/reviews-ops`.
- [x] Scaffold `04_apps/review-service` (webhooks, ingesters, workers, pipelines, orchestration).
- [x] Adapter multi-provedor `05_integrations/review-apps` (interface única + 6 providers stub + providers.yaml).
- [x] Docs: `reviews-map.md` (detalhe) + `reviews-readiness.md` (audit).

**A fazer (reviews):**
- [ ] Confirmar provedor default (Judge.me + Shopify nativo proposto).
- [ ] Implementar `providers/judge-me/` real (client + normalize + webhook).
- [ ] Implementar 1 fluxo end-to-end: ingest → synthesize VoC sample.
- [ ] `aggregate-rating-sync` escrevendo metafields Shopify.
- [ ] Tema renderizando schema.org JSON-LD a partir de metafields.

**Pré-trabalho concluído** (sessão atual — escopo marketing/creative):
- [x] `flows.md` + fixtures em `market-intelligence`, `competitor-benchmark`, `product-offer`, `marketing-director`, `creative-copy-assets`.
- [x] Scaffold `04_apps/creative-ops-service` (workers, providers, pipelines, orchestration + config).
- [x] Adapter `05_integrations/higgsfield/` (client/types/errors + skills-catalog.yaml; CLI separada em 10_ops futura).
- [x] Docs: `higgsfield-map.md` (detalhe) + `12_reports/benchmarks/marketing-creative-stack.md` (benchmark dos 6 upstreams).

**A fazer (marketing/creative):**
- [ ] Clonar `higgsfield-ai/skills` e `higgsfield-ai/cli` (Fase 6) — bloqueia confirmação de schemas.
- [ ] ADR de provedor de mídia (image/video) para `creative-ops-service`.
- [ ] ADR de object storage (S3 / R2 / GCS).
- [ ] Implementar `marketing-director` em modo proposta com fixtures reais.
- [ ] Implementar `creative-copy-assets` invocando 1 provider de mídia.
- [ ] Wrapper de CLI em `10_ops/higgsfield-cli/`.

## Fase 12 — Hardening e release v1

**Pré-trabalho concluído** (sessão atual — escopo security/QA):
- [x] `flows.md` + fixtures em `03_agents/governance-risk-qa` (com caso "block" cobrindo 5 violations).
- [x] `02_architecture/security-model/qa-governance-map.md` (4 linhas de defesa + 7 riscos de upstream + 12 critérios de QA + 5 camadas de teste).
- [x] `10_ops/security/security-checklist.md` (~50 itens em 11 categorias).
- [x] `11_tests/{contract,integration,e2e,performance}/README.md` — 5 camadas com testes previstos.
- [x] `12_reports/audits/security-qa-readiness.md` (10 gaps críticos listados).

**A fazer (security/QA):**
- [ ] Runbook completo em `10_ops/runbooks/`.
- [ ] Política de retenção de `07_memory/` definida e aplicada.
- [ ] Secret manager em uso.
- [ ] SAST (Semgrep) + secret scanner (gitleaks) no CI.
- [ ] Override humano em `block` modelado no admin-app.
- [ ] Performance baselines registradas em `12_reports/perf-baselines/`.
- [ ] DAST: avaliar para v2.
- [ ] Deploy de produção.

## Fora do roadmap (deferred backlog)

- Google Ads / `traffic-campaigns` ativo.
- Self-host PostHog.
- Bright Data com volume.
- Múltiplos tenants ativos simultâneos.
