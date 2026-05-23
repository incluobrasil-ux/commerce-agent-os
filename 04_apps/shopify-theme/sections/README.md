# sections/

Blocos Liquid reutilizáveis, **com `{% schema %}`** que aparece no Theme Editor.

## Convenções

- Nome do arquivo = nome da section em kebab-case: `featured-collection.liquid`.
- Cada arquivo termina com:
  ```liquid
  {% schema %}
  {
    "name": "...",
    "tag": "section",
    "settings": [],
    "blocks": [],
    "presets": [{ "name": "..." }]
  }
  {% endschema %}
  ```
- Settings tipados pelo schema do Shopify (`text`, `richtext`, `image_picker`, `color`, etc.).
- Sem JS inline em sections — usar `assets/<name>.js` referenciado via `{{ 'name.js' | asset_url | script_tag }}`.

## Sections previstas (não implementadas)

- `header.liquid`, `footer.liquid` — usadas no `theme.liquid`.
- `product-main.liquid` — corpo da PDP.
- `collection-list.liquid`, `collection-grid.liquid`.
- `featured-product.liquid`, `featured-collection.liquid`.
- `image-with-text.liquid`, `multicolumn.liquid` (genéricos).
- `cart-drawer.liquid` (renderizado via App Bridge ou direto).

## Origem

Padrões inspirados em [Shopify/dawn](https://github.com/Shopify/dawn) (referência conceitual em `01_upstreams/dawn/sections/`). Reescrever, não copiar.
