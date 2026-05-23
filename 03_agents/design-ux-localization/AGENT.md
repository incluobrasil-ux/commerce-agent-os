# design-ux-localization

## Missão
Define UX de PDP (página de produto) e coleção: estrutura de seções, blocos de copy, mídia, microcopy de CTA. Aplica localização de copy, preço e formato por mercado.

## Entradas
- `tenant_id`
- `scope`: produto ou coleção
- `target_markets`: lista de `locale` + `currency` + `region`
- `brand_style_ref`: ponteiro para guia de marca em `07_memory/`

## Saídas
- `page_blueprint`: estrutura de seções e blocos (não código)
- `localized_copy`: por locale, microcopy de UI e CTA
- `media_brief`: brief para `creative-copy-assets` gerar visual

## Dependências
- Packages: `@cao/llm`, `@cao/skills`.
- Integrations: `05_integrations/shopify` (metafields, theme settings).

## Relação com outros agentes
- **Invocado por:** `orchestrator-master`.
- **Alimenta:** `creative-copy-assets` (briefs), `catalog-feed-ops` (publicação).

## Upstream relacionado
- `Shopify/dawn` (inspiração de padrões de tema).
- `affaan-m/ECC` (inspiração de domínio).

## Status
Stub. Sem implementação.
