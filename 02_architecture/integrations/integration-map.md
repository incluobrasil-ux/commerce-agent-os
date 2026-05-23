# Integration map

Mapeamento de **adapters internos × provedores externos × superfície de API × consumidores**.

## Tabela mestra

| Adapter (`05_integrations/`) | Provedor | Superfície | Auth | Consumido por |
|---|---|---|---|---|
| `shopify` | Shopify Admin | GraphQL Admin API, App Bridge, Webhooks | OAuth offline + session tokens | `04_apps/shopify-admin-app`, `03_agents/product-offer`, `catalog-feed-ops` |
| `google-merchant` | Google Merchant Center | Merchant API (REST) | OAuth2 (Google account) | `04_apps/merchant-service`, `feed-service`, `03_agents/product-feed-seo`, `merchant-compliance` |
| `google-ads` ⏸ | Google Ads | Google Ads API | OAuth2 + developer token | (futuro) `traffic-campaigns` |
| `brightdata` | Bright Data | Dataset/SERP/Web Unlocker | API key | `03_agents/market-intelligence`, `competitor-benchmark` |
| `posthog` | PostHog | posthog-js / posthog-node | Project key | todos os apps; `03_agents/analytics-optimization` |
| `higgsfield` | Higgsfield | Skills + CLI | A confirmar | `06_packages/skills`, `10_ops/higgsfield-cli` |
| `llm` (interno) | OpenAI/Anthropic/Gemini | SDKs oficiais | API keys | encapsulado em `06_packages/llm`, consumido por agentes |

⏸ = postergado.

## Fluxo de chamadas (típico)

```
[shopify-admin-app] ──┐
                      ├─→ [orchestrator-master] ──→ [domain agent]
[webhook Shopify]  ───┘                                 │
                                                        ├─→ packages/llm
                                                        ├─→ packages/memory
                                                        ├─→ packages/skills
                                                        └─→ integrations/<provedor>
                                                                  │
                                                                  └─→ provedor externo
```

## Convenções de adapter

Cada pasta `05_integrations/<nome>/` deve expor:
- `client/` — autenticação + cliente HTTP/GraphQL.
- `types/` — tipos do provedor mapeados para tipos do nosso domínio.
- `errors/` — erros normalizados (`RateLimitError`, `AuthError`, etc.).
- `webhooks/` — quando aplicável.
- `README.md` — superfície e exemplos.

Nenhum adapter expõe SDK do provedor diretamente — sempre via tipos próprios. Isso isola breaking changes upstream.

## Secrets e chaves

Toda credencial vive em variáveis de ambiente carregadas por `06_packages/config`. Nunca commitar `.env`. Convenção:
- `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_SCOPES`
- `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_MERCHANT_ACCOUNT_ID`
- `BRIGHTDATA_API_KEY`
- `POSTHOG_API_KEY`, `POSTHOG_HOST`
- `HIGGSFIELD_API_KEY` (a confirmar)
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`

Detalhe completo em `../security-model/security-overview.md`.

## Origem (referência aos upstreams)

| Adapter | Upstream(s) referenciado(s) | Tipo |
|---|---|---|
| shopify | `shopify-app-template-react-router`, `dawn` | dependência (template) + inspiração (tema) |
| google-merchant | `merchant-api-samples`, `feedgen`, `feedx` | dependência (samples) + adaptação (feedgen) + inspiração (feedx) |
| google-ads | `adios` | inspiração (futuro) |
| brightdata | `brightdata/competitive-intelligence` | dependência |
| posthog | `PostHog/posthog` | **apenas SDK** — não clonar o monorepo |
| higgsfield | `higgsfield-ai/skills`, `higgsfield-ai/cli` | dependência |
| llm | — | n/a (SDKs oficiais) |

## Decisões em aberto

- Definir SDK do provedor (oficial vs cliente próprio fino) caso a caso.
- Política de retry/backoff comum — provavelmente em `06_packages/core`.
- Tratamento de webhooks idempotente (deduplicação por `X-Shopify-Webhook-Id` etc.).
