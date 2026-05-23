# Commands

Comandos principais do projeto. Tudo via `pnpm` na raiz. Cobertura completa do dia-a-dia.

## Setup / instalação

| Comando | O que faz |
|---|---|
| `pnpm install` | Instala deps de todos os workspaces (24+ pacotes). |
| `pnpm clean` | Remove `dist/` e `.tsbuildinfo` de cada package. |
| `cp .env.example .env.local` | Cria env local. Editar manualmente. |

## Qualidade (rodar antes de commit)

| Comando | O que faz | Falha = block? |
|---|---|---|
| `pnpm typecheck` | `tsc -b` em todos os refs do tsconfig raiz. Zero erros = verde. | sim |
| `pnpm lint` | `biome check .` (lint + format check + organize imports). | sim |
| `pnpm format` | `biome format --write .` — aplica formatação. | n/a |
| `pnpm test` | `vitest run` — toda a suíte (unit + smoke). | sim |
| `pnpm test:smoke` | só `11_tests/smoke/` — rápido (~1s). | sim (pre-commit) |
| `pnpm commitlint` | Valida mensagens de commit conforme Conventional Commits (ADR-0017). | sim em PR |

## Build

| Comando | O que faz |
|---|---|
| `pnpm build` | Builda todos os packages em `06_packages/*` (saída em `dist/`). |

`pnpm typecheck` já cobre verificação de tipos sem precisar de build. `pnpm build` só é necessário se for publicar pacote ou rodar `import '@cao/x'` em código fora do workspace (com path-resolution via dist).

## Agentes executáveis

| Comando | O que faz |
|---|---|
| `pnpm audit:repo <path> [--profile=full]` | Roda `repo-auditor` em `<path>`. Profiles: `license` / `security` / `architecture` / `full`. Output: `12_reports/audits/repo-auditor/<repo>-<timestamp>.md`. Exit 0 = sem críticos, 1 = críticos, 2 = erro de uso. |

Exemplos:

```bash
# Auditar o próprio projeto
pnpm audit:repo .

# Auditar só licença (rápido)
pnpm audit:repo . --profile=license

# Auditar um upstream clonado
pnpm audit:repo 01_upstreams/langgraph --profile=full

# Saída em diretório customizado
pnpm audit:repo . --out=/tmp/audits
```

`repo-auditor` é **determinístico** — não exige LLM nem chave de API.

## Estrutura do repo

| Comando | O que faz |
|---|---|
| `bash 10_ops/scripts/validate-structure.sh` | Verifica que as 13 pastas raiz numeradas existem (`00_meta`..`12_reports`). Útil em PR que toca layout. |
| `bash 10_ops/scripts/check-env.sh` | Stub. Será expandido conforme deps externas. |
| `bash 10_ops/scripts/bootstrap.sh` | Stub. Pipeline completo de bootstrap (planejado). |

## Git / commits

| Comando | O que faz |
|---|---|
| `git commit -m "feat(scope): ..."` | Conventional Commits 1.0.0 obrigatório (ADR-0017). Tipos válidos: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `build`, `ci`, `perf`, `style`. |

CI roda automático em PR: lint + typecheck + smoke + commitlint. Verde obrigatório.

## Resumo: pipeline de validação local

Antes de qualquer commit/PR:

```bash
pnpm typecheck && pnpm lint && pnpm test:smoke
```

Tudo verde → ok para commit.

## Tabela rápida

| Quero… | Comando |
|---|---|
| ambiente do zero | `pnpm install` |
| validar mudança | `pnpm typecheck && pnpm lint && pnpm test:smoke` |
| rodar suíte completa | `pnpm test` |
| primeiro agente real | `pnpm audit:repo .` |
| ver onde estamos | abrir `07_memory/vault/projects/commerce-agent-os/current-state.md` |
| ver o que puxar | abrir `07_memory/vault/projects/commerce-agent-os/next-actions.md` |
