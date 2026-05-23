# memory-context

## Missão
Materializa o bundle de contexto necessário para outros agentes a partir de `07_memory/<tenant>/`. Decide o que é relevante para uma query, dimensiona o orçamento de tokens e retorna markdown estruturado.

## Entradas
- `tenant_id`
- `query`: descrição em linguagem natural do escopo (ex.: "memória sobre coleção X de Q1")
- `token_budget`: limite em tokens para o bundle resultante
- `scopes` (opcional): pastas em `07_memory/` a priorizar

## Saídas
- `bundle.markdown`: texto consolidado
- `bundle.sources`: lista de arquivos lidos, com timestamps
- `bundle.tokens_estimate`
- `bundle.truncated`: bool

## Dependências
- Packages: `@cao/memory`, `@cao/llm` (apenas para ranking/sumarização opcional), `@cao/core`.
- Integrations: nenhuma.

## Relação com outros agentes
- **Invocado por:** `orchestrator-master` (precondição para a maioria dos planos).
- **Coopera com:** `learning-memory-curation` (consome a memória que aquele higieniza).

## Upstream relacionado
- `basicmachines-co/basic-memory` (via `@cao/memory`).
- `adamtylerlynch/obsidian-agent-memory-skills` (inspiração de skills de seleção).

## Status
Stub. Sem implementação.
