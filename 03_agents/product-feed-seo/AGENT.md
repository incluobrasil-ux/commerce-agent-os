# product-feed-seo

## Missão
Otimiza títulos, descrições e atributos de produto para feeds (Google Merchant Center) e SEO on-site. Não publica — gera a versão proposta que `catalog-feed-ops` aplica.

## Entradas
- `tenant_id`
- `scope`: SKUs/coleção/categoria
- `targets`: lista de canais (`google_mc`, `seo_pdp`, `seo_collection`)
- `policy`: limites de caractere, palavras proibidas, tom de marca

## Saídas
- `proposed_changes`: por SKU, diff dos campos
- `signals_used`: o que motivou cada mudança (search trend, competitor, feed_disapproval)
- `expected_lift`: estimativa de impacto (qualitativa quando sem baseline)

## Dependências
- Packages: `@cao/llm`, `@cao/skills`, `@cao/guardrails`.
- Integrations: `05_integrations/shopify` (leitura), `05_integrations/google-merchant` (leitura de relatórios de feed).

## Relação com outros agentes
- **Invocado por:** `orchestrator-master`, `catalog-feed-ops`.
- **Submete a:** `governance-risk-qa` + `merchant-compliance` antes de aplicar.

## Upstream relacionado
- `google-marketing-solutions/feedgen` (base operacional adaptada).

## Status
Stub. Sem implementação.
