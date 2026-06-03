# Shopify Mutations — Round 2 (Reprovação GMC 2026-05-30)

**Executar no claude.ai com MCP Shopify ativo.**  
Motivo da reprovação: Deturpação, verificação manual, 4 jun. disponível para nova análise.

---

## PRIORIDADE 1 — Diagnóstico: China Mainland residuais

Antes de qualquer fix, rodar esta query para ver se ainda existem variantes com China Mainland:

```graphql
query findChinaMainland {
  products(first: 50, query: "status:active") {
    edges {
      node {
        id
        title
        variants(first: 20) {
          edges {
            node {
              id
              title
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  }
}
```

Filtrar manualmente por `selectedOptions.value` contendo "China" ou "Mainland".

Se encontrar variantes — usar esta mutation para cada uma:

```graphql
mutation deleteVariant($productId: ID!, $variantsIds: [ID!]!) {
  productVariantsBulkDelete(productId: $productId, variantsIds: $variantsIds) {
    product { id title }
    userErrors { field message }
  }
}
```

Variables:
```json
{
  "productId": "gid://shopify/Product/SEU_PRODUTO_ID",
  "variantsIds": ["gid://shopify/ProductVariant/VARIANTE_ID"]
}
```

---

## PRIORIDADE 2 — Renomear coleção "Pranchas PECS"

**ID:** 326443630754  
O BODY foi limpo em 28/05, mas o TÍTULO ainda tem "PECS" — visível no menu da loja e na URL.

```graphql
mutation renamePranchasPECS($input: CollectionInput!) {
  collectionUpdate(input: $input) {
    collection { id title handle }
    userErrors { field message }
  }
}
```

Variables:
```json
{
  "input": {
    "id": "gid://shopify/Collection/326443630754",
    "title": "Pranchas de Comunicação Visual Alternativa",
    "handle": "pranchas-comunicacao-visual-alternativa",
    "seo": {
      "title": "Pranchas de Comunicação Visual | Incluo Brasil",
      "description": "Pranchas e cartões de comunicação visual alternativa para crianças. Sistema de troca de figuras para desenvolvimento da linguagem. Incluo Brasil."
    },
    "redirectNewHandle": true
  }
}
```

**Resultado esperado:** handle antigo `pranchas-pecs-comunicacao-alternativa` → 301 redirect para o novo.

---

## PRIORIDADE 3 — Verificar página "Sobre Nós" (confirmação)

O run summary de 28/05 diz que "integração sensorial" → "estimulação sensorial" foi aplicado.
Rodar query para confirmar que está limpa:

```graphql
query getSobreNos {
  pages(first: 20) {
    edges {
      node {
        id
        title
        handle
        body
      }
    }
  }
}
```

Buscar pelo título "Sobre" — verificar se `body` ainda contém `integração sensorial`, `PECS`, `ABA`, `autismo`.

---

## PRIORIDADE 4 — Verificar se Simprosys feed tem conteúdo antigo

O Simprosys feed (43 produtos) pode ter dados pré-mutation. Query para ver quais produtos ele tem:

```graphql
query checkSimprosysProducts {
  products(first: 50, query: "source:simprosys OR tag:simprosys") {
    edges {
      node { id title handle status }
    }
  }
}
```

Se o Simprosys não tiver integração direta via tags, verificar pelo app Simprosys no Shopify Admin:
Apps → Simprosys → Settings → Forçar re-scan completo.

---

## STATUS PÓS ROUND 2

Após rodar estas mutations, atualizar:
- `07_memory/vault/projects/commerce-agent-os/next-actions.md`
- `07_memory/vault/projects/commerce-agent-os/run-summaries/` (novo run summary)
