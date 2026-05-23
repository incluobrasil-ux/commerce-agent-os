# 05_integrations

Adapters autorais para serviços externos. Cada subpasta isola um provedor.

> **Status:** apenas contratos. Nenhuma implementação ainda.
>
> Mapa detalhado: [../02_architecture/integrations/integration-map.md](../02_architecture/integrations/integration-map.md).

## Convenção de adapter

```
05_integrations/<name>/
├─ client/    # cliente HTTP/GraphQL + autenticação
├─ types/     # tipos do provedor mapeados para domínio interno
├─ errors/    # erros normalizados (RateLimitError, AuthError, ...)
├─ webhooks/  # quando aplicável
└─ README.md
```

Nenhum adapter expõe SDK do provedor diretamente. Todo consumidor (agente/app) vê apenas tipos do nosso domínio.

## Adapters previstos

### shopify
- **Provedor:** Shopify Admin GraphQL + App Bridge + Webhooks.
- **Auth:** OAuth offline + session token.
- **Consumido por:** `shopify-admin-app`, `merchant-service`, `feed-service`, `review-service`, vários agentes.
- **Upstream:** `Shopify/shopify-app-template-react-router` (template) + `Shopify/dawn` (inspiração).

### google-merchant
- **Provedor:** Google Merchant API.
- **Auth:** OAuth2.
- **Consumido por:** `merchant-service`, `feed-service`.
- **Upstream:** `google/merchant-api-samples` (dependência); `feedgen` informa a camada de agente, não este adapter.

### google-ads (postergado)
- **Provedor:** Google Ads API.
- **Status:** stub — implementação após fases iniciais.
- **Upstream:** `adios` como inspiração de criativo (não do adapter em si).

### brightdata
- **Provedor:** Bright Data.
- **Auth:** API key.
- **Consumido por:** `market-intelligence`, `competitor-benchmark`.
- **Upstream:** `brightdata/competitive-intelligence`.
- **Atenção:** serviço pago; revisar custo e legais.

### posthog
- **Provedor:** PostHog (analytics + LLM observability).
- **Auth:** project key (client) + personal API key (server).
- **Consumido por:** todos os apps + `analytics-optimization`.
- **Upstream:** SDK oficial (`posthog-js`, `posthog-node`). **Não clonar** o monorepo do PostHog.

### higgsfield
- **Provedor:** Higgsfield (skills + CLI).
- **Auth:** a confirmar.
- **Consumido por:** `06_packages/skills`, `10_ops/higgsfield-cli`.
- **Upstream:** `higgsfield-ai/skills`, `higgsfield-ai/cli`.
- **Nota:** parte é dev/ops (CLI), parte é runtime (skills); manter coerência.

## Decisões em aberto

- Política comum de retry/backoff (em `06_packages/core` ou em cada adapter).
- Telemetria padrão por adapter (latência, erros) via `06_packages/observability`.
- Estratégia de webhook deduplication compartilhada.
