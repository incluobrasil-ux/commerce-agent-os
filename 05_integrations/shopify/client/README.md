# shopify/client/

Client tipado para Admin GraphQL + auth.

## API prevista

```ts
import type { TenantId } from '@cao/shared-types';

export interface ShopifyClient {
  query<T>(operation: string, vars?: Record<string, unknown>): Promise<T>;
  mutate<T>(operation: string, vars?: Record<string, unknown>): Promise<T>;
  paginate<T>(operation: string, vars?: Record<string, unknown>): AsyncIterable<T>;
}

export function makeClient(tenant: TenantId): ShopifyClient;
```

## Garantias

- `tenant` resolve para o access token correto via session storage; cross-tenant é impossível por construção.
- Cost guard automático (rate limit GraphQL); throttling vira `ShopifyRateLimitError`.
- `query`/`mutate` retornam tipos do nosso domínio (via `types/`), nunca raw GraphQL.
- Logging via `@cao/observability` (latência, custo, op name).

## Operações iniciais previstas

`client/operations/` (futuro):
- `products.list.ts`, `products.read.ts`, `products.update.ts`
- `collections.*`
- `orders.list.ts`, `orders.read.ts`
- `customers.list.ts`, `customers.read.ts`
- `inventory.read.ts`
- `themes.list.ts`, `themes.files.ts`

Cada operação exporta a query GraphQL pinada + parser de resposta + tipo de retorno.

## Status

Stub. Arquivos `.ts` reais virão na Fase 8 (Shopify connect).
