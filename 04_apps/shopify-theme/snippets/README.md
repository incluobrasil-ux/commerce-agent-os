# snippets/

Partials Liquid **sem schema** — incluídos via `{% render 'name', arg: value %}`.

## Convenções

- Sempre testar inputs com filtros: `{{ arg | default: '' }}`.
- Snippets devem ser puros: dado input igual → output igual.
- Não usar `{% include %}` (deprecated) — sempre `{% render %}`.

## Snippets previstos

- `price.liquid` — formatação de preço com locale/currency.
- `product-card.liquid` — card de produto para grids/coleções.
- `icon.liquid` — wrapper de ícones SVG.
- `meta-tags.liquid` — meta open-graph, twitter, etc.

## Origem

Padrões inspirados em [Shopify/dawn](https://github.com/Shopify/dawn) (`01_upstreams/dawn/snippets/`). Reescrever, não copiar.
