# Project map

Mapa de domínio e camadas do commerce-agent-os. Documenta **o quê existe** e **como se relaciona**, não como é implementado.

## Visão de camadas

```
┌──────────────────────────────────────────────────────────────────┐
│                       04_apps  (consumidores)                    │
│ shopify-theme  shopify-admin-app  merchant-svc  feed-svc         │
│ review-svc     analytics-svc      creative-ops-svc               │
└──────┬───────────────────────────────────────────────────────────┘
       │ invocam
       ▼
┌──────────────────────────────────────────────────────────────────┐
│                       03_agents  (cognição)                      │
│ Tier 0 — meta:  orchestrator-master, memory-context,             │
│                 governance-risk-qa, repo-auditor,                │
│                 learning-memory-curation                         │
│ Tier 1 — research: market-intelligence, competitor-benchmark     │
│ Tier 2 — produto: product-offer, design-ux-localization          │
│ Tier 3 — marketing: marketing-director, creative-copy-assets,    │
│                     traffic-campaigns                            │
│ Tier 4 — catálogo: product-feed-seo, catalog-feed-ops,           │
│                    merchant-compliance                           │
│ Tier 5 — pós-venda: reviews-ops                                  │
│ Tier 6 — analytics: analytics-optimization                       │
└──────┬───────────────────────────────────────────────────────────┘
       │ usam
       ▼
┌──────────────────────────────────────────────────────────────────┐
│                      06_packages  (libs internas)                │
│ runtime  memory  guardrails  skills  llm  observability          │
│ core     config  shopify-client                                  │
└──────┬───────────────────────────────────────────────────────────┘
       │ encapsulam
       ▼
┌──────────────────────────────────────────────────────────────────┐
│                  05_integrations  (adapters externos)            │
│ shopify  google-merchant  google-ads*  brightdata  posthog       │
│ higgsfield                                                       │
└──────┬───────────────────────────────────────────────────────────┘
       │ falam com
       ▼
┌──────────────────────────────────────────────────────────────────┐
│ Provedores externos: Shopify, Google MC, Google Ads,             │
│ Bright Data, PostHog, Higgsfield, LLM providers                  │
└──────────────────────────────────────────────────────────────────┘

01_upstreams/ — referências read-only (langgraph, dawn, shopify-app-template,
                feedgen, ad-factory, basic-memory, higgsfield, etc.)
07_memory/    — memória operacional (artefatos markdown dos agentes)
08_data/      — fixtures, dumps, datasets
09_prompts/   — prompts operacionais por fase
10_ops/       — scripts, CI, runners (incl. higgsfield-cli wrapper)
11_tests/     — testes de integração e e2e
12_reports/   — saídas de auditoria e execução
```

\* google-ads postergado (ver `02_architecture/integrations/google-ads.md`).

## Princípios

1. **Direção do fluxo:** apps → agentes → packages → integrations → provedores. Não atravessar camadas para baixo (app não fala direto com provedor).
2. **Upstreams ≠ código autoral.** `01_upstreams/` é read-only. Adaptações vivem em `06_packages/` ou `05_integrations/`.
3. **Skills são unidades reutilizáveis.** Gerenciadas via `06_packages/skills` (consolidando Higgsfield + e-commerce + marketing).
4. **Memória é markdown-first.** `07_memory/` é a verdade; embeddings/índices são derivações.
5. **Cada agente é stateless em si**; estado vive em runtime + memory.

## Catálogos por camada

- Agentes: [../../03_agents/README.md](../../03_agents/README.md)
- Apps: [../../04_apps/README.md](../../04_apps/README.md)
- Integrações: [../../05_integrations/README.md](../../05_integrations/README.md)
- Packages: [../../06_packages/README.md](../../06_packages/README.md)

## Relação com upstreams estudados

Dependência prática (consumo direto via SDK/lib ou base operacional adaptada):
- langgraph → `06_packages/runtime`
- basic-memory → `06_packages/memory`
- shopify-app-template-react-router → `04_apps/shopify-admin-app`
- merchant-api-samples → `05_integrations/google-merchant`
- higgsfield-skills + higgsfield-cli → `06_packages/skills` + `10_ops/higgsfield-cli`
- posthog (SDK) → `05_integrations/posthog`
- feedgen → `03_agents/product-feed-seo` (lógica adaptada)
- ad-factory-agent → `03_agents/creative-copy-assets` (lógica adaptada)
- agentshield → `06_packages/guardrails`

Inspiração (estudar, não copiar):
- dawn (UI/UX de tema), gstack (DX), caveman (padrões de agente),
  ECC (domínio), obsidian-agent-memory-skills (skills de memória),
  feedx (experimentação), adios (criativo de ads),
  ecommerce-skills, marketingskills (catálogos de skills).

## Pendências de domínio

- Definir contratos entre `orchestrator-master` e agentes Tier 1–6.
- Definir formato canônico de evento de produto (input para feed/SEO/copy).
- Definir formato canônico de evento analítico (PostHog → catalog).
