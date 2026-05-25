// governance-risk-qa — Tier 3 meta-guardrail. Recebe a saída de outro agente
// (geralmente JSON serializado) + contexto e produz veredito pass|warn|block,
// listando risk flags, quality concerns, factuality checks pendentes e
// followups antes do output ser publicado.
//
// Não substitui revisão humana — é uma camada extra entre o agente origem
// e a publicação, alinhada com a política de "humano decide o que sai".

import { defineAgent } from '@cao/runtime';
import { z } from 'zod';

const VERDICT = ['pass', 'warn', 'block'] as const;
const SENSITIVITY = ['low', 'medium', 'high'] as const;

const riskFlagSchema = z.object({
  category: z.string().min(2).max(80),
  description: z.string().min(5).max(500),
  severity: z.enum(['low', 'medium', 'high']),
});

const factualityCheckSchema = z.object({
  claim: z.string().min(5).max(400),
  needsVerification: z.boolean(),
  suggestedSource: z.string(),
});

export const inputSchema = z.object({
  tenantId: z.string().min(1),
  agentName: z.string().min(2).max(120),
  agentOutput: z.string().min(2).max(40000),
  context: z.string(),
  sensitivity: z.enum(SENSITIVITY),
  policyNotes: z.string(),
  publishingChannel: z.string(),
});
export type GovernanceRiskQaInput = z.infer<typeof inputSchema>;

export const outputSchema = z.object({
  verdict: z.enum(VERDICT),
  rationale: z.string().min(5).max(2000),
  riskFlags: z.array(riskFlagSchema).max(40),
  qualityConcerns: z.array(z.string().min(3).max(400)).max(30),
  factualityChecks: z.array(factualityCheckSchema).max(30),
  suggestedFollowups: z.array(z.string().min(3).max(300)).max(20),
  blockingReasons: z.array(z.string().min(3).max(400)).max(20),
});
export type GovernanceRiskQaOutput = z.infer<typeof outputSchema>;

export const governanceRiskQaAgent = defineAgent<GovernanceRiskQaInput, GovernanceRiskQaOutput>({
  name: 'governance-risk-qa',
  tier: 3,
  inputSchema,
  outputSchema,
  model: 'claude-sonnet-4-6',
  system:
    'You are a governance/risk QA reviewer. Another agent produced output that is about to be ' +
    'used or published. Your job is to read it critically and emit a verdict: pass, warn, or ' +
    'block. You are NOT the final decision-maker — you surface concerns clearly. Be ' +
    'conservative on health/financial/safety/legal claims and on outputs that touch ' +
    'customer-facing channels. Use "warn" when a human review is recommended; reserve ' +
    '"block" for outputs that would cause real harm (false health claims, leaked PII, ' +
    'discriminatory language, illegal content). You always respond with valid JSON matching ' +
    'the schema. No prose outside the JSON object.',
  prompt: (input) => {
    const lines: string[] = [];
    lines.push(`Tenant: ${input.tenantId}`);
    lines.push(`Reviewing output from agent: ${input.agentName}`);
    lines.push(`Sensitivity: ${input.sensitivity}`);
    if (input.publishingChannel) lines.push(`Publishing channel: ${input.publishingChannel}`);
    if (input.context) {
      lines.push('');
      lines.push('## Contexto do operador');
      lines.push(input.context.slice(0, 4000));
    }
    if (input.policyNotes) {
      lines.push('');
      lines.push('## Policy notes');
      lines.push(input.policyNotes.slice(0, 4000));
    }
    lines.push('');
    lines.push('## Output sob revisão');
    lines.push('```');
    lines.push(input.agentOutput.slice(0, 40000));
    lines.push('```');
    lines.push('');
    lines.push('Produce JSON with these fields:');
    lines.push('- verdict: one of pass|warn|block.');
    lines.push('- rationale: 2–5 sentences resumindo o veredito.');
    lines.push('- riskFlags: array of { category, description, severity (low|medium|high) }.');
    lines.push('- qualityConcerns: short strings — issues de qualidade (incoerência, vazio, etc).');
    lines.push('- factualityChecks: array of { claim, needsVerification, suggestedSource }.');
    lines.push('- suggestedFollowups: short strings — ações para o operador antes de publicar.');
    lines.push('- blockingReasons: short strings — motivos que justificam bloqueio. ');
    lines.push('  DEVE estar vazio se verdict != "block".');
    lines.push('');
    lines.push('Rules:');
    lines.push('- Calibre o veredito pela sensitivity informada e canal de publicação.');
    lines.push('- "block" SOMENTE para risco real (claim de saúde sem base, PII vazada, ');
    lines.push('  conteúdo discriminatório, ilegal ou que cause dano imediato).');
    lines.push('- "warn" quando há dúvida razoável → humano deve revisar.');
    lines.push('- "pass" quando o output parece consistente e dentro da política.');
    lines.push('- Não invente leis. Use linguagem cautelosa quando aplicável.');
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

export function qaTimestamp(d: Date = new Date()): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`
  );
}

export function qaPath(agentName: string, ts: string): string {
  const safeSlug = agentName
    .replace(/[^a-z0-9-]/gi, '-')
    .toLowerCase()
    .slice(0, 40);
  return `governance-qa/${safeSlug}-${ts}.md`;
}

export function renderQa(
  input: GovernanceRiskQaInput,
  output: GovernanceRiskQaOutput,
  meta: { runId: string; model: string; costUsd: number; generatedAt: string },
): string {
  const verdictEmoji: Record<string, string> = {
    pass: '✅',
    warn: '⚠',
    block: '⛔',
  };
  const lines: string[] = [];
  lines.push(`# Governance QA — ${input.agentName}`);
  lines.push('');
  lines.push(`- **Gerado em:** ${meta.generatedAt}`);
  lines.push(
    `- **Verdict:** ${verdictEmoji[output.verdict] ?? ''} ${output.verdict.toUpperCase()}`,
  );
  lines.push(`- **Sensitivity:** ${input.sensitivity}`);
  if (input.publishingChannel) lines.push(`- **Channel:** ${input.publishingChannel}`);
  lines.push(`- **Modelo:** ${meta.model}`);
  lines.push(`- **Custo (USD):** ${meta.costUsd.toFixed(6)}`);
  lines.push(`- **Run ID:** ${meta.runId}`);
  lines.push('');
  lines.push('## Rationale');
  lines.push('');
  lines.push(output.rationale);
  lines.push('');
  if (output.verdict === 'block' && output.blockingReasons.length > 0) {
    lines.push('## ⛔ Blocking reasons');
    lines.push('');
    for (const r of output.blockingReasons) lines.push(`- ${r}`);
    lines.push('');
  }
  if (output.riskFlags.length > 0) {
    lines.push('## Risk flags');
    lines.push('');
    for (const r of output.riskFlags) {
      lines.push(`- **[${r.severity.toUpperCase()}] ${r.category}** — ${r.description}`);
    }
    lines.push('');
  }
  if (output.qualityConcerns.length > 0) {
    lines.push('## Quality concerns');
    lines.push('');
    for (const q of output.qualityConcerns) lines.push(`- ${q}`);
    lines.push('');
  }
  if (output.factualityChecks.length > 0) {
    lines.push('## Factuality checks');
    lines.push('');
    for (const f of output.factualityChecks) {
      const verify = f.needsVerification ? '⚠ verificar' : 'ok';
      const src = f.suggestedSource ? ` — fonte sugerida: ${f.suggestedSource}` : '';
      lines.push(`- [${verify}] ${f.claim}${src}`);
    }
    lines.push('');
  }
  if (output.suggestedFollowups.length > 0) {
    lines.push('## Follow-ups sugeridos');
    lines.push('');
    for (const f of output.suggestedFollowups) lines.push(`- ${f}`);
    lines.push('');
  }
  lines.push('---');
  lines.push('_Gerado por `@cao/governance-risk-qa`. Veredito é triagem — humano decide._');
  return lines.join('\n');
}
