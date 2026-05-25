// Logger e ObservabilityProvider — interfaces mínimas.

export interface LogContext {
  [key: string]: unknown;
}

export interface Logger {
  info(msg: string, ctx?: LogContext): void;
  warn(msg: string, ctx?: LogContext): void;
  error(msg: string, ctx?: LogContext): void;
}

export interface ObservabilityProvider {
  log: Logger;
  capture(event: string, properties?: Record<string, unknown>): void | Promise<void>;
}
