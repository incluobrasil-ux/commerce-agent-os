# @cao/guardrails

Validação input/output, allow-list de ações destrutivas, audit log, redação de PII.

## API prevista
- `validateInput(schema, value)` / `validateOutput(schema, value)`.
- `enforceActionPolicy(action, policy)` — gate em ações destrutivas.
- `redactPII(text|object)` — scrub de PII conforme política.
- `policyLoad(ref)` — carrega regras de conformidade (GMC/Shopify/região).
- `secretScan(content)` — usado por `repo-auditor`.

## Garantia
- Enforced no nível de `@cao/runtime` — agente não consegue pular.

## Upstream
- `01_upstreams/agentshield` (base operacional).

## Consumido por
- `@cao/runtime`, agentes diretamente quando precisam de policy_load.

## Status
Stub.
