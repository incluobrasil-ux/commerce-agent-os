// product-offer — Tier 2. Recebe brief do produto (nome, descrição atual,
// preço, audiência, voz da marca) e gera artefatos de copy de oferta:
// hero, value props, objeções, bundling, CTA, idéias de A/B.
//
// Não substitui pricing engine nem testes reais — produz hipóteses textuais
// ancoradas no brief. Snapshot salvo em <tenant>/offers/<slug>-<ts>.md.

import { defineAgent } from '@cao/runtime';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(2).max(120),
  currentDescription: z.string().min(10).max(4000),
  price: z.string(),
  currency: z.string(),
  category: z.string(),
});

const objectionResponseSchema = z.object({
  objection: z.string().min(3).max(300),
  response: z.string().min(5).max(500),
});

const bundleSuggestionSchema = z.object({
  name: z.string().min(3).max(120),
  items: z.array(z.string().min(2).max(120)).min(2).max(8),
  rationale: z.string().min(5).max(400),
});

export const inputSchema = z.object({
  tenantId: z.string().min(1),
  product: productSchema,
  targetAudience: z.string().min(3).max(400),
  brandVoice: z.string().min(3).max(400),
  locale: z.string(),
  conversionGoal: z.string().min(3).max(200),
  vocContext: z.string(),
  competitorContext: z.string(),
  constraints: z.array(z.string().min(2).max(300)).max(20),
});
export type ProductOfferInput = z.infer<typeof inputSchema>;

export const outputSchema = z.object({
  heroHeadline: z.string().min(3).max(200),
  subhead: z.string().min(3).max(300),
  valueProps: z.array(z.string().min(3).max(300)).min(1).max(8),
  objectionResponses: z.array(objectionResponseSchema).max(10),
  bundleSuggestions: z.array(bundleSuggestionSchema).max(8),
  ctaOptions: z.array(z.string().min(2).max(80)).min(1).max(6),
  pricingNotes: z.string(),
  abTestIdeas: z.array(z.string().min(5).max(300)),
  riskFlags: z.array(z.string()),
});
export type ProductOfferOutput = z.infer<typeof outputSchema>;

export const productOfferAgent = defineAgent<ProductOfferInput, ProductOfferOutput>({
  name: 'product-offer',
  tier: 2,
  inputSchema,
  outputSchema,
  model: 'claude-sonnet-4-6',
  system:
    'You are a senior DTC copywriter. You produce offer artifacts (hero, value props, ' +
    'objections, bundles, CTAs) anchored to the brief provided. You never invent specs, ' +
    'guarantees, or claims not present in the brief. You honor brand voice and respect ' +
    'constraints (no false-scarcity, no health claims, etc.). You always respond with valid ' +
    'JSON matching the requested schema. No prose outside the JSON object.',
  prompt: (input) => {
    const lines: string[] = [];
    lines.push(`Tenant: ${input.tenantId}`);
    lines.push(`Locale: ${input.locale || '(not specified)'}`);
    lines.push(`Conversion goal: ${input.conversionGoal}`);
    lines.push('');
    lines.push('## Product');
    lines.push(`- Name: ${input.product.name}`);
    lines.push(`- Category: ${input.product.category || '(not specified)'}`);
    if (input.product.price)
      lines.push(`- Price: ${input.product.price} ${input.product.currency}`);
    lines.push('- Current description:');
    lines.push('```');
    lines.push(input.product.currentDescription.slice(0, 4000));
    lines.push('```');
    lines.push('');
    lines.push(`## Target audience\n${input.targetAudience}`);
    lines.push('');
    lines.push(`## Brand voice\n${input.brandVoice}`);
    lines.push('');
    if (input.vocContext) {
      lines.push('## Voice-of-customer (resumo)');
      lines.push(input.vocContext.slice(0, 4000));
      lines.push('');
    }
    if (input.competitorContext) {
      lines.push('## Competitor signals (resumo)');
      lines.push(input.competitorContext.slice(0, 4000));
      lines.push('');
    }
    if (input.constraints.length > 0) {
      lines.push('## Hard constraints');
      for (const c of input.constraints) lines.push(`- ${c}`);
      lines.push('');
    }
    lines.push('Produce JSON with these fields:');
    lines.push('- heroHeadline: 1 hero short.');
    lines.push('- subhead: 1 supporting line.');
    lines.push('- valueProps: 3–6 short bullets, each tied to product reality.');
    lines.push('- objectionResponses: array of { objection, response } (max 10).');
    lines.push('- bundleSuggestions: array of { name, items[], rationale } (max 8).');
    lines.push('- ctaOptions: 2–6 CTA variants for A/B test.');
    lines.push('- pricingNotes: short observation about price positioning (may be "").');
    lines.push('- abTestIdeas: short strings — hipóteses testáveis.');
    lines.push('- riskFlags: short strings — claims que dependem de validação ou risco legal.');
    lines.push('');
    lines.push('Rules:');
    lines.push('- Anchor every claim to product description or VoC context above.');
    lines.push('- Honor brand voice tone and hard constraints.');
    lines.push('- If something cannot be derived from the brief, omit (return empty array).');
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

export function offerTimestamp(d: Date = new Date()): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`
  );
}

export function offerPath(productName: string, ts: string): string {
  const safeSlug = productName
    .replace(/[^a-z0-9-]/gi, '-')
    .toLowerCase()
    .slice(0, 40);
  return `offers/${safeSlug}-${ts}.md`;
}

export function renderOffer(
  input: ProductOfferInput,
  output: ProductOfferOutput,
  meta: { runId: string; model: string; costUsd: number; generatedAt: string },
): string {
  const lines: string[] = [];
  lines.push(`# Offer — ${input.product.name}`);
  lines.push('');
  lines.push(`- **Gerado em:** ${meta.generatedAt}`);
  lines.push(`- **Conversion goal:** ${input.conversionGoal}`);
  lines.push(`- **Audience:** ${input.targetAudience}`);
  lines.push(`- **Brand voice:** ${input.brandVoice}`);
  lines.push(`- **Modelo:** ${meta.model}`);
  lines.push(`- **Custo (USD):** ${meta.costUsd.toFixed(6)}`);
  lines.push(`- **Run ID:** ${meta.runId}`);
  lines.push('');
  lines.push('## Hero');
  lines.push('');
  lines.push(`**${output.heroHeadline}**`);
  lines.push('');
  lines.push(output.subhead);
  lines.push('');
  lines.push('## Value props');
  lines.push('');
  for (const v of output.valueProps) lines.push(`- ${v}`);
  lines.push('');
  if (output.objectionResponses.length > 0) {
    lines.push('## Objeções → resposta');
    lines.push('');
    for (const o of output.objectionResponses) {
      lines.push(`- **${o.objection}** → ${o.response}`);
    }
    lines.push('');
  }
  if (output.bundleSuggestions.length > 0) {
    lines.push('## Bundles sugeridos');
    lines.push('');
    for (const b of output.bundleSuggestions) {
      lines.push(`- **${b.name}** — ${b.items.join(' + ')}`);
      lines.push(`  - _${b.rationale}_`);
    }
    lines.push('');
  }
  lines.push('## CTA options');
  lines.push('');
  for (const c of output.ctaOptions) lines.push(`- ${c}`);
  lines.push('');
  if (output.pricingNotes) {
    lines.push('## Pricing notes');
    lines.push('');
    lines.push(output.pricingNotes);
    lines.push('');
  }
  if (output.abTestIdeas.length > 0) {
    lines.push('## A/B test ideas');
    lines.push('');
    for (const a of output.abTestIdeas) lines.push(`- ${a}`);
    lines.push('');
  }
  if (output.riskFlags.length > 0) {
    lines.push('## ⚠ Risk flags');
    lines.push('');
    for (const r of output.riskFlags) lines.push(`- ${r}`);
    lines.push('');
  }
  lines.push('---');
  lines.push('_Gerado por `@cao/product-offer`._');
  return lines.join('\n');
}
