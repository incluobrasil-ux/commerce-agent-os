---
aliases: [Mesa de Comando, Orchestration, Routing, Playbooks, Registry]
tags: [operations-map, role:command-deck]
icon: icons/mesa-de-comando.svg
category: orchestration-core
color: "#A78BFA"
technical_name: "@cao/orchestration"
technical_path: 06_packages/orchestration/src
---

# Mesa de Comando

**Papel:** onde o [[chefe-da-operacao]] consulta para decidir a rota. Contém:

- **Registry** — catálogo de 22 agentes com metadados (modo, credenciais, tier, side effects)
- **Playbooks** — 8 rotas oficiais (merchant-audit, offer-improvement, marketing-creative-chain, pdp-ux-review, governance-review, store-readiness, cross-store-diagnostic, safe-shopify-writeback)
- **Planner** — classifica intent (audit/catalog/offer/marketing/...) e seleciona playbook
- **Runner** — máquina de estados (9 estados) com checkpoint/resume
- **Writeback-gate** — porta de segurança quíntupla antes de mutation Shopify

**Nome técnico:** [`@cao/orchestration`](../../../../../06_packages/orchestration/src/).

**Arquivos centrais:** `registry.ts` · `playbooks.ts` · `planner.ts` · `runner.ts` · `writeback-gate.ts` · `legal.ts` · `bundle.ts`.

**Detalhe:** [[../decision-index]] · [[../workstreams]]
