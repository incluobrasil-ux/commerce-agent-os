// repo-auditor.smoke.ts
// Smoke test: roda repo-auditor contra o próprio repo (path do projeto) e valida
// que produz markdown + summary + license. Não escreve arquivo em 12_reports/
// para não poluir nas execuções de CI/local.

import { describe, expect, it } from 'vitest';
import { auditRepo } from '../../03_agents/repo-auditor/src/index.ts';

describe('repo-auditor smoke', () => {
  it('audita o próprio projeto e detecta MIT + estrutura TS', async () => {
    const r = await auditRepo({ repoPath: process.cwd(), profile: 'full' });
    expect(r.license).toBe('MIT');
    expect(r.repoName).toBe('commerce-agent-os');
    expect(r.report.markdown.length).toBeGreaterThan(100);
    expect(r.report.summary.length).toBeGreaterThan(0);
    expect(r.findings).toBeDefined();
  });

  it('profile=license é mais rápido (só seção licença) e não gera findings de architecture', async () => {
    const r = await auditRepo({ repoPath: process.cwd(), profile: 'license' });
    expect(r.license).toBe('MIT');
    expect(r.findings.some((f) => f.category === 'architecture')).toBe(false);
    expect(r.findings.some((f) => f.category === 'security')).toBe(false);
  });
});
