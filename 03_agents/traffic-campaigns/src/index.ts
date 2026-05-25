// traffic-campaigns — Tier 2. Recebe media plan (do marketing-director ou
// manual) + policies (caps de budget, CPA alvo) e produz dry-run com:
// (a) channel mix detalhado, (b) audiências, (c) hipóteses criativas,
// (d) plano de medição, (e) cenários de scale.
//
// NÃO compra mídia. Adapters reais (Google Ads, Meta) ficam para depois.
// Snapshot salvo em <tenant>/traffic/<campaign-slug>-<ts>.md.

import { defineAgent } from '@cao/runtime';
import { z } from 'zod';

const channelAllocationSchema = z.object({
  channel: z.string().min(2).max(60),
  role: z.enum(['driver', 'amplifier', 'retention', 'awareness']),
  allocationPct: z.number().min(0).max(100),
  budgetUsd: z.number().nonnegative(),
  primaryObjective: z.string().min(3).max(200),
  expectedCpa: z.string(),
  rationale: z.string().min(5).max(400),
});

const audienceSchema = z.object({
  name: z.string().min(2).max(120),
  channel: z.string().min(2).max(60),
  segmentDefinition: z.string().min(3).max(500),
  estReach: z.string(),
  intentLevel: z.enum(['low', 'mid', 'high']),
});

const creativeHypothesisSchema = z.object({
  angle: z.string().min(3).max(300),
  pairedAudience: z.string().min(2).max(120),
  pairedChannel: z.string().min(2).max(60),
  expectedSignal: z.string().min(3).max(300),
});

const scaleScenarioSchema = z.object({
  scenario: z.string().min(3).max(200),
  budgetDeltaPct: z.number(),
  expectedImpact: z.string().min(3).max(400),
  precondition: z.string(),
});

export const inputSchema = z.object({
  tenantId: z.string().min(1),
  campaignName: z.string().min(2).max(120),
  totalBudgetUsd: z.number().nonnegative(),
  dailyBudgetCapUsd: z.number().nonnegative(),
  cpaTargetUsd: z.number().nonnegative(),
  conversionTarget: z.string().min(3).max(200),
  channels: z.array(z.string().min(2).max(60)).min(1).max(12),
  audiencesContext: z.string(),
  productContext: z.string().min(3).max(2000),
  priorPerformanceContext: z.string(),
  constraints: z.array(z.string().min(2).max(300)).max(20),
  mode: z.enum(['dry_run']),
});
export type TrafficCampaignInput = z.infer<typeof inputSchema>;

export const outputSchema = z.object({
  campaignName: z.string().min(2).max(120),
  thesis: z.string().min(10).max(800),
  channelMix: z.array(channelAllocationSchema).min(1).max(12),
  audiences: z.array(audienceSchema).min(1).max(20),
  creativeHypotheses: z.array(creativeHypothesisSchema).min(1).max(20),
  measurementPlan: z.string().min(10).max(2000),
  pacingNotes: z.string(),
  scaleScenarios: z.array(scaleScenarioSchema).max(6),
  recommendations: z.array(z.string().min(3).max(400)),
  riskFlags: z.array(z.string()),
});
export type TrafficCampaignOutput = z.infer<typeof outputSchema>;

export const trafficCampaignsAgent = defineAgent<TrafficCampaignInput, TrafficCampaignOutput>({
  name: 'traffic-campaigns',
  tier: 2,
  inputSchema,
  outputSchema,
  model: 'claude-sonnet-4-6',
  system:
    'You are a senior paid-media + growth strategist. You produce a media plan dry-run: ' +
    'channel mix, audiences, creative hypotheses, measurement plan, scale scenarios. You do ' +
    'NOT launch campaigns — only plan. You honor budget caps and CPA target. You never ' +
    'invent audience sizes or CPA assumptions not supportable by context. You respond with ' +
    'valid JSON matching the schema. No prose outside JSON.',
  prompt: (input) => {
    const lines: string[] = [];
    lines.push(`Tenant: ${input.tenantId}`);
    lines.push(`Campaign: ${input.campaignName}`);
    lines.push(`Mode: ${input.mode}`);
    lines.push(`Total budget (USD): ${input.totalBudgetUsd}`);
    lines.push(`Daily cap (USD): ${input.dailyBudgetCapUsd}`);
    lines.push(`CPA target (USD): ${input.cpaTargetUsd}`);
    lines.push(`Conversion target: ${input.conversionTarget}`);
    lines.push('');
    lines.push(`## Channels candidatos\n- ${input.channels.join('\n- ')}`);
    lines.push('');
    lines.push(`## Product context\n${input.productContext}`);
    lines.push('');
    if (input.audiencesContext) {
      lines.push('## Audience context');
      lines.push(input.audiencesContext.slice(0, 4000));
      lines.push('');
    }
    if (input.priorPerformanceContext) {
      lines.push('## Prior performance (resumo)');
      lines.push(input.priorPerformanceContext.slice(0, 4000));
      lines.push('');
    }
    if (input.constraints.length > 0) {
      lines.push('## Hard constraints');
      for (const c of input.constraints) lines.push(`- ${c}`);
      lines.push('');
    }
    lines.push('Produce JSON with these fields:');
    lines.push('- campaignName: copy of input campaignName.');
    lines.push('- thesis: 1-2 sentence thesis explaining why this mix beats alternatives.');
    lines.push(
      '- channelMix: array of { channel, role (driver|amplifier|retention|awareness), ' +
        'allocationPct (0-100), budgetUsd, primaryObjective, expectedCpa, rationale }. ' +
        'Sum of budgetUsd ≤ totalBudgetUsd. Sum of allocationPct ≈ 100.',
    );
    lines.push(
      '- audiences: array of { name, channel, segmentDefinition, estReach, intentLevel ' +
        '(low|mid|high) }. At least 1 per channel.',
    );
    lines.push(
      '- creativeHypotheses: array of { angle, pairedAudience, pairedChannel, expectedSignal }. ' +
        '3-8 hipóteses concretas testáveis.',
    );
    lines.push(
      '- measurementPlan: parágrafo descrevendo KPIs primários, secundários, attribution model ' +
        'e janela de medição.',
    );
    lines.push('- pacingNotes: notas sobre cadência semanal/quinzenal de revisão (may be "").');
    lines.push(
      '- scaleScenarios: array de { scenario, budgetDeltaPct, expectedImpact, precondition }. ' +
        'Considerar +50% e +100% se CPA estiver dentro do target.',
    );
    lines.push('- recommendations: 3-7 itens concretos para o operador.');
    lines.push('- riskFlags: short strings — CAC inflation, brand safety, atribuição, etc.');
    lines.push('');
    lines.push('Rules:');
    lines.push('- Honor budget caps and CPA target.');
    lines.push('- Anchor every channel to channels list + product context above.');
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

export function trafficTimestamp(d: Date = new Date()): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`
  );
}

export function trafficPath(campaignName: string, ts: string): string {
  const safe = campaignName
    .replace(/[^a-z0-9-]/gi, '-')
    .toLowerCase()
    .slice(0, 40);
  return `traffic/${safe}-${ts}.md`;
}

export function totalChannelBudget(channelMix: TrafficCampaignOutput['channelMix']): number {
  return channelMix.reduce((acc, c) => acc + c.budgetUsd, 0);
}

export function renderTraffic(
  input: TrafficCampaignInput,
  output: TrafficCampaignOutput,
  meta: { runId: string; model: string; costUsd: number; generatedAt: string },
): string {
  const lines: string[] = [];
  lines.push(`# Traffic plan (dry-run) — ${output.campaignName}`);
  lines.push('');
  lines.push(`- **Mode:** ${input.mode}`);
  lines.push(`- **Total budget (USD):** ${input.totalBudgetUsd}`);
  lines.push(`- **Daily cap (USD):** ${input.dailyBudgetCapUsd}`);
  lines.push(`- **CPA target (USD):** ${input.cpaTargetUsd}`);
  lines.push(`- **Conversion target:** ${input.conversionTarget}`);
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
  const allocated = totalChannelBudget(output.channelMix);
  lines.push(`## Channel mix (alocado USD ${allocated} de ${input.totalBudgetUsd})`);
  lines.push('');
  for (const c of output.channelMix) {
    lines.push(`### ${c.channel} (${c.role})`);
    lines.push('');
    lines.push(`- **Allocation:** ${c.allocationPct}% · USD ${c.budgetUsd}`);
    lines.push(`- **Objetivo:** ${c.primaryObjective}`);
    lines.push(`- **CPA esperado:** ${c.expectedCpa || 'n/a'}`);
    lines.push(`- **Rationale:** ${c.rationale}`);
    lines.push('');
  }
  lines.push('## Audiências');
  lines.push('');
  for (const a of output.audiences) {
    lines.push(`- **${a.name}** (${a.channel}, intent ${a.intentLevel})`);
    lines.push(`  - _Segmento:_ ${a.segmentDefinition}`);
    if (a.estReach) lines.push(`  - _Reach estimado:_ ${a.estReach}`);
  }
  lines.push('');
  lines.push('## Hipóteses criativas');
  lines.push('');
  for (const h of output.creativeHypotheses) {
    lines.push(`- **${h.angle}**`);
    lines.push(`  - audiência: ${h.pairedAudience} · canal: ${h.pairedChannel}`);
    lines.push(`  - sinal esperado: ${h.expectedSignal}`);
  }
  lines.push('');
  lines.push('## Plano de medição');
  lines.push('');
  lines.push(output.measurementPlan);
  lines.push('');
  if (output.pacingNotes) {
    lines.push('## Pacing');
    lines.push('');
    lines.push(output.pacingNotes);
    lines.push('');
  }
  if (output.scaleScenarios.length > 0) {
    lines.push('## Cenários de scale');
    lines.push('');
    for (const s of output.scaleScenarios) {
      const delta = s.budgetDeltaPct >= 0 ? `+${s.budgetDeltaPct}%` : `${s.budgetDeltaPct}%`;
      lines.push(`- **${s.scenario}** (budget ${delta})`);
      lines.push(`  - _Impacto esperado:_ ${s.expectedImpact}`);
      if (s.precondition) lines.push(`  - _Pré-condição:_ ${s.precondition}`);
    }
    lines.push('');
  }
  if (output.recommendations.length > 0) {
    lines.push('## Recomendações');
    lines.push('');
    for (const r of output.recommendations) lines.push(`- ${r}`);
    lines.push('');
  }
  if (output.riskFlags.length > 0) {
    lines.push('## ⚠ Risk flags');
    lines.push('');
    for (const r of output.riskFlags) lines.push(`- ${r}`);
    lines.push('');
  }
  lines.push('---');
  lines.push('_Gerado por `@cao/traffic-campaigns` (modo dry-run; não compra mídia)._');
  return lines.join('\n');
}
