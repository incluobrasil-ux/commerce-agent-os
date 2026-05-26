#!/usr/bin/env node
// CLI: pnpm governance:qa --agent-name=product-offer --output-file=path.json
//   --sensitivity=medium [--publishing-channel=pdp --context-file=...]

import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import { captureRun } from '@cao/brain-bridge';
import { makeAnthropicComplete } from '@cao/llm';
import { Memory } from '@cao/memory';
import { ConsoleProvider } from '@cao/observability';
import { runAgent } from '@cao/runtime';
import { governanceRiskQaAgent, qaPath, qaTimestamp, renderQa } from './index.js';

type Sensitivity = 'low' | 'medium' | 'high';
const VALID_SENSITIVITY: Sensitivity[] = ['low', 'medium', 'high'];

interface CliArgs {
  tenantId: string;
  agentName: string;
  agentOutput: string;
  outputFile: string;
  sensitivity: Sensitivity;
  context: string;
  contextFile: string;
  policyNotes: string;
  publishingChannel: string;
  capture: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    tenantId: '_test',
    agentName: '',
    agentOutput: '',
    outputFile: '',
    sensitivity: 'medium',
    context: '',
    contextFile: '',
    policyNotes: '',
    publishingChannel: '',
    capture: false,
  };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--tenant=')) args.tenantId = a.slice('--tenant='.length);
    else if (a.startsWith('--agent-name=')) args.agentName = a.slice('--agent-name='.length);
    else if (a.startsWith('--output=')) args.agentOutput = a.slice('--output='.length);
    else if (a.startsWith('--output-file=')) args.outputFile = a.slice('--output-file='.length);
    else if (a.startsWith('--sensitivity=')) {
      const v = a.slice('--sensitivity='.length) as Sensitivity;
      if (!VALID_SENSITIVITY.includes(v)) fail(`--sensitivity inválido: ${v}`);
      args.sensitivity = v;
    } else if (a.startsWith('--context=')) args.context = a.slice('--context='.length);
    else if (a.startsWith('--context-file=')) args.contextFile = a.slice('--context-file='.length);
    else if (a.startsWith('--policy-notes=')) args.policyNotes = a.slice('--policy-notes='.length);
    else if (a.startsWith('--publishing-channel='))
      args.publishingChannel = a.slice('--publishing-channel='.length);
    else if (a === '--capture') args.capture = true;
    else if (a.startsWith('--')) fail(`Flag desconhecida: ${a}`);
    else fail(`Argumento inesperado: ${a}`);
  }
  if (!args.agentName) fail('--agent-name é obrigatório');
  if (!args.agentOutput && !args.outputFile) fail('--output OU --output-file é obrigatório');
  return args;
}

function fail(msg: string): never {
  process.stderr.write(`[governance:qa] ${msg}\n`);
  process.exit(2);
}

function skipped(msg: string): never {
  process.stdout.write(`[governance:qa] SKIPPED — ${msg}\n`);
  process.exit(0);
}

async function loadFile(p: string): Promise<string> {
  return fs.readFile(resolve(p), 'utf8');
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  const agentOutput = args.outputFile ? await loadFile(args.outputFile) : args.agentOutput;
  const context = args.contextFile ? await loadFile(args.contextFile) : args.context;

  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    skipped(
      `ANTHROPIC_API_KEY ausente em .env.local. ${agentOutput.length} chars lidos; execução pendente.`,
    );
  }

  const repoRoot = resolve(process.cwd());
  const memory = new Memory({
    vaultRoot: resolve(repoRoot, '07_memory/vault'),
    tenantId: args.tenantId,
  });
  await memory.ensureBaseDir();

  const observability = new ConsoleProvider();
  const complete = makeAnthropicComplete();

  const input = {
    tenantId: args.tenantId,
    agentName: args.agentName,
    agentOutput,
    context,
    sensitivity: args.sensitivity,
    policyNotes: args.policyNotes,
    publishingChannel: args.publishingChannel,
  };

  const result = await runAgent(
    governanceRiskQaAgent,
    input,
    { tenantId: args.tenantId },
    { complete, memory, observability },
  );

  const ts = qaTimestamp();
  const relPath = qaPath(args.agentName, ts);
  const generatedAt = new Date().toISOString();
  const md = renderQa(input, result.output, {
    runId: result.runId,
    model: result.model,
    costUsd: result.costUsd,
    generatedAt,
  });
  await memory.write(relPath, md);
  const absPath = resolve(repoRoot, '07_memory/vault/tenants', args.tenantId, relPath);

  const out = result.output;
  process.stdout.write(`[governance:qa] verdict=${out.verdict.toUpperCase()}\n`);
  process.stdout.write(
    `[governance:qa] risks=${out.riskFlags.length} quality=${out.qualityConcerns.length} factuality=${out.factualityChecks.length}\n`,
  );
  process.stdout.write(`[governance:qa] review: ${absPath}\n`);
  process.stdout.write(
    `[governance:qa] cost=$${result.costUsd.toFixed(6)} model=${result.model} ${result.durationMs}ms\n`,
  );

  if (out.verdict === 'block') {
    process.stdout.write('[governance:qa] ⛔ BLOCK — humano precisa revisar antes de publicar.\n');
  }

  if (args.capture) {
    const slugTenant = args.tenantId.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const slugAgent = args.agentName
      .replace(/[^a-z0-9-]/gi, '-')
      .toLowerCase()
      .slice(0, 30);
    const verdictToColor: Record<string, 'green' | 'yellow' | 'red'> = {
      pass: 'green',
      warn: 'yellow',
      block: 'red',
    };
    const overall = verdictToColor[out.verdict] ?? 'yellow';
    const cap = await captureRun({
      kind: 'agent-run',
      slug: `governance-qa-${slugTenant}-${slugAgent}`.slice(0, 60),
      result: overall,
      title: `QA: ${args.agentName} → ${out.verdict.toUpperCase()}`,
      source: 'agent:governance-risk-qa',
      tags: ['governance-risk-qa', 'tier-3', 'guardrail', overall, out.verdict],
      body: {
        context: `pnpm governance:qa revisou output de ${args.agentName}.`,
        whatHappened: [
          `Tenant: ${args.tenantId}.`,
          `Agent reviewed: ${args.agentName} (${agentOutput.length} chars).`,
          `Verdict: ${out.verdict.toUpperCase()}.`,
          `Sensitivity: ${args.sensitivity}.`,
          `QA salvo em vault/${args.tenantId}/${relPath}.`,
          `Custo: $${result.costUsd.toFixed(6)} (${result.model}).`,
        ],
        findings: [
          ...out.riskFlags.map((r) => `[risk:${r.severity}] ${r.category}`),
          ...out.blockingReasons.map((b) => `[block] ${b}`),
        ],
        impact: `Verdict ${out.verdict} · ${out.riskFlags.length} risk flag(s) · ${out.suggestedFollowups.length} follow-up(s).`,
        references: [`07_memory/vault/tenants/${args.tenantId}/${relPath}`],
      },
      sessionLogLine: `governance-qa: ${args.agentName} → ${out.verdict}, ${out.riskFlags.length} risks.`,
    });
    process.stdout.write(`[governance:qa] capture → ${cap.summaryPath}\n`);
  }

  process.exit(out.verdict === 'block' ? 3 : 0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[governance:qa] erro: ${msg}\n`);
  if (msg.includes('401') || msg.includes('invalid x-api-key')) {
    process.stderr.write('[governance:qa] → key inválida. Atualize .env.local.\n');
  }
  process.exit(1);
});
