import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CompleteFn } from '@cao/llm';
import { Memory } from '@cao/memory';
import { SilentProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { adsLaunchpadAgent, adsPath, adsTimestamp, renderAdsPlan } from './index.js';

let tmp = '';

beforeEach(async () => {
  tmp = await fs.mkdtemp(join(tmpdir(), 'ads-launchpad-test-'));
});

afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

function fakeComplete(text: string): CompleteFn {
  return async () => ({
    text,
    model: 'fake',
    usage: { inputTokens: 420, outputTokens: 260 },
    costUsd: 0.0009,
    durationMs: 20,
  });
}

const baseInput = {
  tenantId: '_t',
  productName: 'Camiseta-Acme-Organica',
  productDescription:
    'Camiseta 100% algodão orgânico, modelagem regular, gola redonda. ' +
    'Tingimento natural. Costuras reforçadas.',
  offerHighlights: ['Frete grátis acima de R$199', 'Devolução 30 dias'],
  audience: 'consumidor consciente 25-40 anos no Brasil',
  conversionGoal: 'first purchase',
  monthlyBudgetUsd: 500,
  channels: ['meta', 'google'] as (
    | 'meta'
    | 'google'
    | 'tiktok'
    | 'pinterest'
    | 'youtube'
    | 'other'
  )[],
  brandVoice: 'direto, próximo, sem hype',
  constraints: ['sem gatilho de escassez falsa', 'sem claim de saúde'],
  vocContext: 'Reviews destacam conforto. Pain: tamanho M veio menor.',
};

const validJson = JSON.stringify({
  strategicSummary:
    'Prospecting com angle "durabilidade > fast fashion" no Meta, retargeting Google. ' +
    'Budget split inicial 60/40. Foco em compra única.',
  angles: [
    {
      name: 'durabilidade',
      hypothesis: 'Audiência consciente responde a "dura mais que fast fashion".',
      hookExample: 'Quantas camisetas você jogou fora esse ano?',
    },
    {
      name: 'transparência',
      hypothesis: 'Audiência responde a quem mostra a origem do tecido.',
      hookExample: 'Do algodão à etiqueta — você sabe de onde veio.',
    },
    {
      name: 'conforto',
      hypothesis: 'Reviews destacam conforto — usar como prova social.',
      hookExample: 'A camiseta que você esquece que está vestindo.',
    },
  ],
  audienceSegments: [
    {
      name: 'consciente-25-40-br',
      description: 'Interesse em sustentabilidade, slow fashion, marcas brasileiras.',
      channelFit: ['meta'],
    },
    {
      name: 'retargeting-pdp',
      description: 'Visitaram PDP nos últimos 30 dias sem comprar.',
      channelFit: ['meta', 'google'],
    },
  ],
  copySets: [
    {
      angleRef: 'durabilidade',
      headline: 'A camiseta que dura mais que o discurso',
      primaryText:
        'Algodão orgânico certificado, costuras reforçadas e pigmento natural. ' +
        'Feita pra rodar — sem virar pano de chão na primeira lavagem.',
      cta: 'Pegar a minha',
    },
    {
      angleRef: 'conforto',
      headline: 'A camiseta que você esquece que está vestindo',
      primaryText:
        'Algodão macio, modelagem regular, gola que não enrola. Conforto que aparece ' +
        'já na primeira hora.',
      cta: 'Conhecer',
    },
  ],
  creativeBriefs: [
    {
      format: 'vídeo vertical 15s',
      description: 'Hook nos primeiros 2s, mostrar tecido em macro, sem face-cam.',
      channel: 'meta',
    },
    {
      format: 'carrossel 5 cards',
      description: 'Card 1: hook · Card 2-4: benefícios · Card 5: CTA + reviews.',
      channel: 'meta',
    },
  ],
  kpiTargets: [
    'Monitorar CTR > benchmark da categoria',
    'CPA dentro do margin do produto',
    'ROAS observado por canal nos primeiros 14 dias',
  ],
  budgetSplitNotes:
    'Inicial 60% Meta (prospecting) / 40% Google (search marca + retargeting). ' +
    'Reavaliar após 14 dias com dados de ROAS.',
  abTestPlan: [
    {
      hypothesis: 'Angle durabilidade vence angle conforto em prospecting Meta.',
      variantA: 'Headline durabilidade',
      variantB: 'Headline conforto',
      successMetric: 'CPA por compra atribuída',
    },
  ],
  complianceCaveats: [
    'Evitar claim "100% natural" sem certificação visível',
    'LGPD: pixel Meta exige banner de consentimento',
  ],
  riskFlags: ['Budget baixo para 2 canais — pode diluir aprendizado'],
});

describe('adsLaunchpadAgent', () => {
  it('gera plano com angles, segments, copy e KPI targets', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const r = await runAgent(
      adsLaunchpadAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
    );
    expect(r.output.angles.length).toBeGreaterThanOrEqual(1);
    expect(r.output.audienceSegments.length).toBeGreaterThanOrEqual(1);
    expect(r.output.copySets.length).toBeGreaterThanOrEqual(1);
    expect(r.output.kpiTargets.length).toBeGreaterThanOrEqual(1);
  });

  it('aceita JSON em ```json fences', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const wrapped = `\`\`\`json\n${validJson}\n\`\`\``;
    const r = await runAgent(
      adsLaunchpadAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(wrapped), memory, observability: new SilentProvider() },
    );
    expect(r.output.abTestPlan.length).toBeGreaterThan(0);
  });

  it('falha quando channel inválido no input', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        adsLaunchpadAgent,
        {
          ...baseInput,
          channels: ['whatsapp' as unknown as 'meta'],
        },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('falha quando budget é negativo', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        adsLaunchpadAgent,
        { ...baseInput, monthlyBudgetUsd: -1 },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('falha quando channels vazio', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        adsLaunchpadAgent,
        { ...baseInput, channels: [] as unknown as ['meta'] },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('adsPath usa slug sanitizado', () => {
    const ts = adsTimestamp(new Date('2026-05-25T12:00:00Z'));
    const p = adsPath('Camiseta Acme!', ts);
    expect(p).toBe('ads-plans/camiseta-acme--20260525-120000.md');
  });

  it('renderAdsPlan inclui angles, audience segments e A/B plan', () => {
    const md = renderAdsPlan(baseInput, JSON.parse(validJson), {
      runId: 'run-x',
      model: 'fake',
      costUsd: 0.0009,
      generatedAt: '2026-05-25T12:00:00Z',
    });
    expect(md).toContain('# Ads plan');
    expect(md).toContain('## Angles');
    expect(md).toContain('### durabilidade');
    expect(md).toContain('## Audience segments');
    expect(md).toContain('## Copy sets');
    expect(md).toContain('## A/B test plan');
  });
});
