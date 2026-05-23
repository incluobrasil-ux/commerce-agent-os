import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeNoopComplete, tryMakeAnthropicComplete } from './noop-client.js';

describe('makeNoopComplete', () => {
  it('retorna canned response default', async () => {
    const fn = makeNoopComplete();
    const r = await fn({ user: 'qualquer prompt' });
    expect(r.model).toBe('noop');
    expect(r.costUsd).toBe(0);
    expect(r.durationMs).toBe(0);
    expect(r.usage).toEqual({ inputTokens: 0, outputTokens: 0 });
    expect(() => JSON.parse(r.text)).not.toThrow();
  });

  it('aceita cannedText custom', async () => {
    const fn = makeNoopComplete({ cannedText: '{"hello":"world"}' });
    const r = await fn({ user: 'x' });
    expect(JSON.parse(r.text)).toEqual({ hello: 'world' });
  });

  it('aceita cannedModel custom', async () => {
    const fn = makeNoopComplete({ cannedModel: 'fake-3.5' });
    const r = await fn({ user: 'x' });
    expect(r.model).toBe('fake-3.5');
  });

  it('ignora o input (sempre devolve canned)', async () => {
    const fn = makeNoopComplete({ cannedText: 'fixed' });
    const a = await fn({ user: 'prompt A' });
    const b = await fn({ user: 'prompt completamente diferente B' });
    expect(a.text).toBe('fixed');
    expect(b.text).toBe('fixed');
  });
});

describe('tryMakeAnthropicComplete', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('volta noop quando ANTHROPIC_API_KEY ausente', () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '');
    const r = tryMakeAnthropicComplete();
    expect(r.mode).toBe('noop');
    expect(r.reason).toMatch(/ANTHROPIC_API_KEY/);
    expect(typeof r.complete).toBe('function');
  });

  it('volta anthropic quando key presente no env', () => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'sk-ant-fake-for-test-only');
    const r = tryMakeAnthropicComplete();
    expect(r.mode).toBe('anthropic');
    expect(r.reason).toBeUndefined();
  });

  it('volta anthropic quando apiKey passada explicitamente (ignora env)', () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '');
    const r = tryMakeAnthropicComplete({ apiKey: 'sk-ant-explicit' });
    expect(r.mode).toBe('anthropic');
  });

  it('noop chamado funciona sem rede', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '');
    const r = tryMakeAnthropicComplete();
    const out = await r.complete({ user: 'qualquer' });
    expect(out.model).toBe('noop');
    expect(out.costUsd).toBe(0);
  });
});
