// shopify/errors/index.ts — classes de erro normalizadas.
// Implementação inicial: classes próprias. Quando @cao/core expor BaseError,
// estender dele.

export class ShopifyAuthError extends Error {
  readonly code = 'SHOPIFY_AUTH' as const;
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'ShopifyAuthError';
  }
}

export class ShopifyRateLimitError extends Error {
  readonly code = 'SHOPIFY_RATE_LIMIT' as const;
  constructor(
    message: string,
    public readonly retryAfterMs: number,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = 'ShopifyRateLimitError';
  }
}

export class ShopifyGraphQLError extends Error {
  readonly code = 'SHOPIFY_GRAPHQL' as const;
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'ShopifyGraphQLError';
  }
}

export class ShopifyResourceNotFound extends Error {
  readonly code = 'SHOPIFY_NOT_FOUND' as const;
  constructor(
    public readonly resource: string,
    public readonly id: string,
  ) {
    super(`Shopify ${resource} not found: ${id}`);
    this.name = 'ShopifyResourceNotFound';
  }
}

export class ShopifyWebhookHmacError extends Error {
  readonly code = 'SHOPIFY_WEBHOOK_HMAC' as const;
  constructor() {
    super('Webhook HMAC verification failed');
    this.name = 'ShopifyWebhookHmacError';
  }
}

export class ShopifyWebhookDuplicateError extends Error {
  readonly code = 'SHOPIFY_WEBHOOK_DUPLICATE' as const;
  constructor(public readonly webhookId: string) {
    super(`Webhook already processed: ${webhookId}`);
    this.name = 'ShopifyWebhookDuplicateError';
  }
}

export class ShopifyApiVersionMismatch extends Error {
  readonly code = 'SHOPIFY_API_VERSION' as const;
  constructor(
    public readonly expected: string,
    public readonly actual: string,
  ) {
    super(`Shopify API version mismatch: expected ${expected}, got ${actual}`);
    this.name = 'ShopifyApiVersionMismatch';
  }
}
