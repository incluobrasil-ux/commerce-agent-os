---
created_at: 2026-05-23T19:25:00Z
updated_at: 2026-05-23T19:25:00Z
tags: [impl-milestone, sub-fase-2-5, memory-context, agent-pattern]
source: human:incluobrasil
kind: impl-milestone
result: green
confidence: 1.0
related:
  - 03_agents/memory-context/src/index.ts
  - 03_agents/memory-context/src/cli.ts
  - 03_agents/memory-context/src/memory-context.test.ts
---

# 4º agente real: `@cao/memory-context` (read-only context brief)

## Contexto

Continuação da Sub-fase 2.5. Após `learning-memory-curation` (que ESCREVE em facts/), implementado `memory-context` — agente **read-only** que LÊ todo o estado de memória de um tenant e produz brief estruturado para o próximo agente usar antes de agir.

## O que aconteceu

- Package `@cao/memory-context` criado em ~10 min seguindo padrão dos 2 agentes LLM anteriores.
- Input: `tenantId`, `taskScope` (descrição do que o próximo agente vai fazer), e excerpts de facts/working/audit lidos via `Memory`.
- Output rico: `brandVoice` + `hardConstraints[]` + `recentSignals[]` + `knownGaps[]` + `recommendation` + `confidence` (0–1).
- System prompt enfatiza honestidade: "do NOT invent facts; mark in knownGaps if unknown; LOWER confidence when memory is thin".
- CLI `pnpm context:brief --task="..." [--tenant=_test]` escreve brief em `12_reports/context-briefs/<tenant>-<timestamp>.md`.
- Proteção: se total de memória < 50 chars, falha com mensagem orientando rodar `synthesize:audit` + `curate:memory` primeiro.
- 6 unit tests (happy, arrays vazios para memória fina, JSON em fences, confidence fora de range, taskScope curto, recommendation curta). Suíte: **65 → 71 verdes**.
- Lint + typecheck verdes (169 arquivos no biome scan).

## Achados / decisões

- **Padrão de DX consolidado em 4 agentes:** package + tsconfig com refs aos 5 packages core + `src/index.ts` (defineAgent) + `src/cli.ts` (thin, monta deps) + `src/<name>.test.ts` (mocks). Cada novo agente leva ~15 min de implementação + testes.
- **Convenção `pnpm <verb>:<noun> [args]`** estabelecida — `audit:repo`, `synthesize:audit`, `curate:memory`, `context:brief`. Operacionalmente memorável.
- **`memory-context` é caminho natural para encadeamento de agentes** — qualquer agente futuro (Tier 1/2) pode invocar `context:brief` primeiro para se orientar. Quando integrarmos com `orchestrator-master`, esse será o padrão.
- **Bloqueio real:** 3 dos 4 agentes precisam de Anthropic key válida; `.env.local` tem key revogada. Real run dos 3 agentes LLM em UM pipeline pode ser feito em < 30s totais quando a key for atualizada.

## Impacto

- 4 de 17 agentes do catálogo são reais agora (era 3). Velocidade comprovada: 2 agentes implementados em uma única sessão a partir do mesmo padrão.
- `memory-context` desbloqueia design de agentes futuros que precisam "ler o tenant antes de agir" — pattern crítico para `product-offer`, `creative-copy-assets`, `marketing-director`.
- 71 testes verdes mantém critério de QA. CI continua válido.

## Ações geradas

- [ ] **Atualizar `.env.local`** com key nova → validar pipeline de 3 comandos.
- [ ] Criar run-summary tipo `agent-run` agrupando as 3 execuções reais quando rodarem.
- [ ] N13 — decidir: 5º agente (continuar 2.5) vs Sub-fase 2.6 (Shopify connect).
- [ ] Considerar criar scaffold script `pnpm new:agent <name>` quando criarmos o 5º — padrão está claro.

## Referências

- código: [`03_agents/memory-context/`](../../../../../03_agents/memory-context/)
- comando: `pnpm context:brief --task="<descrição>" [--tenant=<id>]`
- handoff: [`handoff-log.md`](../handoff-log.md) topo
- session: [`session-log.md`](../session-log.md) topo
