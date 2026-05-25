# ADR-0007 — Runtime alvo dos agentes (TS via LangGraph JS)

- **Data:** 2026-05-23
- **Status:** aceita
- **Supersede:** —
- **Relacionados:** ADR-0003 (estratégia da camada de agentes), ADR-0004 (shared packages), ADR-0006 (QA stack), ADR-0011 (estratégia para `feedgen` Python — em queue)

## Contexto

`@cao/runtime` é referenciado por 14+ docs (todos os agentes, governance, observability) mas não tinha implementação até Sub-fase 2.2. Para sair de "stub" precisamos definir **a stack-base do executor de agentes**.

Decisões a tomar:
1. Linguagem-host do runtime (TS vs Python).
2. Framework de orquestração ou implementação direta.
3. Como agentes em outras linguagens (futuro `feedgen` Python) se integram.

Restrições já estabelecidas:
- ADR-0003 — agentes declarativos com schema (input/output zod), prompt, tools, contract. Runtime invoca; agentes não importam runtime.
- ADR-0004 — packages TS com `"type": "module"`; ESM-first.
- ADR-0006 — vitest + biome + zod + commitlint. Stack TS solidificada.
- ADR-0009 — scope `@cao/*` para todos os packages.
- 5 packages dependem do runtime para rodar: `@cao/llm`, `@cao/memory`, `@cao/guardrails`, `@cao/observability`, `@cao/core`.

## Decisão

**TypeScript** é a linguagem-host de `@cao/runtime`. **LangGraph JS** é a referência de design (graph-based execution + checkpoints), porém a implementação inicial é **própria** — sem `langgraph` como dependência runtime obrigatória.

Detalhe:

| Camada | Escolha | Versão alvo | Onde mora |
|---|---|---|---|
| Linguagem-host | **TypeScript** | `^5` | já é stack default (STACK_RULES §1) |
| Runtime base | implementação própria | n/a | `06_packages/runtime/src/` |
| Design de referência | **LangGraph JS** (estado + nós + edges) | `^0.x` (a clonar em `01_upstreams/`) | só referência conceitual; opcional em runtime |
| Validação de I/O | **zod** (via `@cao/guardrails.validate()`) | `^3` | mesma stack do ADR-0006 |
| Persistência de runtime/audit | `@cao/memory` (markdown vault) | workspace | append em `<tenant>/audit/<date>.md` |
| Custo + telemetria | `@cao/observability` (`agent.invoked/completed/failed`) | workspace | provider plugável (Console/PostHog futuro) |
| LLM provider | `@cao/llm` (factory pattern com `CompleteFn`) | workspace | Anthropic SDK primeiro; OpenAI/Gemini possíveis |

**Contrato mínimo do runtime** (já implementado em `06_packages/runtime/src/runtime.ts`):

```typescript
defineAgent<I, O>({ name, tier, inputSchema, outputSchema, prompt, parseOutput?, model?, system? })
runAgent<I, O>(agent, input, { tenantId }, { complete, memory, observability, clock?, ids? })
  → Promise<{ output, runId, durationMs, costUsd, model }>
```

Fluxo: `validate(input)` → `prompt(input, ctx)` → `complete()` → `parseOutput()` (default JSON.parse) → `validate(output)` → audit log.

**Política para agentes não-TS:**
- Agentes em Python (caso de `feedgen` heavy) ficam **sidecar isolado** (ADR-0011 — em queue).
- TS runtime continua orquestrador; chamada para sidecar Python via subprocess ou IPC tipado.
- Não há plano de portar runtime para Python.

## Alternativas consideradas

**Linguagem-host**

| Opção | Pros | Contras | Decisão |
|---|---|---|---|
| **TypeScript** | Ecossistema Shopify nativo (Admin GraphQL, app templates); zod + biome + vitest já solidificados; toda integração existente é TS | Tipagem em prompts não-TS (Python upstreams) exige adapters | **escolhido** |
| Python | Ecossistema LLM mais maduro (LangChain, LlamaIndex); maior pool de devs de IA | Quebra simetria com app Shopify (Remix/React); duplica config (uv + ruff vs pnpm + biome); duas runtimes em produção | rejeitado |
| Híbrido (Python core + TS apps) | Ambos os mundos | Complexidade operacional alta (2 deploys, 2 stacks, 2 testes); custo de coordenação > benefício para v1 | rejeitado |

**Framework de orquestração**

| Opção | Pros | Contras | Decisão |
|---|---|---|---|
| **Implementação própria + design LangGraph como referência** | Curva de aprendizado zero (~150 linhas de TS); zero deps runtime adicionais; total controle do schema + audit | Não temos checkpointer/replay built-in (precisa ser implementado se virar requisito) | **escolhido** |
| LangGraph JS como dep direta | Checkpointer, persistence, streaming de tokens out-of-the-box | +1 dep grande; muito recurso não usado em v1; reescreve nosso fluxo já consolidado | rejeitado (pode reentrar para v2 se checkpoint virar requisito) |
| Mastra / Inngest / outro orquestrador | Workflow engine completo | Acoplamento alto; difícil testar; muitos recursos não usados | rejeitado |
| LangChain.js | Composição rica | API instável; muito magic; complica testes | rejeitado |

## Consequências

**Positivas:**
- `@cao/runtime` mínimo já entregue (Sub-fase 2.2) sem precisar instalar/aprender LangGraph.
- Agentes declarativos em TS validados em build-time + runtime (zod).
- Audit log determinístico em markdown — auditável por humano sem ferramenta.
- 41 testes verdes cobrindo o contrato (`06_packages/runtime/src/runtime.test.ts`).
- `repo-auditor` (1º agente real) pode evoluir para usar `runAgent()` com LLM real assim que `ANTHROPIC_API_KEY` estiver disponível.

**Negativas:**
- Sem checkpointer nativo — se um agente longo falhar no meio, perde-se o trabalho. Mitigação: começar com agentes curtos (< 30s); checkpointer é Sub-fase 2.4+ se virar dor real.
- Sem streaming de tokens out-of-the-box. Mitigação: a versão atual de `@cao/llm` retorna `Promise<CompleteResult>` (não stream); streaming é evolução opcional quando UI consumir.
- Manter compatibilidade com LangGraph como referência exige ler o upstream periodicamente. Mitigação: ADR-0002 + `repo-auditor` automatizam parte da auditoria.

**Implicações para outros ADRs:**
- ADR-0004 (shared packages) — confirma `@cao/runtime` como package central; outros packages **podem** importar runtime apenas se forem extensão (skills, adapters).
- ADR-0011 (em queue) — confirma que agentes Python ficam fora do runtime; vivem como sidecar.
- ADR-0008 (worker queue, em queue) — runtime é síncrono in-process; queue (BullMQ) fica em camada de cima (`04_apps/*/jobs/`) quando agentes longos chegarem.

## Quando reabrir

- Se streaming de tokens virar requisito de UX (chat com lojista).
- Se checkpoint/replay virar requisito (agente > 1min com retomada).
- Se LangGraph JS estabilizar + adicionarmos > 1 dep dele em outras camadas — pode valer trazer como dep formal.
- Se decidirmos publicar agentes como serverless functions (Cloudflare Workers / Vercel) e o footprint do runtime atual virar gargalo.

## Implementação

Já entregue em `06_packages/runtime/src/runtime.ts` (Sub-fase 2.2). Próximos passos rastreados em [`07_memory/vault/projects/commerce-agent-os/next-actions.md`](../../07_memory/vault/projects/commerce-agent-os/next-actions.md) (N5: LLM end-to-end).
