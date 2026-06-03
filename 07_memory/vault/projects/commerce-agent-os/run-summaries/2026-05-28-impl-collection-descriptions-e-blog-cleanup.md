---
created_at: 2026-05-28T06:00:00Z
type: run-summary
task: H1 collection descriptions (15 coleções) + blog tags + blog links
status: completed
mutations_applied: 17
errors: 0
---

# Run Summary — Collection Descriptions Cleanup + Blog Fixes

**Data:** 2026-05-28  
**Tarefa:** H1 completo (15 coleções) + blog: 2 artigos (tags + links)  
**Resultado:** ✅ 17 mutations — zero erros

## Contexto

A auditoria final de pré-re-review (2026-05-28) identificou que o H1 registrado no vault como "concluído" só havia limpo os *handles* das coleções (C4), mas não os campos `descriptionHtml` e `seo`. Todas as 15 coleções analisadas ainda continham claims terapêuticos ("autorregulação", "ABA", "TEACCH", "PECS como metodologia", "integração sensorial", "processamento sensorial").

## Escopo executado

### H1 — Collection descriptions (15 coleções em 3 batches)

**Batch 1 (5 coleções — sessão anterior ao resumo):**
| Coleção | ID | Fix |
|---|---|---|
| C6 Fidget Toys | 326443335842 | seo.description: autorregulação → organização pessoal |
| C13 Cartões de Emoções | 326443696290 | seo.title + seo.description: Autorregulação removido |
| C10 Timers Visuais | 326443532450 | body: "programas baseados em ABA" removido |
| C11 Kits Sensoriais | 326443565218 | body: "Autorregulação sensorial" → "Organização pessoal" |
| C14 Produtos Ponderados | 326445301922 | body: "Autorregulação sensorial portátil" → "Organização pessoal portátil"; para quem: removed "à autorregulação sensorial" |

**Batch 2 (5 coleções — sessão anterior ao resumo):**
| Coleção | ID | Fix |
|---|---|---|
| C15 Chewelry | 326445236386 | body: "Autorregulação oral" → "Organização sensorial oral" |
| C7 Bolas Sensoriais | 326443368610 | body: "Autorregulação discreta" → "Organização pessoal discreta" |
| C2 Motricidade | 326443106466 | body: "Integração sensorial" → "Estimulação sensorial"; "processamento sensorial" → "conforto sensorial"; seo.description: idem |
| C8 Quadros de Rotina | 326443434146 | body: "ABA e TEACCH" → "metodologias educacionais estruturadas"; "autorregulação" → "autonomia"; removed "analistas de comportamento" |
| C4 Educacionais e Cognitivos | 326443204770 | body: removed "ABA (Análise do Comportamento Aplicada)"; "autorregulação" → "organização pessoal" |

**Batch 3 (5 coleções — esta sessão):**
| Coleção | ID | Fix |
|---|---|---|
| C1 Comunicação e Rotina Visual | 326442877090 | body: "ferramentas de autorregulação" → "organização pessoal"; "Autorregulação emocional" → "Apoio à expressão emocional"; "PECS, TEACCH e ABA" → "comunicação visual e rotina estruturada". seo.description: "autorregulação" removido |
| C3 Regulação e Conforto Sensorial | 326443172002 | body: 3× "autorregulação" → "organização pessoal"; typo "atenüação" → "atenuação" |
| C5 Estimulação Sensorial | 326443237538 | body: 2× "autorregulação" → "organização pessoal". seo.description: idem |
| C9 Brinquedos Visuais | 326443499682 | body: "autorregulação" → "organização pessoal"; "autorregulação emocional" → "bem-estar emocional". seo.description: idem |
| C12 Pranchas PECS | 326443630754 | body: "metodologia PECS reconhecida internacionalmente" → "sistema de comunicação visual por troca de figuras, amplamente reconhecido"; "fases do PECS" → "progressão gradual da comunicação visual" |

### Blog fixes (2 artigos)

| Artigo | ID | Fix |
|---|---|---|
| O Que São Brinquedos Sensoriais | 565620605090 | Tags: removidos "Ansiedade", "Alívio do Estresse", "Regulação Sensorial", "Terapia Ocupacional". Body: 1 link `fidget-toys-terapeuticos` → `fidget-toys-foco` |
| Fidget Toys: Guia Completo | 565620900002 | Mesmas 4 tags removidas. Body: 2 links `fidget-toys-terapeuticos` → `fidget-toys-foco` |

## Resultados

- **15 collection mutations** (batches 1+2+3) + **2 article mutations** = **17 mutations totais**
- **0 userErrors** em todas
- Substituições de claims aplicadas: autorregulação → organização pessoal, ABA/TEACCH → metodologias educacionais estruturadas, PECS como metodologia → sistema de comunicação visual, integração sensorial → estimulação sensorial, processamento sensorial → conforto sensorial

## Status pós-execução

| Task | Status |
|---|---|
| C1 SEO meta fields (33 violações) | ✅ Concluído 2026-05-28 |
| C2 TEA em p89 body | ✅ Concluído 2026-05-28 |
| C3 Footer disclaimer | 🔵 Manual (Shopify Customize → Footer → Add Text block) |
| C4 Collection handles | ✅ Concluído 2026-05-28 |
| H1 Collection descriptions (15 coleções) | ✅ **Concluído 2026-05-28** |
| H1 Blog tags + links | ✅ **Concluído 2026-05-28** |
| H2 Tags de produto (autorregulação, Anti-Stress) | 🟡 Pendente |
| H3 SKU AliExpress residuais | 🟡 Pendente |
| Preços zerados (4 produtos) | 🔴 Bloqueado — aguarda preços do usuário |
| GMC: Business Info verification | 🔵 Manual |
| GMC: Shipping service config | 🔵 Manual |
| GMC: Return policy setup | 🔵 Manual |
| GMC: Request Review submission | 🔵 Manual — só após todos os fixes |

**Status Go/No-Go:** 🟡 QUASE GO — faltam C3 (footer manual), preços dos 4 produtos, e ajustes H2/H3.
