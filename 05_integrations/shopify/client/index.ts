// shopify/client/index.ts — contratos de tipo do client.
// Implementação real virá na Fase 8.

import type { TenantId, ShopifyProduct, ShopifyCollection, ShopifyOrder, ShopifyCustomer, ShopifyInventoryLevel } from '../types/index.js';

export interface ShopifyClient {
  // Operações declarativas — a implementação chama Admin GraphQL pinada.
  readonly products: {
    list(args: { first: number; cursor?: string; query?: string }): Promise<{ items: ShopifyProduct[]; nextCursor: string | null }>;
    read(args: { id: string }): Promise<ShopifyProduct>;
    update(args: { id: string; patch: Partial<ShopifyProduct> }): Promise<ShopifyProduct>;
  };
  readonly collections: {
    list(args: { first: number; cursor?: string }): Promise<{ items: ShopifyCollection[]; nextCursor: string | null }>;
    read(args: { id: string }): Promise<ShopifyCollection>;
  };
  readonly orders: {
    list(args: { first: number; cursor?: string; query?: string }): Promise<{ items: ShopifyOrder[]; nextCursor: string | null }>;
    read(args: { id: string }): Promise<ShopifyOrder>;
  };
  readonly customers: {
    list(args: { first: number; cursor?: string; query?: string }): Promise<{ items: ShopifyCustomer[]; nextCursor: string | null }>;
    read(args: { id: string }): Promise<ShopifyCustomer>;
  };
  readonly inventory: {
    read(args: { locationId: string; inventoryItemIds: string[] }): Promise<ShopifyInventoryLevel[]>;
  };
}

// Factory — implementação real cuida de auth, cost guard, observability.
export declare function makeClient(tenant: TenantId): ShopifyClient;
