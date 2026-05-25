import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CompleteFn } from '@cao/llm';
import { Memory } from '@cao/memory';
import { SilentProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { learningMemoryCurationAgent } from './index.js';

let tmp = '';

beforeEach(async () => {
  tmp = await fs.mkdtemp(join(tmpdir(), 'curation-test-'));
});

afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

function fakeComplete(text: string): CompleteFn {
  return async () => ({
    text,
    model: 'fake-model',
    usage: { inputTokens: 100, outputTokens: 50 },
    costUsd: 0.0001,
    durationMs: 10,
  });
}

const validJson = JSON.stringify({
  proposals: [
    {
      slug: 'sample-finding',
      title: 'Sample stable finding',
      body: 'This finding has been observed consistently across multiple runs.',
      tags: ['stable', 'observed'],
      confidence: 0.85,
      rationale: 'Observed in three audit logs without contradiction.',
    },
  ],
  skipped: ['raw timestamp clutter (volatile)'],
  summary: 'Memory shows one stable pattern worth promoting; remainder is volatile metadata.',
});

describe('learningMemoryCurationAgent', () => {
  it('produz proposals válidos', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();

    const result = await runAgent(
      learningMemoryCurationAgent,
      {
        tenantId: '_t',
        auditExcerpt: 'a'.repeat(200),
        workingExcerpt: 'b'.repeat(50),
        existingFactSlugs: [],
      },
      { tenantId: '_t' },
      { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
    );

    expect(result.output.proposals).toHaveLength(1);
    expect(result.output.proposals[0]?.slug).toBe('sample-finding');
    expect(result.output.skipped).toHaveLength(1);
  });

  it('aceita JSON em ```json fences (parseOutput limpa)', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();

    const wrapped = `\`\`\`json\n${validJson}\n\`\`\``;
    const result = await runAgent(
      learningMemoryCurationAgent,
      {
        tenantId: '_t',
        auditExcerpt: 'a'.repeat(200),
        workingExcerpt: '',
        existingFactSlugs: [],
      },
      { tenantId: '_t' },
      { complete: fakeComplete(wrapped), memory, observability: new SilentProvider() },
    );
    expect(result.output.proposals).toHaveLength(1);
  });

  it('aceita output sem proposals (memória vazia ou só volátil)', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();

    const emptyJson = JSON.stringify({
      proposals: [],
      skipped: ['everything was volatile metadata'],
      summary: 'Nothing stable to promote; memory is still warming up.',
    });
    const result = await runAgent(
      learningMemoryCurationAgent,
      {
        tenantId: '_t',
        auditExcerpt: 'a'.repeat(200),
        workingExcerpt: '',
        existingFactSlugs: [],
      },
      { tenantId: '_t' },
      { complete: fakeComplete(emptyJson), memory, observability: new SilentProvider() },
    );
    expect(result.output.proposals).toHaveLength(0);
  });

  it('falha quando slug viola formato kebab-case', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();

    const badSlug = JSON.stringify({
      proposals: [
        {
          slug: 'BadSlug With Spaces',
          title: 'x',
          body: 'a'.repeat(40),
          tags: ['tag1'],
          confidence: 0.7,
          rationale: 'just a rationale long enough',
        },
      ],
      skipped: [],
      summary: 'memory shows stable patterns and some clutter we can ignore.',
    });

    await expect(
      runAgent(
        learningMemoryCurationAgent,
        {
          tenantId: '_t',
          auditExcerpt: 'a'.repeat(200),
          workingExcerpt: '',
          existingFactSlugs: [],
        },
        { tenantId: '_t' },
        { complete: fakeComplete(badSlug), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('falha quando auditExcerpt é muito curto (input schema)', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();

    await expect(
      runAgent(
        learningMemoryCurationAgent,
        { tenantId: '_t', auditExcerpt: 'short', workingExcerpt: '', existingFactSlugs: [] },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('aceita workingExcerpt vazio (string vazia)', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();

    const result = await runAgent(
      learningMemoryCurationAgent,
      { tenantId: '_t', auditExcerpt: 'a'.repeat(200), workingExcerpt: '', existingFactSlugs: [] },
      { tenantId: '_t' },
      { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
    );
    expect(result.output.proposals).toHaveLength(1);
  });
});
