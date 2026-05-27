---
aliases: [Motor, Motor dos Agentes, Runtime, Agent Runtime]
tags: [operations-map, role:execution-engine]
icon: icons/motor-dos-agentes.svg
category: runtime
color: "#FB923C"
technical_name: "@cao/runtime"
technical_path: 06_packages/runtime
---

# Motor dos Agentes

**Papel:** executa cada agente individual com guardrails, audit log, cost tracking e propagação de contexto. É o "como" da execução — quando o [[chefe-da-operacao]] manda spawnar `pnpm <agent-cmd>` via shell, o agente sobe rodando neste runtime.

**Nome técnico:** [`@cao/runtime`](../../../../../06_packages/runtime/).

**Garante:**
- Validação de input via zod schemas
- Detecção de PII/secrets (`@cao/guardrails`)
- Audit log por invocação
- Custo (tokens × preço) em runs LLM
- Eventos para o [[radar-da-operacao]]

**Detalhe:** `06_packages/runtime/src/runtime.test.ts`
