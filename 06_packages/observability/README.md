# @cao/observability

PostHog init + tracing + convenções de eventos. Adapter fino que centraliza decisões de instrumentação.

## API prevista
- `initObservability({ tenant_id, env })` — boot do PostHog (server/web).
- `capture(event, props)` — sempre injeta `tenant_id` e `env`.
- `trace(spanName, fn)` — wrapping de operação.
- `auditLog(entry)` — append em audit trail (PostHog + `07_memory/<tenant>/audit/`).

## Convenções de naming
- `<surface>.<verb>` — ex.: `feed.proposed`, `campaign.launched`, `agent.invoked`.
- `agent.invoked` carrega `agent_name`, `ms`, `tokens`, `cost_usd`.

## Upstream
- SDK PostHog (`posthog-js` / `posthog-node`).

## Consumido por
- Apps em `04_apps/`.
- `@cao/runtime` (instrumentação automática).

## Status
Stub.
