// providers/shopify-native/index.ts — stub.
// Shopify Product Reviews (legacy app).
//
// Quando implementado (Fase 11):
// - Reusa client de @cao/integration-shopify (mesmo Admin API).
// - Reviews vivem em metafields do produto (namespace `spr`, key `reviews`).
// - Sem webhook → polling.
// - Sem reply API formal — workaround: append em metafield (limitado).

import type { TenantId } from '@cao/shared-types';
import type { ReviewProvider } from '../../types/index.js';

export declare function makeShopifyNativeProvider(tenant: TenantId): ReviewProvider;
