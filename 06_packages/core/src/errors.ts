// Base de erros tipados para todo o projeto.
// Subclasses devem definir `code` como string literal.

export class BaseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = new.target.name;
  }
}

export class ValidationError extends BaseError {
  constructor(message: string, context?: Record<string, unknown>, cause?: unknown) {
    super(message, 'VALIDATION', context, cause);
  }
}

export class NotFoundError extends BaseError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, 'NOT_FOUND', { resource, id });
  }
}

export class PolicyViolationError extends BaseError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'POLICY_VIOLATION', context);
  }
}
