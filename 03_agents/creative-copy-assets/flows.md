# Flows — creative-copy-assets

Fábrica de criativos: gera copy + assets visuais (imagens/vídeos) a partir de briefs. **Não publica** — entrega assets + `provenance` para `creative-ops-service` armazenar e os consumidores (traffic-campaigns, design-ux-localization, catalog-feed-ops) buscarem.

## Fluxo 1 — Brief vindo de marketing-director (matriz canal × formato × locale)

**Trigger:** `orchestrator-master` recebe `plan[i].creative_brief` aprovado.

```
[1] receber brief + outputs_required[] + brand_style_ref
    │
    ▼
[2] memory_read brand_style_ref:
    │   tom, vocabulário banido, paleta, mood, exemplos prévios aprovados
    │
    ▼
[3] para cada variante em outputs_required[]:
    │   skills_copy: heurísticas/templates específicos por canal+formato
    │     (ex.: search-ad-headline ≤ 30 chars; email-hero punchline curta)
    │   llm_compose: gera variante de copy
    │   brand_validator: confere contra brand_style_ref (palavras banidas, tom)
    │
    ▼
[4] para variantes que pedem visual:
    │   media_image_gen ou media_video_gen via @cao/llm (provider encapsulado)
    │   asset upload preview (creative-ops-service guarda final)
    │
    ▼
[5] populate provenance[] por asset:
    │   model, prompt usado, custo USD, asset_id
    │
    ▼
[6] retornar assets + copy_variants + provenance
```

**Saída usada por:**
- `creative-ops-service` armazena assets no object storage e indexa.
- `governance-risk-qa` revisa antes de publicar (brand + PII + claims).
- Consumidores finais (traffic-campaigns, design-ux-localization, catalog-feed-ops) buscam por `asset_id`.

## Fluxo 2 — Brief vindo de design-ux-localization (PDP/coleção)

**Trigger:** `design-ux-localization` produziu `media_brief` que requer assets visuais (hero, lifestyle).

```
[1] mesmo Fluxo 1 mas com formatos PDP-específicos:
    pdp-hero, pdp-lifestyle, collection-banner
[2] respeitar dimensões do tema atual (Shopify theme settings)
[3] localizar por mercado (locale ∈ target_markets)
```

## Fluxo 3 — Replay de variante (correção)

**Trigger:** `governance-risk-qa` retornou `revise` com instruções específicas.

```
[1] receber variante original + suggested_revisions[]
[2] llm_compose com suggested_revisions injetadas no prompt
[3] brand_validator de novo
[4] retornar nova versão (mantém asset_id original com `version: 2`)
```

## Invariantes

- Toda variante pedida em `outputs_required[]` deve aparecer em `copy_variants` ou em `assets`.
- `provenance` populada **por asset**, com `cost_usd` real.
- PII em copy nunca passa do brand_validator.
- Brand violation → erro `BrandViolation` (block); nunca entrega.
- `outputs_required` fora da matriz suportada → erro (não improvisar formato).

## Desvios

| Situação | Ação |
|---|---|
| Provider de mídia indisponível | retry com backoff; depois `ProviderUnavailable` parcial |
| Budget excedido mid-batch | parar; retornar parcial; reportar quais variantes faltaram |
| Brand violation persistente | block; escalar para humano via admin-app |
| Locale fora da matriz | sinalizar para design-ux-localization "locale não preparado" |

## Inputs/Outputs canônicos

- Schemas em `contract.yaml`.
- Fixtures em `tests/fixtures/`.

## Dependências de upstream

| Upstream | Como ajuda |
|---|---|
| `agency-ai-solutions/ad-factory-agent` | **base operacional (inspiração de estrutura)** — pipeline brief → generate → validate → store. Não copiamos código; replicamos o padrão fábrica. |
| `higgsfield-ai/skills` | skills de copy reutilizáveis (cherry-pick para `@cao/skills/copy/`) |
| `higgsfield-ai/cli` | usada em dev/ops para descobrir/instalar skills (`10_ops/higgsfield-cli`) — não runtime de agente |
| `coreyhaines31/marketingskills` | skills de copy de marketing (cherry-pick) |
| `google-marketing-solutions/adios` | inspira geração de criativo para Ads quando ativarmos Google Ads (postergado) |
