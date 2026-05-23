// packages-build.smoke.ts
// Smoke test: importa packages do workspace via path relativo (source TS) e verifica
// que o shape mínimo declarado em ADR-0009 + scaffold está presente.
//
// Path relativo é intencional: packages ainda não foram buildados (sem dist/),
// então `import '@cao/shared-config'` resolveria para dist/index.js inexistente.
// Vitest transpila .ts on the fly via esbuild — funciona sem build prévio.

import { describe, expect, it } from 'vitest';

describe('packages-build smoke', () => {
  it('shared-config expõe SECRET_NAMES com chaves canônicas', async () => {
    const mod = await import('../../06_packages/shared-config/src/index.ts');
    expect(mod.SECRET_NAMES).toBeDefined();
    expect(typeof mod.SECRET_NAMES).toBe('object');
    expect(mod.SECRET_NAMES.SHOPIFY_API_KEY).toBe('SHOPIFY_API_KEY');
    expect(mod.SECRET_NAMES.POSTHOG_API_KEY).toBe('POSTHOG_API_KEY');
    expect(mod.SECRET_NAMES.ANTHROPIC_API_KEY).toBe('ANTHROPIC_API_KEY');
  });

  it('shared-types compila e é importável', async () => {
    await expect(import('../../06_packages/shared-types/src/index.ts')).resolves.toBeDefined();
  });

  it('integration-shopify errors expõe ShopifyAuthError com code estável', async () => {
    const mod = await import('../../05_integrations/shopify/errors/index.ts');
    expect(mod.ShopifyAuthError).toBeDefined();
    const err = new mod.ShopifyAuthError('test');
    expect(err.code).toBe('SHOPIFY_AUTH');
    expect(err.name).toBe('ShopifyAuthError');
  });
});
