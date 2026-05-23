import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CompleteFn } from '@cao/llm';
import { Memory } from '@cao/memory';
import { SilentProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { auditSynthesizerAgent } from './index.js';

let tmp = '';

beforeEach(async () => {
  tmp = await fs.mkdtemp(join(tmpdir(), 'audit-synth-test-'));
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
  summary: [
    'License is MIT — safe to reference.',
    'TypeScript primary; tests present.',
    'No secrets in tree; .gitignore covers env files.',
  ],
  riskLevel: 'low',
  oneLiner: 'Safe to reference as upstream; MIT licensed and clean structure.',
});

describe('auditSynthesizerAgent', () => {
  it('produz síntese válida quando LLM retorna JSON correto', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_test' });
    await memory.ensureBaseDir();

    const result = await runAgent(
      auditSynthesizerAgent,
      {
        repoName: 'sample-repo',
        auditMarkdown:
          '# Audit — sample-repo\n\nLicense MIT detected. 100 files. No findings. Lorem ipsum body.',
      },
      { tenantId: '_test' },
      { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
    );

    expect(result.output.riskLevel).toBe('low');
    expect(result.output.summary).toHaveLength(3);
    expect(result.output.oneLiner).toMatch(/MIT/);
  });

  it('aceita JSON envelopado em ```json fences (parseOutput limpa)', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_test' });
    await memory.ensureBaseDir();

    const wrapped = `\`\`\`json\n${validJson}\n\`\`\``;
    const result = await runAgent(
      auditSynthesizerAgent,
      {
        repoName: 'sample-repo',
        auditMarkdown:
          '# Audit — sample-repo\n\nLicense MIT detected. 100 files. No findings. Lorem ipsum body.',
      },
      { tenantId: '_test' },
      { complete: fakeComplete(wrapped), memory, observability: new SilentProvider() },
    );
    expect(result.output.riskLevel).toBe('low');
  });

  it('falha quando LLM retorna JSON inválido', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_test' });
    await memory.ensureBaseDir();

    await expect(
      runAgent(
        auditSynthesizerAgent,
        {
          repoName: 'x',
          auditMarkdown: 'a'.repeat(60),
        },
        { tenantId: '_test' },
        { complete: fakeComplete('not json at all'), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow();
  });

  it('falha validação de output quando riskLevel é inválido', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_test' });
    await memory.ensureBaseDir();

    const invalidRisk = JSON.stringify({
      summary: ['a bullet long enough', 'another bullet', 'third bullet here'],
      riskLevel: 'extreme',
      oneLiner: 'This is a one liner with enough characters.',
    });

    await expect(
      runAgent(
        auditSynthesizerAgent,
        {
          repoName: 'x',
          auditMarkdown: 'a'.repeat(60),
        },
        { tenantId: '_test' },
        { complete: fakeComplete(invalidRisk), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('falha validação de input quando auditMarkdown muito curto', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_test' });
    await memory.ensureBaseDir();

    await expect(
      runAgent(
        auditSynthesizerAgent,
        { repoName: 'x', auditMarkdown: 'short' },
        { tenantId: '_test' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });
});
