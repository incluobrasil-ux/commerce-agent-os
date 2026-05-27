---
aliases: [Terminal 2, Terminal LLM, LLM, Anthropic]
tags: [operations-map, role:terminal-llm]
icon: icons/terminal-llm.svg
category: agents-llm
color: "#7C3AED"
technical_name: 17 agentes LLM Tier-2+
technical_path: 03_agents/{marketing-director,creative-copy-assets,design-ux-localization,product-offer,merchant-compliance,...}
---

# Terminal de Execução 2 — LLM

**Papel:** rodar agentes que invocam Claude via `@cao/llm`. Saída criativa/analítica, exige `ANTHROPIC_API_KEY`, custo por token.

**Agentes (17 ativos):**
- **Marketing/Criativo:** `marketing-director` · `creative-copy-assets` · `design-ux-localization` · `traffic-campaigns` · `ads-launchpad` · `visual-asset-ops`
- **Oferta:** `product-offer` · `market-intelligence` · `competitor-benchmark` · `finance-margin-radar`
- **Catálogo:** `merchant-compliance` · `product-feed-seo` (library-only)
- **Cliente:** `reviews-ops` · `customer-journey-ops`
- **Memória/Governança:** `memory-context` · `learning-memory-curation` · `governance-risk-qa` · `audit-synthesizer`

**Quem chama:** [[chefe-da-operacao]] em playbooks `offer-improvement`, `marketing-creative-chain`, `pdp-ux-review`, `governance-review`, `safe-shopify-writeback`. Ou direto via [[painel-do-operador]].

**Bloqueio atual:** sem `ANTHROPIC_API_KEY` → exit `0` com log "SKIPPED" (planejado N28: exit code `3` para o dispatcher marcar como `skipped_gracefully` em vez de `completed`).

**Apoio:** [[guia-da-equipe]] · [[../../../../10_ops/scripts/PROMPT_MASTER]] (refinar prompts antes de rodar).
