# src/orchestration/

Camada fina que traduz eventos (webhook, job, fila) em invocações ao `@cao/runtime` / `reviews-ops`.

## Responsabilidades

- Resolver `tenant_id` canônico a partir do contexto do provider.
- Carregar config de provider do tenant (qual provider, qual token).
- Invocar `orchestrator-master` com intent (`ingest_review`, `synthesize_voc`, `draft_response`, `publish_response`).
- Persistir `audit_trail`.

## Não fazer

- Lógica de extração / VoC — vive no agente / skills.
- Bypass do orchestrator — mesmo para 1 agente, sempre via.

## Status

Stub.
