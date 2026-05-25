// Dry-run writer — gera artefato auditável para feed candidato.
// Escreve JSON (estado bruto) + Markdown (humano-legível) em 12_reports/merchant-dry-runs/.
// Nenhuma chamada à API Google.

import { promises as fs } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import type { FeedRow, ValidationResult } from './feed-row.js';

export interface DryRunInput {
  /** Linhas do feed que SERIAM enviadas. */
  rows: FeedRow[];
  /** Resultado da validação row-a-row, mesma ordem de rows. */
  validations: ValidationResult[];
  /** Warnings agregados (por row, mesma ordem). */
  warningsPerRow: string[][];
  /** Identificador do tenant (vira parte do path/log). */
  tenantId: string;
  /** Diretório de saída (default: 12_reports/merchant-dry-runs/). */
  outDir?: string;
}

export interface DryRunResult {
  jsonPath: string;
  markdownPath: string;
  okCount: number;
  failCount: number;
  warningCount: number;
}

function timestamp(d: Date): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`
  );
}

export async function writeDryRunReport(input: DryRunInput): Promise<DryRunResult> {
  const repoRoot = resolve(process.cwd());
  const outDir = input.outDir ?? resolve(repoRoot, '12_reports/merchant-dry-runs');
  const ts = timestamp(new Date());
  const baseName = `${input.tenantId}-${ts}`;
  const jsonPath = join(outDir, `${baseName}.json`);
  const markdownPath = join(outDir, `${baseName}.md`);

  const okCount = input.validations.filter((v) => v.ok).length;
  const failCount = input.validations.length - okCount;
  const warningCount = input.warningsPerRow.reduce((a, w) => a + w.length, 0);

  const payload = {
    generatedAt: new Date().toISOString(),
    tenantId: input.tenantId,
    summary: { total: input.rows.length, ok: okCount, fail: failCount, warnings: warningCount },
    rows: input.rows.map((row, i) => ({
      row,
      validation: input.validations[i] ?? { ok: false, errors: [] },
      warnings: input.warningsPerRow[i] ?? [],
    })),
  };

  const md = renderMarkdown(payload);

  await fs.mkdir(dirname(jsonPath), { recursive: true });
  await fs.writeFile(jsonPath, JSON.stringify(payload, null, 2), 'utf8');
  await fs.writeFile(markdownPath, md, 'utf8');

  return { jsonPath, markdownPath, okCount, failCount, warningCount };
}

function renderMarkdown(payload: {
  generatedAt: string;
  tenantId: string;
  summary: { total: number; ok: number; fail: number; warnings: number };
  rows: Array<{ row: FeedRow; validation: ValidationResult; warnings: string[] }>;
}): string {
  const lines: string[] = [];
  lines.push(`# Merchant dry-run — ${payload.tenantId}`);
  lines.push('');
  lines.push(`- **Gerado em:** ${payload.generatedAt}`);
  lines.push(
    `- **Total:** ${payload.summary.total} · ` +
      `**OK:** ${payload.summary.ok} · ` +
      `**Fail:** ${payload.summary.fail} · ` +
      `**Warnings:** ${payload.summary.warnings}`,
  );
  lines.push('');
  lines.push('## Rows');
  lines.push('');
  lines.push('| # | offerId | title | availability | price | valid? | warnings | erros |');
  lines.push('|---|---|---|---|---|---|---|---|');
  payload.rows.forEach((r, i) => {
    const title = r.row.title.length > 40 ? `${r.row.title.slice(0, 37)}...` : r.row.title;
    const valid = r.validation.ok ? '🟢' : '🔴';
    const errs =
      r.validation.errors.length > 0
        ? r.validation.errors.map((e) => `\`${e.path}\`: ${e.message}`).join('<br/>')
        : '—';
    const warns = r.warnings.length > 0 ? r.warnings.join('<br/>') : '—';
    lines.push(
      `| ${i + 1} | \`${r.row.offerId}\` | ${title} | ${r.row.availability} | ` +
        `${r.row.price.amount} ${r.row.price.currencyCode} | ${valid} | ${warns} | ${errs} |`,
    );
  });
  lines.push('');
  lines.push('## Payload bruto');
  lines.push('');
  lines.push('Disponível no JSON companion (mesmo basename).');
  lines.push('');
  lines.push('---');
  lines.push('_Gerado por `@cao/integration-google-merchant.writeDryRunReport` — sem envio real._');
  return lines.join('\n');
}
