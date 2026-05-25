// Audit report writer — gera relatório operacional consolidado em
// 12_reports/merchant-audits/. Markdown legível + JSON com payload completo.

import { promises as fs } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import type { AuditSummary, Finding, RowScore, Severity } from './scorer.js';

export interface AuditReportInput {
  tenantId: string;
  source: 'fixture' | 'json' | 'csv' | 'shopify';
  rowScores: RowScore[];
  summary: AuditSummary;
  outDir?: string;
}

export interface AuditReportResult {
  jsonPath: string;
  markdownPath: string;
}

const SEVERITY_EMOJI: Record<Severity, string> = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🔵',
};

const BAND_EMOJI = {
  green: '🟢',
  yellow: '🟡',
  red: '🔴',
} as const;

function timestamp(d: Date): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`
  );
}

export async function writeAuditReport(input: AuditReportInput): Promise<AuditReportResult> {
  const repoRoot = resolve(process.cwd());
  const outDir = input.outDir ?? resolve(repoRoot, '12_reports/merchant-audits');
  const ts = timestamp(new Date());
  const baseName = `${input.tenantId}-${input.source}-${ts}`;
  const jsonPath = join(outDir, `${baseName}.json`);
  const markdownPath = join(outDir, `${baseName}.md`);

  const payload = {
    generatedAt: new Date().toISOString(),
    tenantId: input.tenantId,
    source: input.source,
    summary: input.summary,
    rowScores: input.rowScores,
  };

  await fs.mkdir(dirname(jsonPath), { recursive: true });
  await fs.writeFile(jsonPath, JSON.stringify(payload, null, 2), 'utf8');
  await fs.writeFile(markdownPath, renderMarkdown(payload), 'utf8');

  return { jsonPath, markdownPath };
}

interface RenderPayload {
  generatedAt: string;
  tenantId: string;
  source: string;
  summary: AuditSummary;
  rowScores: RowScore[];
}

export function renderMarkdown(payload: RenderPayload): string {
  const { summary, rowScores } = payload;
  const lines: string[] = [];

  lines.push(`# Merchant audit — ${payload.tenantId}`);
  lines.push('');
  lines.push(`- **Gerado em:** ${payload.generatedAt}`);
  lines.push(`- **Source:** ${payload.source}`);
  lines.push(`- **Total SKUs:** ${summary.totalRows}`);
  lines.push(`- **Score médio:** ${summary.averageScore}/100`);
  lines.push(
    `- **Distribuição:** 🟢 ${summary.greenCount} · 🟡 ${summary.yellowCount} · 🔴 ${summary.redCount}`,
  );
  lines.push(
    `- **Findings:** 🔴 ${summary.bySeverity.critical} critical · ` +
      `🟠 ${summary.bySeverity.high} high · ` +
      `🟡 ${summary.bySeverity.medium} medium · ` +
      `🔵 ${summary.bySeverity.low} low`,
  );
  lines.push('');

  if (summary.redCount > 0) {
    lines.push(
      '> ⚠ **Atenção:** SKUs em vermelho têm chance alta de disapproval. Corrigir antes de submeter.',
    );
    lines.push('');
  }

  if (summary.topFindings.length > 0) {
    lines.push('## Findings mais frequentes');
    lines.push('');
    lines.push('| # | Code | Severity | Ocorrências |');
    lines.push('|---|---|---|---|');
    summary.topFindings.forEach((f, i) => {
      lines.push(
        `| ${i + 1} | \`${f.code}\` | ${SEVERITY_EMOJI[f.severity]} ${f.severity} | ${f.count} |`,
      );
    });
    lines.push('');
  }

  lines.push('## Ranking de SKUs');
  lines.push('');
  lines.push('Ordem: piores primeiro (acionar em ordem).');
  lines.push('');
  lines.push('| Rank | Score | Band | offerId | Title | Findings | Crit | High |');
  lines.push('|---|---|---|---|---|---|---|---|');
  const sorted = [...rowScores].sort((a, b) => a.score - b.score);
  sorted.forEach((r, i) => {
    const title = r.title.length > 40 ? `${r.title.slice(0, 37)}...` : r.title;
    const crit = r.findings.filter((f) => f.severity === 'critical').length;
    const high = r.findings.filter((f) => f.severity === 'high').length;
    lines.push(
      `| ${i + 1} | **${r.score}** | ${BAND_EMOJI[r.band]} ${r.band} | \`${r.offerId}\` | ${title} | ${r.findings.length} | ${crit} | ${high} |`,
    );
  });
  lines.push('');

  // Detalhe por SKU para os 10 piores (ou todos se ≤ 10)
  const showDetail = sorted.slice(0, Math.min(10, sorted.length));
  if (showDetail.length > 0) {
    lines.push('## Detalhe — top piores SKUs');
    lines.push('');
    for (const r of showDetail) {
      if (r.findings.length === 0) continue;
      lines.push(`### ${BAND_EMOJI[r.band]} ${r.offerId} — score ${r.score}/100`);
      lines.push('');
      lines.push(`**Title:** ${r.title}`);
      lines.push('');
      lines.push(`**Findings (${r.findings.length}):**`);
      lines.push('');
      const grouped = groupBySeverity(r.findings);
      for (const sev of ['critical', 'high', 'medium', 'low'] as Severity[]) {
        const list = grouped[sev];
        if (list.length === 0) continue;
        lines.push(`- ${SEVERITY_EMOJI[sev]} **${sev}** (${list.length}):`);
        for (const f of list) {
          lines.push(`  - \`${f.code}\` (${f.field}) — ${f.message}`);
          lines.push(`    - _remediação:_ ${f.remediation}`);
        }
      }
      lines.push('');
    }
  }

  lines.push('## Como usar este relatório');
  lines.push('');
  lines.push('1. **🔴 vermelho** — bloqueio. Não submeter ao GMC sem corrigir.');
  lines.push('2. **🟡 amarelo** — qualidade ruim. Vai aprovar mas perde performance/CPC.');
  lines.push('3. **🟢 verde** — OK para submeter.');
  lines.push(
    '4. Trabalhar primeiro os findings de severity **critical** + **high** ordenados pelo SKU com pior score.',
  );
  lines.push('5. Re-rodar `pnpm merchant:audit` após correções para verificar progresso.');
  lines.push('');
  lines.push('---');
  lines.push(
    '_Gerado por `@cao/integration-google-merchant.writeAuditReport` — sem envio real ao GMC._',
  );
  return lines.join('\n');
}

function groupBySeverity(findings: Finding[]): Record<Severity, Finding[]> {
  const out: Record<Severity, Finding[]> = { critical: [], high: [], medium: [], low: [] };
  for (const f of findings) out[f.severity].push(f);
  return out;
}
