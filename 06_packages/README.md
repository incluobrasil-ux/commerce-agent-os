# 06_packages

Bibliotecas internas reutilizáveis. Cada subpasta é um pacote pnpm publicado apenas dentro do workspace.

> **Status:** apenas contratos. Nenhuma implementação ainda.

## Convenção

- Nome convencional: `@cao/<name>` (a definir scope).
- Cada package expõe API tipada via `src/index.ts`.
- Packages **não** dependem de apps nem de agentes.
- Packages **podem** depender de adapters (`05_integrations/*`) somente se a abstração precisar — preferir injeção.

## Packages previstos

### shared-types
- **Função:** tipos canônicos do domínio (type-time apenas, zero custo runtime).
- **Consumido por:** todos.
- **Ver:** [ADR-0004](../02_architecture/adr/ADR-0004-shared-packages.md).

### shared-schemas
- **Função:** schemas runtime (zod) que espelham `shared-types`; validação no boundary.
- **Consumido por:** adapters, runtime, guardrails, apps.

### shared-config
- **Função:** nomes canônicos de env vars + schemas de config/feature flags (sem I/O).
- **Consumido por:** `@cao/config`, adapters, apps.

### core
- **Função:** tipos compartilhados, erros base, utilidades puras (clock, ids, retry).
- **Consumido por:** todos.
- **Upstream:** —.

### config
- **Função:** carregamento e validação de variáveis de ambiente; defaults por ambiente.
- **Consumido por:** apps + adapters.
- **Upstream:** —.

### llm
- **Função:** abstração sobre provedores de LLM (Anthropic, OpenAI, Gemini). Streaming, retries, token accounting.
- **Consumido por:** agentes via `runtime`, apps que precisarem chamar LLM direto.
- **Upstream:** SDKs oficiais.

### runtime
- **Função:** wrapper sobre LangGraph. Define o contrato de agente, executor, checkpoint, eventos.
- **Consumido por:** apps que executam agentes.
- **Upstream:** `langchain-ai/langgraph` (dependência via SDK oficial; **não** fork).

### memory
- **Função:** memória persistente markdown-first. CRUD + busca + tenancy.
- **Consumido por:** `runtime`, agentes Tier 0.
- **Upstream:** `basicmachines-co/basic-memory` (base operacional adaptada); `obsidian-agent-memory-skills` (inspiração de skills).

### guardrails
- **Função:** validação de input/output, allow-list de ações, audit log.
- **Consumido por:** `runtime` (enforcement automático em tools).
- **Upstream:** `affaan-m/agentshield` (base operacional).

### skills
- **Função:** catálogo de skills reutilizáveis (copy, validação, geração).
- **Consumido por:** agentes via `runtime`.
- **Upstream:** `higgsfield-ai/skills` (principal, cherry-pick); `FlatNineOrg/ecommerce-skills`, `coreyhaines31/marketingskills` (cherry-pick).

### observability
- **Função:** init de PostHog + tracing + métricas; convenções de naming de eventos.
- **Consumido por:** apps + `runtime`.
- **Upstream:** `posthog-js` / `posthog-node` (SDK).

### shopify-client
- **Função:** utilitários compartilhados sobre o adapter `05_integrations/shopify` (caches, helpers de paginação GraphQL). Mantém o adapter fino.
- **Consumido por:** apps Shopify-conscientes.
- **Upstream:** —.

## Mapa para upstreams

| Package | Upstream | Tipo |
|---|---|---|
| runtime | langgraph | dependência (SDK pinada) |
| memory | basic-memory | base operacional |
| memory | obsidian-agent-memory-skills | inspiração |
| guardrails | agentshield | base operacional |
| skills | higgsfield-skills, ecommerce-skills, marketingskills | base operacional (cherry-pick) |
| observability | posthog (SDK) | dependência |
| llm | OpenAI/Anthropic/Gemini SDKs | dependência |
| core, config, shopify-client | — | autoral |

## Decisões em aberto

- Scope npm do workspace (`@cao/`? outro?).
- Bundler / tsconfig padrão para libs.
- Política de breaking changes inter-package.
