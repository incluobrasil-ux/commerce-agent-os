import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CompleteFn } from '@cao/llm';
import { Memory } from '@cao/memory';
import { SilentProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { customerJourneyOpsAgent, journeyPath, journeyTimestamp, renderJourney } from './index.js';

let tmp = '';

beforeEach(async () => {
  tmp = await fs.mkdtemp(join(tmpdir(), 'customer-journey-ops-test-'));
});

afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

function fakeComplete(text: string): CompleteFn {
  return async () => ({
    text,
    model: 'fake',
    usage: { inputTokens: 380, outputTokens: 220 },
    costUsd: 0.0007,
    durationMs: 18,
  });
}

const baseInput = {
  tenantId: '_t',
  brandName: 'Acme-Organica',
  productLineSummary:
    'Camisetas e moletons orgânicos certificados. Coleção pequena, ' +
    'foco em peças básicas duráveis. Posicionamento entre fast fashion e premium.',
  audience: 'consumidor consciente 25-40 anos, valoriza sustentabilidade',
  region: 'BR',
  currentTouchpoints: ['site Shopify', 'Instagram orgânico', 'newsletter quinzenal'],
  knownPainPoints: ['encolhimento após lavagem', 'tabela de medidas pouco clara'],
  goals: ['aumentar taxa de primeira compra', 'reduzir devoluções por tamanho'],
  vocContext: 'Reviews destacam conforto, mas tamanho M veio menor.',
};

const validJson = JSON.stringify({
  summary:
    'Jornada centrada em descoberta via Instagram e fechamento no site. ' +
    'Principais frictions estão na decisão (tamanho) e pós-compra (encolhimento).',
  journeyStages: [
    {
      stage: 'awareness',
      customerState: 'cliente busca alternativas a fast fashion',
      currentTouchpoints: ['Instagram orgânico'],
      frictions: ['discoverability limitada sem ads pagos'],
      opportunities: ['parcerias com creators de sustentabilidade'],
    },
    {
      stage: 'consideration',
      customerState: 'compara preço/qualidade com concorrentes',
      currentTouchpoints: ['site Shopify'],
      frictions: ['tabela de medidas pouco clara'],
      opportunities: ['adicionar guia de medidas com vídeo curto'],
    },
    {
      stage: 'decision',
      customerState: 'pronto para comprar mas hesita no tamanho',
      currentTouchpoints: ['PDP', 'WhatsApp'],
      frictions: ['risco de tamanho errado, sem prova social'],
      opportunities: ['quiz de tamanho + reviews fotográficas no PDP'],
    },
    {
      stage: 'retention',
      customerState: 'recebeu produto, avalia recompra',
      currentTouchpoints: ['newsletter quinzenal'],
      frictions: ['encolhimento após lavagem'],
      opportunities: ['cartão de cuidados na embalagem + flow pós-compra'],
    },
  ],
  priorityMoves: [
    {
      move: 'Adicionar guia de medidas com vídeo curto no PDP',
      stage: 'consideration',
      rationale: 'Reduz devolução por tamanho — friction recorrente em reviews.',
      effort: 'low',
      expectedImpact: 'medium',
    },
    {
      move: 'Criar quiz de tamanho na decisão',
      stage: 'decision',
      rationale: 'Reduz hesitação pré-checkout.',
      effort: 'medium',
      expectedImpact: 'medium',
    },
    {
      move: 'Incluir cartão de cuidados anti-encolhimento na embalagem',
      stage: 'retention',
      rationale: 'Pain point #1 dos reviews — barato de resolver.',
      effort: 'low',
      expectedImpact: 'high',
    },
  ],
  measurementSuggestions: [
    'Taxa de devolução por motivo "tamanho"',
    'CTR do guia de medidas no PDP',
    'NPS pós-segunda lavagem',
  ],
  retentionLevers: [
    'Email pós-compra com instruções de lavagem',
    'Programa de fidelidade com peças básicas em refil',
  ],
  riskFlags: ['Dependência alta de Instagram orgânico — canal único'],
});

describe('customerJourneyOpsAgent', () => {
  it('mapeia jornada com stages, moves e measurement', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const r = await runAgent(
      customerJourneyOpsAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
    );
    expect(r.output.journeyStages.length).toBeGreaterThanOrEqual(3);
    expect(r.output.priorityMoves.length).toBeGreaterThanOrEqual(1);
    expect(r.output.measurementSuggestions.length).toBeGreaterThan(0);
  });

  it('aceita JSON em ```json fences', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const wrapped = `\`\`\`json\n${validJson}\n\`\`\``;
    const r = await runAgent(
      customerJourneyOpsAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(wrapped), memory, observability: new SilentProvider() },
    );
    expect(r.output.journeyStages[0]?.stage).toBe('awareness');
  });

  it('falha quando stage no output é inválido', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const invalid = JSON.stringify({
      summary: 'Resumo qualquer.',
      journeyStages: [
        {
          stage: 'reactivation',
          customerState: 'cliente dormente',
          currentTouchpoints: ['email'],
          frictions: ['inbox saturado'],
          opportunities: ['campanha winback'],
        },
      ],
      priorityMoves: [],
      measurementSuggestions: [],
      retentionLevers: [],
      riskFlags: [],
    });
    await expect(
      runAgent(
        customerJourneyOpsAgent,
        baseInput,
        { tenantId: '_t' },
        { complete: fakeComplete(invalid), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('falha quando goals vazio', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        customerJourneyOpsAgent,
        { ...baseInput, goals: [] },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('falha quando productLineSummary muito curto', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        customerJourneyOpsAgent,
        { ...baseInput, productLineSummary: 'curto' },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('journeyPath usa slug sanitizado', () => {
    const ts = journeyTimestamp(new Date('2026-05-25T12:00:00Z'));
    const p = journeyPath('Acme Orgânica!', ts);
    expect(p).toBe('journeys/acme-org-nica--20260525-120000.md');
  });

  it('renderJourney inclui stages e priority moves', () => {
    const md = renderJourney(baseInput, JSON.parse(validJson), {
      runId: 'run-x',
      model: 'fake',
      costUsd: 0.0007,
      generatedAt: '2026-05-25T12:00:00Z',
    });
    expect(md).toContain('# Customer journey');
    expect(md).toContain('## Journey stages');
    expect(md).toContain('### AWARENESS');
    expect(md).toContain('## Priority moves');
    expect(md).toContain('effort LOW');
  });
});
