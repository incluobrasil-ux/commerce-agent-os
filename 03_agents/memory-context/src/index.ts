// memory-context — read-only. Lê facts/, working/ (snapshot recente) e audit/ (recent)
// de um tenant, e produz um context brief estruturado para o próximo agente usar.
//
// Output focado em o que o próximo agente PRECISA saber: brand voice, restrições
// duras, sinais recentes, e recomendações operacionais.

import { defineAgent } from '@cao/runtime';
import { z } from 'zod';

export const inputSchema = z.object({
  tenantId: z.string().min(1),
  taskScope: z.string().min(5).max(500),
  factsExcerpt: z.string(),
  workingExcerpt: z.string(),
  auditExcerpt: z.string(),
});
export type ContextInput = z.infer<typeof inputSchema>;

export const outputSchema = z.object({
  brandVoice: z.string().max(280),
  hardConstraints: z.array(z.string().min(3).max(200)),
  recentSignals: z.array(z.string().min(3).max(200)),
  knownGaps: z.array(z.string().min(3).max(200)),
  recommendation: z.string().min(10).max(500),
  confidence: z.number().min(0).max(1),
});
export type ContextOutput = z.infer<typeof outputSchema>;

export const memoryContextAgent = defineAgent<ContextInput, ContextOutput>({
  name: 'memory-context',
  tier: 0,
  inputSchema,
  outputSchema,
  model: 'claude-sonnet-4-6',
  system:
    'You are a memory context curator. You read the curated facts, working memory, and ' +
    'recent audit log of a tenant, then produce a tight context brief tailored to a specific ' +
    'task. You never invent information. If a field has no signal in the input, return an ' +
    'empty value (empty string or empty array) and lower your confidence. You always respond ' +
    'with valid JSON matching the requested schema. No prose outside the JSON object.',
  prompt: (input) =>
    [
      `Tenant: ${input.tenantId}`,
      'Task scope (what the next agent will do):',
      `> ${input.taskScope}`,
      '',
      '## Facts (curated)',
      '```',
      input.factsExcerpt || '(no facts yet)',
      '```',
      '',
      '## Working memory (raw, recent)',
      '```',
      input.workingExcerpt || '(no working memory)',
      '```',
      '',
      '## Audit log (recent activity)',
      '```',
      input.auditExcerpt || '(no recent activity)',
      '```',
      '',
      'Produce a JSON object with these fields:',
      '- brandVoice: 1–2 sentences (≤ 280 chars) describing tone/voice constraints. Empty string if no signal.',
      '- hardConstraints: array of short strings — non-negotiable rules (legal, brand, technical).',
      '- recentSignals: array of short strings — what changed recently and matters for the task.',
      '- knownGaps: array of short strings — what is unknown or unverified that the next agent should flag.',
      '- recommendation: a single short paragraph (10–500 chars) — what the next agent should do or avoid given this context.',
      '- confidence: 0–1 — your confidence in this brief; LOWER when facts/working/audit are thin.',
      '',
      'Rules:',
      '- Do NOT invent facts. If something is not in the input, omit or mark in knownGaps.',
      '- Keep arrays SHORT (≤ 8 items each). Quality over quantity.',
      '- Tie everything to the taskScope — irrelevant context is noise.',
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
