# src/prompts/

Prompts versionados usados pelo `product-feed-seo`. Cada prompt vive em arquivo markdown com frontmatter.

## Por que aqui (e não em `@cao/skills`)

- Skills são unidades reutilizáveis cross-agente. Prompts deste serviço são **específicos do pipeline de feed** — não vale extrair sem segunda razão.
- Manter perto da pipeline facilita iteração + A/B test (basta novo arquivo).

## Formato

```markdown
---
id: title-rewrite
version: 1
created_at: 2026-05-23
description: Reescreve title para GMC + SEO PDP, dado dados do SKU e signals
inputs: [sku, locale, brand_tone, char_limits, signals]
output_schema: { title: string, justification: string }
model_default: claude-sonnet-4-6
---

## System

Você reescreve títulos de produto para Google Merchant Center e SEO de PDP.
...

## Constraints

- Respeitar `char_limits.title` (default 150).
- Nunca incluir promoções ("50% off") no título.
- Incluir gênero quando categoria for apparel.

## Output format

JSON conforme output_schema.
```

## Prompts previstos

| ID | Função |
|---|---|
| `title-rewrite` | reescreve title |
| `description-rewrite` | reescreve description (long-form) |
| `attribute-fill` | infere atributos faltantes (gender, age_group, color) |
| `localize-copy` | adapta para outro locale |
| `remediate-disapproval` | corrige campo apontado por motivo de disapproval |

## Status

Diretório criado, sem prompts populados. Primeiros prompts virão na Fase 9 — derivados conceitualmente de `feedgen`.
