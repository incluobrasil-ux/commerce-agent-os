// captureRun — única função pública: leva um summary estruturado e atualiza
// o cérebro operacional (run-summaries + index + session-log + optionals).
//
// Idempotente em runs-summaries (sobrescreve se mesmo slug+date); append-only
// em logs.

import { promises as fs } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { BaseError } from '@cao/core';
import {
  bumpUpdatedAt,
  insertAfterAnchor,
  insertBeforeHeading,
  readOrEmpty,
} from './markdown-utils.js';
import {
  type AppendBlocker,
  type AppendNextAction,
  type AppendPriority,
  type CaptureInput,
  type CaptureKind,
  type CaptureResult,
  captureInputSchema,
} from './types.js';

export class CaptureError extends BaseError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'BRAIN_CAPTURE', context);
  }
}

export interface CaptureOutput {
  summaryPath: string;
  filesUpdated: string[];
}

/**
 * Brain dir do projeto (canonical dev brain). Usado quando nenhum tenantId
 * é passado — preserva o comportamento legado para devs e CIs.
 */
const DEFAULT_BRAIN_DIR = '07_memory/vault/projects/commerce-agent-os';

/**
 * Resolve o brainDir de uma captura. Ordem de precedência:
 *   1. `brainDir` explícito (override absoluto).
 *   2. `tenantId` + `storeId` → `<repoRoot>/07_memory/vault/tenants/<t>/stores/<s>/`.
 *   3. `tenantId` apenas      → `<repoRoot>/07_memory/vault/tenants/<t>/`.
 *   4. fallback               → `<repoRoot>/07_memory/vault/projects/commerce-agent-os/`.
 *
 * Multi-tenant safety: captureRun para tenant A nunca escreve em tenant B
 * porque o path é resolvido a partir do tenantId passado explicitamente.
 */
export function resolveBrainDir(
  repoRoot: string,
  input: {
    brainDir?: string | undefined;
    tenantId?: string | undefined;
    storeId?: string | undefined;
  },
): string {
  if (input.brainDir) return input.brainDir;
  if (input.tenantId && input.storeId) {
    return resolve(repoRoot, '07_memory/vault/tenants', input.tenantId, 'stores', input.storeId);
  }
  if (input.tenantId) {
    return resolve(repoRoot, '07_memory/vault/tenants', input.tenantId);
  }
  return resolve(repoRoot, DEFAULT_BRAIN_DIR);
}

const RESULT_EMOJI: Record<CaptureResult, string> = {
  green: '🟢',
  yellow: '🟡',
  red: '🔴',
};

const KIND_TABLE_ANCHOR: Record<CaptureKind, RegExp> = {
  'agent-run': /^## Agent runs\s*$/,
  audit: /^## Audits\s*$/,
  'test-milestone': /^## Test milestones\s*$/,
  'impl-milestone': /^## Impl milestones\s*$/,
};

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isoTimestamp(d: Date): string {
  return d.toISOString();
}

function frontmatter(input: CaptureInput, now: Date): string {
  const lines = [
    '---',
    `created_at: ${isoTimestamp(now)}`,
    `updated_at: ${isoTimestamp(now)}`,
    `tags: [${input.tags.join(', ')}]`,
    `source: ${input.source}`,
    `kind: ${input.kind}`,
    `result: ${input.result}`,
    'confidence: 1.0',
  ];
  if (input.body.references.length > 0) {
    lines.push('related:');
    for (const r of input.body.references) lines.push(`  - ${r}`);
  }
  lines.push('---');
  return lines.join('\n');
}

function renderSummaryBody(input: CaptureInput): string {
  const lines: string[] = [];
  lines.push(`# ${input.title}`);
  lines.push('');
  lines.push('## Contexto');
  lines.push('');
  lines.push(input.body.context);
  lines.push('');
  lines.push('## O que aconteceu');
  lines.push('');
  for (const b of input.body.whatHappened) lines.push(`- ${b}`);
  lines.push('');
  if (input.body.findings.length > 0) {
    lines.push('## Achados / decisões');
    lines.push('');
    for (const b of input.body.findings) lines.push(`- ${b}`);
    lines.push('');
  }
  lines.push('## Impacto');
  lines.push('');
  lines.push(input.body.impact);
  lines.push('');
  if (input.appendNextActions && input.appendNextActions.length > 0) {
    lines.push('## Ações geradas');
    lines.push('');
    for (const a of input.appendNextActions) {
      lines.push(`- [ ] **${a.id}** — ${a.title} _(quem puxa: ${a.pull})_`);
    }
    lines.push('');
  }
  if (input.body.references.length > 0) {
    lines.push('## Referências');
    lines.push('');
    for (const r of input.body.references) lines.push(`- \`${r}\``);
    lines.push('');
  }
  lines.push('---');
  lines.push('_Gerado por `@cao/brain-bridge.captureRun`._');
  return lines.join('\n');
}

function indexLine(input: CaptureInput, now: Date, summaryFile: string): string {
  const emoji = RESULT_EMOJI[input.result];
  return `| ${isoDate(now)} | ${input.title} | ${emoji} | [${summaryFile}](${summaryFile}) |`;
}

function nextActionBlock(a: AppendNextAction): string {
  const lines: string[] = [];
  lines.push(`## ${a.id} — ${a.title}`);
  lines.push('');
  lines.push(`- **Ação:** ${a.action}`);
  if (a.prereq) lines.push(`- **Pré-requisito:** ${a.prereq}`);
  if (a.expected) lines.push(`- **Resultado esperado:** ${a.expected}`);
  lines.push(`- **Quem puxa:** ${a.pull}`);
  return lines.join('\n');
}

function priorityLine(p: AppendPriority): string {
  const deps = p.depends ?? '—';
  return `| ${p.id} | ${p.objective} | ${p.owner} | ${deps} | ${p.status} |`;
}

function blockerLine(b: AppendBlocker): string {
  return `| ${b.id} | ${b.title} | ${b.impact} | ${b.mitigation} | ${b.owner} | ${b.status} |`;
}

function sessionLogEntry(input: CaptureInput, now: Date, line: string): string {
  return [
    `## ${isoDate(now)} — ${input.title}`,
    '',
    `- ${line}`,
    `- Resultado: ${input.result}; ver run-summary \`run-summaries/${isoDate(now)}-${input.kind}-${input.slug}.md\`.`,
    '',
  ].join('\n');
}

export async function captureRun(rawInput: unknown): Promise<CaptureOutput> {
  const parse = captureInputSchema.safeParse(rawInput);
  if (!parse.success) {
    throw new CaptureError('captureRun: input inválido', {
      issues: parse.error.issues,
    });
  }
  const input = parse.data;
  const now = input.now ?? new Date();
  const repoRoot = resolve(process.cwd());
  const brainDir = resolveBrainDir(repoRoot, input);

  const summaryDir = join(brainDir, 'run-summaries');
  const summaryFile = `${isoDate(now)}-${input.kind}-${input.slug}.md`;
  const summaryPath = join(summaryDir, summaryFile);

  await fs.mkdir(dirname(summaryPath), { recursive: true });

  // 1. Escreve o summary (sobrescreve se mesmo nome — operador edita à vontade)
  const summaryContent = `${frontmatter(input, now)}\n\n${renderSummaryBody(input)}\n`;
  await fs.writeFile(summaryPath, summaryContent, 'utf8');
  const filesUpdated: string[] = [summaryPath];

  // 2. Atualiza index.md — adiciona linha na tabela do kind
  const indexPath = join(summaryDir, 'index.md');
  const indexCurrent = await readOrEmpty(indexPath);
  if (indexCurrent.length > 0) {
    const anchor = KIND_TABLE_ANCHOR[input.kind];
    try {
      let updated = insertAfterAnchor(indexCurrent, anchor, indexLine(input, now, summaryFile));
      updated = bumpUpdatedAt(updated, isoTimestamp(now));
      await fs.writeFile(indexPath, updated, 'utf8');
      filesUpdated.push(indexPath);
    } catch {
      // index existe mas anchor não encontrado — pulamos (operador inspeciona depois)
    }
  }

  // 3. session-log.md — insere entrada ANTES do primeiro "## YYYY-MM-DD" existente.
  // Se não houver entradas anteriores, append no final.
  if (input.sessionLogLine) {
    const slPath = join(brainDir, 'session-log.md');
    const slCurrent = await readOrEmpty(slPath);
    if (slCurrent.length > 0) {
      const entry = sessionLogEntry(input, now, input.sessionLogLine);
      const dateHeadingRe = /^## \d{4}-\d{2}-\d{2}/m;
      const updated = dateHeadingRe.test(slCurrent)
        ? slCurrent.replace(dateHeadingRe, `${entry}\n$&`)
        : `${slCurrent.trimEnd()}\n\n${entry}\n`;
      await fs.writeFile(slPath, bumpUpdatedAt(updated, isoTimestamp(now)), 'utf8');
      filesUpdated.push(slPath);
    }
  }

  // 4. next-actions.md — adiciona blocos novos antes da seção "Regras"
  if (input.appendNextActions && input.appendNextActions.length > 0) {
    const naPath = join(brainDir, 'next-actions.md');
    const naCurrent = await readOrEmpty(naPath);
    if (naCurrent.length > 0) {
      let updated = naCurrent;
      const block = input.appendNextActions.map(nextActionBlock).join('\n\n');
      updated = insertBeforeHeading(updated, /^## Regras\s*$/, block);
      updated = bumpUpdatedAt(updated, isoTimestamp(now));
      await fs.writeFile(naPath, updated, 'utf8');
      filesUpdated.push(naPath);
    }
  }

  // 5. operational-priorities.md — adiciona linhas na tabela do bucket
  if (input.appendPriorities && input.appendPriorities.length > 0) {
    const opPath = join(brainDir, 'operational-priorities.md');
    const opCurrent = await readOrEmpty(opPath);
    if (opCurrent.length > 0) {
      let updated = opCurrent;
      for (const p of input.appendPriorities) {
        const anchor =
          p.bucket === 'agora'
            ? /^## Agora\s*$/
            : p.bucket === 'proximo'
              ? /^## Próximo\s*$/
              : /^## Depois\s*$/;
        try {
          updated = insertAfterAnchor(updated, anchor, priorityLine(p));
        } catch {
          // bucket não encontrado — pula
        }
      }
      updated = bumpUpdatedAt(updated, isoTimestamp(now));
      await fs.writeFile(opPath, updated, 'utf8');
      filesUpdated.push(opPath);
    }
  }

  // 6. blockers-and-risks.md — adiciona linhas na tabela de bloqueios
  if (input.appendBlockers && input.appendBlockers.length > 0) {
    const brPath = join(brainDir, 'blockers-and-risks.md');
    const brCurrent = await readOrEmpty(brPath);
    if (brCurrent.length > 0) {
      let updated = brCurrent;
      for (const b of input.appendBlockers) {
        try {
          updated = insertAfterAnchor(updated, /^## Bloqueios ativos\s*$/, blockerLine(b));
        } catch {
          // pula
        }
      }
      updated = bumpUpdatedAt(updated, isoTimestamp(now));
      await fs.writeFile(brPath, updated, 'utf8');
      filesUpdated.push(brPath);
    }
  }

  // 7. current-state.md — só bump de updated_at (mudança de conteúdo fica manual)
  const csPath = join(brainDir, 'current-state.md');
  const csCurrent = await readOrEmpty(csPath);
  if (csCurrent.length > 0) {
    const updated = bumpUpdatedAt(csCurrent, isoTimestamp(now));
    if (updated !== csCurrent) {
      await fs.writeFile(csPath, updated, 'utf8');
      filesUpdated.push(csPath);
    }
  }

  return { summaryPath, filesUpdated };
}
