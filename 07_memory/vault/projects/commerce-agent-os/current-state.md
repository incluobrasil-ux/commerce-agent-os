---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-24T00:10:00.000Z
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
| Sub-fase | 2.3 ✅ + 2.5 (4 agentes + 1) + 2.6 ✅ + **2.7 dry-run Merchant implementado** |
| Último marco | **Pipeline Merchant dry-run funcional** — `pnpm feed:dry-run` transforma produtos (fixture ou Shopify) → valida zod → escreve relatório auditável em `12_reports/merchant-dry-runs/`. Validado em real run (2 ok / 1 fail / 5 warnings). |
| Próximo marco técnico | Conectar credenciais externas (Shopify + Anthropic) para rodar pipeline com dados reais — todas validações locais já passam. |

## Verde

- `pnpm install / typecheck / lint / test / test:smoke` — todos OK.
- 6 packages `@cao/*` implementados com testes (core, llm, memory, guardrails, observability, runtime).
- **`repo-auditor` é o 1º agente real**, executável via `pnpm audit:repo <path>`, modo determinístico (sem `ANTHROPIC_API_KEY`).
- `.env.example`, `SETUP_LOCAL.md`, `COMMANDS.md`, `clone-upstreams.sh` populados.
- **2 upstreams clonados + auditados** (`langgraph`, `shopify-app-template-react-router`).
- **Suíte 126 testes verdes** em 18 arquivos (+ 10 cobrindo `@cao/brain-bridge.captureRun` + 2 ajustes).
- **Cérebro ganha `captureRun()`** (`@cao/brain-bridge`): após execução relevante, gera run-summary curto, atualiza index, bumps current-state, opcional append em next-actions/priorities/blockers/session-log.
- **`pnpm ops:capture <input.json>`** standalone + **`--capture` integrado** em `audit:repo` e `feed:dry-run` (outros CLIs ficam via `ops:capture` manual).
- **6 agentes reais** (era 4): + `product-feed-seo` (LLM SEO) + `catalog-feed-ops` (orquestrador CLI).
- **`pnpm llm:smoke`** — smoke LLM isolado.
- **`pnpm shopify:list-products [--first=N]`** — Sub-fase 2.6.
- **`pnpm feed:dry-run [--source=fixture|shopify] [--seo] [--first=N]`** — Sub-fase 2.7: pipeline Merchant completo, 100% local sem credenciais. Dry-run gera Markdown + JSON em `12_reports/merchant-dry-runs/`.
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
- ~~B5~~ — ✅ gitleaks 8.30.1 ativo no pre-commit.
- **B6 (novo)** — `SHOPIFY_SHOP` + `SHOPIFY_ADMIN_TOKEN` ausentes em `.env.local`. Criar custom app em dev store (~3 min) destrava primeira demo Shopify real.

## Resumo em 1 linha

> Sub-fases 2.3 ✅ + 2.5 (6 agentes) + 2.6 ✅ + 2.7 ✅ (Merchant dry-run); 114 testes verdes; pipeline real `Shopify → Merchant feed → validação → dry-run report` funciona 100% local com fixture. Bloqueios externos: B1 (Anthropic key), B6 (Shopify creds), B7 (Google creds — só para upload real, **não** para dry-run).

Detalhe em [blockers-and-risks.md](blockers-and-risks.md).
