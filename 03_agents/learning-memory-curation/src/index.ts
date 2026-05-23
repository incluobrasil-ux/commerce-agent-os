// learning-memory-curation — lê audit + working memory e propõe promoções para facts/.
// O agente NÃO escreve direto no facts — emite proposals; a escrita real fica no CLI
// para auditabilidade (qualquer escrita é decisão consciente, ver run-summaries policy).

import { defineAgent } from '@cao/runtime';
import { z } from 'zod';

export const inputSchema = z.object({
  tenantId: z.string().min(1),
  auditExcerpt: z.string().min(20),
  workingExcerpt: z.string(),
  existingFactSlugs: z.array(z.string()),
});
export type CurationInput = z.infer<typeof inputSchema>;

export const factProposalSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'slug deve ser kebab-case'),
  title: z.string().min(3).max(120),
  body: z.string().min(20).max(1500),
  tags: z.array(z.string().min(2).max(40)).min(1).max(8),
  confidence: z.number().min(0).max(1),
  rationale: z.string().min(10).max(400),
});
export type FactProposal = z.infer<typeof factProposalSchema>;

export const outputSchema = z.object({
  proposals: z.array(factProposalSchema).max(10),
  skipped: z.array(z.string()),
  summary: z.string().min(10).max(400),
});
export type CurationOutput = z.infer<typeof outputSchema>;

export const learningMemoryCurationAgent = defineAgent<CurationInput, CurationOutput>({
  name: 'learning-memory-curation',
  tier: 0,
  inputSchema,
  outputSchema,
  model: 'claude-sonnet-4-6',
  system:
    'You are a memory curator. You read raw audit logs and working memory of a tenant and ' +
    'decide which findings are stable, useful, and high-confidence enough to be promoted to ' +
    'long-term facts. You are conservative: only promote when a finding is concrete, ' +
    'non-volatile, and likely to remain true. You always respond with valid JSON matching ' +
    'the requested schema. No prose outside the JSON object.',
  prompt: (input) =>
    [
      `Tenant: ${input.tenantId}`,
      '',
      `Existing fact slugs (DO NOT propose these): ${
        input.existingFactSlugs.length > 0 ? input.existingFactSlugs.join(', ') : '(none)'
      }`,
      '',
      '## Audit log excerpt',
      '```',
      input.auditExcerpt,
      '```',
      '',
      ...(input.workingExcerpt
        ? ['## Working memory excerpt', '```', input.workingExcerpt, '```', '']
        : []),
      'Produce a JSON object with these fields:',
      '- proposals: array (0–10) of fact proposals; each has slug (kebab-case ≤ 60 chars), ',
      '  title (≤ 120 chars), body (markdown, 20–1500 chars), tags (1–8 strings),',
      '  confidence (0–1), rationale (10–400 chars: why this is promotable).',
      '- skipped: array of short strings naming concrete findings you saw but chose NOT to',
      '  promote, with a reason fragment in parentheses.',
      '- summary: one paragraph (≤ 400 chars) describing the overall state of the memory.',
      '',
      'Rules:',
      '- Be conservative. Better to skip 5 weak items than promote 1 weak item.',
      '- Minimum confidence to propose: 0.6.',
      '- NEVER include PII, secrets, or specific timestamps in the body.',
      '- If nothing is promotable, return proposals: [] and explain in summary.',
      '- Slugs must NOT collide with existing fact slugs listed above.',
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
