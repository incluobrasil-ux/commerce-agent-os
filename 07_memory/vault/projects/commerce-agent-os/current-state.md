---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-23T22:58:00Z
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
| Sub-fase | 2.3 **concluída** (10/10 upstreams) + 2.5 em curso (4 de 17 agentes reais) |
| Último marco | **Sub-fase 2.3 fechada de verdade** — 10 upstreams clonados + auditados; 2 reclassificações de licença (basic-memory AGPL-3.0, ad-factory-agent UNKNOWN) |
| Próximo marco técnico | Real run dos 3 agentes LLM (depende de `.env.local` com key nova) — OU 5º agente / Sub-fase 2.6 |

## Verde

- `pnpm install / typecheck / lint / test / test:smoke` — todos OK.
- 6 packages `@cao/*` implementados com testes (core, llm, memory, guardrails, observability, runtime).
- **`repo-auditor` é o 1º agente real**, executável via `pnpm audit:repo <path>`, modo determinístico (sem `ANTHROPIC_API_KEY`).
- `.env.example`, `SETUP_LOCAL.md`, `COMMANDS.md`, `clone-upstreams.sh` populados.
- **2 upstreams clonados + auditados** (`langgraph`, `shopify-app-template-react-router`).
- **Suíte 81 testes verdes** em 12 arquivos (+ `noop-client` com 4 testes; `@cao/llm` ganha fallback explícito).
- **`pnpm llm:smoke`** — smoke isolado de LLM em 1 comando; reporta SKIPPED (sem key) ou OK + custo/latência (com key).
- **4 agentes reais** (4 de 17): `repo-auditor` (det.) + `audit-synthesizer` + `learning-memory-curation` + `memory-context` (LLM).
- **10 upstreams clonados + auditados** (Sub-fase 2.3 ✅). Licenças: 7 MIT, 2 Apache-2.0, 1 AGPL-3.0, 1 UNKNOWN (com finding crítico).
- Audit log de tenant escrito por `@cao/runtime` em `07_memory/vault/_test/audit/`.
- Pre-commit secret-scan ativo (gitleaks 8.30.1).
- DX: 4 comandos `pnpm <verb>:<noun>` + `bash 10_ops/scripts/clone-upstreams.sh`.
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

> Sub-fase 2.3 fechada (10 upstreams auditados, 2 reclassificações de licença); 4 agentes reais; 73 testes verdes; único bloqueio operacional é atualizar `.env.local` com a key nova rotacionada.

Detalhe em [blockers-and-risks.md](blockers-and-risks.md).
