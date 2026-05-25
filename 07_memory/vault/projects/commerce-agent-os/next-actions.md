---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-25T18:10:00.000Z
tags: [next-actions]
source: mixed
confidence: 1.0
---

# Next Actions

**Para que serve:** lista pequena, ordenada e **executável** das próximas ações. Cada item tem pré-requisito, resultado esperado e papel sugerido — qualquer operador deveria conseguir puxar um item e saber se entregou.

**Como usar:** abrir antes de cada sessão (depois de [current-state.md](current-state.md) e [handoff-log.md](handoff-log.md)). Puxar 1 item, executar, registrar em [session-log.md](session-log.md), atualizar daqui.

**Output que gera:** plano operacional imediato (~3–7 ações) que cabe em 5 minutos de leitura.

**Diferença para [operational-priorities.md](operational-priorities.md):** ali é o pool agrupado em horizontes (agora/próximo/depois); aqui são as ações imediatas em ordem, com critério de aceite.

---

## ✅ Concluídos recentemente

- ~~N1–N18~~ — bootstrap, ADRs, 16 agentes reais, brain bridge, doctor, team-ready.
- ~~N19 (2026-05-25)~~ — **Bloco B 2.5 fechado**: `marketing-director`, `creative-copy-assets`, `design-ux-localization`, `traffic-campaigns` implementados. 20/22 agentes reais. **228 testes verdes em 33 arquivos**. Detalhe em [run-summaries/2026-05-25-impl-milestone-four-new-agents.md](run-summaries/2026-05-25-impl-milestone-four-new-agents.md).

## ~~N20~~ ✅ Merchant audit MVP (Phase 4) — **concluído 2026-05-25**

- **Entrega:** `pnpm merchant:audit [--source=fixture|json|shopify] [--file=path]` produz score 0-100 por SKU, findings categorizados por severidade (critical/high/medium/low), remediações concretas e ranking dos piores. Output em `12_reports/merchant-audits/` (markdown + JSON). Determinístico (sem LLM). Exit 1 se há SKU red — útil para gate CI.
- **Módulos:** `05_integrations/google-merchant/audit/scorer.ts` (pure functions) + `audit/report.ts` (writer) + `03_agents/catalog-feed-ops/src/audit-cli.ts` (CLI). +13 testes (241 total verdes).
- **Validado:** fixture de 5 SKUs deliberadamente quebrada produziu score médio 37.4, 6 critical / 17 medium findings, ranking ordenado por pior score.
- **Próximo (N20.1):** expandir regras conforme operação real revelar gaps (presets por categoria, mais keywords de risco, validação multi-mercado).

## N26 — Real Merchant audit em catálogo real

- **Ação:** quando tiver export Shopify (ou conectar via creds), rodar:
  ```bash
  pnpm merchant:audit --source=shopify --first=100 --tenant=<loja> --capture
  ```
  ou export local:
  ```bash
  pnpm merchant:audit --source=json --file=<export.json> --tenant=<loja> --capture
  ```
- **Pré-requisito:** Shopify dev store + admin token OU export JSON de produtos.
- **Resultado esperado:** relatório operacional do catálogo real, lista priorizada do que corrigir antes de submeter ao GMC.
- **Quem puxa:** ops + produto

## N21 — Real runs LLM (destrava demos)

- **Ação:** atualizar `.env.local` com Anthropic key rotacionada e rodar pipeline de validação:
  ```bash
  pnpm marketing:plan --horizon="Q3 2026" --objective="Crescer receita 25%" --voice="direto" --budget=50000 --capture
  pnpm creative:assets --campaign="lancamento" --theme="durabilidade" --audience="25-40" --voice="direto" --offer="camiseta orgânica BRL 129" --channel=meta-ads --format=feed-image --locale=pt-BR --capture
  pnpm feed:dry-run --source=fixture --seo --first=3
  ```
- **Pré-requisito:** key Anthropic em `.env.local` (5 min em https://console.anthropic.com/settings/keys).
- **Resultado esperado:** 3 outputs reais em `07_memory/vault/_test/` + capture nos run-summaries. Custo estimado: < $0.10.
- **Quem puxa:** ops (atualizar .env.local) → dev (rodar)

## N22 — Shopify dev store + custom app (~3 min)

- **Ação:** ver passos detalhados em [blockers-and-risks.md#B6](blockers-and-risks.md). Resumo:
  1. https://partners.shopify.com → criar dev store (gratuito, 5 produtos default).
  2. Admin → Apps → Develop apps → Create app → scopes `read_products` → Save → Install → Reveal token.
  3. Preencher `SHOPIFY_SHOP` + `SHOPIFY_ADMIN_TOKEN` em `.env.local`.
- **Pré-requisito:** conta Shopify Partners.
- **Resultado esperado:** `pnpm shopify:list-products` lista 5 produtos default. **Primeira demo mostrável.** Depois: `pnpm feed:dry-run --source=shopify --seo --first=5` end-to-end com Claude.
- **Quem puxa:** ops

## N23 — analytics-optimization (último agente STUB)

- **Ação:** decidir entre (a) scaffoldar o último agente faltante seguindo padrão do `product-offer` ou (b) deixar para quando houver demanda real PostHog. Recomendação: **(b)** — esperar tracking real chegar antes de implementar consumer.
- **Pré-requisito:** decisão.
- **Quem puxa:** tech lead

## N24 — Integração entre agentes (handoff bundles)

- **Ação:** desenhar pipeline `marketing-director → creative-copy-assets → design-ux-localization → catalog-feed-ops` com bundle de context passado automaticamente entre agentes. Possível usar `memory-context` como reader.
- **Pré-requisito:** N21 validado (real runs OK).
- **Quem puxa:** tech lead + dev

## N25 — Polish CI: rodar 33 arquivos de teste + lint + commitlint no PR

- **Ação:** validar que CI passa com os 4 novos agentes + 228 testes. Adicionar `gitleaks` no CI se ainda não estiver.
- **Pré-requisito:** PR aberto.
- **Quem puxa:** ops

---

## Regras

- Máximo ~7 itens. Se passar, mover excesso para [operational-priorities.md](operational-priorities.md) > `próximo`.
- Item executado → remover daqui + entrada em [session-log.md](session-log.md) + atualizar [current-state.md](current-state.md)/[ops-brief.md](ops-brief.md) se mudou semáforo.
- Item que não saiu em 2 sessões consecutivas → reavaliar pré-requisito ou rebaixar para [operational-priorities.md](operational-priorities.md).
- Antes de puxar, ler [handoff-log.md](handoff-log.md) — alguém pode já estar nesse item.
