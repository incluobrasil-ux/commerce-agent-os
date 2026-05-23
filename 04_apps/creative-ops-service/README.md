# creative-ops-service

Fábrica de criativos (copy + imagens + vídeos). Workloads pesados via provedores externos de mídia. **Inspirado em [`agency-ai-solutions/ad-factory-agent`](https://github.com/agency-ai-solutions/ad-factory-agent)** (padrão de pipeline brief → generate → validate → store) sem ser fork.

## Stack

- Node 20+ / TypeScript
- Worker pool com concorrência limitada (chamadas a provedores de mídia são caras)
- Object storage para assets gerados (CDN — provedor a definir: S3 / R2 / GCS)

## Estrutura

```
creative-ops-service/
├─ src/
│  ├─ server.ts             health + boot
│  ├─ workers/              consumidores da fila (generate-asset, store-asset, refresh-aggregate)
│  ├─ providers/            adapters para provedores de mídia (image/video gen)
│  ├─ pipelines/            brief → generate → validate → store → index
│  └─ orchestration/        invocações ao @cao/runtime / creative-copy-assets
├─ package.json
├─ tsconfig.json
├─ .env.example
└─ .gitignore
```

## Pipelines

```
[orchestrator → creative-copy-assets]
            │ brief + outputs_required[]
            ▼
[creative-ops-service.pipeline:brief]
    ├─ load-brand-style (memory)
    ├─ skills.copy / skills.image-prompts (@cao/skills)
    └─ generate (provedores via src/providers/)
            │
            ▼
[validate]
    ├─ brand_validator (@cao/guardrails)
    ├─ technical (dimensões, formato, peso)
    └─ moderation (policy do provedor)
            │
            ▼
[store]
    ├─ upload para object storage (S3/R2/GCS)
    └─ index em DB (asset_id, tenant, brief_ref, channel, format, locale)
            │
            ▼
[return]
    assets[] + provenance[] → para orchestrator → governance-risk-qa
```

## Providers de mídia (adapters internos, em `src/providers/`)

Cada provider implementa uma interface única `MediaProvider`. Lista inicial planejada:

| Provider | Cobre | Pricing | Status |
|---|---|---|---|
| (a confirmar) | image | a definir | pendente decisão |
| (a confirmar) | video | a definir | pendente decisão |

**Provider final é decisão pendente** — opções a considerar:
- Provedores comerciais (qualidade alta, custos por imagem/vídeo).
- Self-hosted (controle total, complexidade de ops).

Nenhuma escolha tomada. ADR a escrever quando avaliarmos custo × qualidade.

## Object storage

A definir entre S3, Cloudflare R2 ou Google Cloud Storage. Critérios:
- Custo por GB armazenado + bandwidth saindo.
- Latência de upload (workloads de batch).
- CDN integrada (R2 + Cloudflare; CloudFront para S3; CDN do Google para GCS).

URL pública dos assets sempre via CDN — nunca direto do bucket.

## Deps internas

- `@cao/runtime`, `@cao/llm`, `@cao/skills`, `@cao/guardrails`, `@cao/observability`
- `@cao/shared-types`, `@cao/shared-schemas`, `@cao/shared-config`
- (futuro) `05_integrations/higgsfield` — para skills de copy se a opção pesar

## Conexão com o resto

| Quem | Como consome |
|---|---|
| `traffic-campaigns` | busca `asset_id` por initiative_id para subir em ads |
| `design-ux-localization` | busca `asset_id` por scope para PDP/coleção |
| `catalog-feed-ops` | usa URLs de imagem aprovadas no feed Google MC |
| `shopify-admin-app` | UI de revisão humana antes de aprovar variantes |

## Não fazer aqui

- Decidir estratégia de marketing. `marketing-director` faz isso.
- Aplicar criativos (publicar em ad platforms, atualizar PDP). Os consumidores acima fazem.
- Lógica de domínio profunda. `creative-copy-assets` faz.

## Status

Esqueleto criado. Sem implementação. Bloqueios:
- Decisão de provedor de mídia.
- Decisão de object storage.
- `@cao/runtime` mínimo (Fase 7).

## Pendências

- ADR de provedores de mídia.
- ADR de object storage.
- Definir matriz de formatos suportados por canal (catálogo declarativo em `src/providers/formats.yaml` quando implementar).
