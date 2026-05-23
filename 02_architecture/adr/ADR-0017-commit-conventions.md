# ADR-0017 — Convenção de commits

- **Data:** 2026-05-23
- **Status:** aceita
- **Supersede:** —
- **Relacionados:** STACK_RULES.md seção 8 (Commits), ADR-0006 (commitlint como tooling)

## Contexto

`STACK_RULES.md` seção 8 hoje: "Imperativo curto, PT ou EN. Convenção opcional Conventional Commits — em avaliação."

Restrições do projeto atual:
- Sub-fase 2.2 do `NEXT_STEPS.md` prevê CI mínimo + pre-commit; lint de mensagem é candidato natural.
- 17 agentes + 7 apps + 7 integrações + 12 packages = **muitas áreas tocáveis** em PRs cross-cutting; sem convenção, scopes ficam ambíguos.
- Roadmap prevê release v1 com changelog — gerar manualmente não escala.
- Histórico hoje tem zero commits de implementação real (só scaffold) — momento ideal para estabelecer disciplina antes do volume crescer.

## Decisão

Adotar **Conventional Commits 1.0.0**.

**Formato canônico:**

```
<type>(<scope>): <subject>

<body opcional>

<footer opcional>
```

**Tipos permitidos:**

| Tipo | Quando usar |
|---|---|
| `feat` | nova funcionalidade visível ao usuário/agente |
| `fix` | correção de bug |
| `refactor` | mudança de código sem alterar comportamento externo |
| `docs` | mudança apenas em docs (`.md`, README, ADR) |
| `test` | adicionar/ajustar testes |
| `chore` | manutenção (deps, configs, ferramentas) |
| `style` | formatação (raro com biome auto-fix) |
| `perf` | melhoria de performance mensurável |
| `build` | mudanças que afetam build (tsconfig, package.json) |
| `ci` | mudanças em CI/pipelines (`10_ops/ci/`) |
| `revert` | reverte commit anterior |

**Scopes recomendados** (não obrigatórios, alinhados com layout):

- **Por área raiz:** `meta`, `arch`, `agents`, `apps`, `integrations`, `packages`, `memory`, `prompts`, `ops`, `tests`, `reports`.
- **Por package/agente/app/adapter:** `core`, `runtime`, `memory`, `guardrails`, `shopify`, `gmc`, `posthog`, `feed-service`, `review-service`, `judge-me`, `governance-risk-qa`, etc.
- **Múltiplos scopes** (cross-area inevitável): `agents,packages: ...` (vírgula sem espaço).
- **Sem scope** é permitido para mudanças triviais (`chore: bump pnpm`).

**Idioma:**
- PT **ou** EN no subject — escolher 1 por PR para consistência (lint não restringe; revisão manual cuida).
- Body sempre PT (alinha com docs internos).

**Breaking changes:**
- `!` no header: `feat(runtime)!: nova API de invocação`.
- Bloco `BREAKING CHANGE:` no footer com instrução de migração.

**Subject:**
- Imperativo curto: `add`, `fix`, `corrige`, `remove`.
- Até 72 chars (linha do header).
- Sem ponto final.

**Footer:**
- `Refs: #issue` ou `Closes: #issue` quando aplicável.
- `Co-Authored-By:` preservado em commits assistidos.

**Linting:** `commitlint` + `@commitlint/config-conventional` (instalado via ADR-0006), executado em:
- pre-commit (mensagem em preparação) via `simple-git-hooks`.
- CI (todos os commits do PR) via `commitlint --from=origin/main`.

**Política de exceção:** revert e merge commits podem violar formato (`Revert "feat(...)..."`); commitlint config padrão já tolera.

## Alternativas consideradas

| Opção | Pros | Contras | Decisão |
|---|---|---|---|
| **Conventional Commits 1.0.0** | Padrão estabelecido; tooling rico (commitlint, semantic-release); semântico | Curva inicial; rigor às vezes incomoda | **escolhido** |
| Estilo livre + "imperativo curto" (atual) | Zero atrito | Sem changelog automático; greps ruins; intent perdido | rejeitado |
| Angular commit format | Muito similar ao Conventional; mais rígido em scope | Cerimônia extra sem ganho claro | rejeitado |
| Gitmoji | Visual amigável | Pouco usado em projetos sérios; tooling pobre | rejeitado |
| Conventional + Gitmoji combinado | Visual + estruturado | Pesado; pouco uso real | rejeitado |

## Consequências

**Positivas**
- Changelog automatizável (`conventional-changelog` ou `semantic-release` futuros).
- `git log --grep='feat(runtime)'` vira útil com 25+ packages.
- `BREAKING CHANGE:` explícito força attention na revisão.
- `Co-Authored-By:` preserva attribution em commits assistidos.
- Alinha com prática típica dos upstreams sérios estudados.

**Negativas / trade-offs**
- Colaborador novo precisa aprender o formato.
- Commits "drive-by" (hotfix) podem irritar com erros do linter.
- Escolha de scope quando PR cruza áreas é subjetiva.

**Mitigações**
- Mensagem de erro do commitlint inclui 3 exemplos concretos.
- `STACK_RULES.md` seção 8 ganha tabela de exemplos comuns (5+).
- Para PRs cross-area: `meta:` ou múltiplo (`agents,packages:`).
- Pre-commit local antecipa erros antes do push.

## Pendências (para Sub-fase 2.2)

- Configurar `commitlint.config.js` raiz (extends `@commitlint/config-conventional`).
- Configurar pre-commit + CI hooks (depende de ADR-0006 aceito).
- Atualizar `STACK_RULES.md` seção 8: substituir "convenção opcional — em avaliação" pela referência a este ADR + tabela de exemplos — **somente após aceitação**.

## Conflitos com ADRs anteriores

Nenhum conflito. STACK_RULES.md seção 8 já antecipava Conventional Commits "em avaliação"; este ADR formaliza.
