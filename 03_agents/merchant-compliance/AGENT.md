# merchant-compliance

## Missão
Garante conformidade de produtos/feed com políticas de Shopify e Google Merchant Center (categorias proibidas, atributos obrigatórios, claims regulados, GTIN, etc.). Atua tanto pré-publicação (preventivo) quanto pós-disapproval (corretivo).

## Entradas
- `tenant_id`
- `scope`: SKUs ou feed snapshot
- `policies`: lista (`gmc`, `shopify`, `region:US`, `region:EU`)
- `mode`: enum (`audit`, `remediate`)

## Saídas
- `findings`: violações por SKU com regra, severidade, evidência
- `remediations`: ações sugeridas (ou aplicadas em `mode=remediate`)
- `compliance_summary`: % de SKUs aprovados, por política

## Dependências
- Packages: `@cao/guardrails`, `@cao/skills`.
- Integrations: `05_integrations/google-merchant` (relatórios), `shopify`.

## Relação com outros agentes
- **Invocado por:** `orchestrator-master`, `catalog-feed-ops` (em pós-apply).
- **Coopera com:** `product-feed-seo` (sugere correções alinhadas com SEO).

## Upstream relacionado
- `google/merchant-api-samples` (políticas e schemas).

## Status
Stub. Sem implementação.
