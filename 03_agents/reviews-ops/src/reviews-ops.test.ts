import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CompleteFn } from '@cao/llm';
import { Memory } from '@cao/memory';
import { SilentProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderVoc, reviewsOpsAgent, vocPath, vocTimestamp } from './index.js';

let tmp = '';

beforeEach(async () => {
  tmp = await fs.mkdtemp(join(tmpdir(), 'reviews-ops-test-'));
});

afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

function fakeComplete(text: string): CompleteFn {
  return async () => ({
    text,
    model: 'fake',
    usage: { inputTokens: 250, outputTokens: 120 },
    costUsd: 0.0003,
    durationMs: 11,
  });
}

const baseInput = {
  tenantId: '_t',
  reviews: [
    {
      rating: 5,
      text: 'Camiseta muito confortável, tecido macio.',
      source: 'Judge.me',
      date: '2026-04-10',
    },
    {
      rating: 2,
      text: 'Encolheu na primeira lavagem, muita decepção.',
      source: 'Judge.me',
      date: '2026-04-12',
    },
    {
      rating: 4,
      text: 'Boa qualidade, mas o tamanho M veio um pouco menor.',
      source: 'Shopify',
      date: '2026-04-15',
    },
    {
      rating: 5,
      text: 'Adorei o caimento e a estampa, super recomendo!',
      source: 'Judge.me',
      date: '2026-04-20',
    },
  ],
  productName: 'Camiseta-Acme-Orgânica',
  locale: 'pt-BR',
  analysisGoal: 'extrair voice-of-customer para reposicionar copy',
};

const validJson = JSON.stringify({
  sampleSize: 4,
  averageRating: 4.0,
  topThemes: ['conforto do tecido', 'questões de tamanho/encolhimento'],
  painPoints: ['encolhimento após primeira lavagem', 'tamanho M menor do que esperado'],
  desiredOutcomes: ['camiseta que mantém tamanho após lavagem', 'tabela de medidas mais precisa'],
  quoteCandidates: ['Camiseta muito confortável, tecido macio', 'Adorei o caimento e a estampa'],
  actionIdeas: [
    'Adicionar instrução de lavagem destacada no PDP',
    'Revisar grade de tamanhos e publicar tabela de medidas precisa',
  ],
  riskFlags: ['risco de devolução por encolhimento — pode afetar margem'],
});

describe('reviewsOpsAgent', () => {
  it('extrai VoC com temas e pain points', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const r = await runAgent(
      reviewsOpsAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
    );
    expect(r.output.sampleSize).toBe(4);
    expect(r.output.averageRating).toBe(4.0);
    expect(r.output.topThemes.length).toBeGreaterThan(0);
    expect(r.output.painPoints.length).toBeGreaterThan(0);
    expect(r.output.riskFlags.length).toBeGreaterThan(0);
  });

  it('aceita JSON em ```json fences', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const wrapped = `\`\`\`json\n${validJson}\n\`\`\``;
    const r = await runAgent(
      reviewsOpsAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(wrapped), memory, observability: new SilentProvider() },
    );
    expect(r.output.sampleSize).toBe(4);
  });

  it('aceita arrays vazios quando sample muito uniforme', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const thin = JSON.stringify({
      sampleSize: 2,
      averageRating: 5,
      topThemes: [],
      painPoints: [],
      desiredOutcomes: [],
      quoteCandidates: ['Bom produto'],
      actionIdeas: ['Coletar mais reviews antes de re-rodar.'],
      riskFlags: [],
    });
    const r = await runAgent(
      reviewsOpsAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(thin), memory, observability: new SilentProvider() },
    );
    expect(r.output.topThemes).toHaveLength(0);
    expect(r.output.actionIdeas.length).toBeGreaterThan(0);
  });

  it('falha quando reviews tem menos de 2 itens', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        reviewsOpsAgent,
        { ...baseInput, reviews: [{ rating: 5, text: 'só uma', source: '', date: '' }] },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('falha quando rating fora de 1–5', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        reviewsOpsAgent,
        {
          ...baseInput,
          reviews: [
            { rating: 10, text: 'inválida', source: '', date: '' },
            { rating: 4, text: 'segunda válida', source: '', date: '' },
          ],
        },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('vocPath usa slug sanitizado', () => {
    const ts = vocTimestamp(new Date('2026-05-25T12:00:00Z'));
    const p = vocPath('Camiseta Acme!', ts);
    expect(p).toBe('voc/camiseta-acme--20260525-120000.md');
  });

  it('renderVoc inclui sections obrigatórias', () => {
    const md = renderVoc(baseInput, JSON.parse(validJson), {
      runId: 'run-x',
      model: 'fake',
      costUsd: 0.0003,
      generatedAt: '2026-05-25T12:00:00Z',
    });
    expect(md).toContain('# Voice of Customer');
    expect(md).toContain('## Top themes');
    expect(md).toContain('## Pain points');
    expect(md).toContain('## Quote candidates');
    expect(md).toContain('## ⚠ Risk flags');
  });
});
