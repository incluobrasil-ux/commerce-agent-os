// repo-auditor — auditoria determinística de repositório local.
// Sem dependência de LLM. Output segue contract.yaml.

import type { Dirent } from 'node:fs';
import { promises as fs } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import { BaseError } from '@cao/core';

export class RepoNotFound extends BaseError {
  constructor(repoPath: string) {
    super(`Repo not found at: ${repoPath}`, 'REPO_NOT_FOUND', { repoPath });
  }
}

export type AuditProfile = 'license' | 'security' | 'architecture' | 'full';
export type Severity = 'info' | 'warning' | 'critical';

export interface Finding {
  category: string;
  severity: Severity;
  file: string;
  line: number;
  recommendation: string;
}

export interface AuditResult {
  repoPath: string;
  repoName: string;
  profile: AuditProfile;
  license: string;
  findings: Finding[];
  report: {
    markdown: string;
    summary: string[];
  };
  generatedAt: string;
}

export interface AuditOptions {
  repoPath: string;
  profile?: AuditProfile;
}

// Cada entrada é uma alternativa: { spdx, allOf: [ ...substrings que precisam estar TODAS presentes ] }.
// A primeira entrada que casar vence — ordem importa.
const SPDX_PATTERNS: Array<{ id: string; allOf: string[] }> = [
  { id: 'MIT', allOf: ['MIT License'] },
  // MIT também detectado pela cláusula canônica (cobre LICENSE files que não dizem "MIT License" no topo)
  {
    id: 'MIT',
    allOf: [
      'Permission is hereby granted, free of charge',
      'without restriction',
      'THE SOFTWARE IS PROVIDED "AS IS"',
    ],
  },
  { id: 'Apache-2.0', allOf: ['Apache License', 'Version 2.0'] },
  {
    id: 'BSD-3-Clause',
    allOf: ['BSD 3-Clause', 'Redistribution and use in source and binary'],
  },
  { id: 'BSD-2-Clause', allOf: ['BSD 2-Clause'] },
  { id: 'GPL-3.0', allOf: ['GNU GENERAL PUBLIC LICENSE', 'Version 3'] },
  { id: 'GPL-2.0', allOf: ['GNU GENERAL PUBLIC LICENSE', 'Version 2'] },
  { id: 'ISC', allOf: ['ISC License'] },
];

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'out',
  '.next',
  '.turbo',
  '.pnpm-store',
  'coverage',
  '01_upstreams',
]);

const PROFILE_RUNS: Record<
  AuditProfile,
  { license: boolean; security: boolean; architecture: boolean }
> = {
  license: { license: true, security: false, architecture: false },
  security: { license: true, security: true, architecture: false },
  architecture: { license: true, security: false, architecture: true },
  full: { license: true, security: true, architecture: true },
};

export async function auditRepo(opts: AuditOptions): Promise<AuditResult> {
  const repoPath = resolve(opts.repoPath);
  const profile = opts.profile ?? 'full';

  await assertDir(repoPath);

  const repoName = basename(repoPath);
  const findings: Finding[] = [];
  const runs = PROFILE_RUNS[profile];

  let license = 'UNKNOWN';

  if (runs.license) {
    const lic = await detectLicense(repoPath);
    license = lic.spdx;
    if (lic.finding) findings.push(lic.finding);
  }

  let secInfo: SecuritySummary | undefined;
  if (runs.security) {
    secInfo = await scanSecurity(repoPath);
    findings.push(...secInfo.findings);
  }

  let archInfo: ArchitectureSummary | undefined;
  if (runs.architecture) {
    archInfo = await scanArchitecture(repoPath);
    findings.push(...archInfo.findings);
  }

  const summary = buildSummary({ repoName, profile, license, findings, archInfo, secInfo });
  const markdown = buildMarkdown({
    repoPath,
    repoName,
    profile,
    license,
    findings,
    summary,
    archInfo,
    secInfo,
  });

  return {
    repoPath,
    repoName,
    profile,
    license,
    findings,
    report: { markdown, summary },
    generatedAt: new Date().toISOString(),
  };
}

async function assertDir(path: string): Promise<void> {
  try {
    const st = await fs.stat(path);
    if (!st.isDirectory()) throw new RepoNotFound(path);
  } catch {
    throw new RepoNotFound(path);
  }
}

interface LicenseDetection {
  spdx: string;
  finding?: Finding;
}

async function detectLicense(repoPath: string): Promise<LicenseDetection> {
  const candidates = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'COPYING'];
  for (const name of candidates) {
    const p = join(repoPath, name);
    try {
      const content = await fs.readFile(p, 'utf8');
      const spdx = matchSpdx(content);
      if (spdx === 'UNKNOWN') {
        return {
          spdx,
          finding: {
            category: 'license',
            severity: 'warning',
            file: name,
            line: 0,
            recommendation:
              'Arquivo de licença presente mas SPDX não identificado pelos padrões atuais. Revisar manualmente e, se for licença comum, adicionar pattern em SPDX_PATTERNS.',
          },
        };
      }
      return { spdx };
    } catch {
      // continue
    }
  }
  // tenta package.json
  try {
    const pkg = JSON.parse(await fs.readFile(join(repoPath, 'package.json'), 'utf8')) as {
      license?: string;
    };
    if (pkg.license && typeof pkg.license === 'string') {
      return { spdx: pkg.license };
    }
  } catch {
    // ignore
  }
  return {
    spdx: 'UNKNOWN',
    finding: {
      category: 'license',
      severity: 'critical',
      file: 'LICENSE',
      line: 0,
      recommendation:
        'Adicionar arquivo LICENSE na raiz do repositório. Sem licença declarada, o repo é "all rights reserved" por default e não pode ser reutilizado.',
    },
  };
}

function matchSpdx(text: string): string {
  for (const { id, allOf } of SPDX_PATTERNS) {
    if (allOf.every((n) => text.includes(n))) return id;
  }
  return 'UNKNOWN';
}

interface SecuritySummary {
  envFiles: string[];
  hasGitignore: boolean;
  findings: Finding[];
}

async function scanSecurity(repoPath: string): Promise<SecuritySummary> {
  const findings: Finding[] = [];
  const tree = await walk(repoPath);

  const envFiles = tree.filter((f) => /(^|\/)\.env(\.|$)/.test(f) && !/\.env\.example$/.test(f));
  for (const f of envFiles) {
    findings.push({
      category: 'security',
      severity: 'critical',
      file: f,
      line: 0,
      recommendation:
        '.env não deve ser commitado. Verificar se está no .gitignore e remover do histórico se necessário.',
    });
  }

  const hasGitignore = tree.includes('.gitignore');
  if (!hasGitignore) {
    findings.push({
      category: 'security',
      severity: 'warning',
      file: '.gitignore',
      line: 0,
      recommendation: 'Adicionar .gitignore cobrindo node_modules, dist, .env*, build outputs.',
    });
  }

  return { envFiles, hasGitignore, findings };
}

interface ArchitectureSummary {
  hasReadme: boolean;
  hasPackageJson: boolean;
  hasTsConfig: boolean;
  primaryLang: string;
  totalFiles: number;
  findings: Finding[];
}

async function scanArchitecture(repoPath: string): Promise<ArchitectureSummary> {
  const tree = await walk(repoPath);
  const findings: Finding[] = [];

  const hasReadme = tree.some((f) => /^README(\.md)?$/i.test(f));
  if (!hasReadme) {
    findings.push({
      category: 'architecture',
      severity: 'warning',
      file: 'README.md',
      line: 0,
      recommendation: 'Adicionar README.md com propósito, instalação e exemplo de uso.',
    });
  }

  const hasPackageJson = tree.includes('package.json');
  const hasTsConfig = tree.some((f) => /^tsconfig(\.base|\.json)?\.json$/.test(f));

  const langCount = countByExt(tree);
  const primaryLang = pickPrimaryLang(langCount);

  return {
    hasReadme,
    hasPackageJson,
    hasTsConfig,
    primaryLang,
    totalFiles: tree.length,
    findings,
  };
}

async function walk(root: string): Promise<string[]> {
  const out: string[] = [];
  async function visit(dir: string): Promise<void> {
    let entries: Dirent[];
    try {
      entries = (await fs.readdir(dir, { withFileTypes: true })) as Dirent[];
    } catch {
      return;
    }
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        if (SKIP_DIRS.has(e.name)) continue;
        await visit(full);
      } else if (e.isFile()) {
        const rel = relative(root, full).replace(/\\/g, '/');
        out.push(rel);
      }
    }
  }
  await visit(root);
  return out;
}

function countByExt(files: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const f of files) {
    const dot = f.lastIndexOf('.');
    if (dot < 0) continue;
    const ext = f.slice(dot + 1).toLowerCase();
    m.set(ext, (m.get(ext) ?? 0) + 1);
  }
  return m;
}

function pickPrimaryLang(m: Map<string, number>): string {
  const langMap: Record<string, string> = {
    ts: 'TypeScript',
    tsx: 'TypeScript',
    js: 'JavaScript',
    jsx: 'JavaScript',
    py: 'Python',
    go: 'Go',
    rs: 'Rust',
    rb: 'Ruby',
    java: 'Java',
    md: 'Markdown',
  };
  let bestLang = 'unknown';
  let bestCount = 0;
  for (const [ext, count] of m) {
    const lang = langMap[ext];
    if (!lang) continue;
    if (count > bestCount) {
      bestCount = count;
      bestLang = lang;
    }
  }
  return bestLang;
}

interface BuildInputs {
  repoName: string;
  profile: AuditProfile;
  license: string;
  findings: Finding[];
  archInfo?: ArchitectureSummary | undefined;
  secInfo?: SecuritySummary | undefined;
}

function buildSummary(inp: BuildInputs): string[] {
  const { repoName, profile, license, findings, archInfo, secInfo } = inp;
  const critical = findings.filter((f) => f.severity === 'critical').length;
  const warning = findings.filter((f) => f.severity === 'warning').length;
  const info = findings.filter((f) => f.severity === 'info').length;
  const bullets: string[] = [];
  bullets.push(`Repo: ${repoName} (profile: ${profile})`);
  bullets.push(`Licença detectada: ${license}`);
  bullets.push(`Findings: ${critical} crítico(s), ${warning} aviso(s), ${info} info`);
  if (archInfo) {
    bullets.push(
      `Linguagem primária: ${archInfo.primaryLang}; ${archInfo.totalFiles} arquivos relevantes (excluindo node_modules/dist/etc.)`,
    );
    bullets.push(
      `Sinais: README ${archInfo.hasReadme ? '✓' : '✗'}, package.json ${archInfo.hasPackageJson ? '✓' : '✗'}, tsconfig ${archInfo.hasTsConfig ? '✓' : '✗'}`,
    );
  }
  if (secInfo) {
    bullets.push(
      `Segurança: .gitignore ${secInfo.hasGitignore ? '✓' : '✗'}; ${secInfo.envFiles.length} arquivo(s) .env no tree`,
    );
  }
  bullets.push(
    critical > 0
      ? 'Recomendação: resolver findings críticos antes de uso.'
      : 'Sem findings críticos.',
  );
  return bullets;
}

interface MarkdownInputs extends BuildInputs {
  repoPath: string;
  summary: string[];
}

function buildMarkdown(inp: MarkdownInputs): string {
  const { repoPath, repoName, profile, license, findings, summary, archInfo, secInfo } = inp;
  const lines: string[] = [];
  lines.push(`# Audit — ${repoName}`);
  lines.push('');
  lines.push(`- **Data:** ${new Date().toISOString()}`);
  lines.push(`- **Path:** \`${repoPath}\``);
  lines.push(`- **Profile:** \`${profile}\``);
  lines.push('- **Agent:** `repo-auditor` (determinístico, sem LLM)');
  lines.push('');
  lines.push('## Sumário');
  for (const b of summary) lines.push(`- ${b}`);
  lines.push('');
  lines.push('## Licença');
  lines.push(`SPDX detectado: \`${license}\``);
  lines.push('');
  if (archInfo) {
    lines.push('## Arquitetura');
    lines.push(`- Linguagem primária: ${archInfo.primaryLang}`);
    lines.push(`- README presente: ${archInfo.hasReadme ? 'sim' : 'não'}`);
    lines.push(`- package.json presente: ${archInfo.hasPackageJson ? 'sim' : 'não'}`);
    lines.push(`- tsconfig presente: ${archInfo.hasTsConfig ? 'sim' : 'não'}`);
    lines.push(`- Total de arquivos (excluindo node_modules/dist/etc.): ${archInfo.totalFiles}`);
    lines.push('');
  }
  if (secInfo) {
    lines.push('## Segurança');
    lines.push(`- .gitignore presente: ${secInfo.hasGitignore ? 'sim' : 'não'}`);
    lines.push(`- Arquivos .env detectados: ${secInfo.envFiles.length}`);
    if (secInfo.envFiles.length > 0) {
      for (const f of secInfo.envFiles) lines.push(`  - \`${f}\``);
    }
    lines.push('');
  }
  lines.push('## Findings');
  if (findings.length === 0) {
    lines.push('Nenhum.');
  } else {
    lines.push('| Severidade | Categoria | Arquivo | Recomendação |');
    lines.push('|---|---|---|---|');
    for (const f of findings) {
      const icon = f.severity === 'critical' ? '🔴' : f.severity === 'warning' ? '🟡' : '🟢';
      lines.push(`| ${icon} ${f.severity} | ${f.category} | \`${f.file}\` | ${f.recommendation} |`);
    }
  }
  lines.push('');
  lines.push('---');
  lines.push('_Gerado por `@cao/repo-auditor` — modo determinístico._');
  return lines.join('\n');
}
