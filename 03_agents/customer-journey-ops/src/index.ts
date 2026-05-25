// customer-journey-ops — Tier 3. Mapeia jornada do cliente em estágios
// (awareness → consideration → decision → retention → advocacy) a partir
// de contexto da marca + touchpoints atuais + pain points coletados.
//
// Produz: estágios com customer state, touchpoints atuais, frictions,
// opportunities; priority moves; measurement suggestions; risk flags.
// Persiste em <tenant>/journeys/<slug>-<ts>.md.

import { defineAgent } from '@cao/runtime';
import { z } from 'zod';

const STAGES = ['awareness', 'consideration', 'decision', 'retention', 'advocacy'] as const;

const stageSchema = z.object({
  stage: z.enum(STAGES),
  customerState: z.string().min(5).max(500),
  currentTouchpoints: z.array(z.string().min(2).max(200)).max(20),
  frictions: z.array(z.string().min(3).max(300)).max(20),
  opportunities: z.array(z.string().min(3).max(300)).max(20),
});

const priorityMoveSchema = z.object({
  move: z.string().min(5).max(300),
  stage: z.enum(STAGES),
  rationale: z.string().min(5).max(400),
  effort: z.enum(['low', 'medium', 'high']),
  expectedImpact: z.enum(['low', 'medium', 'high']),
});

export const inputSchema = z.object({
  tenantId: z.string().min(1),
  brandName: z.string().min(2).max(120),
  productLineSummary: z.string().min(10).max(2000),
  audience: z.string().min(5).max(400),
  region: z.string(),
  currentTouchpoints: z.array(z.string().min(2).max(200)).max(40),
  knownPainPoints: z.array(z.string().min(3).max(300)).max(40),
  goals: z.array(z.string().min(3).max(300)).min(1).max(10),
  vocContext: z.string(),
});
export type CustomerJourneyOpsInput = z.infer<typeof inputSchema>;

export const outputSchema = z.object({
  summary: z.string().min(10).max(2000),
  journeyStages: z.array(stageSchema).min(1).max(5),
  priorityMoves: z.array(priorityMoveSchema).min(1).max(15),
  measurementSuggestions: z.array(z.string().min(5).max(300)).max(15),
  retentionLevers: z.array(z.string().min(5).max(300)).max(10),
  riskFlags: z.array(z.string()),
});
export type CustomerJourneyOpsOutput = z.infer<typeof outputSchema>;

export const customerJourneyOpsAgent = defineAgent<
  CustomerJourneyOpsInput,
  CustomerJourneyOpsOutput
>({
  name: 'customer-journey-ops',
  tier: 3,
  inputSchema,
  outputSchema,
  model: 'claude-sonnet-4-6',
  system:
    'You are a senior CX strategist. You map customer journeys from awareness to advocacy ' +
    'and propose prioritized moves anchored to the brand context provided. You ground every ' +
    'opportunity in actual touchpoints/pain points listed by the operator — you never invent ' +
    'channels or customer segments not present. You favor concrete, measurable moves with ' +
    'clear effort/impact estimates. You always respond with valid JSON matching the schema. ' +
    'No prose outside the JSON object.',
  prompt: (input) => {
    const lines: string[] = [];
    lines.push(`Tenant: ${input.tenantId}`);
    lines.push(`Brand: ${input.brandName}`);
    if (input.region) lines.push(`Region: ${input.region}`);
    lines.push('');
    lines.push(`## Product line\n${input.productLineSummary}`);
    lines.push('');
    lines.push(`## Audience\n${input.audience}`);
    lines.push('');
    if (input.currentTouchpoints.length > 0) {
      lines.push('## Current touchpoints (operator-listed)');
      for (const t of input.currentTouchpoints) lines.push(`- ${t}`);
      lines.push('');
    }
    if (input.knownPainPoints.length > 0) {
      lines.push('## Known pain points');
      for (const p of input.knownPainPoints) lines.push(`- ${p}`);
      lines.push('');
    }
    lines.push('## Goals');
    for (const g of input.goals) lines.push(`- ${g}`);
    lines.push('');
    if (input.vocContext) {
      lines.push('## VoC context (resumo)');
      lines.push(input.vocContext.slice(0, 4000));
      lines.push('');
    }
    lines.push('Produce JSON with these fields:');
    lines.push('- summary: 2–4 sentences resumindo a leitura da jornada.');
    lines.push('- journeyStages: 3–5 stages from { awareness, consideration, decision, ');
    lines.push('  retention, advocacy }, cada com { stage, customerState, currentTouchpoints, ');
    lines.push('  frictions, opportunities }.');
    lines.push('- priorityMoves: 3–10 moves { move, stage, rationale, effort (low|medium|high), ');
    lines.push('  expectedImpact (low|medium|high) }.');
    lines.push('- measurementSuggestions: short strings — métricas/eventos para acompanhar.');
    lines.push('- retentionLevers: short strings — ações que aumentam recorrência.');
    lines.push('- riskFlags: short strings — riscos de adoção, dependência de canal, etc.');
    lines.push('');
    lines.push('Rules:');
    lines.push('- Use ONLY touchpoints e pain points listados acima. Não invente canais.');
    lines.push('- Cada opportunity deve mapear a uma friction explícita.');
    lines.push('- Priorize moves com effort low/medium e impact medium/high.');
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

export function journeyTimestamp(d: Date = new Date()): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`
  );
}

export function journeyPath(brandName: string, ts: string): string {
  const safeSlug = brandName
    .replace(/[^a-z0-9-]/gi, '-')
    .toLowerCase()
    .slice(0, 40);
  return `journeys/${safeSlug}-${ts}.md`;
}

export function renderJourney(
  input: CustomerJourneyOpsInput,
  output: CustomerJourneyOpsOutput,
  meta: { runId: string; model: string; costUsd: number; generatedAt: string },
): string {
  const lines: string[] = [];
  lines.push(`# Customer journey — ${input.brandName}`);
  lines.push('');
  lines.push(`- **Gerado em:** ${meta.generatedAt}`);
  if (input.region) lines.push(`- **Region:** ${input.region}`);
  lines.push(`- **Audience:** ${input.audience}`);
  lines.push(`- **Modelo:** ${meta.model}`);
  lines.push(`- **Custo (USD):** ${meta.costUsd.toFixed(6)}`);
  lines.push(`- **Run ID:** ${meta.runId}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(output.summary);
  lines.push('');
  lines.push('## Journey stages');
  lines.push('');
  for (const s of output.journeyStages) {
    lines.push(`### ${s.stage.toUpperCase()}`);
    lines.push('');
    lines.push(`**Customer state:** ${s.customerState}`);
    lines.push('');
    if (s.currentTouchpoints.length > 0) {
      lines.push('**Touchpoints atuais:**');
      for (const t of s.currentTouchpoints) lines.push(`- ${t}`);
      lines.push('');
    }
    if (s.frictions.length > 0) {
      lines.push('**Frictions:**');
      for (const f of s.frictions) lines.push(`- ${f}`);
      lines.push('');
    }
    if (s.opportunities.length > 0) {
      lines.push('**Opportunities:**');
      for (const o of s.opportunities) lines.push(`- ${o}`);
      lines.push('');
    }
  }
  lines.push('## Priority moves');
  lines.push('');
  for (const m of output.priorityMoves) {
    lines.push(
      `- **[${m.stage}] ${m.move}** — effort ${m.effort.toUpperCase()} · impact ${m.expectedImpact.toUpperCase()}`,
    );
    lines.push(`  - _${m.rationale}_`);
  }
  lines.push('');
  if (output.measurementSuggestions.length > 0) {
    lines.push('## Measurement suggestions');
    lines.push('');
    for (const m of output.measurementSuggestions) lines.push(`- ${m}`);
    lines.push('');
  }
  if (output.retentionLevers.length > 0) {
    lines.push('## Retention levers');
    lines.push('');
    for (const r of output.retentionLevers) lines.push(`- ${r}`);
    lines.push('');
  }
  if (output.riskFlags.length > 0) {
    lines.push('## ⚠ Risk flags');
    lines.push('');
    for (const r of output.riskFlags) lines.push(`- ${r}`);
    lines.push('');
  }
  lines.push('---');
  lines.push('_Gerado por `@cao/customer-journey-ops`._');
  return lines.join('\n');
}
