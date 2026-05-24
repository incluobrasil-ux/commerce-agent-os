// Utilitários de manipulação determinística de markdown — append seguro,
// patch de frontmatter, replace de seção delimitada por anchor.

import { promises as fs } from 'node:fs';

/** Atualiza o campo `updated_at:` no frontmatter (ou cria se não existir). */
export function bumpUpdatedAt(text: string, isoTimestamp: string): string {
  if (!text.startsWith('---')) {
    return `---\nupdated_at: ${isoTimestamp}\n---\n\n${text}`;
  }
  const closingIdx = text.indexOf('\n---', 4);
  if (closingIdx < 0) return text;
  const frontmatter = text.slice(0, closingIdx);
  const rest = text.slice(closingIdx);
  const re = /updated_at:\s*[^\n]+/;
  if (re.test(frontmatter)) {
    return frontmatter.replace(re, `updated_at: ${isoTimestamp}`) + rest;
  }
  return `${frontmatter}\nupdated_at: ${isoTimestamp}${rest}`;
}

/**
 * Insere `newLine` logo após a primeira linha que casa `anchorRegex`,
 * pulando linhas de cabeçalho de tabela se existirem.
 * Útil para adicionar entrada no topo de uma tabela.
 */
export function insertAfterAnchor(text: string, anchorRegex: RegExp, newLine: string): string {
  const lines = text.split('\n');
  const idx = lines.findIndex((l) => anchorRegex.test(l));
  if (idx < 0) {
    throw new Error(`anchor não encontrado: ${anchorRegex}`);
  }
  // Avança até encontrar o SEPARADOR de tabela (|---|---|) — ignora prosa entre heading
  // e tabela. Para se encontrar próximo heading antes da tabela (não há tabela na seção).
  let scan = idx + 1;
  while (scan < lines.length) {
    const line = lines[scan] ?? '';
    if (/^##\s/.test(line)) {
      // Sem tabela na seção: inserir logo após o anchor (linha em branco depois do heading).
      lines.splice(idx + 1, 0, newLine);
      return lines.join('\n');
    }
    if (/^\|[-\s|]+\|\s*$/.test(line)) {
      // Achou separador: inserir logo depois (vira a primeira linha de dados).
      lines.splice(scan + 1, 0, newLine);
      return lines.join('\n');
    }
    scan++;
  }
  // EOF sem tabela: insere após anchor.
  lines.splice(idx + 1, 0, newLine);
  return lines.join('\n');
}

/**
 * Insere bloco antes do primeiro `## ` heading que matchar `nextHeadingRegex`.
 * Se não encontrar, append no fim.
 */
export function insertBeforeHeading(text: string, nextHeadingRegex: RegExp, block: string): string {
  const lines = text.split('\n');
  const idx = lines.findIndex((l) => nextHeadingRegex.test(l));
  if (idx < 0) return `${text}\n\n${block}`;
  lines.splice(idx, 0, block, '');
  return lines.join('\n');
}

export async function readOrEmpty(path: string): Promise<string> {
  try {
    return await fs.readFile(path, 'utf8');
  } catch {
    return '';
  }
}
