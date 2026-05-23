# 03_agents

Catálogo de agentes. Cada subpasta é um agente declarativo conforme `02_architecture/adr/ADR-0003-agent-layer-strategy.md`.

> **Status:** apenas contratos. Nenhuma implementação ainda.

## Convenção de contrato

Cada agente expõe (quando implementado):
- `agent.ts` — definição declarativa.
- `README.md` — papel, entradas, saídas, tools, dependências.
- `tests/` — fixtures e testes de comportamento.

Cross-tier passa por `orchestrator-master`. Nenhum agente importa `langgraph` ou SDK externo direto — sempre via `06_packages/*` e `05_integrations/*`.

## Tier 0 — meta

### orchestrator-master
- **Papel:** raiz da árvore de invocação; decide qual agente Tier 1–6 chamar e em que ordem.
- **Entradas:** intent do app (ex.: "publicar feed otimizado") + contexto do tenant.
- **Saídas:** plano de execução e resultado consolidado.
- **Tools/deps:** `06_packages/runtime`, `memory`, `guardrails`, `observability`.

### memory-context
- **Papel:** materializa o contexto necessário para outros agentes a partir de `07_memory/`.
- **Entradas:** query/escopo.
- **Saídas:** bundle de contexto (markdown + metadados).
- **Tools/deps:** `06_packages/memory`. Inspirado em `obsidian-agent-memory-skills` (referência).

### governance-risk-qa
- **Papel:** revisa saídas críticas antes de publicação (compliance, voz, risco).
- **Entradas:** artefato candidato + política.
- **Saídas:** approve | revise | block + motivo.
- **Tools/deps:** `06_packages/guardrails` (base em `agentshield`).

### repo-auditor
- **Papel:** audita repositórios em `01_upstreams/` (já fez Fase 1; reusável para novos upstreams).
- **Entradas:** caminho de repo.
- **Saídas:** relatório em `12_reports/audits/`.
- **Tools/deps:** filesystem, `06_packages/llm`.

### learning-memory-curation
- **Papel:** higieniza `07_memory/` — consolida, deduplica, indexa.
- **Entradas:** janela temporal / escopo.
- **Saídas:** memória reescrita + índice atualizado.
- **Tools/deps:** `06_packages/memory`.

## Tier 1 — research

### market-intelligence
- **Papel:** entende mercado/categoria/tendências.
- **Tools/deps:** `05_integrations/brightdata`, `posthog` (próprio funil), `06_packages/llm`.

### competitor-benchmark
- **Papel:** monitora concorrentes (preço, catálogo, copy, reviews).
- **Tools/deps:** `05_integrations/brightdata`.

## Tier 2 — produto

### product-offer
- **Papel:** define oferta (bundling, preço, posicionamento) por SKU/coleção.
- **Tools/deps:** `05_integrations/shopify`, `06_packages/skills` (ofertas), input de Tier 1.

### design-ux-localization
- **Papel:** UX de PDP/coleção + localização de copy/preço por mercado.
- **Tools/deps:** referência em `01_upstreams/dawn`; `06_packages/skills`.

## Tier 3 — marketing

### marketing-director
- **Papel:** plano de marketing por trimestre/campanha; coordena criativo + tráfego.
- **Tools/deps:** Tier 1 output + `06_packages/skills` (marketing, ex-`marketingskills`).

### creative-copy-assets
- **Papel:** geração de copy + criativos (imagens/vídeos).
- **Tools/deps:** `06_packages/llm`, provedores de mídia (encapsulados). Adapta `ad-factory-agent`.

### traffic-campaigns
- **Papel:** orquestra campanhas (futuro: Google/Meta Ads).
- **Tools/deps:** stub — `05_integrations/google-ads` futuro.

## Tier 4 — catálogo

### product-feed-seo
- **Papel:** otimiza títulos/descrições/atributos para Google MC e SEO on-site.
- **Tools/deps:** lógica adaptada de `feedgen`. Consome `05_integrations/google-merchant` e `shopify`.

### catalog-feed-ops
- **Papel:** sincronização operacional Shopify ↔ Merchant Center (push, diffs, agendamento).
- **Tools/deps:** `05_integrations/shopify`, `google-merchant`.

### merchant-compliance
- **Papel:** garante conformidade de feed/produtos com políticas Shopify e Google MC.
- **Tools/deps:** validadores em `06_packages/skills`; referência em `merchant-api-samples`.

## Tier 5 — pós-venda

### reviews-ops
- **Papel:** coleta, sintetiza e responde reviews; gera "voz do cliente".
- **Tools/deps:** `05_integrations/shopify` (ou provedor de reviews — a definir), `06_packages/llm`.

## Tier 6 — analytics

### analytics-optimization
- **Papel:** consome PostHog + dados internos; sugere experimentos e otimizações.
- **Tools/deps:** `05_integrations/posthog`; padrões inspirados em `feedx` (referência).

## Mapa para upstreams

| Agente | Upstream relacionado | Tipo |
|---|---|---|
| orchestrator-master, memory-context, learning-memory-curation | langgraph + basic-memory | dependência (runtime/memory) |
| memory-context | obsidian-agent-memory-skills | inspiração |
| governance-risk-qa | agentshield | base operacional via `06_packages/guardrails` |
| product-feed-seo | feedgen | base operacional (lógica adaptada) |
| creative-copy-assets | ad-factory-agent | base operacional |
| competitor-benchmark, market-intelligence | brightdata-competitive-intelligence | dependência |
| design-ux-localization | dawn, ECC | inspiração |
| marketing-director, creative-copy-assets | marketingskills, ecommerce-skills, higgsfield-skills | base operacional (cherry-pick) |
| analytics-optimization | PostHog (SDK), feedx | dependência + inspiração |
