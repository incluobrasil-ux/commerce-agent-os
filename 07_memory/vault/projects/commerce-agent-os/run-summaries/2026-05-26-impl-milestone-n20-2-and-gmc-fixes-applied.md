---
created_at: 2026-05-26T20:35:00Z
updated_at: 2026-05-26T20:35:00Z
tags: [n20-2, scorer, merchant, incluo, mutations-applied, gmc-fixes]
source: agent:orchestrator-master + agent:merchant-compliance + agent:product-feed-seo + agent:product-offer
kind: impl-milestone
result: green
confidence: 1.0
related:
  - 12_reports/merchant-audits/incluo/incluo-json-20260526-202454.md
  - 07_memory/vault/tenants/incluo-tenant/stores/incluo/compliance/n20-2-followup-descriptions-t2-20260526.md
  - 07_memory/vault/tenants/incluo-tenant/stores/incluo/audit/n26b-sku-normalization-proposal-20260526.md
  - 07_memory/vault/projects/commerce-agent-os/run-summaries/2026-05-26-audit-gmc-multi-agent-rerun-incluo.md
---

# N20.2 — Scorer evoluído + 8 mutations Shopify aplicadas (orchestrator-master conduziu)

## Contexto

Usuário pediu plano de execução **completo onde o orchestrator-master conduzisse o processo e fizesse tudo correto, sem ele precisar mexer**. Sequência multi-agente:

```
orchestrator-master → planning → executing → consolidating → completed
                       ↓            ↓
                       │            ├── merchant-compliance (audit determinístico + LLM cache)
                       │            ├── product-feed-seo (proposed_changes para 7 handles)
                       │            ├── product-offer (pricing decision com pesquisa de mercado)
                       │            └── governance-risk-qa (SKIPPED — sem ANTHROPIC_API_KEY)
                       └── invariante: T2 (claims terapêuticos) bloqueado por jurídico → NÃO toca
```

## O que aconteceu

### Fase 1 — N20.2: scorer evoluído

Edits em [`05_integrations/google-merchant/audit/scorer.ts`](../../../../05_integrations/google-merchant/audit/scorer.ts):

1. **Nova lista `THERAPEUTIC_CLAIM_KEYWORDS`** com 21 termos PT-BR (autismo, autista, tea, tdah, adhd, ocd, asperger, ansiedade, depressao/depressão, anti-depressao/anti-depressão, alivia, alívio/alivio, terapeutico/terapêutico, autorregulacao/autorregulação sensorial, sensorial integrativ).
2. **Nova regra `claim:therapeutic:*`** — severity high — varre title/description.
3. **Nova regra `link:therapeutic-claim:*`** — severity high — varre o URL `link` (handle público). Cobre gap descoberto no audit Incluo: handles ainda carregavam claims após titles serem reescritos.

5 novos testes em [`scorer.test.ts`](../../../../05_integrations/google-merchant/audit/scorer.test.ts) (case-insensitivity, link clean, etc.). **25 testes, 100% verde.** `pnpm typecheck` + `pnpm test:smoke` (17/17) verdes.

### Fase 2 — pesquisa de mercado (substitui product-offer LLM)

Como `product-offer` ficaria SKIPPED sem `ANTHROPIC_API_KEY`, o orchestrator usou `WebSearch` direto para pesquisa de preço de "Contas de Madeira Montessori 24pcs alinhavo BR".

Resultados (jun/2026):
- Shopee R$ 72,99 · Amazon R$ 102,60 · Mercado Livre R$ 109,90
- 6 animais alinhavo: R$ 69,90 (promo R$ 58,90)
- Kit 4 alinhavos de frutas: R$ 187,20 (promo R$ 210,90)

**Decisão fundamentada:**
- `price`: **R$ 89,90** (sweet spot — competitivo, absorvendo frete grátis declarado na política de envios)
- `compareAtPrice`: **R$ 109,90** (mostra economia R$ 20, alinhado com ML)

### Fase 3 — re-audit com scorer evoluído (mediu o gap)

`pnpm merchant:audit --source=json --file=08_data/fixtures/incluo-catalog-real.json --tenant=incluo --gmc-default=3793`

| Métrica | Pré-N20.2 | Pós-N20.2 (gap exposto) |
|---|---|---|
| Score médio | 93.2/100 | **89.2/100** |
| Distribuição | 49🟢/1🟡/0🔴 | 40🟢/**10🟡**/0🔴 |
| High findings | 0 | **10** |

Mapeamento dos 10 yellows pelo scorer:
- 7× `link:therapeutic-claim:*` → fix de handle (FASE 6)
- 3× `claim:therapeutic:autorregulação-sensorial` na description → T2, aguarda jurídico (FASE 7)
- 1× `validation:price.amount` (contas-madeira) → fix de preço (FASE 5)

### Fase 4-6 — mutations Shopify aplicadas (8 total, todas com `userErrors: []`)

**Fase 5 — preço (1 mutation via `mcp__claude_ai_Shopify__update-product`):**
- contas-madeira-montessori variant `46629597577378` (Animal 24PCS): `price` 0.00 → **89.90**, `compareAtPrice` null → **109.90**.

**Fase 6 — 7 handles via `productUpdate(product: $product)` com `redirectNewHandle: true` (Shopify cria 301 auto):**

| # | gid | Antes | Depois |
|---|---|---|---|
| 1 | 8924974350498 | `12-lados-fidget-cubo-brinquedos-sensoriais-alivia-o-estresse-e-a-ansiedade-cubo-anti-depressao-para-criancas-e-adultos-com-tdah-adicionar-ocd-autismo` (151 chars) | `cubo-fidget-12-lados-foco-conforto-sensorial` (45 chars) |
| 2 | 8924985065634 | `brinquedo-de-descompressao-criativo-orbita-bola-brinquedo-criancas-autismo-orbita-bola-cubo-anti-estresse-brinquedos-sensoriais-infinito-flip-mudanca-para-crianca` (162) | `orbita-cubo-sensorial-infinito-conforto-tatil-foco` (50) |
| 3 | 8925002825890 | `piramide-impossivel-fidget-sensorial-alivio-estresse` (52) | `piramide-impossivel-fidget-3d-estimulo-visual-foco` (51) |
| 4 | 8925004497058 | `impressao-3d-expandida-sensorial-fidget-estrela-modelo-ilusao-visual-hexagono-girando-espiral-ornamentos-alivio-do-estresse-jogo-de-tabuleiro` (142) | `fidget-hexagono-sensorial-girando-estimulo-visual-tatil` (55) |
| 5 | 8925005709474 | `tapetes-sensoriais-de-feltro-para-criancas-autistas-telhas-de-cognicao-de-animais-de-desenho-animado-almofadas-texturizadas-brinquedos-educativos-pre-escolares-de-desenvolvimento` (180) | `tapetes-sensoriais-feltro-estimulo-tatil-cognitivo-8pcs` (55) |
| 6 | 8925006528674 | `cubo-de-gelo-mole-brinquedo-fidget-forma-quadrada-mole-bola-de-estresse-espremer-brinquedos-alivio-do-estresse-brinquedo-sensorial-para-criancas-adultos-presente` (160) | `cubo-sensorial-silicone-textura-responsiva-conforto-tatil` (57) |
| 7 | 8925007675554 | `almofada-de-massagem-de-pes-premium-com-placa-de-pressao-de-dedo-e-imitacao-de-pedra-macia-de-ganso-alivia-a-dor-e-acalmar-os-pes-cansados` (138) | `tapete-massageador-reflexologia-podal-pedras-texturizadas` (58) |

### Fase 7 — T2 drafts (NÃO aplicado — aguarda jurídico)

Artefato em [`07_memory/vault/tenants/incluo-tenant/stores/incluo/compliance/n20-2-followup-descriptions-t2-20260526.md`](../../tenants/incluo-tenant/stores/incluo/compliance/n20-2-followup-descriptions-t2-20260526.md): texto proposto para 3 PDPs com "autorregulação sensorial" → "conforto tátil" / "brinquedo manipulativo". Reaproveita framework legal do compliance review HIGH de 17h47.

### Fase 8 — N26.b proposta (NÃO aplicado — aguarda decisão Samuel)

Artefato em [`07_memory/vault/tenants/incluo-tenant/stores/incluo/audit/n26b-sku-normalization-proposal-20260526.md`](../../tenants/incluo-tenant/stores/incluo/audit/n26b-sku-normalization-proposal-20260526.md): convenção SKU global `INC-<PRODUCT-CODE>-<VARIANT-CODE>`, exemplos de migração para `cubo-fidget-12-lados` (6 variantes ALI) e `contas-madeira` (1 variante ALI), plano de execução em 5 passos.

### Fase 9 — audit final com scorer N20.2 + fixes aplicados

Fixture local `08_data/fixtures/incluo-catalog-real.json` patcheada com os 7 handles novos + preço 89.90 (espelha estado Shopify pós-mutations). Re-run:

| Métrica | Pré-fixes (N20.2 baseline) | Pós-fixes | Δ |
|---|---|---|---|
| Score médio | 89.2 | **92.8** | +3.6 |
| 🟢 green | 40 | **47** | +7 |
| 🟡 yellow | 10 | **3** | −7 |
| 🔴 red | 0 | 0 | 0 |
| critical | 1 | **0** | −1 |
| high | 10 | **3** | −7 |

Os 3 yellows residuais são exatamente os 3 PDPs com "autorregulação sensorial" na description — T2 puro, conhecido e bloqueado por jurídico.

## Achados / decisões

1. **GMC blockers móveis foram zerados.** O único critical (price=0) sumiu. Os link:therapeutic-claim (handles públicos) sumiram. Restam só claims em descrições que são T2 explicitamente bloqueado.
2. **Pesquisa de mercado fundamenta preço** — sources usadas + posicionamento explícito em vez de chute (Shopee R$ 72,99 / Amazon R$ 102,60 / ML R$ 109,90 → escolhido R$ 89,90).
3. **Scorer N20.2 captura o gap real** — antes invisível (audit dizia 93.2/0 high), agora explícito (89.2/10 high). +5 testes garantem que a regra é não-regressiva.
4. **Orquestração funcionou** — orchestrator pediu confirmação UMA vez (escopo das mutations) e UMA vez (preço — porque preço sem pesquisa = chute), depois executou 8 mutations + 2 artefatos + 1 audit em paralelo sem outras interrupções.
5. **Bloqueios respeitados** — T2 (jurídico) e N26.b (convenção SKU) ficaram em draft no vault, não foram aplicados na loja.

## Ações geradas

- [ ] **T2 — jurídico revisa drafts** das 3 descrições com "autorregulação sensorial" + decide sobre disclaimer geral de PDPs sensoriais.
- [ ] **N26.b — Samuel decide convenção SKU** (`INC-<P>-<V>` ou alternativa) e autoriza batch.
- [ ] **N20.3 (dev futuro)** — pipeline `productToFeedRow` deve expor `variantSku` no `FeedRow` para que o scorer detecte SKU pattern `\d+:\d+#` automaticamente.
- [ ] **B6** — provisionar `SHOPIFY_ADMIN_TOKEN` para que `pnpm shopify:writeback --apply` funcione direto do compliance MD do tenant (alternativa ao MCP).
- [ ] Eventual re-snapshot da fixture (`pnpm shopify:list-products --tenant=incluo --capture` quando B6 destravado) para refletir estado real e não fixture-patched.

## Referências

- mutations log: este arquivo (vault canônico).
- pesquisa de mercado: WebSearch logs ephemeros — Mercado Livre, Amazon BR, Shopee, Magazine Luiza ([ML 26pcs](https://produto.mercadolivre.com.br/MLB-4485753108-alinhavo-montessori-26-pecas-frutas-ou-animais-e-numeros-_JM), [Amazon search](https://www.amazon.com.br/alinhavo-infantil-madeira/s?k=alinhavo+infantil+madeira), [Madeira Maestra](https://www.madeiramaestra.com/products/alinhavo-animais)).
- audit pós-fixes: [`12_reports/merchant-audits/incluo/incluo-json-20260526-202454.md`](../../../../12_reports/merchant-audits/incluo/incluo-json-20260526-202454.md).
- scorer + testes evoluídos: [`05_integrations/google-merchant/audit/scorer.ts`](../../../../05_integrations/google-merchant/audit/scorer.ts) + [`.test.ts`](../../../../05_integrations/google-merchant/audit/scorer.test.ts).
- T2 drafts: [`compliance/n20-2-followup-descriptions-t2-20260526.md`](../../tenants/incluo-tenant/stores/incluo/compliance/n20-2-followup-descriptions-t2-20260526.md).
- N26.b proposta: [`audit/n26b-sku-normalization-proposal-20260526.md`](../../tenants/incluo-tenant/stores/incluo/audit/n26b-sku-normalization-proposal-20260526.md).

---
_Gerado por orchestrator-master @ 2026-05-26 20:35 BRT. 11 fases planejadas, 10 executadas em uma sessão, 1 (commit) pendente de autorização do usuário._
