# Contributing

Workflow operacional para abrir PRs no `commerce-agent-os`. **Tudo aqui é mecânico** — para entender o contexto do projeto, leia primeiro [`00_meta/TEAM_ONBOARDING.md`](../00_meta/TEAM_ONBOARDING.md).

- Versão: 0.1
- Data: 2026-05-23
- Status: vivo

## Fluxo end-to-end

```
1. Pick a task         → NEXT_STEPS.md ou issue priorizada
2. Branch out          → feat/<scope>, fix/<scope>, docs/<scope>, chore/<scope>
3. Code                → respeitando STACK_RULES
4. Test local          → pnpm typecheck && pnpm lint && pnpm test:smoke
5. Commit              → Conventional Commits 1.0.0
6. Push                → origin/<branch>
7. Open PR             → contra main
8. CI runs             → automatic; verde obrigatório
9. Review              → 1+ approve
10. Merge              → squash
11. Branch cleanup     → delete branch
```

Detalhe de cada etapa abaixo.

## 1. Escolher uma task

**Antes de codar**, decida o quê. Fontes válidas:
- [`10_ops/scripts/NEXT_STEPS.md`](./scripts/NEXT_STEPS.md) — sub-fase ativa do plano.
- Issues no GitHub com label `ready` ou `good first issue`.
- Pendência rastreada em algum readiness audit (`12_reports/audits/*-readiness.md`).
- ADR em status `proposta` que precisa de validação.

**Se a task não está em nenhum desses lugares**, abra issue antes de codar.

## 2. Branch out

Política completa em [`10_ops/branching-model.md`](./branching-model.md). Resumo:

- Branch a partir de `main` sempre.
- Nome curto e descritivo: `feat/runtime-define-agent`, `fix/shopify-rate-limit`, `docs/onboarding`.
- Tipos permitidos: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`, `perf`, `build`, `ci`, `revert` (mesmos do Conventional Commits — ADR-0017).

```bash
git checkout main
git pull origin main
git checkout -b feat/<scope-curto>
```

## 3. Code

### Regras vinculantes

| Regra | Onde |
|---|---|
| TypeScript strict, named exports, sem `any` | [`STACK_RULES.md §3`](../00_meta/STACK_RULES.md) |
| Naming: kebab-case files, camelCase vars, PascalCase types | [`STACK_RULES.md §2`](../00_meta/STACK_RULES.md) |
| Validação runtime via zod no boundary | [`STACK_RULES.md §4`](../00_meta/STACK_RULES.md) + [ADR-0006](../02_architecture/adr/ADR-0006-qa-stack.md) |
| Scope `@cao/` em todo package | [ADR-0009](../02_architecture/adr/ADR-0009-package-scope.md) |
| Imports cross-package via nome do package, não path | [`STACK_RULES.md §5`](../00_meta/STACK_RULES.md) |
| Não comentar o quê — apenas porquê não-óbvio | [`STACK_RULES.md §6`](../00_meta/STACK_RULES.md) |
| Ação destrutiva passa por `@cao/guardrails` | [`STACK_RULES.md §9`](../00_meta/STACK_RULES.md) |

### O que NÃO fazer

- **Editar `01_upstreams/`** — read-only ([ADR-0002](../02_architecture/adr/ADR-0002-upstream-policy.md)).
- **Adicionar dep externa não listada em ADR-0006** sem novo ADR.
- **Mudar contrato de agente (`contract.yaml`)** sem atualizar fixtures + docs no mesmo PR.
- **Mudar API de package (`src/index.ts` exports)** sem atualizar consumidores no mesmo PR (ou marcar como BREAKING CHANGE no commit).
- **Implementar domínio antes da Sub-fase 2.4** (`@cao/runtime` mínimo). Sem runtime, código de agente será reescrito.

### Adaptação de código upstream

Se você adapta código de `01_upstreams/<repo>/` para `06_packages/` ou `05_integrations/`, **adicione header de atribuição** no topo do arquivo:

```ts
// Adapted from https://github.com/<org>/<repo>/blob/<SHA>/path/to/file
// Original license: <SPDX>
// Adaptations: <breve descrição>
```

Ver [ADR-0002 §3](../02_architecture/adr/ADR-0002-upstream-policy.md).

## 4. Test local antes de commit

```bash
pnpm typecheck       # tsc -b — deve passar verde
pnpm lint            # biome — deve passar verde
pnpm test:smoke      # vitest — deve passar verde
```

Se algum falhar, **não commite**. Conserte antes.

Tests adicionais conforme sua mudança:
- Mudou contrato de agente? Rode contract test (futuro — Sub-fase 2.4+).
- Mexeu em adapter? Verifique se há integration test relevante (futuro).

## 5. Commit — Conventional Commits 1.0.0

Política completa em [ADR-0017](../02_architecture/adr/ADR-0017-commit-conventions.md) e [`STACK_RULES.md §8`](../00_meta/STACK_RULES.md). Formato:

```
<type>(<scope>): <subject>

<body opcional — sempre PT>

<footer opcional — Refs, Closes, BREAKING CHANGE>
```

**Tipos:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`, `build`, `ci`, `revert`.

**Scope (recomendado):** área raiz (`meta`, `agents`, `apps`, `integrations`, `packages`) ou package/agente específico (`runtime`, `shopify`, `governance-risk-qa`).

**Subject:** imperativo curto, ≤ 72 chars, sem ponto final, PT ou EN (1 idioma por PR).

**Exemplos válidos:**
```
feat(runtime): add agent retry policy
fix(shopify): handle 429 with exponential backoff
docs(arch): add ADR-0018 for feedgen sidecar
chore(deps): bump vitest to 2.1
test(governance-risk-qa): add fixture for block decision
feat(runtime)!: rename defineAgent to declareAgent

BREAKING CHANGE: defineAgent renamed; update callers.
```

**Inválidos:**
```
fix bug            ❌ sem tipo formal nem subject claro
WIP                ❌ não é commit final
Update files       ❌ não diz o que mudou
feat: stuff.       ❌ ponto final + subject genérico
```

CI roda `commitlint --from=origin/main` em todo PR; commits fora do padrão **bloqueiam merge**.

## 6. Push

```bash
git push -u origin feat/<scope>
```

Primeira vez no repo: pode pedir auth. Use HTTPS + PAT, ou SSH.

## 7. Abrir PR

### Título do PR
Mesma convenção do commit principal: `feat(runtime): add agent retry policy`.

### Body — template

```markdown
## O que muda

<1-2 frases>

## Por que

<motivação; link para sub-fase, issue, ou ADR>

## Como testar

<comandos ou passos para validar local>

## Checklist

- [ ] `pnpm typecheck` verde
- [ ] `pnpm lint` verde
- [ ] `pnpm test:smoke` verde
- [ ] Doc correspondente atualizada (contract.yaml, flows.md, etc. se aplicável)
- [ ] ADR criado se decisão estrutural
- [ ] Sem mudança em `01_upstreams/`
- [ ] Sem secret no diff
```

### Tamanho do PR
- **Ideal:** < 15 arquivos, 1 escopo, 1 propósito.
- **Aceitável:** até 50 arquivos se for refactor mecânico bem delimitado.
- **Recusar:** PR misturando 3 features + 2 fixes — peça pra dividir.

## 8. CI roda automático

Workflow em `.github/workflows/ci.yml`. Rota:
- `pull_request` → lint + typecheck + smoke + commitlint
- `push` para `main/master` → lint + typecheck + smoke

**Não merge sem CI verde.** Se CI falhar:
1. Olhe log do step que quebrou.
2. Reproduza local (`pnpm typecheck`, `pnpm lint`, `pnpm test:smoke`).
3. Corrija + push (CI re-roda automaticamente).

## 9. Review

### Para autor do PR
- Marque reviewers relevantes da área.
- Responda comentários no commit em vez de "Resolve conversation" sem fix.
- Se discordar, argumente — não force merge.

### Para reviewer

Checklist mínimo:
- [ ] Conteúdo bate com o título/escopo do PR.
- [ ] Doc correspondente foi atualizada (`contract.yaml`, `flows.md`, `README.md` do package, ADR).
- [ ] Sem hack inexplicado (`any`, `// @ts-ignore`, `eslint-disable` sem comentário).
- [ ] Sem teste removido sem motivo.
- [ ] Sem secret/token/PII em fixture ou log.
- [ ] Se ação destrutiva, passa por `@cao/guardrails` (quando existir runtime).
- [ ] Imports respeitam ordering (external → @cao/* → relative).
- [ ] Cross-package via nome do package (`@cao/...`) e não path relativo.

Reviewer pode pedir **rebase em main** se branch ficou velha (> 1 semana sem merge).

## 10. Merge — squash

**Estratégia default:** `squash and merge` no GitHub.

Por quê:
- Cada PR vira 1 commit limpo em `main`.
- Conventional Commits funciona (todo commit em main é tipo `feat(...)` etc.).
- `git bisect` e `git log --grep` funcionam bem.

Não usar `merge commit` (poluiria histórico com commits intermediários).
Não usar `rebase and merge` (perde scope unificado).

Mensagem do squash commit: usar o título do PR (auto-preenchido).

## 11. Cleanup

Após merge:
```bash
git checkout main
git pull origin main
git branch -d feat/<scope>     # delete local
```

GitHub deleta remota automaticamente se branch protection está configurada.

## Casos especiais

### Hotfix em produção
Não existe ainda — não há produção. Quando houver, política de hotfix vira ADR próprio.

### Reverter merge
```bash
git revert -m 1 <sha-do-merge>
git push
```
Abra PR para o revert. Commit message: `revert: <original subject>`.

### PR cross-area (mexe em múltiplas pastas raiz)
- Use scope múltiplo no commit: `feat(agents,packages): ...` (vírgula sem espaço).
- Ou scope `meta:` se for verdadeiramente cross-cutting.
- Justifique no body do PR por que cross-area é necessário (frequentemente sinal de PR mal-dividido).

### Mudança que altera contrato público
- Use `!` no commit: `feat(runtime)!: rename defineAgent`.
- Bloco `BREAKING CHANGE:` no footer com instruções de migração.
- Atualize **consumidores no mesmo PR** ou abra PR de migração imediatamente após.

### Adicionar ADR
1. Crie `02_architecture/adr/ADR-NNNN-slug.md` com status `proposta`.
2. PR isolado contendo só o ADR.
3. Discussão acontece no PR.
4. Após acordo: commit que muda status para `aceita` + atualiza `00_meta/DECISIONS.md`.
5. Trabalho dependente do ADR começa em PR separado, citando ADR aceito.

## Referências

- [`00_meta/TEAM_ONBOARDING.md`](../00_meta/TEAM_ONBOARDING.md) — orientação inicial.
- [`10_ops/branching-model.md`](./branching-model.md) — branches detalhado.
- [`00_meta/STACK_RULES.md`](../00_meta/STACK_RULES.md) — convenções de código.
- [`00_meta/DECISIONS.md`](../00_meta/DECISIONS.md) — índice de ADRs.
- [`10_ops/scripts/NEXT_STEPS.md`](./scripts/NEXT_STEPS.md) — sub-fase ativa.

## Em caso de dúvida

- **Onde isso encaixa?** → leia o map de domínio correspondente em `02_architecture/integrations/`.
- **Posso editar X?** → leia tabela em [`TEAM_ONBOARDING.md` §"O que você NÃO pode editar"](../00_meta/TEAM_ONBOARDING.md).
- **Isso vira ADR?** → se muda estrutura (layout, runtime, stack, política), sim.
- **CI quebrou e não sei por quê?** → log do CI tem comando exato; reproduza local.
- **Outra coisa?** → issue com label `question`.
