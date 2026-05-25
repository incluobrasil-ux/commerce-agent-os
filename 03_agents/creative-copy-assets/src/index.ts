// creative-copy-assets — Tier 2. Recebe brief de campanha (tema, audiência,
// canais, voz, formatos) e produz variantes de copy por canal/formato + brief
// visual (não chama provedor de mídia — produz instruções).
//
// Snapshot salvo em <tenant>/creative/<campaign-slug>-<ts>.md.

import { defineAgent } from '@cao/runtime';
import { z } from 'zod';

const variantSchema = z.object({
  channel: z.string().min(2).max(60),
  format: z.string().min(2).max(60),
  locale: z.string(),
  headline: z.string().min(2).max(200),
  body: z.string().min(2).max(1500),
  cta: z.string().min(2).max(120),
  estCharCount: z.number().int().nonnegative(),
});

const visualBriefSchema = z.object({
  mood: z.string().min(2).max(200),
  paletteHint: z.string().min(2).max(200),
  motifs: z.array(z.string().min(2).max(120)).max(10),
  shotIdeas: z.array(z.string().min(2).max(300)).max(10),
  aspectRatios: z.array(z.string().min(2).max(20)).max(8),
});

export const inputSchema = z.object({
  tenantId: z.string().min(1),
  campaignName: z.string().min(2).max(120),
  theme: z.string().min(3).max(400),
  audience: z.string().min(3).max(400),
  brandVoice: z.string().min(3).max(400),
  offerSummary: z.string().min(3).max(2000),
  channels: z.array(z.string().min(2).max(60)).min(1).max(12),
  formats: z.array(z.string().min(2).max(60)).min(1).max(12),
  locales: z.array(z.string().min(2).max(20)).min(1).max(8),
  constraints: z.array(z.string().min(2).max(300)).max(20),
});
export type CreativeCopyInput = z.infer<typeof inputSchema>;

export const outputSchema = z.object({
  variants: z.array(variantSchema).min(1).max(40),
  ctaPool: z.array(z.string().min(2).max(120)).max(12),
  visualBrief: visualBriefSchema,
  reviewerChecklist: z.array(z.string().min(3).max(300)).max(20),
  riskFlags: z.array(z.string()),
});
export type CreativeCopyOutput = z.infer<typeof outputSchema>;

export const creativeCopyAgent = defineAgent<CreativeCopyInput, CreativeCopyOutput>({
  name: 'creative-copy-assets',
  tier: 2,
  inputSchema,
  outputSchema,
  model: 'claude-sonnet-4-6',
  system:
    'You are a senior DTC creative lead. You produce copy variants per channel/format/locale ' +
    'plus a visual brief — anchored to the campaign theme, offer summary and brand voice. ' +
    'You never invent product specs, claims or guarantees not in the offer summary. You honor ' +
    'brand voice and channel norms (e.g., shorter for ads, longer for email). You always ' +
    'respond with valid JSON matching the requested schema. No prose outside JSON.',
  prompt: (input) => {
    const lines: string[] = [];
    lines.push(`Tenant: ${input.tenantId}`);
    lines.push(`Campaign: ${input.campaignName}`);
    lines.push(`Theme: ${input.theme}`);
    lines.push('');
    lines.push(`## Audience\n${input.audience}`);
    lines.push('');
    lines.push(`## Brand voice\n${input.brandVoice}`);
    lines.push('');
    lines.push(`## Offer summary\n${input.offerSummary}`);
    lines.push('');
    lines.push(`## Channels\n- ${input.channels.join('\n- ')}`);
    lines.push('');
    lines.push(`## Formats\n- ${input.formats.join('\n- ')}`);
    lines.push('');
    lines.push(`## Locales\n- ${input.locales.join('\n- ')}`);
    lines.push('');
    if (input.constraints.length > 0) {
      lines.push('## Hard constraints');
      for (const c of input.constraints) lines.push(`- ${c}`);
      lines.push('');
    }
    lines.push('Produce JSON with these fields:');
    lines.push(
      '- variants: array of { channel, format, locale, headline, body, cta, estCharCount }. ' +
        'Cover at least 1 variant per (channel × locale) pair. Respect channel constraints ' +
        '(e.g., ad headlines ≤ 60 chars, email body up to ~800 chars).',
    );
    lines.push('- ctaPool: 4-8 CTA variants for A/B testing.');
    lines.push(
      '- visualBrief: { mood, paletteHint, motifs[], shotIdeas[], aspectRatios[] }. ' +
        'Use aspectRatios like "1:1", "4:5", "9:16", "16:9".',
    );
    lines.push('- reviewerChecklist: short items a human reviewer should validate before launch.');
    lines.push('- riskFlags: short strings — claims/copy that need legal or brand review.');
    lines.push('');
    lines.push('Rules:');
    lines.push('- Anchor every copy to offer summary + audience above.');
    lines.push('- Honor brand voice + hard constraints in every variant.');
    lines.push('- estCharCount should approximate len(headline) + len(body).');
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

export function creativeTimestamp(d: Date = new Date()): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`
  );
}

export function creativePath(campaignName: string, ts: string): string {
  const safe = campaignName
    .replace(/[^a-z0-9-]/gi, '-')
    .toLowerCase()
    .slice(0, 40);
  return `creative/${safe}-${ts}.md`;
}

export function renderCreative(
  input: CreativeCopyInput,
  output: CreativeCopyOutput,
  meta: { runId: string; model: string; costUsd: number; generatedAt: string },
): string {
  const lines: string[] = [];
  lines.push(`# Creative — ${input.campaignName}`);
  lines.push('');
  lines.push(`- **Theme:** ${input.theme}`);
  lines.push(`- **Audience:** ${input.audience}`);
  lines.push(`- **Locales:** ${input.locales.join(', ')}`);
  lines.push(`- **Channels:** ${input.channels.join(', ')}`);
  lines.push(`- **Tenant:** ${input.tenantId}`);
  lines.push(`- **Gerado em:** ${meta.generatedAt}`);
  lines.push(`- **Modelo:** ${meta.model}`);
  lines.push(`- **Custo (USD):** ${meta.costUsd.toFixed(6)}`);
  lines.push(`- **Run ID:** ${meta.runId}`);
  lines.push('');
  lines.push(`## Variantes (${output.variants.length})`);
  lines.push('');
  for (const v of output.variants) {
    lines.push(`### ${v.channel} · ${v.format} · ${v.locale}`);
    lines.push('');
    lines.push(`**${v.headline}**`);
    lines.push('');
    lines.push(v.body);
    lines.push('');
    lines.push(`_CTA:_ ${v.cta} _(~${v.estCharCount} chars)_`);
    lines.push('');
  }
  if (output.ctaPool.length > 0) {
    lines.push('## CTA pool (A/B)');
    lines.push('');
    for (const c of output.ctaPool) lines.push(`- ${c}`);
    lines.push('');
  }
  lines.push('## Visual brief');
  lines.push('');
  lines.push(`- **Mood:** ${output.visualBrief.mood}`);
  lines.push(`- **Palette hint:** ${output.visualBrief.paletteHint}`);
  if (output.visualBrief.motifs.length > 0) {
    lines.push(`- **Motifs:** ${output.visualBrief.motifs.join(', ')}`);
  }
  if (output.visualBrief.aspectRatios.length > 0) {
    lines.push(`- **Aspect ratios:** ${output.visualBrief.aspectRatios.join(', ')}`);
  }
  if (output.visualBrief.shotIdeas.length > 0) {
    lines.push('- **Shot ideas:**');
    for (const s of output.visualBrief.shotIdeas) lines.push(`  - ${s}`);
  }
  lines.push('');
  if (output.reviewerChecklist.length > 0) {
    lines.push('## Reviewer checklist');
    lines.push('');
    for (const r of output.reviewerChecklist) lines.push(`- [ ] ${r}`);
    lines.push('');
  }
  if (output.riskFlags.length > 0) {
    lines.push('## ⚠ Risk flags');
    lines.push('');
    for (const r of output.riskFlags) lines.push(`- ${r}`);
    lines.push('');
  }
  lines.push('---');
  lines.push('_Gerado por `@cao/creative-copy-assets`._');
  return lines.join('\n');
}
