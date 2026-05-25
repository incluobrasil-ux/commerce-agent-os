// product-feed-seo — propõe title/description otimizados para 1 produto.
// Não escreve nada; output é proposta auditável. catalog-feed-ops decide aplicar.

import { defineAgent } from '@cao/runtime';
import { z } from 'zod';

export const inputSchema = z.object({
  productHandle: z.string().min(1),
  originalTitle: z.string().min(1).max(300),
  originalDescription: z.string(),
  brand: z.string().nullable(),
  productType: z.string().nullable(),
  /** Hard limits Google Merchant. */
  maxTitleChars: z.number().int().positive(),
  maxDescriptionChars: z.number().int().positive(),
});
export type SEOInput = z.infer<typeof inputSchema>;

export const outputSchema = z.object({
  suggestedTitle: z.string().min(1),
  suggestedDescription: z.string().min(1),
  rationale: z.string().min(10).max(400),
  changedTitle: z.boolean(),
  changedDescription: z.boolean(),
  riskFlags: z.array(z.string()),
});
export type SEOOutput = z.infer<typeof outputSchema>;

export const productFeedSEOAgent = defineAgent<SEOInput, SEOOutput>({
  name: 'product-feed-seo',
  tier: 4,
  inputSchema,
  outputSchema,
  model: 'claude-sonnet-4-6',
  system:
    'You are an e-commerce SEO copywriter optimizing product listings for both Google Merchant ' +
    'Center and SEO PDP. You produce minimal, conservative changes that improve discoverability ' +
    'without hyperbole, prohibited words, or invented facts. Always respond with valid JSON ' +
    'matching the schema. No prose outside the JSON object.',
  prompt: (input) =>
    [
      `Product: ${input.productHandle}`,
      `Brand: ${input.brand ?? '(unknown)'}`,
      `Type: ${input.productType ?? '(unknown)'}`,
      '',
      '## Original',
      `Title: ${input.originalTitle}`,
      `Description: ${input.originalDescription.slice(0, 2000)}`,
      '',
      '## Constraints',
      `- suggestedTitle ≤ ${input.maxTitleChars} chars`,
      `- suggestedDescription ≤ ${input.maxDescriptionChars} chars`,
      '- No hyperbole ("best ever", "unbeatable"), no medical/health claims',
      '- No invented attributes (color, material, etc.) — work only with what is in the input',
      '- If input title is already strong, return changedTitle: false and copy original',
      '',
      'Produce JSON with these fields:',
      '- suggestedTitle, suggestedDescription: optimized text',
      '- rationale: 10–400 chars explaining the changes (or why none)',
      '- changedTitle, changedDescription: booleans',
      '- riskFlags: array of concerns (e.g., "title too generic", "description truncated"); empty if none',
      '',
      'Respond with the JSON object only.',
    ].join('\n'),
  parseOutput: (text) => {
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/i, '');
    return JSON.parse(cleaned);
  },
});
