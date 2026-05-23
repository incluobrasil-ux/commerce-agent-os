// review-apps/errors/index.ts — erros normalizados.

import type { ProviderName } from '../types/index.js';

export class ReviewsAuthError extends Error {
  readonly code = 'REVIEWS_AUTH' as const;
  constructor(
    public readonly provider: ProviderName,
    message: string,
    cause?: unknown,
  ) {
    super(`[${provider}] ${message}`, { cause });
    this.name = 'ReviewsAuthError';
  }
}

export class ReviewsRateLimitError extends Error {
  readonly code = 'REVIEWS_RATE_LIMIT' as const;
  constructor(
    public readonly provider: ProviderName,
    public readonly retryAfterMs: number,
    cause?: unknown,
  ) {
    super(`[${provider}] rate limited; retry in ${retryAfterMs}ms`, { cause });
    this.name = 'ReviewsRateLimitError';
  }
}

export class ReviewsResourceNotFound extends Error {
  readonly code = 'REVIEWS_NOT_FOUND' as const;
  constructor(
    public readonly provider: ProviderName,
    public readonly resource: string,
    public readonly id: string,
  ) {
    super(`[${provider}] ${resource} not found: ${id}`);
    this.name = 'ReviewsResourceNotFound';
  }
}

export class ReviewsProviderUnavailable extends Error {
  readonly code = 'REVIEWS_PROVIDER_UNAVAILABLE' as const;
  constructor(
    public readonly provider: ProviderName,
    message: string,
    cause?: unknown,
  ) {
    super(`[${provider}] unavailable: ${message}`, { cause });
    this.name = 'ReviewsProviderUnavailable';
  }
}

export class ReviewsWebhookSignatureError extends Error {
  readonly code = 'REVIEWS_WEBHOOK_SIGNATURE' as const;
  constructor(public readonly provider: ProviderName) {
    super(`[${provider}] webhook signature invalid`);
    this.name = 'ReviewsWebhookSignatureError';
  }
}

export class ReviewsReplyForbidden extends Error {
  readonly code = 'REVIEWS_REPLY_FORBIDDEN' as const;
  constructor(
    public readonly provider: ProviderName,
    public readonly reviewId: string,
    public readonly reason: string,
  ) {
    super(`[${provider}] cannot reply to ${reviewId}: ${reason}`);
    this.name = 'ReviewsReplyForbidden';
  }
}

export class ReviewsModerationConflict extends Error {
  readonly code = 'REVIEWS_MODERATION_CONFLICT' as const;
  constructor(
    public readonly provider: ProviderName,
    public readonly reviewId: string,
  ) {
    super(`[${provider}] review ${reviewId} moderated or deleted`);
    this.name = 'ReviewsModerationConflict';
  }
}
