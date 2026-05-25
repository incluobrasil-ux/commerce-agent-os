// ads-launchpad — Tier 3/4. Recebe brief de produto + objetivos + canais +
// budget e prepara plano de mídia paga: angles, audiences, copy sets,
// creative briefs, KPI targets, budget split notes, A/B test plan.
//
// Não dispara campanha — produz plano para humano executar. Persiste em
// <tenant>/ads-plans/<slug>-<ts>.md.

import { defineAgent } from '@cao/runtime';
import { z } from 'zod';

const CHANNELS = ['meta', 'google', 'tiktok', 'pinterest', 'youtube', 'other'] as const;

const angleSchema = z.object({
  name: z.string().min(3).max(120),
  hypothesis: z.string().min(5).max(400),
  hookExample: z.string().min(5).max(300),
});

const audienceSegmentSchema = z.object({
  name: z.string().min(3).max(120),
  description: z.string().min(5).max(400),
  channelFit: z.array(z.enum(CHANNELS)).min(1).max(6),
});

const copySetSchema = z.object({
  angleRef: z.string().min(2).max(120),
  headline: z.string().min(3).max(200),
  primaryText: z.string().min(5).max(800),
  cta: z.string().min(2).max(80),
});

const creativeBriefSchema = z.object({
  format: z.string().min(3).max(80),
  description: z.string().min(5).max(400),
  channel: z.enum(CHANNELS),
});

const abTestPlanSchema = z.object({
  hypothesis: z.string().min(5).max(300),
  variantA: z.string().min(3).max(300),
  variantB: z.string().min(3).max(300),
  successMetric: z.string().min(3).max(200),
});

export const inputSchema = z.object({
  tenantId: z.string().min(1),
  productName: z.string().min(2).max(120),
  productDescription: z.string().min(10).max(4000),
  offerHighlights: z.array(z.string().min(3).max(300)).max(20),
  audience: z.string().min(5).max(400),
  conversionGoal: z.string().min(3).max(200),
  monthlyBudgetUsd: z.number().min(0),
  channels: z.array(z.enum(CHANNELS)).min(1).max(6),
  brandVoice: z.string(),
  constraints: z.array(z.string().min(2).max(300)).max(20),
  vocContext: z.string(),
});
export type AdsLaunchpadInput = z.infer<typeof inputSchema>;

export const outputSchema = z.object({
  strategicSummary: z.string().min(10).max(2000),
  angles: z.array(angleSchema).min(1).max(8),
  audienceSegments: z.array(audienceSegmentSchema).min(1).max(8),
  copySets: z.array(copySetSchema).min(1).max(12),
  creativeBriefs: z.array(creativeBriefSchema).min(1).max(12),
  kpiTargets: z.array(z.string().min(3).max(200)).min(1).max(10),
  budgetSplitNotes: z.string().min(5).max(1500),
  abTestPlan: z.array(abTestPlanSchema).max(8),
  complianceCaveats: z.array(z.string().min(3).max(300)).max(10),
  riskFlags: z.array(z.string()),
});
export type AdsLaunchpadOutput = z.infer<typeof outputSchema>;

export const adsLaunchpadAgent = defineAgent<AdsLaunchpadInput, AdsLaunchpadOutput>({
  name: 'ads-launchpad',
  tier: 3,
  inputSchema,
  outputSchema,
  model: 'claude-sonnet-4-6',
  system:
    'You are a senior paid media strategist. You produce a media plan grounded in the ' +
    'product brief, audience, budget, and channels listed by the operator. You DO NOT run ' +
    'campaigns — your output is a plan for human review. You avoid promising performance ' +
    'numbers, never invent audience data, and respect platform policies (no health/financial ' +
    'claims without basis, no false scarcity). You always respond with valid JSON matching ' +
    'the schema. No prose outside the JSON object.',
  prompt: (input) => {
    const lines: string[] = [];
    lines.push(`Tenant: ${input.tenantId}`);
    lines.push(`Conversion goal: ${input.conversionGoal}`);
    lines.push(`Channels: ${input.channels.join(', ')}`);
    lines.push(`Monthly budget (USD): ${input.monthlyBudgetUsd.toFixed(2)}`);
    if (input.brandVoice) lines.push(`Brand voice: ${input.brandVoice}`);
    lines.push('');
    lines.push('## Product');
    lines.push(`- Name: ${input.productName}`);
    lines.push('- Description:');
    lines.push('```');
    lines.push(input.productDescription.slice(0, 4000));
    lines.push('```');
    lines.push('');
    if (input.offerHighlights.length > 0) {
      lines.push('## Offer highlights');
      for (const h of input.offerHighlights) lines.push(`- ${h}`);
      lines.push('');
    }
    lines.push(`## Audience\n${input.audience}`);
    lines.push('');
    if (input.vocContext) {
      lines.push('## VoC context (resumo)');
      lines.push(input.vocContext.slice(0, 4000));
      lines.push('');
    }
    if (input.constraints.length > 0) {
      lines.push('## Hard constraints');
      for (const c of input.constraints) lines.push(`- ${c}`);
      lines.push('');
    }
    lines.push('Produce JSON with these fields:');
    lines.push('- strategicSummary: 2–5 sentences resumindo a estratégia paga.');
    lines.push('- angles: 3–6 angles { name, hypothesis, hookExample }.');
    lines.push('- audienceSegments: 2–5 { name, description, channelFit[] }.');
    lines.push('- copySets: 4–10 { angleRef, headline, primaryText, cta }. angleRef deve');
    lines.push('  bater com o name de um angle acima.');
    lines.push('- creativeBriefs: 3–8 { format, description, channel } — formatos para o');
    lines.push('  time criativo (ex: "vídeo vertical 15s sem face-cam").');
    lines.push('- kpiTargets: short strings — KPIs a acompanhar (CTR, CPA, CAC, ROAS).');
    lines.push('  NÃO prometa números absolutos. Use formato "monitorar X" ou "benchmark Y".');
    lines.push('- budgetSplitNotes: como dividir o budget mensal entre canais (recomendações');
    lines.push('  qualitativas — nunca número absoluto sem benchmarks reais).');
    lines.push('- abTestPlan: 2–5 { hypothesis, variantA, variantB, successMetric }.');
    lines.push('- complianceCaveats: short strings — pontos de atenção (políticas Meta, LGPD).');
    lines.push('- riskFlags: short strings — riscos (audiência saturada, dependência canal).');
    lines.push('');
    lines.push('Rules:');
    lines.push('- Use ONLY canais listados em channels. Não invente canal.');
    lines.push('- Cada copySet deve referenciar um angle existente.');
    lines.push('- Respeite hard constraints e políticas de cada canal.');
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

export function adsTimestamp(d: Date = new Date()): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`
  );
}

export function adsPath(productName: string, ts: string): string {
  const safeSlug = productName
    .replace(/[^a-z0-9-]/gi, '-')
    .toLowerCase()
    .slice(0, 40);
  return `ads-plans/${safeSlug}-${ts}.md`;
}

export function renderAdsPlan(
  input: AdsLaunchpadInput,
  output: AdsLaunchpadOutput,
  meta: { runId: string; model: string; costUsd: number; generatedAt: string },
): string {
  const lines: string[] = [];
  lines.push(`# Ads plan — ${input.productName}`);
  lines.push('');
  lines.push(`- **Gerado em:** ${meta.generatedAt}`);
  lines.push(`- **Conversion goal:** ${input.conversionGoal}`);
  lines.push(`- **Channels:** ${input.channels.join(', ')}`);
  lines.push(`- **Budget mensal (USD):** ${input.monthlyBudgetUsd.toFixed(2)}`);
  lines.push(`- **Audience:** ${input.audience}`);
  lines.push(`- **Modelo:** ${meta.model}`);
  lines.push(`- **Custo (USD):** ${meta.costUsd.toFixed(6)}`);
  lines.push(`- **Run ID:** ${meta.runId}`);
  lines.push('');
  lines.push('## Strategic summary');
  lines.push('');
  lines.push(output.strategicSummary);
  lines.push('');
  lines.push('## Angles');
  lines.push('');
  for (const a of output.angles) {
    lines.push(`### ${a.name}`);
    lines.push(`- **Hipótese:** ${a.hypothesis}`);
    lines.push(`- **Hook exemplo:** _"${a.hookExample}"_`);
    lines.push('');
  }
  lines.push('## Audience segments');
  lines.push('');
  for (const seg of output.audienceSegments) {
    lines.push(`- **${seg.name}** — ${seg.description}`);
    lines.push(`  - canais: ${seg.channelFit.join(', ')}`);
  }
  lines.push('');
  lines.push('## Copy sets');
  lines.push('');
  for (const c of output.copySets) {
    lines.push(`### [${c.angleRef}] ${c.headline}`);
    lines.push('');
    lines.push(c.primaryText);
    lines.push('');
    lines.push(`**CTA:** ${c.cta}`);
    lines.push('');
  }
  lines.push('## Creative briefs');
  lines.push('');
  for (const cb of output.creativeBriefs) {
    lines.push(`- **[${cb.channel}] ${cb.format}** — ${cb.description}`);
  }
  lines.push('');
  lines.push('## KPI targets');
  lines.push('');
  for (const k of output.kpiTargets) lines.push(`- ${k}`);
  lines.push('');
  lines.push('## Budget split notes');
  lines.push('');
  lines.push(output.budgetSplitNotes);
  lines.push('');
  if (output.abTestPlan.length > 0) {
    lines.push('## A/B test plan');
    lines.push('');
    for (const t of output.abTestPlan) {
      lines.push(`- **${t.hypothesis}**`);
      lines.push(`  - A: ${t.variantA}`);
      lines.push(`  - B: ${t.variantB}`);
      lines.push(`  - métrica: ${t.successMetric}`);
    }
    lines.push('');
  }
  if (output.complianceCaveats.length > 0) {
    lines.push('## Compliance caveats');
    lines.push('');
    for (const c of output.complianceCaveats) lines.push(`- ${c}`);
    lines.push('');
  }
  if (output.riskFlags.length > 0) {
    lines.push('## ⚠ Risk flags');
    lines.push('');
    for (const r of output.riskFlags) lines.push(`- ${r}`);
    lines.push('');
  }
  lines.push('---');
  lines.push(
    '_Gerado por `@cao/ads-launchpad`. Plano para humano executar — não dispara campanha._',
  );
  return lines.join('\n');
}
