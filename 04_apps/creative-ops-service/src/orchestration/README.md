# src/orchestration/

Camada fina que traduz fila/evento em invocação do `@cao/runtime` / `creative-copy-assets`.

## Responsabilidades

- Resolver `tenant_id` do payload.
- Carregar policy de brand + budget do tenant.
- Invocar `orchestrator-master` com intent (`generate_creative_batch`, `revise_creative`).
- Persistir audit_trail.

## Não fazer

- Lógica de geração — vive no agente.
- Bypass do orchestrator.

## Status

Stub.
