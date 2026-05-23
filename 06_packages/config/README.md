# @cao/config

Carregamento e validação de variáveis de ambiente; defaults por ambiente.

## API prevista
- `loadConfig<T>(schema)` — valida `process.env` contra schema (zod ou similar).
- Schemas por dependência externa (Shopify, Google, PostHog, ...).
- Suporte a múltiplos ambientes (dev, staging, prod).

## Convenções
- Nunca logar valores completos de secrets — máscara últimos 4 chars.
- Erro de config é fatal em boot — nunca silenciar.

## Consumido por
- Todos os apps em `04_apps/`.
- Todos os adapters em `05_integrations/`.

## Status
Stub.
