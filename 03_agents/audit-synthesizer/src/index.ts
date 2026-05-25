// audit-synthesizer — lê relatório markdown do repo-auditor e gera síntese
// executiva curta (5–7 bullets) via Claude. Usa @cao/runtime.

import { defineAgent } from '@cao/runtime';
import { z } from 'zod';

export const inputSchema = z.object({
  repoName: z.string().min(1),
  auditMarkdown: z.string().min(50),
});
export type SynthesizerInput = z.infer<typeof inputSchema>;

export const outputSchema = z.object({
  summary: z.array(z.string().min(3)).min(3).max(8),
  riskLevel: z.enum(['low', 'medium', 'high']),
  oneLiner: z.string().min(10).max(280),
});
export type SynthesizerOutput = z.infer<typeof outputSchema>;

export const auditSynthesizerAgent = defineAgent<SynthesizerInput, SynthesizerOutput>({
  name: 'audit-synthesizer',
  tier: 0,
  inputSchema,
  outputSchema,
  model: 'claude-sonnet-4-6',
  system:
    'You are a concise technical reviewer. You read software repository audit reports ' +
    'and produce executive summaries. You always respond with valid JSON matching the ' +
    'requested schema. No prose outside the JSON object.',
  prompt: (input) =>
    [
      `Audit report for repo "${input.repoName}":`,
      '',
      '```markdown',
      input.auditMarkdown,
      '```',
      '',
      'Produce an executive summary as a single JSON object with exactly these fields:',
      '- summary: array of 3–8 bullet strings (each ≥ 3 chars). Each bullet ≤ 140 chars. No leading dashes.',
      '- riskLevel: one of "low" | "medium" | "high" — assess risk for adopting this repo as upstream reference.',
      '- oneLiner: a single sentence (10–280 chars) capturing the key takeaway.',
      '',
      'Respond with the JSON object only. No code fences, no commentary.',
    ].join('\n'),
  parseOutput: (text) => {
    // Robustez: às vezes o modelo envolve em ```json
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/i, '');
    return JSON.parse(cleaned);
  },
});
