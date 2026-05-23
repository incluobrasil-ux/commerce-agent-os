import { describe, expect, it } from 'vitest';
import { PRICING, estimateCostUsd } from './cost.js';

describe('estimateCostUsd', () => {
  it('calcula custo de sonnet com 1M in + 1M out', () => {
    const cost = estimateCostUsd('claude-sonnet-4-6', 1_000_000, 1_000_000);
    const expected =
      PRICING['claude-sonnet-4-6']!.inputPerMillion +
      PRICING['claude-sonnet-4-6']!.outputPerMillion;
    expect(cost).toBeCloseTo(expected, 5);
  });

  it('escala linearmente', () => {
    const small = estimateCostUsd('claude-sonnet-4-6', 1000, 1000);
    const large = estimateCostUsd('claude-sonnet-4-6', 10_000, 10_000);
    expect(large).toBeCloseTo(small * 10, 6);
  });

  it('modelo desconhecido retorna 0', () => {
    expect(estimateCostUsd('inexistente', 1_000_000, 1_000_000)).toBe(0);
  });
});
