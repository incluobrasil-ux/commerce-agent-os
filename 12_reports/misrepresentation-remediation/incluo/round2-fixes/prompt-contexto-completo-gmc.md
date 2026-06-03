# PROMPT — Contexto Completo GMC Incluo Brasil
# Cole este prompt inteiro numa nova sessão claude.ai com MCP Shopify ativo

---

Você está continuando um projeto de remediação do Google Merchant Center para a loja **Incluo Brasil** (incluobrasil.com). Sou o operador do projeto. Este prompt tem TUDO que você precisa saber para agir sem contexto adicional.

Use `mcp__claude_ai_Shopify__graphql_mutation` para writes e `mcp__claude_ai_Shopify__graphql_query` para reads. Nunca invente conteúdo.

---

## 1. CONTEXTO DA LOJA

| Campo | Valor |
|---|---|
| Nome | Incluo Brasil |
| Site | incluobrasil.com |
| Shopify interno | v0ycj3-1u.myshopify.com |
| CNPJ | 65.393.441/0001-46 |
| Razão social | Roberto dos Santos Medrado |
| Endereço | Av. Serrinha, 3262, Vitória da Conquista - BA, CEP 45.075-220 |
| Email SAC | contato@incluobrasil.com |
| WhatsApp | (77) 99820-5841 |
| Nicho | Brinquedos sensoriais e educacionais |
| Plataforma | Shopify (plano Basic) |
| Feed GMC | Shopify App API (405 produtos) + Simprosys Feed (43 produtos) |

---

## 2. HISTÓRICO DO PROBLEMA

**A loja foi suspensa no GMC por Misrepresentation (Deturpação).**

O catálogo original usava linguagem clínica/terapêutica (autismo, TDAH, ABA, PECS, terapêutico, autorregulação) que viola a política do Google Merchant Center.

### O que foi feito (Remediação Round 1 — 2026-05-23 a 2026-05-28)

**345+ mutations aplicadas via MCP Shopify, 0 erros:**

- **143 produtos:** title, descriptionHtml, seo.title, seo.description, productType, tags, handle, variants, media[].alt, metafields (custom.detalhes_do_produto) — tudo limpo
- **15 coleções:** descriptionHtml, seo.title, seo.description, handles — tudo limpo
- **2 artigos blog:** tags terapêuticas removidas, links para handles antigos corrigidos
- **26 handles:** 301 redirects aplicados (redirectNewHandle: true)
- **Página Sobre Nós:** linguagem clínica → educacional
- **Footer:** disclaimer inserido
- **2 variantes "China Mainland":** deletadas (Mordedor Sensorial + Colete Sensorial)
- **"Oral Motor":** substituído por "Estimulação Oral" em 2 produtos
- **4 categorias médicas:** corrigidas para brinquedos/mordedores
- **2 produtos arquivados:** Mini Trampolim + Cobertor Ponderado (sem preço)
- **GMC painel:** Business Info ✅ + Phone ✅ + Shipping ✅ + Returns ✅ + Simprosys sync ✅

**GMC Request Review submetido em 2026-05-28. Resultado: REPROVADO.**

---

## 3. RESULTADO DA REPROVAÇÃO (2026-05-30)

**Motivo:** Deturpação — **verificação MANUAL** pelo Google
**Mensagem:** "clientes estão sendo enganados no Google"
**Próxima análise disponível:** 4 de junho de 2026

### O que o GMC mostrou nas screenshots:
- Qualidade da loja: **Boa** (na média) ✅
- Total produtos: 448 — **448 não aparecem** (100% reprovados)
- Produtos no feed com "/ China Mainland" no título (feed desatualizado)
- Informações comerciais: Verificado + Reivindicado ✅
- Local de origem do envio: **VAZIO** 🔴
- Dois feeds: Shopify App API (405) + Simprosys (43) — **sem data de atualização**
- Prazo de frete configurado: **4 a 7 dias** (mas produtos vêm da China: 15-30 dias)

---

## 4. DIAGNÓSTICO ROUND 2 (2026-05-30)

### Auditorias executadas hoje:
- ✅ **China Mainland:** scan de 250 produtos ativos — **LIMPO** (0 variantes encontradas)
- ✅ **Product types:** Pebolim "Jogos de Mesa", Penico "Produto de Higiene Infantil", Temporizador "Ferramentas de Gestão do Tempo" — corretos
- 🔴 **Coleção "Pranchas PECS":** título e handle AINDA contêm "PECS"

### Coleção crítica pendente:
```
ID: 326443630754
Título atual: "Pranchas PECS e Comunicação Alternativa"
Handle atual: "pranchas-pecs-e-comunicacao-alternativa"
→ Renomear para: "Pranchas de Comunicação Visual Alternativa"
→ Handle: "pranchas-comunicacao-visual-alternativa"
→ Usar redirectNewHandle: true
```

### Taxonomy categories pendentes (3 produtos — GraphQL necessário):
```
Pebolim de Mesa:      ID 9219774677154 → category: gid://shopify/TaxonomyCategory/tg-5-10
Penico Portátil:      ID 9219762028706 → category: gid://shopify/TaxonomyCategory/tg-5-9
Temporizador Visual:  ID 8928559300770 → category: gid://shopify/TaxonomyCategory/tg-5-1
```

### Issues adicionais identificados (nunca auditados):
1. **Prazo de entrega:** GMC configurado "4-7 dias" vs. real 15-30 dias (AliExpress) → MISREPRESENTATION DIRETA
2. **Schema markup / JSON-LD:** nunca verificado — apps podem estar injetando dados estruturados com claims
3. **Zero reviews:** loja sem avaliações visíveis → sinal de alerta para reviewer manual
4. **Política de Privacidade:** muito curta (1 parágrafo) → nunca expandida
5. **identifier_exists=false:** não declarado no feed para produtos sem GTIN
6. **Simprosys 43 produtos:** conteúdo desses 43 produtos nunca auditado individualmente

---

## 5. TERMOS PROIBIDOS — REFERÊNCIA COMPLETA

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
| terapeutas ocupacionais | pais e famílias / educadores |
| regulação emocional | bem-estar emocional |
| sobrecarga sensorial | não usar |
| consultório | não usar |
| Oral Motor | Estimulação Oral |
| Clínica ABA (tag) | removida |
| rotina-aba (tag/handle) | rotina-visual |
| kit-terapeutico (tag) | kit-sensorial |

### Termos ACEITOS (não são claims):
- "sensorial" sozinho ✅
- "proprioceptivo" ✅ (técnico, não clínico)
- "vestibular" ✅ (técnico, não clínico)
- "foco" ✅
- "concentração" ✅
- "organização pessoal" ✅
- "estímulo sensorial" ✅

---

## 6. SUPERFÍCIES A AUDITAR (checklist exaustivo)

Para cada produto verificar:
1. `title` — sem claims
2. `seo.title` — sem claims
3. `descriptionHtml` — sem claims (incluindo `<strong>`, `<li>`)
4. `seo.description` — sem claims
5. `productType` — sem claims
6. `tags` — sem claims (incluindo slugs)
7. `handle` — sem claims + 301 redirect se mudou
8. `variants[].title` — sem claims
9. `media[].alt` — preenchido, sem claims
10. `custom.detalhes_do_produto` — sem claims
11. Schema markup no `<script type="application/ld+json">` da página pública

Para coleções:
12. `title` — sem claims ← CRÍTICO para "Pranchas PECS"
13. `descriptionHtml` — sem claims
14. `seo.title` — sem claims
15. `seo.description` — sem claims
16. `handle` — sem claims + 301 redirect

---

## 7. MUTATIONS PRONTAS PARA EXECUTAR AGORA

### 7.1 Renomear coleção Pranchas PECS

```graphql
mutation {
  collectionUpdate(input: {
    id: "gid://shopify/Collection/326443630754"
    title: "Pranchas de Comunicação Visual Alternativa"
    handle: "pranchas-comunicacao-visual-alternativa"
    seo: {
      title: "Pranchas de Comunicação Visual | Incluo Brasil"
      description: "Pranchas e cartões de comunicação visual alternativa para crianças. Sistema de troca de figuras para desenvolvimento da linguagem e expressão. Incluo Brasil."
    }
    redirectNewHandle: true
  }) {
    collection { id title handle }
    userErrors { field message }
  }
}
```

### 7.2 Taxonomy category — Pebolim

```graphql
mutation {
  productUpdate(input: {
    id: "gid://shopify/Product/9219774677154"
    category: "gid://shopify/TaxonomyCategory/tg-5-10"
  }) {
    product { id title }
    userErrors { field message }
  }
}
```

### 7.3 Taxonomy category — Penico

```graphql
mutation {
  productUpdate(input: {
    id: "gid://shopify/Product/9219762028706"
    category: "gid://shopify/TaxonomyCategory/tg-5-9"
  }) {
    product { id title }
    userErrors { field message }
  }
}
```

### 7.4 Taxonomy category — Temporizador Visual

```graphql
mutation {
  productUpdate(input: {
    id: "gid://shopify/Product/8928559300770"
    category: "gid://shopify/TaxonomyCategory/tg-5-1"
  }) {
    product { id title }
    userErrors { field message }
  }
}
```

### 7.5 Verificação de China Mainland (query diagnóstica)

```graphql
{
  products(first: 50, query: "status:active") {
    pageInfo { hasNextPage endCursor }
    edges {
      node {
        id title
        options { name values }
        variants(first: 20) {
          edges { node { id title selectedOptions { name value } } }
        }
      }
    }
  }
}
```
Filtrar por `selectedOptions.value` contendo "China" ou "Mainland". Se encontrar → deletar com `productVariantsBulkDelete`.

### 7.6 Verificar schema markup (query para pegar body das páginas públicas)

```graphql
{
  pages(first: 20) {
    edges { node { id title handle body } }
  }
}
```

Verificar "Sobre Nós" para: `terapêutico`, `integração sensorial`, `PECS`, `ABA`, `autismo`.

### 7.7 Verificar blog artigos

```graphql
{
  articles(first: 5) {
    edges {
      node {
        id title tags
        body
      }
    }
  }
}
```

Verificar se tags contêm: `Ansiedade`, `Terapia Ocupacional`, `Regulação Sensorial`, `Alívio do Estresse`
Verificar se body contém href para: `fidget-toys-terapeuticos`

---

## 8. DISCLAIMER OBRIGATÓRIO

Presente em: Sobre Nós, Termos de Serviço, Aviso Legal, FAQ, Footer

> "Os produtos da Incluo são brinquedos sensoriais para uso recreativo e educacional. Não substituem avaliação ou tratamento de profissional de saúde."

---

## 9. CHECKLIST GMC COMPLETO (pré-submissão 4 jun)

### Shopify (via MCP):
- [ ] Coleção 326443630754 renomeada (título + handle sem PECS)
- [ ] Taxonomy categories: Pebolim + Penico + Temporizador corrigidas
- [ ] Verificar Sobre Nós: zero claims
- [ ] Verificar blog: tags e links limpos
- [ ] Verificar schema markup de pelo menos 3 produtos no código-fonte público

### GMC painel (manual no browser):
- [ ] Verificação de identidade: CNH + comprovante endereço + CNPJ impresso Receita Federal
- [ ] Local de origem do envio: Av. Serrinha, 3262, Vitória da Conquista - BA, CEP 45.075-220
- [ ] Política de devolução: 7 dias, sem custo, logística reversa
- [ ] Prazo de entrega: corrigir para 15-25 dias corridos (não 4-7)
- [ ] Forçar resync Shopify App API (Fontes de dados → 3 pontos → Sincronizar)
- [ ] Forçar resync Simprosys (app Shopify → Sync)
- [ ] Avaliar pausar/remover Simprosys feed (dados duplicados = conflito)

### Novas issues identificadas (antes de nova submissão):
- [ ] Instalar app de reviews (Judge.me grátis) e importar reviews AliExpress
- [ ] Expandir Política de Privacidade (está com 1 parágrafo apenas)
- [ ] Verificar código-fonte de produto (Ctrl+U) por JSON-LD com claims
- [ ] Google Ads: Centro de políticas → confirmar zero violações ativas

### Dia 4 de junho:
- [ ] Submeter Request Review no GMC
- [ ] Texto para justificativa: "Realizamos remediação completa de 345+ campos (títulos, descrições, meta tags, URLs, coleções, artigos de blog) removendo linguagem terapêutica/clínica. Disclaimers em múltiplas páginas. Verificação de identidade submetida. Prazo de entrega corrigido."

---

## 10. REGRAS DE OPERAÇÃO

- Toda mutation via `mcp__claude_ai_Shopify__graphql_mutation`
- Toda leitura via `mcp__claude_ai_Shopify__graphql_query`
- NUNCA inventar conteúdo — só aplicar o que está descrito neste prompt
- NUNCA submeter GMC review antes de todos os blockers resolvidos
- Após cada batch de mutations, registrar no vault:
  `C:\projetos-incluo\commerce-agent-os\07_memory\vault\projects\commerce-agent-os\run-summaries\`

---

## 11. ESTRATÉGIA PÓS-APROVAÇÃO

Quando GMC aprovar → D0:
1. Criar P.Max feed-only: R$200-300/dia, sem target ROAS, 7-10 dias de aprendizado
2. Instalar pixel Google Ads via app Google & YouTube na Shopify
3. Configurar conversão "Purchase" como principal
4. Após 30 conversões: target ROAS 3x + assets criativos
5. Meta: R$4.000/dia receita → R$1.000/dia lucro líquido

Estratégia completa: `C:\projetos-incluo\commerce-agent-os\07_memory\vault\global\google-ads-strategy-incluo.md`

---

**Data de atualização deste prompt:** 2026-05-30
**Próxima análise GMC disponível:** 2026-06-04
