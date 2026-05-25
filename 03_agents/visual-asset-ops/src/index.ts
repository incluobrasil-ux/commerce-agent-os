// visual-asset-ops — Tier 3. Recebe brief de produto + canal de uso e gera
// briefing visual estruturado: visual strategy, shot list com prompts de
// geração, style guide, do-not-include, usage notes, risk flags.
//
// Não gera imagem — apenas o brief. Integração com Higgsfield/MJ/etc fica
// no consumer. Persiste em <tenant>/visual-briefs/<slug>-<ts>.md.

import { defineAgent } from '@cao/runtime';
import { z } from 'zod';

const CHANNELS = [
  'pdp',
  'instagram',
  'tiktok',
  'meta-ads',
  'google-ads',
  'email',
  'other',
] as const;

const shotSchema = z.object({
  shotId: z.string().min(1).max(20),
  intent: z.string().min(5).max(300),
  prompt: z.string().min(20).max(1500),
  composition: z.string().min(5).max(400),
  lighting: z.string().min(3).max(300),
  camera: z.string().min(3).max(300),
  caption: z.string(),
});

export const inputSchema = z.object({
  tenantId: z.string().min(1),
  productName: z.string().min(2).max(120),
  productDescription: z.string().min(10).max(4000),
  brandStyle: z.string().min(3).max(800),
  audience: z.string().min(3).max(400),
  channel: z.enum(CHANNELS),
  locale: z.string(),
  mood: z.string(),
  constraints: z.array(z.string().min(2).max(300)).max(20),
  existingAssetsNotes: z.string(),
});
export type VisualAssetOpsInput = z.infer<typeof inputSchema>;

export const outputSchema = z.object({
  visualStrategy: z.string().min(10).max(2000),
  shotList: z.array(shotSchema).min(1).max(12),
  styleGuide: z.array(z.string().min(3).max(300)).max(20),
  paletteNotes: z.string(),
  doNotInclude: z.array(z.string().min(2).max(200)).max(20),
  usageNotes: z.string(),
  riskFlags: z.array(z.string()),
});
export type VisualAssetOpsOutput = z.infer<typeof outputSchema>;

export const visualAssetOpsAgent = defineAgent<VisualAssetOpsInput, VisualAssetOpsOutput>({
  name: 'visual-asset-ops',
  tier: 3,
  inputSchema,
  outputSchema,
  model: 'claude-sonnet-4-6',
  system:
    'You are a senior art director for e-commerce visuals. You receive a product brief ' +
    'and produce a structured visual brief: strategy, shot list with generation prompts ' +
    'ready for tools like Midjourney/Higgsfield, style guide, palette, and do-not-include. ' +
    'You DO NOT generate images — your output is a brief. You respect the channel (PDP, ' +
    'Instagram, TikTok, etc) and never produce prompts that would create unsafe, ' +
    'discriminatory, or misleading imagery. You always respond with valid JSON matching ' +
    'the schema. No prose outside the JSON object.',
  prompt: (input) => {
    const lines: string[] = [];
    lines.push(`Tenant: ${input.tenantId}`);
    lines.push(`Channel: ${input.channel}`);
    lines.push(`Locale: ${input.locale || '(not specified)'}`);
    if (input.mood) lines.push(`Mood: ${input.mood}`);
    lines.push('');
    lines.push('## Product');
    lines.push(`- Name: ${input.productName}`);
    lines.push('- Description:');
    lines.push('```');
    lines.push(input.productDescription.slice(0, 4000));
    lines.push('```');
    lines.push('');
    lines.push(`## Brand style\n${input.brandStyle}`);
    lines.push('');
    lines.push(`## Audience\n${input.audience}`);
    if (input.existingAssetsNotes) {
      lines.push('');
      lines.push(`## Existing assets\n${input.existingAssetsNotes.slice(0, 2000)}`);
    }
    if (input.constraints.length > 0) {
      lines.push('');
      lines.push('## Hard constraints');
      for (const c of input.constraints) lines.push(`- ${c}`);
    }
    lines.push('');
    lines.push('Produce JSON with these fields:');
    lines.push('- visualStrategy: 2–5 sentences resumindo a direção visual.');
    lines.push('- shotList: 3–8 shots, cada um com { shotId, intent, prompt, composition, ');
    lines.push('  lighting, camera, caption }. O prompt deve estar pronto para uma ');
    lines.push('  ferramenta de geração (Midjourney/Higgsfield/SDXL).');
    lines.push('- styleGuide: short strings — guidelines visuais (tom, vibe, referências).');
    lines.push('- paletteNotes: descreva paleta sugerida (cores, contraste).');
    lines.push('- doNotInclude: short strings — elementos a evitar (estoque genérico, etc).');
    lines.push('- usageNotes: como cada shot deve ser usado (hero, carousel, story).');
    lines.push(
      '- riskFlags: short strings — riscos visuais (claim implícito, modelos sem direitos).',
    );
    lines.push('');
    lines.push('Rules:');
    lines.push('- Os prompts devem refletir o produto descrito (sem inventar atributos).');
    lines.push('- Respeite hard constraints e limitações do canal.');
    lines.push('- Não gere prompts com pessoas reais nomeadas nem cenas de risco.');
    lines.push('- Respond with the JSON object only. No code fences, no commentary.');
    return lines.join('\n');
  },
  parseOutput: (text) => {
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/i, '');
    return JSON.parse(cleaned);
  },
});

export function visualTimestamp(d: Date = new Date()): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`
  );
}

export function visualPath(productName: string, channel: string, ts: string): string {
  const safeSlug = `${productName}-${channel}`
    .replace(/[^a-z0-9-]/gi, '-')
    .toLowerCase()
    .slice(0, 50);
  return `visual-briefs/${safeSlug}-${ts}.md`;
}

export function renderVisualBrief(
  input: VisualAssetOpsInput,
  output: VisualAssetOpsOutput,
  meta: { runId: string; model: string; costUsd: number; generatedAt: string },
): string {
  const lines: string[] = [];
  lines.push(`# Visual brief — ${input.productName} (${input.channel})`);
  lines.push('');
  lines.push(`- **Gerado em:** ${meta.generatedAt}`);
  lines.push(`- **Channel:** ${input.channel}`);
  if (input.mood) lines.push(`- **Mood:** ${input.mood}`);
  lines.push(`- **Audience:** ${input.audience}`);
  lines.push(`- **Modelo:** ${meta.model}`);
  lines.push(`- **Custo (USD):** ${meta.costUsd.toFixed(6)}`);
  lines.push(`- **Run ID:** ${meta.runId}`);
  lines.push('');
  lines.push('## Visual strategy');
  lines.push('');
  lines.push(output.visualStrategy);
  lines.push('');
  lines.push('## Shot list');
  lines.push('');
  for (const s of output.shotList) {
    lines.push(`### ${s.shotId} — ${s.intent}`);
    lines.push('');
    lines.push('```');
    lines.push(s.prompt);
    lines.push('```');
    lines.push(`- **Composition:** ${s.composition}`);
    lines.push(`- **Lighting:** ${s.lighting}`);
    lines.push(`- **Camera:** ${s.camera}`);
    if (s.caption) lines.push(`- **Caption:** ${s.caption}`);
    lines.push('');
  }
  if (output.styleGuide.length > 0) {
    lines.push('## Style guide');
    lines.push('');
    for (const g of output.styleGuide) lines.push(`- ${g}`);
    lines.push('');
  }
  if (output.paletteNotes) {
    lines.push('## Palette');
    lines.push('');
    lines.push(output.paletteNotes);
    lines.push('');
  }
  if (output.doNotInclude.length > 0) {
    lines.push('## ⛔ Do not include');
    lines.push('');
    for (const d of output.doNotInclude) lines.push(`- ${d}`);
    lines.push('');
  }
  if (output.usageNotes) {
    lines.push('## Usage notes');
    lines.push('');
    lines.push(output.usageNotes);
    lines.push('');
  }
  if (output.riskFlags.length > 0) {
    lines.push('## ⚠ Risk flags');
    lines.push('');
    for (const r of output.riskFlags) lines.push(`- ${r}`);
    lines.push('');
  }
  lines.push('---');
  lines.push('_Gerado por `@cao/visual-asset-ops`. Briefing para humano/ferramenta de geração._');
  return lines.join('\n');
}
