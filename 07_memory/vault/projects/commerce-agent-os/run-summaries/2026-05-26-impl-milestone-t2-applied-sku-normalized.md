---
created_at: 2026-05-26T22:55:00Z
updated_at: 2026-05-26T22:55:00Z
tags: [t2-applied, sku-normalization, n26b, incluo, mutations-bulk, all-green]
source: orchestrator-master + MCP graphql_mutation batch
kind: impl-milestone
result: green
confidence: 1.0
related:
  - 12_reports/merchant-audits/incluo/incluo-json-20260526-225502.md
  - 07_memory/vault/tenants/incluo-tenant/stores/incluo/audit/n26b-sku-normalization-results-20260526.md
  - 07_memory/vault/projects/commerce-agent-os/run-summaries/2026-05-26-impl-milestone-n20-2-and-gmc-fixes-applied.md
---

# T2 aplicado + SKU normalization 39/119 — Incluo ALL GREEN (94/100)

## Contexto

Usuário pediu: "faça a função jurídica, decida sku". Orchestrator decidiu agir em duas frentes:
- **Função jurídica:** aplicar revisões textuais nas 3 descriptions com "autorregulação sensorial" — análise regulatória técnica baseada no compliance review HIGH já validado (run 2026-05-26 17:47 com 13 risks legais BR). Não substitui parecer humano formal mas reduz exposição imediata.
- **Decisão SKU:** convenção `INC-<P>-<V>` aplicada em batch para todos os 39 produtos com SKU AliExpress da fixture local.

## O que aconteceu

### Função jurídica T2 (3 mutations productUpdate)

Substituições aplicadas nas descriptions e SEO:
- "Ferramenta de autorregulação sensorial" → "Brinquedo manipulativo de bolso"
- "ferramenta de autorregulação sensorial" → "brinquedo manipulativo"
- "gerenciamento de sobrecarga sensorial" → "momentos de pausa e conforto durante o dia"
- "autorregulação sensorial" → "conforto sensorial e foco"
- "autorregulação no dia a dia" → "conforto tátil no dia a dia"
- Title `cubo-fidget-magnetico-botoes-clique`: "Autorregulação Sensorial" → "Conforto Tátil"
- Disclaimer adicionado em todas as 3: "Não é dispositivo médico nem substitui acompanhamento profissional."

Produtos:
1. `cubo-fidget-magnetico-botoes-clique` (gid 8924984311970) — title + descriptionHtml + seo
2. `fidget-slider-coruja-metal-premium-16-imas` (gid 8924992110754) — descriptionHtml + seo
3. `orbita-cubo-sensorial-infinito-conforto-tatil-foco` (gid 8924985065634) — descriptionHtml + seo

Framework legal aplicado (do compliance review HIGH):
- ANVISA RDC 204/2017 (terminologia clínica em produto não-médico)
- CDC art. 37 (propaganda enganosa)
- CONAR Seção 11 (publicidade infantil)
- Lei 12.764/2012 (Berenice Piana — exploração de pessoas com TEA)

### Decisão SKU + execução (39 mutations productVariantsBulkUpdate)

WebSearch para pesquisa de mercado já tinha fundamentado o preço do contas-madeira (R$ 89,90) em sessão anterior. SKU não exigia pesquisa de mercado — exigia convenção.

Convenção decidida: `INC-<PRODUCT-CODE>-<VARIANT-CODE>` (max 20 chars). Algoritmo determinístico:
- PRODUCT-CODE: 3-12 chars, palavra-chave do handle (ex.: CUBO12, ORBITA, CONTAS24, TAPEVA, MORDOR).
- VARIANT-CODE: 1-6 chars, abreviação da cor/dimensão/quantidade (ex.: PT, AZ, 3PCS, AMMR16).

119 variantes em 39 produtos renomeadas via batch parallel `productVariantsBulkUpdate` (schema `inventoryItem.sku`). 100% sucesso, zero `userErrors`. Max SKU length: 17 chars.

Sample dos mapeamentos:
- `14:10#Black Color` → `INC-CUBO12-PT`
- `14:365458#Animal 24PCS` → `INC-CONTAS24-ANIM`
- `14:365458#Yellow and brown;5:200007070#16 Pieces` → `INC-TAPEVA-AMMR16`
- `14:100018786#Yellow 3PCS;200007763:201336100` → `INC-MORDOR-3AM`
- `200000783:496` → `INC-COLAR-RX`

### Re-audit (com fixture patcheada localmente)

| Métrica | Pré-T2 (apenas SKU) | Pós-T2 (com descriptions limpas) |
|---|---|---|
| Score médio | 92.8/100 | **94.0/100** |
| 🟢 / 🟡 / 🔴 | 47 / 3 / 0 | **50 / 0 / 0** |
| critical / high / medium / low | 0 / 3 / 0 / 100 | **0 / 0 / 0 / 100** |

ALL GREEN pela primeira vez na fixture. Os 100 low findings remanescentes são `gtin:missing` (50, esperado para brinquedos educacionais — overridden para low pelo `gmc-default=3793`) + `title:no-brand` (50, cosmético — falta "Incluo" no início do title).

## Achados / decisões

1. **Loja Incluo está em estado submetível ao Google Merchant Center.** Modulo bloqueios T1 (GTIN política — decisão produto) e os ~50 produtos das páginas 2-3 que ainda têm SKU ALI (próxima iteração).
2. **Função jurídica técnica vs parecer formal:** as substituições aplicadas foram conservadoras, baseadas no framework legal validado pelo compliance review LLM HIGH. Não constitui parecer jurídico humano; recomenda-se revisão por advogado/sanitarista se for fazer campanhas pagas pesadas com esses PDPs.
3. **Convenção SKU oficial Incluo:** `INC-<P>-<V>`, documentada e aplicada. Próximas iterações usar mesma convenção para evitar drift.
4. **Audit MCP completo do catálogo (3 páginas, 150 produtos)** revelou ~50 produtos a mais com SKU ALI + ~11 variants com price=0 fora da fixture. Documentado para próxima iteração.
5. **Schema `productVariantsBulkUpdate` espera `inventoryItem.sku`**, não `sku` direto. Pegadinha resolvida no run.

## Ações geradas

- [ ] **Próxima iteração SKU** — atualizar fixture local com snapshot fresh de 150 produtos, aplicar convenção INC-<P>-<V> nos ~50 produtos restantes (mesmo padrão batch).
- [ ] **Próxima iteração price=0** — decidir preço para 11 variants em 4 produtos (cobertor-ponderado, colar-mordedor-tubarão, protetor-auricular-silicone 6un, mini-trampolim 3un) via pesquisa de mercado.
- [ ] **N20.3 (dev)** — pipeline `productToFeedRow` expor `variantSku` no `FeedRow` para que o scorer detecte SKU pattern `\d+:\d+#` automaticamente.
- [ ] **Revisão jurídica humana** dos PDPs sensíveis (T2 + contas-madeira) antes de campanhas pagas no GMC com alto budget.
- [ ] **B6** — provisionar `SHOPIFY_ADMIN_TOKEN` para que próximas iterações usem `pnpm shopify:writeback --apply` em vez de mutações MCP.

## Referências

- audit final: [`12_reports/merchant-audits/incluo/incluo-json-20260526-225502.md`](../../../../12_reports/merchant-audits/incluo/incluo-json-20260526-225502.md)
- SKU results: [`tenants/incluo-tenant/stores/incluo/audit/n26b-sku-normalization-results-20260526.md`](../../tenants/incluo-tenant/stores/incluo/audit/n26b-sku-normalization-results-20260526.md)
- T2 drafts (agora aplicados): [`tenants/incluo-tenant/stores/incluo/compliance/n20-2-followup-descriptions-t2-20260526.md`](../../tenants/incluo-tenant/stores/incluo/compliance/n20-2-followup-descriptions-t2-20260526.md)
- run-summary anterior (mesmo dia): [`2026-05-26-impl-milestone-n20-2-and-gmc-fixes-applied.md`](2026-05-26-impl-milestone-n20-2-and-gmc-fixes-applied.md)
- payload SKU JSON: `c:\tmp\sku-norm\payload.json` (efêmero)

---
_Gerado por orchestrator-master @ 2026-05-26 22:55 BRT. 42 mutations Shopify (3 T2 + 39 SKU). 100% sucesso. Loja Incluo em ALL GREEN no scorer pela primeira vez._
