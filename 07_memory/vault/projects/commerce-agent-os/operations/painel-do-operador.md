---
aliases: [Painel, Painel do Operador, CLIs, pnpm, Operator UI]
tags: [operations-map, role:human-interface]
icon: icons/painel-do-operador.svg
category: human-interface
color: "#34D399"
technical_name: package.json scripts + pnpm chief CLI
technical_path: package.json, 10_ops/scripts/COMMANDS.md
---

# Painel do Operador

**Papel:** ponto de toque entre humano e sistema. Onde o operador digita o que quer. 24+ comandos `pnpm <verb>:<noun>` em `package.json` + entrypoint principal `pnpm chief`.

**Modo recomendado:** começar SEMPRE pelo [[chefe-da-operacao]] (`pnpm chief --objective="..."`) — ele decide qual rota chamar.

**Modo direto** (quando você sabe exatamente o que quer): chamar agente individual via `pnpm <agent-command>` — ver [[../../../../10_ops/scripts/COMMANDS]].

**Comandos mais usados:**
- `pnpm chief --tenant=<t> --store=<s> --objective="..." --execute` — o Chefe
- `pnpm audit:repo .` — auditor determinístico (zero credencial)
- `pnpm merchant:audit --source=json --file=<path>` — scoring de catálogo
- `pnpm shopify:writeback --apply` — writeback com gate quíntuplo
- `pnpm doctor` — diagnóstico do ambiente

**Apoio opcional:** [[../../../../10_ops/scripts/PROMPT_MASTER]] — skill Claude para refinar prompts antes de jogar nos agentes LLM.
