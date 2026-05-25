// reviews-ops — Tier 1. Ingere reviews JSON simples e extrai voice-of-customer
// estruturada. Salva resultado em <tenant>/voc/<slug>-<timestamp>.md.
//
// Provider de reviews (Judge.me etc.) fica adiado para ADR-0012 — aqui o agente
// recebe JSON inline ou caminho de arquivo, sem integração externa.
//
// Design referenciado de feedgen (01_upstreams/feedgen, Apache-2.0): geração
// estruturada com LLM a partir de fonte textual. Adaptado, não copiado.

import { defineAgent } from '@cao/runtime';
import { z } from 'zod';

const reviewItemSchema = z.object({
  rating: z.number().min(1).max(5),
  text: z.string().min(2),
  source: z.string(),
  date: z.string(),
});
export type ReviewItem = z.infer<typeof reviewItemSchema>;

export const inputSchema = z.object({
  tenantId: z.string().min(1),
  reviews: z.array(reviewItemSchema).min(2).max(200),
  productName: z.string(),
  locale: z.string(),
  analysisGoal: z.string().min(5).max(300),
});
export type ReviewsOpsInput = z.infer<typeof inputSchema>;

export const outputSchema = z.object({
  sampleSize: z.number().int().min(0),
  averageRating: z.number().min(0).max(5),
  topThemes: z.array(z.string().min(3).max(200)),
  painPoints: z.array(z.string().min(3).max(300)),
  desiredOutcomes: z.array(z.string().min(3).max(300)),
  quoteCandidates: z.array(z.string().min(5).max(400)),
  actionIdeas: z.array(z.string().min(5).max(300)),
  riskFlags: z.array(z.string()),
});
export type ReviewsOpsOutput = z.infer<typeof outputSchema>;

export const reviewsOpsAgent = defineAgent<ReviewsOpsInput, ReviewsOpsOutput>({
  name: 'reviews-ops',
  tier: 1,
  inputSchema,
  outputSchema,
  model: 'claude-sonnet-4-6',
  system:
    'You are a voice-of-customer analyst. You read reviews and extract recurring themes, ' +
    'pain points, and desired outcomes — anchored to actual review text. You never invent ' +
    'opinions not present. You highlight recurrence (theme appears in N reviews) over isolated ' +
    'cases. You always respond with valid JSON matching the requested schema. No prose outside ' +
    'the JSON object.',
  prompt: (input) => {
    const lines: string[] = [];
    lines.push(`Tenant: ${input.tenantId}`);
    if (input.productName) lines.push(`Product: ${input.productName}`);
    if (input.locale) lines.push(`Locale: ${input.locale}`);
    lines.push(`Analysis goal: ${input.analysisGoal}`);
    lines.push('');
    lines.push(`## Reviews (${input.reviews.length} items)`);
    lines.push('');
    input.reviews.forEach((r, i) => {
      const meta = [r.source, r.date].filter(Boolean).join(' · ');
      lines.push(`### #${i + 1} — ${r.rating}/5${meta ? ` (${meta})` : ''}`);
      lines.push('```');
      lines.push(r.text.slice(0, 2000));
      lines.push('```');
      lines.push('');
    });
    lines.push('Produce JSON with these fields:');
    lines.push('- sampleSize: integer (always reviews.length).');
    lines.push('- averageRating: number 0–5 (compute from input).');
    lines.push('- topThemes: short strings — patterns observed in ≥ 2 reviews.');
    lines.push('- painPoints: short strings — explicit complaints.');
    lines.push('- desiredOutcomes: short strings — what customers WANT (often from low ratings).');
    lines.push(
      '- quoteCandidates: 5–10 short paraphrased quotes (≤ 400 chars) usable in marketing.',
    );
    lines.push('- actionIdeas: short strings — concrete moves the tenant can take.');
    lines.push('- riskFlags: short strings — anything concerning (legal, safety, compliance).');
    lines.push('');
    lines.push('Rules:');
    lines.push('- Use ONLY content from the reviews above.');
    lines.push('- For topThemes/painPoints, prefer items with clear recurrence.');
    lines.push(
      '- For quoteCandidates, paraphrase (do not literal-copy more than 6 words at a time).',
    );
    lines.push(
      '- If reviews are too few or too uniform to support a category, return empty array.',
    );
    lines.push('');
    lines.push('Respond with the JSON object only. No code fences, no commentary.');
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

/** Path canônico do VOC dentro do vault do tenant. */
export function vocPath(slug: string, ts: string): string {
  const safeSlug = slug
    .replace(/[^a-z0-9-]/gi, '-')
    .toLowerCase()
    .slice(0, 40);
  return `voc/${safeSlug}-${ts}.md`;
}

export function vocTimestamp(d: Date = new Date()): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`
  );
}

export function renderVoc(
  input: ReviewsOpsInput,
  output: ReviewsOpsOutput,
  meta: { runId: string; model: string; costUsd: number; generatedAt: string },
): string {
  const lines: string[] = [];
  lines.push(`# Voice of Customer — ${input.productName || input.tenantId}`);
  lines.push('');
  lines.push(`- **Gerado em:** ${meta.generatedAt}`);
  lines.push(`- **Goal:** ${input.analysisGoal}`);
  lines.push(
    `- **Sample:** ${output.sampleSize} reviews · média ${output.averageRating.toFixed(2)}/5`,
  );
  lines.push(`- **Modelo:** ${meta.model}`);
  lines.push(`- **Custo (USD):** ${meta.costUsd.toFixed(6)}`);
  lines.push(`- **Run ID:** ${meta.runId}`);
  lines.push('');
  for (const [label, arr] of [
    ['Top themes', output.topThemes],
    ['Pain points', output.painPoints],
    ['Desired outcomes', output.desiredOutcomes],
    ['Action ideas', output.actionIdeas],
  ] as const) {
    lines.push(`## ${label}`);
    lines.push('');
    if (arr.length === 0) lines.push('_(sem observação)_');
    else for (const item of arr) lines.push(`- ${item}`);
    lines.push('');
  }
  lines.push('## Quote candidates');
  lines.push('');
  if (output.quoteCandidates.length === 0) lines.push('_(sem citações)_');
  else for (const q of output.quoteCandidates) lines.push(`> ${q}`);
  lines.push('');
  if (output.riskFlags.length > 0) {
    lines.push('## ⚠ Risk flags');
    lines.push('');
    for (const r of output.riskFlags) lines.push(`- ${r}`);
    lines.push('');
  }
  lines.push('---');
  lines.push('_Gerado por `@cao/reviews-ops`._');
  return lines.join('\n');
}
