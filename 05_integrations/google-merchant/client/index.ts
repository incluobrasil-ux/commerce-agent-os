// google-merchant/client/index.ts — contratos do client.
// Implementação real na Fase 9.

import type {
  GMCAccountId,
  GMCDestination,
  GMCProduct,
  GMCProductId,
  GMCProductStatus,
  TenantId,
} from '../types/index.js';

export interface GMCAccountInfo {
  id: GMCAccountId;
  name: string;
  domainVerified: boolean;
}

export interface GMCClient {
  readonly products: {
    insert(input: GMCProduct): Promise<GMCProduct>;
    update(id: GMCProductId, patch: Partial<GMCProduct>): Promise<GMCProduct>;
    delete(id: GMCProductId): Promise<void>;
    get(id: GMCProductId): Promise<GMCProduct>;
    list(opts: { pageSize: number; cursor?: string }): AsyncIterable<GMCProduct[]>;
  };
  readonly productStatuses: {
    get(id: GMCProductId): Promise<GMCProductStatus>;
    list(opts: {
      destinations?: GMCDestination[];
      pageSize: number;
      cursor?: string;
    }): AsyncIterable<GMCProductStatus[]>;
  };
  readonly accounts: {
    get(): Promise<GMCAccountInfo>;
  };
}

export declare function makeClient(tenant: TenantId): GMCClient;
