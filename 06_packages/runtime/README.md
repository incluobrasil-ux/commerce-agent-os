# @cao/runtime

Wrapper sobre LangGraph. Define o contrato de agente, executor, checkpoint, eventos.

## API prevista
- `defineAgent({ name, inputSchema, outputSchema, prompt, tools })` — definição declarativa.
- `runAgent(agent, input, { policy, observer })` — execução.
- `invokeAgent(name, input)` — chamada cross-agent (apenas Tier 0 → outros).
- Checkpoint/resume.
- Eventos para observabilidade (custos, latência, tools chamadas).

## Garantias
- Toda chamada a tool passa por `@cao/guardrails`.
- Toda execução loga via `@cao/observability`.
- Estado curto vive no grafo; estado longo em `@cao/memory`.

## Upstream
- `01_upstreams/langgraph` (referência). Dependência runtime via SDK oficial `@langchain/langgraph` (a confirmar versão TS).

## Consumido por
- Apps em `04_apps/`.
- Agentes em `03_agents/` (definição declarativa; runtime instancia).

## Status
Stub.
