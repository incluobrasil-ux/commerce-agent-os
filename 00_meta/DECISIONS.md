# Decisions — índice de ADRs

Índice mestre de Architecture Decision Records. Os ADRs detalhados vivem em [`../02_architecture/adr/`](../02_architecture/adr/) — um arquivo por decisão.

- Versão: 0.5
- Data: 2026-05-23
- Status: vivo

> Substitui `decisions.md` (lowercase) deletado. Os ADR-001/002 antigos inline foram superseded pelos arquivos completos em `02_architecture/adr/`.

## Status pós-Sub-fase 2.0

**8 ADRs aceitos** cobrem decisões estruturais (layout, upstream, agentes, shared packages, vault) **e a stack operacional mínima** (QA, scope `@cao/`, commits).

**Sub-fase 2.0 concluída** — ADR-0006, 0009, 0017 aceitos em 2026-05-23. Sub-fase 2.1 (bootstrap funcional) destravada.

**7 ADRs em queue** (apenas default proposto, sem arquivo) — bloqueiam **execução real** das próximas sub-fases. Severidade em [`../12_reports/audits/phase-1-gap-analysis.md`](../12_reports/audits/phase-1-gap-analysis.md).

## Formato

Cada ADR é um arquivo `ADR-NNNN-slug.md` em `02_architecture/adr/`. Contém:

```
- Data
- Status: proposta | aceita | revogada | superseded por ADR-XXXX
- Contexto
- Decisão
- Consequências
```

Numeração: **4 dígitos zero-padded** (ADR-0001, não ADR-1).

## Índice

| # | Título | Status | Resumo |
|---|---|---|---|
| [ADR-0001](../02_architecture/adr/ADR-0001-monorepo-structure.md) | Estrutura do monorepo | aceita | Pastas raiz numeradas `00_meta` … `12_reports` |
| [ADR-0002](../02_architecture/adr/ADR-0002-upstream-policy.md) | Política de upstreams | aceita | `01_upstreams/` read-only; 3 métodos de ingestão |
| [ADR-0003](../02_architecture/adr/ADR-0003-agent-layer-strategy.md) | Estratégia da camada de agentes | aceita | Tiers, runtime único, skills, guardrails enforced |
| [ADR-0004](../02_architecture/adr/ADR-0004-shared-packages.md) | Packages compartilhados | aceita | `shared-types`, `shared-schemas`, `shared-config` vs `core`/`config` |
| [ADR-0005](../02_architecture/adr/ADR-0005-memory-vault.md) | Layout do vault de memória | aceita | `07_memory/vault/<tenant>/...` markdown-first |
| [ADR-0006](../02_architecture/adr/ADR-0006-qa-stack.md) | Stack de QA (testes + lint + secret-scan + zod) | aceita | vitest + biome + gitleaks + zod + commitlint + simple-git-hooks |
| [ADR-0007](../02_architecture/adr/ADR-0007-agent-runtime.md) | Runtime alvo dos agentes | aceita | TS host; impl própria + LangGraph JS como referência de design |
| [ADR-0009](../02_architecture/adr/ADR-0009-package-scope.md) | Scope npm dos pacotes internos | aceita | `@cao/` confirmado + convenções de subname |
| [ADR-0017](../02_architecture/adr/ADR-0017-commit-conventions.md) | Convenção de commits | aceita | Conventional Commits 1.0.0 + tipos + scopes + commitlint |

## ADRs em queue (não decididos)

Tabela com proposta default e o que cada um bloqueia. **Ordem sugerida** = ordem de necessidade na macro-fase 2.

| # | Tópico | Default proposto | Bloqueia |
|---|---|---|---|
| ADR-0008 | Worker queue | BullMQ + Redis | Fases 8–11 (todos os apps headless) |
| ADR-0010 | DB de aplicação | Postgres compartilhado para prod; SQLite local em dev | Fase 8 prod (release) |
| ADR-0011 | Estratégia para `feedgen` (Python) | Port TS de heurísticas; sidecar opcional para parte complexa | Fase 9 (feed-service) |
| ADR-0012 | Provedor de reviews default | Judge.me + Shopify nativo (fallback) | Fase 11 (review-service) |
| ADR-0013 | PostHog cloud vs self-host | Cloud EU | Fase 10 (analytics) |
| ADR-0014 | Provedor de mídia (image + video) para creative-ops | a definir; comparação custo × qualidade | Fase 11 (creative em escala) |
| ADR-0015 | Object storage | a definir entre S3/R2/GCS | Fase 11 (creative em escala) |
| ADR-0016 | Secret manager para prod | a definir entre Doppler / AWS SM / outro | Fase 12 (release v1) |

> ADR-0006, 0009, 0017 e ADR-0007 saíram da queue — **aceitos** em 2026-05-23. Ver índice acima.

**Default não é decisão.** É proposta racional baseada no audit + research. Cada um vira ADR com o status `aceita` apenas com confirmação consciente.

## Política

- Toda mudança estrutural do projeto → ADR.
- ADR superseded permanece no histórico — não apagar.
- Numeração crescente; gaps permitidos (revogados não reaproveitam número).
- ADR em queue não bloqueia desenvolvimento que não dependa dele — código pode evoluir com placeholder até ADR ser aceito.

## Notas operacionais

### Disponibilidade do scope `@cao` no npm (verificado 2026-05-23)

Consulta a `https://registry.npmjs.org/-/v1/search?text=scope:cao` retornou **0 pacotes publicados**. Scope **aparenta estar disponível** — sem packages públicos sob `@cao` no registry.

Caveat: "0 pacotes publicados" não garante "user/org `cao` inexistente" (npm 403 em `/~cao` impede checagem via WebFetch). Reserva definitiva só com tentativa de claim via `npm` CLI.

Reserva ainda não foi feita. Recomendado **antes** de qualquer publicação pública (release v1) para evitar squatting. Enquanto monorepo for interno (`"private": true` em todos os `package.json`), a não-reserva não impede uso local.

Pendência rastreada em ADR-0009: "decidir se reservaremos agora ou postergaremos para release v1".
