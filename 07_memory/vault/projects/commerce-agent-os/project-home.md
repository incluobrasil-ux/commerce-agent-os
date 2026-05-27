---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-27T18:30:00Z
tags: [project-home, status, overview]
source: human:incluobrasil
confidence: 1.0
---

# commerce-agent-os — Project Home

> **🗺 Mapa Operacional visual:** [[operations/operations-map.canvas|operations-map (Canvas)]] — quem faz o quê em 1 olhada. Nomes amigáveis ativos via aliases (`Ctrl+O` → "Chefe", "Radar", "Painel", "Mesa de Comando", "Motor", "Núcleo", "Oficina", "Guia", "Terminal 1", "Terminal 2", "Tarefas em Espera"). Como ler: [[operations/README|operations/README]].

**Para que serve este arquivo:** ponto de entrada do cérebro operacional. Lê isto primeiro para entender onde o projeto está hoje. Os outros arquivos do diretório especializam pedaços daqui.

**Como usar:** atualizar quando muda fase, muda status executivo, ou muda o "o que funciona / o que não funciona". Mudanças pequenas vão em `session-log.md` em vez daqui.

**Output que gera:** snapshot executivo de 1 página do projeto.

## Visão executiva

Monorepo de um **sistema operacional de agentes para e-commerce Shopify**. 22 agentes catalogados (20 executáveis + 1 library-only + 1 stub) em 7 tiers, multi-tenant por loja com isolamento por filesystem, memória markdown-first, camada jurídica internacional (BR/EU/US), runtime LLM via Anthropic.

O Chefe (`pnpm chief`) recebe objetivo em linguagem natural, classifica intent, seleciona um de 8 playbooks oficiais, avalia camada legal, filtra rota por credenciais, e despacha agentes via child_process com checkpoints retomáveis no vault.

Visa entregar lojistas Shopify uma camada de automação coordenada (catálogo, feed, oferta, marketing, criativo, design, governança, compliance) acima da admin app — em vez de N apps isolados.

## Status atual

- **Macro-fase 1 (scaffold)**: concluída.
- **Macro-fase 2 (implementação)**: em curso, Chefe OS consolidado.
  - Sub-fase 2.0–2.5 (núcleo `@cao/*`, primeiros agentes, secret scan, brain-bridge): ✅
  - Sub-fase 2.6 (Shopify minimal + writeback): ✅
  - Sub-fase 2.7 (Merchant dry-run end-to-end): ✅
  - Sub-fase 2.8 (Merchant audit MVP com scoring): ✅
  - Sub-fase 2.9 (multi-tenant/multi-store hardening): ✅
  - **Chefe OS consolidado** (orchestration package + 8 playbooks + camada legal + dispatcher real): ✅ (2026-05-26 → 2026-05-27).

Repo: <https://github.com/incluobrasil-ux/commerce-agent-os>
Branch ativa: `feat/orchestrator-os-consolidation` (6 commits ahead de `main`).

## O que já funciona

- `pnpm install` verde (28+ workspaces).
- `pnpm typecheck` verde.
- `pnpm lint` verde (biome, 309 arquivos).
- `pnpm test` verde — **378 testes em 42 arquivos** (orchestration: 40).
- `pnpm test:smoke` verde — 17 testes (incl. 12 multi-tenant isolation).
- `pnpm doctor` — 10🟢/0🟡/0🔴.
- CI no GitHub Actions; branch protection em `main`; tag `v0.1.0-architecture-baseline`.
- **`pnpm chief --tenant=<t> --store=<s> --objective="..." --execute`** — entrypoint operacional: intent → playbook → camada legal → rota → spawn de agentes via shell → checkpoint no vault → retomável via `--resume`.
- **20 agentes REAL_EXECUTABLE** (registry em `@cao/orchestration/src/registry.ts`).
- **8 playbooks oficiais**: merchant-audit, offer-improvement, marketing-creative-chain, pdp-ux-review, governance-review, store-readiness, cross-store-diagnostic, safe-shopify-writeback.
- **Camada legal BR/EU/US** — 11 regras hard/soft (LGPD+CDC+CONAR+ANVISA, GDPR+CRD+Omnibus, FTC+CCPA/CPRA). Writeback-gate bloqueia por token+scope+requiredPolicies+legal+human approval.
- **Shopify writeback** funcional via `pnpm shopify:writeback` (dry-run default, `--apply` é gate explícito; audit log sempre escrito).
- **Multi-tenant/multi-store** por filesystem com assertions em `@cao/core`.
- **Brain-bridge** captura runs em `vault/tenants/<t>/[stores/<s>/]run-summaries/`.
- **`prompt-master`** opcional como Claude skill auxiliar de operador (user-level, fora do repo). Doc em [`10_ops/scripts/PROMPT_MASTER.md`](../../../../10_ops/scripts/PROMPT_MASTER.md).

## O que ainda NÃO funciona (bloqueios externos)

- **B1** — `ANTHROPIC_API_KEY` rotação manual no `.env.local` (17 agentes LLM saem SKIPPED gracioso sem ela).
- **B6** — `SHOPIFY_ADMIN_TOKEN` ausente em `.env.local` (necessário para `--mode=writeback` real; ~3 min em Partners).
- **N27** — Primeiro `pnpm chief --execute --mode=writeback` real depende de B6 + revisão jurídica do compliance HIGH de Incluo.
- **N28** — Adotar exit code `3` (SKIPPED gracioso) nos 17 agentes LLM (hoje só `catalog-feed-ops` segue convenção; dispatcher mapeia mas agentes não emitem).
- **N29** — Cada loja real precisa do `legal-profile.json` próprio em `tenants/<t>/stores/<s>/` (template em [`07_memory/vault/templates/legal-profile.example.json`](../../templates/legal-profile.example.json)).
- 2 agentes não REAL_EXECUTABLE: `product-feed-seo` (library-only, usado por `catalog-feed-ops`) + `analytics-optimization` (stub, aguarda demanda PostHog).
- Sem worker queue, sem DB de aplicação, sem analytics live, sem secret manager.

## Macro-fase / Sub-fase atual

| | Status |
|---|---|
| Macro-fase | 2 — Implementação (Chefe OS consolidado) |
| Sub-fase | encerrar entrega do Chefe + primeira execução real em loja Shopify |
| Próximo marco | primeiro `pnpm chief --execute --mode=writeback` real em loja Incluo (depende de B6 + N29) |

## Links-chave

**Governança** (autoridade — sempre verdade aqui antes de aqui):
- [PROJECT_SCOPE](../../../../00_meta/PROJECT_SCOPE.md)
- [PROJECT_STATUS](../../../../00_meta/PROJECT_STATUS.md) — fonte única do estado real, ≤ 25 linhas
- [ROADMAP](../../../../00_meta/ROADMAP.md)
- [SUCCESS_CRITERIA](../../../../00_meta/SUCCESS_CRITERIA.md)
- [STACK_RULES](../../../../00_meta/STACK_RULES.md)
- [DECISIONS](../../../../00_meta/DECISIONS.md)

**ADRs**: [`02_architecture/adr/`](../../../../02_architecture/adr/)

**Onboarding**: [TEAM_ONBOARDING](../../../../00_meta/TEAM_ONBOARDING.md) · [SETUP_LOCAL](../../../../10_ops/scripts/SETUP_LOCAL.md) · [COMMANDS](../../../../10_ops/scripts/COMMANDS.md)

**Especializações deste cérebro:**

Estado e execução:
- [current-state.md](current-state.md) — **snapshot curto** (verde/bloqueado + fase + marco)
- [ops-brief.md](ops-brief.md) — semáforos por bloco + próximos 3 focos
- [workstreams.md](workstreams.md) — trilhas paralelas (W1–W8) com status
- [next-actions.md](next-actions.md) — N1–N29 executáveis em ordem
- [operational-priorities.md](operational-priorities.md) — fila viva (agora/próximo/depois) com dono e status
- [blockers-and-risks.md](blockers-and-risks.md) — B1–B6 + R1–R11

Decisões:
- [decision-index.md](decision-index.md) — ADRs aceitos + abertos + impacto por área

Logs (append-only):
- [session-log.md](session-log.md) — log retrospectivo de sessões
- [handoff-log.md](handoff-log.md) — passagem de bastão entre operadores/máquinas

Resumos curados:
- [run-summaries/README.md](run-summaries/README.md) — padrão para resumir outputs
- [run-summaries/index.md](run-summaries/index.md) — catálogo dos resumos
- [run-summaries/_template.md](run-summaries/_template.md) — esqueleto fillable

Governança do próprio cérebro:
- [source-of-truth.md](source-of-truth.md) — quais arquivos são autoridade
- [sync-protocol.md](sync-protocol.md) — protocolo para múltiplos operadores em múltiplas máquinas
- [../../README.md](../../README.md) — layout completo do vault (qual pasta abrir no Obsidian)

Templates e ferramentas:
- [../../templates/legal-profile.README.md](../../templates/legal-profile.README.md) — como configurar o legal-profile por loja
- [../../../../10_ops/scripts/PROMPT_MASTER.md](../../../../10_ops/scripts/PROMPT_MASTER.md) — `prompt-master` opcional (skill auxiliar)
