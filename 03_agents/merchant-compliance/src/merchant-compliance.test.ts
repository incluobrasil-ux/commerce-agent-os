import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CompleteFn } from '@cao/llm';
import { Memory } from '@cao/memory';
import { SilentProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  compliancePath,
  complianceTimestamp,
  merchantComplianceAgent,
  renderCompliance,
} from './index.js';

let tmp = '';

beforeEach(async () => {
  tmp = await fs.mkdtemp(join(tmpdir(), 'merchant-compliance-test-'));
});

afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

function fakeComplete(text: string): CompleteFn {
  return async () => ({
    text,
    model: 'fake',
    usage: { inputTokens: 400, outputTokens: 200 },
    costUsd: 0.0006,
    durationMs: 15,
  });
}

const baseInput = {
  tenantId: '_t',
  contentType: 'product-description' as const,
  content:
    'Nossa camiseta cura ansiedade em 7 dias. Cliente João Silva ' +
    '(joao@example.com, 11999998888) recomenda. 100% orgânica, ' +
    'frete grátis Brasil inteiro. Devolução gratuita em 30 dias.',
  targetMarket: 'Brasil',
  category: 'apparel',
  sensitiveTopics: ['health-claims'],
  brandPolicies: 'Nossa marca evita claims de saúde. Política de devolução: 30 dias.',
};

const validJson = JSON.stringify({
  overallSeverity: 'high',
  complianceSummary:
    'Conteúdo contém claim de saúde sem base ("cura ansiedade") e PII pessoal exposta. ' +
    'Necessário revisar antes de publicar.',
  legalRisks: [
    {
      topic: 'Health claim sem base',
      excerpt: 'Nossa camiseta cura ansiedade em 7 dias',
      severity: 'high',
      rationale: 'Claim de cura sem base científica viola CDC art. 37 e potencialmente Anvisa.',
    },
  ],
  piiFlags: [
    {
      kind: 'full-name',
      excerpt: 'João Silva',
      recommendation: 'Substituir por iniciais ou consentimento explícito do cliente.',
    },
    {
      kind: 'email',
      excerpt: 'joao@example.com',
      recommendation: 'Remover — viola LGPD se sem consentimento.',
    },
    {
      kind: 'phone',
      excerpt: '11999998888',
      recommendation: 'Remover ou mascarar.',
    },
  ],
  requiredDisclaimers: ['Disclaimer LGPD sobre uso de dados pessoais em depoimentos.'],
  policyGaps: ['Política da marca não define handling de depoimentos com PII.'],
  recommendedRevisions: [
    {
      original: 'Nossa camiseta cura ansiedade em 7 dias.',
      suggested: 'Nossa camiseta é feita com tecido confortável.',
      reason: 'Remover claim de cura sem base.',
    },
  ],
  followups: ['Confirmar consentimento do depoimento.'],
});

describe('merchantComplianceAgent', () => {
  it('detecta risco alto com PII e health-claim', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const r = await runAgent(
      merchantComplianceAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
    );
    expect(r.output.overallSeverity).toBe('high');
    expect(r.output.legalRisks.length).toBeGreaterThan(0);
    expect(r.output.piiFlags.length).toBeGreaterThanOrEqual(3);
  });

  it('aceita JSON em ```json fences', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const wrapped = `\`\`\`json\n${validJson}\n\`\`\``;
    const r = await runAgent(
      merchantComplianceAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(wrapped), memory, observability: new SilentProvider() },
    );
    expect(r.output.recommendedRevisions.length).toBeGreaterThan(0);
  });

  it('aceita severity=none com arrays vazios', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const clean = JSON.stringify({
      overallSeverity: 'none',
      complianceSummary: 'Conteúdo limpo. Sem riscos detectados.',
      legalRisks: [],
      piiFlags: [],
      requiredDisclaimers: [],
      policyGaps: [],
      recommendedRevisions: [],
      followups: [],
    });
    const r = await runAgent(
      merchantComplianceAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(clean), memory, observability: new SilentProvider() },
    );
    expect(r.output.overallSeverity).toBe('none');
    expect(r.output.legalRisks).toHaveLength(0);
  });

  it('falha quando contentType inválido', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        merchantComplianceAgent,
        { ...baseInput, contentType: 'inexistente' as unknown as 'copy' },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('falha quando content muito curto', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        merchantComplianceAgent,
        { ...baseInput, content: 'curto' },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('compliancePath usa slug sanitizado', () => {
    const ts = complianceTimestamp(new Date('2026-05-25T12:00:00Z'));
    const p = compliancePath('Camiseta Cura Ansiedade!', ts);
    expect(p).toBe('compliance/camiseta-cura-ansiedade--20260525-120000.md');
  });

  it('renderCompliance inclui severity, legal risks e PII', () => {
    const md = renderCompliance(baseInput, JSON.parse(validJson), {
      runId: 'run-x',
      model: 'fake',
      costUsd: 0.0006,
      generatedAt: '2026-05-25T12:00:00Z',
      label: 'health-test',
    });
    expect(md).toContain('# Compliance review');
    expect(md).toContain('Overall severity:** HIGH');
    expect(md).toContain('## Legal risks');
    expect(md).toContain('## PII flags');
    expect(md).toContain('## Revisões recomendadas');
  });
});
