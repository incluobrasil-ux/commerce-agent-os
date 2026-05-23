# Branching model

Política de branches do `commerce-agent-os`. Simples, suficiente para um repo com 1–10 contribuidores.

- Versão: 0.1
- Data: 2026-05-23
- Status: vivo

> Modelo escolhido: **trunk-based development simplificado** com PR obrigatório.
> Sem GitFlow, sem long-lived branches além de `main`, sem release branches.

## Branches que existem

### `main` — única branch de longa duração

- **Definição:** linha de base arquitetural estável.
- **Source of truth.** Todo trabalho integrado vive aqui.
- **Estado garantido:**
  - CI verde (lint + typecheck + smoke + commitlint).
  - Tag `vX.Y.Z` em pontos significativos (atual: `v0.1.0-architecture-baseline`).
- **Quem pode escrever:** ninguém direto. **PR obrigatório.**
- **Branch protection (a configurar no GitHub):**
  - Require PR
  - Require CI green
  - Require linear history (sem merge commits)
  - Block force pushes

### Branches de trabalho — efêmeras

Criadas a partir de `main`, vivem até o merge do PR, deletadas após.

| Prefixo | Quando usar | Exemplo |
|---|---|---|
| `feat/` | nova funcionalidade visível ao usuário/agente | `feat/runtime-define-agent` |
| `fix/` | correção de bug | `fix/shopify-rate-limit-backoff` |
| `refactor/` | mudança sem alterar comportamento externo | `refactor/memory-split-bundle` |
| `docs/` | mudanças apenas em docs (.md, ADR) | `docs/team-onboarding` |
| `test/` | adicionar/ajustar testes | `test/governance-block-fixtures` |
| `chore/` | manutenção (deps, configs, ferramentas) | `chore/bump-vitest-2.1` |
| `ci/` | mudanças em `.github/workflows/` ou `10_ops/ci/` | `ci/add-secret-scan-job` |
| `build/` | mudanças em tsconfig/package.json estrutural | `build/migrate-tsconfig-references` |

**Os prefixos espelham os tipos de Conventional Commits** ([ADR-0017](../02_architecture/adr/ADR-0017-commit-conventions.md)).

### Branches que NÃO usamos (ainda)

| Não usado | Por quê |
|---|---|
| `develop` | trunk-based; integramos direto em `main`. |
| `release/X.Y.Z` | sem cadência de release definida ainda; faz sentido quando v1 estabilizar. |
| `hotfix/` | não há produção; quando houver, vira ADR próprio. |
| Branches por pessoa (`user/joao/...`) | desnecessário; scope > pessoa para discoverability. |
| `staging` | ambiente de staging via tag/env, não branch. |

## Nomenclatura de branch

### Regras
- Lowercase apenas.
- Separador: `/` entre prefixo e scope; `-` dentro do scope.
- ≤ 50 caracteres total.
- **Sem usuário/data no nome** (não precisa: `git log --author` resolve).

### Boas

```
feat/runtime-define-agent
fix/gmc-eventual-consistency
docs/onboarding-team
chore/bump-pnpm-9.1
test/governance-block-cases
```

### Ruins

```
joao-feature                  ❌ sem tipo; nome de pessoa
feat/MY-FEATURE               ❌ uppercase
feat/runtime/define/agent     ❌ múltiplos slashes
feat-runtime-stuff            ❌ vago
feature/very-long-name-that-describes-everything-in-one-shot  ❌ longo demais
```

## Lifecycle de uma branch de trabalho

```
1. git checkout main
2. git pull origin main             ← garante base atualizada
3. git checkout -b feat/<scope>
4. code + commit + push
5. open PR vs main
6. CI green + review approved
7. squash merge via GitHub UI       ← cria 1 commit em main
8. delete branch (auto)
9. git checkout main && git pull    ← sincroniza local
```

### Sincronização com `main` durante trabalho longo

Branch ficou velha (> 1 semana sem merge) ou main avançou bastante?

```
git checkout feat/<scope>
git fetch origin
git rebase origin/main             ← preferido sobre merge
# resolve conflitos se houver
git push --force-with-lease        ← força com proteção
```

**Por que rebase em vez de merge:** mantém histórico linear, evita "merge commits" inúteis na branch.
**`--force-with-lease`** previne sobrescrever push de outro dev na sua branch.

## Política de merge

### Estratégia única: **squash and merge**

| Por quê squash | Implicações |
|---|---|
| 1 PR = 1 commit em main | `git log` em main fica limpo |
| Conventional Commits funciona em main | tooling de changelog futuro fica simples |
| `git bisect` eficaz | menos commits para varrer |
| Sem commits "WIP" / "fix typo" / "address review" poluindo histórico | colaborador pode commitar livremente na branch |

### Configuração no GitHub

Em Settings → General → Pull Requests:
- ✅ Allow squash merging
- ❌ Allow merge commits (desabilitar)
- ❌ Allow rebase merging (desabilitar)
- ✅ Always suggest updating pull request branches
- ✅ Automatically delete head branches

### Squash commit message
Auto-preenchido pelo título do PR. **Mantenha o título do PR no formato Conventional Commits** porque vira o commit em `main`.

## Tags e releases

### Tags
- Formato: `vX.Y.Z[-suffix]` (semver-like).
- Sufixo descritivo permitido em pre-releases: `v0.1.0-architecture-baseline`, `v0.2.0-runtime-mvp`.
- Tags são **anotadas** (`git tag -a -m "..."`) para releases formais. Lightweight tags OK para snapshots internos.
- Apontam para commit em `main`.

### Releases no GitHub
- Cada tag pode virar release com release notes copiadas de `12_reports/releases/*.md`.
- Política: criar release notes ao subir tag significativa (não obrigatório para snapshots).

### Versionamento atual
- **`v0.1.0-architecture-baseline`** — atual. Marca conclusão da macro-fase 1 + sub-fases 2.0/2.1/2.2.
- Próximo marco esperado: `v0.2.0-runtime-mvp` quando Sub-fase 2.4 entregar `@cao/runtime` + primeiro agente real.
- **v1.0.0** reservado para release de produto funcional (Fase 12).

Política de versionamento detalhada vira ADR quando atingirmos `v0.5+` (frequência atual baixa não justifica formalizar agora).

## Reverter mudanças

### Bug detectado em `main` após merge

```bash
git checkout main
git pull
git revert -m 1 <sha-do-squash-merge>
git push                       ← direto em main? não — abra PR de revert
```

Na prática:
1. Identifique o commit problemático.
2. Crie branch `fix/revert-<scope>`.
3. `git revert <sha>`.
4. PR + CI verde + merge squash.

### Não force push em `main`

`git push --force origin main` é proibido. Branch protection deve bloquear.

Reverter mudança = novo commit que desfaz, não reescrever histórico.

## Branch protection — checklist de configuração

Para configurar em `github.com/incluobrasil-ux/commerce-agent-os/settings/branches`:

- [ ] Adicionar regra para `main`.
- [ ] ✅ Require a pull request before merging.
- [ ] ✅ Require approvals: **1** (mínimo para projeto pequeno; subir para 2 em equipes maiores).
- [ ] ✅ Dismiss stale pull request approvals when new commits are pushed.
- [ ] ✅ Require status checks to pass before merging.
  - [ ] Selecionar: `check` (o job do `.github/workflows/ci.yml`).
- [ ] ✅ Require branches to be up to date before merging.
- [ ] ✅ Require linear history.
- [ ] ❌ Do not allow bypassing the above settings.
- [ ] ❌ Allow force pushes.
- [ ] ❌ Allow deletions.

Esta config ainda **não foi aplicada** — pendência da Sub-fase 2.2 residual.

## Fluxos por cenário

### Cenário: nova feature pequena (< 1 dia)
```
git checkout -b feat/<scope>  →  code  →  push  →  PR  →  squash merge
```

### Cenário: feature grande (> 1 semana)
- Divida em PRs sequenciais menores quando possível.
- Se inevitável manter branch longa: rebase em main 2-3×/semana para evitar conflitos no fim.
- Comunique no time que branch está "em progresso, não revisar ainda" via label `wip` ou draft PR.

### Cenário: collaboration em branch
- 2+ devs em mesma branch é OK se coordenado.
- Cada dev commita normalmente; squash final no merge resolve histórico interno.
- Use `git pull --rebase` ao puxar trabalho do outro.

### Cenário: PR fica bloqueado em review
- Após 2 dias sem feedback: ping reviewer no PR.
- Após 5 dias: escalar para tech lead / abrir issue de processo.
- PR não merge sem review.

### Cenário: ADR como PR
- Branch: `docs/adr-NNNN-slug`.
- Conteúdo: apenas `02_architecture/adr/ADR-NNNN-slug.md` com status `proposta`.
- PR para discussão.
- Após aprovação: novo commit/PR atualiza status para `aceita` + atualiza `00_meta/DECISIONS.md`.

### Cenário: revert urgente
```
git checkout main && git pull
git checkout -b fix/revert-<scope>
git revert -m 1 <sha-do-merge>
git push -u origin fix/revert-<scope>
# abrir PR com título "revert: <subject original>"
# merge squash após CI verde
```

## Referências

- [`10_ops/CONTRIBUTING.md`](./CONTRIBUTING.md) — workflow de PR completo.
- [`00_meta/TEAM_ONBOARDING.md`](../00_meta/TEAM_ONBOARDING.md) — orientação para novos.
- [`00_meta/STACK_RULES.md`](../00_meta/STACK_RULES.md) §8 — convenção de commits.
- [`02_architecture/adr/ADR-0017-commit-conventions.md`](../02_architecture/adr/ADR-0017-commit-conventions.md) — decisão formal.
- [`02_architecture/adr/ADR-0002-upstream-policy.md`](../02_architecture/adr/ADR-0002-upstream-policy.md) — política de upstreams (read-only).

## Mudanças nesta política

Mudanças em branching model: **ADR obrigatório** (vira ADR-00XX-branching-policy). Esta versão (0.1) é inferida da Sub-fase 2.2 implícita e pode evoluir conforme equipe cresce.
