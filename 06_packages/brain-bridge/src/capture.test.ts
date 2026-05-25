import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CaptureError, captureRun, resolveBrainDir } from './capture.js';
import { bumpUpdatedAt, insertAfterAnchor } from './markdown-utils.js';

let tmp = '';

beforeEach(async () => {
  tmp = await fs.mkdtemp(join(tmpdir(), 'brain-bridge-test-'));
  // Skeleton mínimo do brain
  await fs.mkdir(join(tmp, 'run-summaries'), { recursive: true });
  await fs.writeFile(
    join(tmp, 'run-summaries/index.md'),
    [
      '---',
      'updated_at: 2026-05-01T00:00:00Z',
      '---',
      '',
      '# Run Summaries — Index',
      '',
      '## Impl milestones',
      '',
      '| Data | Título | Resultado | Arquivo |',
      '|---|---|---|---|',
      '',
      '## Audits',
      '',
      '| Data | Título | Resultado | Arquivo |',
      '|---|---|---|---|',
      '',
      '## Agent runs',
      '',
      '| Data | Título | Resultado | Arquivo |',
      '|---|---|---|---|',
      '',
      '## Test milestones',
      '',
      '| Data | Título | Resultado | Arquivo |',
      '|---|---|---|---|',
      '',
    ].join('\n'),
    'utf8',
  );
  await fs.writeFile(
    join(tmp, 'session-log.md'),
    [
      '---',
      'updated_at: 2026-05-01T00:00:00Z',
      '---',
      '',
      '# Session Log',
      '',
      '---',
      '',
      '## 2026-05-22 — entrada anterior',
      '',
      '- Feito: algo.',
      '',
    ].join('\n'),
    'utf8',
  );
  await fs.writeFile(
    join(tmp, 'next-actions.md'),
    [
      '---',
      'updated_at: 2026-05-01T00:00:00Z',
      '---',
      '',
      '# Next Actions',
      '',
      '## N99 — item existente',
      '',
      '- **Ação:** placeholder.',
      '',
      '## Regras',
      '',
      '- regra qualquer.',
      '',
    ].join('\n'),
    'utf8',
  );
  await fs.writeFile(
    join(tmp, 'operational-priorities.md'),
    [
      '---',
      'updated_at: 2026-05-01T00:00:00Z',
      '---',
      '',
      '# Operational Priorities',
      '',
      '## Agora',
      '',
      '| # | Objetivo | Dono | Depende | Status |',
      '|---|---|---|---|---|',
      '',
      '## Próximo',
      '',
      '| # | Objetivo | Dono | Depende | Status |',
      '|---|---|---|---|---|',
      '',
      '## Depois',
      '',
      '| # | Objetivo | Dono | Depende | Status |',
      '|---|---|---|---|---|',
      '',
    ].join('\n'),
    'utf8',
  );
  await fs.writeFile(
    join(tmp, 'blockers-and-risks.md'),
    [
      '---',
      'updated_at: 2026-05-01T00:00:00Z',
      '---',
      '',
      '# Blockers and Risks',
      '',
      '## Bloqueios ativos',
      '',
      '| # | Bloqueio | Impacto | Mitigação | Dono | Status |',
      '|---|---|---|---|---|---|',
      '',
    ].join('\n'),
    'utf8',
  );
  await fs.writeFile(
    join(tmp, 'current-state.md'),
    [
      '---',
      'updated_at: 2026-05-01T00:00:00Z',
      '---',
      '',
      '# Current State',
      '',
      '## Verde',
      '- baseline.',
      '',
    ].join('\n'),
    'utf8',
  );
});

afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

const baseInput = {
  kind: 'agent-run' as const,
  slug: 'sample-test',
  result: 'green' as const,
  title: 'Sample test run',
  source: 'agent:sample',
  tags: ['test', 'sample'],
  body: {
    context: 'Test execution to validate captureRun.',
    whatHappened: ['Did thing 1.', 'Did thing 2.'],
    findings: ['Found nothing surprising.'],
    impact: 'No production impact; test only.',
    references: ['src/x.ts'],
  },
  now: new Date('2026-05-23T12:00:00Z'),
  brainDir: '', // sobrescrito por teste
};

describe('captureRun', () => {
  it('cria summary + atualiza index + bump current-state', async () => {
    const r = await captureRun({ ...baseInput, brainDir: tmp });
    expect(r.summaryPath).toMatch(/2026-05-23-agent-run-sample-test\.md$/);
    const summary = await fs.readFile(r.summaryPath, 'utf8');
    expect(summary).toContain('# Sample test run');
    expect(summary).toContain('kind: agent-run');
    expect(summary).toContain('result: green');

    const index = await fs.readFile(join(tmp, 'run-summaries/index.md'), 'utf8');
    expect(index).toMatch(/\| 2026-05-23 \| Sample test run \| 🟢 \|/);
    expect(index).toMatch(/updated_at: 2026-05-23T12:00:00\.000Z/);

    const cs = await fs.readFile(join(tmp, 'current-state.md'), 'utf8');
    expect(cs).toMatch(/updated_at: 2026-05-23T12:00:00\.000Z/);

    expect(r.filesUpdated).toContain(r.summaryPath);
    expect(r.filesUpdated.some((p) => p.endsWith('index.md'))).toBe(true);
    expect(r.filesUpdated.some((p) => p.endsWith('current-state.md'))).toBe(true);
  });

  it('adiciona entrada em session-log quando sessionLogLine passada', async () => {
    await captureRun({
      ...baseInput,
      brainDir: tmp,
      sessionLogLine: 'Feito: smoke test rodou em 5ms.',
    });
    const sl = await fs.readFile(join(tmp, 'session-log.md'), 'utf8');
    expect(sl).toContain('## 2026-05-23 — Sample test run');
    expect(sl).toContain('smoke test rodou em 5ms');
    // entrada anterior preservada
    expect(sl).toContain('## 2026-05-22 — entrada anterior');
  });

  it('append next-actions antes da seção Regras', async () => {
    await captureRun({
      ...baseInput,
      brainDir: tmp,
      appendNextActions: [
        {
          id: 'N100',
          title: 'Fazer X',
          action: 'rodar Y',
          prereq: 'ter Z',
          expected: 'Z gerado',
          pull: 'dev',
        },
      ],
    });
    const na = await fs.readFile(join(tmp, 'next-actions.md'), 'utf8');
    expect(na).toContain('## N100 — Fazer X');
    expect(na).toContain('- **Ação:** rodar Y');
    // Item antigo preservado e ordem mantida (N100 antes de Regras)
    expect(na.indexOf('## N100')).toBeGreaterThan(na.indexOf('## N99'));
    expect(na.indexOf('## N100')).toBeLessThan(na.indexOf('## Regras'));
  });

  it('append priorities no bucket correto', async () => {
    await captureRun({
      ...baseInput,
      brainDir: tmp,
      appendPriorities: [
        { id: 'P100', bucket: 'agora', objective: 'Hot item', owner: 'dev', status: 'aberto' },
        {
          id: 'P101',
          bucket: 'depois',
          objective: 'Cold item',
          owner: 'ops',
          status: 'aberto',
          depends: 'P100',
        },
      ],
    });
    const op = await fs.readFile(join(tmp, 'operational-priorities.md'), 'utf8');
    const agoraIdx = op.indexOf('## Agora');
    const proximoIdx = op.indexOf('## Próximo');
    const depoisIdx = op.indexOf('## Depois');
    expect(op.indexOf('| P100 |')).toBeGreaterThan(agoraIdx);
    expect(op.indexOf('| P100 |')).toBeLessThan(proximoIdx);
    expect(op.indexOf('| P101 |')).toBeGreaterThan(depoisIdx);
  });

  it('append blocker na tabela', async () => {
    await captureRun({
      ...baseInput,
      brainDir: tmp,
      appendBlockers: [
        {
          id: 'B99',
          title: 'Coisa quebrou',
          impact: 'impede X',
          mitigation: 'rodar Y',
          owner: 'ops',
          status: 'aberto',
        },
      ],
    });
    const br = await fs.readFile(join(tmp, 'blockers-and-risks.md'), 'utf8');
    expect(br).toContain('| B99 | Coisa quebrou |');
  });

  it('lança CaptureError quando input inválido', async () => {
    await expect(
      captureRun({ ...baseInput, brainDir: tmp, slug: 'BAD UPPER' }),
    ).rejects.toBeInstanceOf(CaptureError);
  });

  it('idempotente: rerun com mesmo slug sobrescreve summary (não duplica)', async () => {
    await captureRun({ ...baseInput, brainDir: tmp });
    await captureRun({
      ...baseInput,
      brainDir: tmp,
      body: { ...baseInput.body, context: 'Edited body.' },
    });
    const summary = await fs.readFile(
      join(tmp, 'run-summaries/2026-05-23-agent-run-sample-test.md'),
      'utf8',
    );
    expect(summary).toContain('Edited body.');
    // Index ganhou 2 linhas (esperado: capture is not deduplicating index — operador limpa se quiser)
    const index = await fs.readFile(join(tmp, 'run-summaries/index.md'), 'utf8');
    const matches = index.match(/Sample test run/g) ?? [];
    expect(matches.length).toBe(2);
  });
});

describe('resolveBrainDir — multi-tenant isolation', () => {
  const repo = '/repo';

  it('brainDir explícito tem precedência sobre tudo', () => {
    const r = resolveBrainDir(repo, {
      brainDir: '/custom/path',
      tenantId: 't1',
      storeId: 's1',
    });
    expect(r).toBe('/custom/path');
  });

  it('sem tenantId nem brainDir → fallback project brain (compat)', () => {
    const r = resolveBrainDir(repo, {});
    expect(r).toBe(resolve(repo, '07_memory/vault/projects/commerce-agent-os'));
  });

  it('tenantId apenas → vault/tenants/<t>/', () => {
    const r = resolveBrainDir(repo, { tenantId: 'incluo' });
    expect(r).toBe(resolve(repo, '07_memory/vault/tenants/incluo'));
  });

  it('tenantId + storeId → vault/tenants/<t>/stores/<s>/', () => {
    const r = resolveBrainDir(repo, { tenantId: 'acme', storeId: 'br-store' });
    expect(r).toBe(resolve(repo, '07_memory/vault/tenants/acme/stores/br-store'));
  });

  it('tenants diferentes resolvem para paths distintos (isolamento)', () => {
    const rA = resolveBrainDir(repo, { tenantId: 'tenant-a' });
    const rB = resolveBrainDir(repo, { tenantId: 'tenant-b' });
    expect(rA).not.toBe(rB);
  });

  it('mesmo tenant, stores diferentes → paths distintos', () => {
    const rA = resolveBrainDir(repo, { tenantId: 't1', storeId: 'sA' });
    const rB = resolveBrainDir(repo, { tenantId: 't1', storeId: 'sB' });
    expect(rA).not.toBe(rB);
  });

  it('storeId sem tenantId é ignorado (incoerente; cai no fallback)', () => {
    const r = resolveBrainDir(repo, { storeId: 'orphan' });
    expect(r).toBe(resolve(repo, '07_memory/vault/projects/commerce-agent-os'));
  });
});

describe('captureRun com tenant/store dirige escrita para path correto', () => {
  let cwdBackup: string;
  let tmpRoot: string;
  let tenantBrain: string;

  beforeEach(async () => {
    tmpRoot = await fs.mkdtemp(join(tmpdir(), 'capture-tenant-test-'));
    tenantBrain = join(tmpRoot, '07_memory/vault/tenants/acme/stores/store-a');
    // setup mínimo: só o que captureRun precisa para o caminho feliz
    await fs.mkdir(join(tenantBrain, 'run-summaries'), { recursive: true });
    await fs.writeFile(
      join(tenantBrain, 'run-summaries/index.md'),
      [
        '---',
        'updated_at: 2026-05-01T00:00:00Z',
        '---',
        '',
        '# Run Summaries — Index',
        '',
        '## Agent runs',
        '',
        '| Data | Título | Resultado | Arquivo |',
        '|---|---|---|---|',
        '',
      ].join('\n'),
      'utf8',
    );
    cwdBackup = process.cwd();
    process.chdir(tmpRoot);
  });

  afterEach(async () => {
    process.chdir(cwdBackup);
    await fs.rm(tmpRoot, { recursive: true, force: true });
  });

  it('tenantId+storeId → summary fica em tenants/acme/stores/store-a/', async () => {
    const r = await captureRun({
      kind: 'agent-run' as const,
      slug: 'pilot-run',
      result: 'green' as const,
      title: 'Pilot tenant scoped',
      source: 'agent:pilot',
      tags: ['pilot'],
      body: {
        context: 'Validação que captureRun escreve no path tenant-scoped.',
        whatHappened: ['Run aconteceu.'],
        findings: [],
        impact: 'Apenas teste de isolamento.',
        references: [],
      },
      now: new Date('2026-05-25T12:00:00Z'),
      tenantId: 'acme',
      storeId: 'store-a',
    });
    expect(r.summaryPath).toContain(join('tenants', 'acme', 'stores', 'store-a'));
    expect(r.summaryPath).toMatch(/2026-05-25-agent-run-pilot-run\.md$/);
  });
});

describe('markdown-utils', () => {
  it('bumpUpdatedAt substitui campo existente', () => {
    const r = bumpUpdatedAt(
      '---\nupdated_at: 2020-01-01\nfoo: bar\n---\n\nbody',
      '2026-05-23T12:00:00Z',
    );
    expect(r).toContain('updated_at: 2026-05-23T12:00:00Z');
    expect(r).not.toContain('updated_at: 2020-01-01');
    expect(r).toContain('foo: bar');
  });

  it('bumpUpdatedAt cria frontmatter se não existir', () => {
    const r = bumpUpdatedAt('body only', '2026-05-23T12:00:00Z');
    expect(r).toMatch(/^---\nupdated_at: 2026-05-23T12:00:00Z\n---/);
  });

  it('insertAfterAnchor insere logo após separador de tabela', () => {
    const md = ['## A', '', '| col |', '|---|', '', '## B'].join('\n');
    const r = insertAfterAnchor(md, /^## A\s*$/, '| new |');
    expect(r).toContain('|---|\n| new |');
  });

  it('insertAfterAnchor ignora prosa entre heading e tabela', () => {
    const md = ['## A', '', 'Parágrafo descritivo.', '', '| col |', '|---|', '| existing |'].join(
      '\n',
    );
    const r = insertAfterAnchor(md, /^## A\s*$/, '| new |');
    expect(r).toMatch(/\|---\|\n\| new \|\n\| existing \|/);
  });

  it('insertAfterAnchor sem tabela cai logo após o anchor', () => {
    const md = ['## A', '', 'sem tabela', '', '## B'].join('\n');
    const r = insertAfterAnchor(md, /^## A\s*$/, '## extra');
    expect(r).toMatch(/## A\n## extra/);
  });
});
