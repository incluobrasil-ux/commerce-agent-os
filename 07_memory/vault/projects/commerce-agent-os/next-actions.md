---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-23T16:55:00Z
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

- ~~N1~~ — PR `feat/core-runtime-and-first-agent` aberta.
- ~~N2~~ — `ANTHROPIC_API_KEY` em `.env.local`.
- ~~N3~~ — ADR-0007 aceito.
- ~~N4~~ — 2 upstreams clonados + auditados.
- ~~N5~~ — LLM end-to-end (`@cao/audit-synthesizer`, 2 chamadas Claude reais).
- ~~N6~~ — Run-summary `2026-05-23-agent-run-llm-first-real-calls.md`.
- ~~N7~~ — gitleaks 8.30.1 instalado + integrado ao pre-commit + validado (private key fake bloqueia).
- ~~N8~~ — `ANTHROPIC_API_KEY` rotacionada (antiga revogada, nova em `.env.local`).
- ~~N9~~ — **Decisão:** Sub-fase 2.5 (mais agentes) priorizada.

## N10 — Implementar `learning-memory-curation` (próximo agente real)

- **Ação:** seguindo padrão `audit-synthesizer`: package `@cao/learning-memory-curation`, agente que lê `<tenant>/audit/` + `<tenant>/working/` e promove findings de alta confiança para `<tenant>/facts/<slug>.md` com frontmatter (created_at, confidence, source, tags). LLM decide o que promover; humano valida via PR review do diff em `facts/`.
- **Pré-requisito:** key válida em `.env.local`; pelo menos 1 tenant com audit log (já temos `_test/audit/2026-05-23.md`).
- **Resultado esperado:** 1 execução real produz arquivos em `_test/facts/` + audit log atualizado. Suíte ≥ 64 verdes (5 unit + 1 smoke novos).
- **Quem puxa:** dev (eu)

## N11 — Resumir N10 em run-summary

- **Ação:** padrão estabelecido — `run-summaries/<date>-agent-run-learning-memory-curation-*.md` + linha em `index.md`.
- **Pré-requisito:** N10 entregue.
- **Quem puxa:** quem fez N10

## N12 — Próximo agente: `memory-context` ou `competitor-benchmark`

- **Ação:** segundo agente da Sub-fase 2.5. `memory-context` (read-only, builds context briefs) é o caminho mais curto; `competitor-benchmark` é mais valioso mas precisa de fixtures de input.
- **Pré-requisito:** N10 mergeado.
- **Quem puxa:** dev

---

## Regras

- Máximo ~7 itens. Se passar, mover excesso para [operational-priorities.md](operational-priorities.md) > `próximo`.
- Item executado → remover daqui + entrada em [session-log.md](session-log.md) + atualizar [current-state.md](current-state.md)/[ops-brief.md](ops-brief.md) se mudou semáforo.
- Item que não saiu em 2 sessões consecutivas → reavaliar pré-requisito ou rebaixar para [operational-priorities.md](operational-priorities.md).
- Antes de puxar, ler [handoff-log.md](handoff-log.md) — alguém pode já estar nesse item.
