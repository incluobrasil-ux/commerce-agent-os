# templates/

Templates por tipo de página. Preferir formato **JSON** (não `.liquid`) — facilita edição via Theme Editor.

## Formato JSON esperado

```json
{
  "sections": {
    "main": { "type": "product-main" }
  },
  "order": ["main"]
}
```

## Templates previstos

| Arquivo | Página |
|---|---|
| `index.json` | home |
| `product.json` | PDP padrão |
| `collection.json` | listagem de coleção |
| `cart.json` | carrinho |
| `search.json` | busca |
| `page.json` | página estática |
| `blog.json` | índice de blog |
| `article.json` | post de blog |
| `404.json` | not found |
| `customers/account.json` | conta logada |
| `customers/login.json` | login |
| `customers/register.json` | registro |

Suffix templates (ex.: `product.special.json`) só quando houver caso de uso real.

## Origem

Padrões em [Shopify/dawn](https://github.com/Shopify/dawn) (`01_upstreams/dawn/templates/`). Reescrever, não copiar.
