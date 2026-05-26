---
updated_at: 2026-05-26T15:00:00Z
tags: [global, decisions]
---

# Decision index — global

ADRs canônicos em `02_architecture/adr/`. Aqui só o índice + decisões operacionais cross-tenant que não viraram ADR.

## ADRs aceitos (8)

Ver `02_architecture/adr/` e `00_meta/DECISIONS.md` (mantido em sync). Resumo:

| # | Tema | Status |
|---|---|---|
| 0002 | Upstream policy (read-only `01_upstreams/`) | aceito |
| 0003 | Tier classification dos agentes | aceito |
| 0005 | Memory provider (filesystem vault) | aceito |
| 0006 | QA stack | aceito |
| 0009 | Smoke convention | aceito |
| 0011 | feedgen strategy (sidecar Python) | proposto |
| 0013 | PostHog cloud vs self-host | proposto |
| 0017 | Conventional Commits + commitlint | aceito |

## Decisões operacionais (não-ADR)

| Data | Decisão | Razão |
|---|---|---|
| 2026-05-25 | Path canônico: `vault/tenants/<t>/[stores/<s>/]` | Memory + brain-bridge consolidados; segmento `tenants/` reservado para isolar outros namespaces (`global/`, `projects/`, `_template/`). |
| 2026-05-25 | `--tenant` obrigatório em agentes; `--store` opcional ativa store-scoped | Multi-tenant safety por construção (`assertTenantContext`/`assertTenantStoreContext`). |
| 2026-05-25 | `defaultGmcCategoryId=3793` para catálogos de brinquedos educacionais | Override de severidade `gtin:missing` (medium → low); descoberto em audit real Incluo. |
| 2026-05-26 | `max_tokens` default LLM = 8192 | Outputs estruturados Tier-2 ultrapassam 1024/4096 frequentemente. |
| 2026-05-26 | `culturalFlags`/`riskFlags` aceitam strings OU objetos coerced (z.preprocess) | Claude às vezes entrega objetos estruturados quando contexto sugere taxonomia. |

## Quando virar ADR

Quando uma decisão acima envolver: novo provider externo, mudança estrutural de package, novo padrão arquitetural, ou afetar mais de 5 arquivos → abrir ADR em `02_architecture/adr/`.
