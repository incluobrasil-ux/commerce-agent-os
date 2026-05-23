# Google Merchant

> **Detalhe completo:** [google-merchant-map.md](./google-merchant-map.md) — recursos, polling, auth, fluxos end-to-end, papel de cada upstream.
> Este doc é o resumo executivo.

## Escopo

Sincronização e otimização de feed de produtos com Google Merchant Center.

## Repositórios cobertos

- `google/merchant-api-samples` — exemplos canônicos da Merchant API.
- `google-marketing-solutions/feedgen` — geração/melhoria de feed com LLM.
- `google-marketing-solutions/feedx` — experimentação A/B em feeds.

## Superfície externa

- **Merchant API** (sucessora da Content API for Shopping) — produtos, ofertas, datafeeds, relatórios.
- **OAuth2** com conta Google Merchant Center.

## Localização autoral

- Adapter de API: `05_integrations/google-merchant/` (contratos TS prontos)
- Serviço operacional: `04_apps/merchant-service/` (scaffold pronto)
- Serviço cognitivo: `04_apps/feed-service/` (scaffold pronto)
- Agentes envolvidos: `product-feed-seo`, `catalog-feed-ops`, `merchant-compliance` (com `flows.md` operacional)

## Risco / limitação

- Migração Content API → Merchant API ainda em evolução no ecossistema.
- feedgen/feedx são Python; precisamos decidir: port para TS, bridge via subprocess, ou serviço separado.
- Schema do Merchant Center é rígido — validação obrigatória antes do push.

## Status

Pendente: confirmar quais sub-APIs estão GA; decidir runtime (TS vs Python).
