// design-ux-localization — Tier 2. Recebe produto/coleção + mercados alvo
// e produz: (a) blueprint da página (PDP) com seções/blocos, (b) microcopy
// localizado por mercado, (c) media brief para creative-copy-assets, (d)
// notas de UX/acessibilidade/clarity.
//
// Snapshot salvo em <tenant>/design/<product-slug>-<ts>.md.

import { defineAgent } from '@cao/runtime';
import { z } from 'zod';

// Limites generosos para acomodar análises detalhadas do Claude Sonnet
// (mesmo problema observado em merchant-compliance — schemas apertados
// causavam Validation failed mesmo com output bem-formado).
const blockSchema = z.object({
  section: z.string().min(2).max(120),
  order: z.number().int().min(1).max(20),
  purpose: z.string().min(3).max(800),
  contentHint: z.string().min(3).max(1500),
});

const localeCopySchema = z.object({
  locale: z.string().min(2).max(20),
  currency: z.string().min(2).max(8),
  region: z.string(),
  title: z.string().min(2).max(400),
  subtitle: z.string(),
  ctaPrimary: z.string().min(2).max(200),
  ctaSecondary: z.string(),
  trustLines: z.array(z.string().min(2).max(400)).max(12),
  notes: z.string(),
});

const mediaBriefSchema = z.object({
  primaryShot: z.string().min(3).max(800),
  supportingShots: z.array(z.string().min(3).max(800)).max(12),
  preferredAspectRatios: z.array(z.string().min(2).max(40)).max(12),
  altTextHints: z.array(z.string().min(3).max(400)).max(12),
});

export const inputSchema = z.object({
  tenantId: z.string().min(1),
  productOrCollection: z.string().min(2).max(120),
  scopeKind: z.enum(['product', 'collection']),
  productSummary: z.string().min(10).max(4000),
  brandStyle: z.string().min(3).max(800),
  targetMarkets: z
    .array(
      z.object({
        locale: z.string().min(2).max(20),
        currency: z.string().min(2).max(8),
        region: z.string().min(2).max(60),
      }),
    )
    .min(1)
    .max(10),
  conversionGoal: z.string().min(3).max(200),
  accessibilityRequirements: z.array(z.string().min(2).max(300)).max(20),
  constraints: z.array(z.string().min(2).max(300)).max(20),
});
export type DesignUxInput = z.infer<typeof inputSchema>;

export const outputSchema = z.object({
  pageBlueprint: z.array(blockSchema).min(1).max(20),
  localizedCopy: z.array(localeCopySchema).min(1).max(10),
  mediaBrief: mediaBriefSchema,
  uxNotes: z.array(z.string().min(3).max(800)).max(20),
  accessibilityNotes: z.array(z.string().min(3).max(800)).max(20),
  culturalFlags: z.array(z.string()),
  riskFlags: z.array(z.string()),
});
export type DesignUxOutput = z.infer<typeof outputSchema>;

export const designUxAgent = defineAgent<DesignUxInput, DesignUxOutput>({
  name: 'design-ux-localization',
  tier: 2,
  inputSchema,
  outputSchema,
  model: 'claude-sonnet-4-6',
  system:
    'You are a senior product UX + localization lead. You produce a PDP/collection blueprint, ' +
    'localized microcopy per market and a media brief — anchored to the product summary, brand ' +
    'style and target markets. You never invent product capabilities or claims not in the ' +
    'summary. You honor locale conventions (currency format, formal/informal address, RTL hints ' +
    'if applicable). You respond with valid JSON matching the schema. No prose outside JSON.',
  prompt: (input) => {
    const lines: string[] = [];
    lines.push(`Tenant: ${input.tenantId}`);
    lines.push(`Scope: ${input.scopeKind} — ${input.productOrCollection}`);
    lines.push(`Conversion goal: ${input.conversionGoal}`);
    lines.push('');
    lines.push('## Product/collection summary');
    lines.push(input.productSummary.slice(0, 4000));
    lines.push('');
    lines.push(`## Brand style\n${input.brandStyle}`);
    lines.push('');
    lines.push('## Target markets');
    for (const m of input.targetMarkets) {
      lines.push(`- ${m.locale} · ${m.currency} · ${m.region}`);
    }
    lines.push('');
    if (input.accessibilityRequirements.length > 0) {
      lines.push('## Accessibility requirements');
      for (const a of input.accessibilityRequirements) lines.push(`- ${a}`);
      lines.push('');
    }
    if (input.constraints.length > 0) {
      lines.push('## Hard constraints');
      for (const c of input.constraints) lines.push(`- ${c}`);
      lines.push('');
    }
    lines.push('Produce JSON with these fields:');
    lines.push(
      '- pageBlueprint: array of { section, order, purpose, contentHint } — 4-10 blocos ' +
        'cobrindo hero, prova, valor, especificações, FAQ, CTA final.',
    );
    lines.push(
      '- localizedCopy: array (1 per locale) of { locale, currency, region, title, subtitle, ' +
        'ctaPrimary, ctaSecondary, trustLines[], notes }. Adapt tone and convention to locale.',
    );
    lines.push(
      '- mediaBrief: { primaryShot, supportingShots[], preferredAspectRatios[], altTextHints[] }.',
    );
    lines.push('- uxNotes: itens curtos sobre hierarquia, foco, microcopy.');
    lines.push('- accessibilityNotes: contraste, alt text, ordem de leitura, navegação teclado.');
    lines.push('- culturalFlags: avisos culturais/sociais por mercado (vazio se não aplicar).');
    lines.push('- riskFlags: claims legais, símbolos, formato de preço que precisam revisão.');
    lines.push('');
    lines.push('Rules:');
    lines.push('- Anchor every block to product summary + brand style.');
    lines.push('- Honor locale conventions (currency symbol/position, address formality).');
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

export function designTimestamp(d: Date = new Date()): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`
  );
}

export function designPath(productOrCollection: string, ts: string): string {
  const safe = productOrCollection
    .replace(/[^a-z0-9-]/gi, '-')
    .toLowerCase()
    .slice(0, 40);
  return `design/${safe}-${ts}.md`;
}

export function renderDesign(
  input: DesignUxInput,
  output: DesignUxOutput,
  meta: { runId: string; model: string; costUsd: number; generatedAt: string },
): string {
  const lines: string[] = [];
  lines.push(`# Design / UX / Localization — ${input.productOrCollection}`);
  lines.push('');
  lines.push(`- **Scope:** ${input.scopeKind}`);
  lines.push(`- **Conversion goal:** ${input.conversionGoal}`);
  lines.push(`- **Markets:** ${input.targetMarkets.map((m) => m.locale).join(', ')}`);
  lines.push(`- **Tenant:** ${input.tenantId}`);
  lines.push(`- **Gerado em:** ${meta.generatedAt}`);
  lines.push(`- **Modelo:** ${meta.model}`);
  lines.push(`- **Custo (USD):** ${meta.costUsd.toFixed(6)}`);
  lines.push(`- **Run ID:** ${meta.runId}`);
  lines.push('');
  lines.push('## Page blueprint');
  lines.push('');
  const sorted = [...output.pageBlueprint].sort((a, b) => a.order - b.order);
  for (const b of sorted) {
    lines.push(`${b.order}. **${b.section}** — ${b.purpose}`);
    lines.push(`   - _Content:_ ${b.contentHint}`);
  }
  lines.push('');
  lines.push('## Localized copy');
  lines.push('');
  for (const l of output.localizedCopy) {
    lines.push(`### ${l.locale} · ${l.currency} · ${l.region || '—'}`);
    lines.push('');
    lines.push(`- **Title:** ${l.title}`);
    if (l.subtitle) lines.push(`- **Subtitle:** ${l.subtitle}`);
    lines.push(`- **CTA primário:** ${l.ctaPrimary}`);
    if (l.ctaSecondary) lines.push(`- **CTA secundário:** ${l.ctaSecondary}`);
    if (l.trustLines.length > 0) {
      lines.push('- **Trust lines:**');
      for (const t of l.trustLines) lines.push(`  - ${t}`);
    }
    if (l.notes) lines.push(`- **Notes:** ${l.notes}`);
    lines.push('');
  }
  lines.push('## Media brief');
  lines.push('');
  lines.push(`- **Primary shot:** ${output.mediaBrief.primaryShot}`);
  if (output.mediaBrief.supportingShots.length > 0) {
    lines.push('- **Supporting shots:**');
    for (const s of output.mediaBrief.supportingShots) lines.push(`  - ${s}`);
  }
  if (output.mediaBrief.preferredAspectRatios.length > 0) {
    lines.push(`- **Aspect ratios:** ${output.mediaBrief.preferredAspectRatios.join(', ')}`);
  }
  if (output.mediaBrief.altTextHints.length > 0) {
    lines.push('- **Alt text hints:**');
    for (const a of output.mediaBrief.altTextHints) lines.push(`  - ${a}`);
  }
  lines.push('');
  if (output.uxNotes.length > 0) {
    lines.push('## UX notes');
    lines.push('');
    for (const n of output.uxNotes) lines.push(`- ${n}`);
    lines.push('');
  }
  if (output.accessibilityNotes.length > 0) {
    lines.push('## Accessibility');
    lines.push('');
    for (const n of output.accessibilityNotes) lines.push(`- ${n}`);
    lines.push('');
  }
  if (output.culturalFlags.length > 0) {
    lines.push('## ⚠ Cultural flags');
    lines.push('');
    for (const c of output.culturalFlags) lines.push(`- ${c}`);
    lines.push('');
  }
  if (output.riskFlags.length > 0) {
    lines.push('## ⚠ Risk flags');
    lines.push('');
    for (const r of output.riskFlags) lines.push(`- ${r}`);
    lines.push('');
  }
  lines.push('---');
  lines.push('_Gerado por `@cao/design-ux-localization`._');
  return lines.join('\n');
}
