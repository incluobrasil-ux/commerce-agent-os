# GMC Approval Playbook — Shopify Stores PT-BR

> Guia completo destilado do projeto Incluo Brasil (maio 2026).  
> Usar como template para qualquer loja Shopify submetendo ao Google Merchant Center.

---

## PARTE 1 — SUPERFÍCIES QUE O GMC CRAWLEA

O Google lê mais camadas do que a maioria imagina. Auditar TODAS antes de submeter review:

### Produto
| # | Superfície | Campo Shopify | Observação |
|---|---|---|---|
| 1 | Título | `title` | Primeira coisa que o crawler lê |
| 2 | Meta title | `seo.title` / `global.title_tag` | Pode diferir do title |
| 3 | Descrição body | `descriptionHtml` | HTML completo — incluindo textos em `<strong>`, `<li>` |
| 4 | Meta description | `seo.description` / `global.description_tag` | Indexada pelo Google |
| 5 | Tipo do produto | `productType` | Campo livre — frequentemente esquecido |
| 6 | Tags | `tags[]` | Incluindo slugs como `rotina-aba`, `kit-terapeutico` |
| 7 | Handle / URL | `handle` | URLs terapêuticas são claim direto. Mudar = 301 redirect obrigatório |
| 8 | Variantes — títulos | `variants[].title` e `option_values` | Ex: "Cinza Antiestresse" numa variante de cor |
| 9 | SKUs | `variants[].sku` | Raramente tem claims, mas varrer sempre |
| 10 | Alt text de imagens | `media[].alt` | **Gap mais frequente** — o Google indexa alt text e inclui no feed |
| 11 | Metafield detalhes | `custom.detalhes_do_produto` | Campo livre usado por apps de descrição |
| 12 | GMC condition | `mm-google-shopping.condition` | Deve ser `"new"` para produtos novos |
| 13 | GMC age_group | `mm-google-shopping.age_group` | `"kids"`, `"infant"` ou `"adult"` |
| 14 | GMC gender | `mm-google-shopping.gender` | `"unisex"` para brinquedos |

### Coleção
| # | Superfície | Campo |
|---|---|---|
| 15 | Descrição | `descriptionHtml` |
| 16 | Meta title | `seo.title` |
| 17 | Meta description | `seo.description` |
| 18 | Handle / URL | `handle` + 301 redirect se mudou |

### Blog e Páginas
| # | Superfície | O que verificar |
|---|---|---|
| 19 | Artigos — tags | Tags terapêuticas (ex: `terapia-ocupacional`) |
| 20 | Artigos — body | Links para handles antigos + parágrafos com claims |
| 21 | Página "Sobre Nós" | Linguagem clínica ("atendemos pacientes", "clínica", etc.) |
| 22 | Footer | Disclaimer de não-substituição de profissional |
| 23 | FAQ | Resposta explícita que produto NÃO substitui terapia |
| 24 | Termos de Serviço | Disclaimer legal obrigatório |

### Namespaces de metafields — o que é seguro ignorar
| Namespace | Avaliação |
|---|---|
| `shopify.*` | Atributos técnicos (material, idade) — limpo |
| `mm-google-shopping.*` | Feed GMC direto — auditar condition/age_group/gender |
| `alireviews.*` | App de reviews — não renderiza no HTML |
| `seoimager.*` | App de imagem — dados internos |
| `seoking.settings` | **Não modificar via API** — corrompe dados do app. Atualizar pela UI do SEO King |

---

## PARTE 2 — TERMOS PROIBIDOS PT-BR (Misrepresentation)

Qualquer um destes termos em qualquer superfície indexável é blocker GMC:

| Termo proibido | Substituição aprovada |
|---|---|
| autorregulação / autorregulação sensorial | organização pessoal |
| anti-estresse / antiestresse / antistress | relaxamento |
| ansiedade / anti-ansiedade | agitação / descompressão |
| TDAH / ADHD | alta energia |
| autismo / autista / TEA | (removido) ou desenvolvimento |
| terapêutico / terapêutica | prático / educacional |
| integração sensorial | estimulação sensorial |
| processamento sensorial | conforto sensorial |
| ABA / TEACCH | metodologias educacionais estruturadas |
| PECS (como método clínico) | sistema de comunicação visual |
| Clínica ABA (tag) | removida |
| terapeutas ocupacionais | pais e famílias / educadores |
| fonoaudiólogos (em contexto clínico) | removido |
| clínico supervisionado | educacional supervisionado |
| regulação emocional | bem-estar emocional |
| sobrecarga sensorial | não usar |
| consultório | não usar |
| acalma o sistema nervoso | promove calma e foco |
| Oral Motor | estimulação oral |
| rotina ABA / rotina-aba (tag) | removida |
| kit-terapeutico (tag/handle) | kit-sensorial |

### Termos borderline (avaliar caso a caso)
- "Oral Motor" — vocabulário clínico de fonoaudiologia. Substituir por "estimulação oral"
- "proprioceptivo" — termo técnico mas não clínico. Aceito na Incluo, mas monitorar
- "vestibular" — idem proprioceptivo
- "sensorial" sozinho — aceito, não é claim terapêutico

---

## PARTE 3 — CATEGORIAS DE PRODUTO (Shopify Taxonomy)

### Por que importa para GMC
O GMC usa a categoria do produto para validar claims. Produtos categorizados como equipamentos médicos/fisioterapia num contexto de e-commerce de brinquedos disparam flags de Misrepresentation.

### Regras críticas
1. **NUNCA usar categorias médicas/fisioterapia** para produtos recreativos
   - ❌ `Equipamentos de fisioterapia` (node 2768) para mordedores, sacos sensoriais
   - ❌ `Protetores bucais` (node 2973) para chewelry/mordedores
   - ❌ `Limpadores de língua` (node 2985) para ferramentas orais recreativas

2. **Categorias adequadas para produtos sensoriais** (usar `TaxonomyCategory` ID):

| Categoria | TaxonomyCategory ID | ProductTaxonomyNode ID |
|---|---|---|
| Brinquedos de atividades | `tg-5-1` | 5222 |
| Brinquedos educativos | `tg-5-9` | 5262 |
| Brinquedos para executivos (fidgets) | `tg-5-10` | 5270 |
| Brinquedos visuais | — | 5348 |
| Mordedores | `bt-3-5-2` | 11805 |
| Brinquedos para dentição | — | 11835 |
| Brinquedos sensoriais | — | 14860 |
| Brinquedos com ímãs | — | 5271 |
| Tapetes educativos | — | 881 |
| Cartões educativos | — | 5266 |
| Temporizadores | — | 3689 |
| Almofadas de equilíbrio | — | 9809 |
| Quadros de equilíbrio | — | 9808 |
| Tendas e túneis | — | 5201 |
| Brinquedos de massinha e slime | — | 14181 |

3. **Como atualizar categoria via GraphQL:**
```graphql
mutation fixCategory($input: ProductInput!) {
  productUpdate(input: $input) {
    product { id productCategory { productTaxonomyNode { id name } } }
    userErrors { field message }
  }
}
```
```json
{ "input": { "id": "gid://shopify/Product/...", "category": "gid://shopify/TaxonomyCategory/tg-5-1" } }
```
> **ATENÇÃO:** O campo é `category` (não `productCategory`). O ID usa `TaxonomyCategory` (não `ProductTaxonomyNode`). Usar `ProductTaxonomyNode` retorna erro "product_taxonomy_node_id inválido".

4. **Como descobrir o TaxonomyCategory ID:**
```graphql
{ taxonomy { categories(search: "brinquedos de atividades", first: 5) { nodes { id name fullName } } } }
```

---

## PARTE 4 — PREÇOS E STATUS

### Regras de preço para GMC
- Nenhum produto/variante ACTIVE pode ter preço R$0,00
- Verificar `compareAtPrice` — se preenchido, deve ser maior que `price`
- Produtos sem preço definido: manter como DRAFT ou ARCHIVED
- ARCHIVED remove do feed GMC (mais seguro que DRAFT para itens indefinidos)

### Como arquivar via GraphQL
```json
{ "input": { "id": "gid://shopify/Product/...", "status": "ARCHIVED" } }
```

### Como ativar via GraphQL
```json
{ "input": { "id": "gid://shopify/Product/...", "status": "ACTIVE" } }
```

---

## PARTE 5 — HANDLES E REDIRECTS

### Regras
- Handles com termos terapêuticos são crawleados pelo GMC como URL pública
- Ao mudar handle, **sempre incluir** `"redirectNewHandle": true` na mutation
- Shopify cria 301 redirect automático — não perder SEO

### Padrão de substituição de handles
| Handle problemático | Handle correto |
|---|---|
| fidget-toys-terapeuticos | fidget-toys-foco |
| kit-terapeutico-sensorial | kit-sensorial |
| autorregulacao-sensorial | organizacao-sensorial |
| rotina-aba | rotina-visual |
| bola-antiestresse | bola-sensorial |

---

## PARTE 6 — ALT TEXT DE IMAGENS

### Por que é crítico
O Google indexa alt text de imagens e inclui no feed GMC. É o gap mais frequentemente esquecido em auditorias.

### Padrão de preenchimento
```
"[Nome do produto] [cor/característica] brinquedo sensorial [tátil/visual/fidget]"
```
Exemplo: `"Fidget Slider Magnético azul brinquedo sensorial fidget"`

### Mutation de alt text
```graphql
mutation fixAlt($productId: ID!, $media: [UpdateMediaInput!]!) {
  productUpdateMedia(productId: $productId, media: $media) {
    media { ... on MediaImage { id alt } }
    mediaUserErrors { field message }
  }
}
```
```json
{ "productId": "gid://shopify/Product/...", "media": [{ "id": "gid://shopify/MediaImage/...", "alt": "..." }] }
```

### Como descobrir MediaImage IDs
```graphql
{ product(id: "...") { media(first: 10) { nodes { ... on MediaImage { id alt } } } } }
```

---

## PARTE 7 — INFORMAÇÕES DE NEGÓCIO OBRIGATÓRIAS

### No site (crawleado pelo GMC)
- [ ] CNPJ presente e correto em múltiplas páginas (footer, Termos, Sobre Nós)
- [ ] Endereço físico completo (rua, número, cidade, estado, CEP)
- [ ] Email de SAC
- [ ] WhatsApp / telefone
- [ ] Horários de atendimento
- [ ] SSL/HTTPS ativo
- [ ] Disclaimer no footer: *"Os produtos são para uso recreativo e educacional. Não substituem avaliação ou tratamento de profissional de saúde."*

### No painel GMC (merchants.google.com) — setup obrigatório
- [ ] Business Info: nome da empresa, CNPJ, endereço, telefone
- [ ] Phone verification: concluída
- [ ] Shipping service: país (Brasil), moeda (BRL), prazo de entrega, frete
- [ ] Return policy: 7 dias a partir do recebimento, sem custo para o comprador

---

## PARTE 8 — ORDEM DE OPERAÇÃO PARA RE-REVIEW

Sequência obrigatória — não pular etapas:

```
1. Remediar TODAS as superfícies (produto, coleção, blog, páginas)
   ↓
2. Verificar preços — nenhum ACTIVE com R$0,00
   ↓
3. Corrigir categorias — nenhuma categoria médica
   ↓
4. GMC painel — Business Info + Shipping + Returns
   ↓
5. Simprosys (ou feed direto) — force sync
   ↓
6. GMC Diagnostics — confirmar zero erros críticos
   ↓
7. Request Review — submeter
```

> **NUNCA submeter Request Review antes de todos os blockers resolvidos.**  
> Uma segunda negativa aumenta o período de espera para nova revisão.

---

## PARTE 9 — FERRAMENTAS E MUTATIONS GRAPHQL REUTILIZÁVEIS

### Fix de produto (title + SEO + body)
```graphql
mutation fixProduct($input: ProductInput!) {
  productUpdate(input: $input) {
    product { id title }
    userErrors { field message }
  }
}
```
```json
{ "input": { "id": "gid://shopify/Product/...", "title": "...", "descriptionHtml": "...", "seo": { "title": "...", "description": "..." } } }
```

### Fix de tags de produto
```json
{ "input": { "id": "gid://shopify/Product/...", "tags": ["tag1", "tag2"] } }
```
> Tags são substituição completa — enviar a lista final sempre.

### Fix de coleção
```graphql
mutation fixCollection($input: CollectionInput!) {
  collectionUpdate(input: $input) {
    collection { id title }
    userErrors { field message }
  }
}
```
```json
{ "input": { "id": "gid://shopify/Collection/...", "descriptionHtml": "...", "seo": { "title": "...", "description": "..." } } }
```

### Fix de artigo de blog
```graphql
mutation fixArticle($id: ID!, $article: ArticleUpdateInput!) {
  articleUpdate(id: $id, article: $article) {
    article { id title }
    userErrors { field message }
  }
}
```
```json
{ "id": "gid://shopify/Article/...", "article": { "body": "..." } }
```
> **ATENÇÃO:** O campo é `body` (não `bodyHtml`) em `ArticleUpdateInput`.

### Fix de handle com redirect
```json
{ "input": { "id": "gid://shopify/Product/...", "handle": "novo-handle", "redirectNewHandle": true } }
```

### Fix de metafield
```json
{ "input": { "id": "gid://shopify/Product/...", "metafields": [{ "namespace": "custom", "key": "detalhes_do_produto", "value": "...", "type": "multi_line_text_field" }] } }
```

### Fix de preço de variante
```graphql
mutation fixPrice($input: ProductVariantInput!) {
  productVariantUpdate(input: $input) {
    productVariant { id price }
    userErrors { field message }
  }
}
```
```json
{ "input": { "id": "gid://shopify/ProductVariant/...", "price": "149.90" } }
```

---

## PARTE 10 — ARMADILHAS COMUNS

| Armadilha | Como evitar |
|---|---|
| Alt text vazio em produtos importados via AliExpress | Varrer `media[].alt` em TODOS os produtos, não só os novos |
| Handle terapêutico permanece como redirect | Handle antigo redireciona para novo — mas URL antiga ainda existe. OK para GMC |
| Tags com slugs terapêuticos | Buscar `rotina-aba`, `kit-terapeutico`, `antiestresse` (não só os com maiúscula) |
| ProductType "Brinquedos Antiestresse" | Campo livre, frequentemente copiado do fornecedor |
| Variantes com claims no título | Ex: "Cinza Antiestresse / Solteiro" — verificar option_values |
| Artigos de blog com links para handles antigos | Testar todos os `href` internos após mudança de handles |
| Categorias médicas importadas via app de integração | Apps como Simprosys podem setar categorias automaticamente |
| SEO King focus_keywords | Não modificar via GraphQL — pode corromper dados do app |
| `body` vs `bodyHtml` em ArticleUpdateInput | Usar `body` — `bodyHtml` não existe na mutation de artigo |
| `category` vs `productCategory` em ProductInput | Usar `category` com ID `TaxonomyCategory`, não `ProductTaxonomyNode` |
| `ProductTaxonomyNode` ID vs `TaxonomyCategory` ID | São sistemas diferentes — para SET usar `TaxonomyCategory`, para GET o produto retorna `ProductTaxonomyNode` |

---

## PARTE 11 — DISCLAIMER OBRIGATÓRIO

Inserir no footer e em pelo menos mais um ponto (FAQ ou Termos):

> *"Os produtos da [LOJA] são brinquedos sensoriais para uso recreativo e educacional. Não substituem avaliação ou tratamento de profissional de saúde."*

---

*Playbook gerado em 2026-05-28 a partir do projeto Incluo Brasil GMC Misrepresentation Remediation.*  
*343+ mutations aplicadas, 0 erros. Base para todos os projetos futuros.*
