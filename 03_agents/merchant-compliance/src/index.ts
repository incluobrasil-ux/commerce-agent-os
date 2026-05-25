// merchant-compliance — Tier 2. Revisa conteúdo (copy de produto, descrições,
// políticas) e sinaliza riscos legais, claims sem base, PII vazada, gaps de
// disclaimer e revisões recomendadas. Não substitui jurídico — produz triagem
// estruturada para humano decidir.
//
// Persiste relatório em <tenant>/compliance/<slug>-<ts>.md.

import { defineAgent } from '@cao/runtime';
import { z } from 'zod';

const piiFlagSchema = z.object({
  kind: z.string().min(2).max(60),
  excerpt: z.string().min(2).max(300),
  recommendation: z.string().min(5).max(400),
});

const legalRiskSchema = z.object({
  topic: z.string().min(2).max(120),
  excerpt: z.string().min(2).max(400),
  severity: z.enum(['low', 'medium', 'high']),
  rationale: z.string().min(5).max(500),
});

const revisionSchema = z.object({
  original: z.string().min(2).max(500),
  suggested: z.string().min(2).max(500),
  reason: z.string().min(5).max(400),
});

const CONTENT_TYPES = ['copy', 'product-description', 'policy', 'email', 'ad', 'other'] as const;
const SEVERITY = ['none', 'low', 'medium', 'high'] as const;

export const inputSchema = z.object({
  tenantId: z.string().min(1),
  contentType: z.enum(CONTENT_TYPES),
  content: z.string().min(10).max(20000),
  targetMarket: z.string(),
  category: z.string(),
  sensitiveTopics: z.array(z.string().min(2).max(120)).max(20),
  brandPolicies: z.string(),
});
export type MerchantComplianceInput = z.infer<typeof inputSchema>;

export const outputSchema = z.object({
  overallSeverity: z.enum(SEVERITY),
  complianceSummary: z.string().min(5).max(2000),
  legalRisks: z.array(legalRiskSchema).max(30),
  piiFlags: z.array(piiFlagSchema).max(30),
  requiredDisclaimers: z.array(z.string().min(3).max(300)).max(20),
  policyGaps: z.array(z.string().min(3).max(300)).max(20),
  recommendedRevisions: z.array(revisionSchema).max(20),
  followups: z.array(z.string().min(3).max(300)).max(20),
});
export type MerchantComplianceOutput = z.infer<typeof outputSchema>;

export const merchantComplianceAgent = defineAgent<
  MerchantComplianceInput,
  MerchantComplianceOutput
>({
  name: 'merchant-compliance',
  tier: 2,
  inputSchema,
  outputSchema,
  model: 'claude-sonnet-4-6',
  system:
    'You are a merchant compliance reviewer. You read e-commerce content and produce a ' +
    'structured triage of legal risks, PII exposure, missing disclaimers, and recommended ' +
    'revisions. You DO NOT replace a lawyer — your job is to surface concerns clearly so a ' +
    'human can decide. You are conservative on health/financial/safety claims and explicit ' +
    'about jurisdictional caveats. You always respond with valid JSON matching the schema. ' +
    'No prose outside the JSON object.',
  prompt: (input) => {
    const lines: string[] = [];
    lines.push(`Tenant: ${input.tenantId}`);
    lines.push(`Content type: ${input.contentType}`);
    if (input.targetMarket) lines.push(`Target market: ${input.targetMarket}`);
    if (input.category) lines.push(`Category: ${input.category}`);
    if (input.sensitiveTopics.length > 0) {
      lines.push(`Sensitive topics flagged by operator: ${input.sensitiveTopics.join(', ')}`);
    }
    if (input.brandPolicies) {
      lines.push('');
      lines.push('## Brand policies em vigor');
      lines.push(input.brandPolicies.slice(0, 4000));
    }
    lines.push('');
    lines.push('## Conteúdo a revisar');
    lines.push('```');
    lines.push(input.content.slice(0, 20000));
    lines.push('```');
    lines.push('');
    lines.push('Produce JSON with these fields:');
    lines.push('- overallSeverity: one of none|low|medium|high (the worst issue level).');
    lines.push('- complianceSummary: 2–4 sentences resumindo o veredito.');
    lines.push('- legalRisks: array of { topic, excerpt, severity, rationale } (max 30).');
    lines.push('- piiFlags: array of { kind, excerpt, recommendation } (max 30).');
    lines.push('  Examples of kind: email, phone, CPF, address, full-name, credit-card-fragment.');
    lines.push('- requiredDisclaimers: short strings — disclaimers necessários (LGPD, etc).');
    lines.push('- policyGaps: short strings — pontos cinza onde a política da marca é silente.');
    lines.push('- recommendedRevisions: array of { original, suggested, reason } (max 20).');
    lines.push('- followups: short strings — perguntas para o operador ou ações de coleta.');
    lines.push('');
    lines.push('Rules:');
    lines.push('- Cite trechos textuais (excerpt) sempre que possível.');
    lines.push('- Se não houver risco em determinada categoria, retorne array vazio.');
    lines.push('- Não invente jurisprudência ou lei. Use linguagem cautelosa ("considerar", ');
    lines.push('  "potencial risco") e indique necessidade de revisão jurídica quando aplicável.');
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

export function complianceTimestamp(d: Date = new Date()): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`
  );
}

export function compliancePath(label: string, ts: string): string {
  const safeSlug = label
    .replace(/[^a-z0-9-]/gi, '-')
    .toLowerCase()
    .slice(0, 40);
  return `compliance/${safeSlug}-${ts}.md`;
}

export function renderCompliance(
  input: MerchantComplianceInput,
  output: MerchantComplianceOutput,
  meta: { runId: string; model: string; costUsd: number; generatedAt: string; label: string },
): string {
  const lines: string[] = [];
  lines.push(`# Compliance review — ${meta.label}`);
  lines.push('');
  lines.push(`- **Gerado em:** ${meta.generatedAt}`);
  lines.push(`- **Content type:** ${input.contentType}`);
  if (input.targetMarket) lines.push(`- **Target market:** ${input.targetMarket}`);
  lines.push(`- **Overall severity:** ${output.overallSeverity.toUpperCase()}`);
  lines.push(`- **Modelo:** ${meta.model}`);
  lines.push(`- **Custo (USD):** ${meta.costUsd.toFixed(6)}`);
  lines.push(`- **Run ID:** ${meta.runId}`);
  lines.push('');
  lines.push('## Resumo');
  lines.push('');
  lines.push(output.complianceSummary);
  lines.push('');
  if (output.legalRisks.length > 0) {
    lines.push('## Legal risks');
    lines.push('');
    for (const r of output.legalRisks) {
      lines.push(`- **[${r.severity.toUpperCase()}] ${r.topic}**`);
      lines.push(`  - _excerpt:_ "${r.excerpt}"`);
      lines.push(`  - _rationale:_ ${r.rationale}`);
    }
    lines.push('');
  }
  if (output.piiFlags.length > 0) {
    lines.push('## PII flags');
    lines.push('');
    for (const p of output.piiFlags) {
      lines.push(`- **${p.kind}** — "${p.excerpt}"`);
      lines.push(`  - ${p.recommendation}`);
    }
    lines.push('');
  }
  if (output.requiredDisclaimers.length > 0) {
    lines.push('## Disclaimers requeridos');
    lines.push('');
    for (const d of output.requiredDisclaimers) lines.push(`- ${d}`);
    lines.push('');
  }
  if (output.policyGaps.length > 0) {
    lines.push('## Policy gaps');
    lines.push('');
    for (const g of output.policyGaps) lines.push(`- ${g}`);
    lines.push('');
  }
  if (output.recommendedRevisions.length > 0) {
    lines.push('## Revisões recomendadas');
    lines.push('');
    for (const rev of output.recommendedRevisions) {
      lines.push(`- _original:_ "${rev.original}"`);
      lines.push(`  - _sugerido:_ "${rev.suggested}"`);
      lines.push(`  - _motivo:_ ${rev.reason}`);
    }
    lines.push('');
  }
  if (output.followups.length > 0) {
    lines.push('## Follow-ups');
    lines.push('');
    for (const f of output.followups) lines.push(`- ${f}`);
    lines.push('');
  }
  lines.push('---');
  lines.push('_Gerado por `@cao/merchant-compliance`. Não substitui revisão jurídica._');
  return lines.join('\n');
}
