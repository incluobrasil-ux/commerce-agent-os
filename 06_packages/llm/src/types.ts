// Tipos do client de LLM — interface pequena, intercambiável entre providers.

export interface CompleteInput {
  /** Mensagem do usuário. */
  user: string;
  /** Instrução de sistema (opcional). */
  system?: string;
  /** Modelo alvo (default: definido no client). */
  model?: string;
  /** Limite de tokens de saída. */
  maxTokens?: number;
  /** Temperatura 0..1. */
  temperature?: number;
}

export interface Usage {
  inputTokens: number;
  outputTokens: number;
}

export interface CompleteResult {
  text: string;
  model: string;
  usage: Usage;
  /** Custo estimado em USD (lookup em PRICING). */
  costUsd: number;
  durationMs: number;
}

export type CompleteFn = (input: CompleteInput) => Promise<CompleteResult>;
