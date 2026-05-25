# N26 follow-up — análise consolidada do catálogo Incluo

Documento operacional. Reúne os 4 reads de investigação (N26.a/b/c/d) feitos via MCP Shopify + análise local do snapshot. Cada seção termina com **proposta de write** com nível de risco. Nenhuma escrita foi feita ainda.

- **Loja:** Incluo (incluobrasil.com, BR, BRL, Basic plan)
- **Catálogo analisado:** 50 SKUs (snapshot 2026-05-25)
- **Audit base:** [incluo-json-20260525-221016.md](incluo-json-20260525-221016.md) — score médio 81.9/100
- **Run-summary:** [run-summary 2026-05-25](../../07_memory/vault/projects/commerce-agent-os/run-summaries/2026-05-25-audit-merchant-audit-incluo-json.md)

---

## N26.a — SKU red (price = 0)

**Produto:** Contas de Madeira Montessori - Alinhavo Educativo Animais e Frutas
- GID: `gid://shopify/Product/8925013246114`
- Variant ID: `gid://shopify/ProductVariant/46629597577378` ("Animal 24PCS")
- SKU: `14:365458#Animal 24PCS`
- **Price atual: BRL 0.00** ← problema
- Inventory: 35 unidades (NÃO arquivado; ATIVO no storefront)
- Description: rica e completa (~3.500 chars; specs, benefícios, faixa etária 3+, material atóxico)
- 3 imagens válidas
- Tags: coordenação, montessori, motricidade fina

**Diagnóstico:** product cadastrado com tudo certo (descrição, imagens, inventário) **menos** o preço. Mostra a R$ 0,00 no storefront agora.

**Comparáveis no catálogo Incluo:**
- Quebra-cabeça Montessori 7em1: R$ 284,90 – R$ 344,90
- Busy Book Montessori em Feltro: R$ 224,90
- Busy Board Montessori: R$ 189,90 – R$ 244,90
- Brinquedo Montessori classificação: R$ 204,90
- Brinquedo Educativo Matemática Feltro: R$ 64,90

**Faixa sugerida:** R$ 79,90 – R$ 129,90 (24 peças de madeira + cordões alinhavo é mais simples que busy board, mais complexo que flashcards).

**Proposta de write — N26.a:**
- 🔴 **Alto impacto, mas reversível.** Atualizar `variant.price` via `productVariantsBulkUpdate` mutation.
- **Decisão pendente:** você define o preço.
- **Comando MCP a executar (depois de definir preço):** `graphql_mutation` com `productVariantsBulkUpdate` no productId `8925013246114`, variant `46629597577378`, novo price.

---

## N26.b — Política GTIN

**Read:** consultei `barcode` de todas as variants de todos os 50 produtos via GraphQL.

**Resultado:** **0 de 50 produtos** têm barcode (GTIN) populado. Padrão:
- ~24 produtos com SKU pattern `INC-XXX` (próprio da Incluo) → barcode null
- ~26 produtos com SKU pattern `14:NNNN#YYY` (DSers/AliExpress import) → barcode null
- 1 produto (tapete acupressão) com `barcode: ""` (string vazia, equivale a null)

**Diagnóstico:** o catálogo é majoritariamente importado via DSers de fornecedores chineses sem GTIN registrado, OU produtos artesanais/sob demanda sem EAN. Tentar mapear GTIN um a um é inviável.

**Solução recomendada (GMC standard):** marcar `identifier_exists = false` no metafield Google de cada produto. Isso diz ao GMC: "estes produtos não têm identificador único — não me penalize por isso". Funciona para 90%+ dos casos de catálogo curado/importado.

**Proposta de write — N26.b:**
- 🟠 **Médio impacto, totalmente reversível.** Setar metafield `google.identifier_exists = false` em 50 produtos via `productUpdate` mutation (loop ou bulk).
- **Decisão pendente:** confirmar que política `identifier_exists=false` é correta para todo o catálogo. (Se algum SKU futuro vier com GTIN do fornecedor, basta sobrescrever o metafield naquele SKU.)
- **Comando MCP a executar:** 50 chamadas `graphql_mutation` com `productUpdate` adicionando metafield. Posso fazer em lote.

---

## N26.c — Google Product Taxonomy mapping

**Read local:** o catálogo tem **35 productTypes distintos para 50 SKUs** — drift forte (ex.: "Brinquedos Antiestresse e Fidget" vs "Brinquedos Antiestresse e Fidget Premium" vs "Brinquedos Sensoriais e Fidget" vs "Brinquedos Sensoriais Fidget").

**Análise:** 90% dos productTypes consolidam em **uma única categoria GMC**: Educational Toys. ~3 SKUs (massagem/acupressão) consolidam em outra.

### Mapeamento proposto

| Bucket | Patterns que caem aqui | GMC Category ID | GMC name |
|---|---|---|---|
| **Educacional / Sensorial / Fidget** | tudo que contém "Brinquedos", "Materiais", "Jogos", "Tapetes Educativos", "Acessórios Sensoriais", "Livros Sensoriais", "Temporizadores Educativos", "Materiais Sensoriais", "Materiais Terapêuticos Sensoriais" | **3793** | Toys & Games > Toys > Educational Toys |
| **Massagem / Reflexologia** | "Equipamentos de Massagem*", "Equipamentos de Reflexologia Terapêutica", "Ferramentas de Massagem e Relaxamento" | **5872** | Health & Beauty > Personal Care > Massage & Relaxation > Massagers |
| _(1 SKU sem productType)_ | sem categoria definida | _(definir manualmente)_ | _(definir manualmente)_ |

### Estatística

- 47 SKUs → `3793` (Educational Toys)
- 3 SKUs → `5872` (Massagers) — tapete de acupressão, almofada de massagem podal, bola de massagem amendoim
- 0 SKUs sem mapping óbvio (após preenchimento do productType faltante)

**Bônus:** considerar limpar productTypes internos para 5-8 valores canônicos. Hoje o operador escolhe novo productType a cada cadastro; a consolidação ajuda também Shopify navigation/filters.

**Proposta de write — N26.c:**
- 🟠 **Médio impacto, totalmente reversível.** Setar metafield `google.google_product_category = "3793"` (ou `"5872"`) em cada produto via `productUpdate`.
- **Decisão pendente:** validar o mapping (especialmente os 3 produtos da categoria massagem) e confirmar se quer também consolidar productTypes Shopify internamente (esse é outro projeto).
- **Comando MCP a executar:** 50 chamadas (47 com `3793` + 3 com `5872`).

---

## N26.d — Brand prefix nos 21 títulos

**Read local:** extraídos do audit JSON os 21 SKUs com finding `title:no-brand` (títulos > 70 chars sem "Incluo").

### Lista before/after

| # | offerId | Before | After (proposto) |
|---|---|---|---|
| 1 | `fidget-pad-controlador-sensorial-foco` | Fidget Pad Controlador Sensorial - Foco, Conforto Tátil e Autorregulação | **Incluo** Fidget Pad Controlador Sensorial - Foco, Conforto Tátil e Autorregulação |
| 2 | `cubo-fidget-magnetico-botoes-clique` | Cubo Fidget Magnético com Botões de Clique - Suporte ao Foco e Autorregulação Sensorial | **Incluo** Cubo Fidget Magnético com Botões de Clique - Suporte ao Foco e Autorregulação Sensorial |
| 3 | `brinquedo-de-descompressao-criativo-orbita-bola-...` | Órbita Cubo Sensorial Infinito de Plástico - Conforto Tátil e Suporte ao Foco e Concentração | **Incluo** Órbita Cubo Sensorial Infinito de Plástico - Conforto Tátil e Suporte ao Foco e Concentração |
| 4 | `bolas-sensoriais-para-bebes-...` | Kit 6 Bolas Sensoriais Texturizadas de TPU - Mordedor, Chocalho e Estímulo Tátil para Bebês | **Incluo** Kit 6 Bolas Sensoriais Texturizadas de TPU - Mordedor, Chocalho e Estímulo Tátil para Bebês |
| 5 | `bolas-magneticas-fidget-silicone-4-texturas` | Bolas Magnéticas Fidget de Silicone com 4 Texturas - Conforto Sensorial e Foco | **Incluo** Bolas Magnéticas Fidget de Silicone com 4 Texturas - Conforto Sensorial e Foco |
| 6 | `bola-apertar-expressoes-faciais-borracha` | Bola de Apertar com Expressões Faciais em Borracha Macia - Conforto Sensorial e Autorregulação Emocional | **Incluo** Bola de Apertar com Expressões Faciais em Borracha Macia - Conforto Sensorial e Autorregulação Emocional |
| 7 | `1pc-bola-de-massagem-de-amendoim-...` | Bola Massagem Amendoim Texturizada - Alta Redução Tensão Muscular e Estímulo Tátil Profundo | **Incluo** Bola Massagem Amendoim Texturizada - Alta Redução Tensão Muscular e Estímulo Tátil Profundo |
| 8 | `fidget-slider-coruja-metal-premium-16-imas` | Fidget Slider Coruja Metal Premium - 16 Ímãs, Rolamento Giratório e Acabamento Antideslizante | **Incluo** Fidget Slider Coruja Metal Premium - 16 Ímãs, Rolamento Giratório e Acabamento Antideslizante |
| 9 | `ampulheta-brilhante-temporizador-...` | Ampulhetas Coloridas Kit 6 Tempos - Gestão Visual do Tempo e Organização de Rotinas | **Incluo** Ampulhetas Coloridas Kit 6 Tempos - Gestão Visual do Tempo e Organização de Rotinas |
| 10 | `tapete-do-assoalho-do-enigma-...` | Tapete Puzzle EVA Infantil 30x30cm - Macio, Antiderrapante e Isolante Térmico | **Incluo** Tapete Puzzle EVA Infantil 30x30cm - Macio, Antiderrapante e Isolante Térmico |
| 11 | `criancas-montessori-brinquedos-fazenda-...` | Busy Book Fazenda em Feltro - Bilíngue, Motor Fino e Estímulo Sensorial | **Incluo** Busy Book Fazenda em Feltro - Bilíngue, Motor Fino e Estímulo Sensorial |
| 12 | `busy-board-montessori-bilingue-atividades-aprender-ingles` | Busy Board Montessori Mochila - 18 Atividades de Motor Fino e Vida Prática | **Incluo** Busy Board Montessori Mochila - 18 Atividades de Motor Fino e Vida Prática |
| 13 | `livro-sensorial-preto-branco-bebe-...` | Livro Sensorial de Pano Alto Contraste - Estímulo Visual e Toque Macio 0-12m | **Incluo** Livro Sensorial de Pano Alto Contraste - Estímulo Visual e Toque Macio 0-12m |
| 14 | `quebra-cabeca-montessori-7-em-1-magnetico-bilingue` | Quebra-Cabeça Montessori 7 em 1 Magnético - Motor Fino e Alfabetização Bilíngue | **Incluo** Quebra-Cabeça Montessori 7 em 1 Magnético - Motor Fino e Alfabetização Bilíngue |
| 15 | `livro-sensorial-feltro-montessori-historias-estimulo` | Livro Sensorial de Feltro Montessori - Estímulo Tátil e Histórias Interativas | **Incluo** Livro Sensorial de Feltro Montessori - Estímulo Tátil e Histórias Interativas |
| 16 | `quadro-rotina-visual-bilingue-organizacao-infantil` | Quadro de Rotina Visual Reutilizável BPA Free - Organização e Autonomia Infantil | **Incluo** Quadro de Rotina Visual Reutilizável BPA Free - Organização e Autonomia Infantil |
| 17 | `brinquedo-educativo-matematica-contagem-numeros-feltro` | Brinquedo Educativo de Matemática em Feltro - Contagem e Estímulo Tátil | **Incluo** Brinquedo Educativo de Matemática em Feltro - Contagem e Estímulo Tátil |
| 18 | `bola-sensorial-3-em-1-mordedor-chocalho-desenvolvimento` | Bola Sensorial 3 em 1 BPA Free - Mordedor, Chocalho e Preensão para Bebês | **Incluo** Bola Sensorial 3 em 1 BPA Free - Mordedor, Chocalho e Preensão para Bebês |
| 19 | `quadro-incentivo-escolar-80-unidades-2400-adesivos` | Quadro de Incentivo Infantil com Adesivos - 80 Quadros + 2400 Adesivos Coloridos | **Incluo** Quadro de Incentivo Infantil com Adesivos - 80 Quadros + 2400 Adesivos Coloridos |
| 20 | `colar-sensorial-silicone-pingente-lagrima-autorregulacao` | Colar Sensorial de Silicone Pingente Lágrima BPA Free - Estímulo Oral e Conforto Tátil | **Incluo** Colar Sensorial de Silicone Pingente Lágrima BPA Free - Estímulo Oral e Conforto Tátil |
| 21 | `topper-sensorial-lapis-3-pecas-silicone-foco` | Topper Sensorial para Lápis em Silicone Grau Alimentício - Kit 3 Peças BPA Free | **Incluo** Topper Sensorial para Lápis em Silicone Grau Alimentício - Kit 3 Peças BPA Free |

Todos os 21 títulos pós-mudança ficam entre 80-114 chars — bem dentro do limite GMC de 150.

**Proposta de write — N26.d:**
- 🔴 **Alto impacto.** Title é meta-tag visível no Google search, em anúncios pagos, em emails de pedido, em compartilhamentos sociais e em buscas internas. Mudança bulk em 21 SKUs é evento de SEO não-trivial.
- **Decisão pendente:** entre 2 caminhos:
  - **(a) Bulk via MCP** — eu rodo `productUpdate` em loop nos 21 produtos. Rápido (~30s). Reversível mas o "evento" fica registrado.
  - **(b) Bulk via Shopify admin** — você faz no Shopify Admin > Products > selecionar 21 > Edit products. Mais lento mas com Shopify Flow tracking nativo + você revisa cada um.
- **Recomendação:** **(b)** se for primeira vez fazendo bulk edit nesse catálogo — você vê o impacto antes; **(a)** se já tem rotina e confia no diff.

---

## Resumo executivo (decisões pendentes)

| # | Item | Decisão pendente | Quem decide | Esforço |
|---|---|---|---|---|
| N26.a | Preço do SKU red | Definir preço entre R$ 79-129 | produto | 30 seg |
| N26.b | Política GTIN | Confirmar `identifier_exists=false` global | produto | 30 seg |
| N26.c | GMC taxonomy mapping | Validar mapping 47→3793, 3→5872 | produto | 1 min |
| N26.d | Brand prefix nos 21 títulos | Escolher caminho (a) MCP bulk ou (b) Shopify admin | ops + produto | 2 min |

**Após aprovações:** posso executar a/b/c por MCP em ~1 min. N26.d depende da escolha do caminho.

**Re-rodar audit depois:** `pnpm merchant:audit --source=shopify --first=100 --tenant=incluo --capture` (depois de configurar `SHOPIFY_SHOP` + `SHOPIFY_ADMIN_TOKEN`) OU re-puxar snapshot e rodar contra JSON.

**Score esperado pós-correções:** ≥ 90/100, 0 SKU red, 0 finding critical. Findings restantes serão majoritariamente `description:too-short` (apenas onde MCP trunca, não na realidade) e ajustes finos.

---
_Análise consolidada via MCP Shopify reads (get-product + graphql_query) + análise local do audit JSON. Nenhuma escrita feita ainda._
