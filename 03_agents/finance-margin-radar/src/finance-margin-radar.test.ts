import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CompleteFn } from '@cao/llm';
import { Memory } from '@cao/memory';
import { SilentProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { financeMarginRadarAgent, radarPath, radarTimestamp, renderRadar } from './index.js';

let tmp = '';

beforeEach(async () => {
  tmp = await fs.mkdtemp(join(tmpdir(), 'finance-margin-radar-test-'));
});

afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

function fakeComplete(text: string): CompleteFn {
  return async () => ({
    text,
    model: 'fake',
    usage: { inputTokens: 460, outputTokens: 240 },
    costUsd: 0.0008,
    durationMs: 19,
  });
}

const baseInput = {
  tenantId: '_t',
  currency: 'BRL',
  productLines: [
    {
      name: 'Camiseta básica',
      unitCost: 45,
      sellPrice: 129,
      channelFees: 8,
      shippingAvg: 12,
      monthlyUnitsEstimate: 120,
    },
    {
      name: 'Moletom',
      unitCost: 110,
      sellPrice: 249,
      channelFees: 14,
      shippingAvg: 18,
      monthlyUnitsEstimate: 60,
    },
  ],
  targetMarginPct: 35,
  fixedCostsMonth: 8500,
  observations: 'Tendência de aumento em retornos por tamanho. 5% últimas semanas.',
};

const validJson = JSON.stringify({
  overallHealth: 'healthy',
  summary:
    'Camiseta básica com margem saudável (~65%). Moletom em terreno tight quando fees ' +
    'e shipping são incluídos. Cobertura de custos fixos depende fortemente das camisetas.',
  marginAnalysis: [
    {
      productName: 'Camiseta básica',
      grossMarginPct: 65.1,
      contributionMarginAbs: 64,
      health: 'healthy',
      observations: 'Margem confortável. Contribuição absoluta cobre fixed costs com folga.',
    },
    {
      productName: 'Moletom',
      grossMarginPct: 55.8,
      contributionMarginAbs: 107,
      health: 'tight',
      observations: 'Contribuição alta por unidade, mas volume baixo limita cobertura.',
    },
  ],
  breakEvenInsights:
    'Cobertura de R$8500 de fixed costs requer ~132 camisetas/mês ou ~80 moletons. ' +
    'Mix atual cobre, mas há pouca margem para flutuação em fees/shipping.',
  pricingMoves: [
    {
      productName: 'Moletom',
      move: 'Testar +R$10 no preço de tabela com mensagem de durabilidade',
      rationale: 'Margem absoluta sobe sem afetar muito a percepção. Validar com A/B.',
      effort: 'low',
      expectedImpact: 'medium',
    },
    {
      productName: 'Camiseta básica',
      move: 'Bundle 2 camisetas com leve desconto para subir AOV',
      rationale: 'Mantém margem total e absorve mais fixed costs por compra.',
      effort: 'medium',
      expectedImpact: 'medium',
    },
  ],
  risksAndWatchouts: [
    'Aumento de retornos por tamanho corrói margem real (frete reverso).',
    'Concentração em 2 SKUs — dependência alta.',
    'Câmbio sobre matéria-prima importada pode comprimir custo.',
  ],
  recommendedExperiments: ['A/B preço moletom +R$10', 'Bundle 2 camisetas para AOV'],
  confidenceCaveats: [
    'Números fornecidos pelo operador — não validados contra ERP.',
    'Returns/refunds não incluídos no contribution margin acima.',
    'Câmbio e impostos podem mudar custo unit em condições reais.',
  ],
});

describe('financeMarginRadarAgent', () => {
  it('produz análise de margem com health por linha', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const r = await runAgent(
      financeMarginRadarAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
    );
    expect(r.output.marginAnalysis.length).toBe(2);
    expect(r.output.pricingMoves.length).toBeGreaterThanOrEqual(1);
    expect(r.output.confidenceCaveats.length).toBeGreaterThanOrEqual(1);
  });

  it('aceita JSON em ```json fences', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const wrapped = `\`\`\`json\n${validJson}\n\`\`\``;
    const r = await runAgent(
      financeMarginRadarAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(wrapped), memory, observability: new SilentProvider() },
    );
    expect(r.output.overallHealth).toBe('healthy');
  });

  it('falha quando productLines vazio', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        financeMarginRadarAgent,
        { ...baseInput, productLines: [] },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('falha quando unitCost negativo', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        financeMarginRadarAgent,
        {
          ...baseInput,
          productLines: [{ ...baseInput.productLines[0], unitCost: -1 }],
        },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('falha quando overallHealth no output é inválido', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const invalid = JSON.stringify({
      ...JSON.parse(validJson),
      overallHealth: 'green-ish',
    });
    await expect(
      runAgent(
        financeMarginRadarAgent,
        baseInput,
        { tenantId: '_t' },
        { complete: fakeComplete(invalid), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('radarPath usa slug sanitizado', () => {
    const ts = radarTimestamp(new Date('2026-05-25T12:00:00Z'));
    const p = radarPath('Acme Q2!', ts);
    expect(p).toBe('finance-radar/acme-q2--20260525-120000.md');
  });

  it('renderRadar inclui margin analysis, pricing moves e confidence caveats', () => {
    const md = renderRadar(baseInput, JSON.parse(validJson), {
      runId: 'run-x',
      model: 'fake',
      costUsd: 0.0008,
      generatedAt: '2026-05-25T12:00:00Z',
      label: 'q2-baseline',
    });
    expect(md).toContain('# Finance margin radar');
    expect(md).toContain('Overall health:** 🟢 HEALTHY');
    expect(md).toContain('## Margin analysis');
    expect(md).toContain('## Pricing moves');
    expect(md).toContain('## Confidence caveats');
  });
});
