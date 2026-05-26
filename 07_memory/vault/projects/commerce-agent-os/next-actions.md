---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-26T19:30:00Z
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

## N26 follow-ups — status atualizado (2026-05-26)

Operador autorizou orchestrator-master a executar plano completo na loja real. 8 mutations aplicadas via MCP nesta sessão.

| # | Ação | Status |
|---|---|---|
| ~~**N26.a**~~ | Corrigir price = 0 no SKU contas-madeira | ✅ **aplicado 2026-05-26 20:24** — price R$ 89,90, compareAt R$ 109,90 (pesquisa de mercado via WebSearch fundamentou: ML R$ 109,90 / Amazon R$ 102,60 / Shopee R$ 72,99) |
| **N26.b** | Convenção SKU global (`INC-<P>-<V>`) substituindo SKU ALI `\d+:\d+#` | 🔵 proposta em [`audit/n26b-sku-normalization-proposal-20260526.md`](../../tenants/incluo-tenant/stores/incluo/audit/n26b-sku-normalization-proposal-20260526.md) — aguarda decisão Samuel |
| **N26.c** | Mapping productType → GMC taxonomy | 🔵 decisão pendente (`--gmc-default=3793` já cobre 47/50 SKUs na auditoria) |
| **N26.d** | Brand prefix nos títulos sem "Incluo" | 🔵 baixa prioridade (severity low, 50 ocorrências) |
| **N26.e** ✨ | Reescrever 7 handles com claims terapêuticos (gap N20.2) | ✅ **aplicado 2026-05-26 20:24** — `redirectNewHandle:true` cria 301 auto |
| **T2-drafts** | Revisões propostas para 3 descriptions com "autorregulação sensorial" | 🔵 aguarda jurídico em [`compliance/n20-2-followup-descriptions-t2-20260526.md`](../../tenants/incluo-tenant/stores/incluo/compliance/n20-2-followup-descriptions-t2-20260526.md) |

Análise consolidada: [run-summary 2026-05-26-impl-milestone-n20-2-and-gmc-fixes-applied](run-summaries/2026-05-26-impl-milestone-n20-2-and-gmc-fixes-applied.md).

## N20.2 ✅ Scorer evoluído — claims terapêuticos PT-BR + handle scanning (2026-05-26)

- 21 keywords PT-BR adicionadas (autismo, TDAH, TEA, ADHD, OCD, ansiedade, depressão, alivia, terapêutico, autorregulação sensorial, …).
- Nova rule `link:therapeutic-claim:*` varre URL pública (handle) além de title/description — gap real descoberto no audit Incluo.
- +5 testes (251 → 256 verdes).
- Audit Incluo: **89.2 → 92.8** após fixes; **0 critical, 3 high residuais** = T2 puro.
- Próximo: **N20.3** — pipeline `productToFeedRow` expor `variantSku` no `FeedRow` para detecção automatizada de SKU pattern `\d+:\d+#`.

## Prioridade imediata — operacionalizar writeback real

### N27 — Primeiro `--apply` real do `shopify:writeback`

- **Pré-requisitos:**
  1. Custom App em dev store (ou loja real) → `SHOPIFY_ADMIN_TOKEN` + `SHOPIFY_SHOP` em `.env.local` (~3 min em https://partners.shopify.com).
  2. Revisão jurídica do compliance HIGH `contas-madeira-pdp-review` antes de aplicar nesse PDP (não usar como primeiro alvo).
- **Comando:**
  ```bash
  pnpm shopify:writeback \
    --compliance=<path/to/review.md> \
    --tenant=incluo-tenant --store=incluo \
    --apply   # default é dry-run; flag explícita necessária
  ```
- **Critério de aceite:** audit log com `applied > 0` + `descriptionHtml` alterado no admin Shopify + run-summary criado.
- **Quem puxa:** Samuel (precisa do token) + jurídico (precisa do go).
- **Detalhe técnico:** [run-summary](run-summaries/2026-05-26-impl-milestone-shopify-writeback-minimal.md).

### ✅ Sub-fase 2.6 writeback minimal concluído (2026-05-26)

- PR [#18](https://github.com/incluobrasil-ux/commerce-agent-os/pull/18) merged. Loop `compliance → diff → audit` fechado em código. Dry-run validado.
- Detalhe em [run-summary 2026-05-26-impl-milestone-shopify-writeback-minimal](run-summaries/2026-05-26-impl-milestone-shopify-writeback-minimal.md).

### ✅ Multi-tenant hardening 2.9 concluído (2026-05-25)

- 7 layers implementadas (shared-types/core/memory/runtime/brain-bridge/merchant:audit pilot/smoke isolation tests).
- Detalhe completo em [run-summary 2026-05-25-impl-milestone-multi-tenant-hardening](run-summaries/2026-05-25-impl-milestone-multi-tenant-hardening.md).

### ~~Opção A — Migrar 5 agentes~~ ✅ **concluído 2026-05-25**

Os 5 agentes (`merchant-compliance`, `product-offer`, `marketing-director`, `creative-copy-assets`, `design-ux-localization`) ganharam `--store=<id>`, assertion explícita via `assertTenantStoreContext`/`assertTenantContext`, Memory com `storeId`, captureRun com `tenantId+storeId`, absPath e vaultRel store-scoped. Sem regressão: 309 testes verdes mantidos. Agora **6 de 20 agentes** suportam contexto store-level explicito (era 1 — só merchant:audit). Os 14 restantes seguem tenant-only (compat); migração incremental sob demanda.

### Opção B — **N21**: Pipeline LLM real end-to-end

Encadear Marketing → Criativo → Vitrine → Catálogo → Produtos → Merchant com dados reais Incluo, key Anthropic já presente em `.env.local`. Custo estimado: < $0.30/loop. Retorno: outputs reais salvos em vault para uso operacional.
```bash
pnpm llm:smoke                                              # pre-flight ~$0.001
pnpm marketing:plan --horizon=... --objective=... --capture
pnpm creative:assets --campaign=... --capture
pnpm design:ux --scope=product --name=... --capture
pnpm feed:dry-run --source=fixture --seo --capture
```

### ~~Opção B — N20.1: Evoluir scorer~~ ✅ **concluído 2026-05-25**

- 3 regras aplicadas no scorer: `title:no-brand` always-on, `description:truncated` (low) suprimindo falsos positivos, GMC_CATEGORY_OVERRIDES (3793 → gtin low).
- Transformer ganhou `gmcCategoryByProductType` + `defaultGmcCategoryId`; CLI ganhou `--gmc-default=<id>` + `--gmc-mapping=<file>`.
- +10 testes (241 → 251 verdes).
- Re-run Incluo validou: **score 81.9 → 93.2**, medium 100 → 0, 0 red.
- Detalhe em [run-summary 2026-05-25](run-summaries/2026-05-25-audit-merchant-audit-incluo-json.md) seção "Re-run pós N20.1".

### Opção C — **N24**: Handoff entre agentes via Memória

Usar `memory-context` (Memória) para passar context bundle automático entre Marketing → Criativo → Vitrine. Reduz retrabalho do operador e custo de tokens. Pré-requisito: N21 validado primeiro.

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
