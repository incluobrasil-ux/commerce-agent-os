---
created_at: <YYYY-MM-DDTHH:MM:SSZ>
updated_at: <YYYY-MM-DDTHH:MM:SSZ>
tags: [<area>, <agent-or-topic>]
source: <agent:name | human:id | mixed>
kind: <agent-run | audit | test-milestone | implementation-milestone>
result: <green | yellow | red>
confidence: <0.0–1.0>
related: [<path/to/raw/report.md>, <path/to/audit/log>, ...]
---

# <Título humano curto — sem data; data vive no frontmatter e no filename>

## Contexto

<2–4 linhas: o que motivou, quando rodou, em qual input/escopo>

## O que aconteceu

<3–8 bullets: a história real, não passo-a-passo de código>
-
-
-

## Achados / decisões

<o que vale guardar: bug, número-chave, decisão tomada, surpresa>
-
-

## Impacto

<o que muda no projeto: ADR a abrir, TODO a criar, risco materializado, bloqueio destravado>

## Ações geradas

- [ ] <ação — destino: next-actions.md / active-todos.md / decision-index.md>
- [ ] <ação>

(Se nenhuma: `- nenhuma`.)

## Referências

- raw: `12_reports/...`
- audit: `07_memory/vault/<tenant>/audit/<date>.md`
- código: `06_packages/.../file.ts:42`
- ADR: `02_architecture/adr/ADR-NNNN-slug.md`
