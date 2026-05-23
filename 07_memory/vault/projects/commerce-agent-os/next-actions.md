---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-23T23:15:00Z
tags: [next-actions]
source: mixed
confidence: 1.0
---

# Next Actions

**Para que serve:** lista pequena, ordenada e **executável** das próximas ações. Cada item tem pré-requisito, resultado esperado e papel sugerido — qualquer operador deveria conseguir puxar um item e saber se entregou.

**Como usar:** abrir antes de cada sessão (depois de [current-state.md](current-state.md) e [handoff-log.md](handoff-log.md)). Puxar 1 item, executar, registrar em [session-log.md](session-log.md), atualizar daqui.

**Output que gera:** plano operacional imediato (~3–7 ações) que cabe em 5 minutos de leitura.

**Diferença para [operational-priorities.md](operational-priorities.md):** ali é o pool agrupado em horizontes (agora/próximo/depois); aqui são as ações imediatas em ordem, com critério de aceite.

---

## ✅ Concluídos nesta sessão

- ~~N1–N9~~ — bootstrap, ADRs, primeira LLM real.
- ~~N10~~ — `@cao/learning-memory-curation` (3º agente).
- ~~N12~~ — `@cao/memory-context` (4º agente).
- ~~Sub-fase 2.3 (pass 2)~~ — **10/10 upstreams clonados + auditados** via `clone-upstreams.sh` e `pnpm audit:repo` → `12_reports/audits/upstream-pass2/`. Detector v2 (AGPL + env templates). Suíte 73 verdes.
- ~~REPO_SELECTION.md~~ — atualizado com licenças confirmadas e 2 reclassificações (basic-memory → referência apenas; ad-factory-agent → não copiar).
- ~~@cao/llm fallback + smoke~~ — `makeNoopComplete()` + `tryMakeAnthropicComplete()` + `pnpm llm:smoke`. 4 testes novos (suíte **81 verdes**). Smoke executado: detectou 401 com a key antiga (mensagem clara: "key inválida ou revogada").
- ~~Sub-fase 2.6 caminho mínimo~~ — `@cao/integration-shopify` com `AdminGraphQLClient` + `listProducts()` + OAuth helpers. `pnpm shopify:list-products` rodou em SKIPPED limpo. Suíte 81 → **96 verdes** (+15 cobrindo Shopify).

## N11 — Real run dos 3 agentes LLM (bloqueio único na sessão)

- **Ação:** atualizar `.env.local` com a key nova rotacionada; rodar pipeline de validação:
  ```bash
  pnpm synthesize:audit 12_reports/audits/repo-auditor/langgraph-*.md
  pnpm curate:memory --tenant=_test
  pnpm context:brief --task="optimize Q2 catalog titles" --tenant=_test
  ```
- **Pré-requisito:** **só** atualizar `.env.local` (a chave antiga está revogada; código + agentes + testes todos verdes localmente).
- **Resultado esperado:** 3 outputs reais em `12_reports/` + `07_memory/vault/_test/facts/` + audit log atualizado. Custo estimado: < $0.05 total.
- **Quem puxa:** ops (atualizar .env.local) → dev (validar)

## N15 — Conectar Shopify dev store e rodar real (Sub-fase 2.6 demo)

- **Ação:** (a) criar dev store em https://partners.shopify.com (gratuito), (b) Admin → Settings → Apps and sales channels → Develop apps → Create app, (c) Configure Admin API scopes → marcar `read_products` → Save, (d) Install app → Reveal token, (e) preencher `SHOPIFY_SHOP` + `SHOPIFY_ADMIN_TOKEN` em `.env.local`.
- **Pré-requisito:** conta Shopify Partners (gratuito).
- **Resultado esperado:** `pnpm shopify:list-products` lista produtos do dev store (Shopify cria 5 produtos default em dev stores novas). **Primeira demo mostrável a stakeholder.**
- **Quem puxa:** ops

## N13a — Aceitar ADR-0011 (estratégia para `feedgen` Python)

- **Ação:** agora que `feedgen` foi clonado e auditado (Apache-2.0, 4.4MB, Python puro), decidir entre: (a) port TS de heurísticas; (b) sidecar Python via subprocess; (c) serviço Python separado. Recomendação: **sidecar Python via subprocess** (menor caminho). Criar `02_architecture/adr/ADR-0011-feedgen-strategy.md`, atualizar [decision-index.md](decision-index.md) e `00_meta/DECISIONS.md`.
- **Pré-requisito:** nenhum (código já disponível).
- **Resultado esperado:** ADR-0011 sai da queue; Fase 9 (merchant feed) tem caminho técnico claro.
- **Quem puxa:** tech lead

## N13 — Decidir 5º agente OU pivotar para Sub-fase 2.6

- **Ação:** decisão de produto. Opções:
  - **Continuar 2.5:** próximos candidatos no catálogo de 17 agentes — `competitor-benchmark` (requer fetcher), `governance-risk-qa` (requer policies), `product-offer` (requer dados de produto).
  - **Pivotar 2.6 (Shopify connect):** OAuth + 1 webhook + 1 produto lido. Requer dev store + ADR-0008 (queue) + ADR-0010 (DB).
- **Pré-requisito:** N11 validado (todos os 3 agentes LLM rodando real).
- **Quem puxa:** tech lead + produto

## N14 — Polish CI: rodar smoke + lint + commitlint em PR (já existe; validar com este PR)

- **Ação:** verificar que CI atualmente roda no PR e cobre os novos pacotes (4 agentes adicionados). Se faltar gitleaks no CI, adicionar.
- **Pré-requisito:** PR `feat/core-runtime-and-first-agent` aberta no GitHub (já).
- **Quem puxa:** ops

---

## Regras

- Máximo ~7 itens. Se passar, mover excesso para [operational-priorities.md](operational-priorities.md) > `próximo`.
- Item executado → remover daqui + entrada em [session-log.md](session-log.md) + atualizar [current-state.md](current-state.md)/[ops-brief.md](ops-brief.md) se mudou semáforo.
- Item que não saiu em 2 sessões consecutivas → reavaliar pré-requisito ou rebaixar para [operational-priorities.md](operational-priorities.md).
- Antes de puxar, ler [handoff-log.md](handoff-log.md) — alguém pode já estar nesse item.
