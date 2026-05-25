import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CompleteFn } from '@cao/llm';
import { Memory } from '@cao/memory';
import { SilentProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { marketingDirectorAgent, planPath, planTimestamp, renderPlan } from './index.js';

let tmp = '';

beforeEach(async () => {
  tmp = await fs.mkdtemp(join(tmpdir(), 'marketing-director-test-'));
});

afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

function fakeComplete(text: string): CompleteFn {
  return async () => ({
    text,
    model: 'fake',
    usage: { inputTokens: 400, outputTokens: 200 },
    costUsd: 0.0008,
    durationMs: 17,
  });
}

const baseInput = {
  tenantId: '_t',
  horizon: 'Q3 2026',
  objectives: [
    'Crescer receita em 25% sem reduzir margem',
    'Abrir audiência sustentabilidade 30-45 anos',
  ],
  budgetUsd: 50000,
  brandVoice: 'direto, próximo, sem hype',
  audienceContext: 'Base atual: 25-40 anos, urbano, recompra ~30%.',
  marketContext: 'Categoria orgânica cresce 12% YoY, sazonalidade Q3 alta.',
  competitorContext: 'Player X aumentou frequência de email em 2x.',
  productPortfolio: 'Hero: 3 SKUs camiseta orgânica. Long-tail: 8 SKUs adicionais.',
  constraints: ['não usar gatilho de escassez falsa', 'cap de CAC em USD 35'],
};

const validJson = JSON.stringify({
  planTitle: 'Q3 — expansão sustentabilidade',
  thesis:
    'A demanda Q3 + tese sustentabilidade abrem janela para diversificar audiência sem ' +
    'erodir margem; foco em paid social + email.',
  initiatives: [
    {
      name: 'Paid social — audiência sustentabilidade',
      objective: 'Capturar audiência 30-45 sustentabilidade',
      audience: '30-45 anos, interesse sustentabilidade, urbano',
      primaryChannel: 'meta-ads',
      supportingChannels: ['google-ads'],
      timing: 'Jul-Set',
      budgetUsd: 25000,
      primaryKpi: 'CAC',
      successMetric: '≤ USD 35',
      rationale: 'Custo de aquisição válido por LTV histórico em segmentos próximos.',
    },
    {
      name: 'Email lifecycle hero SKUs',
      objective: 'Aumentar recompra hero SKUs',
      audience: 'Base ativa últimos 90 dias',
      primaryChannel: 'email',
      supportingChannels: [],
      timing: 'Jul-Set',
      budgetUsd: 5000,
      primaryKpi: 'Taxa de recompra',
      successMetric: '+5pp vs Q2',
      rationale: 'Recompra histórica responde a flows automáticos com bom ROI.',
    },
  ],
  budgetSplit: [
    { category: 'paid-acquisition', pctOfTotal: 60, rationale: 'Driver primário do plano.' },
    { category: 'retention', pctOfTotal: 25, rationale: 'Aumenta LTV e sustenta CAC.' },
    { category: 'creative', pctOfTotal: 15, rationale: 'Produção de variantes por audiência.' },
  ],
  kpiTargets: [
    { kpi: 'Receita Q3', baseline: 'USD 200k', target: 'USD 250k', horizon: 'Q3 2026' },
    { kpi: 'CAC blendado', baseline: 'USD 40', target: 'USD 35', horizon: 'Q3 2026' },
  ],
  sequencingNotes: 'Email lifecycle deve estar live antes do peak de paid em Ago.',
  riskFlags: [
    'Dependência de criativo novo para audiência nova — risco se criativo não validar em 2 semanas.',
  ],
});

describe('marketingDirectorAgent', () => {
  it('gera plano com iniciativas, KPIs e risco', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const r = await runAgent(
      marketingDirectorAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
    );
    expect(r.output.initiatives.length).toBeGreaterThanOrEqual(1);
    expect(r.output.kpiTargets.length).toBeGreaterThanOrEqual(1);
    expect(r.output.budgetSplit.length).toBeGreaterThanOrEqual(1);
  });

  it('aceita JSON em ```json fences', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const wrapped = `\`\`\`json\n${validJson}\n\`\`\``;
    const r = await runAgent(
      marketingDirectorAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(wrapped), memory, observability: new SilentProvider() },
    );
    expect(r.output.planTitle.length).toBeGreaterThan(0);
  });

  it('falha quando budgetUsd ausente', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        marketingDirectorAgent,
        { ...baseInput, budgetUsd: -1 },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('falha quando objectives vazio', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        marketingDirectorAgent,
        { ...baseInput, objectives: [] },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('planPath usa slug sanitizado', () => {
    const ts = planTimestamp(new Date('2026-07-01T08:00:00Z'));
    const p = planPath('Q3 2026!!!', ts);
    expect(p).toBe('marketing/q3-2026----20260701-080000.md');
  });

  it('renderPlan inclui iniciativas e KPIs', () => {
    const md = renderPlan(baseInput, JSON.parse(validJson), {
      runId: 'run-x',
      model: 'fake',
      costUsd: 0.0008,
      generatedAt: '2026-07-01T08:00:00Z',
    });
    expect(md).toContain('# Marketing Plan');
    expect(md).toContain('## Iniciativas');
    expect(md).toContain('## KPI targets');
    expect(md).toContain('Paid social');
  });
});
