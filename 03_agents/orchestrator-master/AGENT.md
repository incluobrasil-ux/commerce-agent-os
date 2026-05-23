# orchestrator-master

## Missão
Raiz da árvore de invocação. Recebe a intent do app (ou de outro orquestrador upstream) e decide quais agentes Tier 1–6 chamar, em que ordem, com que escopo. Não executa lógica de domínio.

## Entradas
- `intent`: objeto descrevendo o que precisa ser feito (ex.: `publish_optimized_feed`, `compose_campaign`, `audit_catalog`).
- `tenant_id`: identifica a loja.
- `context_ref` (opcional): ponteiro para contexto pré-carregado em `07_memory/`.
- `policy`: limites de custo, tempo, ações destrutivas permitidas.

## Saídas
- `plan`: árvore de execução resolvida (agente, ordem, deps).
- `result`: resultado consolidado das chamadas.
- `audit_trail`: lista de chamadas executadas, com `agent`, `ms`, `tokens`, `cost`, `outcome`.

## Dependências
- Packages: `@cao/runtime`, `@cao/memory`, `@cao/guardrails`, `@cao/observability`, `@cao/core`.
- Integrations: nenhuma direta (delegado aos agentes de tier inferior).

## Relação com outros agentes
- **Invoca:** qualquer agente Tier 1–6.
- **É invocado por:** apps em `04_apps/*` e por jobs em `10_ops/`.
- **Coordena:** chamadas cross-tier — nenhum agente Tier 1–6 chama outro tier diretamente; todo cross-tier passa por aqui.

## Upstream relacionado
- `langchain-ai/langgraph` (dependência indireta via `@cao/runtime`).

## Status
Stub. Sem implementação.
