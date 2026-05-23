// posthog/errors/index.ts — erros normalizados.

export class PostHogConfigError extends Error {
  readonly code = 'POSTHOG_CONFIG' as const;
  constructor(message: string) {
    super(message);
    this.name = 'PostHogConfigError';
  }
}

export class PostHogTaxonomyError extends Error {
  readonly code = 'POSTHOG_TAXONOMY' as const;
  constructor(public readonly event: string, message: string) {
    super(`Event '${event}': ${message}`);
    this.name = 'PostHogTaxonomyError';
  }
}

export class PostHogPiiError extends Error {
  readonly code = 'POSTHOG_PII' as const;
  constructor(public readonly forbiddenKey: string) {
    super(`PII property '${forbiddenKey}' attempted to be captured (forbidden)`);
    this.name = 'PostHogPiiError';
  }
}

export class PostHogQueryError extends Error {
  readonly code = 'POSTHOG_QUERY' as const;
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'PostHogQueryError';
  }
}

export class PostHogQuotaExceeded extends Error {
  readonly code = 'POSTHOG_QUOTA' as const;
  constructor(message: string) {
    super(message);
    this.name = 'PostHogQuotaExceeded';
  }
}
