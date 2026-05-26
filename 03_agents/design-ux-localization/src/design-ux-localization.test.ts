import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CompleteFn } from '@cao/llm';
import { Memory } from '@cao/memory';
import { SilentProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { designPath, designTimestamp, designUxAgent, renderDesign } from './index.js';

let tmp = '';

beforeEach(async () => {
  tmp = await fs.mkdtemp(join(tmpdir(), 'design-ux-test-'));
});

afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

function fakeComplete(text: string): CompleteFn {
  return async () => ({
    text,
    model: 'fake',
    usage: { inputTokens: 350, outputTokens: 250 },
    costUsd: 0.0009,
    durationMs: 14,
  });
}

const baseInput = {
  tenantId: '_t',
  productOrCollection: 'camiseta-organica',
  scopeKind: 'product' as const,
  productSummary:
    'Camiseta 100% algodão orgânico, pigmento natural, costura reforçada. ' +
    'BRL 129, 4 cores, M-XL.',
  brandStyle: 'minimalista, terroso, tipografia sans humanista',
  targetMarkets: [
    { locale: 'pt-BR', currency: 'BRL', region: 'BR' },
    { locale: 'en-US', currency: 'USD', region: 'US' },
  ],
  conversionGoal: 'first purchase',
  accessibilityRequirements: ['contraste mínimo AA WCAG 2.1', 'alt text em todas as imagens'],
  constraints: ['sem claims de saúde'],
};

const validJson = JSON.stringify({
  pageBlueprint: [
    {
      section: 'hero',
      order: 1,
      purpose: 'capturar atenção',
      contentHint: 'shot do produto em uso',
    },
    {
      section: 'social-proof',
      order: 2,
      purpose: 'reduzir risco',
      contentHint: 'reviews + ratings',
    },
    {
      section: 'value-props',
      order: 3,
      purpose: 'racionalizar a compra',
      contentHint: '3 bullets ancorados no summary',
    },
    {
      section: 'specs',
      order: 4,
      purpose: 'reduzir dúvida sobre tamanho/material',
      contentHint: 'tabela compacta',
    },
    {
      section: 'faq',
      order: 5,
      purpose: 'cobrir 3-5 dúvidas comuns',
      contentHint: 'expansível',
    },
  ],
  localizedCopy: [
    {
      locale: 'pt-BR',
      currency: 'BRL',
      region: 'BR',
      title: 'Camiseta orgânica que dura',
      subtitle: 'Algodão 100% orgânico, costura reforçada.',
      ctaPrimary: 'Pegar a minha',
      ctaSecondary: 'Ver detalhes',
      trustLines: ['Frete em 1-3 dias úteis', 'Troca grátis em 30 dias'],
      notes: 'Tom próximo, evitar palavras importadas.',
    },
    {
      locale: 'en-US',
      currency: 'USD',
      region: 'US',
      title: 'The organic tee that lasts',
      subtitle: '100% organic cotton, reinforced stitch.',
      ctaPrimary: 'Get yours',
      ctaSecondary: 'See details',
      trustLines: ['Ships in 3-5 business days', '30-day free returns'],
      notes: 'Avoid health claims; keep tone direct.',
    },
  ],
  mediaBrief: {
    primaryShot: 'product worn in natural light, full body',
    supportingShots: ['close stitch detail', 'fabric texture macro'],
    preferredAspectRatios: ['4:5', '1:1'],
    altTextHints: ['Person wearing organic cotton t-shirt outdoors', 'Macro of reinforced stitch'],
  },
  uxNotes: ['Hero deve carregar abaixo de 2s em 3G', 'CTA primário sempre acima do fold no mobile'],
  accessibilityNotes: [
    'Contraste de CTA primário ≥ 4.5:1',
    'Foco visível em todos os elementos interativos',
  ],
  culturalFlags: ['Evitar superlativos em pt-BR — soa como hype'],
  riskFlags: ['"Dura para sempre" não pode ser usado sem dado de teste'],
});

describe('designUxAgent', () => {
  it('gera blueprint + copy localizado + media brief', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const r = await runAgent(
      designUxAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
    );
    expect(r.output.pageBlueprint.length).toBeGreaterThanOrEqual(3);
    expect(r.output.localizedCopy.length).toBe(2);
    expect(r.output.mediaBrief.preferredAspectRatios.length).toBeGreaterThan(0);
  });

  it('aceita JSON em ```json fences', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const wrapped = `\`\`\`json\n${validJson}\n\`\`\``;
    const r = await runAgent(
      designUxAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(wrapped), memory, observability: new SilentProvider() },
    );
    expect(r.output.uxNotes.length).toBeGreaterThan(0);
  });

  it('falha sem targetMarkets', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        designUxAgent,
        { ...baseInput, targetMarkets: [] },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('falha quando summary tem menos de 10 chars', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        designUxAgent,
        { ...baseInput, productSummary: 'curta' },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('designPath usa slug sanitizado', () => {
    const ts = designTimestamp(new Date('2026-08-15T12:00:00Z'));
    const p = designPath('Camiseta Orgânica!', ts);
    expect(p).toBe('design/camiseta-org-nica--20260815-120000.md');
  });

  it('renderDesign inclui blueprint, copy localizado e media brief', () => {
    const md = renderDesign(baseInput, JSON.parse(validJson), {
      runId: 'run-x',
      model: 'fake',
      costUsd: 0.0009,
      generatedAt: '2026-08-15T12:00:00Z',
    });
    expect(md).toContain('# Design / UX / Localization');
    expect(md).toContain('## Page blueprint');
    expect(md).toContain('## Localized copy');
    expect(md).toContain('## Media brief');
    expect(md).toContain('pt-BR');
    expect(md).toContain('en-US');
  });

  it('renderDesign ordena blueprint por order', () => {
    const out = JSON.parse(validJson);
    out.pageBlueprint = [
      { section: 'faq', order: 5, purpose: 'x', contentHint: 'x' },
      { section: 'hero', order: 1, purpose: 'y', contentHint: 'y' },
    ];
    const md = renderDesign(baseInput, out, {
      runId: 'r',
      model: 'fake',
      costUsd: 0,
      generatedAt: '2026-08-15T12:00:00Z',
    });
    const heroIdx = md.indexOf('hero');
    const faqIdx = md.indexOf('faq');
    expect(heroIdx).toBeLessThan(faqIdx);
  });
});
