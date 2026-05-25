// Cliente Anthropic — wrapper fino. Resolve API key via env por default.

import Anthropic from '@anthropic-ai/sdk';
import { BaseError } from '@cao/core';
import { DEFAULT_MODEL, estimateCostUsd } from './cost.js';
import type { CompleteFn, CompleteInput, CompleteResult } from './types.js';

export class LLMConfigError extends BaseError {
  constructor(message: string) {
    super(message, 'LLM_CONFIG');
  }
}

export interface AnthropicClientOptions {
  /** Defaults a process.env.ANTHROPIC_API_KEY. */
  apiKey?: string;
  /** Modelo default. */
  defaultModel?: string;
  /** Cliente Anthropic injetável para teste. */
  client?: Anthropic;
}

/**
 * Cria um CompleteFn ligado ao Anthropic SDK.
 * Retorna função simples — não classe — para facilitar injection em runtime.
 */
export function makeAnthropicComplete(opts: AnthropicClientOptions = {}): CompleteFn {
  const apiKey = opts.apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!opts.client && !apiKey) {
    throw new LLMConfigError(
      'ANTHROPIC_API_KEY não configurada. Defina env ou passe apiKey/client em opts.',
    );
  }
  const client = opts.client ?? new Anthropic({ apiKey });
  const defaultModel = opts.defaultModel ?? DEFAULT_MODEL;

  return async function complete(input: CompleteInput): Promise<CompleteResult> {
    const model = input.model ?? defaultModel;
    const startMs = Date.now();
    const response = await client.messages.create({
      model,
      max_tokens: input.maxTokens ?? 1024,
      ...(input.temperature !== undefined && { temperature: input.temperature }),
      ...(input.system !== undefined && { system: input.system }),
      messages: [{ role: 'user', content: input.user }],
    });
    const durationMs = Date.now() - startMs;

    // Anthropic retorna content como array de blocks; concatenamos texto.
    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    const usage = {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };

    return {
      text,
      model,
      usage,
      costUsd: estimateCostUsd(model, usage.inputTokens, usage.outputTokens),
      durationMs,
    };
  };
}
