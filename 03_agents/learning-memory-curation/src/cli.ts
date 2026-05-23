#!/usr/bin/env node
// CLI: pnpm curate:memory [--tenant=<id>] [--dry-run]
//
// Lê 07_memory/vault/<tenant>/audit/ (todos os dias) + working/ recente, chama Claude
// via @cao/runtime, e (sem --dry-run) escreve propostas em <tenant>/facts/<slug>.md.
// Audit log do RUN em <tenant>/audit/<YYYY-MM-DD>.md (via @cao/runtime).

import { promises as fs } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { makeAnthropicComplete } from '@cao/llm';
import { Memory } from '@cao/memory';
import { ConsoleProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { learningMemoryCurationAgent } from './index.js';

interface CliArgs {
  tenantId: string;
  dryRun: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args = argv.slice(2);
  let tenantId = '_test';
  let dryRun = false;

  for (const a of args) {
    if (a.startsWith('--tenant=')) {
      tenantId = a.slice('--tenant='.length);
    } else if (a === '--dry-run') {
      dryRun = true;
    } else if (a.startsWith('--')) {
      fail(`Flag desconhecida: ${a}`);
    } else {
      fail(`Argumento inesperado: ${a}`);
    }
  }

  return { tenantId, dryRun };
}

function fail(msg: string): never {
  process.stderr.write(`[learning-memory-curation] ${msg}\n`);
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
      // ignora arquivos não-legíveis
    }
  }
  return parts.join('\n\n');
}

async function listExistingFactSlugs(memory: Memory): Promise<string[]> {
  const entries = await memory.list('facts');
  return entries
    .filter((e) => e.endsWith('.md'))
    .map((e) => e.replace(/^facts\//, '').replace(/\.md$/, ''));
}

async function main(): Promise<void> {
  const { tenantId, dryRun } = parseArgs(process.argv);
  const repoRoot = resolve(process.cwd());
  const vaultRoot = resolve(repoRoot, '07_memory/vault');
  const memory = new Memory({ vaultRoot, tenantId });
  await memory.ensureBaseDir();

  const auditExcerpt = await readBucket(memory, 'audit');
  const workingExcerpt = await readBucket(memory, 'working');
  const existingFactSlugs = await listExistingFactSlugs(memory);

  if (auditExcerpt.length < 20) {
    fail(
      `Tenant ${tenantId} não tem audit log suficiente (got ${auditExcerpt.length} chars). Rode agentes com este tenant primeiro (ex.: pnpm synthesize:audit ... --tenant=${tenantId}).`,
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
    learningMemoryCurationAgent,
    { tenantId, auditExcerpt, workingExcerpt, existingFactSlugs },
    { tenantId },
    { complete, memory, observability },
  );

  const proposals = result.output.proposals;
  const written: string[] = [];

  if (!dryRun) {
    for (const p of proposals) {
      const path = `facts/${p.slug}.md`;
      const frontmatter = [
        '---',
        `created_at: ${new Date().toISOString()}`,
        `updated_at: ${new Date().toISOString()}`,
        `tags: [${p.tags.join(', ')}]`,
        'source: agent:learning-memory-curation',
        `confidence: ${p.confidence}`,
        `rationale: "${p.rationale.replace(/"/g, "'")}"`,
        '---',
        '',
        `# ${p.title}`,
        '',
        p.body,
        '',
      ].join('\n');
      // Diretório facts/ pode não existir ainda
      const absPath = join(vaultRoot, tenantId, path);
      await fs.mkdir(dirname(absPath), { recursive: true });
      await memory.write(path, frontmatter);
      written.push(p.slug);
    }
  }

  const lines = [
    `[learning-memory-curation] tenant=${tenantId} model=${result.model}`,
    `[learning-memory-curation] ${result.durationMs}ms cost=$${result.costUsd.toFixed(6)}`,
    `[learning-memory-curation] proposals=${proposals.length} skipped=${result.output.skipped.length}`,
    `[learning-memory-curation] summary: ${result.output.summary}`,
    dryRun
      ? '[learning-memory-curation] dry-run: nada escrito em facts/'
      : `[learning-memory-curation] wrote ${written.length} fact(s) to 07_memory/vault/${tenantId}/facts/`,
  ];
  if (written.length > 0) {
    for (const slug of written) lines.push(`  - facts/${slug}.md`);
  }
  process.stdout.write(`${lines.join('\n')}\n`);
}

main().catch((err: unknown) => {
  process.stderr.write(
    `[learning-memory-curation] fatal: ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(1);
});
