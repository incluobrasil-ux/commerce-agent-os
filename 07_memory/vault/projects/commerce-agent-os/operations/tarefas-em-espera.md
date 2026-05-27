---
aliases: [Tarefas em Espera, Pendências, Blockers, STOPPED, Fila]
tags: [operations-map, role:waiting-queue]
icon: icons/tarefas-em-espera.svg
category: waiting
color: "#EF4444"
technical_name: next-actions + blockers-and-risks
technical_path: 07_memory/vault/projects/commerce-agent-os/{next-actions,blockers-and-risks}.md
---

# Tarefas em Espera

**Papel:** mostra o que está parado esperando algo (humano, token, decisão jurídica). Não é fila de trabalho do desenvolvedor — é o que está bloqueado externamente.

**Pendências ativas agora:**

| ID | O que | Bloqueio | Esforço |
|---|---|---|---|
| **N27** | Primeiro `pnpm chief --execute --mode=writeback` real em Incluo | depende de B6 + revisão jurídica do compliance HIGH | depende de humano |
| **N28** | Adotar exit code `3` (SKIPPED gracioso) nos 17 agentes LLM | bulk refactor, baixa prioridade | ~2-3h |
| **N29** | `legal-profile.json` por loja real (Incluo + outras) | decisão produto por loja | ~5 min/loja, template pronto |
| **B6** | `SHOPIFY_ADMIN_TOKEN` em `.env.local` | criar Custom App em Partners | ~3 min |
| **B1** | `ANTHROPIC_API_KEY` rotação no `.env.local` | rotação manual | 30s |

**Fonte canônica:** [[../next-actions]] · [[../blockers-and-risks]]

**Quem desbloqueia:** [[painel-do-operador]] (humano com creds + decisão). Quando desbloqueado, vira input para [[chefe-da-operacao]].
