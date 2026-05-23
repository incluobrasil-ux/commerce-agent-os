# src/orchestration/

Camada fina que traduz eventos (webhook, job) em chamadas ao `@cao/runtime` / `orchestrator-master`.

## Responsabilidades

- Resolver `tenant_id` canônico a partir do `shop` Shopify.
- Carregar `policy` por tenant (limites de custo, ações destrutivas permitidas).
- Invocar o orchestrator com a intent correta.
- Persistir o `audit_trail` retornado.

## O que NÃO fazer aqui

- Implementar lógica do agente — agentes têm seu próprio runtime.
- Bypass do orchestrator. Mesmo para 1 agente, sempre via orchestrator (para consistência de audit + budget guard).

## Status

Stub.
