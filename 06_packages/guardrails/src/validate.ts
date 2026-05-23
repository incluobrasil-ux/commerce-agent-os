// Validação schema-driven via zod.

import { ValidationError } from '@cao/core';
import type { ZodError, ZodType } from 'zod';

export function validate<T>(schema: ZodType<T>, data: unknown, label?: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(`Validation failed${label ? ` (${label})` : ''}`, {
      issues: formatIssues(result.error),
    });
  }
  return result.data;
}

function formatIssues(err: ZodError): Array<{ path: string; message: string }> {
  return err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
}
