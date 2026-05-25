#!/usr/bin/env node
// CLI: pnpm synthesize:audit <path-to-audit.md> [--tenant=<id>]
//
// Lê um relatório markdown do repo-auditor, invoca Claude via @cao/runtime,
// escreve síntese ao lado: <original>.synthesis.md.
// Audit log em 07_memory/vault/<tenant>/audit/<YYYY-MM-DD>.md.

import { promises as fs } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { makeAnthropicComplete } from '@cao/llm';
import { Memory } from '@cao/memory';
import { ConsoleProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { auditSynthesizerAgent } from './index.js';

interface CliArgs {
  auditPath: string;
  tenantId: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args = argv.slice(2);
  let auditPath: string | undefined;
  let tenantId = '_test';

  for (const a of args) {
    if (a.startsWith('--tenant=')) {
      tenantId = a.slice('--tenant='.length);
    } else if (a.startsWith('--')) {
      fail(`Flag desconhecida: ${a}`);
    } else if (!auditPath) {
      auditPath = a;
    } else {
      fail(`Argumento extra inesperado: ${a}`);
    }
  }

  if (!auditPath) {
    fail('Uso: audit-synthesizer <path-to-audit.md> [--tenant=<id>]');
  }

  return { auditPath, tenantId };
}

function fail(msg: string): never {
  process.stderr.write(`[audit-synthesizer] ${msg}\n`);
  process.exit(2);
}

async function main(): Promise<void> {
  const { auditPath, tenantId } = parseArgs(process.argv);
  const absPath = resolve(auditPath);

  let auditMarkdown: string;
  try {
    auditMarkdown = await fs.readFile(absPath, 'utf8');
  } catch {
    fail(`Não consegui ler ${absPath}`);
  }

  // Heurística: extrair repoName da 1ª linha "# Audit — <name>"
  const headerMatch = auditMarkdown.match(/^#\s+Audit\s+—\s+(.+)$/m);
  const repoName = headerMatch?.[1]?.trim() ?? basename(absPath, '.md');

  const repoRoot = resolve(process.cwd());
  const vaultRoot = resolve(repoRoot, '07_memory/vault');
  const memory = new Memory({ vaultRoot, tenantId });
  await memory.ensureBaseDir();

  const observability = new ConsoleProvider();

  let complete: ReturnType<typeof makeAnthropicComplete>;
  try {
    complete = makeAnthropicComplete();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    fail(
      `LLM não configurado: ${msg}. Defina ANTHROPIC_API_KEY em .env.local e rode com 'pnpm synthesize:audit ...'.`,
    );
  }

  const result = await runAgent(
    auditSynthesizerAgent,
    { repoName, auditMarkdown },
    { tenantId },
    { complete, memory, observability },
  );

  const outPath = absPath.replace(/\.md$/, '.synthesis.md');
  const out = [
    `# Audit synthesis — ${repoName}`,
    '',
    `- **Gerado em:** ${new Date().toISOString()}`,
    `- **Modelo:** ${result.model}`,
    `- **Custo (USD):** ${result.costUsd.toFixed(6)}`,
    `- **Run ID:** ${result.runId}`,
    `- **Risco apontado:** ${result.output.riskLevel}`,
    '',
    '## One-liner',
    '',
    `> ${result.output.oneLiner}`,
    '',
    '## Bullets',
    '',
    ...result.output.summary.map((b) => `- ${b}`),
    '',
    '---',
    `_Sintetizado pelo agente \`audit-synthesizer\` a partir de_ \`${basename(absPath)}\`.`,
  ].join('\n');

  await fs.mkdir(dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, out, 'utf8');

  const lines = [
    `[audit-synthesizer] repo=${repoName} model=${result.model}`,
    `[audit-synthesizer] tokens in/out=${result.durationMs}ms cost=$${result.costUsd.toFixed(6)}`,
    `[audit-synthesizer] risk=${result.output.riskLevel}`,
    `[audit-synthesizer] synthesis: ${outPath}`,
    `[audit-synthesizer] audit log: 07_memory/vault/${tenantId}/audit/`,
  ];
  process.stdout.write(`${lines.join('\n')}\n`);
}

main().catch((err: unknown) => {
  process.stderr.write(
    `[audit-synthesizer] fatal: ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(1);
});
