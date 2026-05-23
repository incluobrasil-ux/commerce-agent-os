// Noop client — fallback seguro quando não há credencial ou em testes.
// Sempre retorna a mesma resposta canned; custo e latência zero.
// NUNCA usar em produção.

import { type AnthropicClientOptions, makeAnthropicComplete } from './anthropic-client.js';
import type { CompleteFn, CompleteResult } from './types.js';

export interface NoopOptions {
  /** Texto que o complete retorna (default: JSON `{ ok: true, note: 'noop-complete' }`). */
  cannedText?: string;
  /** Identificador do modelo a reportar (default: `noop`). */
  cannedModel?: string;
}

/**
 * Retorna um CompleteFn que ignora o input e devolve uma resposta fixa.
 * Útil para: testes sem rede, smoke quando a key está ausente, modo dry-run.
 */
export function makeNoopComplete(opts: NoopOptions = {}): CompleteFn {
  const text = opts.cannedText ?? '{"ok":true,"note":"noop-complete"}';
  const model = opts.cannedModel ?? 'noop';
  return async (_input): Promise<CompleteResult> => ({
    text,
    model,
    usage: { inputTokens: 0, outputTokens: 0 },
    costUsd: 0,
    durationMs: 0,
  });
}

export type LLMMode = 'anthropic' | 'noop';

export interface LLMResolution {
  /** Função de completion pronta para chamar. */
  complete: CompleteFn;
  /** Qual provider foi escolhido. Útil para logging upstream. */
  mode: LLMMode;
  /** Motivo do fallback quando mode === 'noop'. */
  reason?: string;
}

/**
 * Resolve o CompleteFn baseado no ambiente:
 * - Se `ANTHROPIC_API_KEY` (ou `opts.apiKey`/`opts.client`) presente → cliente real.
 * - Caso contrário → noop, retornando `mode: 'noop'` para o caller decidir o que fazer.
 *
 * NUNCA lança. Use `makeAnthropicComplete()` diretamente quando ausência de key
 * deve ser erro fatal.
 */
export function tryMakeAnthropicComplete(opts: AnthropicClientOptions = {}): LLMResolution {
  const apiKey = opts.apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!opts.client && !apiKey) {
    return {
      complete: makeNoopComplete(),
      mode: 'noop',
      reason: 'ANTHROPIC_API_KEY ausente — fallback noop ativo',
    };
  }
  return {
    complete: makeAnthropicComplete(opts),
    mode: 'anthropic',
  };
}
