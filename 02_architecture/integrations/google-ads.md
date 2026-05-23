# Google Ads (postergado)

## Escopo

Integração com Google Ads e geração de criativos para ads.

## Repositórios cobertos

- `google-marketing-solutions/adios` — imagens/criativos para Ads.

## Superfície externa

- **Google Ads API** — campanhas, grupos de anúncios, assets.
- **OAuth2** + Ads developer token.

## Localização autoral

- Adapter (futuro): `05_integrations/google-ads/`

## Risco / limitação

- Ads API tem developer token approval; ciclo de aprovação não trivial.
- Sobreposição parcial com `agency-ai-solutions/ad-factory-agent` para criativos — definir limites.

## Status

**Postergado.** Reavaliar após Merchant Center e Shopify estarem estáveis.
