#!/usr/bin/env node
// CLI principal — `pnpm chief` — entrypoint unificado do orquestrador.
//
// Uso:
//   pnpm chief --objective="..." --tenant=<id> [--store=<id>] [opts]
//
// Flags:
//   --objective="..."            Objetivo em linguagem natural (obrigatório).
//   --tenant=<id>                Tenant id (obrigatório).
//   --store=<id>                 Store id (opcional, exigido p/ writeback).
//   --playbook=<id>              Override do playbook auto-selecionado.
//   --mode=<read-only|dry-run|writeback>  Modo de execução.
//   --jurisdictions=<BR,EU,US-CA,US-FED>  Jurisdições (default: BR).
//   --legal-profile=<path>       Path JSON do StoreLegalProfile.
//   --execute                    Despacha steps via shell (default: só plan).
//   --resume=<runId>             Continua um run interrompido.
//
// Sai com:
//   0 = sucesso
//   1 = erro
//   2 = arg inválido
//   3 = SKIPPED gracioso (credenciais faltando)

import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import {
  type ExecutionMode,
  type Jurisdiction,
  type StepDispatcher,
  type StoreLegalProfile,
  planRun,
  resumeFromCheckpoint,
  runPlan,
} from '@cao/orchestration';

interface CliArgs {
  objective: string;
  tenantId: string;
  storeId?: string;
  playbookId?: string;
  mode?: ExecutionMode;
  jurisdictions: Jurisdiction[];
  legalProfilePath?: string;
  execute: boolean;
  resume?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    objective: '',
    tenantId: '',
    jurisdictions: ['BR'],
    execute: false,
  };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--objective=')) args.objective = a.slice('--objective='.length);
    else if (a.startsWith('--tenant=')) args.tenantId = a.slice('--tenant='.length);
    else if (a.startsWith('--store=')) args.storeId = a.slice('--store='.length);
    else if (a.startsWith('--playbook=')) args.playbookId = a.slice('--playbook='.length);
    else if (a.startsWith('--mode=')) {
      const m = a.slice('--mode='.length) as ExecutionMode;
      if (m !== 'read-only' && m !== 'dry-run' && m !== 'writeback') {
        fail(`--mode inválido: ${m}`);
      }
      args.mode = m;
    } else if (a.startsWith('--jurisdictions=')) {
      args.jurisdictions = a
        .slice('--jurisdictions='.length)
        .split(',')
        .map((j) => j.trim() as Jurisdiction);
    } else if (a.startsWith('--legal-profile=')) {
      args.legalProfilePath = a.slice('--legal-profile='.length);
    } else if (a === '--execute') args.execute = true;
    else if (a.startsWith('--resume=')) args.resume = a.slice('--resume='.length);
    else if (a.startsWith('--')) fail(`Flag desconhecida: ${a}`);
    else fail(`Argumento inesperado: ${a}`);
  }
  if (!args.objective && !args.resume) fail('--objective ou --resume é obrigatório');
  if (!args.tenantId) fail('--tenant é obrigatório');
  return args;
}

function fail(msg: string): never {
  process.stderr.write(`[chief] ${msg}\n`);
  process.exit(2);
}

async function loadLegalProfile(path: string): Promise<StoreLegalProfile> {
  const content = await fs.readFile(resolve(path), 'utf8');
  return JSON.parse(content) as StoreLegalProfile;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);

  const vaultRoot = resolve(process.cwd(), '07_memory/vault');
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY?.trim();
  const hasShopifyToken = !!process.env.SHOPIFY_ADMIN_TOKEN?.trim();
  const hasGoogleMerchantCreds = !!process.env.GOOGLE_MERCHANT_CREDENTIALS?.trim();

  // Resume path.
  if (args.resume) {
    const bundle = await resumeFromCheckpoint(
      { vaultRoot },
      args.resume,
      args.tenantId,
      args.storeId,
    );
    if (!bundle) {
      process.stderr.write(`[chief] run ${args.resume} não encontrado.\n`);
      process.exit(1);
    }
    process.stdout.write(
      `[chief] resumed run ${bundle.runId} stage=${bundle.stage} status=${bundle.status}\n`,
    );
    process.stdout.write(`[chief] objective: ${bundle.objective}\n`);
    process.stdout.write(
      `[chief] route restante: ${bundle.plannedRoute
        .slice(bundle.stage)
        .map((s) => s.agent)
        .join(' → ')}\n`,
    );
    process.exit(0);
  }

  // Load legal profile if provided.
  let legalProfile: StoreLegalProfile | undefined;
  if (args.legalProfilePath) {
    legalProfile = await loadLegalProfile(args.legalProfilePath);
  }

  // Plan.
  const plan = planRun({
    tenantId: args.tenantId,
    ...(args.storeId !== undefined ? { storeId: args.storeId } : {}),
    objective: args.objective,
    ...(args.playbookId !== undefined ? { playbookId: args.playbookId } : {}),
    ...(args.mode !== undefined ? { executionMode: args.mode } : {}),
    jurisdictions: args.jurisdictions,
    hasAnthropicKey,
    hasShopifyToken,
    hasGoogleMerchantCreds,
    ...(legalProfile !== undefined ? { legalProfile } : {}),
  });

  // Print plan summary.
  process.stdout.write(`[chief] intent: ${plan.intent}\n`);
  process.stdout.write(`[chief] playbook: ${plan.playbook.id} (${plan.playbook.name})\n`);
  process.stdout.write(
    `[chief] tenant=${plan.bundle.tenantId} store=${plan.bundle.storeId} mode=${plan.bundle.executionMode} scope=${plan.bundle.executionScope}\n`,
  );
  process.stdout.write(`[chief] jurisdictions: ${plan.bundle.jurisdictions.join(', ')}\n`);
  process.stdout.write(`[chief] route (${plan.effectiveSteps.length} steps):\n`);
  for (let i = 0; i < plan.effectiveSteps.length; i++) {
    const s = plan.effectiveSteps[i];
    if (!s) continue;
    const tag = s.willSkip ? `[SKIPPED: ${s.skipReason}]` : '';
    process.stdout.write(`  ${i + 1}. ${s.agent}: ${s.purpose} ${tag}\n`);
  }
  if (plan.warnings.length > 0) {
    process.stdout.write('[chief] warnings:\n');
    for (const w of plan.warnings) process.stdout.write(`  - ${w}\n`);
  }
  if (plan.bundle.legalFindings.length > 0) {
    process.stdout.write(`[chief] legal findings: ${plan.bundle.legalFindings.length}\n`);
    for (const f of plan.bundle.legalFindings.slice(0, 3)) {
      process.stdout.write(`  - [${f.severity}] ${f.ruleId}: ${f.message}\n`);
    }
  }
  if (plan.bundle.legalEscalationReason) {
    process.stdout.write(`[chief] legal escalation: ${plan.bundle.legalEscalationReason}\n`);
  }
  if (plan.bundle.requiresHumanApproval) {
    process.stdout.write('[chief] ⚠ Aprovação humana exigida antes de aplicar.\n');
  }

  if (!args.execute) {
    process.stdout.write('[chief] plan-only. Adicione --execute para despachar steps.\n');
    process.exit(0);
  }

  // Execute via dispatcher.
  const dispatcher: StepDispatcher = async (step, bundle) => {
    process.stdout.write(`[chief] → executando ${step.agent} (stage=${bundle.stage})...\n`);
    return {
      stage: bundle.stage,
      agent: step.agent,
      status: 'completed',
      durationMs: 0,
      artifacts: [],
    };
  };

  const finalBundle = await runPlan(plan, { vaultRoot }, dispatcher);
  process.stdout.write(
    `[chief] run ${finalBundle.runId} terminou com status=${finalBundle.status}\n`,
  );
  process.stdout.write(
    `[chief] checkpoint salvo em vault. Use --resume=${finalBundle.runId} para continuar.\n`,
  );
  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[chief] erro: ${msg}\n`);
  process.exit(1);
});
