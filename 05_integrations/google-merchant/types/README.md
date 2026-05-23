# google-merchant/types/

Tipos do domínio GMC mapeados para nosso domínio. Adapter não expõe payload bruto da API.

## Tipos centrais

- Branded IDs: `GMCAccountId`, `GMCProductId` (formato `online:<channel>:<feedLabel>:<offerId>`).
- Estruturas: `GMCProduct`, `GMCProductStatus`, `GMCDisapprovalReason`, `GMCDatafeed`.

## Convenção

- IDs branded sempre derivados via helper que valida formato.
- `Money` reusa o mesmo tipo do `05_integrations/shopify/types` (mesmo conceito; pode ser movido para `@cao/shared-types` futuramente).

## Status

Stub.
