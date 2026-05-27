---
aliases: [Radar, Radar da Operação, Telemetry, Observability, brain-bridge]
tags: [operations-map, role:radar]
icon: icons/radar.svg
category: observability
color: "#22D3EE"
technical_name: "@cao/observability + @cao/brain-bridge"
technical_path: 06_packages/observability, 06_packages/brain-bridge
---

# Radar da Operação

**Papel:** observa tudo que acontece. Captura eventos dos agentes (`agent.invoked`, `agent.completed`, `agent.failed`), grava run-summaries no vault por tenant/store, mantém audit log de custo e duração.

**Nome técnico:** [`@cao/observability`](../../../../../06_packages/observability/) + [`@cao/brain-bridge`](../../../../../06_packages/brain-bridge/).

**Como ativar:** flag `--capture` em qualquer agente CLI grava run-summary em `vault/tenants/<t>/[stores/<s>/]run-summaries/`. Standalone: `pnpm ops:capture <input.json>`.

**Sinaliza para:** [[chefe-da-operacao]] (decisão de seguir/parar), [[guia-da-equipe]] (relatórios humanos).

**Detalhe:** [[../run-summaries/index]] · `06_packages/brain-bridge/src/capture.ts`
