import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CompleteFn } from '@cao/llm';
import { Memory } from '@cao/memory';
import { SilentProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  renderTraffic,
  totalChannelBudget,
  trafficCampaignsAgent,
  trafficPath,
  trafficTimestamp,
} from './index.js';

let tmp = '';

beforeEach(async () => {
  tmp = await fs.mkdtemp(join(tmpdir(), 'traffic-test-'));
});

afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

function fakeComplete(text: string): CompleteFn {
  return async () => ({
    text,
    model: 'fake',
    usage: { inputTokens: 400, outputTokens: 250 },
    costUsd: 0.001,
    durationMs: 16,
  });
}

const baseInput = {
  tenantId: '_t',
  campaignName: 'lancamento-camiseta-organica',
  totalBudgetUsd: 10000,
  dailyBudgetCapUsd: 400,
  cpaTargetUsd: 35,
  conversionTarget: 'first purchase',
  channels: ['meta-ads', 'google-ads', 'email'],
  audiencesContext: 'Base de remarketing: ~12k. LAL 1% disponível em Meta.',
  productContext: 'Camiseta orgânica BRL 129. AOV histórico BRL 180.',
  priorPerformanceContext: 'CAC blended últimos 90d: USD 32. ROAS ~3.2x em Meta prospecting.',
  constraints: ['cap diário USD 400', 'sem audiências < 18 anos'],
  mode: 'dry_run' as const,
};

const validJson = JSON.stringify({
  campaignName: 'lancamento-camiseta-organica',
  thesis:
    'Meta prospecting valida tese rápido com remarketing forte; Google captura ' +
    'demanda explícita; email puxa retention.',
  channelMix: [
    {
      channel: 'meta-ads',
      role: 'driver',
      allocationPct: 60,
      budgetUsd: 6000,
      primaryObjective: 'aquisição',
      expectedCpa: 'USD 30-38',
      rationale: 'Histórico de ROAS 3.2x em prospecting com criativo similar.',
    },
    {
      channel: 'google-ads',
      role: 'amplifier',
      allocationPct: 30,
      budgetUsd: 3000,
      primaryObjective: 'captura de demanda',
      expectedCpa: 'USD 28-34',
      rationale: 'Termos brand+categoria têm CPC baixo e CVR alto.',
    },
    {
      channel: 'email',
      role: 'retention',
      allocationPct: 10,
      budgetUsd: 1000,
      primaryObjective: 'recompra',
      expectedCpa: 'n/a',
      rationale: 'Custo marginal baixo; sustenta LTV.',
    },
  ],
  audiences: [
    {
      name: 'LAL 1% compradores 90d',
      channel: 'meta-ads',
      segmentDefinition: 'Lookalike 1% sobre compradores últimos 90d',
      estReach: '~250k BR',
      intentLevel: 'mid',
    },
    {
      name: 'Termos categoria + brand',
      channel: 'google-ads',
      segmentDefinition: 'Exact match + phrase match termos brand e categoria',
      estReach: 'n/a',
      intentLevel: 'high',
    },
    {
      name: 'Base ativa 90d',
      channel: 'email',
      segmentDefinition: 'Compraram nos últimos 90 dias',
      estReach: '~12k',
      intentLevel: 'high',
    },
  ],
  creativeHypotheses: [
    {
      angle: 'Foco em durabilidade vs descartável',
      pairedAudience: 'LAL 1% compradores 90d',
      pairedChannel: 'meta-ads',
      expectedSignal: 'CTR > 1.2% no primeiro 7d',
    },
    {
      angle: 'Comparativo material vs fast fashion',
      pairedAudience: 'Termos categoria + brand',
      pairedChannel: 'google-ads',
      expectedSignal: 'CVR > 2.5% em landing',
    },
  ],
  measurementPlan:
    'KPI primário: CAC blendado ≤ USD 35. Secundário: ROAS Meta ≥ 3x; CVR landing ≥ 2.5%. ' +
    'Atribuição: last non-direct click (7d). Revisão semanal sexta.',
  pacingNotes: 'Cap diário USD 400 protege contra burnout — revisar pacing se > 80% por 3 dias.',
  scaleScenarios: [
    {
      scenario: 'Scale +50% se CPA ≤ USD 32 por 14d',
      budgetDeltaPct: 50,
      expectedImpact: 'Aumento de aquisições com CAC marginal +10%',
      precondition: 'CPA Meta ≤ USD 32 por 14d consecutivos',
    },
  ],
  recommendations: [
    'Subir cap diário só após 7d de pacing estável',
    'Iniciar criativo durabilidade no dia 1; comparativo no dia 4',
  ],
  riskFlags: ['Risco de saturação de audiência LAL se scale acelerar muito rápido'],
});

describe('trafficCampaignsAgent', () => {
  it('gera channel mix, audiências e hipóteses', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const r = await runAgent(
      trafficCampaignsAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
    );
    expect(r.output.channelMix.length).toBeGreaterThanOrEqual(2);
    expect(r.output.audiences.length).toBeGreaterThanOrEqual(2);
    expect(r.output.creativeHypotheses.length).toBeGreaterThanOrEqual(1);
    expect(r.output.measurementPlan.length).toBeGreaterThan(10);
  });

  it('aceita JSON em ```json fences', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const wrapped = `\`\`\`json\n${validJson}\n\`\`\``;
    const r = await runAgent(
      trafficCampaignsAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(wrapped), memory, observability: new SilentProvider() },
    );
    expect(r.output.channelMix[0]?.role).toBe('driver');
  });

  it('falha sem totalBudgetUsd > 0', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        trafficCampaignsAgent,
        { ...baseInput, totalBudgetUsd: -1 },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('falha sem channels', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        trafficCampaignsAgent,
        { ...baseInput, channels: [] },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('totalChannelBudget soma corretamente', () => {
    const out = JSON.parse(validJson);
    expect(totalChannelBudget(out.channelMix)).toBe(10000);
  });

  it('trafficPath usa slug sanitizado', () => {
    const ts = trafficTimestamp(new Date('2026-09-01T09:00:00Z'));
    const p = trafficPath('Lançamento Camiseta!!', ts);
    expect(p).toBe('traffic/lan-amento-camiseta---20260901-090000.md');
  });

  it('renderTraffic inclui channel mix, audiences e measurement', () => {
    const md = renderTraffic(baseInput, JSON.parse(validJson), {
      runId: 'run-x',
      model: 'fake',
      costUsd: 0.001,
      generatedAt: '2026-09-01T09:00:00Z',
    });
    expect(md).toContain('# Traffic plan (dry-run)');
    expect(md).toContain('## Channel mix');
    expect(md).toContain('## Audiências');
    expect(md).toContain('## Plano de medição');
    expect(md).toContain('meta-ads');
    expect(md).toContain('não compra mídia');
  });
});
