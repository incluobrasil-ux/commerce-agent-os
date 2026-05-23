// review-apps/types/index.ts — tipo Review normalizado.

import type { TenantId } from '@cao/shared-types';

export type { TenantId };

export type ProviderName = 'judge-me' | 'shopify-native' | 'yotpo' | 'loox' | 'stamped' | 'okendo';

// ReviewId formato: "<provider>:<external_id>", ex.: "judge-me:r-1077"
export type ReviewId = string & { readonly __brand: 'ReviewId' };
export type ProductRef = string & { readonly __brand: 'ProductRef' }; // refere SKU ou produto Shopify

export interface ReviewAuthor {
  // PII — scrub aplicado por @cao/guardrails antes de sair do adapter.
  displayName: string | null;
  email: string | null; // sempre null em outputs públicos
  verifiedPurchase: boolean | null;
}

export interface ReviewMedia {
  kind: 'image' | 'video';
  url: string;
  alt: string | null;
}

export interface ReviewResponse {
  body: string;
  postedAt: string; // ISO 8601
  postedBy: string; // "owner" | author identifier
}

export interface Review {
  id: ReviewId;
  provider: ProviderName;
  tenant: TenantId;
  productRef: ProductRef; // referência cruzada com Shopify ProductId
  rating: number; // 1.0–5.0
  title: string | null;
  body: string;
  language: string; // ISO 639-1
  author: ReviewAuthor;
  media: ReviewMedia[];
  createdAt: string; // ISO 8601 UTC
  updatedAt: string | null;
  response: ReviewResponse | null;
  // Campos derivados (preenchidos pelo serviço, não pelo provider):
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed';
}

// Interface única que todos os providers implementam.
export interface ReviewProvider {
  readonly name: ProviderName;

  // Iteração paginada de reviews novos desde um cursor.
  listReviews(opts: { sinceCursor?: string; pageSize?: number }): AsyncIterable<Review>;

  // Leitura pontual.
  getReview(id: ReviewId): Promise<Review>;

  // Publica resposta (se provider suporta).
  respondToReview(id: ReviewId, body: string): Promise<void>;

  // Verifica webhook (HMAC ou similar). Retorna true se autêntico.
  // Null se provider não suporta webhook.
  verifyWebhook?(headers: Record<string, string>, rawBody: string): Promise<boolean>;
}
