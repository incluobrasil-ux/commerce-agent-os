# Stack rules

Regras concretas de stack, naming e estilo. Curto e factual — quando regra mudar, atualizar aqui antes de aplicar.

- Versão: 0.3
- Data: 2026-05-23
- Status: vivo

> Substitui `conventions.md` (lowercase) deletado.

## 1. Linguagem

- **TypeScript** é a linguagem padrão para todo código autoral (Node 20+).
- **Python** é permitido apenas quando um upstream o exige (ex.: portar `feedgen`) e como sidecar/serviço isolado. Não misturar TS/Python no mesmo pacote.
- **Liquid + vanilla JS** no `04_apps/shopify-theme/` (não escolha — é Shopify).
- **Markdown** para todos os docs.

## 2. Naming

### Pastas e arquivos
- Pastas raiz: `NN_nome/` (zero-padded). Imutáveis em ordem.
- Pastas internas: `kebab-case` (ex.: `repo-audits`, `domain-model`).
- Arquivos TS/JS: `kebab-case.ts`. Componentes React: `PascalCase.tsx`.
- Docs Markdown:
  - **UPPERCASE.md** para docs canônicos de governança em `00_meta/` (PROJECT_SCOPE, ROADMAP, etc.).
  - **lowercase.md** ou `kebab-case.md` para tudo o mais.
  - `AGENT.md` é exceção (convenção de agente).

### Packages
- Scope: **`@cao/<name>`** (commerce-agent-os). Confirmado em [ADR-0009](../02_architecture/adr/ADR-0009-package-scope.md).
- Nomes de package: `kebab-case` (ex.: `@cao/shared-types`).
- Convenções de subname (ADR-0009):
  - Genérico em `06_packages/`: `@cao/<nome>` (ex.: `@cao/runtime`).
  - Compartilhado: `@cao/shared-<área>` (ex.: `@cao/shared-types`).
  - Adapter em `05_integrations/`: `@cao/integration-<provider>` (ex.: `@cao/integration-shopify`).
  - Serviço headless em `04_apps/`: `@cao/<serviço>-service` (ex.: `@cao/merchant-service`).
  - App embedded em `04_apps/`: `@cao/<app-name>` (ex.: `@cao/shopify-admin-app`).
- Todos `"private": true` enquanto monorepo for interno.

### Agentes
- `kebab-case` curto descrevendo função (ex.: `product-feed-seo`).
- Sufixos comuns: `-ops` (operacional), `-curation`, `-master` (raiz), `-qa`.

### Identificadores em código
- Funções, variáveis: `camelCase`.
- Tipos, interfaces, classes: `PascalCase`.
- Constantes globais: `SCREAMING_SNAKE_CASE`.
- Enums: `PascalCase` para o tipo; valores em `PascalCase`.

### Eventos PostHog
- `<surface>.<verb>` em `snake_case` (ex.: `feed.proposed`, `agent.invoked`, `campaign.launched`).
- Propriedades em `snake_case` (`tenant_id`, `agent_name`, `cost_usd`).

### Chaves de memória / paths em vault
- `07_memory/vault/<tenant_id>/<bucket>/<topic>/<slug>.md`.
- `<bucket>` ∈ {`facts`, `working`, `voc`, `competitor-benchmark`, `audit`}.

## 3. Estilo TypeScript

- `strict: true` (já no `tsconfig.base.json`).
- Named exports apenas — **proibir `default export`** (exceto onde framework obriga, ex.: Vite/React Router routes).
- Sem `any` implícito ou explícito; se precisar, justificar em comentário curto.
- `Result<T,E>` ou exceções tipadas — decidir por package, ser consistente.
- `Date` proibido em domínio; use ISO strings ou um `Instant` em `shared-types`.
- `Math.random()` proibido em domínio; use injection de `Random` para teste.

## 4. Validação e schemas

- **Type-time** types em `@cao/shared-types`.
- **Runtime** schemas em `@cao/shared-schemas` com **zod ^3** (confirmado em [ADR-0006](../02_architecture/adr/ADR-0006-qa-stack.md)).
- Boundary rule: todo dado vindo de fora (HTTP, fila, DB, LLM, FS) **deve** passar por schema runtime antes de ser usado.
- Tipo canônico vive em `shared-types`; schema infere via `z.infer<>` mas tipo manda na intenção (ADR-0004).

## 5. Imports

- Imports relativos só dentro do mesmo package.
- Cross-package: via nome do package (`@cao/...`).
- Sem imports circulares.
- Ordering: external → internal `@cao/*` → relative. (a ser enforced por lint na Fase 5).

## 6. Comentários

- Default: **não comentar**. Identificadores claros explicam o quê.
- Comentar apenas o porquê de algo não-óbvio (invariante escondida, bug histórico, workaround).
- Nunca referenciar tarefa/PR no código (`// fix bug #123` rota para git blame).

## 7. Testes / QA

Stack confirmado em [ADR-0006](../02_architecture/adr/ADR-0006-qa-stack.md):

- **Test runner:** vitest ^2 (todas as 5 camadas).
- **Coverage:** c8 via `vitest --coverage`.
- **Lint + format:** biome ^1.9 (substitui ESLint + Prettier).
- **Secret scan:** gitleaks (pre-commit + CI).
- **Pre-commit hooks:** simple-git-hooks.

Convenções:

- Smoke tests em `11_tests/smoke/` — devem rodar < 30s, sem rede externa.
- Testes unitários colocalizados (`<file>.test.ts` ao lado do arquivo).
- Testes de integração de agente em `<agent>/tests/`.
- Sem mocks de DB em testes de integração (lição prévia comum).
- Fixtures em `<scope>/tests/fixtures/`.
- `vitest.config.ts` raiz em `projects` mode por package.
- `.gitleaks.toml` com allowlist mínima (`**/tests/fixtures/**`).

## 8. Commits

Conventional Commits 1.0.0 confirmado em [ADR-0017](../02_architecture/adr/ADR-0017-commit-conventions.md). Enforced por `commitlint` (pre-commit + CI).

**Formato:** `<type>(<scope>): <subject>` opcionalmente com body e footer.

**Tipos:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`, `build`, `ci`, `revert`.

**Scopes recomendados:** por área raiz (`agents`, `apps`, `integrations`, `packages`, `meta`, `arch`, `ops`, `tests`) ou por package/agente (`runtime`, `shopify`, `governance-risk-qa`, etc.). Múltiplos: `agents,packages:`. Sem scope é permitido para mudanças triviais.

**Idioma:** PT ou EN no subject — 1 por PR; body sempre PT.

**Subject:** imperativo curto, ≤ 72 chars, sem ponto final.

**Breaking changes:** `!` no header + bloco `BREAKING CHANGE:` no footer.

**Exemplos canônicos:**

| Exemplo | Quando |
|---|---|
| `feat(runtime): add agent retry policy` | nova funcionalidade em `@cao/runtime` |
| `fix(shopify): handle 429 with exponential backoff` | bug fix em adapter Shopify |
| `refactor(memory): split bundle from search` | reorganização de `@cao/memory` sem mudar API externa |
| `docs(arch): add ADR-0018 about feedgen sidecar` | novo ADR em `02_architecture/adr/` |
| `chore(deps): bump vitest to 2.1` | atualização de dependência |
| `test(governance-risk-qa): add fixture for block path` | adicionar fixture em `03_agents/.../tests/` |
| `feat(runtime)!: rename defineAgent to declareAgent` | breaking change na API pública |
| `ci(ops): add commitlint workflow` | mudança em `10_ops/ci/` |

**Política de exceção:** revert e merge commits podem violar formato (`Revert "feat(...)..."` é aceito pelo config padrão).

**Outras regras:**
- Nunca commitar `.env`, segredos, dumps de banco, ou conteúdo de `01_upstreams/` clonados.
- `Co-Authored-By:` preservado em commits assistidos.

## 9. Ações destrutivas em código

- Toda ação irreversível ou de alto impacto **deve** passar por `@cao/guardrails` com policy explícita.
- Nenhum agente decide sozinho publicar produto, criar campanha paga, enviar email em massa.
- Default em código de ops: `--dry-run` é o caminho default; `--apply` exige flag explícita.

## 10. Documentação dentro do código

- Cada `package.json` tem `description`.
- Cada package tem `README.md` com API prevista.
- Cada agente tem `AGENT.md` + `contract.yaml`.
- Mudanças que alteram contrato → atualizar contract.yaml no mesmo commit.

## 11. O que está fora destas regras

- Estilo de UI (Polaris é padrão em Shopify; Tailwind se for usado fora — a confirmar).
- Convenções específicas de Python (se entrar, regras separadas).
