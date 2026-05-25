import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CompleteFn } from '@cao/llm';
import { Memory } from '@cao/memory';
import { SilentProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderVisualBrief, visualAssetOpsAgent, visualPath, visualTimestamp } from './index.js';

let tmp = '';

beforeEach(async () => {
  tmp = await fs.mkdtemp(join(tmpdir(), 'visual-asset-ops-test-'));
});

afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

function fakeComplete(text: string): CompleteFn {
  return async () => ({
    text,
    model: 'fake',
    usage: { inputTokens: 350, outputTokens: 200 },
    costUsd: 0.0007,
    durationMs: 16,
  });
}

const baseInput = {
  tenantId: '_t',
  productName: 'Camiseta-Acme-Organica',
  productDescription:
    'Camiseta 100% algodão orgânico, modelagem regular, gola redonda. ' +
    'Tingimento natural. Costuras reforçadas.',
  brandStyle: 'limpo, próximo, sem hype — fotografia natural, paleta terrosa',
  audience: 'consumidor consciente 25-40 anos',
  channel: 'pdp' as const,
  locale: 'pt-BR',
  mood: 'manhã de domingo, café fresco',
  constraints: ['sem pessoas com nome reconhecido', 'sem cenas de risco'],
  existingAssetsNotes: 'Logo em SVG. Foto de bolso já produzida.',
};

const validJson = JSON.stringify({
  visualStrategy:
    'Direção minimalista, terrosa, com luz natural. Sem pessoas reconhecidas. ' +
    'Foco no caimento e textura do tecido. Carrossel PDP com 5 takes.',
  shotList: [
    {
      shotId: 'S1',
      intent: 'hero shot — produto em fundo claro',
      prompt:
        'minimal product photo, organic cotton t-shirt on neutral linen background, ' +
        'natural soft window light, shallow depth of field, earthy palette, no people',
      composition: 'centered, rule-of-thirds, generous negative space',
      lighting: 'soft window light, warm tone, 5500K',
      camera: '50mm prime, f/2.8, eye-level',
      caption: 'Algodão orgânico — luz natural',
    },
    {
      shotId: 'S2',
      intent: 'detalhe da costura',
      prompt:
        'macro detail of reinforced side stitching on organic cotton t-shirt, ' +
        'natural fiber texture visible, soft directional light, earthy tones',
      composition: 'macro tight, 1:1 ratio',
      lighting: 'soft directional, 4500K',
      camera: '90mm macro, f/4',
      caption: 'Costura reforçada',
    },
    {
      shotId: 'S3',
      intent: 'lifestyle estático sem pessoa',
      prompt:
        'organic cotton t-shirt folded on wooden table next to ceramic coffee mug, ' +
        'morning light, terracotta palette, no people, lifestyle still life',
      composition: 'overhead 45 deg angle, balanced composition',
      lighting: 'morning window light',
      camera: '35mm, f/4',
      caption: 'Manhã de domingo',
    },
  ],
  styleGuide: [
    'Sempre luz natural. Sem flash.',
    'Paleta terrosa: marrom, bege, verde-musgo.',
    'Tipografia simples nos overlays — peso regular.',
  ],
  paletteNotes: 'Terracota, bege quente, verde-musgo apagado. Sem cores saturadas.',
  doNotInclude: [
    'Pessoas com nome reconhecido',
    'Cenas de risco ou claims médicos visuais',
    'Estoque genérico de outros produtos',
  ],
  usageNotes: 'S1 como hero do PDP. S2-S3 no carrossel. Story Instagram pode usar S3 vertical.',
  riskFlags: [],
});

describe('visualAssetOpsAgent', () => {
  it('gera shot list com prompts para tools de geração', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const r = await runAgent(
      visualAssetOpsAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
    );
    expect(r.output.shotList.length).toBeGreaterThanOrEqual(1);
    expect(r.output.shotList[0]?.prompt.length).toBeGreaterThan(20);
    expect(r.output.doNotInclude.length).toBeGreaterThan(0);
  });

  it('aceita JSON em ```json fences', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    const wrapped = `\`\`\`json\n${validJson}\n\`\`\``;
    const r = await runAgent(
      visualAssetOpsAgent,
      baseInput,
      { tenantId: '_t' },
      { complete: fakeComplete(wrapped), memory, observability: new SilentProvider() },
    );
    expect(r.output.shotList.length).toBe(3);
  });

  it('falha quando channel inválido', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        visualAssetOpsAgent,
        { ...baseInput, channel: 'whatsapp' as unknown as 'pdp' },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('falha quando productDescription muito curta', async () => {
    const memory = new Memory({ vaultRoot: tmp, tenantId: '_t' });
    await memory.ensureBaseDir();
    await expect(
      runAgent(
        visualAssetOpsAgent,
        { ...baseInput, productDescription: 'curta' },
        { tenantId: '_t' },
        { complete: fakeComplete(validJson), memory, observability: new SilentProvider() },
      ),
    ).rejects.toThrow(/Validation failed/);
  });

  it('visualPath combina produto + canal + sanitização', () => {
    const ts = visualTimestamp(new Date('2026-05-25T12:00:00Z'));
    const p = visualPath('Camiseta Acme!', 'instagram', ts);
    expect(p).toBe('visual-briefs/camiseta-acme--instagram-20260525-120000.md');
  });

  it('renderVisualBrief inclui shot list e doNotInclude', () => {
    const md = renderVisualBrief(baseInput, JSON.parse(validJson), {
      runId: 'run-x',
      model: 'fake',
      costUsd: 0.0007,
      generatedAt: '2026-05-25T12:00:00Z',
    });
    expect(md).toContain('# Visual brief');
    expect(md).toContain('## Visual strategy');
    expect(md).toContain('## Shot list');
    expect(md).toContain('### S1 — hero shot');
    expect(md).toContain('## ⛔ Do not include');
  });
});
