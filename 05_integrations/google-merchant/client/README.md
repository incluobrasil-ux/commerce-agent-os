# google-merchant/client/

Client REST tipado para Merchant API.

## API prevista

```ts
import type { TenantId } from '@cao/shared-types';

export interface GMCClient {
  products: {
    insert(input: GMCProduct): Promise<GMCProduct>;
    update(id: GMCProductId, patch: Partial<GMCProduct>): Promise<GMCProduct>;
    delete(id: GMCProductId): Promise<void>;
    get(id: GMCProductId): Promise<GMCProduct>;
    list(opts: { pageSize: number; cursor?: string }): AsyncIterable<GMCProduct[]>;
  };
  productStatuses: {
    get(id: GMCProductId): Promise<GMCProductStatus>;
    list(opts: { destinations?: GMCDestination[]; pageSize: number; cursor?: string }): AsyncIterable<GMCProductStatus[]>;
  };
  accounts: {
    get(): Promise<GMCAccountInfo>;
  };
}

export function makeClient(tenant: TenantId): GMCClient;
```

## Garantias

- Auth automática (OAuth user flow ou service account conforme config).
- Retry exponencial em 429 / 5xx; falha em terminal vira `GMCRateLimitError` ou erro tipado.
- Cost guard: nenhum loop infinito; pagination com `pageSize` máximo aplicado.
- Telemetry: latência + cost + op em `@cao/observability`.

## Status

Stub. Implementação real na Fase 9.
