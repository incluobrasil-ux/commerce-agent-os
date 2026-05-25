import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CompleteFn } from '@cao/llm';
import { Memory } from '@cao/memory';
import { SilentProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { offerPath, offerTimestamp, productOfferAgent, renderOffer } from './index.js';

let tmp = '';

beforeEach(async () => {
  tmp = await fs.mkdtemp(join(tmpdir(), 'product-offer-test-'));
});

afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

function fakeComplete(text: string): CompleteFn {
  return async () => ({
    text,
    model: 'fake',
    usage: { inputTokens: 300, outputTokens: 150 },
    costUsd: 0.0005,
    durationMs: 13,
  });
}

const baseInput = {
  tenantId: '_t',
  product: {
    name: 'Camiseta-Acme-Organica',
    currentDescription:
      'Camiseta 100% algodão orgânico, modelagem regular, gola redonda. ' +
      'Tingimento com pigmentos naturais. Costuras reforçadas.',
    price: '129.00',
    currency: 'BRL',
    category: 'apparel',
  },
  targetAudience: 'consumidor consciente, 25-40 anos, valoriza sustentabilidade',
  brandVoice: 'direto, próximo, sem hype — fala de produto, não de status',
  locale: 'pt-BR',
  conversionGoal: 'first purchase',
  vocContext: 'Reviews destacam conforto do tecido e questões de tamanho.',
  competitorContext: '',
  constraints: ['não usar gatilho de escassez falsa', 'sem claims de saúde'],
};

const validJson = JSON.stringify({
  heroHeadline: 'A camiseta que dura mais que o discurso.',
  subhead: 'Algodão orgânico, pigmento natural, costura que aguenta lavagem.',
  valueProps: [
    'Algodão 100% orgânico certificado',
    'Pigmento natural — cor não desbota nas primeiras lavagens',
    'Costura reforçada nas laterais',
  ],
  objectionResponses: [
    {
      objection: 'orgânico encolhe na lavagem',
      response: 'Tabela de medidas pós-lavagem incluída no PDP — sem surpresa.',
    },
  ],
  bundleSuggestions: [
    {
      name: 'Kit semana orgânica',
      items: ['Camiseta orgânica branca', 'Camiseta orgânica preta'],
      rationale: 'Cobertura básica para 7 dias com 2 peças que rodam bem.',
    },
  ],
  ctaOptions: ['Pegar a minha', 'Quero conhecer', 'Comprar agora'],
  pricingNotes: 'Posicionada acima da fast fashion, abaixo de premium puro.',
  abTestIdeas: [
    'Testar hero com social proof (review quote) vs sem',
    'Testar CTA "Pegar a minha" vs "Comprar agora"',
  ],
  riskFlags: [],
});

describe('productOfferAgent', () => {
  it('gera oferta com hero, value props e CTAs', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const r = await runAgent(
      productOfferAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
    );
    expect(r.output.heroHeadline.length).toBeGreaterThan(0);
    expect(r.output.valueProps.length).toBeGreaterThanOrEqual(1);
    expect(r.output.ctaOptions.length).toBeGreaterThanOrEqual(1);
  });

  it('aceita JSON em ```json fences', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const wrapped = `\`\`\`json\n${validJson}\n\`\`\``;
    const r = await runAgent(
      productOfferAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(wrapped), memory, observability: new SilentProvider() },
    );
    expect(r.output.bundleSuggestions[0]?.items.length).toBeGreaterThanOrEqual(2);
  });

  it('aceita arrays opcionais vazios', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const thin = JSON.stringify({
      heroHeadline: 'Direto ao ponto.',
      subhead: 'Camiseta básica feita pra durar.',
      valueProps: ['Algodão orgânico'],
      objectionResponses: [],
      bundleSuggestions: [],
      ctaOptions: ['Comprar'],
      pricingNotes: '',
      abTestIdeas: [],
      riskFlags: [],
    });
    const r = await runAgent(
      productOfferAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(thin), memory, observability: new SilentProvider() },
    );
    expect(r.output.bundleSuggestions).toHaveLength(0);
    expect(r.output.objectionResponses).toHaveLength(0);
  });

  it('falha quando description tem menos de 10 chars', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        productOfferAgent,
        { ...baseInput, product: { ...baseInput.product, currentDescription: 'curta' } },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('falha quando product.name ausente', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        productOfferAgent,
        { ...baseInput, product: { ...baseInput.product, name: '' } },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('offerPath usa slug sanitizado', () => {
    const ts = offerTimestamp(new Date('2026-05-25T12:00:00Z'));
    const p = offerPath('Camiseta Acme!', ts);
    expect(p).toBe('offers/camiseta-acme--20260525-120000.md');
  });

  it('renderOffer inclui sections do hero, value props e CTA', () => {
    const md = renderOffer(baseInput, JSON.parse(validJson), {
      runId: 'run-x',
      model: 'fake',
      costUsd: 0.0005,
      generatedAt: '2026-05-25T12:00:00Z',
    });
    expect(md).toContain('# Offer');
    expect(md).toContain('## Hero');
    expect(md).toContain('## Value props');
    expect(md).toContain('## CTA options');
    expect(md).toContain('## Bundles sugeridos');
  });
});
