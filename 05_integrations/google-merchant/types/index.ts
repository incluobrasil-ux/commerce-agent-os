// google-merchant/types/index.ts — tipos mapeados do domínio GMC.

import type { TenantId } from '@cao/shared-types';

export type { TenantId };

// ===== Branded IDs =====
export type GMCAccountId = string & { readonly __brand: 'GMCAccountId' };
// GMCProductId formato: "<channel>:<feedLabel>:<offerId>", ex.: "online:en:US:SKU-100"
export type GMCProductId = string & { readonly __brand: 'GMCProductId' };
export type GMCDatafeedId = string & { readonly __brand: 'GMCDatafeedId' };

// ===== Enums =====
export type GMCChannel = 'online' | 'local';
export type GMCDestination =
  | 'shopping_ads'
  | 'free_listings'
  | 'free_local_listings'
  | 'local_inventory_ads';
export type GMCApprovalStatus = 'approved' | 'disapproved' | 'pending' | 'expiring';
export type GMCSeverity = 'critical' | 'error' | 'warning';

// ===== Money — alinhado com shopify/types.Money para conversão direta =====
export interface Money {
  amount: string; // string para preservar precisão
  currencyCode: string; // ISO 4217
}

// ===== Recursos =====
export interface GMCProduct {
  id: GMCProductId;
  channel: GMCChannel;
  contentLanguage: string; // "en", "pt", etc.
  feedLabel: string; // ex.: "US", "BR"
  offerId: string; // SKU equivalent
  title: string;
  description: string;
  link: string; // URL da PDP
  imageLink: string;
  availability: 'in_stock' | 'out_of_stock' | 'preorder' | 'backorder';
  price: Money;
  brand: string | null;
  gtin: string | null;
  mpn: string | null;
  googleProductCategory: string | null;
  productTypes: string[];
  // muitos campos opcionais — modelar conforme uso real
}

export interface GMCDisapprovalReason {
  code: string; // ex.: "missing_value:gender"
  detail: string;
  severity: GMCSeverity;
  destination: GMCDestination;
  attribute: string | null;
  documentation: string | null; // URL para docs
}

export interface GMCProductStatus {
  productId: GMCProductId;
  destinationStatuses: Array<{
    destination: GMCDestination;
    status: GMCApprovalStatus;
  }>;
  issues: GMCDisapprovalReason[];
  lastUpdateDate: string; // ISO 8601
}

export interface GMCDatafeed {
  id: GMCDatafeedId;
  name: string;
  contentLanguage: string;
  feedLabel: string;
  targetCountry: string;
}
