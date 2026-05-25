// Clock injetável — permite controlar tempo em testes.

export interface Clock {
  now(): Date;
  nowMs(): number;
  sleep(ms: number): Promise<void>;
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
  nowMs(): number {
    return Date.now();
  }
  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export class FakeClock implements Clock {
  private current: number;
  constructor(initialMs = 0) {
    this.current = initialMs;
  }
  now(): Date {
    return new Date(this.current);
  }
  nowMs(): number {
    return this.current;
  }
  sleep(ms: number): Promise<void> {
    this.current += ms;
    return Promise.resolve();
  }
  advance(ms: number): void {
    this.current += ms;
  }
}
