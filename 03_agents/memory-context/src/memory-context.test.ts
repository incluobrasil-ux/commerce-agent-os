import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CompleteFn } from '@cao/llm';
import { Memory } from '@cao/memory';
import { SilentProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { memoryContextAgent } from './index.js';

let tmp = '';

beforeEach(async () => {
  tmp = await fs.mkdtemp(join(tmpdir(), 'memctx-test-'));
});

afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

function fakeComplete(text: string): CompleteFn {
  return async () => ({
    text,
    model: 'fake',
    usage: { inputTokens: 80, outputTokens: 40 },
    costUsd: 0.0001,
    durationMs: 10,
  });
}

const validJson = JSON.stringify({
  brandVoice: 'Casual, direct, no jargon.',
  hardConstraints: ['Never claim medical efficacy', 'Use approved GTIN'],
  recentSignals: ['New Q2 SKU launch', '3 disapprovals last week'],
  knownGaps: ['Color palette undocumented'],
  recommendation: 'Proceed with title rewrite but flag disapproval pattern for review.',
  confidence: 0.7,
});

const baseInput = {
  tenantId: '_t',
  taskScope: 'Rewrite product titles for Q2 catalog optimization',
  factsExcerpt: 'fact 1\nfact 2',
  workingExcerpt: 'recent note',
  auditExcerpt: '2026-05-23 some run',
};

describe('memoryContextAgent', () => {
  it('produz brief válido com todos os campos', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();

    const result = await runAgent(
      memoryContextAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
    );

    expect(result.output.brandVoice).toContain('Casual');
    expect(result.output.hardConstraints).toHaveLength(2);
    expect(result.output.confidence).toBe(0.7);
  });

  it('aceita arrays vazios quando memória é fina', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();

    const thinJson = JSON.stringify({
      brandVoice: '',
      hardConstraints: [],
      recentSignals: [],
      knownGaps: ['Brand voice not yet documented', 'No working memory'],
      recommendation: 'Memory is too thin; collect more data before acting.',
      confidence: 0.2,
    });

    const result = await runAgent(
      memoryContextAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(thinJson), memory, observability: new SilentProvider() },
    );

    expect(result.output.hardConstraints).toHaveLength(0);
    expect(result.output.confidence).toBeLessThan(0.5);
  });

  it('aceita JSON em ```json fences', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();

    const wrapped = `\`\`\`json\n${validJson}\n\`\`\``;
    const result = await runAgent(
      memoryContextAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(wrapped), memory, observability: new SilentProvider() },
    );
    expect(result.output.brandVoice).toBeTruthy();
  });

  it('falha quando confidence está fora do intervalo', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();

    const badConf = JSON.stringify({
      ...JSON.parse(validJson),
      confidence: 1.5,
    });

    await expect(
      runAgent(
        memoryContextAgent,
        baseInput,
        { tenantId: '_t' },
        { complete: fakeComplete(badConf), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('falha quando taskScope é muito curto', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();

    await expect(
      runAgent(
        memoryContextAgent,
        { ...baseInput, taskScope: 'hi' },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('falha quando recommendation está vazia (min 10 chars)', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();

    const noRec = JSON.stringify({
      ...JSON.parse(validJson),
      recommendation: 'short',
    });

    await expect(
      runAgent(
        memoryContextAgent,
        baseInput,
        { tenantId: '_t' },
        { complete: fakeComplete(noRec), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });
});
