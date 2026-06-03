---
created_at: 2026-05-28T23:00:00Z
type: run-summary
task: Auditoria final live + resolução de opcionais (categorias, preços, termos residuais)
status: completed
mutations_applied: 22
errors: 0
---

# Run Summary — Auditoria Final + Opcionais Resolvidos

**Data:** 2026-05-28  
**Tarefa:** Execução das mutations residuais (Batch 3+4), auditoria geral de todos os 143 produtos, correção de opcionais.  
**Resultado:** ✅ 22 mutations — zero erros

---

## 1. Batch 3 — Coleções C13/C14/C15: "terapeutas ocupacionais" (3 mutations)

| ID | Coleção | Fix |
|---|---|---|
| 326443696290 | Cartões Educacionais de Emoções | "terapeutas ocupacionais;" removido de "Para quem é indicado" |
| 326445301922 | Produtos Ponderados e Pressão Profunda | "terapeutas ocupacionais;" removido |
| 326445236386 | Chewelry - Colares e Pulseiras Mastigáveis | "terapeutas ocupacionais;" removido |

---

## 2. Batch 4 — Artigos blog: "terapeutas ocupacionais" + "consultório" (2 mutations)

### Artigo 565620605090 — "O Que São Brinquedos Sensoriais"
- Intro: "famílias, educadores e **terapeutas ocupacionais**" → "famílias e educadores"
- Linha 30: "em casa, na escola, **no consultório ou** em qualquer ambiente" → removido
- Parágrafo completo `<strong>Terapeutas ocupacionais e fonoaudiólogos</strong>` removido

### Artigo 565620900002 — "Fidget Toys: Guia Completo"
- Linha 31: "casa, escola, trabalho **e consultórios**" → "casa, escola e trabalho"
- Parágrafo completo `<strong>Terapeutas ocupacionais</strong> — profissionais da área...` removido

---

## 3. Categorias corrigidas (4 mutations)

| Produto | ID | De | Para |
|---|---|---|---|
| Saco Sensorial Corporal Elástico | 8927611682978 | Equipamentos de fisioterapia | Brinquedos de atividades |
| Balança Montessori com Macacos | 9219774349474 | Brinquedos para bebês | Brinquedos educativos |
| Mordedor Sensorial Oral Kit 10un | 8928557760674 | Protetores bucais | Mordedores |
| Mordedor Sensorial Oral Grau Alimentar | 8928560152738 | Equipamentos de fisioterapia | Mordedores |

**Taxonomy IDs usados:**
- `gid://shopify/TaxonomyCategory/tg-5-1` → Brinquedos de atividades
- `gid://shopify/TaxonomyCategory/tg-5-9` → Brinquedos educativos
- `gid://shopify/TaxonomyCategory/bt-3-5-2` → Mordedores

**IMPORTANTE:** O campo correto em `ProductInput` é `category` (ID escalar), não `productCategory`. O ID deve usar o formato `gid://shopify/TaxonomyCategory/...` (não `ProductTaxonomyNode`).

---

## 4. Produtos arquivados (2 mutations)

| Produto | ID | Motivo |
|---|---|---|
| Mini Trampolim Sensorial 48pol | 8928107790498 | Sem preço definido |
| Cobertor Ponderado Pressão Profunda | 8928572899490 | Sem preço definido |

---

## 5. Termos "Oral Motor" substituídos (2 mutations)

| Produto | ID | Fix |
|---|---|---|
| Kit Ferramentas de **Exercício Oral Motor** | 8928401457314 | → "Kit Ferramentas de Estimulação Oral" (title + SEO title + SEO description) |
| Kit Canudos e Bolas — **Oral Motor** | 8928405160098 | → "Estimulação Oral" (title + SEO description) |

"Oral Motor" é vocabulário clínico de fonoaudiologia/TO — borderline para GMC Misrepresentation.

---

## 6. Auditoria Geral — 143 Produtos

Varredura completa de todos os 143 produtos (3 páginas de 50):

| Check | Resultado |
|---|---|
| Produtos ACTIVE com preço R$0,00 | ✅ Nenhum |
| Produtos ACTIVE sem categoria | ✅ Nenhum |
| Categorias médicas/terapêuticas em produtos ACTIVE | ✅ Nenhuma após fixes |
| Termos proibidos em titles visíveis | ✅ Nenhum após fixes |
| Cobra Articulada Fidget (8927610306722) | ⚠️ DRAFT com preço R$34,90 — deixar como está |

---

## Status Final do Projeto Incluo Brasil GMC

| Camada | Status Final |
|---|---|
| 143 produtos — body, title, SEO, tags, productType, handles, alt text, metafields, categorias | ✅ |
| 15 coleções — body, SEO, handles | ✅ |
| 2 artigos blog — tags, body, links | ✅ |
| Termos terapêuticos PT-BR (31 termos) | ✅ Zerados |
| "Oral Motor" | ✅ Substituído |
| Categorias médicas | ✅ Corrigidas |
| Preços R$0,00 em produtos ACTIVE | ✅ Nenhum |
| SEO King focus_keywords | ✅ Atualizado pelo usuário via UI |
| Trampolim + Cobertor | ✅ Arquivados |

**Total geral do projeto:** 343+ mutations aplicadas, 0 erros

## Pendências manuais para Request Review

1. GMC Business Info (CNPJ 65.393.441/0001-46, endereço, telefone)
2. GMC Shipping service (Brasil, BRL, prazo + frete)
3. GMC Returns policy (7 dias, sem custo)
4. Simprosys force sync
5. GMC Request Review — submeter SOMENTE após 1-4
