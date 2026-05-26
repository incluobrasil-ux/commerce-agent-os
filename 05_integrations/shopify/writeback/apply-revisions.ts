// Aplica revisões textuais a um campo HTML/texto de produto Shopify.
// Estratégia: str-replace literal de cada `original` por `suggested`. Tolerante
// a misses (revisão não encontrada vira aviso, não erro), porque o markdown de
// compliance pode ter aspas re-formatadas que não batem 1:1 com HTML.
//
// Saída inclui diff explícito para revisão humana antes de --apply.

import type { ParsedRevision } from './compliance-parser.js';

export interface RevisionApplication {
  index: number;
  original: string;
  suggested: string;
  reason: string;
  status: 'applied' | 'not-found' | 'placeholder-skipped';
}

export interface ApplyResult {
  before: string;
  after: string;
  applications: RevisionApplication[];
  appliedCount: number;
  notFoundCount: number;
  placeholderSkippedCount: number;
  changed: boolean;
}

// Sugestões que vêm com placeholders entre [colchetes] ou que pedem ação humana
// (ex.: "[Remover trecho integralmente]", "[inserir norma: ...]") NÃO podem ser
// aplicadas mecanicamente. Skipamos com sinal claro.
const PLACEHOLDER_PATTERN = /^\s*\[[^\]]+\]\s*$|\[(inserir|remover|preencher|todo)/i;

function isPlaceholder(suggested: string): boolean {
  return PLACEHOLDER_PATTERN.test(suggested);
}

export function applyRevisions(input: string, revisions: ParsedRevision[]): ApplyResult {
  let current = input;
  const applications: RevisionApplication[] = [];
  let applied = 0;
  let notFound = 0;
  let placeholders = 0;

  revisions.forEach((rev, i) => {
    if (isPlaceholder(rev.suggested)) {
      applications.push({
        index: i,
        original: rev.original,
        suggested: rev.suggested,
        reason: rev.reason,
        status: 'placeholder-skipped',
      });
      placeholders += 1;
      return;
    }
    if (current.includes(rev.original)) {
      current = current.split(rev.original).join(rev.suggested);
      applications.push({
        index: i,
        original: rev.original,
        suggested: rev.suggested,
        reason: rev.reason,
        status: 'applied',
      });
      applied += 1;
    } else {
      applications.push({
        index: i,
        original: rev.original,
        suggested: rev.suggested,
        reason: rev.reason,
        status: 'not-found',
      });
      notFound += 1;
    }
  });

  return {
    before: input,
    after: current,
    applications,
    appliedCount: applied,
    notFoundCount: notFound,
    placeholderSkippedCount: placeholders,
    changed: current !== input,
  };
}

// Diff humano-legível em formato `--- before / +++ after` por revisão aplicada.
// Não é unified diff completo (excesso para o caso) — só lista o que mudou.
export function renderApplyDiff(result: ApplyResult): string {
  const lines: string[] = [];
  lines.push(`Revisões: ${result.applications.length}`);
  lines.push(`  applied=${result.appliedCount}`);
  lines.push(`  not-found=${result.notFoundCount}`);
  lines.push(`  placeholder-skipped=${result.placeholderSkippedCount}`);
  lines.push('');
  for (const app of result.applications) {
    const tag =
      app.status === 'applied' ? '✓' : app.status === 'not-found' ? '✗ not-found' : '⊘ skipped';
    lines.push(`[${tag}] #${app.index + 1}`);
    lines.push(`  - ${truncate(app.original, 120)}`);
    lines.push(`  + ${truncate(app.suggested, 120)}`);
    if (app.status === 'not-found') {
      lines.push('    motivo do skip: texto original não bate com produto atual');
    } else if (app.status === 'placeholder-skipped') {
      lines.push('    motivo do skip: sugestão contém placeholder humano');
    }
  }
  return lines.join('\n');
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}
