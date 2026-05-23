---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-23T00:00:00Z
tags: [decisions, adr]
source: human:incluobrasil
confidence: 1.0
---

# Decision Index

**Para que serve:** visão única e atualizada de toda decisão arquitetural — aceita ou aberta. Quando aparecer uma dúvida do tipo "isso já foi decidido?", a resposta está aqui.

**Como usar:** consultar antes de propor mudança estrutural. Atualizar quando ADR muda de status (bater `updated_at`). ADRs detalhados ficam em [`02_architecture/adr/`](../../../../02_architecture/adr/) — aqui é só o índice operacional.

**Output que gera:** lista única do que está decidido, do que está pendente, e do que cada decisão impacta.

**Fonte primária:** [DECISIONS.md](../../../../00_meta/DECISIONS.md) (categoria **oficial** — ver [source-of-truth.md](source-of-truth.md)). Este arquivo é a **lente operacional** curada do índice oficial. Em conflito, oficial vence.

## ADRs aceitos

| # | Título | Aceito em | Impacto (área) |
|---|---|---|---|
| [ADR-0001](../../../../02_architecture/adr/ADR-0001-monorepo-structure.md) | Estrutura do monorepo | inicial | layout do repo |
| [ADR-0002](../../../../02_architecture/adr/ADR-0002-upstream-policy.md) | Política de upstreams | inicial | `01_upstreams/` é read-only |
| [ADR-0003](../../../../02_architecture/adr/ADR-0003-agent-layer-strategy.md) | Estratégia da camada de agentes | inicial | tiers, runtime, skills |
| [ADR-0004](../../../../02_architecture/adr/ADR-0004-shared-packages.md) | Packages compartilhados | inicial | shared-types/schemas/config |
| [ADR-0005](../../../../02_architecture/adr/ADR-0005-memory-vault.md) | Layout do vault de memória | inicial | `07_memory/vault/` markdown-first |
| [ADR-0006](../../../../02_architecture/adr/ADR-0006-qa-stack.md) | Stack de QA | 2026-05-23 | vitest + biome + gitleaks + zod + commitlint |
| [ADR-0009](../../../../02_architecture/adr/ADR-0009-package-scope.md) | Scope npm | 2026-05-23 | `@cao/` confirmado |
| [ADR-0017](../../../../02_architecture/adr/ADR-0017-commit-conventions.md) | Convenção de commits | 2026-05-23 | Conventional Commits 1.0.0 |

## ADRs em queue (decisões abertas)

Ordem = ordem de necessidade na macro-fase 2.

| # | Tópico | Default proposto | Bloqueia | Quem decide |
|---|---|---|---|---|
| ADR-0007 | Runtime alvo de agentes (TS vs Python) | TS via LangGraph JS | Fase 7 (`@cao/runtime` real) | tech lead |
| ADR-0008 | Worker queue | BullMQ + Redis | Fases 8–11 (apps headless) | tech lead |
| ADR-0010 | DB de aplicação | Postgres prod / SQLite dev | Fase 8 produção | tech lead |
| ADR-0011 | Estratégia para `feedgen` (Python) | Port TS + sidecar opcional | Fase 9 (feed-service) | tech lead |
| ADR-0012 | Provedor de reviews default | Judge.me + Shopify nativo | Fase 11 (review-service) | produto |
| ADR-0013 | PostHog cloud vs self-host | Cloud EU | Fase 10 (analytics) | produto + ops |
| ADR-0014 | Provedor de mídia (image+video) creative-ops | a definir | Fase 11 (creative em escala) | produto |
| ADR-0015 | Object storage | a definir (S3 / R2 / GCS) | Fase 11 (creative em escala) | ops |
| ADR-0016 | Secret manager para prod | a definir (Doppler/AWS SM/etc.) | Fase 12 (release v1) | ops |

## Impacto por área (síntese)

| Área | Decidido | Aberto |
|---|---|---|
| Layout / estrutura | ADR-0001, 0002, 0009 | — |
| Agentes / runtime | ADR-0003 | **ADR-0007** |
| Packages | ADR-0004, 0009 | — |
| Memória | ADR-0005 | — |
| QA / lint / commits | ADR-0006, 0017 | — |
| Infra app (DB, queue) | — | **ADR-0008, 0010** |
| Feed / Python | — | **ADR-0011** |
| Reviews | — | ADR-0012 |
| Analytics | — | ADR-0013 |
| Creative / mídia | — | ADR-0014, 0015 |
| Security / segredos | — | **ADR-0016** |

**Bold = bloqueador imediato** das próximas sub-fases.

## Política

- Toda mudança estrutural → ADR.
- ADR superseded permanece — não apagar.
- Numeração crescente; gaps permitidos.
- Default NÃO é decisão. Vira ADR só com aceitação consciente.
