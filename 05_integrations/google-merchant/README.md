# google-merchant

Adapter autoral para a **Google Merchant API** (sucessora da Content API for Shopping).

> **Sem webhooks.** GMC não emite webhooks — usamos polling. Detalhe em `02_architecture/integrations/google-merchant-map.md`.

## Superfície coberta

- Products (`products.insert`, `products.update`, `products.delete`, `products.list`)
- ProductStatuses (`productstatuses.get`, `productstatuses.list`) — fonte de disapprovals
- Datafeeds (gestão de feeds nomeados — opcional, preferimos `products.insert` direto)
- Accounts (`accounts.get` — verificação de claim de domínio etc.)
- Reports (queries de performance — opcional, depende do tier)

## Estrutura

```
google-merchant/
├─ client/         REST client + OAuth2 + retry + cost guard
├─ types/          tipos do domínio GMC mapeados para nosso domínio
├─ errors/         classes de erro normalizadas
├─ resources.yaml  catálogo declarativo de recursos suportados
├─ report-types.yaml  catálogo declarativo de relatórios
├─ index.ts        barrel
├─ package.json
└─ tsconfig.json
```

## Auth

- `GOOGLE_OAUTH_CLIENT_ID` + `GOOGLE_OAUTH_CLIENT_SECRET` (OAuth user flow), **ou**
- `GOOGLE_APPLICATION_CREDENTIALS` (service account JSON) — recomendado para server-to-server.
- `GOOGLE_MERCHANT_ACCOUNT_ID` (ID do merchant center).

Decisão de service account vs user flow registrada em ADR futuro.

## Consumido por

- `04_apps/merchant-service` — operacional (writes + status polling).
- `04_apps/feed-service` — leitura de `productstatuses` para `product-feed-seo` reagir.
- Agentes: `product-feed-seo`, `catalog-feed-ops`, `merchant-compliance`.

## Upstream

- **`01_upstreams/merchant-api-samples`** (dependência): referência canônica para endpoints, autenticação, retry. Não fork — espelho das ideias.
- **`01_upstreams/feedgen`** informa `feed-service`/`product-feed-seo` (lógica cognitiva), não este adapter.

## Status

Stub. Contratos TS em `client/`, `types/`, `errors/`. Sem implementação.
