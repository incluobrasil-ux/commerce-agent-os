import { defineConfig } from 'vitest/config';

// vitest config raiz (ADR-0006).
// Estratégia: single project com include globs cobrindo todas as áreas com testes.
// Quando packages exigirem configuração própria, migrar para vitest.workspace.ts.

export default defineConfig({
  test: {
    include: [
      '06_packages/**/*.{test,spec}.{js,ts}',
      '05_integrations/**/*.{test,spec}.{js,ts}',
      '04_apps/**/*.{test,spec}.{js,ts}',
      '03_agents/**/*.{test,spec}.{js,ts}',
      '11_tests/smoke/**/*.smoke.{js,ts}',
      '11_tests/contract/**/*.contract.{test,spec}.{js,ts}',
      '11_tests/integration/**/*.integration.{test,spec}.{js,ts}',
      '11_tests/e2e/**/*.e2e.{test,spec}.{js,ts}',
      '11_tests/performance/**/*.perf.{test,spec}.{js,ts}',
    ],
    exclude: ['**/node_modules/**', '**/dist/**', '01_upstreams/**', '08_data/**', '12_reports/**'],
    // Smoke deve rodar < 30s sem rede (STACK_RULES §7).
    testTimeout: 30_000,
    hookTimeout: 10_000,
    // Reporter padrão; coverage habilitado on-demand via --coverage.
  },
});
