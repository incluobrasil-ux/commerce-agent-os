---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-23T00:00:00Z
tags: [test-milestone, sub-phase-2-2, runtime, packages]
source: mixed
kind: test-milestone
result: green
confidence: 1.0
related:
  - 06_packages/core/src/core.test.ts
  - 06_packages/memory/src/memory.test.ts
  - 06_packages/guardrails/src/guardrails.test.ts
  - 06_packages/llm/src/cost.test.ts
  - 06_packages/runtime/src/runtime.test.ts
  - 11_tests/smoke/structure.smoke.ts
---

# Sub-fase 2.2 — suite completa verde

## Contexto

Fechamento da Sub-fase 2.2 (núcleo `@cao/*` mínimo). Implementados 6 packages (`core`, `llm`, `memory`, `guardrails`, `observability`, `runtime`) com testes unitários + smoke. Rodada local em Windows 11, sem credenciais externas (Anthropic mockado via `CompleteFn`).

## O que aconteceu

- `pnpm install` verde — 24 workspaces, ~2.9s.
- `pnpm typecheck` verde — `tsc -b` sem erros, com `exactOptionalPropertyTypes: true` em todos os tsconfigs.
- `pnpm lint` verde — biome em 148 arquivos.
- `pnpm test` — **6 arquivos / 41 testes passando em ~1.08s**.
- `pnpm test:smoke` — 1 arquivo / 3 testes em ~584ms.
- Cobertura por package:
  - `core`: 10 testes (errors, result, clock fake/real, id, retry com FakeClock).
  - `observability`: implícito (usado pelos demais; SilentProvider exposto para testes).
  - `guardrails`: 11 testes (validate, PII email/CPF/phone/redact, secrets Anthropic/GitHub/AWS).
  - `memory`: 9 testes incluindo isolamento cross-tenant + path traversal.
  - `llm`: 3 testes (tabela de custo + DEFAULT_MODEL).
  - `runtime`: 5 testes (happy path, input/output schema fail, JSON parse fail, parseOutput custom).

## Achados / decisões

- **`exactOptionalPropertyTypes: true` força ergonomia mais cara** em pontos com campos opcionais (`input.system`, `agent.model`). Solução: conditional spread `...(x !== undefined && { x })`. Mantido — vale o rigor para passar valores undefined explicitamente.
- **Cross-OS em `Memory.list()`** exigiu retorno em paths POSIX (`/`) mesmo em Windows. `node:path/join` quebrava o snapshot de teste — substituído por concat manual com `/`.
- **Github token regex (`[A-Za-z0-9]{36,}`)** rejeitou string com `_` no fixture inicial. Confirmado: tokens reais não têm underscore — fixture corrigida, regra mantida.
- **Biome override para testes** (`noNonNullAssertion: off`, `noExplicitAny: off`) decidido para evitar ruído em fixtures — produção continua estrita.
- **`runtime` aceita `complete: CompleteFn` por DI**, não instancia Anthropic. Pagamento: teste sem rede. Custo: chamada real precisa fábrica em [llm/anthropic-client.ts](../../../../../06_packages/llm/src/anthropic-client.ts).

## Impacto

Destrava gaps #18, #19, #20 do [phase-1-gap-analysis.md](../../../../../12_reports/audits/phase-1-gap-analysis.md) (`@cao/runtime`, `@cao/memory`, `@cao/guardrails` deixam de ser stub). Semáforos em [ops-brief.md](../ops-brief.md) sobem para 🟢 nos 4 packages com testes; `llm`/`runtime` ficam 🟡 enquanto não houver chamada Anthropic real verificada. Bloqueio B4 (trabalho não commitado) permanece — precisa virar PR.

## Ações geradas

- [ ] Commitar em branch `feat/core-runtime-mvp` + abrir PR. → N1 em [next-actions.md](../next-actions.md).
- [ ] Confirmar `ANTHROPIC_API_KEY` em dev → N2.
- [ ] Aceitar ADR-0007 (runtime TS via LangGraph JS) → N3.
- [ ] Primeiro `agent-run` real do `repo-auditor` → vai gerar `2026-MM-DD-agent-run-repo-auditor-first-run.md`.

## Referências

- testes: `06_packages/{core,memory,guardrails,llm,runtime}/src/*.test.ts`
- smoke: [`11_tests/smoke/structure.smoke.ts`](../../../../../11_tests/smoke/structure.smoke.ts)
- CI: `.github/workflows/ci.yml`
- código-chave: [`06_packages/runtime/src/runtime.ts`](../../../../../06_packages/runtime/src/runtime.ts)
