// Parser do markdown de merchant-compliance → revisões estruturadas.
// Necessário porque o CLI atual só persiste markdown (não JSON sidecar).
// Tolerante: ignora itens malformados em vez de falhar, mas exige pelo menos
// 1 par original/suggested para ter sentido.

export interface ParsedRevision {
  original: string;
  suggested: string;
  reason: string;
}

export interface ParsedComplianceFile {
  label: string | null;
  overallSeverity: 'none' | 'low' | 'medium' | 'high' | null;
  generatedAt: string | null;
  runId: string | null;
  revisions: ParsedRevision[];
  legalRiskCount: number;
}

const SEVERITY_PATTERN = /\*\*Overall severity:\*\*\s+(NONE|LOW|MEDIUM|HIGH)/i;
const LABEL_PATTERN = /^#\s+Compliance review\s+—\s+(.+)$/m;
const GENERATED_AT_PATTERN = /\*\*Gerado em:\*\*\s+(\S+)/;
const RUN_ID_PATTERN = /\*\*Run ID:\*\*\s+(\S+)/;
const LEGAL_RISK_ITEM = /^- \*\*\[(?:LOW|MEDIUM|HIGH)\]/gm;

// Bloco de revisão: "- _original:_ \"...\"\n  - _sugerido:_ \"...\"\n  - _motivo:_ \"...\""
// Quotes podem ser " ou ", e o conteúdo pode quebrar linhas até o próximo "_sugerido:_" ou hífen.
export function parseComplianceMarkdown(md: string): ParsedComplianceFile {
  const labelMatch = LABEL_PATTERN.exec(md);
  const sevMatch = SEVERITY_PATTERN.exec(md);
  const genMatch = GENERATED_AT_PATTERN.exec(md);
  const runMatch = RUN_ID_PATTERN.exec(md);
  const legalRiskCount = (md.match(LEGAL_RISK_ITEM) ?? []).length;

  const section = extractSection(md, 'Revisões recomendadas');
  const revisions = section ? extractRevisions(section) : [];

  const severityRaw = sevMatch?.[1]?.toLowerCase();
  return {
    label: labelMatch?.[1]?.trim() ?? null,
    overallSeverity: (severityRaw as ParsedComplianceFile['overallSeverity']) ?? null,
    generatedAt: genMatch?.[1] ?? null,
    runId: runMatch?.[1] ?? null,
    revisions,
    legalRiskCount,
  };
}

function extractSection(md: string, heading: string): string | null {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`##\\s+${escaped}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|\\n---|\\n_Gerado por|$)`);
  const m = re.exec(md);
  return m?.[1] ?? null;
}

// Cada revisão começa com "- _original:_" e ocupa 3 linhas (original/sugerido/motivo).
// Quotes esperadas em formato Markdown italic + aspas. Tolerante a variações.
function extractRevisions(section: string): ParsedRevision[] {
  const out: ParsedRevision[] = [];
  const lines = section.split(/\r?\n/);
  let current: Partial<ParsedRevision> = {};

  const flush = (): void => {
    if (current.original && current.suggested) {
      out.push({
        original: current.original,
        suggested: current.suggested,
        reason: current.reason ?? '',
      });
    }
    current = {};
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const orig = matchKey(line, 'original');
    const sugg = matchKey(line, 'sugerido');
    const mot = matchKey(line, 'motivo');
    if (orig !== null) {
      flush();
      current.original = orig;
    } else if (sugg !== null) {
      current.suggested = sugg;
    } else if (mot !== null) {
      current.reason = mot;
    }
  }
  flush();
  return out;
}

// Aceita "- _key:_ \"...\"" ou "_key:_ \"...\"" e remove aspas envoltas.
function matchKey(line: string, key: string): string | null {
  const re = new RegExp(`^-?\\s*_${key}:_\\s+(.+)$`);
  const m = re.exec(line);
  const captured = m?.[1];
  if (!captured) return null;
  return unquote(captured.trim());
}

function unquote(s: string): string {
  // Remove um par de aspas envolventes (", ', ou “”).
  if (s.length < 2) return s;
  const first = s.charAt(0);
  const last = s.charAt(s.length - 1);
  const pairs: Array<[string, string]> = [
    ['"', '"'],
    ["'", "'"],
    ['“', '”'],
  ];
  for (const [a, b] of pairs) {
    if (first === a && last === b) return s.slice(1, -1);
  }
  return s;
}
