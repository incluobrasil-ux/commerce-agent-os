import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CompleteFn } from '@cao/llm';
import { Memory } from '@cao/memory';
import { SilentProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { creativeCopyAgent, creativePath, creativeTimestamp, renderCreative } from './index.js';

let tmp = '';

beforeEach(async () => {
  tmp = await fs.mkdtemp(join(tmpdir(), 'creative-copy-test-'));
});

afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

function fakeComplete(text: string): CompleteFn {
  return async () => ({
    text,
    model: 'fake',
    usage: { inputTokens: 350, outputTokens: 250 },
    costUsd: 0.0009,
    durationMs: 15,
  });
}

const baseInput = {
  tenantId: '_t',
  campaignName: 'lancamento-camiseta-organica',
  theme: 'sustentabilidade sem hype',
  audience: '25-40, urbano, valoriza durabilidade',
  brandVoice: 'direto, próximo, sem hype',
  offerSummary:
    'Camiseta 100% algodão orgânico, pigmento natural, costura reforçada. ' +
    'BRL 129, 4 cores, M-XL.',
  channels: ['meta-ads', 'email'],
  formats: ['feed-image', 'newsletter'],
  locales: ['pt-BR'],
  constraints: ['sem claims de saúde', 'sem escassez falsa'],
};

const validJson = JSON.stringify({
  variants: [
    {
      channel: 'meta-ads',
      format: 'feed-image',
      locale: 'pt-BR',
      headline: 'A camiseta que dura mais que a tendência.',
      body: 'Algodão orgânico, costura reforçada. Para quem cansou de jogar fora.',
      cta: 'Conheça',
      estCharCount: 110,
    },
    {
      channel: 'email',
      format: 'newsletter',
      locale: 'pt-BR',
      headline: 'Sua próxima camiseta — pensada pra durar',
      body: 'Tecido 100% orgânico. Pigmento natural. Costura reforçada.\n\nVeja por que vale.',
      cta: 'Ver detalhes',
      estCharCount: 180,
    },
  ],
  ctaPool: ['Conheça', 'Ver detalhes', 'Pegar a minha', 'Comprar agora'],
  visualBrief: {
    mood: 'natural, sereno, próximo',
    paletteHint: 'tons terrosos + bege + verde-musgo',
    motifs: ['tecido em close', 'detalhe de costura', 'luz natural'],
    shotIdeas: ['close de costura', 'pessoa real vestindo em ambiente urbano'],
    aspectRatios: ['1:1', '4:5'],
  },
  reviewerChecklist: [
    'Validar claim "100% orgânico" com certificado',
    'Confirmar cores disponíveis para a campanha',
  ],
  riskFlags: [],
});

describe('creativeCopyAgent', () => {
  it('gera variantes por canal + visual brief', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const r = await runAgent(
      creativeCopyAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
    );
    expect(r.output.variants.length).toBeGreaterThanOrEqual(2);
    expect(r.output.visualBrief.aspectRatios.length).toBeGreaterThan(0);
    expect(r.output.ctaPool.length).toBeGreaterThan(0);
  });

  it('aceita JSON em ```json fences', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const wrapped = `\`\`\`json\n${validJson}\n\`\`\``;
    const r = await runAgent(
      creativeCopyAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(wrapped), memory, observability: new SilentProvider() },
    );
    expect(r.output.variants[0]?.headline.length).toBeGreaterThan(0);
  });

  it('falha sem channels', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        creativeCopyAgent,
        { ...baseInput, channels: [] },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('falha sem locales', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        creativeCopyAgent,
        { ...baseInput, locales: [] },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('creativePath usa slug sanitizado', () => {
    const ts = creativeTimestamp(new Date('2026-08-01T10:00:00Z'));
    const p = creativePath('Lançamento BR!', ts);
    expect(p).toBe('creative/lan-amento-br--20260801-100000.md');
  });

  it('renderCreative inclui variantes e visual brief', () => {
    const md = renderCreative(baseInput, JSON.parse(validJson), {
      runId: 'run-x',
      model: 'fake',
      costUsd: 0.0009,
      generatedAt: '2026-08-01T10:00:00Z',
    });
    expect(md).toContain('# Creative');
    expect(md).toContain('## Variantes');
    expect(md).toContain('## Visual brief');
    expect(md).toContain('meta-ads');
  });
});
