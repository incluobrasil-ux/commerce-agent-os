# ADR-0006 — Stack de QA (testes + lint + secret-scan + validação runtime)

- **Data:** 2026-05-23
- **Status:** aceita
- **Supersede:** —
- **Relacionados:** ADR-0004 (shared packages — pendência sobre zod **resolvida aqui**), ADR-0017 (commits)

## Contexto

Sub-fase 2.1 do `10_ops/scripts/NEXT_STEPS.md` exige `pnpm test`/`pnpm lint`/secret-scan verdes; hoje são `echo` placeholders. Fase 5 do `ROADMAP.md` não pode iniciar sem este ADR.

Restrições do scaffold atual:
- 12 packages em `06_packages/*`, 7 adapters em `05_integrations/*`, 7 apps em `04_apps/*` — todos TS + ESM (`"type": "module"`).
- 5 camadas declaradas em `11_tests/{smoke, contract, integration, e2e, performance}/` já assumem watch + snapshot + fixtures.
- `STACK_RULES.md` seção 7 já implícita um runner com colocalização `<file>.test.ts` e smoke < 30s sem rede.
- `STACK_RULES.md` seção 4 declara zod como default, mas marca "confirmar em ADR futuro".
- ADR-0004 lista "Confirmar zod como stack (ADR-0006 ainda não escrito)" como pendência explícita.
- `10_ops/security/security-checklist.md` cita gitleaks como candidato.

## Decisão

| Categoria | Ferramenta | Versão alvo | Onde mora |
|---|---|---|---|
| Test runner (todas as 5 camadas) | **vitest** | `^2` | devDep raiz |
| Coverage | **c8** (via `vitest --coverage`) | atual | devDep raiz |
| Lint + format unificado | **biome** | `^1.9` | devDep raiz |
| Validação runtime | **zod** | `^3` | dep de `@cao/shared-schemas` + outros |
| Secret scan | **gitleaks** (binário Go externo) | atual | CI + pre-commit |
| Pre-commit hooks | **simple-git-hooks** | atual | devDep raiz |
| Commit message lint | **commitlint** + `@commitlint/config-conventional` | atual | devDep raiz (depende de ADR-0017) |
| SAST | postergado — ADR futuro avaliará Semgrep | — | — |
| DAST | fora de escopo v0/v1 | — | — |

**Convenções derivadas:**
- `vitest.config.ts` raiz com `projects` por package; cada package importa via `@cao/<name>` (sem path hacks).
- `biome.json` raiz com overrides apenas se inevitáveis.
- `.gitleaks.toml` raiz com allowlist mínima (`**/tests/fixtures/**` e similares).
- Pre-commit: `biome check --staged` + `gitleaks protect --staged` + smoke shell.
- CI: pre-commit + `pnpm typecheck` + `pnpm test` (vitest) + `commitlint --from=origin/main`.
- zod **substitui** "schemas runtime em `@cao/shared-schemas`" referenciado em ADR-0004 — encerra aquela pendência.

## Alternativas consideradas

**Test runner**
| Opção | Pros | Contras | Decisão |
|---|---|---|---|
| **vitest** | DX vite-native, ESM-first, tipos TS, watch, mocking, snapshot, projects mode | Mais novo que jest; ecossistema menor | **escolhido** |
| jest | Maturidade, ecossistema gigante | Fricção com ESM (`type:module`); mais lento; configs complexas | rejeitado |
| node:test (Node 20+) | Zero deps; nativo | DX pobre (sem watch decente, sem mocking rico, sem coverage integrado) | rejeitado |
| uvu / mocha | Rápido / consolidado | DX inferior; sem snapshot/coverage de primeira | rejeitado |

**Lint + format**
| Opção | Pros | Contras | Decisão |
|---|---|---|---|
| **biome** | 1 binário Rust; muito rápido; 0 config inicial; oficial | Plugin ecosystem menor que ESLint; v2 em transição | **escolhido** |
| ESLint + Prettier | Padrão de indústria; ecossistema enorme | 2 ferramentas; lento; configs duplicadas; node-based | rejeitado |
| dprint + oxlint | Performance Rust | oxlint imaturo; menos cobertura de regras | rejeitado |

**Validação runtime**
| Opção | Pros | Contras | Decisão |
|---|---|---|---|
| **zod** | TS-first; `z.infer<>` integra com `shared-types`; ecossistema rico | Bundle maior que valibot; runtime cost | **escolhido** |
| valibot | Tree-shakeable; menor bundle | Ecossistema menor; menos maduro em features avançadas (`.refine` complexo) | rejeitado |
| ajv | Padrão JSON Schema; rápido | Não é TS-first; menos DX integration; cumbersome com tipos derivados | rejeitado |
| yup | Maduro | Sem `z.infer` style; mais boilerplate em TS | rejeitado |

**Secret scan**
| Opção | Pros | Contras | Decisão |
|---|---|---|---|
| **gitleaks** | Maduro; pre-commit nativo; binário Go; rules TOML | Falsos positivos em base64 | **escolhido** |
| trufflehog | Detecção mais agressiva (entropy + verify) | Overhead; ruidoso | postergar |
| detect-secrets (Yelp) | Boa precisão | Python — atrito com stack TS | rejeitado |

**Pre-commit hooks**
| Opção | Pros | Contras | Decisão |
|---|---|---|---|
| **simple-git-hooks** | Zero postinstall mágico; KISS | Sem plugin system | **escolhido** |
| husky | Padrão de indústria | Postinstall + config dispersa | rejeitado |
| lefthook | Performante; YAML | Tool em Go separada do Node | rejeitado |

## Consequências

**Positivas**
- Stack inteira **TS-native + Rust-binary** — rápida.
- Apenas 3 ferramentas principais (vitest + biome + gitleaks) cobrem 5 camadas de QA.
- vitest `projects` mode dispensa configs duplicadas por package.
- zod confirmado resolve pendência aberta em ADR-0004.
- commitlint + simple-git-hooks materializam ADR-0017 sem cerimônia extra.

**Negativas / trade-offs**
- biome é mais novo (v1.9 estável; 2.0 em transição) — ecossistema de plugins menor.
- Se biome perder momentum, migração para ESLint+Prettier custa.
- gitleaks gera falsos positivos em base64; allowlist requer manutenção.

**Mitigações**
- Usar regras genéricas em biome (não exclusivas) facilita migração futura.
- Pin de versões em devDeps; update via PR consciente.
- Allowlist gitleaks documentada como "exceção registrada", não "ruído permanente".

## Pendências (para Sub-fase 2.1)

- Configurar `vitest.config.ts` raiz com projects mode.
- Configurar `biome.json` raiz.
- Configurar `.gitleaks.toml` com allowlist.
- Configurar `simple-git-hooks` em pre-commit.
- Adicionar zod como dep em `@cao/shared-schemas`.
- Atualizar `STACK_RULES.md` seção 7 (referência a este ADR) e seção 4 (zod confirmado) — **somente após aceitação**.
- Atualizar `ADR-0004` para apontar "pendência resolvida em ADR-0006" — **somente após aceitação**.

## Conflitos com ADRs anteriores

Nenhum conflito. Esta decisão **resolve** uma pendência explícita do ADR-0004 (zod) sem alterar nada de ADRs 0001–0005.
