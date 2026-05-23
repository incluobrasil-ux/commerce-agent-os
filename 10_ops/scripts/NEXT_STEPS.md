# NEXT_STEPS — checklist da macro-fase 2

Lista executável de passos para sair de **scaffold** e chegar em **build verde + primeiros agentes reais**. Cada bloco é uma sub-fase.

> Não é roadmap (ver [`../../00_meta/ROADMAP.md`](../../00_meta/ROADMAP.md)).
> Não é audit (ver [`../../12_reports/audits/phase-1-gap-analysis.md`](../../12_reports/audits/phase-1-gap-analysis.md)).
> **É a sequência de ações concretas.** Marcar itens em PR.

## Sub-fase 2.0 — Decisões mínimas antes do bootstrap ✅ CONCLUÍDA (2026-05-23)

- [x] [ADR-0006](../../02_architecture/adr/ADR-0006-qa-stack.md) — stack de QA: **vitest + biome + zod + gitleaks + simple-git-hooks + commitlint**.
- [x] [ADR-0009](../../02_architecture/adr/ADR-0009-package-scope.md) — scope **`@cao/`** confirmado + convenções de subname.
- [x] [ADR-0017](../../02_architecture/adr/ADR-0017-commit-conventions.md) — **Conventional Commits 1.0.0** com tipos, scopes alinhados ao layout, exemplos canônicos.

Sub-fase 2.1 destravada.

## Sub-fase 2.1 — Bootstrap funcional (Fase 5 do ROADMAP) ✅ CONCLUÍDA (2026-05-23)

**Objetivo:** `pnpm install`, `pnpm typecheck`, `pnpm test` verdes. Zero implementação de domínio.

- [x] Adicionar devDeps na raiz: `typescript@^5`, `vitest`, `tsx`, `zod`, `@types/node`, `biome`, `simple-git-hooks`, `commitlint`.
- [x] Adicionar zod em `06_packages/shared-schemas`.
- [x] Workspace deps cross-package: `@cao/shared-types` adicionado aos 5 adapters em `05_integrations/`.
- [x] Rodar `pnpm install` na raiz — verde (24 workspace projects, ~8s).
- [x] Rodar `pnpm typecheck` — verde (tsc -b sem erros).
- [x] Converter `11_tests/smoke/packages-build.smoke.ts` para vitest real (3 testes passando).
- [x] Rodar `pnpm test:smoke` — verde (~540ms).
- [x] `pnpm lint` (biome) verde em 128 arquivos.

Itens residuais (polish — não bloqueiam Fase 6):
- [ ] Atualizar `10_ops/scripts/check-env.sh` com checks reais (node >= 20, pnpm >= 9, git).
- [ ] Atualizar `10_ops/scripts/bootstrap.sh` para rodar o pipeline completo.
- [ ] Instalar binário `gitleaks` localmente + ativar `simple-git-hooks` (`npx simple-git-hooks`).
- [ ] Rodar `bash 10_ops/scripts/bootstrap.sh` end-to-end verde.

## Sub-fase 2.2 — CI mínimo ✅ CONCLUÍDA (2026-05-23) — partes principais

- [x] Criar `.github/workflows/ci.yml` com workflow GitHub Actions:
  - `on: pull_request` roda lint + typecheck + smoke + commitlint.
  - `on: push to main/master` roda lint + typecheck + smoke.
- [x] Repo publicado em `incluobrasil-ux/commerce-agent-os`; tag `v0.1.0-architecture-baseline`.

Itens residuais (configuração externa):
- [ ] Pre-commit hook ativado localmente (`npx simple-git-hooks` após `git init` — depende de gitleaks instalado).
- [ ] Branch protection em `main` (configuração externa: github.com → Settings → Branches).
- [ ] Adicionar contract tests + secret scan + integration tests no workflow (à medida que forem implementados).

## Sub-fase 2.3 — Ingestão de upstreams alta prioridade (Fase 6)

**Objetivo:** `01_upstreams/` populado com os 10 mais importantes.

- [ ] Decidir método final por upstream (submodule vs clone raso). ADR opcional se divergir do ADR-0002.
- [ ] Clonar / submoduling:
  - [ ] `langchain-ai/langgraph` (TS variant verificada)
  - [ ] `Shopify/shopify-app-template-react-router`
  - [ ] `Shopify/dawn`
  - [ ] `google/merchant-api-samples`
  - [ ] `google-marketing-solutions/feedgen`
  - [ ] `basicmachines-co/basic-memory`
  - [ ] `affaan-m/agentshield`
  - [ ] `agency-ai-solutions/ad-factory-agent`
  - [ ] `higgsfield-ai/skills`
  - [ ] `higgsfield-ai/cli`
- [ ] Rodar `repo-auditor` manualmente (humano fazendo o que o agente fará) em cada um:
  - confirmar licença
  - secret scan
  - sinalizar findings em `12_reports/audits/upstream-pass2/`
- [ ] Atualizar `00_meta/REPO_SELECTION.md` removendo flags `⚠ verificar` resolvidas.
- [ ] Confirmar/derrubar premissas:
  - schema real de skill em higgsfield (revisar `05_integrations/higgsfield/types/`)
  - stack do template Shopify React Router (revisar `04_apps/shopify-admin-app/`)
  - heurísticas extraíveis de feedgen (revisar `04_apps/feed-service/src/prompts/README.md`)

## Sub-fase 2.4 — `@cao/runtime` mínimo (Fase 7)

**Objetivo:** primeiro agente rodando real.

- [ ] ADR-0007 — runtime TS via LangGraph JS confirmado.
- [ ] Implementar `@cao/core` minimum (BaseError, Result, Clock, IdGenerator).
- [ ] Implementar `@cao/llm` mínimo (Anthropic client + cost tracking).
- [ ] Implementar `@cao/memory` mínimo (CRUD markdown sobre `07_memory/vault/`).
- [ ] Implementar `@cao/guardrails` mínimo (schema validate + secret scan + PII reject; sem LLM judge ainda).
- [ ] Implementar `@cao/runtime` mínimo:
  - `defineAgent(...)` que aceita schema
  - `runAgent(...)` que valida input → invoca prompt → valida output → audit log
  - tool invocation via `@cao/guardrails`
- [ ] Implementar `@cao/observability` mínimo (PostHog via SDK; eventos `agent.invoked` + `agent.completed`).
- [ ] Implementar **`repo-auditor`** como primeiro agente real:
  - Não depende de Shopify; lê filesystem local.
  - Já tem AGENT.md + prompt.md + contract.yaml.
  - Falta flows.md + fixtures + implementação.
- [ ] Smoke test: invocar `repo-auditor` em 1 upstream → produzir audit em `12_reports/audits/`.

## Sub-fase 2.5 — Completar agentes faltantes

Pré-trabalho não bloqueante mas útil. Adicionar `flows.md` + fixtures nos 6 agentes que não têm:

- [ ] `orchestrator-master/flows.md` + fixtures (já tem state-machine.md)
- [ ] `memory-context/flows.md` + fixtures
- [ ] `repo-auditor/flows.md` + fixtures (também alvo da Sub-fase 2.4)
- [ ] `learning-memory-curation/flows.md` + fixtures
- [ ] `design-ux-localization/flows.md` + fixtures
- [ ] `traffic-campaigns/flows.md` + fixtures (já tem state-machine.md)

Pode ser feito em paralelo com 2.4.

## Sub-fase 2.6 — Shopify connect (Fase 8)

**Objetivo:** OAuth funcionando, primeiro produto lido.

- [ ] Criar conta Shopify Partners + dev store.
- [ ] Copiar arquivos chave do template clonado em 2.3 para `04_apps/shopify-admin-app/app/`:
  - `root.tsx`, `shopify.server.ts`, `db.server.ts`, `vite.config.ts`.
  - Cabeçalho com origem (URL + SHA + license + adaptations) — política ADR-0002.
- [ ] Implementar `05_integrations/shopify/client/` (Admin GraphQL).
- [ ] Implementar 1 webhook real (`app/uninstalled`) com HMAC + dedup.
- [ ] OAuth completar em loja de dev.
- [ ] Smoke test: autenticar e listar 10 produtos.

## Sub-fase 2.7 — Merchant feed (Fase 9)

- [ ] Conta GCP + Merchant API habilitada.
- [ ] Conta Google Merchant Center + domínio reivindicado.
- [ ] ADR-0011 — TS port vs sidecar Python para feedgen.
- [ ] Implementar `05_integrations/google-merchant/client/`.
- [ ] Implementar `product-feed-seo` Fluxo 1 (otimizar lote).
- [ ] Implementar `catalog-feed-ops` Fluxo 1 dry-run.
- [ ] Smoke test end-to-end dry-run em 10 SKUs.

## Sub-fase 2.8 — Analytics instrumentação (Fase 10)

- [ ] ADR-0013 — PostHog Cloud EU.
- [ ] Criar projeto PostHog + obter keys.
- [ ] Implementar `05_integrations/posthog/client/` consumindo SDK.
- [ ] Implementar `@cao/observability` completo (validação contra taxonomia).
- [ ] Instrumentar `agent.invoked` no runtime (já desbloqueado em 2.4).
- [ ] Criar primeira HogQL canônica: `funnel-standard.v1.hql`.

## Sub-fase 2.9 — Reviews (Fase 11.a)

- [ ] ADR-0012 — Judge.me + Shopify nativo (fallback).
- [ ] Implementar `05_integrations/review-apps/providers/judge-me/`.
- [ ] Implementar `reviews-ops` Fluxo 2 (synthesize) sobre dataset sintético.
- [ ] `aggregate-rating-sync` escrevendo metafields Shopify.

## Sub-fase 2.10 — Marketing / Creative (Fase 11.b)

- [ ] ADR-0014 — provedor de mídia.
- [ ] ADR-0015 — object storage.
- [ ] Implementar `marketing-director` Fluxo 1 em modo proposta.
- [ ] Implementar `creative-copy-assets` Fluxo 1 com 1 provider.

## Sub-fase 2.11 — Hardening e release v1 (Fase 12)

- [ ] ADR-0016 — secret manager.
- [ ] Política de retenção `07_memory/` aplicada.
- [ ] GDPR webhooks Shopify (`shop/redact`, `customers/redact`, `customers/data_request`).
- [ ] Override humano em `block` no admin-app.
- [ ] Performance baselines registradas.
- [ ] Runbook em `10_ops/runbooks/`.
- [ ] Deploy de produção.

## Como usar este arquivo

- Marcar `[x]` em PR.
- Sub-fase só conclui com **todos** os checkboxes verdes.
- Ordem é **sugerida**, não rígida — 2.5 pode rodar em paralelo com 2.4; 2.6 pode rodar em paralelo com 2.7 se equipe permitir.
- Quando uma sub-fase concluir, atualizar `ROADMAP.md` correspondente (Fase 5/6/7/...) e gerar audit em `12_reports/audits/`.

## Quem produz cada decisão

Itens "ADR-XXXX" são **decisões pendentes do humano** — não algo que agente decide sozinho. Cada ADR é PR consciente.
