// market-intelligence — Tier 1. Sintetiza sinais de mercado a partir
// de texto/URLs já coletados (sem fetcher externo).
//
// Design inspirado em feedgen (01_upstreams/feedgen, Apache-2.0): geração
// estruturada com LLM a partir de fontes textuais, separando observação
// e inferência. Adaptado, não copiado.

import { defineAgent } from '@cao/runtime';
import { z } from 'zod';

export const inputSchema = z.object({
  tenantId: z.string().min(1),
  marketQuestion: z.string().min(5).max(500),
  sourceTexts: z.array(z.string().min(20)).min(1).max(20),
  sourceLabels: z.array(z.string()),
  category: z.string(),
  region: z.string(),
  timeframe: z.string(),
  constraints: z.array(z.string()),
});
export type MarketIntelInput = z.infer<typeof inputSchema>;

const signalSchema = z.object({
  signal: z.string().min(5).max(300),
  evidence: z.string().min(5).max(500),
  confidence: z.enum(['low', 'medium', 'high']),
});
export type MarketSignal = z.infer<typeof signalSchema>;

export const outputSchema = z.object({
  summary: z.string().min(20).max(1500),
  signals: z.array(signalSchema).min(0).max(20),
  opportunities: z.array(z.string().min(3).max(300)),
  threats: z.array(z.string().min(3).max(300)),
  recommendedActions: z.array(z.string().min(5).max(300)),
  assumptions: z.array(z.string().min(3).max(300)),
});
export type MarketIntelOutput = z.infer<typeof outputSchema>;

export const marketIntelligenceAgent = defineAgent<MarketIntelInput, MarketIntelOutput>({
  name: 'market-intelligence',
  tier: 1,
  inputSchema,
  outputSchema,
  model: 'claude-sonnet-4-6',
  system:
    'You are a market intelligence analyst. You synthesize ONLY from material provided. You ' +
    'separate observation (evidence-backed) from inference (assumption-backed). You never ' +
    'invent numbers, citations, or facts not present in the input. You always respond with ' +
    'valid JSON matching the requested schema. No prose outside the JSON object.',
  prompt: (input) => {
    const lines: string[] = [];
    lines.push(`Tenant: ${input.tenantId}`);
    lines.push(`Market question: ${input.marketQuestion}`);
    if (input.category) lines.push(`Category: ${input.category}`);
    if (input.region) lines.push(`Region: ${input.region}`);
    if (input.timeframe) lines.push(`Timeframe: ${input.timeframe}`);
    if (input.constraints.length > 0) {
      lines.push('');
      lines.push('## Constraints');
      for (const c of input.constraints) lines.push(`- ${c}`);
    }
    lines.push('');
    lines.push('## Source material');
    input.sourceTexts.forEach((text, i) => {
      const label = input.sourceLabels[i] ?? `source-${i + 1}`;
      lines.push(`### ${label}`);
      lines.push('```');
      lines.push(text.slice(0, 4000));
      lines.push('```');
      lines.push('');
    });
    lines.push('Produce JSON with these fields:');
    lines.push(
      '- summary: 1 paragraph (20–1500 chars) addressing the market question from sources.',
    );
    lines.push(
      '- signals: array (0–20) of { signal, evidence (quote/paraphrase from source), confidence }.',
    );
    lines.push('- opportunities: array of short strings — what the tenant could act on.');
    lines.push('- threats: array of short strings — what could go wrong.');
    lines.push('- recommendedActions: array of short strings — concrete next moves.');
    lines.push('- assumptions: array — anything you inferred WITHOUT explicit evidence.');
    lines.push('');
    lines.push('Rules:');
    lines.push('- Synthesize ONLY from sourceTexts. No external knowledge.');
    lines.push('- For every signal, the evidence MUST tie back to a source above.');
    lines.push(
      '- If sources are insufficient to answer, return empty arrays and explain in summary.',
    );
    lines.push('');
    lines.push('Respond with the JSON object only. No code fences, no commentary.');
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
