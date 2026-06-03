# Prompt para colar no claude.ai (Shopify MCP ativo)

> Copiar tudo abaixo desta linha e colar no claude.ai com o MCP Shopify conectado.

---

Estou num projeto de remediação GMC para a loja incluobrasil.com (Shopify). Preciso executar 3 grupos de fixes urgentes antes de 4 de junho. Use SEMPRE `mcp__claude_ai_Shopify__graphql_mutation` para writes e `mcp__claude_ai_Shopify__graphql_query` para reads. Nunca invente dados — só execute o que está descrito aqui.

---

## GRUPO 1 — Diagnóstico: variantes "China Mainland" residuais

Rodar esta query para encontrar variantes com "China Mainland" ainda ativas:

```graphql
{
  products(first: 50, query: "status:active") {
    edges {
      node {
        id
        title
        variants(first: 30) {
          edges {
            node {
              id
              title
              selectedOptions { name value }
            }
          }
        }
      }
    }
  }
}
```

Depois rodar mais 2 páginas (com cursor) para cobrir os 143 produtos.

Para cada variant onde `selectedOptions.value` contenha "China" ou "Mainland":
1. Registrar o `productId` e o `variantId`
2. Deletar via:

```graphql
mutation {
  productVariantsBulkDelete(
    productId: "gid://shopify/Product/PRODUCT_ID"
    variantsIds: ["gid://shopify/ProductVariant/VARIANT_ID"]
  ) {
    product { id title }
    userErrors { field message }
  }
}
```

Se nenhuma variante for encontrada, confirmar: "Nenhuma variante China Mainland encontrada — feed GMC está desatualizado, só precisa de resync."

---

## GRUPO 2 — Renomear coleção "Pranchas PECS"

O TÍTULO da coleção ainda contém "PECS" (o body foi limpo mas o título nunca foi alterado). ID: 326443630754.

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

Confirmar: `userErrors: []` e `handle: "pranchas-comunicacao-visual-alternativa"`.

---

## GRUPO 3 — Corrigir categorias de 3 produtos (não-blocker mas limpar agora)

### 3a. Pebolim de Mesa — categoria errada "Brinquedos para bebês"
ID: 9219774677154

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

### 3b. Penico Portátil — categoria errada "Acessórios para grades de segurança"
ID: 9219762028706

```graphql
mutation {
  productUpdate(input: {
    id: "gid://shopify/Product/9219762028706"
    productType: "Acessórios para Bebê"
  }) {
    product { id title productType }
    userErrors { field message }
  }
}
```

### 3c. Temporizador Visual de Tarefas — categoria "Relógios de ponto" (incorreta)
ID: 8928559300770

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

---

## GRUPO 4 — Verificação final: Sobre Nós ainda limpa?

```graphql
{
  pages(first: 20) {
    edges {
      node { id title handle body }
    }
  }
}
```

Localizar a página com title contendo "Sobre". Verificar se o `body` contém qualquer dos termos: `terapêutico`, `integração sensorial`, `PECS`, `ABA`, `autismo`, `autorregulação`, `ansiedade`, `anti-estresse`, `terapia`.

Se encontrar → aplicar substituição e reportar.
Se não encontrar → confirmar: "Sobre Nós limpa ✅"

---

## GRUPO 5 — Verificação final: blog artigos (confirmar links atualizados)

```graphql
{
  articles(first: 5) {
    edges {
      node {
        id
        title
        tags
        body
      }
    }
  }
}
```

Verificar nos 2 artigos:
- Tags: não deve ter "Ansiedade", "Terapia Ocupacional", "Regulação Sensorial", "Alívio do Estresse"
- Body: não deve ter href `fidget-toys-terapeuticos`

Se encontrar qualquer um → corrigir via `articleUpdate`.

---

## AO FINAL

Reportar:
1. Quantas variantes China Mainland foram encontradas e deletadas (ou "nenhuma encontrada")
2. ✅ ou ❌ para cada grupo
3. Total de mutations aplicadas nesta sessão
4. Confirmar se o handle da coleção Pranchas PECS mudou e se 301 redirect foi criado

---

> Esta sessão é parte do projeto GMC Incluo Brasil — Remediação Round 2.
> Próxima análise GMC: 4 de junho de 2026.
