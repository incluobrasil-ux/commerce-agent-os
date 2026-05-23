// providers/judge-me/index.ts — stub.
// API docs: https://judge.me/api/docs
//
// Quando implementado (Fase 11):
// - HTTP client com Auth via API token por shop.
// - listReviews: GET /api/v1/reviews?shop_domain=... com paginação por page.
// - getReview: GET /api/v1/reviews/:id.
// - respondToReview: POST /api/v1/reviews/:id/replies (resposta pública do owner).
// - verifyWebhook: HMAC-SHA256 com webhook secret do shop.
// - normalize: payload Judge.me → tipo Review.

import type { TenantId } from '@cao/shared-types';
import type { ReviewProvider } from '../../types/index.js';

export declare function makeJudgeMeProvider(tenant: TenantId): ReviewProvider;
