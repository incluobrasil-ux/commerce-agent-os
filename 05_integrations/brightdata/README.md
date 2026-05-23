# brightdata

Adapter para Bright Data (datasets, SERP, Web Unlocker, Scraping Browser).

## Superfície
- Dataset API
- SERP API
- Web Unlocker / Scraping Browser

## Estrutura
- `client/` — HTTP client + API key auth + retry/backoff.
- `types/` — `Dataset`, `SerpResult`, `ScrapeJob`.
- `errors/` — `BrightDataAuthError`, `BrightDataQuotaError`, `LegalBlocked`.
- `webhooks/` — callbacks de jobs assíncronos (quando aplicável).

## Auth
- `BRIGHTDATA_API_KEY`

## Consumido por
- Agentes: `market-intelligence`, `competitor-benchmark`

## Atenção
- **Serviço pago.** Telemetria de custo em toda chamada via `@cao/observability`.
- ToS dos sites-alvo: a lógica de checagem vive em `@cao/guardrails`, não aqui.

## Upstream
- `01_upstreams/brightdata-competitive-intelligence`.

## Status
Stub. Subdirs reservados.
