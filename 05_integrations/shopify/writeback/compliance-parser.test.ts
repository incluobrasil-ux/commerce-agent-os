import { describe, expect, it } from 'vitest';
import { parseComplianceMarkdown } from './compliance-parser.js';

describe('parseComplianceMarkdown', () => {
  const sample = `# Compliance review — contas-madeira-pdp-review

- **Gerado em:** 2026-05-26T17:47:12.623Z
- **Content type:** product-description
- **Overall severity:** HIGH
- **Modelo:** claude-sonnet-4-6
- **Run ID:** abc-123

## Resumo

Texto qualquer.

## Legal risks

- **[HIGH] Alegação terapêutica — TDAH**
  - _excerpt:_ "trecho"
  - _rationale:_ rationale aqui
- **[MEDIUM] Outro item**
  - _excerpt:_ "outro"
  - _rationale:_ outro rationale

## Revisões recomendadas

- _original:_ "Ferramenta de autorregulacao sensorial"
  - _sugerido:_ "Brinquedo educativo de alinhavo"
  - _motivo:_ Substituir terminologia clínica.
- _original:_ "madeira natural atoxica"
  - _sugerido:_ "madeira natural com acabamento atóxico certificado"
  - _motivo:_ Referenciar laudo técnico.
- _original:_ "Faixa 3 mais."
  - _sugerido:_ "[Remover trecho integralmente]"
  - _motivo:_ Placeholder que precisa de ação humana.

## Follow-ups

- Algum follow-up.

---
_Gerado por \`@cao/merchant-compliance\`. Não substitui revisão jurídica._
`;

  it('extrai metadata do header', () => {
    const parsed = parseComplianceMarkdown(sample);
    expect(parsed.label).toBe('contas-madeira-pdp-review');
    expect(parsed.overallSeverity).toBe('high');
    expect(parsed.generatedAt).toBe('2026-05-26T17:47:12.623Z');
    expect(parsed.runId).toBe('abc-123');
  });

  it('conta legal risks', () => {
    const parsed = parseComplianceMarkdown(sample);
    expect(parsed.legalRiskCount).toBe(2);
  });

  it('extrai todas as revisões (incluindo placeholder)', () => {
    const parsed = parseComplianceMarkdown(sample);
    expect(parsed.revisions).toHaveLength(3);
    expect(parsed.revisions[0]?.original).toBe('Ferramenta de autorregulacao sensorial');
    expect(parsed.revisions[0]?.suggested).toBe('Brinquedo educativo de alinhavo');
    expect(parsed.revisions[2]?.suggested).toBe('[Remover trecho integralmente]');
  });

  it('é tolerante a markdown sem revisões', () => {
    const noRevs = `# Compliance review — x
- **Overall severity:** LOW

## Resumo
sem revisões aqui.
`;
    const parsed = parseComplianceMarkdown(noRevs);
    expect(parsed.revisions).toEqual([]);
    expect(parsed.overallSeverity).toBe('low');
  });

  it('é tolerante a markdown vazio', () => {
    const parsed = parseComplianceMarkdown('');
    expect(parsed.label).toBeNull();
    expect(parsed.overallSeverity).toBeNull();
    expect(parsed.revisions).toEqual([]);
    expect(parsed.legalRiskCount).toBe(0);
  });

  it('aceita aspas curvas “”', () => {
    const md = `# Compliance review — t
- **Overall severity:** LOW

## Revisões recomendadas

- _original:_ “foo”
  - _sugerido:_ “bar”
  - _motivo:_ Razão.
`;
    const parsed = parseComplianceMarkdown(md);
    expect(parsed.revisions).toHaveLength(1);
    expect(parsed.revisions[0]?.original).toBe('foo');
    expect(parsed.revisions[0]?.suggested).toBe('bar');
  });
});
