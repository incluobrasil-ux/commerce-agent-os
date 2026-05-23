# 04_apps

Catálogo de aplicações executáveis. Cada subpasta é um deployable independente.

> **Status:** apenas contratos. Nenhum scaffold de código ainda.

## Convenção

- Cada app é um pacote pnpm com `package.json` próprio.
- Apps **não** falam direto com provedores externos — sempre via `05_integrations/*`.
- Apps **não** instanciam runtime de agente — invocam `06_packages/runtime`.

## shopify-theme
- **Papel:** customizações de tema/storefront (Liquid + JS).
- **Stack:** Shopify Liquid, baseado em `01_upstreams/dawn` (referência).
- **Consome:** nenhum package interno (é storefront público).
- **Relação com upstream:** inspiração em `dawn`; não fork.

## shopify-admin-app
- **Papel:** app embedded no admin Shopify; ponto de entrada principal para lojistas.
- **Stack:** React Router + Polaris + App Bridge.
- **Base em:** `01_upstreams/shopify-app-template-react-router` (cópia inicial, depois código autoral).
- **Consome:** `05_integrations/shopify`, `posthog`, `06_packages/runtime`, `observability`, `core`.

## merchant-service
- **Papel:** serviço headless que sincroniza com Google Merchant Center; agenda jobs.
- **Stack:** Node + worker (BullMQ ou similar — a definir).
- **Consome:** `05_integrations/google-merchant`, `shopify`, `06_packages/runtime`.
- **Agentes envolvidos:** `catalog-feed-ops`, `merchant-compliance`.

## feed-service
- **Papel:** serviço focado em geração/otimização de feed (separado de merchant-service para isolar carga de LLM).
- **Stack:** Node worker.
- **Consome:** `06_packages/llm`, `skills`, `05_integrations/google-merchant`.
- **Agente envolvido:** `product-feed-seo`. Lógica adaptada de `feedgen`.

## review-service
- **Papel:** ingestão e síntese de reviews; geração de respostas.
- **Stack:** Node worker.
- **Consome:** `05_integrations/shopify` (ou provedor de reviews), `06_packages/llm`.
- **Agente:** `reviews-ops`.

## analytics-service
- **Papel:** consome eventos PostHog; gera relatórios e sugestões de experimento.
- **Stack:** Node, jobs agendados.
- **Consome:** `05_integrations/posthog`, `06_packages/llm`.
- **Agente:** `analytics-optimization`.

## creative-ops-service
- **Papel:** fábrica de criativos (copy + imagens + vídeos).
- **Stack:** Node + workers GPU-bound (provedores externos).
- **Consome:** `06_packages/llm`, `skills`, provedores de mídia.
- **Agente:** `creative-copy-assets`. Lógica adaptada de `ad-factory-agent`.

## Deploy topology (preliminar)

```
shopify-admin-app   ──┐
shopify-theme       ──┤── Shopify infra
                      │
merchant-service    ──┐
feed-service        ──┤── nosso infra (containers + worker queue)
review-service      ──┤
analytics-service   ──┤
creative-ops-service──┘
```

A escolha de infra (Fly.io / Railway / próprio Kubernetes / outro) é decisão pendente em `02_architecture/`.

## Decisões em aberto

- Banco de dados de aplicação (Postgres dedicado? cada serviço tem o seu?).
- Mensageria entre serviços (fila vs HTTP direto vs eventos).
- Autenticação inter-serviço.
