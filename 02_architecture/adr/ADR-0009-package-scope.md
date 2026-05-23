# ADR-0009 — Scope npm dos pacotes internos

- **Data:** 2026-05-23
- **Status:** aceita
- **Supersede:** —
- **Relacionados:** STACK_RULES.md seção 2 (Naming), ADR-0003 (agent layer)

## Contexto

Desde Fase 3a, todos os packages do workspace usam scope `@cao/*` **de fato**:
- 12 packages em `06_packages/` (`@cao/core`, `@cao/runtime`, `@cao/memory`, `@cao/guardrails`, `@cao/skills`, `@cao/llm`, `@cao/config`, `@cao/observability`, `@cao/shopify-client`, `@cao/shared-types`, `@cao/shared-schemas`, `@cao/shared-config`).
- 7 adapters em `05_integrations/` (`@cao/integration-shopify`, `@cao/integration-google-merchant`, `@cao/integration-review-apps`, `@cao/integration-higgsfield`, `@cao/integration-posthog`, demais stubs).
- Apps em `04_apps/` (`@cao/shopify-admin-app`, `@cao/merchant-service`, `@cao/feed-service`, `@cao/review-service`, `@cao/analytics-service`, `@cao/creative-ops-service`).
- Todos com `"private": true`.

`STACK_RULES.md` seção 2 já cita `@cao/<name>`. `DECISIONS.md` lista em queue como "confirmar scope `@cao/`".

Nome do projeto: **commerce-agent-os** → sigla **CAO**.

## Decisão

Adotar **`@cao/`** como scope npm de todos os packages internos.

**Convenções de subname:**

| Caso | Padrão | Exemplo |
|---|---|---|
| Package genérico em `06_packages/` | `@cao/<nome-kebab>` | `@cao/core`, `@cao/runtime` |
| Package compartilhado (type-time / schema / config) | `@cao/shared-<área>` | `@cao/shared-types`, `@cao/shared-schemas`, `@cao/shared-config` |
| Adapter de integração em `05_integrations/` | `@cao/integration-<provider>` | `@cao/integration-shopify` |
| Serviço headless em `04_apps/` | `@cao/<serviço>-service` | `@cao/merchant-service` |
| App embedded em `04_apps/` | `@cao/<app-name>` | `@cao/shopify-admin-app` |
| Tema Shopify (não é pnpm package) | n/a — Liquid | — |

Todos `"private": true` enquanto monorepo for interno.

**Reservar `@cao` no npm** é decisão acoplada mas separável:
- Verificar disponibilidade (5 min).
- Reservar agora se disponível (free; protege futuro mesmo com private packages).
- Se ocupado: fallback `@commerce-agent-os/` (aceitamos perda de brevidade).

## Alternativas consideradas

| Opção | Pros | Contras | Decisão |
|---|---|---|---|
| **`@cao/`** | Curto (4 chars); mnemônico (sigla); agrupa visualmente; já em uso em 25+ `package.json` | Pode estar ocupado no npm | **escolhido** |
| `@commerce-agent-os/` | Explícito; zero ambiguidade | Verboso (24 chars em todo import) | rejeitado (fallback) |
| `@caos/` | Reflete sigla expandida | "caos" = "chaos" em PT — conotação negativa | rejeitado |
| `@cag/` | Curto | Ambíguo (Commerce Agent G???) | rejeitado |
| Sem scope (`cao-core`) | Funciona em npm sem registro | Polui namespace global; sem grouping | rejeitado |
| `@<personal-username>/` | Reservado por usuário pessoal | Não escala; transferência futura é fricção | rejeitado |

## Consequências

**Positivas**
- Coerência com Fases 3a–6 mantida — zero migração necessária.
- Imports curtos: `import { ... } from '@cao/runtime'`.
- Convenção de subname distingue tipos de package por simples leitura.
- Alinhado com STACK_RULES.md seção 2.

**Negativas / trade-offs**
- Se decidirmos publicar publicamente no futuro, **precisamos reservar `@cao` no npm** antes de outro grupo o registrar.
- Risco residual: alguém já registrou `@cao` ou conflito com package privado de terceiros.

**Mitigações**
- Verificar disponibilidade durante PR deste ADR (5 min).
- Reservar agora (free) mesmo com private packages.
- Fallback documentado: `@commerce-agent-os/` se indisponível.

## Pendências

- Verificar disponibilidade de `@cao` em https://www.npmjs.com/settings/cao.
- Decidir se reservaremos **agora** ou postergaremos para release v1.
- Atualizar `STACK_RULES.md` seção 2 (Naming) para referenciar este ADR (substituir "confirmar antes de publicar") — **somente após aceitação**.

## Conflitos com ADRs anteriores

Nenhum. Este ADR **formaliza** uma convenção já em uso desde Fase 3a (referenciada em ADR-0003 e ADR-0004 implicitamente via nomes `@cao/runtime`, `@cao/shared-types` etc.).
