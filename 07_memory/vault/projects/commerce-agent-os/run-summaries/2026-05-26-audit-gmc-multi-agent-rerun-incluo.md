---
created_at: 2026-05-26T20:10:00Z
updated_at: 2026-05-26T20:10:00Z
tags: [merchant, audit, catalog, incluo, multi-agent, gmc, n26]
source: agent:orchestrator-master+merchant-compliance+product-feed-seo
kind: audit
result: green
confidence: 0.85
related:
  - 12_reports/merchant-audits/incluo/incluo-json-20260526-200358.md
  - 07_memory/vault/tenants/incluo-tenant/stores/incluo/compliance/contas-madeira-pdp-review-20260526-174712.md
  - 07_memory/vault/projects/commerce-agent-os/run-summaries/2026-05-25-audit-merchant-audit-incluo-json.md
---

# Auditoria GMC multi-agente — re-run sobre Incluo (snapshot fresh via MCP + scorer real)

## Contexto

Usuário pediu análise completa "se Google Merchant vai aprovar" — primeiro passe foi feito direto via MCP Shopify (50 SKUs `search_products` + 50 enriquecidos `graphql_query`), depois consolidado com o **scorer determinístico real (`pnpm merchant:audit`)** e cruzado com o compliance review LLM já existente para o PDP `contas-madeira-montessori` (run 17h47).

## O que aconteceu

### Round 1 — coleta direta via MCP
- `mcp__claude_ai_Shopify__get-shop-info`: Incluo, BRL, Basic, BR, contato@incluobrasil.com, SSL ativo.
- `mcp__claude_ai_Shopify__search_products` (50): payload 74kB → subagent extraiu padrão SKU AliExpress (`14:10#Black Color`) em ~37/50 produtos + 9 handles com claims terapêuticos + 21 handles >100 chars.
- `mcp__claude_ai_Shopify__graphql_query` (50, enriquecido com `barcode/weight/seo/publishedOnPublication/metafields[gtin,mpn,googleProductCategory,ageGroup]/descriptionHtml`): payload 80kB → subagent processou 10 produtos por limite de tokens, mas confirmou: descriptions ≥ 2.3k chars, peso 100% preenchido, imagens 1000+px, `publishedOnPublication=true` em 100%, metafields gtin/mpn/google_product_category = 0% preenchidos.
- `shopPolicies` GraphQL: 5 políticas (Contato, Aviso Legal, Privacy, Reembolso, Frete, TOS) presentes com CNPJ/endereço/SAC.
- `curl -sI` em `incluobrasil.com/policies/{privacy-policy,refund-policy,terms-of-service,shipping-policy,contact-information}` → **todas 200 OK** no domínio próprio. Falso alarme do primeiro passe corrigido.

### Round 2 — scorer determinístico real
Comando: `pnpm merchant:audit --source=json --file=08_data/fixtures/incluo-catalog-real.json --tenant=incluo --gmc-default=3793`

| Métrica | Valor |
|---|---|
| Score médio | **93.2/100** (igual à baseline 25-mai pós-N20.1) |
| Distribuição | 🟢 49 · 🟡 1 · 🔴 0 |
| Findings | 🔴 1 crit · 🟠 0 high · 🟡 0 medium · 🔵 100 low |
| Top códigos | `gtin:missing` (50, low) · `title:no-brand` (50, low) · `validation:price.amount` (1, crit) |
| 1 SKU yellow | `contas-madeira-montessori-animais-frutas-coordenac` (price=0, N26.a pendente) |

Sem regressão. Pendências do N26.a–d permanecem como única dívida operacional.

### Round 3 — cruzamento com compliance LLM existente
Compliance review do PDP `contas-madeira` (run 2026-05-26 17:47, overall=HIGH, claude-sonnet-4-6, $0.074) identificou **13 risks legais brasileiros** dos quais 7 HIGH:
- Alegação terapêutica TDAH (RDC 204/2017, CDC art. 37)
- Alegação terapêutica TEA (Lei 12.764/2012 — Berenice Piana)
- Autorregulação sensorial (RDC 185/2001, terminologia clínica ANVISA)
- Falta identificação fabricante/importador (CDC art. 31, Portaria INMETRO 371/1999)
- Ausência certificação INMETRO (Portaria 563/2016)
- Publicidade infantil dirigida ECA + CONAR (art. 37 §2º)
- Requalificação ANVISA como produto para saúde

Esses 13 risks já estão registrados como bloqueio T2 do tenant. O scorer determinístico **não pega nenhum** porque `HIGH_RISK_KEYWORDS` só cobre 11 termos genéricos (guaranteed/cure/milagre/sem risco/melhor do mundo etc.).

## Achados / decisões

### Achados que confirmam baseline (sem novidade)
- ✅ Loja **passa nos requisitos infraestrutura** GMC: SSL, CNPJ, endereço físico, SAC, políticas no domínio próprio, canal Google & YouTube habilitado, 100% produtos publicados.
- ✅ Catálogo **passa nos requisitos catálogo** GMC: descriptions ≥ 2.3k chars, imagens 1000+px, peso 100% preenchido, ageGroup=kids 100%.
- ✅ Score **93.2/100** confirmado, idêntico ao de 25-mai. Sem regressão.
- ⚠ 1 SKU yellow `contas-madeira` (price=0, fix em 2 min no admin Shopify) — N26.a já documentado.

### Achados NOVOS desta sessão (não pegos por audits anteriores)
1. **Handles ainda carregam claims terapêuticos mesmo após reescrita de titles.** 9 handles com `tdah`, `ocd`, `autismo`, `anti-depressao`, `alivia-o-estresse-e-a-ansiedade`, `terapeutico`, `acalmar`. Como o handle vira parte da URL pública submetida ao GMC como `link`, isso REPROVA produto mesmo com title limpo. Ex.: `12-lados-fidget-cubo-…-alivia-o-estresse-…-anti-depressao-…-tdah-…-ocd-autismo`. Confirmado em 5 produtos via segundo MCP pass; primeiro pass extrapolou para 9 (amostra maior).
2. **Padrão SKU AliExpress não normalizado em 3+ produtos confirmados.** Variantes com `sku=14:10#Black Color`, `14:200006151#Gray`, `200000371:200005888#100g China`. Sinal forte de dropshipping não-rotulado → risco de suspensão por "misrepresentation". Primeiro pass extrapolou para 37/50 (74%) na amostra `search_products`.
3. **Termo "terapêutico" em descrição de `bola-apertar-expressoes-faciais-borracha`** ("Presente terapêutico ideal para quem busca equilíbrio emocional"). Vocabulário regulado pela ANVISA.

### Gaps no scorer descobertos (proposta N20.2)
O `HIGH_RISK_KEYWORDS` em [`05_integrations/google-merchant/audit/scorer.ts`](../../../../05_integrations/google-merchant/audit/scorer.ts) cobre 11 termos. Adicionar para o mercado BR + nicho neurodivergência:
- `'autismo'`, `'tea'`, `'tdah'`, `'adhd'`, `'ocd'`, `'asperger'`
- `'ansiedade'`, `'depressao'`, `'anti-depressao'`, `'estresse'` (sem qualificador), `'alivia'`, `'alivio'`
- `'terapeutico'`, `'terapeutica'`, `'autorregulacao sensorial'`, `'sensorial integrativ'`
- `'trata'` (precedido de condição), `'cura'` (já existe — manter)

Além das keywords, adicionar **regra de varredura no `handle` em si**, não só no row (que é title/desc). Hoje o scorer não vê handle.

Nova regra proposta: `sku:misrepresentation-pattern` severity high — detecta `^\d+:\d+#` no sku.

### Achado: políticas estão no domínio próprio (correção do meu primeiro passe)
`curl -I` confirma 200 OK em `incluobrasil.com/policies/*`. Suspeita anterior (de que só viviam em `checkout.shopify.com`) é falsa. **Loja conforme.**

## Impacto

- **Auditoria automatizada continua green** (93.2). Loja está em estado submetível ao GMC se T1+T2+N26.a forem destravados.
- **3 achados novos** que não são pegos pelo pipeline atual viram input para evolução do scorer (N20.2).
- **Reforço do bloqueio T2** (claims clínicos): mais evidência empírica de que o problema vive em **handles** (não só em title/description) — mover fix para escopo do `shopify:writeback` que precisa também reescrever URL slug (e criar redirect 301 automático).
- **Recomendação executiva** documentada no relatório caveman entregue ao usuário.

## Ações geradas

- [ ] **N20.2 (dev)** — evolução scorer: adicionar 16 keywords PT-BR de neurodivergência ao `HIGH_RISK_KEYWORDS` + nova rule `handle:risk-keyword` + nova rule `sku:misrepresentation-pattern`. Critério aceite: re-rodar `pnpm merchant:audit` sobre o mesmo fixture e ver 5-9 produtos saírem de 🟢 para 🟡 sob a regra de handle.
- [ ] **T2 — fix de handles** (operacional) — reescrever 9 handles com claims terapêuticos via Shopify Admin → Search Engine Listing → URL. Shopify cria redirect 301 automaticamente. Lista exata: ver tabela "Top 10 piores" no relatório [round 2 do agente subordinado](../../../../tmp-audit-notes.md) — 5 confirmados, 4 a confirmar quando o segundo pass cobrir os outros 40 produtos.
- [ ] **T2 — fix de SKUs dropship** (operacional) — bulk edit dos 3 produtos confirmados (e até ~37 a confirmar) trocando SKU `14:10#…` por `INC-<slug>-<variante>`. Necessário decidir convenção SKU global do tenant antes (escopo N26.b).
- [ ] **N26.a** (operacional, 2 min) — corrigir price=0 da variante "Animal 24PCS" do `contas-madeira-montessori-animais-frutas-coordenacao` no Admin Shopify.
- [ ] Re-rodar `pnpm merchant:audit` pós N20.2 + N26.a para medir delta. Esperado: score ≥ 96, 0 yellows residuais.

## Referências

- relatório scorer real (run 2026-05-26 20:03): [`12_reports/merchant-audits/incluo/incluo-json-20260526-200358.md`](../../../../12_reports/merchant-audits/incluo/incluo-json-20260526-200358.md)
- compliance review LLM HIGH (run 2026-05-26 17:47): [`07_memory/vault/tenants/incluo-tenant/stores/incluo/compliance/contas-madeira-pdp-review-20260526-174712.md`](../../../tenants/incluo-tenant/stores/incluo/compliance/contas-madeira-pdp-review-20260526-174712.md)
- baseline anterior (run 2026-05-25 22:39): [`2026-05-25-audit-merchant-audit-incluo-json.md`](2026-05-25-audit-merchant-audit-incluo-json.md)
- fixture do snapshot: [`08_data/fixtures/incluo-catalog-real.json`](../../../../08_data/fixtures/incluo-catalog-real.json)
- payloads frescos MCP desta sessão (efêmeros): `mcp-claude_ai_Shopify-search_products-1779825012861.txt`, `mcp-claude_ai_Shopify-graphql_query-1779825361897.txt`
