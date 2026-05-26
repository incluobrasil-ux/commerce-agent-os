import { describe, expect, it } from 'vitest';
import {
  type ContextBundle,
  TenantContextError,
  type TenantStoreContext,
  assertTenantContext,
  assertTenantStoreContext,
  buildContextBundle,
  isGlobalContext,
  slugifyShopDomain,
  validateStoreBelongsToTenant,
} from './context.js';

describe('assertTenantContext', () => {
  it('passa quando tenantId presente', () => {
    expect(() => assertTenantContext({ tenantId: 't1' })).not.toThrow();
  });

  it('lança quando tenantId ausente', () => {
    expect(() => assertTenantContext({})).toThrow(TenantContextError);
  });

  it('lança quando tenantId vazio', () => {
    expect(() => assertTenantContext({ tenantId: '  ' })).toThrow(TenantContextError);
  });

  it('lança quando ctx null/undefined', () => {
    expect(() => assertTenantContext(null)).toThrow(TenantContextError);
    expect(() => assertTenantContext(undefined)).toThrow(TenantContextError);
  });

  it('inclui agentOrOp na mensagem de erro', () => {
    try {
      assertTenantContext({}, 'merchant:audit');
    } catch (e) {
      expect((e as Error).message).toContain('merchant:audit');
    }
  });
});

describe('assertTenantStoreContext', () => {
  it('passa quando tenantId e storeId presentes', () => {
    expect(() => assertTenantStoreContext({ tenantId: 't1', storeId: 's1' })).not.toThrow();
  });

  it('lança quando storeId ausente', () => {
    expect(() => assertTenantStoreContext({ tenantId: 't1' })).toThrow(TenantContextError);
  });

  it('lança quando ambos ausentes', () => {
    expect(() => assertTenantStoreContext({})).toThrow(TenantContextError);
  });
});

describe('validateStoreBelongsToTenant', () => {
  it('true quando store está no registry', () => {
    const reg = { storesByTenant: () => ['s1', 's2'] as const };
    expect(validateStoreBelongsToTenant('t1', 's1', reg)).toBe(true);
  });

  it('false quando store não está no registry', () => {
    const reg = { storesByTenant: () => ['s1'] as const };
    expect(validateStoreBelongsToTenant('t1', 'sX', reg)).toBe(false);
  });

  it('aceita registry async', async () => {
    const reg = { storesByTenant: async () => ['s1'] as const };
    const r = await validateStoreBelongsToTenant('t1', 's1', reg);
    expect(r).toBe(true);
  });
});

describe('buildContextBundle', () => {
  it('produz bundle completo com tenantId+storeId+runId', () => {
    const b = buildContextBundle({ tenantId: 't1', storeId: 's1', runId: 'r1' });
    expect(b).toEqual({ tenantId: 't1', storeId: 's1', runId: 'r1' });
  });

  it('inclui parentRunId, agentName, tags quando passados', () => {
    const b = buildContextBundle({
      tenantId: 't1',
      storeId: 's1',
      runId: 'r2',
      parentRunId: 'r1',
      agentName: 'merchant-audit',
      tags: ['handoff', 'pilot'],
    });
    expect(b.parentRunId).toBe('r1');
    expect(b.agentName).toBe('merchant-audit');
    expect(b.tags).toEqual(['handoff', 'pilot']);
  });

  it('lança quando tenantId ausente', () => {
    expect(() => buildContextBundle({ tenantId: '', storeId: 's1', runId: 'r1' })).toThrow(
      TenantContextError,
    );
  });

  it('lança quando storeId ausente', () => {
    expect(() => buildContextBundle({ tenantId: 't1', storeId: '', runId: 'r1' })).toThrow(
      TenantContextError,
    );
  });

  it('lança quando runId ausente', () => {
    expect(() => buildContextBundle({ tenantId: 't1', storeId: 's1', runId: '' })).toThrow(
      TenantContextError,
    );
  });

  it('bundle não vaza props extras inesperadas', () => {
    const b: ContextBundle = buildContextBundle({ tenantId: 't1', storeId: 's1', runId: 'r1' });
    const keys = Object.keys(b);
    expect(keys).not.toContain('parentRunId');
    expect(keys).not.toContain('tags');
  });

  it('tags são copiadas (não referência)', () => {
    const src = ['a', 'b'];
    const b = buildContextBundle({ tenantId: 't1', storeId: 's1', runId: 'r1', tags: src });
    src.push('c');
    expect(b.tags).toEqual(['a', 'b']);
  });
});

describe('isGlobalContext', () => {
  it('true para { scope: "global", reason: "..." }', () => {
    expect(isGlobalContext({ scope: 'global', reason: 'health-check' })).toBe(true);
  });

  it('false para contexto de tenant', () => {
    expect(isGlobalContext({ tenantId: 't1' })).toBe(false);
  });

  it('false para null/undefined/string', () => {
    expect(isGlobalContext(null)).toBe(false);
    expect(isGlobalContext(undefined)).toBe(false);
    expect(isGlobalContext('global')).toBe(false);
  });

  it('false quando reason ausente', () => {
    expect(isGlobalContext({ scope: 'global' })).toBe(false);
  });
});

describe('slugifyShopDomain', () => {
  it('extrai handle de domínio .myshopify.com', () => {
    expect(slugifyShopDomain('acme.myshopify.com')).toBe('acme');
  });

  it('converte domínio custom para slug', () => {
    expect(slugifyShopDomain('loja.com.br')).toBe('loja-com-br');
  });

  it('é case-insensitive e trim', () => {
    expect(slugifyShopDomain('  ACME.myshopify.com  ')).toBe('acme');
  });

  it('lida com subdomínio em domínio custom', () => {
    expect(slugifyShopDomain('shop.acme-corp.example.com')).toBe('shop-acme-corp-example-com');
  });

  it('lança quando shopDomain inválido', () => {
    expect(() => slugifyShopDomain('')).toThrow(TenantContextError);
    expect(() => slugifyShopDomain(null as unknown as string)).toThrow(TenantContextError);
  });

  it('exemplo Incluo', () => {
    expect(slugifyShopDomain('incluobrasil.myshopify.com')).toBe('incluobrasil');
    expect(slugifyShopDomain('incluobrasil.com')).toBe('incluobrasil-com');
  });
});

describe('TenantStoreContext type ergonomics', () => {
  it('aceita objeto literal', () => {
    const ctx: TenantStoreContext = { tenantId: 't1', storeId: 's1' };
    expect(ctx.tenantId).toBe('t1');
    expect(ctx.storeId).toBe('s1');
  });
});
