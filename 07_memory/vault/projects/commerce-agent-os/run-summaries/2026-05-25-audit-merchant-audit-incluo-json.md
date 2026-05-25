---
created_at: 2026-05-25T22:10:16.504Z
updated_at: 2026-05-25T22:30:00.000Z
tags: [merchant, audit, catalog, incluo, n26]
source: agent:catalog-feed-ops
kind: audit
result: red
confidence: 1.0
related:
  - 12_reports/merchant-audits/incluo-json-20260525-221016.md
  - 12_reports/merchant-audits/incluo-json-20260525-221016.json
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

- [ ] **N26.a** (ops): corrigir price = 0 no SKU `contas-madeira-montessori-animais-frutas-coordenac` no admin Shopify.
- [ ] **N26.b** (produto): decidir política GTIN para o catálogo Incluo (mapear via barcode OU `identifier_exists=false`).
- [ ] **N26.c** (produto): mapear productType Shopify → Google Product Taxonomy (6-8 productTypes ativos).
- [ ] **N26.d** (ops): rodar bulk edit no Shopify adicionando "Incluo" no início de títulos > 70 chars que não mencionam a marca.
- [ ] **N20.1** (dev): scorer ganha presets por categoria + threshold ajustável + flag de "dado truncado" — ver [next-actions.md](../next-actions.md#n201).
- [ ] Re-rodar `pnpm merchant:audit --source=json --file=08_data/fixtures/incluo-catalog-real.json --tenant=incluo` após N26.a + N26.d para medir delta.

## Referências

- relatório: [`12_reports/merchant-audits/incluo-json-20260525-221016.md`](../../../../12_reports/merchant-audits/incluo-json-20260525-221016.md)
- payload bruto: [`12_reports/merchant-audits/incluo-json-20260525-221016.json`](../../../../12_reports/merchant-audits/incluo-json-20260525-221016.json)
- fixture do snapshot: [`08_data/fixtures/incluo-catalog-real.json`](../../../../08_data/fixtures/incluo-catalog-real.json)
- código scorer: [`05_integrations/google-merchant/audit/scorer.ts`](../../../../05_integrations/google-merchant/audit/scorer.ts)

---
_Versão enriquecida do auto-capture original gerado por `@cao/brain-bridge.captureRun`._
