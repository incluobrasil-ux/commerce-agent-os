import { describe, expect, it } from 'vitest';
import {
  BaseError,
  Err,
  FakeClock,
  FakeIdGenerator,
  NotFoundError,
  Ok,
  SystemClock,
  UuidGenerator,
  ValidationError,
  isErr,
  isOk,
  retry,
} from './index.js';

describe('errors', () => {
  it('BaseError carrega code, context, cause', () => {
    const root = new Error('root cause');
    const err = new BaseError('boom', 'TEST_ERR', { foo: 1 }, root);
    expect(err.code).toBe('TEST_ERR');
    expect(err.context).toEqual({ foo: 1 });
    expect(err.cause).toBe(root);
    expect(err.name).toBe('BaseError');
  });

  it('subclasses preservam name', () => {
    expect(new ValidationError('x').name).toBe('ValidationError');
    expect(new NotFoundError('sku', 'X').name).toBe('NotFoundError');
  });
});

describe('result', () => {
  it('Ok / Err discriminam corretamente', () => {
    const ok = Ok(42);
    const er = Err(new Error('bad'));
    expect(isOk(ok)).toBe(true);
    expect(isErr(er)).toBe(true);
    if (ok.ok) expect(ok.value).toBe(42);
    if (!er.ok) expect(er.error.message).toBe('bad');
  });
});

describe('clock', () => {
  it('SystemClock retorna instantes recentes', () => {
    const c = new SystemClock();
    const before = Date.now();
    const t = c.nowMs();
    expect(t).toBeGreaterThanOrEqual(before);
  });

  it('FakeClock controla tempo', async () => {
    const c = new FakeClock(1000);
    expect(c.nowMs()).toBe(1000);
    await c.sleep(500);
    expect(c.nowMs()).toBe(1500);
    c.advance(100);
    expect(c.nowMs()).toBe(1600);
  });
});

describe('id', () => {
  it('UuidGenerator produz strings únicas', () => {
    const g = new UuidGenerator();
    const a = g.next();
    const b = g.next();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('FakeIdGenerator é determinístico', () => {
    const g = new FakeIdGenerator('run');
    expect(g.next()).toBe('run-1');
    expect(g.next()).toBe('run-2');
  });
});

describe('retry', () => {
  it('retorna sucesso na primeira tentativa', async () => {
    const clock = new FakeClock();
    const result = await retry(() => Promise.resolve('ok'), { attempts: 3, baseMs: 10 }, clock);
    expect(result).toBe('ok');
  });

  it('tenta novamente até sucesso', async () => {
    const clock = new FakeClock();
    let calls = 0;
    const result = await retry(
      () => {
        calls += 1;
        if (calls < 3) return Promise.reject(new Error('fail'));
        return Promise.resolve('done');
      },
      { attempts: 5, baseMs: 1 },
      clock,
    );
    expect(result).toBe('done');
    expect(calls).toBe(3);
  });

  it('falha após esgotar tentativas', async () => {
    const clock = new FakeClock();
    await expect(
      retry(() => Promise.reject(new Error('always')), { attempts: 2, baseMs: 1 }, clock),
    ).rejects.toThrow('always');
  });
});
