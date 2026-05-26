---
created_at: 2026-05-25T22:10:16.504Z
updated_at: 2026-05-25T22:45:00.000Z
tags: [merchant, audit, catalog, incluo, n26, n201]
source: agent:catalog-feed-ops
kind: audit
result: green
confidence: 1.0
related:
  - 12_reports/merchant-audits/incluo-json-20260525-221016.md
  - 12_reports/merchant-audits/incluo-json-20260525-223942.md
  - 08_data/fixtures/incluo-catalog-real.json
---

# N26 — Merchant audit em catálogo real Incluo (json, 50 SKUs)

## Contexto

Primeiro confronto do scorer determinístico (`pnpm merchant:audit`) com catálogo real. Loja: **Incluo** (incluobrasil.com, BR, BRL, Basic plan, foco em fidget toys, brinquedos sensoriais Montessori, neurodivergência). Dados puxados via MCP `claude_ai_Shopify` (50 produtos via `search_products` ordenado por `CREATED_AT`), convertidos para `ShopifyProductInput` JSON em [`08_data/fixtures/incluo-catalog-real.json`](../../../../08_data/fixtures/incluo-catalog-real.json).

## O que aconteceu

- **50 SKUs** carregados via JSON, **score médio 81.9/100** (vs 37.4 da fixture sintética).
- Distribuição: **49🟢 / 0🟡 / 1🔴**. Catálogo Incluo está em estado muito mais saudável do que a fixture deliberadamente quebrada.
- 122 findings totais distribuídos em apenas **4 códigos distintos**: gtin:missing (50), googleProductCategory:missing (50), title:no-brand (21), validation:price.amount (1).
- Exit code 1 (esperado, pelo único red SKU) — o gate de CI funciona.

## Achados / decisões

### Achados reais do catálogo (acionáveis no Shopify)

1. **`contas-madeira-montessori-animais-frutas-coordenac` tem price = 0** — único critical real. Provavelmente: variant sem preço configurado OU variant Default = $0 que está sendo selecionado como `minVariantPrice`. **Ação:** abrir o produto no Shopify e corrigir o preço.
2. **0 de 50 SKUs têm GTIN/UPC/EAN exposto** — não temos mapeamento via `search_products` (pode existir em `variant.barcode` mas não checamos). Para a categoria "brinquedos educacionais", GTIN geralmente é opcional. **Ação:** ou (a) decidir oficialmente `identifier_exists=false` para o catálogo, ou (b) começar a popular barcode em SKUs que tenham EAN do fornecedor.
3. **0 de 50 SKUs têm googleProductCategory mapeado** — todos os produtos provavelmente caem em `Toys & Games > Toys > Educational Toys` (ID 3793). **Ação:** criar mapeamento `productType Shopify → GMC taxonomy` para os ~6 productTypes ativos da Incluo.
4. **21 de 50 títulos longos não levam com "Incluo"** — todos os títulos > 70 chars que não mencionam a marca. Catálogo tem marca presente (Vendor = "Incluo" em 100% dos casos), mas título não exibe. **Ação:** template "Incluo {original title}" para títulos > 70 chars OU adicionar regra que substitua quando vendor está populado.

### Achados sobre o scorer (gaps de regra)

1. **MCP `search_products` retorna `description` truncada** ("..."). Por sorte o scorer só flagou `description:too-short` se < 100 chars, e a maioria das descrições truncadas tinha ~150 chars, então não disparou. Mas o scorer não sabe que está vendo dado truncado — pode dar falso positivo/negativo. **Ação:** quando rodar via `--source=shopify` direto (com creds), buscar `descriptionHtml` completo via Admin GraphQL.
2. **`title:no-brand` só dispara quando title > 70 chars.** Threshold pode ser baixo demais — vários títulos < 70 chars também se beneficiariam de prefixar com brand. Considerar disparar para todos quando `vendor` existe e brand não está no início.
3. **`gtin:missing` é uniforme (medium)** — não diferencia categorias. Para brinquedos educacionais é OK; para eletrônicos seria critical. Confirma **N20.1** (presets por categoria) como próxima evolução natural.

## Impacto

- **N26 validado**: o sistema sai do "audit sintético" e tem primeira leitura real de catálogo. Loop de melhoria contínua oficialmente aberto.
- **1 SKU red real** identificado e acionável (price=0) — quick win.
- **2 sistêmicos** identificados (GTIN + googleProductCategory) — decisão de produto sobre como tratar (mapear ou desligar via `identifier_exists`).
- **1 cosmético** (brand no título) — operação simples via Shopify bulk edit.
- **3 gaps no scorer** documentados para N20.1 (presets por categoria, threshold de brand, descrição truncada).

## Ações geradas

- [ ] **N26.a-d**: ver análise consolidada com reads MCP completos + propostas de write em [`12_reports/merchant-audits/incluo-n26-followup-analysis.md`](../../../../12_reports/merchant-audits/incluo-n26-followup-analysis.md). Inclui:
  - N26.a: SKU red diagnosticado (single variant `Animal 24PCS`, price=0, descrição rica). Esperando decisão de preço.
  - N26.b: 0/50 SKUs com barcode populado — recomendação `identifier_exists=false` global.
  - N26.c: 35 productTypes consolidados em 2 buckets GMC (47→3793 Educational Toys, 3→5872 Massagers).
  - N26.d: 21 títulos before/after listados; decisão entre bulk MCP vs Shopify admin.
- [ ] **N20.1** (dev): scorer ganha presets por categoria + threshold ajustável + flag de "dado truncado" — ver [next-actions.md](../next-actions.md#n201).
- [ ] Re-rodar `pnpm merchant:audit --source=json --file=08_data/fixtures/incluo-catalog-real.json --tenant=incluo` após N26.a + N26.d para medir delta.

---

## Re-run pós N20.1 (mesmo snapshot, scorer evoluído) — 2026-05-25 22:39 UTC

**Comando:** `pnpm merchant:audit --source=json --file=08_data/fixtures/incluo-catalog-real.json --tenant=incluo --gmc-default=3793 --capture`

| Métrica | Run 1 (scorer original) | Run 2 (com N20.1 + `--gmc-default=3793`) | Δ |
|---|---|---|---|
| Score médio | 81.9 | **93.2** | +11.3 |
| 🟢 green | 49 | 49 | 0 |
| 🟡 yellow | 0 | 1 | +1 |
| 🔴 red | 1 | 0 | −1 |
| 🔴 critical findings | 1 | 1 (mesmo SKU price=0) | 0 |
| 🟠 high | 0 | 0 | 0 |
| 🟡 medium | 100 | **0** | −100 |
| 🔵 low | 21 | 100 | +79 |

**Por que mudou:**

- `gtin:missing` para Educational Toys (3793) saiu de `medium` (-8 cada) para `low` (-3 cada) → 50 SKUs × Δ5 = +250 pontos no agregado.
- `googleProductCategory:missing` desapareceu porque o `defaultGmcCategoryId=3793` preenche o campo na transformação.
- `title:no-brand` agora dispara sempre que `vendor` existe e brand não está no título (era só > 70 chars) → de 21 → 50 ocorrências; severidade segue `low`.
- 1 SKU virou 🟡 yellow ao invés de 🔴 red: `contas-madeira-montessori` segue com price=0 (critical), mas as outras 2 findings dele desceram de severidade. Score 40+3+3 = 54, banda yellow.

**O que isto valida:**

- N20.1 entregue: 3 regras evoluídas exatamente nas dimensões que o N26 expôs (description truncation aware, title:no-brand always-on, gtin severity by category).
- Scorer agora distingue **ruído sistêmico do catálogo** (gtin baixo para brinquedos educacionais — esperado) de **problema operacional real** (1 SKU com preço esquecido).
- Próxima re-run depois de N26.a (fix do preço) deve dar **100% green**.

## Referências

- relatório original (run 1): [`12_reports/merchant-audits/incluo-json-20260525-221016.md`](../../../../12_reports/merchant-audits/incluo-json-20260525-221016.md)
- relatório pós-N20.1 (run 2): [`12_reports/merchant-audits/incluo-json-20260525-223942.md`](../../../../12_reports/merchant-audits/incluo-json-20260525-223942.md)
- fixture do snapshot: [`08_data/fixtures/incluo-catalog-real.json`](../../../../08_data/fixtures/incluo-catalog-real.json)
- código scorer: [`05_integrations/google-merchant/audit/scorer.ts`](../../../../05_integrations/google-merchant/audit/scorer.ts)
- análise consolidada N26.a/b/c/d: [`12_reports/merchant-audits/incluo-n26-followup-analysis.md`](../../../../12_reports/merchant-audits/incluo-n26-followup-analysis.md)

---
_Versão enriquecida do auto-capture original (overwritten pela re-run, restaurada do git + ampliada com seção N20.1)._
