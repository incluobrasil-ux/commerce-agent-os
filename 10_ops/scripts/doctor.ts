#!/usr/bin/env node
// pnpm doctor — verificação cross-platform do baseline.
// Roda checks em ordem, agrega resultados, sai 0 se tudo verde, 1 se algo fail.
// Sem dependências externas além de node + pnpm.

import { execSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

type Status = 'ok' | 'warn' | 'fail' | 'skip';

interface Check {
  name: string;
  status: Status;
  message?: string;
  hint?: string;
}

const checks: Check[] = [];
const repoRoot = resolve(process.cwd());

function record(c: Check): void {
  checks.push(c);
}

function checkCommand(name: string, cmd: string): { ok: boolean; out: string } {
  try {
    const out = execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    return { ok: true, out };
  } catch {
    return { ok: false, out: '' };
  }
}

function semverMajor(version: string): number {
  const m = version.match(/(\d+)/);
  return m?.[1] ? Number.parseInt(m[1], 10) : 0;
}

// ===== Checks =====

function checkNode(): void {
  const v = process.versions.node;
  const major = semverMajor(v);
  if (major >= 20) {
    record({ name: 'node', status: 'ok', message: `v${v}` });
  } else {
    record({
      name: 'node',
      status: 'fail',
      message: `v${v} (< 20)`,
      hint: 'instalar Node 20+ via nvm / volta / fnm.',
    });
  }
}

function checkPnpm(): void {
  const r = checkCommand('pnpm', 'pnpm --version');
  if (!r.ok) {
    record({
      name: 'pnpm',
      status: 'fail',
      hint: 'npm i -g pnpm@9 OU corepack enable && corepack prepare pnpm@9 --activate',
    });
    return;
  }
  const major = semverMajor(r.out);
  if (major >= 9) {
    record({ name: 'pnpm', status: 'ok', message: `v${r.out}` });
  } else {
    record({
      name: 'pnpm',
      status: 'warn',
      message: `v${r.out} (esperado ≥ 9)`,
      hint: 'atualizar via corepack prepare pnpm@9 --activate',
    });
  }
}

function checkGit(): void {
  const r = checkCommand('git', 'git --version');
  if (r.ok) {
    record({ name: 'git', status: 'ok', message: r.out.replace('git version ', 'v') });
  } else {
    record({ name: 'git', status: 'fail', hint: 'instalar git (qualquer versão recente)' });
  }
}

function checkNodeModules(): void {
  if (existsSync(resolve(repoRoot, 'node_modules'))) {
    record({ name: 'node_modules', status: 'ok' });
  } else {
    record({
      name: 'node_modules',
      status: 'fail',
      message: 'ausente',
      hint: 'rodar pnpm install',
    });
  }
}

function runScript(label: string, script: string, timeoutMs: number): Check {
  const r = spawnSync('pnpm', ['-s', script], {
    cwd: repoRoot,
    encoding: 'utf8',
    timeout: timeoutMs,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  });
  if (r.status === 0) {
    return { name: label, status: 'ok' };
  }
  const tail = (r.stderr || r.stdout || '')
    .split('\n')
    .filter((l) => l.trim())
    .slice(-3)
    .join(' | ');
  return {
    name: label,
    status: 'fail',
    message: `exit ${r.status ?? '?'}`,
    hint: tail.slice(0, 300),
  };
}

function checkEnvLocal(): void {
  const envPath = resolve(repoRoot, '.env.local');
  if (!existsSync(envPath)) {
    record({
      name: '.env.local',
      status: 'warn',
      message: 'não existe',
      hint: 'opcional para baseline; obrigatório para LLM/Shopify/Merchant. Copie de .env.example.',
    });
    return;
  }
  record({ name: '.env.local', status: 'ok' });
}

function checkGitleaks(): void {
  const r = checkCommand('gitleaks', 'gitleaks version');
  if (r.ok) {
    record({ name: 'gitleaks', status: 'ok', message: `v${r.out}` });
    return;
  }
  record({
    name: 'gitleaks',
    status: 'warn',
    message: 'binário não encontrado no PATH',
    hint: 'pre-commit usa gitleaks via npm script. Instalar: winget install gitleaks (Windows), brew install gitleaks (Mac), scoop install gitleaks. Se acabou de instalar, reabra o terminal.',
  });
}

function checkBrainEntry(): void {
  const entry = resolve(repoRoot, '07_memory/vault/projects/commerce-agent-os/current-state.md');
  if (existsSync(entry)) {
    record({ name: 'cérebro operacional', status: 'ok', message: 'current-state.md presente' });
  } else {
    record({
      name: 'cérebro operacional',
      status: 'fail',
      message: 'current-state.md ausente',
      hint: 'estrutura corrompida; restaurar do git',
    });
  }
}

// ===== Render =====

const ICON: Record<Status, string> = { ok: '🟢', warn: '🟡', fail: '🔴', skip: '⚪' };

function renderReport(): void {
  process.stdout.write('\n=== pnpm doctor ===\n\n');
  for (const c of checks) {
    const line = `  ${ICON[c.status]}  ${c.name}${c.message ? ` — ${c.message}` : ''}`;
    process.stdout.write(`${line}\n`);
    if (c.hint && c.status !== 'ok') {
      process.stdout.write(`       → ${c.hint}\n`);
    }
  }
  process.stdout.write('\n');

  const fails = checks.filter((c) => c.status === 'fail').length;
  const warns = checks.filter((c) => c.status === 'warn').length;
  const oks = checks.filter((c) => c.status === 'ok').length;

  process.stdout.write(`Resumo: ${oks} 🟢  /  ${warns} 🟡  /  ${fails} 🔴\n\n`);

  if (fails === 0 && warns === 0) {
    process.stdout.write('Tudo verde. Próximo passo: pnpm audit:repo .\n\n');
  } else if (fails === 0) {
    process.stdout.write(
      'Baseline OK; warnings são opcionais (LLM/Shopify/Merchant ou secret scan).\n' +
        'Próximo passo: pnpm audit:repo . (não exige nada além do baseline)\n\n',
    );
  } else {
    process.stdout.write(
      'Falhas bloqueiam o baseline. Resolva as marcadas 🔴 antes de seguir.\n\n',
    );
  }

  process.stdout.write('Cérebro: 07_memory/vault/projects/commerce-agent-os/project-home.md\n');
  process.stdout.write('Comandos: 10_ops/scripts/COMMANDS.md\n\n');

  process.exit(fails > 0 ? 1 : 0);
}

// ===== Main =====

async function main(): Promise<void> {
  checkNode();
  checkPnpm();
  checkGit();
  checkNodeModules();

  // Só roda checks pesados se node_modules existir
  if (checks.find((c) => c.name === 'node_modules')?.status === 'ok') {
    process.stdout.write('Rodando typecheck / lint / smoke (pode levar ~10s)...\n');
    record(runScript('typecheck', 'typecheck', 120_000));
    record(runScript('lint', 'lint', 60_000));
    record(runScript('test:smoke', 'test:smoke', 60_000));
  } else {
    record({ name: 'typecheck', status: 'skip', hint: 'rodar pnpm install primeiro' });
    record({ name: 'lint', status: 'skip', hint: 'rodar pnpm install primeiro' });
    record({ name: 'test:smoke', status: 'skip', hint: 'rodar pnpm install primeiro' });
  }

  checkEnvLocal();
  checkGitleaks();
  checkBrainEntry();

  renderReport();
}

main().catch((err: unknown) => {
  process.stderr.write(`[doctor] erro: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(2);
});
