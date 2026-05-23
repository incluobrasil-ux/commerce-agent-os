# Vault template

Estrutura canônica de um tenant. **Não é um tenant real** — é a referência usada para provisionar novos tenants.

Quando um tenant novo é cadastrado, `@cao/memory` clona esta estrutura para `vault/<tenant_id>/`.

## Buckets

| Bucket | Conteúdo | Escrita |
|---|---|---|
| `facts/` | Fatos estáveis sobre o tenant (marca, ICP, restrições, voz). Promovidos. | `learning-memory-curation` |
| `working/` | Working memory recente: notas, esboços, sinais. Curated periodicamente. | maioria dos agentes |
| `voc/` | Voice of customer extraída de reviews/suporte. | `reviews-ops` |
| `competitor-benchmark/<competitor>/<timestamp>.md` | Snapshots por competidor. Imutáveis. | `competitor-benchmark` |
| `audit/` | Append-only de ações destrutivas e decisões de governance. | `@cao/observability` (todos via runtime) |

## Frontmatter padrão

Cada arquivo `.md` carrega frontmatter YAML mínimo:

```markdown
---
created_at: 2026-05-23T14:00:00Z
updated_at: 2026-05-23T14:00:00Z
tags: [pricing, summer-2026]
source: agent:product-offer
confidence: 0.7
---

# Título humano

Corpo em markdown.
```

Campos:
- `created_at`, `updated_at` — ISO 8601 em UTC.
- `tags` — array de strings curtas em kebab-case.
- `source` — `agent:<name>` | `human:<id>` | `import:<system>`.
- `confidence` — 0..1. Obrigatório em `facts/`.

## Naming de arquivo

- `kebab-case-slug.md`, ≤ 80 chars.
- Data **não** vai no nome (vive no frontmatter), exceto em `competitor-benchmark/<competitor>/<timestamp>.md` (onde o timestamp é parte do contrato).

## Status

Template vazio — apenas `.gitkeep` em cada bucket. Implementação real do código que opera sobre essa estrutura virá em `@cao/memory` (Fase 7).
