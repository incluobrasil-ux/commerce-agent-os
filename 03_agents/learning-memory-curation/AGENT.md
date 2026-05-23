# learning-memory-curation

## Missão
Higieniza `07_memory/<tenant>/`. Consolida entradas redundantes, marca itens obsoletos, atualiza índices, promove insights recorrentes para "fatos estáveis". Evita que memória degrade em pilha desorganizada.

## Entradas
- `tenant_id`
- `window`: período a varrer (ex.: últimos 30 dias)
- `mode`: enum (`dry_run`, `apply`)
- `policy`: regras de consolidação (max age, dedup threshold)

## Saídas
- `actions`: lista de operações propostas/aplicadas (merge, demote, delete, promote)
- `before_after_diff`: snapshot resumido
- `index_updated`: bool

## Dependências
- Packages: `@cao/memory`, `@cao/llm` (para detectar duplicação semântica), `@cao/core`.
- Integrations: nenhuma.

## Relação com outros agentes
- **Invocado por:** `orchestrator-master` em job recorrente (ex.: semanal).
- **Coopera com:** `memory-context` (consome o resultado higienizado).

## Upstream relacionado
- `basicmachines-co/basic-memory` (via `@cao/memory`).

## Status
Stub. Sem implementação.
