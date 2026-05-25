import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CompleteFn } from '@cao/llm';
import { Memory } from '@cao/memory';
import { SilentProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { governanceRiskQaAgent, qaPath, qaTimestamp, renderQa } from './index.js';

let tmp = '';

beforeEach(async () => {
  tmp = await fs.mkdtemp(join(tmpdir(), 'governance-risk-qa-test-'));
});

afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

function fakeComplete(text: string): CompleteFn {
  return async () => ({
    text,
    model: 'fake',
    usage: { inputTokens: 500, outputTokens: 220 },
    costUsd: 0.0008,
    durationMs: 17,
  });
}

const baseInput = {
  tenantId: '_t',
  agentName: 'product-offer',
  agentOutput: JSON.stringify({
    heroHeadline: 'A camiseta que dura mais que o discurso.',
    valueProps: ['Algodão orgânico', 'Costura reforçada'],
    riskFlags: [],
  }),
  context: 'PDP de camiseta. Audiência sustentável, política contra hype.',
  sensitivity: 'medium' as const,
  policyNotes: 'Marca evita claims de saúde. Evita gatilhos de escassez falsa.',
  publishingChannel: 'pdp',
};

const passJson = JSON.stringify({
  verdict: 'pass',
  rationale: 'Output consistente com brand voice. Sem claims de saúde nem PII.',
  riskFlags: [],
  qualityConcerns: [],
  factualityChecks: [],
  suggestedFollowups: [],
  blockingReasons: [],
});

const warnJson = JSON.stringify({
  verdict: 'warn',
  rationale: 'Output usa adjetivo "dura mais" sem suporte — humano deveria verificar.',
  riskFlags: [
    {
      category: 'unsupported-claim',
      description: 'Claim de durabilidade sem dado de teste.',
      severity: 'low',
    },
  ],
  qualityConcerns: ['Faltam dados que sustentem "dura mais".'],
  factualityChecks: [
    {
      claim: 'A camiseta dura mais',
      needsVerification: true,
      suggestedSource: 'Teste de lavagem em ciclo do laboratório interno.',
    },
  ],
  suggestedFollowups: ['Anexar resultado de teste de durabilidade ou suavizar claim.'],
  blockingReasons: [],
});

const blockJson = JSON.stringify({
  verdict: 'block',
  rationale:
    'Output contém claim de cura ("camiseta cura ansiedade"). Bloqueio antes da publicação.',
  riskFlags: [
    {
      category: 'health-claim',
      description: 'Claim de cura sem base científica.',
      severity: 'high',
    },
  ],
  qualityConcerns: [],
  factualityChecks: [],
  suggestedFollowups: ['Remover claim antes de publicar.'],
  blockingReasons: ['Claim de cura sem base científica viola CDC e ANVISA.'],
});

describe('governanceRiskQaAgent', () => {
  it('emite verdict=pass para output benigno', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const r = await runAgent(
      governanceRiskQaAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(passJson), memory, observability: new SilentProvider() },
    );
    expect(r.output.verdict).toBe('pass');
    expect(r.output.blockingReasons).toHaveLength(0);
  });

  it('emite verdict=warn quando há claim sem base', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const r = await runAgent(
      governanceRiskQaAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(warnJson), memory, observability: new SilentProvider() },
    );
    expect(r.output.verdict).toBe('warn');
    expect(r.output.factualityChecks.length).toBeGreaterThan(0);
    expect(r.output.suggestedFollowups.length).toBeGreaterThan(0);
  });

  it('emite verdict=block com blockingReasons populadas', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const r = await runAgent(
      governanceRiskQaAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(blockJson), memory, observability: new SilentProvider() },
    );
    expect(r.output.verdict).toBe('block');
    expect(r.output.blockingReasons.length).toBeGreaterThan(0);
    expect(r.output.riskFlags[0]?.severity).toBe('high');
  });

  it('aceita JSON em ```json fences', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const wrapped = `\`\`\`json\n${passJson}\n\`\`\``;
    const r = await runAgent(
      governanceRiskQaAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(wrapped), memory, observability: new SilentProvider() },
    );
    expect(r.output.verdict).toBe('pass');
  });

  it('falha quando agentName ausente', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        governanceRiskQaAgent,
        { ...baseInput, agentName: 'x' },
        { tenantId: '_t' },
        { complete: fakeComplete(passJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('falha quando sensitivity inválida', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        governanceRiskQaAgent,
        { ...baseInput, sensitivity: 'extreme' as unknown as 'low' },
        { tenantId: '_t' },
        { complete: fakeComplete(passJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('qaPath usa slug sanitizado', () => {
    const ts = qaTimestamp(new Date('2026-05-25T12:00:00Z'));
    const p = qaPath('product-offer', ts);
    expect(p).toBe('governance-qa/product-offer-20260525-120000.md');
  });

  it('renderQa inclui verdict, rationale e blocking reasons quando block', () => {
    const md = renderQa(baseInput, JSON.parse(blockJson), {
      runId: 'run-x',
      model: 'fake',
      costUsd: 0.0008,
      generatedAt: '2026-05-25T12:00:00Z',
    });
    expect(md).toContain('# Governance QA');
    expect(md).toContain('Verdict:** ⛔ BLOCK');
    expect(md).toContain('## ⛔ Blocking reasons');
    expect(md).toContain('## Risk flags');
  });
});
