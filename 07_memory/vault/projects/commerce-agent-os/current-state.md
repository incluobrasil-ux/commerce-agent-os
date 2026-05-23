---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-23T17:15:00Z
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
| Sub-fase | 2.5 em curso (mais agentes reais) |
| Último marco | 3º agente real entregue: `@cao/learning-memory-curation` — implementado + 65 testes verdes. Real run pendente da key nova em `.env.local`. |
| Próximo marco técnico | Real run do `learning-memory-curation` → 4º agente (`memory-context` ou `competitor-benchmark`) |

## Verde

- `pnpm install / typecheck / lint / test / test:smoke` — todos OK.
- 6 packages `@cao/*` implementados com testes (core, llm, memory, guardrails, observability, runtime).
- **`repo-auditor` é o 1º agente real**, executável via `pnpm audit:repo <path>`, modo determinístico (sem `ANTHROPIC_API_KEY`).
- `.env.example`, `SETUP_LOCAL.md`, `COMMANDS.md`, `clone-upstreams.sh` populados.
- **2 upstreams clonados + auditados** (`langgraph`, `shopify-app-template-react-router`).
- **Suíte 65 testes verdes** em 10 arquivos.
- **3 agentes reais:** `repo-auditor` (determinístico) + `audit-synthesizer` (LLM) + `learning-memory-curation` (LLM, real run pendente).
- Audit log de tenant escrito por `@cao/runtime` em `07_memory/vault/_test/audit/`.
- **Pre-commit secret-scan ativo** (gitleaks 8.30.1) — bloqueia secrets antes do push.
- CI no GitHub Actions; branch protection em `main`; tag `v0.1.0-architecture-baseline`.
- 8 ADRs aceitos.
- Cérebro operacional v1 multi-operador estruturado.

## Bloqueado

- ~~B1~~ — ✅ key rotacionada. ⚠ `.env.local` precisa ser atualizada manualmente com a nova key (a antiga ainda está lá; usar `pnpm curate:memory` retorna 401 até trocar).
- ~~B2~~ — ✅ resolvido.
- ~~B3~~ — ✅ resolvido.
- ~~B4~~ — ✅ todos os blocos commitados + pushados (8 commits totais em `feat/core-runtime-and-first-agent`).
- ~~B5~~ — ✅ gitleaks 8.30.1 ativo no pre-commit (validado com private key fake).

## Resumo em 1 linha

> 3 agentes reais implementados, pre-commit com secret-scan ativo, 65 testes verdes — falta atualizar `.env.local` com nova key e rodar `pnpm curate:memory` real.

Detalhe em [blockers-and-risks.md](blockers-and-risks.md).
