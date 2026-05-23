# assets/

Arquivos servidos pela CDN do Shopify. Referenciados em Liquid via filtros:

```liquid
{{ 'theme.css'  | asset_url | stylesheet_tag }}
{{ 'theme.js'   | asset_url | script_tag }}
{{ 'logo.svg'   | asset_url | img_tag: 'Logo' }}
```

## Convenções

- Arquivos individuais; nada de build pipeline complexo aqui.
- Nome em kebab-case: `featured-product.css`, `cart-drawer.js`.
- CSS scoped por section sempre que possível (evita cascata acidental).
- JS em módulos vanilla / Web Components — sem framework grande no storefront.
- Imagens otimizadas antes do commit (sem pipeline automático).

## Não fazer aqui

- Não importar deps npm — storefront é zero-build.
- Não embutir tokens/keys.
- Não chamar nossos backends diretamente do storefront — use proxy via app extension se necessário.
