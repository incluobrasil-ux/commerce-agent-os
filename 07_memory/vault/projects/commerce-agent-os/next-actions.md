---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-23T16:10:00Z
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

## N1 — Commitar trabalho local + abrir PR

- **Ação:** criar branch `feat/core-runtime-and-first-agent`, commit Conventional (`feat: @cao/* core + repo-auditor + brain v1 + setup docs`), push, abrir PR.
- **Pré-requisito:** trabalho local verde (já está: install/typecheck/lint/test/smoke/audit:repo todos verdes).
- **Resultado esperado:** PR aberto em GitHub passando no CI; aguardando merge.
- **Quem puxa:** dev

## N2 — Confirmar `ANTHROPIC_API_KEY` em dev

- **Ação:** obter key Anthropic, escrever em `.env.local` na raiz, garantir `.gitignore` cobre `.env*` (já cobre).
- **Pré-requisito:** acesso ao console Anthropic.
- **Resultado esperado:** `$env:ANTHROPIC_API_KEY` retorna valor; nenhum vazamento em git.
- **Quem puxa:** ops

## N3 — Aceitar ADR-0007 (runtime TS via LangGraph JS)

- **Ação:** criar `02_architecture/adr/ADR-0007-agent-runtime.md` com status `aceita`, atualizar [decision-index.md](decision-index.md) e [`00_meta/DECISIONS.md`](../../../../00_meta/DECISIONS.md).
- **Pré-requisito:** N1 mergeado (evita conflito).
- **Resultado esperado:** ADR-0007 sai da queue; `@cao/runtime` pode usar LangGraph oficialmente.
- **Quem puxa:** tech lead

## N4 — Clonar `langgraph` + `shopify-app-template` em `01_upstreams/`

- **Ação:** `git clone <url> 01_upstreams/<repo>` (read-only); rodar `pnpm audit:repo 01_upstreams/<repo>`; confirmar licença em [`00_meta/upstreams_index.md`](../../../../00_meta/upstreams_index.md).
- **Pré-requisito:** N3 (ADR-0007 aceito para langgraph).
- **Resultado esperado:** 2 upstreams clonados; 2 relatórios em `12_reports/audits/repo-auditor/`; flags `⚠ verificar` resolvidas no index.
- **Quem puxa:** dev

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

## N7 — Polish residual (gitleaks + simple-git-hooks)

- **Ação:** instalar binário `gitleaks` local, ativar `npx simple-git-hooks`, validar que pre-commit roda lint+smoke+secret scan.
- **Pré-requisito:** N1 mergeado.
- **Resultado esperado:** hooks ativos em todo clone novo; secret scan no pre-commit.
- **Quem puxa:** ops

---

## Regras

- Máximo ~7 itens. Se passar, mover excesso para [operational-priorities.md](operational-priorities.md) > `próximo`.
- Item executado → remover daqui + entrada em [session-log.md](session-log.md) + atualizar [current-state.md](current-state.md)/[ops-brief.md](ops-brief.md) se mudou semáforo.
- Item que não saiu em 2 sessões consecutivas → reavaliar pré-requisito ou rebaixar para [operational-priorities.md](operational-priorities.md).
- Antes de puxar, ler [handoff-log.md](handoff-log.md) — alguém pode já estar nesse item.
