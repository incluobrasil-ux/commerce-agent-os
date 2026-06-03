---
created_at: 2026-05-28T20:00:00Z
type: run-summary
task: Alt text completo (143 produtos) + body fixes (8 produtos) + metafields varredura final
status: completed
mutations_applied: 28
errors: 0
---

# Run Summary — Alt Text Completo + Body Fixes + Metafields Varredura

**Data:** 2026-05-28  
**Tarefa:** Round 2/3 alt texts (16 produtos sem alt text), correções de body em 8 produtos, varredura de todos os namespaces de metafields  
**Resultado:** ✅ 28 mutations — zero erros

---

## 1. Body Fixes — Claims Residuais (8 produtos)

Produtos da range 9219-9229 com claims terapêuticos no `descriptionHtml` não cobertos nas sessões anteriores:

| ID | Produto | Claims removidos/corrigidos |
|---|---|---|
| 9219774349474 | Balança Montessori | "terapeutas ocupacionais" → "pais e famílias" |
| 9229812105378 | Estrela-do-Mar Articulada 3D | "TEA," removido de "Indicado Para" |
| 9229812826274 | Cubo Mágico Infinito Relaxamento | "TEA," removido + "acalma o sistema nervoso" → "promove calma e foco" |
| 9229813088418 | Fidget Spinner Espetado 3D | "Alívio de estresse:" → "Relaxamento:" + "terapeutas ocupacionais" removido |
| 9229813481634 | Bola Engrenagem 3D | "TEA," removido + "acalma o sistema nervoso" → "promove calma e foco" |
| 9229813809314 | Bola Giroscópio 3D Universal | "TEA," removido + "terapeutas ocupacionais" removido |
| 9229814202530 | Varinha Sensorial Espiral Madeira | "TEA," + "terapeutas ocupacionais" + "antistress" + "consultório prático" — todos removidos |
| 8927607619746 | Colete Sensorial de Compressão | "clínico supervisionado" → "educacional supervisionado" |

---

## 2. Alt Text — Round 1, 2, 3 (16 produtos — 80 images)

Produtos da range 9229xxx que tinham **todas as imagens com alt text vazio**. Gap descoberto durante a varredura de alt text dos produtos 101-143.

### Round 1 (5 produtos — 25 images)
| ID | Produto |
|---|---|
| 9229804372130 | Fidget Slider Magnético Chocolate |
| 9229805584546 | Kit Bolas Kawaii Squishy |
| 9229805977762 | Fidget Slider Skate Fingerboard |
| 9229806436514 | Fidget Spinner Triangular Moeda EDC |
| 9229806895266 | Fidget Slider EDC Metal Magnético |

### Round 2 (7 produtos — 35 images)
| ID | Produto |
|---|---|
| 9229807386786 | Chaveiro Abacate Massageador |
| 9229807812770 | Fidget Clicker Teclado Mecânico |
| 9229808074914 | Chaveiro ZAKOL Teclado Musical |
| 9229808926882 | Brinquedo Rabanete Elástico Squishy 3D |
| 9229809615010 | Rolo Sensorial de Água Squeeze |
| 9229812105378 | Estrela-do-Mar Articulada 3D |
| 9229812826274 | Cubo Mágico Infinito Relaxamento |

### Round 3 (4 produtos — 20 images)
| ID | Produto |
|---|---|
| 9229813088418 | Fidget Spinner Espetado 3D |
| 9229813481634 | Bola Engrenagem 3D |
| 9229813809314 | Bola Giroscópio 3D Universal |
| 9229814202530 | Varinha Sensorial Espiral Madeira |

**Alt text coverage final:**
- Produtos 1-100: ✅ sem vazio (1 fix: Cubo Emoções Montessori)
- Produtos 101-143: ✅ 16 produtos corrigidos (80 imagens)
- **Total: 143/143 produtos com alt text ✅**

---

## 3. Varredura de Metafields — Namespaces Adicionais

### Namespaces identificados em todos os produtos

| Namespace | Keys | Avaliação |
|---|---|---|
| `global` | `title_tag`, `description_tag` | ✅ Já corrigidos (C1 — 33 mutations, 2026-05-28) |
| `custom` | `detalhes_do_produto` | ✅ Já corrigidos (Phase 2 — claims removidos) |
| `shopify` | `color-pattern`, `toy-game-material`, `recommended-age-group`, `material`, `product-certifications-standards` | ✅ Limpo — campos de atributos técnicos |
| `mm-google-shopping` | `condition`, `age_group`, `gender` | ✅ Limpo — valores: "new", "kids"/"infant", "unisex" |
| `alireviews` | `seo_rating_review_key`, `seo_rating_review_key_script`, `rating_info` | ✅ App de reviews — não renderiza claims |
| `seoimager` | chaves com hash | ✅ App de otimização de imagem — dados internos |
| `seoking` | `settings` | ⚠️ Ver abaixo |

### ⚠️ Achado: `seoking.settings` — focus_keywords com claims

5 produtos têm `focus_keywords` com termos terapêuticos dentro do metafield `seoking.settings`:

| ID | Produto | Keywords problemáticas |
|---|---|---|
| 8924974350498 | Cubo Fidget 12 Lados | "cubo fidget antiestress" |
| 8924979953826 | Cubo Infinito Sensorial | "cubo autorregulação", "cubo antiestress" |
| 8924985065634 | Órbita Cubo Sensorial | "autorregulação sensorial", "sobrecarga sensorial" |
| 8924989816994 | Bola Sensorial de Gel | "bola sensorial antiestress" |
| 8924991160482 | Bola de Apertar Expressões | "bola antiestress" |

**Avaliação de risco:** 🟡 BAIXO  
- `seoking.settings` é um metafield interno do app SEO King
- `focus_keywords` são usados APENAS para scoring de densidade de palavras-chave no dashboard do app
- **NÃO são renderizados no HTML da página**
- **NÃO são incluídos no feed GMC / Simprosys**
- Google não indexa esses dados
- Modificar via GraphQL diretamente pode corromper dados do app (backup gzipped)

**Recomendação:** Atualizar via interface do app SEO King (não via API) se o usuário quiser eliminar completamente. Não é blocker GMC.

---

## 4. Produtos Verificados como Limpos

Durante a varredura desta sessão, confirmados como clean (sem ação necessária):

- 9219754819746, 9219762651298, 9219763536034
- 8927610306722, 8928046776482, 8928102809762, 8928107266210, 8928107790498
- 8924974350498, 8928052805794, 8928053428386, 8928401457314
- 9229809615010 (Rolo Sensorial)

---

## Status Final Consolidado — 2026-05-28

| Camada | Status |
|---|---|
| Product copy — descriptionHtml (143 produtos) | ✅ Limpo |
| SEO meta fields (global.title_tag / description_tag) | ✅ Limpo — 33 mutations |
| Product tags | ✅ Limpo |
| productType | ✅ Limpo — 28 produtos corrigidos |
| Variant options/titles | ✅ Limpo (Cobertor Ponderado fix) |
| Collection descriptions (15) | ✅ Limpo |
| Collection handles | ✅ Limpo + 301 redirects |
| Blog articles (tags + links) | ✅ Limpo |
| Sobre Nós | ✅ Limpo |
| China Mainland variants | ✅ Removidos |
| Footer disclaimer | ✅ Inserido pelo usuário |
| Handles AliExpress (19 produtos) | ✅ Corrigidos + 301 |
| robots.txt | ✅ OK |
| Alt text — todas as imagens | ✅ **Completo — 143/143 produtos** |
| custom.detalhes_do_produto (claims) | ✅ Limpo |
| mm-google-shopping metafields | ✅ Limpo |
| seoking focus_keywords | ⚠️ App-interno — baixo risco, não-blocker |
| Preços zerados (4 produtos) | 🔴 Aguarda equipe |
| GMC: Business Info, Shipping, Returns | 🔵 Manual no painel GMC |
| GMC: Request Review | 🔵 Só após preços + manuais |
| Shopify Admin: Categorias (3 produtos) | 🔵 Manual |
| Google Ads P.Max asset groups | 🔵 Pós-aprovação GMC |
| Simprosys: force sync | 🔵 Manual (após todas as mutations) |

---

## Ações Manuais Pendentes (usuário)

1. **Preços zerados** — 4 produtos sem preço definido (blocker GMC)
2. **GMC Business Info** — Verificar CNPJ, endereço no painel
3. **GMC Shipping** — Configurar frete no painel
4. **GMC Returns** — Política de devolução no painel
5. **Shopify Categorias** — 3 produtos com categoria errada (Admin → Produtos → Organização)
6. **Simprosys sync** — Forçar re-sync do feed após todas as mutations
7. **GMC Request Review** — Submeter SOMENTE após preços + business info + shipping + returns

---

## Estatísticas da Sessão

| Tipo de mutation | Count |
|---|---|
| productUpdate (body content) | 8 |
| productUpdateMedia (alt text) | 20 |
| **Total** | **28** |
| Errors | **0** |
