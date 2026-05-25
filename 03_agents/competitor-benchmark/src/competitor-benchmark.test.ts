import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CompleteFn } from '@cao/llm';
import { Memory } from '@cao/memory';
import { SilentProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  competitorBenchmarkAgent,
  renderSnapshot,
  snapshotPath,
  snapshotTimestamp,
} from './index.js';

let tmp = '';

beforeEach(async () => {
  tmp = await fs.mkdtemp(join(tmpdir(), 'competitor-bench-test-'));
});

afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

function fakeComplete(text: string): CompleteFn {
  return async () => ({
    text,
    model: 'fake',
    usage: { inputTokens: 200, outputTokens: 80 },
    costUsd: 0.0002,
    durationMs: 9,
  });
}

const baseInput = {
  tenantId: '_t',
  competitor: 'acme',
  sourceType: 'html' as const,
  sourceValue:
    '<html><body><h1>Acme Cotton Tee</h1><p>Premium organic cotton, GOTS certified. $34.</p></body></html>',
  benchmarkGoal: 'mapear posicionamento e price points',
  compareAgainst: [],
};

const validJson = JSON.stringify({
  positioningSummary:
    'Acme se posiciona como marca premium de cotton orgânico com certificação GOTS visível, preço $34, atacando segmento que prioriza certificação sobre preço.',
  pricingSignals: ['Preço único $34 sem desconto destacado'],
  messagingPatterns: ['Ênfase em "Premium organic cotton, GOTS certified"'],
  strengths: ['Certificação GOTS explícita no copy primário'],
  weaknesses: ['Sem prova social ou reviews visível na fonte fornecida'],
  watchouts: ['Acompanhar se Acme introduz tier de preço inferior'],
});

describe('competitorBenchmarkAgent', () => {
  it('produz snapshot estruturado', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const r = await runAgent(
      competitorBenchmarkAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
    );
    expect(r.output.positioningSummary).toContain('Acme');
    expect(r.output.pricingSignals.length).toBeGreaterThan(0);
    expect(r.output.strengths.length).toBeGreaterThan(0);
  });

  it('aceita JSON em ```json fences', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const wrapped = `\`\`\`json\n${validJson}\n\`\`\``;
    const r = await runAgent(
      competitorBenchmarkAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(wrapped), memory, observability: new SilentProvider() },
    );
    expect(r.output.positioningSummary).toContain('Acme');
  });

  it('aceita arrays vazios quando source é thin', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const thinJson = JSON.stringify({
      positioningSummary: 'Source insuficiente para inferir posicionamento detalhado.',
      pricingSignals: [],
      messagingPatterns: [],
      strengths: [],
      weaknesses: [],
      watchouts: ['Capturar mais fonte (homepage + PLP + PDP) antes de re-rodar'],
    });
    const r = await runAgent(
      competitorBenchmarkAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(thinJson), memory, observability: new SilentProvider() },
    );
    expect(r.output.pricingSignals).toHaveLength(0);
    expect(r.output.watchouts.length).toBeGreaterThan(0);
  });

  it('falha quando competitor não é kebab-case (input schema)', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        competitorBenchmarkAgent,
        { ...baseInput, competitor: 'Acme Corp' },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('falha quando sourceValue muito curto', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        competitorBenchmarkAgent,
        { ...baseInput, sourceValue: 'short' },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('snapshotPath inclui competitor + timestamp', () => {
    const ts = snapshotTimestamp(new Date('2026-05-25T12:00:00Z'));
    const p = snapshotPath('acme', ts);
    expect(p).toBe('competitor-benchmark/acme/20260525-120000.md');
  });

  it('renderSnapshot produz markdown legível com sections', () => {
    const md = renderSnapshot(baseInput, JSON.parse(validJson), {
      runId: 'run-x',
      model: 'fake',
      costUsd: 0.0002,
      generatedAt: '2026-05-25T12:00:00Z',
    });
    expect(md).toContain('# Competitor snapshot — acme');
    expect(md).toContain('## Positioning');
    expect(md).toContain('## Pricing signals');
    expect(md).toContain('Premium organic cotton');
  });
});
