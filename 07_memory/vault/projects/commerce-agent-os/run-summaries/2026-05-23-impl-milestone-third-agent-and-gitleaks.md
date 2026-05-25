---
created_at: 2026-05-23T17:15:00Z
updated_at: 2026-05-23T17:15:00Z
tags: [impl-milestone, sub-fase-2-5, learning-memory-curation, gitleaks]
source: human:incluobrasil
kind: impl-milestone
result: green
confidence: 1.0
related:
  - 03_agents/learning-memory-curation/src/index.ts
  - 03_agents/learning-memory-curation/src/cli.ts
  - 03_agents/learning-memory-curation/src/learning-memory-curation.test.ts
  - 10_ops/scripts/SETUP_LOCAL.md
  - 10_ops/scripts/COMMANDS.md
---

# Sub-fase 2.5 iniciada: 3º agente real + secret scan ativo

## Contexto

Decisão de roadmap (N9): priorizar escalada de agentes reais (2.5) antes de Shopify connect (2.6). Primeiro entregável: `@cao/learning-memory-curation`. Em paralelo, fechado B5 (gitleaks).

## O que aconteceu

**Gitleaks integrado ao pre-commit (B5 fechado)**
- `gitleaks` 8.30.1 via winget; PATH atualiza apenas em terminais abertos depois da instalação (documentado).
- Pre-commit agora: `pnpm lint && pnpm test:smoke && pnpm secret-scan`.
- Scripts novos: `pnpm secret-scan` (staged-only, rápido) + `pnpm secret-scan:full` (varre tudo).
- Validação: criada fixture com `-----BEGIN RSA PRIVATE KEY-----` → gitleaks bloqueou (exit 1, "leaks found: 1"). Fixtures com AWS keys de exemplo (`AKIA*EXAMPLE*`) passam — comportamento esperado por stopwords padrão.

**`@cao/learning-memory-curation` implementado (3º agente real)**
- Lê `<tenant>/audit/` + `<tenant>/working/` via `Memory.list()`/`Memory.read()`.
- Output: array de `FactProposal` (slug kebab-case ≤ 60 chars, title, body markdown 20–1500 chars, tags 1–8, confidence ≥ 0.6, rationale).
- CLI escreve cada proposal em `<tenant>/facts/<slug>.md` com frontmatter completo (created_at, tags, source, confidence, rationale). `--dry-run` para preview sem escrita.
- Conservador por design: prompt instrui "better to skip 5 weak items than promote 1 weak item"; mínimo de confidence 0.6.
- 6 testes unit com `fakeComplete`: happy, JSON em fences, proposals vazios (memória warming-up), slug inválido (zod fail), input curto (zod fail), workingExcerpt vazio.

**Suíte total: 65 testes verdes** (10 arquivos, ~1.2s).

**Real run pendente:** `.env.local` ainda contém a key antiga (revogada). Tentativa de `pnpm curate:memory` retorna 401. Usuário precisa atualizar manualmente.

## Achados / decisões

- **Zod `.default()` em input/output schemas quebra inferência do `defineAgent<I, O>`** — `T | undefined` no input vs `T` no output. Solução: campos obrigatórios sem default; CLI/caller passa valores explícitos (zero overhead, mais correto). Aplicar essa lição para próximos agentes.
- **Cada agente novo replica o padrão `audit-synthesizer`:** package + tsconfig + `src/index.ts` (defineAgent) + `src/cli.ts` (thin CLI montando deps) + `src/<name>.test.ts` (mocks). Levou ~20 min total criar o pacote. Padrão é replicável.
- **Pre-commit + gitleaks funciona bem no Git for Windows** (MSYS bash herda PATH do processo pai). Único cuidado: PATH precisa ter `%LOCALAPPDATA%\Microsoft\WinGet\Links` no terminal de origem.
- **Bash do "Bash tool" tem PATH separado.** Para mim usar gitleaks em sessões de terminal, preciso `export PATH=...` inline antes de cada commit. Não afeta o usuário comum (terminal normal já tem).
- **CLI do learning-memory-curation tem proteção:** se audit log do tenant < 20 chars, falha com mensagem clara apontando qual agente rodar antes.

## Impacto

- Sub-fase 2.5 destravada concretamente. **3 agentes reais** no sistema (era 2).
- Bloqueio B5 fechado de verdade — pre-commit agora bloqueia commit com chave privada hardcoded.
- Padrão de DX para agentes novos consolidado: `pnpm <verb>:<noun> [--tenant=<id>]`. Já temos: `audit:repo`, `synthesize:audit`, `curate:memory`.
- Próximo agente da Sub-fase 2.5 (N12) começa com benchmarking claro: ~20 min de implementação por agente reusando o padrão.

## Ações geradas

- [ ] **Usuário:** atualizar `.env.local` com a key nova rotacionada (substituir linha existente).
- [ ] Rodar `pnpm curate:memory --tenant=_test` → verificar output em `07_memory/vault/_test/facts/`.
- [ ] Criar run-summary final tipo `agent-run` para a primeira execução real.
- [ ] N12 — implementar `memory-context` (4º agente real, read-only, monta context briefs).
- [ ] Considerar criar template/scaffold script para agentes novos (`pnpm new:agent <name>`) quando criarmos o 4º.

## Referências

- código: [`03_agents/learning-memory-curation/`](../../../../../03_agents/learning-memory-curation/)
- comando: `pnpm curate:memory [--tenant=<id>] [--dry-run]`
- handoff: [`handoff-log.md`](../handoff-log.md) topo
- session: [`session-log.md`](../session-log.md) topo
