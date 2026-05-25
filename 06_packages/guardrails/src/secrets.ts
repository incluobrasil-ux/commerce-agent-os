// Secret scan — padrões comuns. Hook integrável com gitleaks/external.

export type SecretKind =
  | 'anthropic_api_key'
  | 'openai_api_key'
  | 'github_token'
  | 'aws_access_key'
  | 'generic_high_entropy';

export interface SecretMatch {
  kind: SecretKind;
  match: string;
  index: number;
}

const PATTERNS: Array<{ kind: SecretKind; re: RegExp }> = [
  { kind: 'anthropic_api_key', re: /sk-ant-[a-zA-Z0-9_-]{40,}/g },
  { kind: 'openai_api_key', re: /sk-(?:proj-)?[a-zA-Z0-9_-]{40,}/g },
  { kind: 'github_token', re: /(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,}/g },
  { kind: 'aws_access_key', re: /AKIA[0-9A-Z]{16}/g },
];

export function detectSecrets(text: string): SecretMatch[] {
  const found: SecretMatch[] = [];
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

export function hasSecrets(text: string): boolean {
  return detectSecrets(text).length > 0;
}

// Hook: permite injetar scan externo (ex.: gitleaks via subprocess).
export type ExternalScanner = (text: string) => Promise<SecretMatch[]> | SecretMatch[];

export async function scanWith(text: string, external?: ExternalScanner): Promise<SecretMatch[]> {
  const internal = detectSecrets(text);
  if (!external) return internal;
  const externalMatches = await external(text);
  return [...internal, ...externalMatches];
}
