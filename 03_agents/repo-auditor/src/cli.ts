#!/usr/bin/env node
// CLI: pnpm tsx 03_agents/repo-auditor/src/cli.ts <repo-path> [--profile=full]
// Output: 12_reports/audits/repo-auditor/<repo>-<YYYYMMDD-HHmmss>.md

import { promises as fs } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { type AuditProfile, type AuditResult, RepoNotFound, auditRepo } from './index.js';

interface CliArgs {
  repoPath: string;
  profile: AuditProfile;
  outDir: string;
}

const VALID_PROFILES: AuditProfile[] = ['license', 'security', 'architecture', 'full'];

function parseArgs(argv: string[]): CliArgs {
  const args = argv.slice(2);
  let repoPath: string | undefined;
  let profile: AuditProfile = 'full';
  let outDir = resolve(process.cwd(), '12_reports/audits/repo-auditor');

  for (const a of args) {
    if (a.startsWith('--profile=')) {
      const p = a.slice('--profile='.length) as AuditProfile;
      if (!VALID_PROFILES.includes(p)) {
        fail(`Profile inválido: "${p}". Use: ${VALID_PROFILES.join(', ')}.`);
      }
      profile = p;
    } else if (a.startsWith('--out=')) {
      outDir = resolve(a.slice('--out='.length));
    } else if (a.startsWith('--')) {
      fail(`Flag desconhecida: ${a}`);
    } else if (!repoPath) {
      repoPath = a;
    } else {
      fail(`Argumento extra inesperado: ${a}`);
    }
  }

  if (!repoPath) {
    fail(
      'Uso: repo-auditor <repo-path> [--profile=full|license|security|architecture] [--out=<dir>]',
    );
  }

  return { repoPath, profile, outDir };
}

function fail(msg: string): never {
  process.stderr.write(`[repo-auditor] ${msg}\n`);
  process.exit(2);
}

function timestamp(d: Date): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`
  );
}

async function main(): Promise<void> {
  const { repoPath, profile, outDir } = parseArgs(process.argv);

  let result: AuditResult;
  try {
    result = await auditRepo({ repoPath, profile });
  } catch (err) {
    if (err instanceof RepoNotFound) {
      fail(err.message);
    }
    throw err;
  }

  const filename = `${result.repoName}-${timestamp(new Date())}.md`;
  const outPath = join(outDir, filename);
  await fs.mkdir(dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, result.report.markdown, 'utf8');

  const critical = result.findings.filter((f) => f.severity === 'critical').length;
  const warning = result.findings.filter((f) => f.severity === 'warning').length;

  const lines = [
    `[repo-auditor] repo=${result.repoName} profile=${profile} license=${result.license}`,
    `[repo-auditor] findings: ${critical} critical, ${warning} warning`,
    `[repo-auditor] report: ${outPath}`,
  ];
  process.stdout.write(`${lines.join('\n')}\n`);

  process.exit(critical > 0 ? 1 : 0);
}

main().catch((err: unknown) => {
  process.stderr.write(
    `[repo-auditor] fatal: ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(2);
});
