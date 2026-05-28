// Wrapper TS leve para o ecommerce-pipeline (Python, sidecar externo).
//
// O repo Python vive FORA do monorepo (default: ~/ecommerce-pipeline) e roda
// standalone via `python pipeline.py --project <nome> --step <mine|curate|images>`.
// Aqui só resolvemos o caminho, invocamos via child_process e devolvemos o
// resultado tipado. Mesma filosofia do dispatcher do @cao/orchestration:
// streaming de stdout/stderr, exit code → result, timeout configurável.
//
// IMPORTANTE: este wrapper não duplica lógica do pipeline. Se o repo Python
// evoluir, basta `git pull` lá — nada quebra aqui (apenas o schema do
// project.json em ../types/index.ts pode precisar update se mudar).

import { spawn } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { EcommercePipelineError } from '../errors/index.js';
import type { PipelineStep, RunOptions, RunResult } from '../types/index.js';

const DEFAULT_TIMEOUTS_MS: Record<PipelineStep, number> = {
  mine: 10 * 60 * 1000,
  curate: 5 * 60 * 1000,
  images: 30 * 60 * 1000,
  all: 45 * 60 * 1000,
};

export interface PipelineClientOptions {
  /** Caminho raiz do ecommerce-pipeline. Default: $ECOMMERCE_PIPELINE_ROOT ou ~/ecommerce-pipeline. */
  pipelineRoot?: string;
  /** Executável Python. Default: tenta .venv/Scripts/python.exe (Windows) ou .venv/bin/python, cai em 'python'. */
  pythonExecutable?: string;
  /** Logger opcional para stdout/stderr line-by-line. */
  logger?: (channel: 'stdout' | 'stderr', line: string) => void;
}

export interface ResolvedPipeline {
  pipelineRoot: string;
  pythonExecutable: string;
  pipelineScript: string;
}

/**
 * Resolve caminho do repo Python + interpretador. Falha cedo com mensagens
 * acionáveis se algo não existir.
 */
export function resolvePipeline(options: PipelineClientOptions = {}): ResolvedPipeline {
  const pipelineRoot = resolve(
    options.pipelineRoot ??
      process.env.ECOMMERCE_PIPELINE_ROOT ??
      join(homedir(), 'ecommerce-pipeline'),
  );

  if (!existsSync(pipelineRoot) || !statSync(pipelineRoot).isDirectory()) {
    throw new EcommercePipelineError(
      `ecommerce-pipeline root não encontrado: ${pipelineRoot}. Defina ECOMMERCE_PIPELINE_ROOT ou clone em ~/ecommerce-pipeline.`,
      'pipeline_root_not_found',
      { pipelineRoot },
    );
  }

  const pipelineScript = join(pipelineRoot, 'pipeline.py');
  if (!existsSync(pipelineScript)) {
    throw new EcommercePipelineError(
      `pipeline.py não encontrado em ${pipelineRoot}.`,
      'pipeline_root_not_found',
      { pipelineRoot, pipelineScript },
    );
  }

  const pythonExecutable = options.pythonExecutable ?? detectPython(pipelineRoot);

  return { pipelineRoot, pythonExecutable, pipelineScript };
}

function detectPython(pipelineRoot: string): string {
  const winVenv = join(pipelineRoot, '.venv', 'Scripts', 'python.exe');
  const posixVenv = join(pipelineRoot, '.venv', 'bin', 'python');
  if (existsSync(winVenv)) return winVenv;
  if (existsSync(posixVenv)) return posixVenv;
  return 'python';
}

/**
 * Verifica que projects/<projectName>/project.json existe.
 */
export function assertProjectExists(pipelineRoot: string, projectName: string): string {
  const projectDir = join(pipelineRoot, 'projects', projectName);
  const projectJson = join(projectDir, 'project.json');
  if (!existsSync(projectJson)) {
    throw new EcommercePipelineError(
      `project.json não encontrado para projeto '${projectName}' em ${projectJson}.`,
      'project_not_found',
      { projectName, projectDir, projectJson },
    );
  }
  return projectDir;
}

/**
 * Roda uma etapa do pipeline. Retorna RunResult com exit code, stdout, stderr.
 * Não lança em exit code != 0 — quem chama decide. Lança apenas em timeout
 * ou ausência de pipeline/projeto (falha estrutural).
 */
export async function runStep(
  options: RunOptions,
  clientOptions: PipelineClientOptions = {},
): Promise<RunResult> {
  const { pipelineRoot, pythonExecutable, pipelineScript } = resolvePipeline(clientOptions);
  const projectDir = assertProjectExists(pipelineRoot, options.projectName);

  const args = [pipelineScript, '--project', options.projectName, '--step', options.step];
  if (options.limit !== undefined && options.step === 'images') {
    args.push('--limit', String(options.limit));
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUTS_MS[options.step];
  const startedAt = Date.now();

  return new Promise<RunResult>((resolvePromise, rejectPromise) => {
    const child = spawn(pythonExecutable, args, {
      cwd: pipelineRoot,
      env: process.env,
      shell: false,
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, timeoutMs);

    child.stdout.on('data', (chunk: Buffer) => {
      const text = chunk.toString('utf-8');
      stdout += text;
      if (clientOptions.logger) {
        for (const line of text.split(/\r?\n/)) {
          if (line) clientOptions.logger('stdout', line);
        }
      }
    });

    child.stderr.on('data', (chunk: Buffer) => {
      const text = chunk.toString('utf-8');
      stderr += text;
      if (clientOptions.logger) {
        for (const line of text.split(/\r?\n/)) {
          if (line) clientOptions.logger('stderr', line);
        }
      }
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        rejectPromise(
          new EcommercePipelineError(
            `Python não encontrado: ${pythonExecutable}. Instale Python 3.11+ ou crie .venv em ${pipelineRoot}.`,
            'python_not_found',
            { pythonExecutable, pipelineRoot },
          ),
        );
      } else {
        rejectPromise(err);
      }
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      if (timedOut) {
        rejectPromise(
          new EcommercePipelineError(
            `Timeout após ${timeoutMs}ms ao rodar step '${options.step}'.`,
            'timeout',
            { step: options.step, timeoutMs, projectName: options.projectName },
          ),
        );
        return;
      }
      resolvePromise({
        step: options.step,
        projectName: options.projectName,
        exitCode: code ?? -1,
        stdout,
        stderr,
        projectDir,
        durationMs: Date.now() - startedAt,
      });
    });
  });
}
