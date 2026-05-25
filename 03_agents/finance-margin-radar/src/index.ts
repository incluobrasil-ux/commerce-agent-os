// finance-margin-radar — Tier 3/4. Revisa números de margem por SKU colados
// pelo operador. NÃO consulta sistema financeiro real — apenas analisa os
// dados de entrada e aponta riscos, sensibilidades, oportunidades de
// pricing e experimentos.
//
// Persiste em <tenant>/finance-radar/<slug>-<ts>.md. Todos os números
// são tratados como input do operador (não fonte de verdade).

import { defineAgent } from '@cao/runtime';
import { z } from 'zod';

const productLineSchema = z.object({
  name: z.string().min(2).max(120),
  unitCost: z.number().min(0),
  sellPrice: z.number().min(0),
  channelFees: z.number().min(0),
  shippingAvg: z.number().min(0),
  monthlyUnitsEstimate: z.number().min(0),
});

const marginAnalysisSchema = z.object({
  productName: z.string().min(2).max(120),
  grossMarginPct: z.number(),
  contributionMarginAbs: z.number(),
  health: z.enum(['critical', 'tight', 'healthy', 'strong']),
  observations: z.string().min(5).max(800),
});

const pricingMoveSchema = z.object({
  productName: z.string().min(2).max(120),
  move: z.string().min(5).max(300),
  rationale: z.string().min(5).max(400),
  effort: z.enum(['low', 'medium', 'high']),
  expectedImpact: z.enum(['low', 'medium', 'high']),
});

export const inputSchema = z.object({
  tenantId: z.string().min(1),
  currency: z.string().min(3).max(8),
  productLines: z.array(productLineSchema).min(1).max(50),
  targetMarginPct: z.number().min(0).max(100),
  fixedCostsMonth: z.number().min(0),
  observations: z.string(),
});
export type FinanceMarginRadarInput = z.infer<typeof inputSchema>;

export const outputSchema = z.object({
  overallHealth: z.enum(['critical', 'tight', 'healthy', 'strong']),
  summary: z.string().min(10).max(2000),
  marginAnalysis: z.array(marginAnalysisSchema).min(1).max(50),
  breakEvenInsights: z.string().min(5).max(1500),
  pricingMoves: z.array(pricingMoveSchema).max(20),
  risksAndWatchouts: z.array(z.string().min(3).max(300)).max(20),
  recommendedExperiments: z.array(z.string().min(5).max(300)).max(10),
  confidenceCaveats: z.array(z.string().min(3).max(300)).min(1).max(10),
});
export type FinanceMarginRadarOutput = z.infer<typeof outputSchema>;

export const financeMarginRadarAgent = defineAgent<
  FinanceMarginRadarInput,
  FinanceMarginRadarOutput
>({
  name: 'finance-margin-radar',
  tier: 3,
  inputSchema,
  outputSchema,
  model: 'claude-sonnet-4-6',
  system:
    'You are a senior e-commerce finance analyst. You receive product-line numbers ' +
    '(cost, price, fees, shipping, monthly units estimate) provided by the operator and ' +
    'produce a structured margin analysis. You are explicit that the numbers come from the ' +
    'operator — you do not validate them against a source of truth. You compute gross ' +
    'margin %, contribution margin (price − cost − fees − shipping), and tag each line as ' +
    'critical/tight/healthy/strong. You always include confidenceCaveats reminding that ' +
    'numbers may shift in real conditions (returns, taxes, exchange rate). You respond ' +
    'with valid JSON matching the schema. No prose outside the JSON object.',
  prompt: (input) => {
    const lines: string[] = [];
    lines.push(`Tenant: ${input.tenantId}`);
    lines.push(`Currency: ${input.currency}`);
    lines.push(`Target margin: ${input.targetMarginPct.toFixed(1)}%`);
    lines.push(`Fixed costs / month: ${input.fixedCostsMonth.toFixed(2)} ${input.currency}`);
    lines.push('');
    lines.push('## Product lines (operator-provided)');
    lines.push('');
    for (const p of input.productLines) {
      lines.push(`### ${p.name}`);
      lines.push(`- Unit cost: ${p.unitCost.toFixed(2)}`);
      lines.push(`- Sell price: ${p.sellPrice.toFixed(2)}`);
      lines.push(`- Channel fees (avg): ${p.channelFees.toFixed(2)}`);
      lines.push(`- Shipping (avg): ${p.shippingAvg.toFixed(2)}`);
      lines.push(`- Monthly units estimate: ${p.monthlyUnitsEstimate}`);
      lines.push('');
    }
    if (input.observations) {
      lines.push('## Observations from operator');
      lines.push(input.observations.slice(0, 4000));
      lines.push('');
    }
    lines.push('Produce JSON with these fields:');
    lines.push('- overallHealth: one of critical|tight|healthy|strong.');
    lines.push('- summary: 2–5 sentences resumindo a leitura financeira.');
    lines.push('- marginAnalysis: 1 entry por product line — { productName, grossMarginPct, ');
    lines.push('  contributionMarginAbs, health, observations }.');
    lines.push('  grossMarginPct = (sellPrice - unitCost) / sellPrice * 100.');
    lines.push('  contributionMarginAbs = sellPrice - unitCost - channelFees - shippingAvg.');
    lines.push('- breakEvenInsights: leitura qualitativa sobre quantas unidades/mês cobrem o ');
    lines.push('  custo fixo, sensibilidade a fees/shipping, etc.');
    lines.push(
      '- pricingMoves: 2–10 moves { productName, move, rationale, effort, expectedImpact }.',
    );
    lines.push('- risksAndWatchouts: short strings — risco de tax/return/exchange/concentração.');
    lines.push('- recommendedExperiments: short strings — experimentos para validar premissas.');
    lines.push('- confidenceCaveats: short strings — DEVE incluir ao menos um lembrete que os ');
    lines.push('  números são do operador e podem mudar em condições reais.');
    lines.push('');
    lines.push('Rules:');
    lines.push('- Calcule margens com base nos números dados (não invente preço).');
    lines.push('- Sinalize linhas críticas (margem negativa, margem < 10%, dependência alta).');
    lines.push('- Não prometa retorno absoluto. Use "potencial", "estimado".');
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

export function radarTimestamp(d: Date = new Date()): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`
  );
}

export function radarPath(tenantLabel: string, ts: string): string {
  const safeSlug = tenantLabel
    .replace(/[^a-z0-9-]/gi, '-')
    .toLowerCase()
    .slice(0, 40);
  return `finance-radar/${safeSlug}-${ts}.md`;
}

const healthEmoji: Record<string, string> = {
  critical: '🔴',
  tight: '🟡',
  healthy: '🟢',
  strong: '✅',
};

export function renderRadar(
  input: FinanceMarginRadarInput,
  output: FinanceMarginRadarOutput,
  meta: { runId: string; model: string; costUsd: number; generatedAt: string; label: string },
): string {
  const lines: string[] = [];
  lines.push(`# Finance margin radar — ${meta.label}`);
  lines.push('');
  lines.push(`- **Gerado em:** ${meta.generatedAt}`);
  lines.push(`- **Currency:** ${input.currency}`);
  lines.push(`- **Target margin:** ${input.targetMarginPct.toFixed(1)}%`);
  lines.push(`- **Fixed costs/month:** ${input.fixedCostsMonth.toFixed(2)} ${input.currency}`);
  lines.push(
    `- **Overall health:** ${healthEmoji[output.overallHealth] ?? ''} ${output.overallHealth.toUpperCase()}`,
  );
  lines.push(`- **Modelo:** ${meta.model}`);
  lines.push(`- **Custo (USD):** ${meta.costUsd.toFixed(6)}`);
  lines.push(`- **Run ID:** ${meta.runId}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(output.summary);
  lines.push('');
  lines.push('## Margin analysis');
  lines.push('');
  for (const m of output.marginAnalysis) {
    lines.push(`### ${healthEmoji[m.health] ?? ''} ${m.productName} (${m.health.toUpperCase()})`);
    lines.push('');
    lines.push(`- **Gross margin:** ${m.grossMarginPct.toFixed(1)}%`);
    lines.push(
      `- **Contribution margin (abs):** ${m.contributionMarginAbs.toFixed(2)} ${input.currency}`,
    );
    lines.push(`- **Observations:** ${m.observations}`);
    lines.push('');
  }
  lines.push('## Break-even insights');
  lines.push('');
  lines.push(output.breakEvenInsights);
  lines.push('');
  if (output.pricingMoves.length > 0) {
    lines.push('## Pricing moves');
    lines.push('');
    for (const p of output.pricingMoves) {
      lines.push(
        `- **[${p.productName}] ${p.move}** — effort ${p.effort.toUpperCase()} · impact ${p.expectedImpact.toUpperCase()}`,
      );
      lines.push(`  - _${p.rationale}_`);
    }
    lines.push('');
  }
  if (output.risksAndWatchouts.length > 0) {
    lines.push('## ⚠ Risks & watchouts');
    lines.push('');
    for (const r of output.risksAndWatchouts) lines.push(`- ${r}`);
    lines.push('');
  }
  if (output.recommendedExperiments.length > 0) {
    lines.push('## Recommended experiments');
    lines.push('');
    for (const e of output.recommendedExperiments) lines.push(`- ${e}`);
    lines.push('');
  }
  lines.push('## Confidence caveats');
  lines.push('');
  for (const c of output.confidenceCaveats) lines.push(`- ${c}`);
  lines.push('');
  lines.push('---');
  lines.push(
    '_Gerado por `@cao/finance-margin-radar`. Números fornecidos pelo operador — não substitui contabilidade._',
  );
  return lines.join('\n');
}
