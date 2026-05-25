// Markdown vault — CRUD com isolamento por tenant.
// Cross-tenant é IMPOSSÍVEL por construção: paths resolvidos sempre dentro de baseDir.

import { promises as fs } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { BaseError } from '@cao/core';

export class MemoryPathError extends BaseError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'MEMORY_PATH', context);
  }
}

export interface MemoryConfig {
  /** Path absoluto ou relativo ao cwd. Ex.: '07_memory/vault'. */
  vaultRoot: string;
  /** Identificador do tenant (slug seguro). Vira subpasta dentro do vault. */
  tenantId: string;
}

export class Memory {
  /** Diretório base do tenant — toda I/O fica contida aqui. */
  readonly baseDir: string;

  constructor(cfg: MemoryConfig) {
    if (!cfg.tenantId || /[\\/]/.test(cfg.tenantId) || cfg.tenantId.includes('..')) {
      throw new MemoryPathError('Invalid tenantId', { tenantId: cfg.tenantId });
    }
    this.baseDir = resolve(cfg.vaultRoot, cfg.tenantId);
  }

  /** Resolve um relPath garantindo que fica dentro de baseDir. */
  private safePath(relPath: string): string {
    if (isAbsolute(relPath)) {
      throw new MemoryPathError('Absolute path not allowed', { relPath });
    }
    const full = resolve(this.baseDir, relPath);
    const rel = relative(this.baseDir, full);
    if (rel.startsWith('..') || isAbsolute(rel)) {
      throw new MemoryPathError('Path escapes tenant baseDir', { relPath, full });
    }
    return full;
  }

  async ensureBaseDir(): Promise<void> {
    await fs.mkdir(this.baseDir, { recursive: true });
  }

  async read(relPath: string): Promise<string> {
    const path = this.safePath(relPath);
    return fs.readFile(path, 'utf8');
  }

  async write(relPath: string, content: string): Promise<void> {
    const path = this.safePath(relPath);
    await fs.mkdir(dirname(path), { recursive: true });
    await fs.writeFile(path, content, 'utf8');
  }

  async append(relPath: string, content: string): Promise<void> {
    const path = this.safePath(relPath);
    await fs.mkdir(dirname(path), { recursive: true });
    await fs.appendFile(path, content, 'utf8');
  }

  async list(relPath = '.'): Promise<string[]> {
    const path = this.safePath(relPath);
    try {
      const entries = await fs.readdir(path, { withFileTypes: true });
      // Sempre usar `/` (POSIX) para paths retornados — agnóstico de OS.
      const prefix = relPath === '.' ? '' : `${relPath.replace(/\\/g, '/')}/`;
      return entries.map((e) => `${prefix}${e.name}`);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw err;
    }
  }

  async exists(relPath: string): Promise<boolean> {
    try {
      await fs.access(this.safePath(relPath));
      return true;
    } catch {
      return false;
    }
  }
}
