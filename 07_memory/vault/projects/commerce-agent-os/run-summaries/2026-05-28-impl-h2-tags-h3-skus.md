---
created_at: 2026-05-28T08:00:00Z
type: run-summary
task: H2 product tags cleanup + H3 SKU/variant scan
status: completed
mutations_applied: 17
errors: 0
---

# Run Summary — H2 Product Tags + H3 SKU Scan

**Data:** 2026-05-28  
**Tarefa:** H2 — limpeza de tags terapêuticas em produtos; H3 — varredura de SKUs e variant titles  
**Resultado:** ✅ 17 mutations — zero erros

## H2 — Product Tags (16 produtos)

### Tags removidas

| Tag | Motivo |
|---|---|
| `Autorregulação` / `autorregulação` | Claim terapêutico direto |
| `Anti-Stress` | Claim terapêutico direto |
| `bola-antiestresse` | Slug com claim terapêutico |
| `bola antiestress` | Variante do claim |
| `bola sensorial antiestress` | Variante composta |
| `Regulação Emocional` | Claim terapêutico |
| `Cartões de Emoções e Autorregulação` | Collection tag desatualizada + claim |
| `Alfabetização TEA` | "TEA" = claim de condição médica |
| `redução de tensão` | Claim de benefício clínico |

### Tags substituídas

| Tag antiga | Tag nova |
|---|---|
| `Cartões de Emoções e Autorregulação` | `Cartões de Emoções` |
| `Alfabetização TEA` | `Alfabetização Emocional` |

### Produtos corrigidos (16)

| ID | Produto | Fix |
|---|---|---|
| 8924979953826 | Cubo Infinito Sensorial | Remove: Anti-Stress, Autorregulação |
| 8924983754914 | Fidget Pad Controlador | Remove: Anti-Stress |
| 8924987195554 | Kit 6 Bolas Sensoriais TPU | Remove: bola-antiestresse |
| 8924989325474 | Bolas Magnéticas Fidget | Remove: bola-antiestresse |
| 8924989587618 | Squishy Mochi Morango | Remove: Anti-Stress, bola-antiestresse |
| 8924989816994 | Bola Sensorial de Gel | Remove: bola-antiestresse, bola antiestress, bola sensorial antiestress |
| 8924991160482 | Bola de Apertar Expressões | Remove: Anti-Stress, Autorregulação, bola-antiestresse |
| 8924991750306 | Bola de Massagem Amendoim | Remove: bola-antiestresse, redução de tensão |
| 8925002760354 | Flashcards Educativos Bilíngues | Replace: Alfabetização TEA → Alfabetização Emocional |
| 8927592841378 | Quadro de Incentivo Infantil | Remove: Cartões de Emoções e Autorregulação, Regulação Emocional; Add: Cartões de Emoções |
| 8928405160098 | Kit Canudos e Bolas para Sopro | Remove: autorregulação |
| 8928407879842 | Jogo de Expressões Faciais | Remove: Cartões de Emoções e Autorregulação, Regulação Emocional; Add: Cartões de Emoções |
| 8928434880674 | Cubo de Emoções Montessori | Remove: Cartões de Emoções e Autorregulação, Regulação Emocional; Add: Cartões de Emoções |
| 8928570015906 | Gráfico de Recompensa Infantil | Remove: autorregulação, Cartões de Emoções e Autorregulação, Regulação Emocional; Add: Cartões de Emoções |
| 9229805584546 | Kit Bolas Kawaii Squishy | Remove: bola-antiestresse |
| 9229813481634 | Bola Engrenagem 3D | Remove: bola-antiestresse |

## H3 — SKU AliExpress Residuais

### Varredura completa (143 produtos)

- **SKUs sem claims terapêuticos**: todos os SKUs AliExpress são códigos numéricos/alfanuméricos (`14:29`, `14:200004870`, `200001034:203027829#yd2019-5`, etc.) — nenhum contém palavras terapêuticas
- **Variant titles com "China Mainland"**: presentes em ~15 produtos (ex.: "Preto / S / China Mainland") — problema de UX/confiança, não de Misrepresentation GMC. Prioridade baixa.
- **Variant option values com claim terapêutico**: 1 encontrado e corrigido (ver abaixo)

### Fix aplicado: Cobertor Ponderado (1 mutation)

| Campo | Antes | Depois |
|---|---|---|
| Variant option "Cor" | "Cinza Antiestresse" | "Cinza" |
| Variant option "Tamanho" | "Solteiro Conforto Real 4.5kg" | "Solteiro 4,5kg" |
| Variant title resultante | "Cinza Antiestresse / Solteiro Conforto Real 4.5kg" | "Cinza / Solteiro 4,5kg" |

Produto: `gid://shopify/Product/8928572899490` — Variant: `gid://shopify/ProductVariant/46635049648290`

## Status pós-execução

| Task | Status |
|---|---|
| H2 Tags de produto | ✅ **Concluído 2026-05-28** |
| H3 SKU AliExpress (claims) | ✅ **Concluído 2026-05-28** — nenhum claim em SKU |
| H3 Variant title "Antiestresse" | ✅ **Concluído 2026-05-28** |
| H3 "China Mainland" em variant titles | 🟡 UX cosmético — baixa prioridade GMC |
| C3 Footer disclaimer | 🔵 Manual (Shopify Customize → Footer) |
| Preços zerados (4 produtos) | 🔴 Aguarda preços do usuário |
| GMC: Business Info, Shipping, Returns | 🔵 Manual no painel GMC |
| GMC: Request Review | 🔵 Só após footer + preços + manuais |

**Status Go/No-Go:** 🟡 QUASE GO — blockers restantes são todos manuais ou aguardam input de preços.
