---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-23T00:00:00Z
tags: [project-home, status, overview]
source: human:incluobrasil
confidence: 1.0
---

# commerce-agent-os — Project Home

**Para que serve este arquivo:** ponto de entrada do cérebro operacional. Lê isto primeiro para entender onde o projeto está hoje. Os outros arquivos do diretório especializam pedaços daqui.

**Como usar:** atualizar quando muda fase, muda status executivo, ou muda o "o que funciona / o que não funciona". Mudanças pequenas vão em `session-log.md` em vez daqui.

**Output que gera:** snapshot executivo de 1 página do projeto.

## Visão executiva

Monorepo de um **sistema operacional de agentes para e-commerce Shopify**. 17 agentes em 7 tiers, 7 apps, 7 integrações, 12+ pacotes `@cao/*`. Multi-tenant por loja, memória markdown-first, runtime LLM via Anthropic.

Visa entregar lojistas Shopify uma camada de automação coordenada (catálogo, feed, analytics, reviews, marketing creative) acima da admin app — em vez de N apps isolados.

## Status atual

- **Macro-fase 1 (scaffold)**: concluída.
- **Macro-fase 2 (implementação)**: em curso.
  - Sub-fase 2.0 (aceitar ADRs estruturais): concluída.
  - Sub-fase 2.1 (bootstrap funcional — install + typecheck + lint + smoke verdes): concluída.
  - Sub-fase 2.2 (núcleo `@cao/*` mínimo: core, llm, memory, guardrails, observability, runtime): concluída em local, pendente commit/PR.
  - Sub-fase 2.3 (clonar upstreams + primeiro agente real `repo-auditor`): não iniciada.

Repo público: https://github.com/incluobrasil-ux/commerce-agent-os
Tag: `v0.1.0-architecture-baseline`.

## O que já funciona

- `pnpm install` verde (24 workspaces).
- `pnpm typecheck` verde (`tsc -b` zero erros).
- `pnpm lint` verde (biome, 148 arquivos).
- `pnpm test` verde — 6 packages, 41 testes (~1s).
- `pnpm test:smoke` verde (3 testes).
- CI no GitHub Actions: lint + typecheck + smoke + commitlint em PR.
- Branch protection em `main`.
- 8 ADRs aceitos.
- 6 pacotes `@cao/*` com implementação mínima e testes: `core`, `llm`, `memory`, `guardrails`, `observability`, `runtime`.

## O que ainda NÃO funciona

- Nenhum agente real implementado — só scaffolds declarativos (AGENT.md + prompt + contract).
- Nenhum upstream clonado em `01_upstreams/` (todos os 10 de alta prioridade pendentes).
- Sem chamada LLM real testada end-to-end (depende de `ANTHROPIC_API_KEY` confirmada).
- Sem integração Shopify real (só contratos e scaffolds em `04_apps/shopify-*` + `05_integrations/shopify/`).
- Sem worker queue, sem DB de aplicação, sem analytics live, sem secret manager.
- 9 ADRs pendentes (`ADR-0007/0008/0010-0016`).

## Macro-fase / Sub-fase atual

| | Status |
|---|---|
| Macro-fase | 2 — Implementação |
| Sub-fase | 2.2 → 2.3 (transição) |
| Próximo marco | primeiro agente real (`repo-auditor`) rodando end-to-end |

## Links-chave

**Governança** (autoridade — sempre verdade aqui antes de aqui):
- [PROJECT_SCOPE](../../../../00_meta/PROJECT_SCOPE.md)
- [ROADMAP](../../../../00_meta/ROADMAP.md)
- [SUCCESS_CRITERIA](../../../../00_meta/SUCCESS_CRITERIA.md)
- [STACK_RULES](../../../../00_meta/STACK_RULES.md)
- [DECISIONS](../../../../00_meta/DECISIONS.md)

**ADRs**: [`02_architecture/adr/`](../../../../02_architecture/adr/)

**Onboarding**: [TEAM_ONBOARDING](../../../../00_meta/TEAM_ONBOARDING.md)

**Especializações deste cérebro:**

Estado e execução:
- [current-state.md](current-state.md) — **snapshot curto** (verde/bloqueado + fase + marco)
- [ops-brief.md](ops-brief.md) — semáforos por bloco + próximos 3 focos
- [workstreams.md](workstreams.md) — trilhas paralelas (W1–W8) com status
- [next-actions.md](next-actions.md) — N1–N7 executáveis em ordem
- [operational-priorities.md](operational-priorities.md) — fila viva (agora/próximo/depois) com dono e status
- [blockers-and-risks.md](blockers-and-risks.md) — B1–B4 + R1–R11

Decisões:
- [decision-index.md](decision-index.md) — ADRs aceitos + abertos + impacto por área

Logs (append-only):
- [session-log.md](session-log.md) — log retrospectivo de sessões
- [handoff-log.md](handoff-log.md) — passagem de bastão entre operadores/máquinas

Resumos curados:
- [run-summaries/README.md](run-summaries/README.md) — padrão para resumir outputs
- [run-summaries/index.md](run-summaries/index.md) — catálogo dos resumos
- [run-summaries/_template.md](run-summaries/_template.md) — esqueleto fillable

Governança do próprio cérebro:
- [source-of-truth.md](source-of-truth.md) — quais arquivos são autoridade
- [sync-protocol.md](sync-protocol.md) — protocolo para múltiplos operadores em múltiplas máquinas
