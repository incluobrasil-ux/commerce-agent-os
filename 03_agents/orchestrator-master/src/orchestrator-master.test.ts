import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CompleteFn } from '@cao/llm';
import { Memory } from '@cao/memory';
import { SilentProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { KNOWN_AGENTS, orchestratorMasterAgent } from './index.js';

let tmp = '';

beforeEach(async () => {
  tmp = await fs.mkdtemp(join(tmpdir(), 'orchestrator-test-'));
});

afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

function fakeComplete(text: string): CompleteFn {
  return async () => ({
    text,
    model: 'fake',
    usage: { inputTokens: 100, outputTokens: 60 },
    costUsd: 0.0001,
    durationMs: 8,
  });
}

const baseInput = {
  tenantId: '_t',
  objective: 'audit upstream e sintetizar findings',
  contextBrief: '',
  availableAgents: ['repo-auditor', 'audit-synthesizer'],
  constraints: [],
  maxSteps: 5,
  mode: 'plan' as const,
};

const validJson = JSON.stringify({
  route: [
    {
      agent: 'repo-auditor',
      purpose: 'Auditar repositório local e gerar relatório markdown',
      reason: 'Primeira camada — obtém findings determinísticos antes da síntese LLM',
    },
    {
      agent: 'audit-synthesizer',
      purpose: 'Sintetizar relatório em bullets executivos com risco',
      reason: 'Reduz output do auditor a algo apresentável ao stakeholder',
    },
  ],
  aggregatedSummary:
    'Rota em 2 etapas: auditor determinístico produz relatório, sintetizador resume para humano. Mínima viável.',
  artifacts: ['12_reports/audits/repo-auditor/<repo>.md'],
  risks: [],
  nextActions: ['Revisar relatório antes de aplicar mudanças no upstream'],
});

describe('orchestratorMasterAgent', () => {
  it('produz rota válida com 2 steps', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();

    const r = await runAgent(
      orchestratorMasterAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
    );

    expect(r.output.route).toHaveLength(2);
    expect(r.output.route[0]?.agent).toBe('repo-auditor');
    expect(r.output.route[1]?.agent).toBe('audit-synthesizer');
    expect(r.output.risks).toHaveLength(0);
  });

  it('aceita JSON envolto em ```json fences', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();

    const wrapped = `\`\`\`json\n${validJson}\n\`\`\``;
    const r = await runAgent(
      orchestratorMasterAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(wrapped), memory, observability: new SilentProvider() },
    );
    expect(r.output.route).toHaveLength(2);
  });

  it('aceita rota de 1 step com gap explicado em risks', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();

    const minimal = JSON.stringify({
      route: [
        {
          agent: 'audit-synthesizer',
          purpose: 'Sintetizar diagnóstico geral mesmo sem auditor disponível',
          reason: 'Único agente que pode oferecer síntese textual',
        },
      ],
      aggregatedSummary: 'Rota mínima — agente único cobre objetivo com limitação documentada.',
      artifacts: [],
      risks: ['Nenhum auditor disponível na lista; síntese pode ser superficial'],
      nextActions: ['Adicionar repo-auditor à lista quando disponível'],
    });

    const r = await runAgent(
      orchestratorMasterAgent,
      { ...baseInput, availableAgents: ['audit-synthesizer'] },
      { tenantId: '_t' },
      { complete: fakeComplete(minimal), memory, observability: new SilentProvider() },
    );
    expect(r.output.route).toHaveLength(1);
    expect(r.output.risks.length).toBeGreaterThan(0);
  });

  it('falha quando route vem com agente fora do schema (string vazia)', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();

    const badStep = JSON.stringify({
      route: [{ agent: '', purpose: 'x'.repeat(10), reason: 'r'.repeat(10) }],
      aggregatedSummary: 'a'.repeat(20),
      artifacts: [],
      risks: [],
      nextActions: [],
    });

    await expect(
      runAgent(
        orchestratorMasterAgent,
        baseInput,
        { tenantId: '_t' },
        { complete: fakeComplete(badStep), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('falha com objective < 5 chars (input schema)', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();

    await expect(
      runAgent(
        orchestratorMasterAgent,
        { ...baseInput, objective: 'a' },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('respeita mode=dispatch (mesmo output schema, comportamento idêntico ao plan)', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();

    const r = await runAgent(
      orchestratorMasterAgent,
      { ...baseInput, mode: 'dispatch' as const },
      { tenantId: '_t' },
      { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
    );
    expect(r.output.route).toHaveLength(2);
  });

  it('KNOWN_AGENTS contém os 6 agentes operacionais existentes', () => {
    expect(KNOWN_AGENTS).toContain('repo-auditor');
    expect(KNOWN_AGENTS).toContain('audit-synthesizer');
    expect(KNOWN_AGENTS).toContain('learning-memory-curation');
    expect(KNOWN_AGENTS).toContain('memory-context');
    expect(KNOWN_AGENTS).toContain('product-feed-seo');
    expect(KNOWN_AGENTS).toContain('catalog-feed-ops');
  });
});
