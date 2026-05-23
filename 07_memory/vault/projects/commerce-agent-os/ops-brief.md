---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-23T16:40:00Z
tags: [brief, status]
source: mixed
confidence: 1.0
---

# Ops Brief

**Para que serve:** brief operacional vivo. Em 1 minuto, dá pra saber em que estado cada bloco do sistema está e quais são os próximos 3 focos.

**Como usar:** revisar 1× por semana ou ao trocar de sub-fase. Mantém-se curto. Para "onde estamos agora **mesmo**", ir antes em [current-state.md](current-state.md). Para fila completa, [operational-priorities.md](operational-priorities.md). Para trilhas paralelas, [workstreams.md](workstreams.md).

**Output que gera:** semáforo do projeto + foco de execução.

---

## Semáforo dos blocos

Legenda: 🟢 funciona / 🟡 parcial / 🔴 não funciona / ⚪ não iniciado.

| Bloco | Estado | Observação |
|---|---|---|
| Estrutura do monorepo | 🟢 | 24 workspaces, project references OK |
| QA stack (lint/test/typecheck/smoke) | 🟢 | tudo verde local + CI |
| `@cao/core` | 🟢 | errors / result / clock / id / retry + testes |
| `@cao/observability` | 🟢 | console + silent providers + audit hook |
| `@cao/guardrails` | 🟢 | validate(zod) + PII + secrets |
| `@cao/memory` | 🟢 | CRUD markdown com isolamento por tenant |
| `@cao/llm` | 🟡 | cliente + custo prontos; sem chamada real (falta API key) |
| `@cao/runtime` | 🟡 | `defineAgent` + `runAgent` prontos; ainda não acoplado a agente em runtime real |
| `@cao/repo-auditor` | 🟢 | **1º agente real** — determinístico, sem LLM, comando único `pnpm audit:repo` |
| Outros `@cao/*` (stubs) | 🟡 | placeholders ainda |
| Outros agentes (16 declarativos) | 🔴 | só schema; nenhum executável |
| Apps (`04_apps/`) | 🔴 | scaffolds, sem código real |
| Integrações (`05_integrations/`) | 🔴 | contratos + adapters stub |
| Upstreams (`01_upstreams/`) | 🟡 | 2/10 clonados (langgraph + shopify-app-template, ambos MIT). Outros 8 sob demanda. |
| Memória (`07_memory/`) | 🟢 (template + cérebro) / ⚪ (tenants) | template OK; cérebro v1 multi-operador; nenhum tenant provisionado |
| CI | 🟢 | lint+typecheck+smoke+commitlint em PR |
| CD | ⚪ | sem deploy ainda |
| Security operacional | 🔴 | sem secret manager, sem retenção definida |

Quem precisa do estado **agora mesmo** (verde/bloqueado, sem detalhe) → [current-state.md](current-state.md).
Quem precisa de divisão por trilha → [workstreams.md](workstreams.md).

## Marcos alcançados

- 2026-05-23 — Macro-fase 1 (scaffold) concluída ([summary](run-summaries/2026-05-23-impl-milestone-phase-1-setup-complete.md)).
- 2026-05-23 — Sub-fase 2.0 (ADRs estruturais) concluída.
- 2026-05-23 — Sub-fase 2.1 (bootstrap funcional) concluída + repo público + tag `v0.1.0-architecture-baseline`.
- 2026-05-23 — Sub-fase 2.2 (núcleo `@cao/*`) verde em local ([summary](run-summaries/2026-05-23-test-milestone-sub-phase-2-2-suite-green.md)).
- 2026-05-23 — Cérebro operacional v1 (multi-operador) estruturado.
- 2026-05-23 — **`repo-auditor` é o 1º agente real funcional** ([summary](run-summaries/2026-05-23-agent-run-repo-auditor-self-audit.md)). Suíte sobe para 52 testes verdes.
- 2026-05-23 — `.env.example`, `SETUP_LOCAL.md`, `COMMANDS.md` prontos para clone em outro PC.

## Próximos 3 focos

1. **W1 finalizar:** commitar Sub-fase 2.2 + repo-auditor + cérebro + docs em branch único → PR → merge em `main`.
2. **W2 evoluir:** ligar `repo-auditor` (ou novo agente) ao LLM real via `@cao/runtime` (depende de `ANTHROPIC_API_KEY` + ADR-0007).
3. **Sub-fase 2.3:** clonar `langgraph` + `shopify-app-template` em `01_upstreams/` e rodar `pnpm audit:repo` em cada um.

## Critério para "Sub-fase 2.3 concluída"

- ≥ 2 upstreams clonados em `01_upstreams/` (mínimo `langgraph` + `shopify-app-template`).
- `pnpm audit:repo 01_upstreams/<repo>` rodado em cada com relatório em `12_reports/audits/repo-auditor/`.
- `00_meta/upstreams_index.md` atualizado com SHA + licença confirmada.
- Premissas dos audits originais reavaliadas (flags `⚠ verificar` resolvidas).
