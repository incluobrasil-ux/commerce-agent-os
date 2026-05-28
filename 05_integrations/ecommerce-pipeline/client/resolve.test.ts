// Smoke tests para resolvePipeline + assertProjectExists.
// NÃO invoca Python — só valida resolução de path. Roda em CI cross-platform
// sem precisar do sidecar Python instalado.

import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { EcommercePipelineError } from '../errors/index.js';
import { assertProjectExists, resolvePipeline } from './index.js';

describe('resolvePipeline', () => {
  let tempRoot: string;

  beforeEach(() => {
    tempRoot = mkdtempSync(join(tmpdir(), 'ecommerce-pipeline-test-'));
  });

  afterEach(() => {
    if (existsSync(tempRoot)) rmSync(tempRoot, { recursive: true, force: true });
  });

  it('lança pipeline_root_not_found quando diretório inexistente', () => {
    expect(() => resolvePipeline({ pipelineRoot: join(tempRoot, 'inexistente') })).toThrow(
      EcommercePipelineError,
    );
  });

  it('lança pipeline_root_not_found quando pipeline.py ausente', () => {
    // tempRoot existe mas vazio — sem pipeline.py
    try {
      resolvePipeline({ pipelineRoot: tempRoot });
      throw new Error('deveria ter lançado');
    } catch (err) {
      expect(err).toBeInstanceOf(EcommercePipelineError);
      expect((err as EcommercePipelineError).code).toBe('pipeline_root_not_found');
    }
  });

  it('resolve quando pipeline.py existe', () => {
    writeFileSync(join(tempRoot, 'pipeline.py'), '# stub\n');
    const resolved = resolvePipeline({ pipelineRoot: tempRoot });
    expect(resolved.pipelineRoot).toBe(tempRoot);
    expect(resolved.pipelineScript).toBe(join(tempRoot, 'pipeline.py'));
    expect(resolved.pythonExecutable).toBeTruthy();
  });

  it('detecta .venv do Windows quando presente', () => {
    writeFileSync(join(tempRoot, 'pipeline.py'), '# stub\n');
    const winVenvDir = join(tempRoot, '.venv', 'Scripts');
    mkdirSync(winVenvDir, { recursive: true });
    writeFileSync(join(winVenvDir, 'python.exe'), '');
    const resolved = resolvePipeline({ pipelineRoot: tempRoot });
    expect(resolved.pythonExecutable).toBe(join(winVenvDir, 'python.exe'));
  });

  it('cai em "python" quando sem .venv', () => {
    writeFileSync(join(tempRoot, 'pipeline.py'), '# stub\n');
    const resolved = resolvePipeline({ pipelineRoot: tempRoot });
    expect(resolved.pythonExecutable).toBe('python');
  });

  it('respeita pythonExecutable explícito', () => {
    writeFileSync(join(tempRoot, 'pipeline.py'), '# stub\n');
    const resolved = resolvePipeline({
      pipelineRoot: tempRoot,
      pythonExecutable: '/usr/bin/python3.11',
    });
    expect(resolved.pythonExecutable).toBe('/usr/bin/python3.11');
  });
});

describe('assertProjectExists', () => {
  let tempRoot: string;

  beforeEach(() => {
    tempRoot = mkdtempSync(join(tmpdir(), 'ecommerce-pipeline-projects-'));
  });

  afterEach(() => {
    if (existsSync(tempRoot)) rmSync(tempRoot, { recursive: true, force: true });
  });

  it('lança project_not_found quando project.json ausente', () => {
    try {
      assertProjectExists(tempRoot, 'inexistente');
      throw new Error('deveria ter lançado');
    } catch (err) {
      expect(err).toBeInstanceOf(EcommercePipelineError);
      expect((err as EcommercePipelineError).code).toBe('project_not_found');
    }
  });

  it('retorna projectDir quando project.json existe', () => {
    const projectDir = join(tempRoot, 'projects', 'teste');
    mkdirSync(projectDir, { recursive: true });
    writeFileSync(join(projectDir, 'project.json'), '{}');
    const result = assertProjectExists(tempRoot, 'teste');
    expect(result).toBe(projectDir);
  });
});
