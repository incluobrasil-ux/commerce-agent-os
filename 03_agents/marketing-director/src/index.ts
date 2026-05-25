// marketing-director — Tier 2. Recebe objetivos + budget + contexto e produz
// plano de marketing (iniciativas com canais, KPIs, riscos). Não executa
// criativo nem compra mídia — apenas planeja e arbitra prioridades.
//
// Snapshot salvo em <tenant>/marketing/<horizon-slug>-<ts>.md.

import { defineAgent } from '@cao/runtime';
import { z } from 'zod';

const initiativeSchema = z.object({
  name: z.string().min(3).max(120),
  objective: z.string().min(3).max(200),
  audience: z.string().min(3).max(200),
  primaryChannel: z.string().min(2).max(60),
  supportingChannels: z.array(z.string().min(2).max(60)).max(8),
  timing: z.string().min(2).max(120),
  budgetUsd: z.number().nonnegative(),
  primaryKpi: z.string().min(2).max(120),
  successMetric: z.string().min(2).max(200),
  rationale: z.string().min(5).max(500),
});

const budgetAllocationSchema = z.object({
  category: z.string().min(2).max(60),
  pctOfTotal: z.number().min(0).max(100),
  rationale: z.string().min(3).max(300),
});

const kpiTargetSchema = z.object({
  kpi: z.string().min(2).max(120),
  baseline: z.string(),
  target: z.string().min(1).max(120),
  horizon: z.string().min(2).max(60),
});

export const inputSchema = z.object({
  tenantId: z.string().min(1),
  horizon: z.string().min(2).max(60),
  objectives: z.array(z.string().min(3).max(300)).min(1).max(8),
  budgetUsd: z.number().nonnegative(),
  brandVoice: z.string().min(3).max(400),
  audienceContext: z.string(),
  marketContext: z.string(),
  competitorContext: z.string(),
  productPortfolio: z.string(),
  constraints: z.array(z.string().min(2).max(300)).max(20),
});
export type MarketingDirectorInput = z.infer<typeof inputSchema>;

export const outputSchema = z.object({
  planTitle: z.string().min(3).max(200),
  thesis: z.string().min(10).max(800),
  initiatives: z.array(initiativeSchema).min(1).max(12),
  budgetSplit: z.array(budgetAllocationSchema).max(12),
  kpiTargets: z.array(kpiTargetSchema).max(12),
  sequencingNotes: z.string(),
  riskFlags: z.array(z.string()),
});
export type MarketingDirectorOutput = z.infer<typeof outputSchema>;

export const marketingDirectorAgent = defineAgent<MarketingDirectorInput, MarketingDirectorOutput>({
  name: 'marketing-director',
  tier: 2,
  inputSchema,
  outputSchema,
  model: 'claude-sonnet-4-6',
  system:
    'You are a senior DTC marketing director. You produce a marketing plan as a set of ' +
    'initiatives with audience, channels, timing, budget, KPI and rationale — anchored to ' +
    'the objectives, budget and context provided. You never invent metrics, audiences or ' +
    'product capabilities not present in the brief. You honor brand voice and constraints. ' +
    'You always respond with valid JSON matching the requested schema. No prose outside JSON.',
  prompt: (input) => {
    const lines: string[] = [];
    lines.push(`Tenant: ${input.tenantId}`);
    lines.push(`Horizon: ${input.horizon}`);
    lines.push(`Total budget (USD): ${input.budgetUsd}`);
    lines.push('');
    lines.push('## Objetivos priorizados');
    for (const o of input.objectives) lines.push(`- ${o}`);
    lines.push('');
    lines.push(`## Brand voice\n${input.brandVoice}`);
    lines.push('');
    if (input.audienceContext) {
      lines.push('## Audiência (contexto)');
      lines.push(input.audienceContext.slice(0, 4000));
      lines.push('');
    }
    if (input.marketContext) {
      lines.push('## Market intelligence (resumo)');
      lines.push(input.marketContext.slice(0, 4000));
      lines.push('');
    }
    if (input.competitorContext) {
      lines.push('## Competitor signals (resumo)');
      lines.push(input.competitorContext.slice(0, 4000));
      lines.push('');
    }
    if (input.productPortfolio) {
      lines.push('## Portfolio de produtos');
      lines.push(input.productPortfolio.slice(0, 4000));
      lines.push('');
    }
    if (input.constraints.length > 0) {
      lines.push('## Hard constraints');
      for (const c of input.constraints) lines.push(`- ${c}`);
      lines.push('');
    }
    lines.push('Produce JSON with these fields:');
    lines.push('- planTitle: short title for the plan.');
    lines.push('- thesis: 1-2 sentence strategic thesis tying objectives to context.');
    lines.push(
      '- initiatives: 3-8 items each { name, objective, audience, primaryChannel, ' +
        'supportingChannels[], timing, budgetUsd, primaryKpi, successMetric, rationale }.',
    );
    lines.push(
      '- budgetSplit: array of { category, pctOfTotal (0-100), rationale }. Sum should ' +
        'approximate 100 but not enforced.',
    );
    lines.push(
      '- kpiTargets: array of { kpi, baseline, target, horizon }. Use "n/a" if baseline ' +
        'absent in context.',
    );
    lines.push('- sequencingNotes: short note on order/dependencies (may be "").');
    lines.push('- riskFlags: short strings — strategic or execution risks worth flagging.');
    lines.push('');
    lines.push('Rules:');
    lines.push('- Sum of initiative budgetUsd should not exceed total budget.');
    lines.push('- Anchor every initiative to objectives + context above.');
    lines.push('- Honor brand voice tone and hard constraints.');
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

export function planTimestamp(d: Date = new Date()): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`
  );
}

export function planPath(horizon: string, ts: string): string {
  const safe = horizon
    .replace(/[^a-z0-9-]/gi, '-')
    .toLowerCase()
    .slice(0, 40);
  return `marketing/${safe}-${ts}.md`;
}

export function renderPlan(
  input: MarketingDirectorInput,
  output: MarketingDirectorOutput,
  meta: { runId: string; model: string; costUsd: number; generatedAt: string },
): string {
  const lines: string[] = [];
  lines.push(`# Marketing Plan — ${output.planTitle}`);
  lines.push('');
  lines.push(`- **Horizon:** ${input.horizon}`);
  lines.push(`- **Total budget (USD):** ${input.budgetUsd}`);
  lines.push(`- **Tenant:** ${input.tenantId}`);
  lines.push(`- **Gerado em:** ${meta.generatedAt}`);
  lines.push(`- **Modelo:** ${meta.model}`);
  lines.push(`- **Custo (USD):** ${meta.costUsd.toFixed(6)}`);
  lines.push(`- **Run ID:** ${meta.runId}`);
  lines.push('');
  lines.push('## Tese');
  lines.push('');
  lines.push(output.thesis);
  lines.push('');
  lines.push('## Iniciativas');
  lines.push('');
  for (const i of output.initiatives) {
    lines.push(`### ${i.name}`);
    lines.push('');
    lines.push(`- **Objetivo:** ${i.objective}`);
    lines.push(`- **Audiência:** ${i.audience}`);
    lines.push(
      `- **Canal primário:** ${i.primaryChannel}${
        i.supportingChannels.length > 0 ? ` (+ ${i.supportingChannels.join(', ')})` : ''
      }`,
    );
    lines.push(`- **Timing:** ${i.timing}`);
    lines.push(`- **Budget (USD):** ${i.budgetUsd}`);
    lines.push(`- **KPI:** ${i.primaryKpi} — meta: ${i.successMetric}`);
    lines.push(`- **Rationale:** ${i.rationale}`);
    lines.push('');
  }
  if (output.budgetSplit.length > 0) {
    lines.push('## Split de budget');
    lines.push('');
    for (const b of output.budgetSplit) {
      lines.push(`- **${b.category}** — ${b.pctOfTotal}% · ${b.rationale}`);
    }
    lines.push('');
  }
  if (output.kpiTargets.length > 0) {
    lines.push('## KPI targets');
    lines.push('');
    for (const k of output.kpiTargets) {
      lines.push(
        `- **${k.kpi}** (${k.horizon}) — baseline ${k.baseline || 'n/a'} → meta ${k.target}`,
      );
    }
    lines.push('');
  }
  if (output.sequencingNotes) {
    lines.push('## Sequencing notes');
    lines.push('');
    lines.push(output.sequencingNotes);
    lines.push('');
  }
  if (output.riskFlags.length > 0) {
    lines.push('## ⚠ Risk flags');
    lines.push('');
    for (const r of output.riskFlags) lines.push(`- ${r}`);
    lines.push('');
  }
  lines.push('---');
  lines.push('_Gerado por `@cao/marketing-director`._');
  return lines.join('\n');
}
