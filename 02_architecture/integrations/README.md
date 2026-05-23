# Integrations

Notas de arquitetura por **provedor externo** (não por repositório). Cada integração será implementada como adapter autoral em `05_integrations/<nome>/`.

## Índice

- [shopify](./shopify.md) — resumo executivo (apps + tema)
- [shopify-map](./shopify-map.md) — detalhe completo (scopes, webhooks, OAuth, surfaces)
- [google-merchant](./google-merchant.md) — resumo executivo (Merchant API + feed)
- [google-merchant-map](./google-merchant-map.md) — detalhe completo (recursos, polling, auth, fluxos, papel de cada upstream)
- [google-ads](./google-ads.md) — Google Ads + adios (postergado)
- [brightdata](./brightdata.md) — Bright Data (competitive intelligence)
- [posthog](./posthog.md) — resumo executivo (analytics + LLM observability)
- [posthog-map](./posthog-map.md) — detalhe completo (cloud/self-host, funil, taxonomia, attribution UTM, PII)
- [reviews-map](./reviews-map.md) — multi-provedor de reviews (Judge.me, Yotpo, Loox, Stamped, Okendo, Shopify nativo) + SEO/social proof
- [higgsfield](./higgsfield.md) — resumo executivo (skills + CLI)
- [higgsfield-map](./higgsfield-map.md) — detalhe completo (skills runtime vs CLI dev/ops, fluxos, política de cherry-pick)

Cada doc nesta pasta descreve **o quê / por que / superfície de API / risco / status**. Decisões arquiteturais detalhadas vão em `00_meta/decisions.md` (ADRs).
