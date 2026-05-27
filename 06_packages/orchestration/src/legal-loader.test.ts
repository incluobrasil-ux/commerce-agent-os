import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { legalProfilePathFor, loadLegalProfileFromVault } from './legal-loader.js';

let tmpRoot: string;

beforeEach(async () => {
  tmpRoot = await fs.mkdtemp(join(tmpdir(), 'legal-loader-'));
});

afterEach(async () => {
  await fs.rm(tmpRoot, { recursive: true, force: true });
});

const baseProfile = {
  tenantId: 't1',
  storeId: 's1',
  jurisdictions: ['BR'],
  primaryLocale: 'pt-BR',
  primaryCurrency: 'BRL',
  maturityLevel: 'starter',
  existingPolicies: [],
  allowsSensitiveWriteback: false,
};

async function writeProfile(path: string, payload: unknown): Promise<void> {
  await fs.mkdir(resolve(path, '..'), { recursive: true });
  await fs.writeFile(path, JSON.stringify(payload), 'utf8');
}

describe('legal-loader', () => {
  it('retorna null quando nenhum arquivo existe', async () => {
    const result = await loadLegalProfileFromVault({
      vaultRoot: tmpRoot,
      tenantId: 't1',
      storeId: 's1',
    });
    expect(result).toBeNull();
  });

  it('carrega store-level quando existe', async () => {
    const target = legalProfilePathFor({ vaultRoot: tmpRoot, tenantId: 't1', storeId: 's1' });
    await writeProfile(target, { ...baseProfile, primaryLocale: 'pt-BR-store' });

    const result = await loadLegalProfileFromVault({
      vaultRoot: tmpRoot,
      tenantId: 't1',
      storeId: 's1',
    });
    expect(result).not.toBeNull();
    expect(result?.primaryLocale).toBe('pt-BR-store');
  });

  it('cai em tenant-level quando store-level não existe', async () => {
    const tenantPath = legalProfilePathFor({ vaultRoot: tmpRoot, tenantId: 't1' });
    await writeProfile(tenantPath, { ...baseProfile, primaryLocale: 'pt-BR-tenant' });

    const result = await loadLegalProfileFromVault({
      vaultRoot: tmpRoot,
      tenantId: 't1',
      storeId: 's1',
    });
    expect(result?.primaryLocale).toBe('pt-BR-tenant');
  });

  it('busca apenas tenant-level quando storeId não é passado', async () => {
    const tenantPath = legalProfilePathFor({ vaultRoot: tmpRoot, tenantId: 't1' });
    await writeProfile(tenantPath, { ...baseProfile, primaryCurrency: 'BRL-tenant' });

    const result = await loadLegalProfileFromVault({ vaultRoot: tmpRoot, tenantId: 't1' });
    expect(result?.primaryCurrency).toBe('BRL-tenant');
  });

  it('legalProfilePathFor devolve path store-level quando storeId presente', () => {
    const p = legalProfilePathFor({ vaultRoot: '/root', tenantId: 't1', storeId: 's1' });
    // não checa separador (cross-platform), só que contém os segmentos esperados
    expect(p).toContain('tenants');
    expect(p).toContain('t1');
    expect(p).toContain('stores');
    expect(p).toContain('s1');
    expect(p.endsWith('legal-profile.json')).toBe(true);
  });
});
