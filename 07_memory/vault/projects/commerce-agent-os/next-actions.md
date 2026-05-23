---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-23T16:40:00Z
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

- ~~N1 — Commitar Sub-fase 2.2 + repo-auditor + brain~~ (PR `feat/core-runtime-and-first-agent` aberta).
- ~~N2 — `ANTHROPIC_API_KEY` em `.env.local`~~ (⚠ rotacionar — apareceu em chat).
- ~~N3 — ADR-0007 aceito~~.
- ~~N4 — 2 upstreams clonados + auditados~~ (langgraph + shopify-app-template-react-router, ambos MIT).

## N5 — LLM end-to-end via `@cao/runtime`

- **Ação:** acoplar `repo-auditor` (ou novo agente `summary-curator`) a `runAgent()` usando `makeAnthropicComplete()` — input → prompt → LLM → output validado por zod → audit log.
- **Pré-requisito:** N1, N2, N3.
- **Resultado esperado:** 1 execução real escreve audit em vault de tenant + custo registrado via `@cao/observability`. Smoke gateado por env var (skip quando ausente).
- **Quem puxa:** dev

## N6 — Resumir N4 e N5 em `run-summaries/`

- **Ação:** quando N4 e N5 entregarem, criar resumos curados em `run-summaries/<date>-<kind>-<slug>.md` seguindo [_template.md](run-summaries/_template.md) + linha em [index.md](run-summaries/index.md).
- **Pré-requisito:** N4 e/ou N5 entregues.
- **Resultado esperado:** índice de resumos cresce; cérebro reflete execuções reais.
- **Quem puxa:** quem fez N4/N5

## N7 — Instalar binário `gitleaks` (hooks já ativos)

- **Ação:** `winget install gitleaks` (Windows) ou `scoop install gitleaks` ou `brew install gitleaks` (mac). `simple-git-hooks` já está ativo (rodou `npx simple-git-hooks`). Validar com `gitleaks --version` + fazer 1 commit com fake secret em test fixture para garantir que bloqueia.
- **Pré-requisito:** acesso administrativo OS.
- **Resultado esperado:** secret scan ativo no pre-commit; B5 fechado.
- **Quem puxa:** ops

---

## Regras

- Máximo ~7 itens. Se passar, mover excesso para [operational-priorities.md](operational-priorities.md) > `próximo`.
- Item executado → remover daqui + entrada em [session-log.md](session-log.md) + atualizar [current-state.md](current-state.md)/[ops-brief.md](ops-brief.md) se mudou semáforo.
- Item que não saiu em 2 sessões consecutivas → reavaliar pré-requisito ou rebaixar para [operational-priorities.md](operational-priorities.md).
- Antes de puxar, ler [handoff-log.md](handoff-log.md) — alguém pode já estar nesse item.
