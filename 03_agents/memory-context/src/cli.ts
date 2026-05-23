#!/usr/bin/env node
// CLI: pnpm context:brief --task="<descrição da próxima tarefa>" [--tenant=<id>] [--out=<dir>]
//
// Lê tudo o que está em facts/, working/ e audit/ do tenant, monta input,
// invoca o agente memory-context, e escreve o brief em:
//   12_reports/context-briefs/<tenant>-<timestamp>.md
//
// Audit log automático em 07_memory/vault/<tenant>/audit/<YYYY-MM-DD>.md.

import { promises as fs } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { makeAnthropicComplete } from '@cao/llm';
import { Memory } from '@cao/memory';
import { ConsoleProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { memoryContextAgent } from './index.js';

interface CliArgs {
  tenantId: string;
  taskScope: string;
  outDir: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args = argv.slice(2);
  let tenantId = '_test';
  let taskScope: string | undefined;
  let outDir = resolve(process.cwd(), '12_reports/context-briefs');

  for (const a of args) {
    if (a.startsWith('--tenant=')) {
      tenantId = a.slice('--tenant='.length);
    } else if (a.startsWith('--task=')) {
      taskScope = a.slice('--task='.length);
    } else if (a.startsWith('--out=')) {
      outDir = resolve(a.slice('--out='.length));
    } else if (a.startsWith('--')) {
      fail(`Flag desconhecida: ${a}`);
    } else {
      fail(`Argumento inesperado: ${a}`);
    }
  }

  if (!taskScope) {
    fail('Uso: memory-context --task="<descrição>" [--tenant=<id>] [--out=<dir>]');
  }

  return { tenantId, taskScope, outDir };
}

function fail(msg: string): never {
  process.stderr.write(`[memory-context] ${msg}\n`);
  process.exit(2);
}

async function readBucket(memory: Memory, bucket: string): Promise<string> {
  const entries = await memory.list(bucket);
  if (entries.length === 0) return '';
  const parts: string[] = [];
  for (const entry of entries) {
    try {
      const content = await memory.read(entry);
      parts.push(`### ${entry}\n${content}`);
    } catch {
      // ignora não-legíveis
    }
  }
  return parts.join('\n\n');
}

function timestamp(d: Date): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`
  );
}

async function main(): Promise<void> {
  const { tenantId, taskScope, outDir } = parseArgs(process.argv);
  const repoRoot = resolve(process.cwd());
  const vaultRoot = resolve(repoRoot, '07_memory/vault');
  const memory = new Memory({ vaultRoot, tenantId });
  await memory.ensureBaseDir();

  const factsExcerpt = await readBucket(memory, 'facts');
  const workingExcerpt = await readBucket(memory, 'working');
  const auditExcerpt = await readBucket(memory, 'audit');

  if (factsExcerpt.length + workingExcerpt.length + auditExcerpt.length < 50) {
    fail(
      `Tenant ${tenantId} não tem memória suficiente para um brief útil. Rode outros agentes (synthesize:audit, curate:memory) primeiro.`,
    );
  }

  const observability = new ConsoleProvider();
  let complete: ReturnType<typeof makeAnthropicComplete>;
  try {
    complete = makeAnthropicComplete();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    fail(`LLM não configurado: ${msg}. Defina ANTHROPIC_API_KEY em .env.local.`);
  }

  const result = await runAgent(
    memoryContextAgent,
    { tenantId, taskScope, factsExcerpt, workingExcerpt, auditExcerpt },
    { tenantId },
    { complete, memory, observability },
  );

  const out = result.output;
  const md = [
    `# Context brief — ${tenantId}`,
    '',
    `- **Gerado em:** ${new Date().toISOString()}`,
    `- **Task scope:** ${taskScope}`,
    `- **Modelo:** ${result.model}`,
    `- **Custo (USD):** ${result.costUsd.toFixed(6)}`,
    `- **Run ID:** ${result.runId}`,
    `- **Confidence:** ${out.confidence}`,
    '',
    '## Brand voice',
    '',
    out.brandVoice || '_(sem sinal)_',
    '',
    '## Hard constraints',
    '',
    ...(out.hardConstraints.length > 0
      ? out.hardConstraints.map((c) => `- ${c}`)
      : ['_(nenhuma)_']),
    '',
    '## Recent signals',
    '',
    ...(out.recentSignals.length > 0 ? out.recentSignals.map((s) => `- ${s}`) : ['_(nenhum)_']),
    '',
    '## Known gaps',
    '',
    ...(out.knownGaps.length > 0 ? out.knownGaps.map((g) => `- ${g}`) : ['_(nenhum)_']),
    '',
    '## Recommendation',
    '',
    out.recommendation,
    '',
    '---',
    `_Gerado por \`@cao/memory-context\` para o tenant \`${tenantId}\`._`,
  ].join('\n');

  const filename = `${tenantId}-${timestamp(new Date())}.md`;
  const outPath = join(outDir, filename);
  await fs.mkdir(dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, md, 'utf8');

  const lines = [
    `[memory-context] tenant=${tenantId} model=${result.model}`,
    `[memory-context] ${result.durationMs}ms cost=$${result.costUsd.toFixed(6)} confidence=${out.confidence}`,
    `[memory-context] constraints=${out.hardConstraints.length} signals=${out.recentSignals.length} gaps=${out.knownGaps.length}`,
    `[memory-context] brief: ${outPath}`,
  ];
  process.stdout.write(`${lines.join('\n')}\n`);
}

main().catch((err: unknown) => {
  process.stderr.write(
    `[memory-context] fatal: ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(1);
});
