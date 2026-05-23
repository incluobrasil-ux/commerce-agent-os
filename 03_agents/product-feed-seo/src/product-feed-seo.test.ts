import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CompleteFn } from '@cao/llm';
import { Memory } from '@cao/memory';
import { SilentProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { productFeedSEOAgent } from './index.js';

let tmp = '';
beforeEach(async () => {
  tmp = await fs.mkdtemp(join(tmpdir(), 'pfs-test-'));
});
afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

function fakeComplete(text: string): CompleteFn {
  return async () => ({
    text,
    model: 'fake',
    usage: { inputTokens: 50, outputTokens: 30 },
    costUsd: 0.0001,
    durationMs: 5,
  });
}

const validInput = {
  productHandle: 'sample',
  originalTitle: 'Cool Shirt',
  originalDescription: 'A shirt that is cool.',
  brand: 'Acme',
  productType: 'Apparel',
  maxTitleChars: 150,
  maxDescriptionChars: 5000,
};

const validJson = JSON.stringify({
  suggestedTitle: 'Acme Cool Shirt — Soft Cotton T-Shirt',
  suggestedDescription: 'Soft cotton t-shirt with classic fit, made by Acme.',
  rationale: 'Added brand prefix and material context to improve discoverability.',
  changedTitle: true,
  changedDescription: true,
  riskFlags: [],
});

describe('productFeedSEOAgent', () => {
  it('produz proposta válida', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const r = await runAgent(
      productFeedSEOAgent,
      validInput,
      { tenantId: '_t' },
      { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
    );
    expect(r.output.suggestedTitle).toContain('Acme');
    expect(r.output.changedTitle).toBe(true);
  });

  it('aceita JSON em fences', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const r = await runAgent(
      productFeedSEOAgent,
      validInput,
      { tenantId: '_t' },
      {
        complete: fakeComplete(`\`\`\`json\n${validJson}\n\`\`\``),
        memory,
        observability: new SilentProvider(),
      },
    );
    expect(r.output.suggestedTitle).toContain('Acme');
  });

  it('aceita output sem mudanças (idempotente)', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const noChange = JSON.stringify({
      suggestedTitle: 'Cool Shirt',
      suggestedDescription: 'A shirt that is cool.',
      rationale: 'Title already strong; no changes recommended.',
      changedTitle: false,
      changedDescription: false,
      riskFlags: ['title is generic but not invalid'],
    });
    const r = await runAgent(
      productFeedSEOAgent,
      validInput,
      { tenantId: '_t' },
      { complete: fakeComplete(noChange), memory, observability: new SilentProvider() },
    );
    expect(r.output.changedTitle).toBe(false);
    expect(r.output.riskFlags).toHaveLength(1);
  });

  it('falha com rationale curto', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const bad = JSON.stringify({
      suggestedTitle: 'x',
      suggestedDescription: 'y',
      rationale: 'short',
      changedTitle: false,
      changedDescription: false,
      riskFlags: [],
    });
    await expect(
      runAgent(
        productFeedSEOAgent,
        validInput,
        { tenantId: '_t' },
        { complete: fakeComplete(bad), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('falha com originalTitle vazio (input schema)', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        productFeedSEOAgent,
        { ...validInput, originalTitle: '' },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });
});
