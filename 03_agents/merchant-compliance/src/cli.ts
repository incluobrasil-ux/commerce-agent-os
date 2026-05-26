#!/usr/bin/env node
// CLI: pnpm merchant:compliance --content-file=path/to.txt --content-type=copy
//   --target-market=BR --category=apparel [--label="..."]

import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import { captureRun } from '@cao/brain-bridge';
import { assertTenantContext, assertTenantStoreContext } from '@cao/core';
import { makeAnthropicComplete } from '@cao/llm';
import { Memory } from '@cao/memory';
import { ConsoleProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import {
  compliancePath,
  complianceTimestamp,
  merchantComplianceAgent,
  renderCompliance,
} from './index.js';

type ContentType = 'copy' | 'product-description' | 'policy' | 'email' | 'ad' | 'other';
const VALID_TYPES: ContentType[] = [
  'copy',
  'product-description',
  'policy',
  'email',
  'ad',
  'other',
];

interface CliArgs {
  tenantId: string;
  storeId: string;
  contentType: ContentType;
  content: string;
  contentFile: string;
  targetMarket: string;
  category: string;
  sensitiveTopics: string[];
  brandPolicies: string;
  brandPoliciesFile: string;
  label: string;
  capture: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    tenantId: '_test',
    storeId: '',
    contentType: 'copy',
    content: '',
    contentFile: '',
    targetMarket: '',
    category: '',
    sensitiveTopics: [],
    brandPolicies: '',
    brandPoliciesFile: '',
    label: '',
    capture: false,
  };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--tenant=')) args.tenantId = a.slice('--tenant='.length);
    else if (a.startsWith('--store=')) args.storeId = a.slice('--store='.length);
    else if (a.startsWith('--content-type=')) {
      const v = a.slice('--content-type='.length) as ContentType;
      if (!VALID_TYPES.includes(v)) fail(`--content-type inválido: ${v}`);
      args.contentType = v;
    } else if (a.startsWith('--content=')) args.content = a.slice('--content='.length);
    else if (a.startsWith('--content-file=')) args.contentFile = a.slice('--content-file='.length);
    else if (a.startsWith('--target-market='))
      args.targetMarket = a.slice('--target-market='.length);
    else if (a.startsWith('--category=')) args.category = a.slice('--category='.length);
    else if (a.startsWith('--sensitive='))
      args.sensitiveTopics.push(a.slice('--sensitive='.length));
    else if (a.startsWith('--brand-policies='))
      args.brandPolicies = a.slice('--brand-policies='.length);
    else if (a.startsWith('--brand-policies-file='))
      args.brandPoliciesFile = a.slice('--brand-policies-file='.length);
    else if (a.startsWith('--label=')) args.label = a.slice('--label='.length);
    else if (a === '--capture') args.capture = true;
    else if (a.startsWith('--')) fail(`Flag desconhecida: ${a}`);
    else fail(`Argumento inesperado: ${a}`);
  }
  if (!args.content && !args.contentFile) fail('--content OU --content-file é obrigatório');
  return args;
}

function fail(msg: string): never {
  process.stderr.write(`[merchant:compliance] ${msg}\n`);
  process.exit(2);
}

function skipped(msg: string): never {
  process.stdout.write(`[merchant:compliance] SKIPPED — ${msg}\n`);
  process.exit(0);
}

async function loadFile(p: string): Promise<string> {
  return fs.readFile(resolve(p), 'utf8');
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  // Multi-tenant safety: assertion explícita antes de qualquer I/O.
  if (args.storeId) {
    assertTenantStoreContext(
      { tenantId: args.tenantId, storeId: args.storeId },
      'merchant:compliance',
    );
  } else {
    assertTenantContext({ tenantId: args.tenantId }, 'merchant:compliance');
  }
  const content = args.contentFile ? await loadFile(args.contentFile) : args.content;
  const brandPolicies = args.brandPoliciesFile
    ? await loadFile(args.brandPoliciesFile)
    : args.brandPolicies;

  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    skipped(
      `ANTHROPIC_API_KEY ausente em .env.local. ${content.length} chars lidos; execução pendente.`,
    );
  }

  const repoRoot = resolve(process.cwd());
  const memory = new Memory({
    vaultRoot: resolve(repoRoot, '07_memory/vault'),
    tenantId: args.tenantId,
    ...(args.storeId ? { storeId: args.storeId } : {}),
  });
  await memory.ensureBaseDir();

  const observability = new ConsoleProvider();
  const complete = makeAnthropicComplete();

  const input = {
    tenantId: args.tenantId,
    contentType: args.contentType,
    content,
    targetMarket: args.targetMarket,
    category: args.category,
    sensitiveTopics: args.sensitiveTopics,
    brandPolicies,
  };

  const result = await runAgent(
    merchantComplianceAgent,
    input,
    { tenantId: args.tenantId, ...(args.storeId ? { storeId: args.storeId } : {}) },
    { complete, memory, observability },
  );

  const ts = complianceTimestamp();
  const label = args.label || `${args.contentType}-${args.tenantId}`;
  const relPath = compliancePath(label, ts);
  const generatedAt = new Date().toISOString();
  const md = renderCompliance(input, result.output, {
    runId: result.runId,
    model: result.model,
    costUsd: result.costUsd,
    generatedAt,
    label,
  });
  await memory.write(relPath, md);
  const absPath = args.storeId
    ? resolve(repoRoot, '07_memory/vault/tenants', args.tenantId, 'stores', args.storeId, relPath)
    : resolve(repoRoot, '07_memory/vault/tenants', args.tenantId, relPath);

  const out = result.output;
  process.stdout.write(`[merchant:compliance] severity=${out.overallSeverity.toUpperCase()}\n`);
  process.stdout.write(
    `[merchant:compliance] legalRisks=${out.legalRisks.length} pii=${out.piiFlags.length} disclaimers=${out.requiredDisclaimers.length} revisions=${out.recommendedRevisions.length}\n`,
  );
  process.stdout.write(`[merchant:compliance] review: ${absPath}\n`);
  process.stdout.write(
    `[merchant:compliance] cost=$${result.costUsd.toFixed(6)} model=${result.model} ${result.durationMs}ms\n`,
  );

  if (args.capture) {
    const slugTenant = args.tenantId.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const slugStore = args.storeId ? args.storeId.replace(/[^a-z0-9-]/gi, '-').toLowerCase() : '';
    const slugLabel = label
      .replace(/[^a-z0-9-]/gi, '-')
      .toLowerCase()
      .slice(0, 30);
    const sevToColor: Record<string, 'green' | 'yellow' | 'red'> = {
      none: 'green',
      low: 'green',
      medium: 'yellow',
      high: 'red',
    };
    const overall = sevToColor[out.overallSeverity] ?? 'yellow';
    const captureSlug = slugStore
      ? `merchant-compliance-${slugTenant}-${slugStore}-${slugLabel}`
      : `merchant-compliance-${slugTenant}-${slugLabel}`;
    const titleScope = args.storeId
      ? `tenant=${args.tenantId}/store=${args.storeId}`
      : `tenant=${args.tenantId}`;
    const vaultRel = args.storeId
      ? `07_memory/vault/tenants/${args.tenantId}/stores/${args.storeId}/${relPath}`
      : `07_memory/vault/tenants/${args.tenantId}/${relPath}`;
    const cap = await captureRun({
      kind: 'agent-run',
      slug: captureSlug.slice(0, 60),
      result: overall,
      title: `Compliance review: ${label} (severity ${out.overallSeverity}, ${titleScope})`,
      source: 'agent:merchant-compliance',
      tags: args.storeId
        ? [
            'merchant-compliance',
            'tier-2',
            'compliance',
            'store-scoped',
            overall,
            out.overallSeverity,
          ]
        : ['merchant-compliance', 'tier-2', 'compliance', overall, out.overallSeverity],
      body: {
        context: `pnpm merchant:compliance revisou ${args.contentType} em ${titleScope}.`,
        whatHappened: [
          `Escopo: ${titleScope}.`,
          `Content type: ${args.contentType} (${content.length} chars).`,
          `Overall severity: ${out.overallSeverity}.`,
          `Review salvo em ${vaultRel}.`,
          `Custo: $${result.costUsd.toFixed(6)} (${result.model}).`,
        ],
        findings: [
          ...out.legalRisks.map((r) => `[legal:${r.severity}] ${r.topic}`),
          ...out.piiFlags.map((p) => `[pii] ${p.kind}`),
          ...out.policyGaps.map((g) => `[gap] ${g}`),
        ],
        impact: `${out.legalRisks.length} risco(s) legal · ${out.piiFlags.length} PII flag(s) · ${out.requiredDisclaimers.length} disclaimer(s) requerido(s).`,
        references: [vaultRel],
      },
      sessionLogLine: `merchant-compliance: ${label} (${titleScope}) → severity=${out.overallSeverity}, ${out.legalRisks.length} legal, ${out.piiFlags.length} pii.`,
      tenantId: args.tenantId,
      ...(args.storeId ? { storeId: args.storeId } : {}),
    });
    process.stdout.write(`[merchant:compliance] capture → ${cap.summaryPath}\n`);
  }

  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[merchant:compliance] erro: ${msg}\n`);
  if (msg.includes('401') || msg.includes('invalid x-api-key')) {
    process.stderr.write('[merchant:compliance] → key inválida. Atualize .env.local.\n');
  }
  process.exit(1);
});
