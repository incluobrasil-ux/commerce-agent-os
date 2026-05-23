# Shopify

> **Detalhe completo:** [shopify-map.md](./shopify-map.md) — superfícies de API, scopes, webhooks, OAuth, multi-tenant, errors.
> Este doc é o resumo executivo.

## Escopo

App embedded no admin Shopify + customização/inspiração de tema.

## Repositórios cobertos

- `Shopify/shopify-app-template-react-router` — base do app embedded.
- `Shopify/dawn` — referência de tema (Liquid).

## Superfície externa

- **Shopify Admin GraphQL API** — produtos, coleções, pedidos, clientes, metafields.
- **App Bridge + Polaris** — UI dentro do admin.
- **Webhooks** — eventos de ciclo de vida (app/uninstalled, orders/create, etc.).
- **OAuth** — fluxo offline + scopes mínimos por feature.

## Localização autoral

- Tema: `04_apps/shopify-theme/` (scaffold Liquid)
- App embedded: `04_apps/shopify-admin-app/` (scaffold React Router + Polaris)
- Adapter de API: `05_integrations/shopify/`
- Helpers compartilhados: `06_packages/shopify-client/`

## Risco / limitação

- Exige Shopify Partners + Shopify CLI + túnel (cloudflared/ngrok) em dev.
- Scopes mudam — manter `04_apps/shopify-app/shopify.app.toml` versionado.
- Polaris é opinativo; aceitar antes de customizar UI.

## Status

Pendente: clone do template, criação de app de dev, definição de scopes.
