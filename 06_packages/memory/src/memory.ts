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
  /**
   * Identificador opcional de store (slug seguro). Quando presente, baseDir
   * vira `<vaultRoot>/tenants/<tenantId>/stores/<storeId>/`. Ausente:
   * `<vaultRoot>/tenants/<tenantId>/`.
   *
   * Cross-store é impossível por construção: safePath() trava a I/O em baseDir.
   */
  storeId?: string;
}

function isUnsafeSegment(seg: string): boolean {
  return !seg || /[\\/]/.test(seg) || seg.includes('..');
}

export class Memory {
  /** Diretório base do tenant (ou tenant/store quando storeId é passado). */
  readonly baseDir: string;
  /** TenantId desta instância — exposto para diagnóstico/log. */
  readonly tenantId: string;
  /** StoreId desta instância (se houver). Undefined indica memory tenant-level. */
  readonly storeId: string | undefined;

  constructor(cfg: MemoryConfig) {
    if (isUnsafeSegment(cfg.tenantId)) {
      throw new MemoryPathError('Invalid tenantId', { tenantId: cfg.tenantId });
    }
    if (cfg.storeId !== undefined && isUnsafeSegment(cfg.storeId)) {
      throw new MemoryPathError('Invalid storeId', { storeId: cfg.storeId });
    }
    this.tenantId = cfg.tenantId;
    this.storeId = cfg.storeId;
    // Convenção canônica (alinhada com brain-bridge.resolveBrainDir):
    //   tenant-level: <vaultRoot>/tenants/<tenantId>/
    //   store-level:  <vaultRoot>/tenants/<tenantId>/stores/<storeId>/
    // O segmento `tenants/` é reservado dentro do vault para isolar tenants de
    // outros namespaces (global/, projects/, _template/, etc.).
    this.baseDir = cfg.storeId
      ? resolve(cfg.vaultRoot, 'tenants', cfg.tenantId, 'stores', cfg.storeId)
      : resolve(cfg.vaultRoot, 'tenants', cfg.tenantId);
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
