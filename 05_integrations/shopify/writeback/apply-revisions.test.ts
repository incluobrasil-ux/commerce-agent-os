import { describe, expect, it } from 'vitest';
import { applyRevisions, renderApplyDiff } from './apply-revisions.js';
import type { ParsedRevision } from './compliance-parser.js';

describe('applyRevisions', () => {
  it('aplica str-replace literal de revisões encontradas', () => {
    const input = 'Comprar agora! Brinquedo Educativo de Madeira. Mais info...';
    const revs: ParsedRevision[] = [
      {
        original: 'Comprar agora!',
        suggested: 'Adicione ao carrinho.',
        reason: 'CTA mais neutro.',
      },
    ];
    const r = applyRevisions(input, revs);
    expect(r.appliedCount).toBe(1);
    expect(r.notFoundCount).toBe(0);
    expect(r.changed).toBe(true);
    expect(r.after).toBe('Adicione ao carrinho. Brinquedo Educativo de Madeira. Mais info...');
    expect(r.applications[0]?.status).toBe('applied');
  });

  it('marca revisões não encontradas como not-found e não modifica texto', () => {
    const input = 'texto original aqui.';
    const revs: ParsedRevision[] = [
      { original: 'frase que nao existe', suggested: 'frase nova', reason: 'r' },
    ];
    const r = applyRevisions(input, revs);
    expect(r.notFoundCount).toBe(1);
    expect(r.changed).toBe(false);
    expect(r.after).toBe(input);
    expect(r.applications[0]?.status).toBe('not-found');
  });

  it('detecta placeholders entre colchetes e pula', () => {
    const input = 'texto original aqui.';
    const revs: ParsedRevision[] = [
      {
        original: 'texto original aqui.',
        suggested: '[Remover trecho integralmente]',
        reason: 'r',
      },
      { original: 'texto', suggested: '[inserir laudo técnico aqui]', reason: 'r2' },
    ];
    const r = applyRevisions(input, revs);
    expect(r.placeholderSkippedCount).toBe(2);
    expect(r.appliedCount).toBe(0);
    expect(r.changed).toBe(false);
    expect(r.applications[0]?.status).toBe('placeholder-skipped');
    expect(r.applications[1]?.status).toBe('placeholder-skipped');
  });

  it('combina applied + not-found + placeholder na mesma execução', () => {
    const input = 'AAA BBB CCC';
    const revs: ParsedRevision[] = [
      { original: 'AAA', suggested: 'aaa', reason: '1' },
      { original: 'ZZZ', suggested: 'zzz', reason: '2' },
      { original: 'BBB', suggested: '[inserir aqui]', reason: '3' },
    ];
    const r = applyRevisions(input, revs);
    expect(r.appliedCount).toBe(1);
    expect(r.notFoundCount).toBe(1);
    expect(r.placeholderSkippedCount).toBe(1);
    expect(r.after).toBe('aaa BBB CCC');
  });

  it('substitui múltiplas ocorrências de cada original', () => {
    const input = 'foo bar foo bar foo';
    const revs: ParsedRevision[] = [{ original: 'foo', suggested: 'qux', reason: 'r' }];
    const r = applyRevisions(input, revs);
    expect(r.after).toBe('qux bar qux bar qux');
    expect(r.appliedCount).toBe(1);
  });
});

describe('renderApplyDiff', () => {
  it('gera saída humano-legível', () => {
    const revs: ParsedRevision[] = [
      { original: 'foo', suggested: 'bar', reason: 'razão' },
      { original: 'inexistente', suggested: 'qualquer', reason: 'outra' },
    ];
    const r = applyRevisions('foo baz', revs);
    const out = renderApplyDiff(r);
    expect(out).toContain('applied=1');
    expect(out).toContain('not-found=1');
    expect(out).toContain('[✓]');
    expect(out).toContain('[✗ not-found]');
  });
});
