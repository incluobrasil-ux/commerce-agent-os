// google-merchant/errors/index.ts — erros normalizados.

export class GMCAuthError extends Error {
  readonly code = 'GMC_AUTH' as const;
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'GMCAuthError';
  }
}

export class GMCRateLimitError extends Error {
  readonly code = 'GMC_RATE_LIMIT' as const;
  constructor(
    message: string,
    public readonly retryAfterMs: number,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = 'GMCRateLimitError';
  }
}

export class GMCResourceNotFound extends Error {
  readonly code = 'GMC_NOT_FOUND' as const;
  constructor(
    public readonly resource: string,
    public readonly id: string,
  ) {
    super(`GMC ${resource} not found: ${id}`);
    this.name = 'GMCResourceNotFound';
  }
}

export class GMCValidationError extends Error {
  readonly code = 'GMC_VALIDATION' as const;
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'GMCValidationError';
  }
}

// Semântico: não é falha de API, mas leitura de status que vale tratar como erro upstream.
export class GMCDisapprovalError extends Error {
  readonly code = 'GMC_DISAPPROVED' as const;
  constructor(
    public readonly productId: string,
    public readonly reasons: string[],
  ) {
    super(`GMC product disapproved: ${productId} (${reasons.length} reasons)`);
    this.name = 'GMCDisapprovalError';
  }
}

export class GMCAccountNotClaimed extends Error {
  readonly code = 'GMC_ACCOUNT_NOT_CLAIMED' as const;
  constructor(public readonly accountId: string) {
    super(`GMC account domain not claimed: ${accountId}`);
    this.name = 'GMCAccountNotClaimed';
  }
}

export class GMCApiVersionMismatch extends Error {
  readonly code = 'GMC_API_VERSION' as const;
  constructor(
    public readonly expected: string,
    public readonly actual: string,
  ) {
    super(`GMC API version mismatch: expected ${expected}, got ${actual}`);
    this.name = 'GMCApiVersionMismatch';
  }
}
