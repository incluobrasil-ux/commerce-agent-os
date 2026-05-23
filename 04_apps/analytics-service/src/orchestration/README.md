# src/orchestration/

Camada fina que traduz job → invocação de `@cao/runtime` / `analytics-optimization`.

## Responsabilidades

- Resolver `tenant_id` (iterar por tenants ativos quando job é cross-tenant).
- Carregar baseline anterior de `07_memory/<tenant>/working/analytics/`.
- Invocar `orchestrator-master` com intent (`diagnose_funnel`, `analyze_campaigns`, etc.).
- Persistir resultado em `07_memory/<tenant>/working/analytics/<job>-<timestamp>.md`.

## Não fazer

- Lógica analítica. Vive no agente.
- Mutação em PostHog.

## Status

Stub.
