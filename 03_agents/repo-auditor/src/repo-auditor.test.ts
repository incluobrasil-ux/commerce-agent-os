import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RepoNotFound, auditRepo } from './index.js';

let tmp = '';

beforeEach(async () => {
  tmp = await fs.mkdtemp(join(tmpdir(), 'repo-auditor-test-'));
});

afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

describe('auditRepo', () => {
  it('lança RepoNotFound em path inexistente', async () => {
    await expect(auditRepo({ repoPath: join(tmp, 'inexistente') })).rejects.toBeInstanceOf(
      RepoNotFound,
    );
  });

  it('detecta licença MIT a partir de LICENSE', async () => {
    await fs.writeFile(join(tmp, 'LICENSE'), 'MIT License\n\nCopyright (c) 2026');
    await fs.writeFile(join(tmp, 'README.md'), '# test');
    await fs.writeFile(join(tmp, '.gitignore'), 'node_modules\n');

    const r = await auditRepo({ repoPath: tmp, profile: 'full' });
    expect(r.license).toBe('MIT');
    expect(r.findings.find((f) => f.category === 'license')).toBeUndefined();
  });

  it('detecta MIT pela cláusula canônica mesmo sem header "MIT License"', async () => {
    const mitBody =
      'Copyright 2025 Acme\n\nPermission is hereby granted, free of charge, to any person ' +
      'obtaining a copy of this software without restriction.\n\n' +
      'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.';
    await fs.writeFile(join(tmp, 'LICENSE.md'), mitBody);
    await fs.writeFile(join(tmp, 'README.md'), '# test');
    await fs.writeFile(join(tmp, '.gitignore'), 'node_modules\n');

    const r = await auditRepo({ repoPath: tmp, profile: 'license' });
    expect(r.license).toBe('MIT');
    expect(r.findings.find((f) => f.category === 'license')).toBeUndefined();
  });

  it('reporta warning quando LICENSE existe mas SPDX é desconhecido', async () => {
    await fs.writeFile(join(tmp, 'LICENSE'), 'Custom proprietary terms apply.');
    await fs.writeFile(join(tmp, 'README.md'), '# test');
    await fs.writeFile(join(tmp, '.gitignore'), 'node_modules\n');

    const r = await auditRepo({ repoPath: tmp, profile: 'license' });
    expect(r.license).toBe('UNKNOWN');
    const lf = r.findings.find((f) => f.category === 'license');
    expect(lf?.severity).toBe('warning');
  });

  it('reporta finding crítico quando não há LICENSE', async () => {
    await fs.writeFile(join(tmp, 'README.md'), '# test');
    await fs.writeFile(join(tmp, '.gitignore'), 'node_modules\n');

    const r = await auditRepo({ repoPath: tmp, profile: 'full' });
    expect(r.license).toBe('UNKNOWN');
    expect(r.findings.some((f) => f.category === 'license' && f.severity === 'critical')).toBe(
      true,
    );
  });

  it('aceita licença de package.json se não há LICENSE file', async () => {
    await fs.writeFile(
      join(tmp, 'package.json'),
      JSON.stringify({ name: 'x', license: 'Apache-2.0' }),
    );
    await fs.writeFile(join(tmp, 'README.md'), '# test');
    await fs.writeFile(join(tmp, '.gitignore'), 'node_modules\n');

    const r = await auditRepo({ repoPath: tmp, profile: 'license' });
    expect(r.license).toBe('Apache-2.0');
  });

  it('detecta .env committed como finding crítico', async () => {
    await fs.writeFile(join(tmp, 'LICENSE'), 'MIT License');
    await fs.writeFile(join(tmp, '.gitignore'), 'node_modules\n');
    await fs.writeFile(join(tmp, '.env'), 'SECRET=foo');
    await fs.writeFile(join(tmp, '.env.example'), 'SECRET=');

    const r = await auditRepo({ repoPath: tmp, profile: 'security' });
    const envFindings = r.findings.filter(
      (f) => f.category === 'security' && f.file.endsWith('.env'),
    );
    expect(envFindings.length).toBeGreaterThan(0);
    expect(envFindings[0]?.severity).toBe('critical');
    // .env.example não deve gerar finding
    expect(r.findings.some((f) => f.file.endsWith('.env.example'))).toBe(false);
  });

  it('ignora templates .env.{template,sample,dist} além de .env.example', async () => {
    await fs.writeFile(join(tmp, 'LICENSE'), 'MIT License');
    await fs.writeFile(join(tmp, '.gitignore'), 'node_modules\n');
    await fs.writeFile(join(tmp, '.env.template'), 'KEY=');
    await fs.writeFile(join(tmp, '.env.sample'), 'KEY=');
    await fs.writeFile(join(tmp, '.env.dist'), 'KEY=');

    const r = await auditRepo({ repoPath: tmp, profile: 'security' });
    expect(r.findings.some((f) => f.category === 'security' && f.file.includes('.env'))).toBe(
      false,
    );
  });

  it('detecta AGPL-3.0 (cobre basic-memory tipo)', async () => {
    await fs.writeFile(
      join(tmp, 'LICENSE'),
      '                    GNU AFFERO GENERAL PUBLIC LICENSE\n                       Version 3, 19 November 2007\n',
    );
    await fs.writeFile(join(tmp, '.gitignore'), 'node_modules\n');

    const r = await auditRepo({ repoPath: tmp, profile: 'license' });
    expect(r.license).toBe('AGPL-3.0');
    expect(r.findings.find((f) => f.category === 'license')).toBeUndefined();
  });

  it('reporta warning quando .gitignore está ausente', async () => {
    await fs.writeFile(join(tmp, 'LICENSE'), 'MIT License');

    const r = await auditRepo({ repoPath: tmp, profile: 'security' });
    expect(r.findings.some((f) => f.file === '.gitignore' && f.severity === 'warning')).toBe(true);
  });

  it('detecta TypeScript como linguagem primária', async () => {
    await fs.writeFile(join(tmp, 'LICENSE'), 'MIT License');
    await fs.writeFile(join(tmp, 'README.md'), '# test');
    await fs.writeFile(join(tmp, '.gitignore'), 'node_modules\n');
    await fs.writeFile(join(tmp, 'a.ts'), 'export const x = 1;');
    await fs.writeFile(join(tmp, 'b.ts'), 'export const y = 2;');
    await fs.writeFile(join(tmp, 'c.js'), 'module.exports = 3;');

    const r = await auditRepo({ repoPath: tmp, profile: 'architecture' });
    expect(r.report.markdown).toContain('TypeScript');
  });

  it('profile=license não executa scans de security/architecture', async () => {
    await fs.writeFile(join(tmp, 'LICENSE'), 'MIT License');
    // sem .gitignore → security geraria warning; arch geraria warning de README
    const r = await auditRepo({ repoPath: tmp, profile: 'license' });
    expect(r.findings.some((f) => f.category === 'security')).toBe(false);
    expect(r.findings.some((f) => f.category === 'architecture')).toBe(false);
  });

  it('produz markdown com seção Findings', async () => {
    await fs.writeFile(join(tmp, 'LICENSE'), 'MIT License');
    await fs.writeFile(join(tmp, 'README.md'), '# test');
    await fs.writeFile(join(tmp, '.gitignore'), 'node_modules\n');

    const r = await auditRepo({ repoPath: tmp, profile: 'full' });
    expect(r.report.markdown).toContain('# Audit —');
    expect(r.report.markdown).toContain('## Findings');
    expect(r.report.summary.length).toBeGreaterThan(0);
  });
});
