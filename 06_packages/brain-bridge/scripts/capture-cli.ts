#!/usr/bin/env node
// CLI: pnpm ops:capture <input.json>
// Lê um JSON conforme `CaptureInput`, chama captureRun, imprime o caminho do summary.
// Útil para qualquer operador (humano ou script externo) escrever 1 entrada no cérebro.
//
// Exemplo de JSON mínimo:
// {
//   "kind": "agent-run",
//   "slug": "sample",
//   "result": "green",
//   "title": "Minha primeira captura",
//   "source": "human:incluobrasil",
//   "tags": ["test"],
//   "body": {
//     "context": "Validação manual.",
//     "whatHappened": ["Rodei X."],
//     "findings": [],
//     "impact": "Nenhum em prod.",
//     "references": []
//   },
//   "sessionLogLine": "Feito: validação manual."
// }

import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import { captureRun } from '../src/capture.js';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const path = args[0];
  if (!path) {
    process.stderr.write(
      '[ops:capture] Uso: pnpm ops:capture <input.json>\n' +
        '[ops:capture] Veja exemplo no topo de 06_packages/brain-bridge/scripts/capture-cli.ts\n',
    );
    process.exit(2);
  }

  const absPath = resolve(path);
  let json: unknown;
  try {
    const text = await fs.readFile(absPath, 'utf8');
    json = JSON.parse(text);
  } catch (err) {
    process.stderr.write(
      `[ops:capture] erro lendo ${absPath}: ${err instanceof Error ? err.message : String(err)}\n`,
    );
    process.exit(2);
  }

  const result = await captureRun(json);

  process.stdout.write(`[ops:capture] summary: ${result.summaryPath}\n`);
  process.stdout.write(`[ops:capture] ${result.filesUpdated.length} arquivo(s) atualizado(s):\n`);
  for (const p of result.filesUpdated) process.stdout.write(`  - ${p}\n`);
  process.stdout.write('[ops:capture] OK\n');
}

main().catch((err: unknown) => {
  process.stderr.write(`[ops:capture] erro: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
