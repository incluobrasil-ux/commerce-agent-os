---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-23T16:40:00Z
tags: [current-state, status]
source: mixed
confidence: 1.0
---

# Current State

**Para que serve:** snapshot **curtíssimo** do estado da operação. Quem abre isto deve saber em 60 segundos onde estamos. Sem narrativa, sem links — só status.

**Como usar:** atualizar **toda vez** que mudar fase, marco, bloqueio ou status verde/vermelho. Quem fizer a alteração também atualiza `updated_at` no frontmatter.

**Output que gera:** snapshot único e atual da operação.

**Regra:** ≤ 25 linhas no corpo. Se estiver crescendo, alguma informação deveria estar em `ops-brief.md` ou `workstreams.md`.

---

## Fase

| | |
|---|---|
| Macro-fase | 2 — Implementação |
| Sub-fase | 2.3 parcial concluída (2/10 upstreams) → 2.4 (LLM end-to-end) |
| Último marco | `langgraph` + `shopify-app-template-react-router` clonados e auditados — ambos MIT |
| Próximo marco técnico | LLM real invocado por agente via `@cao/runtime` (Sub-fase 2.4) |

## Verde

- `pnpm install / typecheck / lint / test / test:smoke` — todos OK.
- 6 packages `@cao/*` implementados com testes (core, llm, memory, guardrails, observability, runtime).
- **`repo-auditor` é o 1º agente real**, executável via `pnpm audit:repo <path>`, modo determinístico (sem `ANTHROPIC_API_KEY`).
- Suíte completa: **52 testes em ~1.6s** (8 arquivos).
- `.env.example`, `SETUP_LOCAL.md`, `COMMANDS.md`, `clone-upstreams.sh` populados.
- **2 upstreams clonados + auditados** (`langgraph`, `shopify-app-template-react-router`).
- **Suíte 54 testes verdes** (detector de licença melhorou — reconhece MIT canônico).
- CI no GitHub Actions; branch protection em `main`; tag `v0.1.0-architecture-baseline`.
- 8 ADRs aceitos.
- Cérebro operacional v1 multi-operador estruturado.

## Bloqueado

- ~~B1~~ — ✅ `ANTHROPIC_API_KEY` em `.env.local` 2026-05-23 (rotacionar — apareceu em chat log).
- ~~B2~~ — ✅ 2 upstreams clonados 2026-05-23.
- ~~B3~~ — ✅ ADR-0007 aceito 2026-05-23.
- **B4** — N4 + correção do detector pendentes de commit + push.
- **B5 (novo)** — `gitleaks` binário não instalado localmente (pre-commit hooks ativos mas sem secret scan).

Detalhe em [blockers-and-risks.md](blockers-and-risks.md).

## Resumo em 1 linha

> Repo clonável e roda 1º agente real em ≤ 5 min sem credencial; falta commit/push + chave Anthropic para LLM end-to-end.
