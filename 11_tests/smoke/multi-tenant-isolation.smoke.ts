// Smoke: garantir que duas execuções tenant/store-scoped diferentes não
// colidem em paths de memória, reports ou capture. Roda 100% com filesystem
// + funções puras. Sem rede, sem LLM, sem creds.
//
// Padrão de smoke (ADR-0009): importa source .ts via relative path; vitest
// transpila on the fly. Evita dep de build prévio.

import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { resolveBrainDir } from '../../06_packages/brain-bridge/src/capture.ts';
import {
  TenantContextError,
  assertTenantContext,
  assertTenantStoreContext,
  buildContextBundle,
  slugifyShopDomain,
} from '../../06_packages/core/src/context.ts';
import { Memory } from '../../06_packages/memory/src/memory.ts';

let vaultRoot: string;

beforeAll(async () => {
  vaultRoot = await fs.mkdtemp(join(tmpdir(), 'cao-mt-smoke-'));
});

afterAll(async () => {
  await fs.rm(vaultRoot, { recursive: true, force: true });
});

describe('multi-tenant isolation smoke', () => {
  it('Memory: tenant A não vê arquivo de tenant B', async () => {
    const mA = new Memory({ vaultRoot, tenantId: 'tenant-a' });
    const mB = new Memory({ vaultRoot, tenantId: 'tenant-b' });
    await mA.ensureBaseDir();
    await mB.ensureBaseDir();
    await mA.write('secret.md', 'A only');
    expect(await mB.exists('secret.md')).toBe(false);
  });

  it('Memory: store X não vê arquivo de store Y dentro do mesmo tenant', async () => {
    const mX = new Memory({ vaultRoot, tenantId: 't-shared', storeId: 'store-x' });
    const mY = new Memory({ vaultRoot, tenantId: 't-shared', storeId: 'store-y' });
    await mX.ensureBaseDir();
    await mY.ensureBaseDir();
    await mX.write('orders.json', '[{"id":"x1"}]');
    expect(await mY.exists('orders.json')).toBe(false);
  });

  it('Memory: store baseDir contém o segmento stores/<id>', () => {
    const m = new Memory({ vaultRoot, tenantId: 't1', storeId: 's1' });
    expect(m.baseDir.replace(/\\/g, '/')).toContain('/t1/stores/s1');
  });

  it('brain-bridge: tenant A e tenant B resolvem para paths diferentes', () => {
    const a = resolveBrainDir('/repo', { tenantId: 'incluo' });
    const b = resolveBrainDir('/repo', { tenantId: 'acme' });
    expect(a).not.toBe(b);
    expect(a).toContain('tenants');
    expect(b).toContain('tenants');
  });

  it('brain-bridge: mesma tenant, stores diferentes → paths diferentes', () => {
    const sA = resolveBrainDir('/repo', { tenantId: 't1', storeId: 'sA' });
    const sB = resolveBrainDir('/repo', { tenantId: 't1', storeId: 'sB' });
    expect(sA).not.toBe(sB);
    expect(sA.replace(/\\/g, '/')).toContain('/stores/sA');
    expect(sB.replace(/\\/g, '/')).toContain('/stores/sB');
  });

  it('brain-bridge: sem tenant cai no project brain (compat)', () => {
    const r = resolveBrainDir('/repo', {});
    expect(r).toContain('projects');
    expect(r).toContain('commerce-agent-os');
  });

  it('assertTenantContext bloqueia execução sem tenantId', () => {
    expect(() => assertTenantContext({ tenantId: '' }, 'op')).toThrow(TenantContextError);
  });

  it('assertTenantStoreContext bloqueia execução sem storeId mesmo com tenantId', () => {
    expect(() => assertTenantStoreContext({ tenantId: 't1' }, 'op')).toThrow(TenantContextError);
  });

  it('buildContextBundle preserva tenantId+storeId+runId no handoff', () => {
    const b = buildContextBundle({
      tenantId: 't1',
      storeId: 's1',
      runId: 'run-001',
      parentRunId: 'run-000',
      agentName: 'merchant-audit',
    });
    expect(b.tenantId).toBe('t1');
    expect(b.storeId).toBe('s1');
    expect(b.runId).toBe('run-001');
    expect(b.parentRunId).toBe('run-000');
    expect(b.agentName).toBe('merchant-audit');
  });

  it('slugifyShopDomain produz storeId determinístico (sem colisão entre shopDomains)', () => {
    const a = slugifyShopDomain('incluobrasil.myshopify.com');
    const b = slugifyShopDomain('acme.myshopify.com');
    expect(a).not.toBe(b);
    expect(a).toBe('incluobrasil');
    expect(b).toBe('acme');
  });

  it('Memory rejeita storeId com path traversal', () => {
    expect(() => new Memory({ vaultRoot, tenantId: 't1', storeId: '../escape' })).toThrow();
  });

  it('Memory: paths são absolutos e únicos por (tenant, store)', () => {
    const m1 = new Memory({ vaultRoot, tenantId: 't1', storeId: 's1' });
    const m2 = new Memory({ vaultRoot, tenantId: 't1', storeId: 's2' });
    const m3 = new Memory({ vaultRoot, tenantId: 't2', storeId: 's1' });
    const m4 = new Memory({ vaultRoot, tenantId: 't1' });
    const all = [m1.baseDir, m2.baseDir, m3.baseDir, m4.baseDir];
    expect(new Set(all).size).toBe(4);
    expect(all.every((p) => resolve(p) === p)).toBe(true);
  });
});
