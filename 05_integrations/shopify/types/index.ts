// shopify/types/index.ts — tipos mapeados do domínio Shopify.
// Type-time apenas; nenhum código runtime.

import type { TenantId } from '@cao/shared-types';

// Re-export para conveniência do consumidor
export type { TenantId };

// ===== Branded IDs (sempre derivados de GID `gid://shopify/<Resource>/<id>`) =====
export type ShopifyShopDomain = string & { readonly __brand: 'ShopifyShopDomain' }; // "acme.myshopify.com"
export type ShopifyProductId = string & { readonly __brand: 'ShopifyProductId' };
export type ShopifyVariantId = string & { readonly __brand: 'ShopifyVariantId' };
export type ShopifyCollectionId = string & { readonly __brand: 'ShopifyCollectionId' };
export type ShopifyOrderId = string & { readonly __brand: 'ShopifyOrderId' };
export type ShopifyCustomerId = string & { readonly __brand: 'ShopifyCustomerId' };
export type ShopifyInventoryItemId = string & { readonly __brand: 'ShopifyInventoryItemId' };
export type ShopifyLocationId = string & { readonly __brand: 'ShopifyLocationId' };
export type ShopifyThemeId = string & { readonly __brand: 'ShopifyThemeId' };

// ===== Money =====
export interface Money {
  amount: string; // string para preservar precisão (Shopify retorna string)
  currencyCode: string; // ISO 4217
}

// ===== Recursos =====
export interface ShopifyProduct {
  id: ShopifyProductId;
  handle: string;
  title: string;
  descriptionHtml: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
  vendor: string | null;
  productType: string | null;
  tags: string[];
  variants: ShopifyVariant[];
  updatedAt: string; // ISO 8601
}

export interface ShopifyVariant {
  id: ShopifyVariantId;
  sku: string | null;
  title: string;
  price: Money;
  compareAtPrice: Money | null;
  inventoryItemId: ShopifyInventoryItemId;
  availableForSale: boolean;
}

export interface ShopifyCollection {
  id: ShopifyCollectionId;
  handle: string;
  title: string;
  descriptionHtml: string;
  productCount: number;
  updatedAt: string;
}

export interface ShopifyOrder {
  id: ShopifyOrderId;
  name: string; // "#1001"
  totalPrice: Money;
  financialStatus: string;
  fulfillmentStatus: string | null;
  createdAt: string;
}

export interface ShopifyCustomer {
  id: ShopifyCustomerId;
  email: string | null; // PII — passa por scrub antes de uso fora do adapter
  firstName: string | null;
  lastName: string | null;
  numberOfOrders: number;
  totalSpent: Money;
}

export interface ShopifyInventoryLevel {
  inventoryItemId: ShopifyInventoryItemId;
  locationId: ShopifyLocationId;
  available: number;
}

export interface ShopifyTheme {
  id: ShopifyThemeId;
  name: string;
  role: 'MAIN' | 'UNPUBLISHED' | 'DEMO' | 'DEVELOPMENT';
}

// Helpers de construção/validação ficam em implementação real (Fase 8).
