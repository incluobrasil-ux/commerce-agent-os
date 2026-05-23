# shopify/types/

Tipos do domínio Shopify **mapeados para o nosso domínio**. Não expõe o tipo bruto da Admin GraphQL — sempre intermediado.

## Por que mapear?

- Schemas Shopify evoluem (`product.descriptionHtml` vs `descriptionHtml`, IDs como `gid://shopify/Product/123` etc.). Mapear isola consumidores.
- Permite consolidar campos repetidos (price + currency em `Money`).
- Mantém tipos canônicos do projeto vivendo em `@cao/shared-types` — aqui só os "viewed-from-Shopify".

## Tipos previstos

- Branded IDs: `ShopifyProductId`, `ShopifyVariantId`, `ShopifyOrderId`, `ShopifyCustomerId`, `ShopifyShopDomain`.
- Estruturados: `ShopifyProduct`, `ShopifyVariant`, `ShopifyCollection`, `ShopifyOrder`, `ShopifyCustomer`, `ShopifyInventoryLevel`, `ShopifyMetafield`, `ShopifyTheme`.

## Convenção

```ts
// Sempre branded ID a partir de GID:
type ShopifyProductId = string & { __brand: 'ShopifyProductId' };

// Helper:
export const toShopifyProductId = (gid: string): ShopifyProductId => { /* validate prefix */ };
```

## Status

Stub. Apenas declarações vazias.
