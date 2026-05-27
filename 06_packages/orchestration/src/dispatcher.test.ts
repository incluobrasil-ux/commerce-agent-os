import { describe, expect, it } from 'vitest';
import { newBundle } from './bundle.js';
import { makeShellDispatcher } from './dispatcher.js';

function makeBundle(opts: { storeId?: string } = {}) {
  return newBundle({
    tenantId: 't',
    storeId: opts.storeId ?? 's',
    runId: 'r1',
    objective: 'x',
    executionScope: 'store',
    executionMode: 'read-only',
    jurisdictions: ['BR'],
    plannedRoute: [],
  });
}

describe('shell dispatcher', () => {
  it('em dry-plan (executable=false) retorna completed sem spawnar', async () => {
    const logs: string[] = [];
    const dispatcher = makeShellDispatcher({
      cwd: process.cwd(),
      logger: (line) => logs.push(line),
      executable: false,
    });

    const bundle = makeBundle();
    const result = await dispatcher({ agent: 'catalog-feed-ops', purpose: 'p' }, bundle);

    expect(result.status).toBe('completed');
    expect(result.agent).toBe('catalog-feed-ops');
    expect(logs.join('')).toContain('dry-plan');
    expect(logs.join('')).toContain('pnpm merchant:audit');
    expect(logs.join('')).toContain('--tenant=t');
    expect(logs.join('')).toContain('--store=s');
  });

  it('agente sem pnpmCommand retorna skipped_gracefully', async () => {
    const dispatcher = makeShellDispatcher({ cwd: process.cwd(), executable: true });
    const bundle = makeBundle();
    // product-feed-seo é library-only no registry (pnpmCommand vazio)
    const result = await dispatcher({ agent: 'product-feed-seo', purpose: 'p' }, bundle);
    expect(result.status).toBe('skipped_gracefully');
    expect(result.skipReason).toBe('library_only_or_no_cli');
  });

  it('agente não-registrado retorna failed_recoverable', async () => {
    const dispatcher = makeShellDispatcher({ cwd: process.cwd(), executable: true });
    const bundle = makeBundle();
    const result = await dispatcher({ agent: 'inexistente-agente', purpose: 'p' }, bundle);
    expect(result.status).toBe('failed_recoverable');
    expect(result.skipReason).toBe('agent_not_in_registry');
  });

  it('storeId _no-store_ não vira flag --store', async () => {
    const logs: string[] = [];
    const dispatcher = makeShellDispatcher({
      cwd: process.cwd(),
      logger: (line) => logs.push(line),
      executable: false,
    });
    const bundle = makeBundle({ storeId: '_no-store_' });
    await dispatcher({ agent: 'catalog-feed-ops', purpose: 'p' }, bundle);
    const out = logs.join('');
    expect(out).toContain('--tenant=t');
    expect(out).not.toContain('--store=');
  });
});
