# commerce-agent-os

Monorepo para um sistema operacional de agentes de e-commerce.

## Layout

```
00_meta/          Governança: scope, success criteria, roadmap, decisions, stack rules, repo selection
01_upstreams/     Repositórios externos (READ-ONLY, não editar)
02_architecture/  Diagramas, ADRs, audits, integration map, security overview
03_agents/        Agentes autorais (17 declarativos em 7 tiers)
04_apps/          Aplicações (Shopify app/theme, serviços headless)
05_integrations/  Adaptadores para serviços externos
06_packages/      Pacotes internos (@cao/*)
07_memory/        Memória persistente dos agentes (vault markdown)
08_data/          Datasets, fixtures, dumps
09_prompts/       Prompts operacionais por fase
10_ops/           Scripts, CI/CD, runbooks
11_tests/         Smoke, integration, e2e cross-package
12_reports/       Relatórios de auditoria e execução
```

## Regras persistentes

- `01_upstreams/` é read-only. Nunca editar conteúdo lá dentro.
- Código autoral vive em `03_agents/`, `04_apps/`, `05_integrations/`, `06_packages/`.
- Apps → agentes → packages → integrations → provedores. Nunca atravessar para baixo.
- Cada fase grava saída na pasta correspondente.
- Trabalhar em fases. Plano resumido antes de criar muitos arquivos.

## Documentos canônicos (governança)

- [PROJECT_SCOPE](00_meta/PROJECT_SCOPE.md) — o que é e o que não é
- [SUCCESS_CRITERIA](00_meta/SUCCESS_CRITERIA.md) — definição de "feito" por marco
- [ROADMAP](00_meta/ROADMAP.md) — fases
- [DECISIONS](00_meta/DECISIONS.md) — índice de ADRs (detalhe em `02_architecture/adr/`)
- [STACK_RULES](00_meta/STACK_RULES.md) — naming, estilo, validação, testes
- [REPO_SELECTION](00_meta/REPO_SELECTION.md) — 20 upstreams classificados

## Convenções (resumo)

- Pastas raiz: `NN_nome/` (zero-padded, ordem imutável).
- Pastas internas: `kebab-case`. Arquivos TS: `kebab-case.ts`.
- Docs canônicos em `00_meta/`: `UPPERCASE.md`.
- Scope de package: `@cao/<name>`.
- TypeScript default; Python só em sidecar isolado.

Detalhe completo em [STACK_RULES.md](00_meta/STACK_RULES.md).

## Comandos (placeholders — Fase 5)

```
pnpm install                          # ainda não configurado (deps não declaradas)
pnpm typecheck                        # tsc -b
pnpm test                             # placeholder
pnpm lint                             # placeholder
bash 10_ops/scripts/validate-structure.sh   # já funciona
bash 11_tests/smoke/structure.smoke.sh      # já funciona
```
