#!/usr/bin/env node
// Smoke isolado de @cao/llm — UMA chamada mínima ao Claude para confirmar:
//   1. Key presente em .env.local ou env shell.
//   2. Rede + SDK funcionando.
//   3. Custo + tokens + latência reportados.
//
// Sem key → exit 0 com mensagem orientando (não é falha; é estado "aguardando").
// Com key → exit 0 se resposta recebida; exit 1 só em erro real (401, rede, etc.).
//
// Uso: pnpm llm:smoke

import { DEFAULT_MODEL, LLMConfigError, makeAnthropicComplete } from '../src/index.js';

async function main(): Promise<void> {
  let complete: ReturnType<typeof makeAnthropicComplete>;
  try {
    complete = makeAnthropicComplete();
  } catch (err) {
    if (err instanceof LLMConfigError) {
      process.stdout.write(
        '[llm:smoke] SKIPPED — ANTHROPIC_API_KEY ausente.\n' +
          '[llm:smoke] copie a key do console Anthropic para .env.local e rode novamente.\n' +
          '[llm:smoke] nada quebrou; baseline continua válido.\n',
      );
      process.exit(0);
    }
    throw err;
  }

  process.stdout.write(`[llm:smoke] enviando prompt mínimo ao ${DEFAULT_MODEL}...\n`);

  const startMs = Date.now();
  const result = await complete({
    user: 'Reply with the exact string OK and nothing else.',
    maxTokens: 20,
  });
  const wallMs = Date.now() - startMs;

  const lines = [
    `[llm:smoke] resposta: ${JSON.stringify(result.text)}`,
    `[llm:smoke] modelo: ${result.model}`,
    `[llm:smoke] tokens in/out: ${result.usage.inputTokens}/${result.usage.outputTokens}`,
    `[llm:smoke] custo: $${result.costUsd.toFixed(6)}`,
    `[llm:smoke] latência: ${result.durationMs}ms (wall ${wallMs}ms)`,
  ];
  process.stdout.write(`${lines.join('\n')}\n`);

  if (!result.text.trim()) {
    process.stderr.write('[llm:smoke] FAIL: resposta vazia\n');
    process.exit(1);
  }

  process.stdout.write('[llm:smoke] OK\n');
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[llm:smoke] erro: ${msg}\n`);
  if (msg.includes('401') || msg.includes('invalid x-api-key')) {
    process.stderr.write(
      '[llm:smoke] → key inválida ou revogada. Atualize .env.local com a key nova.\n',
    );
  }
  process.exit(1);
});
