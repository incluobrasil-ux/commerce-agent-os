#!/usr/bin/env tsx
// CLI: pnpm mining:run --project <nome> --step <mine|curate|images|all> [--limit N]
//
// Invoca o sidecar Python ecommerce-pipeline via @cao/ecommerce-pipeline.
// Saída do Python é streamada line-by-line. Exit code do CLI = exit code do
// pipeline.py (passthrough).

import { EcommercePipelineError, resolvePipeline, runStep } from '../index.js';
import type { PipelineStep } from '../types/index.js';

interface Args {
  project: string;
  step: PipelineStep;
  limit?: number;
  help: boolean;
}

function parseArgs(argv: readonly string[]): Args {
  const args: Args = { project: '', step: 'all', help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') args.help = true;
    else if (a === '--project') args.project = argv[++i] ?? '';
    else if (a === '--step') {
      const v = argv[++i] ?? 'all';
      if (v !== 'mine' && v !== 'curate' && v !== 'images' && v !== 'all') {
        console.error(`[mining:run] step inválido: ${v}. Use mine|curate|images|all.`);
        process.exit(2);
      }
      args.step = v;
    } else if (a === '--limit') {
      const n = Number(argv[++i]);
      if (!Number.isFinite(n) || n <= 0) {
        console.error('[mining:run] --limit precisa de inteiro positivo.');
        process.exit(2);
      }
      args.limit = n;
    }
  }
  return args;
}

function printHelp(): void {
  console.log(`
pnpm mining:run --project <nome> [--step mine|curate|images|all] [--limit N]

Invoca o ecommerce-pipeline (Python sidecar externo) para um projeto.

Argumentos:
  --project <nome>   Nome do projeto em projects/<nome>/ (ex: mireloo)
  --step <step>      Etapa: mine | curate | images | all (default: all)
  --limit <N>        Limite de produtos para --step images (default: sem limite)

Variáveis de ambiente:
  ECOMMERCE_PIPELINE_ROOT   Caminho do repo Python (default: ~/ecommerce-pipeline)

Exemplos:
  pnpm mining:run --project mireloo --step mine
  pnpm mining:run --project mireloo --step images --limit 1
`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.project) {
    printHelp();
    process.exit(args.help ? 0 : 2);
  }

  try {
    const resolved = resolvePipeline();
    console.error(`[mining:run] pipeline=${resolved.pipelineRoot}`);
    console.error(`[mining:run] python=${resolved.pythonExecutable}`);
    console.error(
      `[mining:run] project=${args.project} step=${args.step}${args.limit ? ` limit=${args.limit}` : ''}`,
    );
    console.error('[mining:run] ───────────────────────────────────────────');

    const result = await runStep(
      { projectName: args.project, step: args.step, limit: args.limit },
      {
        logger: (ch, line) => {
          if (ch === 'stdout') process.stdout.write(`${line}\n`);
          else process.stderr.write(`${line}\n`);
        },
      },
    );

    console.error('[mining:run] ───────────────────────────────────────────');
    console.error(
      `[mining:run] exitCode=${result.exitCode} duration=${(result.durationMs / 1000).toFixed(1)}s`,
    );
    process.exit(result.exitCode);
  } catch (err) {
    if (err instanceof EcommercePipelineError) {
      console.error(`[mining:run] ERROR [${err.code}]: ${err.message}`);
      process.exit(
        err.code === 'pipeline_root_not_found' || err.code === 'project_not_found' ? 3 : 1,
      );
    }
    console.error('[mining:run] UNEXPECTED:', err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
