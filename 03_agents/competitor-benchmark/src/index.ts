// competitor-benchmark — Tier 1. Transforma HTML/texto de competidor em
// snapshot imutável comparável, salvo por tenant em
// <tenant>/competitor-benchmark/<competitor>/<timestamp>.md.
//
// Design referenciado de feedgen (01_upstreams/feedgen, Apache-2.0):
// geração estruturada via LLM a partir de input textual. Adaptado, não copiado.

import { defineAgent } from '@cao/runtime';
import { z } from 'zod';

export const inputSchema = z.object({
  tenantId: z.string().min(1),
  competitor: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'competitor deve ser kebab-case (slug)'),
  sourceType: z.enum(['url', 'html', 'text']),
  sourceValue: z.string().min(20),
  benchmarkGoal: z.string().min(5).max(500),
  compareAgainst: z.array(z.string()),
});
export type CompetitorBenchmarkInput = z.infer<typeof inputSchema>;

export const outputSchema = z.object({
  positioningSummary: z.string().min(10).max(1500),
  pricingSignals: z.array(z.string().min(3).max(300)),
  messagingPatterns: z.array(z.string().min(3).max(300)),
  strengths: z.array(z.string().min(3).max(300)),
  weaknesses: z.array(z.string().min(3).max(300)),
  watchouts: z.array(z.string().min(3).max(300)),
});
export type CompetitorBenchmarkOutput = z.infer<typeof outputSchema>;

export const competitorBenchmarkAgent = defineAgent<
  CompetitorBenchmarkInput,
  CompetitorBenchmarkOutput
>({
  name: 'competitor-benchmark',
  tier: 1,
  inputSchema,
  outputSchema,
  model: 'claude-sonnet-4-6',
  system:
    'You are a competitor analyst. You produce factual, reusable snapshots from a single ' +
    'source input. You distinguish direct observation (in the source) from hypothesis ' +
    '(your inference) from gap (information missing). You never invent data not present ' +
    'in the source. You always respond with valid JSON matching the requested schema. ' +
    'No prose outside the JSON object.',
  prompt: (input) =>
    [
      `Tenant: ${input.tenantId}`,
      `Competitor: ${input.competitor}`,
      `Source type: ${input.sourceType}`,
      `Benchmark goal: ${input.benchmarkGoal}`,
      ...(input.compareAgainst.length > 0
        ? ['', 'Compare against:', ...input.compareAgainst.map((c) => `- ${c}`)]
        : []),
      '',
      '## Source content',
      '```',
      input.sourceValue.slice(0, 8000),
      '```',
      '',
      'Produce JSON with these fields:',
      '- positioningSummary: 1 paragraph (10–1500 chars) describing how this competitor positions themselves.',
      '- pricingSignals: short strings about price/discount patterns observed.',
      '- messagingPatterns: short strings about copy/voice patterns.',
      '- strengths: short strings — what they do well based on source.',
      '- weaknesses: short strings — visible weaknesses based on source.',
      '- watchouts: short strings — what we should monitor about this competitor.',
      '',
      'Rules:',
      '- Use ONLY information present in the source content.',
      '- For each item, prefer specific quotes/numbers over generic adjectives.',
      '- If source is too thin to support a category, return empty array — never guess.',
      '',
      'Respond with the JSON object only. No code fences, no commentary.',
    ].join('\n'),
  parseOutput: (text) => {
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/i, '');
    return JSON.parse(cleaned);
  },
});

/** Slug seguro de timestamp (UTC) para path de arquivo imutável. */
export function snapshotTimestamp(d: Date = new Date()): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`
  );
}

/** Path canônico do snapshot dentro do vault do tenant. */
export function snapshotPath(competitor: string, ts: string): string {
  return `competitor-benchmark/${competitor}/${ts}.md`;
}

/** Renderiza o snapshot como markdown imutável. */
export function renderSnapshot(
  input: CompetitorBenchmarkInput,
  output: CompetitorBenchmarkOutput,
  meta: { runId: string; model: string; costUsd: number; generatedAt: string },
): string {
  const lines: string[] = [];
  lines.push(`# Competitor snapshot — ${input.competitor}`);
  lines.push('');
  lines.push(`- **Gerado em:** ${meta.generatedAt}`);
  lines.push(`- **Goal:** ${input.benchmarkGoal}`);
  lines.push(`- **Source type:** \`${input.sourceType}\``);
  lines.push(`- **Modelo:** ${meta.model}`);
  lines.push(`- **Custo (USD):** ${meta.costUsd.toFixed(6)}`);
  lines.push(`- **Run ID:** ${meta.runId}`);
  lines.push('');
  lines.push('## Positioning');
  lines.push('');
  lines.push(output.positioningSummary);
  lines.push('');
  for (const [label, arr] of [
    ['Pricing signals', output.pricingSignals],
    ['Messaging patterns', output.messagingPatterns],
    ['Strengths', output.strengths],
    ['Weaknesses', output.weaknesses],
    ['Watchouts', output.watchouts],
  ] as const) {
    lines.push(`## ${label}`);
    lines.push('');
    if (arr.length === 0) {
      lines.push('_(sem observação)_');
    } else {
      for (const item of arr) lines.push(`- ${item}`);
    }
    lines.push('');
  }
  lines.push('---');
  lines.push('_Snapshot imutável gerado por `@cao/competitor-benchmark`._');
  return lines.join('\n');
}
