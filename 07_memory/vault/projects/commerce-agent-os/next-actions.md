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
- ~~N2~~ — `ANTHROPIC_API_KEY` em `.env.local` (⚠ rotacionar).
- ~~N3~~ — ADR-0007 aceito.
- ~~N4~~ — 2 upstreams clonados + auditados (ambos MIT).
- ~~N5~~ — **LLM end-to-end** — `@cao/audit-synthesizer` criado; 2 chamadas Claude reais ($0.0099, 1557 tokens, audit log em tenant).
- ~~N6~~ — Run-summary `2026-05-23-agent-run-llm-first-real-calls.md` criado.

## N7 — Instalar binário `gitleaks`

- **Ação:** `winget install gitleaks` (Windows) ou `scoop install gitleaks` ou `brew install gitleaks` (mac). `simple-git-hooks` já está ativo. Validar com `gitleaks --version`.
- **Pré-requisito:** acesso administrativo OS.
- **Resultado esperado:** secret scan ativo no pre-commit; B5 fechado.
- **Quem puxa:** ops

## N8 — Rotacionar `ANTHROPIC_API_KEY`

- **Ação:** console Anthropic → criar nova key → revogar a antiga (`sk-ant-api03-ApIS...`). Atualizar `.env.local`.
- **Pré-requisito:** acesso ao console.
- **Resultado esperado:** key antiga inválida; key nova funcional; `pnpm synthesize:audit ...` continua verde.
- **Quem puxa:** ops

## N9 — Decidir próximo bloco: 2.5 (mais agentes) vs 2.6 (Shopify OAuth)

- **Ação:** decisão de produto/escopo. Opções:
  - **2.5:** mais agentes reais usando o padrão `audit-synthesizer` (ex.: `learning-memory-curation`, `competitor-benchmark`). Continua sem credencial externa.
  - **2.6:** começar Shopify connect — depende de Partners account + dev store + ADR-0008 (queue) + ADR-0010 (DB).
- **Resultado esperado:** ADR de roadmap atualizado; próxima sub-fase formalmente iniciada.
- **Quem puxa:** tech lead + produto

---

## Regras

- Máximo ~7 itens. Se passar, mover excesso para [operational-priorities.md](operational-priorities.md) > `próximo`.
- Item executado → remover daqui + entrada em [session-log.md](session-log.md) + atualizar [current-state.md](current-state.md)/[ops-brief.md](ops-brief.md) se mudou semáforo.
- Item que não saiu em 2 sessões consecutivas → reavaliar pré-requisito ou rebaixar para [operational-priorities.md](operational-priorities.md).
- Antes de puxar, ler [handoff-log.md](handoff-log.md) — alguém pode já estar nesse item.
