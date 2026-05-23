import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Memory, MemoryPathError } from './index.js';

describe('Memory', () => {
  let vaultRoot: string;
  let mem: Memory;

  beforeEach(async () => {
    vaultRoot = await fs.mkdtemp(join(tmpdir(), 'cao-memory-test-'));
    mem = new Memory({ vaultRoot, tenantId: 'acme' });
    await mem.ensureBaseDir();
  });

  afterEach(async () => {
    await fs.rm(vaultRoot, { recursive: true, force: true });
  });

  it('write + read roundtrip', async () => {
    await mem.write('facts/example.md', 'hello world');
    const back = await mem.read('facts/example.md');
    expect(back).toBe('hello world');
  });

  it('append acumula conteúdo', async () => {
    await mem.write('audit/log.md', 'line1\n');
    await mem.append('audit/log.md', 'line2\n');
    const out = await mem.read('audit/log.md');
    expect(out).toBe('line1\nline2\n');
  });

  it('list retorna entradas relativas', async () => {
    await mem.write('facts/a.md', 'a');
    await mem.write('facts/b.md', 'b');
    const entries = await mem.list('facts');
    expect(entries.sort()).toEqual(['facts/a.md', 'facts/b.md']);
  });

  it('list de pasta inexistente retorna []', async () => {
    const entries = await mem.list('inexistente');
    expect(entries).toEqual([]);
  });

  it('exists checa arquivo', async () => {
    expect(await mem.exists('x.md')).toBe(false);
    await mem.write('x.md', '1');
    expect(await mem.exists('x.md')).toBe(true);
  });

  it('rejeita path absoluto', async () => {
    await expect(mem.read('/etc/passwd')).rejects.toBeInstanceOf(MemoryPathError);
  });

  it('rejeita path traversal cross-tenant', async () => {
    await expect(mem.read('../other-tenant/secret.md')).rejects.toBeInstanceOf(MemoryPathError);
  });

  it('tenantId com slash é rejeitado no constructor', () => {
    expect(() => new Memory({ vaultRoot, tenantId: 'a/b' })).toThrow(MemoryPathError);
  });

  it('isola tenants', async () => {
    const m1 = new Memory({ vaultRoot, tenantId: 'a' });
    const m2 = new Memory({ vaultRoot, tenantId: 'b' });
    await m1.write('x.md', 'tenant-a');
    expect(await m2.exists('x.md')).toBe(false);
  });
});
