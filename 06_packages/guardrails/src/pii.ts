// PII detection — heurísticas básicas. Não substitui pipeline robusto.

export type PIIKind = 'email' | 'cpf' | 'phone_br' | 'credit_card';

export interface PIIMatch {
  kind: PIIKind;
  match: string;
  index: number;
}

const PATTERNS: Array<{ kind: PIIKind; re: RegExp }> = [
  { kind: 'email', re: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
  { kind: 'cpf', re: /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g },
  // Telefone BR com DDD: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
  { kind: 'phone_br', re: /\(\d{2}\)\s?\d{4,5}-\d{4}/g },
  // Cartão de crédito: 13–19 dígitos com separadores comuns. Heurística rasa.
  { kind: 'credit_card', re: /\b(?:\d[ -]?){13,19}\b/g },
];

export function detectPII(text: string): PIIMatch[] {
  const found: PIIMatch[] = [];
  for (const { kind, re } of PATTERNS) {
    re.lastIndex = 0;
    for (;;) {
      const m = re.exec(text);
      if (m === null) break;
      found.push({ kind, match: m[0], index: m.index });
    }
  }
  return found;
}

export function hasPII(text: string): boolean {
  return detectPII(text).length > 0;
}

export function redactPII(text: string, replacement = '[REDACTED]'): string {
  let out = text;
  for (const { re } of PATTERNS) {
    out = out.replace(re, replacement);
  }
  return out;
}
