// Geração de identificadores únicos.

import { randomUUID } from 'node:crypto';

export interface IdGenerator {
  next(): string;
}

export class UuidGenerator implements IdGenerator {
  next(): string {
    return randomUUID();
  }
}

// Gerador determinístico para testes.
export class FakeIdGenerator implements IdGenerator {
  private counter = 0;
  constructor(private readonly prefix: string = 'test') {}
  next(): string {
    this.counter += 1;
    return `${this.prefix}-${this.counter}`;
  }
}
