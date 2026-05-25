---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-23T00:00:00Z
tags: [audit, gaps, macro-phase-1, blockers]
source: human:incluobrasil
kind: audit
result: yellow
confidence: 1.0
related:
  - 12_reports/audits/phase-1-gap-analysis.md
  - 12_reports/audits/security-qa-readiness.md
  - 12_reports/audits/shopify-readiness.md
  - 12_reports/audits/merchant-feed-seo-readiness.md
  - 12_reports/audits/analytics-readiness.md
  - 12_reports/audits/reviews-readiness.md
---

# Auditoria de gaps da Macro-fase 1

## Contexto

Consolidação manual dos gaps reportados em 5 readiness audits + revisão final do scaffold. Escopo: tudo que impede a Macro-fase 2 começar com chão sólido. Severidade reflete bloqueio para a próxima fase, não risco em produção.

## O que aconteceu

- 31 gaps catalogados em 4 níveis de severidade.
- **3 críticos** identificados: bootstrap funcional não rodado, nenhum upstream clonado, `@cao/runtime` inexistente.
- **9 altos** — todos amarrados a decisões pendentes (ferramentas QA, mídia/storage, reviews, PostHog, feedgen, queue, DB, secret manager, retenção).
- **12 médios** — completude de scaffold (flows.md faltando, prompts placeholder, `client/` declarado vazio, CI ausente, staging não montado).
- **7 baixos** — refinamentos não bloqueantes (skills-catalog provisório, providers stubs idênticos, diagramas faltando).
- 4 dores recorrentes atravessam quase todos os audits: "nada roda", "upstreams não clonados", "`@cao/runtime` é referência circular", "decisões acumulam".

## Achados / decisões

- **Toda Fase 2 depende da Fase 5 (bootstrap funcional).** Sem `pnpm install`, nenhum dos outros gaps consegue avançar. Prioridade #1.
- **`@cao/runtime` aparece em 14 docs como dependência circular** — bloqueia agentes, observability, governance-risk-qa simultaneamente.
- **Lint stack ainda não escolhida** quando audit foi feito; ADR-0006 era candidato (foi aceito depois em 2026-05-23).
- **Override humano de `block` não modelado em UI** — falha potencial de fluxo crítico em produção (lojista revoga decisão automática).

## Impacto

Vira a base do backlog operacional. Cada gap crítico/alto vira item em [active-todos.md](../active-todos.md); cada decisão pendente alimenta [decision-index.md](../decision-index.md). Resultado: ~9 ADRs em queue (0007, 0008, 0010–0016) e ~4 bloqueios ativos rastreados em [blockers-and-risks.md](../blockers-and-risks.md).

## Ações geradas

- [x] Sub-fase 2.0: aceitar ADR-0006/0009/0017. → feito.
- [x] Sub-fase 2.1: bootstrap funcional. → feito; destrava gap #1.
- [x] Sub-fase 2.2: implementar `@cao/runtime` + `@cao/memory` + `@cao/guardrails` mínimos. → feito; destrava gaps #3, #18, #19, #20.
- [ ] Sub-fase 2.3: clonar 10 upstreams alta prioridade. → destrava gap #2 + #25.
- [ ] Aceitar ADRs em queue (0007, 0008, 0010, 0011, 0012, 0013, 0014, 0015, 0016) conforme sub-fase usa cada área.
- [ ] Override humano de `block` no admin-app. → backlog (Fase 12).
- [ ] Política de retenção de `07_memory/` + logs. → backlog (Fase 12).

## Referências

- raw consolidado: [`12_reports/audits/phase-1-gap-analysis.md`](../../../../../12_reports/audits/phase-1-gap-analysis.md)
- audits por área: `12_reports/audits/{shopify,merchant-feed-seo,analytics,reviews,security-qa}-readiness.md`
- decisões: [decision-index.md](../decision-index.md)
- bloqueios: [blockers-and-risks.md](../blockers-and-risks.md)
