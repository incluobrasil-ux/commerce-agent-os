// Tabela de pricing USD por 1M tokens.
// Valores aproximados; atualizar quando provider alterar.

export interface ModelPricing {
  inputPerMillion: number;
  outputPerMillion: number;
}

export const PRICING: Record<string, ModelPricing> = {
  // Anthropic Claude (valores ilustrativos para MVP — ajustar com pricing oficial em runtime real).
  'claude-opus-4-7': { inputPerMillion: 15, outputPerMillion: 75 },
  'claude-sonnet-4-6': { inputPerMillion: 3, outputPerMillion: 15 },
  'claude-haiku-4-5-20251001': { inputPerMillion: 0.8, outputPerMillion: 4 },
};

export const DEFAULT_MODEL = 'claude-sonnet-4-6';

export function estimateCostUsd(model: string, inputTokens: number, outputTokens: number): number {
  const p = PRICING[model];
  if (!p) return 0; // modelo desconhecido — retorna 0 em vez de quebrar
  return (
    (inputTokens / 1_000_000) * p.inputPerMillion + (outputTokens / 1_000_000) * p.outputPerMillion
  );
}
