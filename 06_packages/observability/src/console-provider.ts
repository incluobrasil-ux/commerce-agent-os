// Provider que escreve JSON em stdout/stderr. Default para dev e tests.

import type { LogContext, Logger, ObservabilityProvider } from './types.js';

function write(stream: NodeJS.WriteStream, payload: object): void {
  stream.write(`${JSON.stringify(payload)}\n`);
}

export class ConsoleProvider implements ObservabilityProvider {
  log: Logger = {
    info: (msg, ctx) => write(process.stdout, { level: 'info', msg, ...ctx }),
    warn: (msg, ctx) => write(process.stderr, { level: 'warn', msg, ...ctx }),
    error: (msg, ctx) => write(process.stderr, { level: 'error', msg, ...ctx }),
  };

  capture(event: string, properties: Record<string, unknown> = {}): void {
    write(process.stdout, { type: 'event', event, ...properties });
  }
}

// Provider silencioso (testes que não querem ruído).
export class SilentProvider implements ObservabilityProvider {
  public readonly events: Array<{ event: string; properties: Record<string, unknown> }> = [];
  public readonly logs: Array<{ level: string; msg: string; ctx?: LogContext | undefined }> = [];

  log: Logger = {
    info: (msg, ctx) => {
      this.logs.push({ level: 'info', msg, ctx });
    },
    warn: (msg, ctx) => {
      this.logs.push({ level: 'warn', msg, ctx });
    },
    error: (msg, ctx) => {
      this.logs.push({ level: 'error', msg, ctx });
    },
  };

  capture(event: string, properties: Record<string, unknown> = {}): void {
    this.events.push({ event, properties });
  }
}
