# Commands

Comandos principais do projeto. Tudo via `pnpm` na raiz.

## Verificação (rodar primeiro em qualquer clone novo)

| Comando | O que faz |
|---|---|
| `pnpm doctor` | **Diagnóstico cross-platform.** Checa: node ≥ 20, pnpm ≥ 9, git, `node_modules`, typecheck, lint, test:smoke, `.env.local`, gitleaks, cérebro presente. Exit 0 = baseline OK; exit 1 = bloqueio real (mensagem dá o fix). |

## Setup / instalação

| Comando | O que faz |
|---|---|
| `pnpm install` | Instala deps de todos os workspaces (24+ pacotes). |
| `cp .env.example .env.local` | Cria env local. Editar manualmente. |
| `npx simple-git-hooks` | Ativa pre-commit (lint + smoke + secret-scan) + commit-msg (commitlint). |
| `bash 10_ops/scripts/clone-upstreams.sh` | (Opcional) Clona 10 upstreams pinados em `01_upstreams/`. |
| `pnpm clean` | Remove `dist/` e `.tsbuildinfo` de cada package. |

## Qualidade (rodar antes de commit)

| Comando | O que faz | Falha = block? |
|---|---|---|
| `pnpm typecheck` | `tsc -b` em todos os refs do tsconfig raiz. | sim |
| `pnpm lint` | `biome check .` (lint + format + organize imports). | sim |
| `pnpm format` | `biome format --write .` — aplica formatação. | n/a |
| `pnpm test` | `vitest run` — toda a suíte (~126 testes, ~3s). | sim |
| `pnpm test:smoke` | só `11_tests/smoke/` — rápido. | sim (pre-commit) |
| `pnpm secret-scan` | `gitleaks protect --staged` — só staged diff. | sim (pre-commit) |
| `pnpm secret-scan:full` | `gitleaks detect` — varre tudo. | uso pontual |
| `pnpm commitlint` | Conventional Commits (ADR-0017). | sim em PR |
| `pnpm build` | `tsc -b` com emit — só se for publicar pacote. | n/a |

## Agentes executáveis

| Comando | Credencial | O que faz |
|---|---|---|
| `pnpm audit:repo <path> [--profile=full] [--capture]` | nenhuma | Auditor determinístico (license + security + architecture). Output em `12_reports/audits/repo-auditor/`. `--capture` registra no cérebro. |
| `pnpm llm:smoke` | `ANTHROPIC_API_KEY` opcional | Smoke isolado de LLM — SKIPPED sem key, OK + custo com key. |
| `pnpm synthesize:audit <audit.md> [--tenant=<id>]` | `ANTHROPIC_API_KEY` | Claude sintetiza relatório do `audit:repo` em bullets + risco. |
| `pnpm curate:memory [--tenant=<id>] [--dry-run]` | `ANTHROPIC_API_KEY` | Lê audit log + working/ e propõe promoções para `<tenant>/facts/`. |
| `pnpm context:brief --task="<descrição>" [--tenant=<id>]` | `ANTHROPIC_API_KEY` | Read-only: monta context brief de um tenant para próximo agente usar. |
| `pnpm shopify:list-products [--first=N]` | `SHOPIFY_SHOP` + `SHOPIFY_ADMIN_TOKEN` | Lista produtos via Admin GraphQL (Custom App token). |
| `pnpm feed:dry-run [--source=fixture\|shopify] [--seo] [--first=N] [--capture]` | nenhuma p/ fixture; Shopify+Anthropic opcional | Pipeline catalog → feed → validação → dry-run report Merchant. Zero upload real. |

## Cérebro operacional

| Comando | O que faz |
|---|---|
| `pnpm ops:capture <input.json>` | Captura execução no cérebro (run-summary + index + session-log + opcional next-actions/priorities/blockers). Aceita JSON conforme schema em `06_packages/brain-bridge/src/types.ts`. |

## Estrutura do repo

| Comando | O que faz |
|---|---|
| `bash 10_ops/scripts/validate-structure.sh` | Verifica as 13 pastas raiz numeradas. |
| `bash 10_ops/scripts/check-env.sh` | Stub. |
| `bash 10_ops/scripts/bootstrap.sh` | Stub. |

## Git / commits

| Comando | O que faz |
|---|---|
| `git commit -m "feat(scope): ..."` | Conventional Commits 1.0.0 obrigatório. Tipos: `feat` `fix` `docs` `chore` `refactor` `test` `build` `ci` `perf` `style`. |

CI roda em PR: lint + typecheck + smoke + commitlint. Verde obrigatório.

## Tabela rápida

| Quero… | Comando |
|---|---|
| ambiente novo do zero | `pnpm install && pnpm doctor` |
| validar mudança antes de commit | `pnpm doctor` (cobre typecheck + lint + smoke) |
| rodar suíte completa | `pnpm test` |
| primeiro agente real (zero credencial) | `pnpm audit:repo .` |
| primeiro pipeline Merchant (zero credencial) | `pnpm feed:dry-run` |
| primeiro LLM call real | `pnpm llm:smoke` (precisa `ANTHROPIC_API_KEY`) |
| ver onde estamos | abrir `07_memory/vault/projects/commerce-agent-os/current-state.md` |
| ver o que puxar | abrir `07_memory/vault/projects/commerce-agent-os/next-actions.md` |
| ver passagem de bastão | abrir `07_memory/vault/projects/commerce-agent-os/handoff-log.md` |
| ler protocolo multi-operador | abrir `07_memory/vault/projects/commerce-agent-os/sync-protocol.md` |
