---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-25T22:30:00.000Z
tags: [next-actions]
source: mixed
confidence: 1.0
---

# Next Actions

**Para que serve:** lista pequena, ordenada e **executável** das próximas ações. Cada item tem pré-requisito, resultado esperado e papel sugerido — qualquer operador deveria conseguir puxar um item e saber se entregou.

**Como usar:** abrir antes de cada sessão (depois de [current-state.md](current-state.md) e [handoff-log.md](handoff-log.md)). Puxar 1 item, executar, registrar em [session-log.md](session-log.md), atualizar daqui.

**Output que gera:** plano operacional imediato que cabe em 5 minutos de leitura.

**Diferença para [operational-priorities.md](operational-priorities.md):** ali é o pool agrupado em horizontes (agora/próximo/depois); aqui são as ações imediatas em ordem com critério de aceite.

> **Nomes amigáveis** (usados neste arquivo para clareza humana; nomes técnicos permanecem no código):
> Chefe = `orchestrator-master` · Memória = `memory-context` · Organizador = `learning-memory-curation` · Auditor = `repo-auditor` · Resumidor = `audit-synthesizer` · Mercado = `market-intelligence` · Concorrentes = `competitor-benchmark` · Oferta = `product-offer` · Merchant = `merchant-compliance` · Qualidade = `governance-risk-qa` · Produtos = `product-feed-seo` · Catálogo = `catalog-feed-ops` · Reviews = `reviews-ops` · Marketing = `marketing-director` · Criativo = `creative-copy-assets` · Vitrine = `design-ux-localization` · Tráfego = `traffic-campaigns` · Performance = `analytics-optimization` · Margem = `finance-margin-radar` · Cliente = `customer-journey-ops` · Visual = `visual-asset-ops` · Campanhas = `ads-launchpad`.

---

## ~~N26~~ ✅ Merchant audit em catálogo real Incluo — **concluído 2026-05-25**

- **Entrega:** rodado `pnpm merchant:audit --source=json` em snapshot de 50 SKUs reais puxados via MCP Shopify (`08_data/fixtures/incluo-catalog-real.json`). Score médio **81.9/100** (vs 37.4 da fixture sintética), 49🟢 / 0🟡 / 1🔴.
- **Findings reais (acionáveis no Shopify):**
  - 🔴 1 SKU com price=0 (`contas-madeira-montessori-animais-frutas-coordenac`)
  - 🟡 50/50 sem GTIN/UPC/EAN exposto (decisão produto)
  - 🟡 50/50 sem googleProductCategory (mapping necessário)
  - 🔵 21/50 títulos longos sem brand "Incluo" no início
- **Gaps de regra do scorer descobertos:** descrição truncada via MCP; threshold de `title:no-brand` baixo demais; `gtin:missing` não diferencia categoria (confirma necessidade de N20.1).
- **Detalhe completo:** [run-summary 2026-05-25-audit-merchant-audit-incluo-json](run-summaries/2026-05-25-audit-merchant-audit-incluo-json.md).

## Prioridade imediata — N26 follow-ups

Quatro ações imediatas geradas pelo audit acima, divididas por quem puxa:

| # | Ação | Quem | Esforço |
|---|---|---|---|
| **N26.a** | Corrigir price = 0 no SKU `contas-madeira-montessori-animais-frutas-coordenac` (Shopify admin) | ops | 2 min |
| **N26.b** | Decidir política GTIN: mapear via `variant.barcode` OU `identifier_exists=false` para o catálogo | produto | decisão |
| **N26.c** | Mapear productType Shopify → Google Product Taxonomy (6-8 productTypes ativos da Incluo) | produto + dev | 1-2 h |
| **N26.d** | Bulk edit no Shopify: adicionar "Incluo" no início dos 21 títulos > 70 chars sem brand | ops | 30 min |

Após N26.a + N26.d, re-rodar audit para medir delta. Esperado: score médio ≥ 90, 0 red.

## Sequência recomendada após N26

1. **N21 — Ativar `ANTHROPIC_API_KEY` e ligar o pipeline real.**
   Encadear Marketing → Criativo → Vitrine → Catálogo → Produtos → Merchant com dados reais. Custo total estimado por loop < $0.30.
   ```bash
   pnpm marketing:plan ... --capture
   pnpm creative:assets ... --capture
   pnpm design:ux ... --capture
   pnpm feed:dry-run --source=shopify --seo --first=5 --capture
   pnpm merchant:audit --source=shopify --tenant=<loja> --capture
   ```
   Pré-requisito: key Anthropic em `.env.local` (5 min em https://console.anthropic.com/settings/keys).

2. **N20.1 — Evoluir o audit por categoria + ajustes vindos do run real Incluo.** O scorer hoje aplica regras genéricas. Adicionar presets:
   - **Eletrônicos:** exigir `gtin` + `manufacturer` (identifier_exists=true).
   - **Moda:** exigir `size` + `color` + `age_group`.
   - **Brinquedos educacionais/sensoriais (Incluo):** GTIN opcional (rebaixar para `low`), `age_group` mandatório.
   - **PT-BR:** ampliar lista de keywords de risco (português) e disclaimers obrigatórios (LGPD, claims de saúde, escassez falsa).
   - **Ajustes de threshold:** `title:no-brand` deve disparar quando `vendor` está populado E brand não está no início, independente de título > 70 chars.
   - **Source-aware:** quando `--source=json` com descrição truncada (heurística: termina em "..."), suprimir `description:too-short` ou marcar como `unknown`.
   Critério: cada categoria → 1 preset com 3-6 regras novas + testes.

3. **N24 — Handoff entre agentes via Memória.**
   Usar `memory-context` (Memória) para passar context bundle automático entre Marketing → Criativo → Vitrine, evitando que o operador re-passe brief 3 vezes. Reduz retrabalho e custo de tokens (context já curado).
   Pré-requisito: N21 validado.

## Bloqueios externos (separados — não bloqueiam desenvolvimento)

| Bloqueio | Destrava | Esforço |
|---|---|---|
| Shopify dev store + admin token | N26 (real audit) + N22 (`shopify:list-products`) | ~3 min em https://partners.shopify.com |
| `ANTHROPIC_API_KEY` rotacionada | N21 (17 agentes LLM saem do SKIPPED) | 5 min em https://console.anthropic.com/settings/keys |
| Google Merchant creds | upload real ao GMC (não bloqueia dry-run nem audit local) | 30-60 min |

Detalhe em [blockers-and-risks.md](blockers-and-risks.md).

## Nota operacional

**Caveman** foi instalado em modo `npx skills` fallback (per-repo, não como plugin do Claude Code) porque `claude` CLI não está no PATH local. `.agents/` e `skills-lock.json` já estão gitignored — nada poluiu o repo. **Não é prioridade**: deixar para quando configurar o Claude CLI corretamente (`npm i -g @anthropic-ai/claude-code`).

## Backlog menor (não-prioritário)

- **N23** — Scaffoldar `analytics-optimization` (Performance). Recomendação: deferir até haver tracking PostHog real para consumir.
- **N25** — Polish CI: validar que pipeline GH Actions passa com os novos agentes (34 arquivos de teste, 241 testes); confirmar `gitleaks` no CI.

---

## ✅ Concluídos recentemente

- ~~N1–N18~~ — bootstrap, ADRs, 16 agentes reais, brain bridge, doctor, team-ready.
- ~~N19~~ (2026-05-25) — **Bloco B 2.5 fechado**: Marketing, Criativo, Vitrine, Tráfego implementados. 20/22 agentes reais. 228 testes verdes. [run-summary](run-summaries/2026-05-25-impl-milestone-four-new-agents.md).
- ~~N20~~ (2026-05-25) — **Merchant audit MVP** (`pnpm merchant:audit`): score 0-100 por SKU + findings categorizados + remediações concretas; determinístico, sem LLM, sem credenciais; +13 testes (241 total). [run-summary](run-summaries/2026-05-25-impl-milestone-merchant-audit-mvp.md).

---

## Regras

- Máximo ~7 itens ativos. Excesso → [operational-priorities.md](operational-priorities.md) > `próximo`.
- Item executado → remover daqui + entrada em [session-log.md](session-log.md) + atualizar [current-state.md](current-state.md)/[ops-brief.md](ops-brief.md) se mudou semáforo.
- Item que não saiu em 2 sessões → reavaliar pré-requisito ou rebaixar.
- Antes de puxar, ler [handoff-log.md](handoff-log.md).
