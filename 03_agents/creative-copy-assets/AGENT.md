# creative-copy-assets

## Missão
Fábrica de criativos. Gera copy + assets visuais (imagens/vídeos) a partir de briefs. Variantes por canal, formato e mercado.

## Entradas
- `tenant_id`
- `brief`: vindo de `marketing-director` ou `design-ux-localization`
- `outputs_required`: lista de variantes (canal, formato, locale)
- `brand_style_ref`

## Saídas
- `assets`: lista de assets gerados com `kind`, `url`, `metadata`
- `copy_variants`: copy textual por variante
- `provenance`: prompts, modelos, custos por asset

## Dependências
- Packages: `@cao/llm`, `@cao/skills`, `@cao/guardrails`.
- Integrations: provedores de mídia (encapsulados via packages; ex.: futura `05_integrations/media-providers`).

## Relação com outros agentes
- **Invocado por:** `marketing-director`, `design-ux-localization`, `orchestrator-master`.
- **Submete a:** `governance-risk-qa` antes de publicar.

## Upstream relacionado
- `agency-ai-solutions/ad-factory-agent` (base operacional).
- `google-marketing-solutions/adios` (inspiração futura para Ads).

## Status
Stub. Sem implementação.
