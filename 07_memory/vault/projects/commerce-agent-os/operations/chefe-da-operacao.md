---
aliases: [Chefe, Chefe da Operação, Octoboss, orchestrator-master]
tags: [operations-map, role:chefe]
icon: icons/chefe.svg
category: orchestration
color: "#F5C518"
technical_name: orchestrator-master
technical_path: 06_packages/orchestration
cli: pnpm chief
---

# Chefe da Operação

**Papel:** recebe objetivo em linguagem natural, classifica intent, escolhe um de 8 playbooks, avalia camada legal BR/EU/US, monta rota, despacha agentes via shell, registra checkpoint a cada step. É o coordenador central da operação.

**Nome técnico:** `orchestrator-master` + pacote [`@cao/orchestration`](../../../../../06_packages/orchestration/). CLI: `pnpm chief`.

**Comanda diretamente:**
- [[mesa-de-comando]] — registry + playbooks + planner + runner
- [[motor-dos-agentes]] — runtime que executa cada agente
- [[radar-da-operacao]] — observabilidade e captura no vault
- [[nucleo-das-regras]] — camada legal BR/EU/US

**Quando chamar:** sempre que o objetivo for composto (mais de 1 agente), exigir camada legal, ou requerer writeback Shopify. Para tarefas isoladas, vá direto pelo [[painel-do-operador]].

**Detalhe:** [[../project-home]] · [[../current-state]] · [[../next-actions]]
