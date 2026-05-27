# commerce-agent-os

Monorepo para um sistema operacional de agentes de e-commerce. **22 agentes catalogados** (20 executáveis), `pnpm chief` como entrypoint orquestrador, camada legal BR/EU/US, multi-tenant/multi-store.

## Bootstrap do Claude — memória externa anti-alucinação

> **OBRIGATÓRIO** ao abrir uma sessão neste projeto: ler os 4 arquivos do vault abaixo **antes de qualquer trabalho não-trivial**. Eles substituem o contexto que se perde quando a conversa compacta — sem isso, há risco de retrabalho ou alucinação sobre o que já foi feito.

| Ordem | Ler | Para saber |
|---|---|---|
| 1 | [07_memory/vault/projects/commerce-agent-os/current-state.md](07_memory/vault/projects/commerce-agent-os/current-state.md) | onde estamos agora (1 página) |
| 2 | [07_memory/vault/projects/commerce-agent-os/handoff-log.md](07_memory/vault/projects/commerce-agent-os/handoff-log.md) | se alguém deixou WIP aberto |
| 3 | [07_memory/vault/projects/commerce-agent-os/next-actions.md](07_memory/vault/projects/commerce-agent-os/next-actions.md) | o que está na fila |
| 4 | [07_memory/vault/projects/commerce-agent-os/session-log.md](07_memory/vault/projects/commerce-agent-os/session-log.md) topo | últimas 3 sessões |

**Ao encerrar trabalho significativo** (commit feito, marco fechado, mais de ~5 mudanças relevantes, ou conversa longa próxima da compactação): registrar entrada em `session-log.md` **antes** que o contexto compacte. Se sobrou WIP, adicionar entrada em `handoff-log.md`. Protocolo completo em [sync-protocol.md](07_memory/vault/projects/commerce-agent-os/sync-protocol.md).

**Atalhos amigáveis** (Obsidian `Ctrl+O`): Chefe, Radar, Mesa de Comando, Painel, Motor, Núcleo, Oficina, Guia, Terminal 1, Terminal 2, Tarefas em Espera. Mapa visual: `07_memory/vault/projects/commerce-agent-os/operations/operations-map.canvas`.

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

## Comandos principais

```
pnpm install                                 # 28+ workspaces
pnpm doctor                                  # 10 checks cross-platform
pnpm typecheck                               # tsc -b
pnpm lint                                    # biome
pnpm test                                    # vitest (378 testes em 42 arquivos)
pnpm test:smoke                              # 17 smoke tests
pnpm chief --tenant=<t> --objective="..."    # orquestrador principal
pnpm audit:repo .                            # agente determinístico, zero credencial
pnpm merchant:audit --source=fixture         # scoring de catálogo (zero credencial)
```

Detalhe completo em [10_ops/scripts/COMMANDS.md](10_ops/scripts/COMMANDS.md).
