# src/orchestration/

Tradução fina worker → invocação do `@cao/runtime` com agente `product-feed-seo`.

## Responsabilidade

- Construir contexto do agente (`tenant_id`, scope, targets, policy).
- Carregar `memory-context` bundle quando necessário.
- Invocar `orchestrator-master` com intent específica (`optimize_skus`, `remediate_disapproval`, `localize_skus`).
- Persistir audit_trail retornado.
- Retornar resultado para `merchant-service` via fila.

## Não fazer aqui

- Lógica de otimização — vive em `@cao/skills`.
- Validação de schema — feita no boundary (worker entry).

## Status

Stub.
