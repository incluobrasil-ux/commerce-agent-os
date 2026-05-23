// Retry com backoff exponencial.

import type { Clock } from './clock.js';

export interface RetryOptions {
  attempts: number;
  baseMs: number;
  factor?: number;
  shouldRetry?: (err: unknown) => boolean;
}

export async function retry<T>(fn: () => Promise<T>, opts: RetryOptions, clock: Clock): Promise<T> {
  const { attempts, baseMs, factor = 2, shouldRetry = () => true } = opts;
  let lastErr: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i === attempts - 1 || !shouldRetry(err)) break;
      await clock.sleep(baseMs * factor ** i);
    }
  }
  throw lastErr;
}
