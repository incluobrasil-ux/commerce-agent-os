import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CompleteFn } from '@cao/llm';
import { Memory } from '@cao/memory';
import { SilentProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { marketIntelligenceAgent } from './index.js';

let tmp = '';

beforeEach(async () => {
  tmp = await fs.mkdtemp(join(tmpdir(), 'market-intel-test-'));
});

afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

function fakeComplete(text: string): CompleteFn {
  return async () => ({
    text,
    model: 'fake',
    usage: { inputTokens: 200, outputTokens: 100 },
    costUsd: 0.0002,
    durationMs: 12,
  });
}

const baseInput = {
  tenantId: '_t',
  marketQuestion: 'Quais sinais de mudança de preço no nicho de t-shirts orgânicas em 2026?',
  sourceTexts: [
    'Artigo do TechRetail (mar/2026): consumidores estão pagando mais por cotton certificado; o sortimento mainstream subiu de média $24 para $32 em 12 meses.',
    'Survey Pesquisa Q1: 38% dos compradores afirmam priorizar selo GOTS sobre preço. Importações de tecido orgânico tiveram aumento de 22% em 2025.',
  ],
  sourceLabels: ['TechRetail mar/2026', 'Survey Pesquisa Q1'],
  category: 'apparel-organic',
  region: 'US',
  timeframe: '2026 Q1',
  constraints: [],
};

const validJson = JSON.stringify({
  summary:
    'Dois sinais convergentes apontam para alta de preço em t-shirts orgânicas: tickets médios subiram 33% e há disposição declarada do consumidor a pagar pelo selo GOTS.',
  signals: [
    {
      signal: 'Preço médio de mainstream organic tee subiu de $24 para $32 em 12 meses',
      evidence: 'TechRetail mar/2026: "média $24 para $32 em 12 meses"',
      confidence: 'high',
    },
    {
      signal: '38% dos compradores priorizam selo GOTS sobre preço',
      evidence: 'Survey Pesquisa Q1: "38% dos compradores afirmam priorizar selo GOTS"',
      confidence: 'medium',
    },
  ],
  opportunities: [
    'Reposicionar SKUs core com selo GOTS visível e preço premium',
    'Criar bundle "certified essentials" mirando os 38% da survey',
  ],
  threats: ['Concorrência mainstream pode replicar selo certificado rapidamente'],
  recommendedActions: [
    'Validar capacidade de obter selo GOTS para fornecedores atuais',
    'Testar A/B preço $29 vs $34 com selo destacado',
  ],
  assumptions: [
    'Disposição declarada na survey traduz em comportamento real (necessita validação com vendas)',
  ],
});

describe('marketIntelligenceAgent', () => {
  it('produz síntese com sinais ancorados em evidência', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const r = await runAgent(
      marketIntelligenceAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
    );
    expect(r.output.signals).toHaveLength(2);
    expect(r.output.opportunities.length).toBeGreaterThan(0);
    expect(r.output.signals[0]?.confidence).toBe('high');
  });

  it('aceita JSON em ```json fences', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const wrapped = `\`\`\`json\n${validJson}\n\`\`\``;
    const r = await runAgent(
      marketIntelligenceAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(wrapped), memory, observability: new SilentProvider() },
    );
    expect(r.output.signals).toHaveLength(2);
  });

  it('aceita output com signals vazios quando fontes insuficientes', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const thinJson = JSON.stringify({
      summary:
        'Fontes fornecidas não permitem isolar sinais específicos sobre a pergunta de mercado feita.',
      signals: [],
      opportunities: [],
      threats: [],
      recommendedActions: ['Coletar fontes mais específicas sobre o nicho antes de re-rodar.'],
      assumptions: ['Operador precisa fornecer fontes mais alinhadas à pergunta.'],
    });
    const r = await runAgent(
      marketIntelligenceAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(thinJson), memory, observability: new SilentProvider() },
    );
    expect(r.output.signals).toHaveLength(0);
    expect(r.output.recommendedActions.length).toBeGreaterThan(0);
  });

  it('falha quando confidence vem com valor fora do enum', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const badConfidence = JSON.stringify({
      summary: 'a'.repeat(30),
      signals: [
        {
          signal: 'algum sinal aqui',
          evidence: 'alguma evidência',
          confidence: 'super-high',
        },
      ],
      opportunities: [],
      threats: [],
      recommendedActions: [],
      assumptions: [],
    });
    await expect(
      runAgent(
        marketIntelligenceAgent,
        baseInput,
        { tenantId: '_t' },
        { complete: fakeComplete(badConfidence), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('falha quando sourceTexts vazio (input schema)', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        marketIntelligenceAgent,
        { ...baseInput, sourceTexts: [] },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('falha quando marketQuestion < 5 chars', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        marketIntelligenceAgent,
        { ...baseInput, marketQuestion: 'x' },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });
});
