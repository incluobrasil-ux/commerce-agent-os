---
created_at: 2026-05-28T07:00:00Z
type: run-summary
task: Auditoria Final Pré-Re-Review GMC — varredura exaustiva live
status: completed
verdict: QUASE GO — 4 bloqueadores identificados
critical_violations_new: 3
---

# Auditoria Final Pré-Re-Review GMC
**Incluo Brasil · incluobrasil.com · 2026-05-28**

---

## RESUMO EXECUTIVO

**Veredicto: 🟡 QUASE GO — não submeter ainda.**

Foram encontrados 3 bloqueadores novos, não detectados nas auditorias anteriores:

1. **Coleções: "autorregulação", ABA, TEACCH, PECS ainda presentes em 12+ coleções** — H1 foi registrado como concluído mas a varredura live mostra que a maioria das coleções NÃO foi limpa.
2. **Blog: tags com "Ansiedade", "Alívio do Estresse", "Regulação Sensorial", "Terapia Ocupacional"** — ambos os artigos têm os mesmos tags terapêuticos.
3. **Blog: links apontando para handle antigo `fidget-toys-terapeuticos`** — URL com claim terapêutico ainda visível no href de ambos os artigos.
4. **4 produtos com preço R$0,00** (já identificados, ainda pendentes de correção).

---

## DIAGNÓSTICO FINAL DE PRONTIDÃO

| Dimensão | Status | Bloqueador? |
|---|---|---|
| Product titles/descriptions (95 produtos) | ✅ Limpo | Não |
| Product seo.title/seo.description (143 produtos) | ✅ Limpo | Não |
| Collection handles (5) | ✅ Limpos + 301 redirect | Não |
| **Collection descriptions (20+ coleções)** | **🔴 VIOLAÇÕES ativas** | **SIM** |
| **Blog tags** | **🔴 Termos terapêuticos** | **SIM** |
| **Blog body (links)** | **🔴 Handle antigo no href** | **SIM** |
| Páginas institucionais | ✅ Todas presentes e limpas | Não |
| Footer disclaimer | ✅ Inserido (hoje) | Não |
| 4 produtos R$0,00 | 🔴 Pendente | **SIM** |
| Shipping profile GMC | 🟡 A verificar no painel | Sim (manual) |
| Returns policy GMC | 🟡 A verificar no painel | Sim (manual) |
| Business Info GMC | 🟡 A verificar no painel | Sim (manual) |

---

## BLOCO 1 — ÚLTIMA VARREDURA DE MISREPRESENTATION

### 1.1 — Coleções: violações ativas (CRÍTICO)

A auditoria live revelou que **autorregulação, ABA, TEACCH e PECS estão presentes na maioria das descrições de coleção**. O H1 (registrado como concluído) aparentemente corrigiu apenas handles, não os bodies/SEO das descrições.

#### Coleções com violations confirmadas (live):

| Coleção | ID | Violações |
|---|---|---|
| Recursos de Comunicação e Rotina Visual | 326442877090 | autorregulação (body + seo), PECS, TEACCH, ABA |
| Ferramentas de Motricidade e Coordenação Motora | 326443106466 | "Integração sensorial" (body), "processamento sensorial" (seo.desc) |
| Recursos de Regulação e Conforto Sensorial | 326443172002 | autorregulação (×4 no body), "Autorregulação sensorial" |
| Recursos Educacionais e Cognitivos | 326443204770 | ABA (body), autorregulação (body) |
| Recursos de Estimulação Sensorial | 326443237538 | autorregulação (×2 body + seo.desc) |
| Fidget Toys Educacionais | 326443335842 | autorregulação (seo.description) |
| Bolas Sensoriais Táteis | 326443368610 | autorregulação (body) |
| Quadros de Rotina Visual Magnéticos | 326443434146 | ABA, TEACCH, autorregulação (body) |
| Brinquedos Visuais Sensoriais | 326443499682 | autorregulação (×2 body), "autorregulação emocional", seo.desc |
| Timers Visuais para Gestão de Tempo | 326443532450 | ABA (body) |
| Kits Sensoriais Educacionais | 326443565218 | "Autorregulação sensorial" (body) |
| Pranchas PECS e Comunicação Alternativa | 326443630754 | PECS em todo o body e seo |
| Cartões Educacionais de Emoções | 326443696290 | "Autorregulação" em seo.title |
| Produtos Ponderados e Pressão Profunda | 326445301922 | "Autorregulação sensorial" (body) |
| Chewelry | 326445236386 | "Autorregulação oral" (body) |

**Total: 15 coleções com violações ativas.**

Termos encontrados:
- `autorregulação` — presente em 13 coleções
- `ABA` — presente em 4 coleções
- `TEACCH` — presente em 2 coleções
- `PECS` — presente em 2 coleções (inclui coleção dedicada)
- `integração sensorial` — presente em 1 coleção
- `processamento sensorial` — presente em 1 coleção (seo.description)

### 1.2 — Blog: tags terapêuticas (CRÍTICO)

Ambos os artigos do blog ("O Que São Brinquedos Sensoriais" e "Fidget Toys: Guia Completo") possuem os mesmos tags:
- **"Ansiedade"** — claim terapêutico direto
- **"Alívio do Estresse"** — equivalente a anti-estresse
- **"Regulação Sensorial"** — autorregulação sensorial
- **"Terapia Ocupacional"** — termo clínico (profissional, não produto)

### 1.3 — Blog: links para handle antigo (IMPORTANTE)

Ambos os artigos possuem links para `https://incluobrasil.com/collections/fidget-toys-terapeuticos`:
- Artigo 1 (brinquedos-sensoriais): 1 link com URL terapêutica
- Artigo 2 (fidget-toys-guia): 2 links com URL terapêutica

O redirect 301 está ativo, mas a URL com "terapeuticos" ainda aparece no href e pode ser rastreada pelo Google.

### 1.4 — Superfícies verificadas e LIMPAS

| Superfície | Status |
|---|---|
| seo.title / seo.description — 143 produtos | ✅ Limpo |
| title / descriptionHtml — 95 produtos | ✅ Limpo |
| Product tags — 4 produtos corrigidos | ✅ Limpo |
| Collection handles — 5 corrigidos + 301 | ✅ Limpo |
| Páginas institucionais (8 páginas) | ✅ Limpo |
| Footer | ✅ Inserido hoje |
| Sobre Nós | ✅ Disclaimers fortes |
| FAQ | ✅ Q10 explícito |

### 1.5 — Pontos borderline (não bloqueadores)

- **Sobre Nós**: menciona "integração sensorial" uma vez como metodologia de design — borderline, risco baixo
- **Termos de Serviço**: "necessidades sensoriais" — termos aceitáveis no contexto
- **Collection "Pranchas PECS"**: coleção inteira dedicada ao sistema PECS — risco moderado se GMC considerar PECS como claim clínico

---

## BLOCO 2 — O QUE AINDA PRECISA SER MELHORADO NA LOJA

### Adicionando / melhorando:

| Item | Ação | Prioridade |
|---|---|---|
| Coleções descriptions: autorregulação, ABA, TEACCH | Remover / substituir | 🔴 Bloqueador |
| Blog tags: Ansiedade, Alívio do Estresse, Regulação Sensorial, Terapia Ocupacional | Remover | 🔴 Bloqueador |
| Blog links: handle `fidget-toys-terapeuticos` | Atualizar para `fidget-toys-foco` | 🔴 Bloqueador |
| Preços R$0,00 em 4 produtos | Atualizar preços | 🔴 Bloqueador |
| Política de Privacidade | Expandir — está muito curta (apenas 1 parágrafo) | 🟡 Recomendado |
| Blog artigos: adicionar disclaimer inline | "Os produtos mencionados são para uso recreativo e educacional, não substituem terapia." | 🟡 Recomendado |
| Badges de confiança no footer | CNPJ, SSL, Frete Grátis visíveis | 🟡 Recomendado |
| Sobre Nós: remover "integração sensorial" | Substituir por "metodologias educacionais" | 🟡 Recomendado |

### Mantendo como está:

- Páginas institucionais (Termos, Trocas, Envios, Fale Conosco, Sobre, Aviso, FAQ, Cookies)
- Disclaimers em Sobre Nós, Termos, Aviso Legal, FAQ
- CNPJ, endereço, email, WhatsApp em múltiplas páginas
- Product descriptions e titles (todos limpos)

---

## BLOCO 3 — TRANSPARÊNCIA COMERCIAL E CONFIANÇA

| Item | Presente | Qualidade | Ação |
|---|---|---|---|
| Nome comercial (Incluo) | ✅ | Bom | Manter |
| Razão social | ✅ | Bom | Manter |
| CNPJ 65.393.441/0001-46 | ✅ Múltiplas páginas | Bom | Manter |
| Endereço físico completo | ✅ | Bom | Manter |
| Email contato@incluobrasil.com | ✅ | Bom | Manter |
| WhatsApp (77) 99820-5841 | ✅ | Bom | Manter |
| Horário de atendimento | ✅ | Bom | Manter |
| Página Sobre Nós | ✅ | Forte | Manter (remover "integração sensorial") |
| Página de contato | ✅ | Bom | Manter |
| Termos de Serviço | ✅ | Completo | Manter |
| Política de Privacidade | ✅ | ⚠️ Curta demais | Expandir |
| Política de Trocas/Devolução | ✅ | Bom | Manter |
| Política de Envios | ✅ | Completo | Manter |
| FAQ | ✅ | Forte | Manter |
| Aviso Legal | ✅ | Bom | Manter |
| Footer disclaimer | ✅ Inserido hoje | Confirmar visualmente | — |
| SSL/HTTPS | ✅ | — | — |
| Visibilidade das políticas no menu/footer | 🟡 Verificar | Devem estar no footer | Confirmar |

---

## BLOCO 4 — CHECKOUT / WEBSITE NEEDS IMPROVEMENT

| Item | Status |
|---|---|
| HTTPS | ✅ |
| Checkout finalizável | ✅ (inferido — sem dados de erro) |
| Variantes R$0,00 ativas | 🔴 4 produtos, 10 variantes |
| Estoque disponível | 🟡 Não verificado |
| Frete e prazo visíveis | ✅ (Política de Envios clara) |
| Links quebrados no blog | 🔴 Links apontam para handle antigo |
| Conteúdo placeholder | ✅ Nenhum identificado |
| Preços consistentes PDP → checkout | ✅ (inferido) |

### 4 produtos com preço R$0,00:

| Produto | Variante(s) | ID |
|---|---|---|
| Colar Mordedor Sensorial Tubarão | "café" (1 variante) | 8928046776482 |
| Protetor Auricular Silicone Macio | Todas as 6 variantes | 8928104939682 |
| Mini Trampolim Sensorial 48pol | Todas as 3 variantes (A, B, C) | 8928107790498 |
| Cobertor Ponderado de Pressão Profunda | Única variante | 8928572899490 |

**Ação necessária:** definir preços reais para todos. Produtos com TODAS as variantes a R$0,00 (Protetor Auricular, Mini Trampolim, Cobertor Ponderado) estão essencialmente sem preço — GMC vai reprovar por "preço inválido".

---

## BLOCO 5 — FEED E CONSISTÊNCIA DE ATRIBUTOS

| Atributo | Status |
|---|---|
| price | 🔴 4 produtos com variantes R$0,00 |
| title | ✅ 143 produtos limpos |
| description | ✅ 95 produtos limpos |
| handle/link | ✅ Handles limpos + 301 redirects |
| image_link | ✅ CDN Shopify ativo |
| brand | 🟡 Não verificado — "Incluo" pode não estar em todos |
| gtin | 🟡 Ausente (normal — declarar identifier_exists=false) |
| condition | 🟡 "new" deve ser declarado |
| google_product_category | 🟡 Default 3793 (Toys & Games > Educational Toys) — verificar no GMC |
| shipping | 🟡 Perfil "Perfil geral" existe — verificar se tem Brasil configurado |
| availability | 🟡 Verificar se produtos R$0,00 estão como "in stock" |

---

## BLOCO 6 — DISCLAIMER E POSICIONAMENTO REGULATÓRIO

| Local | Status | Texto |
|---|---|---|
| Sobre Nós (topo) | ✅ Forte | "Não substituem avaliação, diagnóstico ou tratamento médico, psicológico ou terapêutico." |
| Sobre Nós (compromisso) | ✅ Forte | Repetido com mais ênfase |
| Termos de Serviço §10 | ✅ | "NÃO substituem terapias, tratamentos médicos ou acompanhamento especializado." |
| Aviso Legal §9 | ✅ | "não substituem terapias, tratamentos médicos ou acompanhamento especializado." |
| FAQ Q10 | ✅ Explícito | "Não substituem terapias, tratamentos médicos ou acompanhamento profissional." |
| Footer | ✅ Inserido hoje | Verificar visualmente |
| Blog artigos | 🔴 Ausente | Adicionar inline no final de cada artigo |
| Descrições de produto inline | 🟡 Ausente | Nice-to-have |

---

## BLOCO 7 — CHECKLIST GOOGLE MERCHANT CENTER

### Obrigatório antes do re-review:

- [ ] Business Info → nome "Incluo", razão social, endereço completo, CNPJ
- [ ] Phone verification → verificar (77) 99820-5841 por SMS/chamada
- [ ] Shipping service → "Brasil", BRL, frete grátis, prazo 10-20 dias corridos
- [ ] Return policy → 7 dias arrependimento, sem custo de frete reverso
- [ ] Diagnostics → Feed → zero erros críticos
- [ ] Diagnostics → Account Issues → Misrepresentation → "Request Review" disponível
- [ ] Preços R$0,00 → corrigir antes de submeter (4 produtos)
- [ ] Coleções autorregulação/ABA/TEACCH → corrigir antes de submeter
- [ ] Blog tags terapêuticos → corrigir antes de submeter

### Recomendado:

- [ ] Identity verification → documento ou CNPJ verificado
- [ ] Google Product Category → confirmar mapeamento correto (3793)
- [ ] Products → All products → verificar se produtos R$0,00 aparecem como "disapproved"
- [ ] Products → Issues → verificar se há outros issues além de Misrepresentation

### Opcional / pós-aprovação:

- [ ] GTIN / identifier_exists → declarar false para todos
- [ ] Feeds automáticos → verificar se Simprosys ou feed app está configurado
- [ ] Promotions → configurar promoções após aprovação

---

## BLOCO 8 — CHECKLIST GOOGLE ADS

### Necessário agora:

- [ ] Verificar se conta Google Ads ainda está ativa (billing)
- [ ] Manter campanhas Shopping/PMax PAUSADAS até aprovação GMC

### Recomendado agora:

- [ ] Tools → Linked Accounts → Merchant Center → confirmar link ativo
- [ ] Conversions → "Purchase" → confirmar que event está ativo
- [ ] Preparar negative keywords: autismo, tdah, terapia, terapêutico, autorregulação, ansiedade, anti-estresse

### Pode esperar:

- [ ] Reativar campanhas (só após GMC aprovar)
- [ ] Ajustar budget e lances
- [ ] Configurar Audiences e Remarketing
- [ ] Criar extensões de anúncio

---

## BLOCO 9 — ITENS ESQUECIDOS OU SUSPEITOS

### 🔴 Confirmados nesta auditoria:

1. **15 coleções com "autorregulação" / ABA / TEACCH / PECS nas descriptions e SEO** — superfície grande, visível ao reviewer manual
2. **Blog tags: Ansiedade, Alívio do Estresse, Regulação Sensorial, Terapia Ocupacional** — 2 artigos, mesmos tags
3. **Blog body: links para `fidget-toys-terapeuticos`** — href com claim terapêutico em 3 instâncias
4. **Protetor Auricular Silicone (8928104939682)**: TODAS as 6 variantes a R$0,00 — produto aparece sem preço no catálogo e feed

### 🟡 Suspeitos / não confirmados:

5. **Sobre Nós: "integração sensorial"** — mencionado como metodologia de design, borderline
6. **Simprosys ou feed app**: mencionado no vault como pendente de configuração — não verificado se está ativo e configurado
7. **Alt text de imagens**: não verificado — Google pode indexar alt text com claims
8. **Metafields de produto**: não verificado — podem conter dados antigos
9. **Schema/JSON-LD**: não verificado — pode conter claims em structured data
10. **Produtos draft/archived com claims**: não verificado — produtos inativos podem ter URLs acessíveis
11. **Redirect URLs antigas**: handles corrigidos com 301 — testar se a URL antiga retorna 301 e não 200

---

## BLOCO 10 — DECISÃO FINAL

### Veredicto: 🟡 QUASE GO

**3 bloqueadores críticos novos + 1 bloqueador já conhecido:**

| # | Bloqueador | Esforço | Urgência |
|---|---|---|---|
| B1 | 15 coleções com autorregulação/ABA/TEACCH/PECS | Alto (15 mutations) | Antes do review |
| B2 | Blog tags terapêuticos | Baixo (2 artigos, remover tags) | Antes do review |
| B3 | Blog links para handle antigo | Baixo (atualizar 3 hrefs) | Antes do review |
| B4 | 4 produtos com preço R$0,00 | Médio (definir preços + 10 mutations) | Antes do review |
| M1 | Business Info/Shipping/Returns no GMC | Baixo (15 min no painel) | Antes do review |

**O que NÃO impede a aprovação:**
- SKUs AliExpress residuais (~50 produtos) — não afetam feed
- Política de Privacidade curta — risco baixo
- Ausência de badge de confiança no footer — nice-to-have
- "integração sensorial" em Sobre Nós — borderline, risco baixo

---

## ORDEM IDEAL DE EXECUÇÃO

```
[HOJE — Sessão atual]
  ① Corrigir descriptions de 15 coleções:
     → Substituir "autorregulação" por "organização pessoal"
     → Remover ABA, TEACCH, PECS (ou substituir por genérico)
     → Atualizar seo.title/seo.description das coleções afetadas
  
  ② Corrigir blog tags dos 2 artigos:
     → Remover: Ansiedade, Alívio do Estresse, Regulação Sensorial, Terapia Ocupacional
     → Manter: Brinquedos Sensoriais, Fidget Toys, Foco e Concentração, Incluo, etc.
  
  ③ Corrigir links no body dos 2 artigos:
     → Substituir todos os hrefs "fidget-toys-terapeuticos" por "fidget-toys-foco"
  
  ④ Definir preços para 4 produtos com R$0,00
     (precisa de preços reais do operador)

[HOJE — Depois das correções acima]
  ⑤ Verificar footer disclaimer visualmente em 3 URLs
  ⑥ Verificar GMC: Business Info, Shipping, Returns

[AMANHÃ / 48h depois]
  ⑦ Submeter Request Review no GMC
  ⑧ Preencher formulário com explicação das mudanças
  ⑨ Manter campanhas Google Ads pausadas
```

---

## PRÉ-CHECK FINAL ANTES DE CLICAR EM REQUEST REVIEW

- [ ] 15 coleções descriptions corrigidas (autorregulação → organização pessoal; ABA/TEACCH removidos)
- [ ] Blog tags terapêuticos removidos dos 2 artigos
- [ ] Blog links atualizados (fidget-toys-terapeuticos → fidget-toys-foco)
- [ ] 4 produtos com preço R$0,00 corrigidos
- [ ] Footer disclaimer visível em home + /products/* + /collections/*
- [ ] GMC → Business Info preenchido
- [ ] GMC → Shipping: serviço Brasil ativo
- [ ] GMC → Returns: política 7 dias cadastrada
- [ ] GMC → Diagnostics → Account Issues → "Request Review" disponível (não bloqueado)

---

## CHECKLISTS CURTOS

### Execução imediata (hoje):
- [ ] Coleções: remover autorregulação, ABA, TEACCH de 15 descriptions
- [ ] Blog tags: remover Ansiedade, Alívio do Estresse, Regulação Sensorial, Terapia Ocupacional
- [ ] Blog links: substituir fidget-toys-terapeuticos → fidget-toys-foco (3 instâncias)
- [ ] Preços: definir valores para 4 produtos e aplicar mutations

### Pré-re-review (antes de clicar):
- [ ] Confirmar footer visível em 3 páginas
- [ ] GMC Business Info completo
- [ ] GMC Shipping service configurado para Brasil
- [ ] GMC Returns policy cadastrada
- [ ] Coleções limpas (verificar visualmente em 3 delas)
- [ ] Blog tags limpos (verificar no admin Shopify)

### O que preencher no Merchant Center:
- Business Info → nome, endereço, telefone, CNPJ
- Phone verification → (77) 99820-5841
- Shipping → Brasil, frete grátis, 10-20 dias corridos
- Returns → 7 dias, sem custo, via logística reversa
- Diagnostics → Account Issues → Misrepresentation → Request Review
- Formulário: explicar mudanças (claims removidos, disclaimers adicionados)

### O que verificar no Google Ads:
- Conta ativa (billing)
- Link GMC ativo
- Campanhas Shopping/PMax PAUSADAS
- Conversion "Purchase" ativo
- Negative keywords preparadas
