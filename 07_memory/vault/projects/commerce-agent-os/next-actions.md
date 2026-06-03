---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-06-03T00:00:00Z
tags: [next-actions]
source: mixed
confidence: 1.0
---

# Next Actions

**Para que serve:** lista pequena, ordenada e **executável** das próximas ações.

---

## 🟡 STATUS ATUAL — GMC REVIEW 2 PENDENTE — DATA: 04/06/2026

**Toda remediação técnica concluída.** Faltam apenas os passos manuais abaixo.

---

## 🔴 AÇÕES IMEDIATAS — ANTES DO DIA 4 DE JUNHO

### A. Manual (browser — usuário faz)

| # | Ação | Status |
|---|---|---|
| M1 | Terminar políticas Shopify: Configurações → Políticas → preencher campos vazios com "Criar a partir do modelo" | ⏳ Em andamento |
| M2 | Verificar banner vermelho no GMC — se houver, fazer upload do cartão CNPJ (Receita Federal) | ⬜ Pendente |
| M3 | Verificar NAP no Google Ads: ads.google.com → Faturamento → nome/CNPJ/endereço = Av. Serrinha 3262, VCA-BA, 45075-220 | ⬜ Pendente |
| M4 | Padronizar NAP no Instagram e Facebook: endereço + telefone 77 99820-5841 | ⬜ Pendente |
| M5 | Aguardar carta dos Correios com código de verificação do Google Business Profile | 🕐 Aguardando (5–14 dias) |
| M6 | Após receber a carta: entrar em business.google.com → digitar o código → GBP verificado | 🔒 Depende M5 |
| M7 | Após M6: merchants.google.com → Configurações → Informações da empresa → vincular GBP ao GMC | 🔒 Depende M6 |

### B. Submissão (após A completo)

| # | Ação | Status |
|---|---|---|
| R1 | Submeter GMC Request Review 2 em **04/06/2026** | ⬜ Aguardando A |

**TEXTO DA JUSTIFICATIVA — colar no campo do GMC:**

> We have reviewed and corrected all issues related to the Misrepresentation policy on our store (incluobrasil.com).
>
> Actions taken:
> 1. Removed all clinical and therapeutic language from product titles, descriptions, and tags (terms such as "proprioceptive stimulation", "sensory organization", "oral motor", "deep pressure therapy").
> 2. Replaced all product images containing clinical terms in CDN filenames (estimulo-proprioceptivo, oral-motor, reflexologia, acupressao, estimulo-tatil, estimulo-sensorial, estimulo-cognitivo) with neutral filenames across all 26 affected products — 152+ images re-uploaded via Shopify API.
> 3. Added clear disclaimer on homepage and FAQ: products are not medical devices and are not intended to diagnose, treat, or cure any condition.
> 4. Updated navigation menu labels to remove clinical references.
> 5. Verified that business information (CNPJ, address, phone) is consistent across all pages and Merchant Center.
> 6. Confirmed return policy (7 days, free) and shipping policy (free, 10–17 business days) are clearly displayed and verified.
>
> All 444 products have been reviewed. The store sells sensory and educational toys for children — not therapeutic or medical products.
>
> We respectfully request a manual review of our account.

---

## 🟢 PRÓXIMA AÇÃO — Quando GMC Aprovar (D0)

### Ação imediata — Subir P.Max Feed-Only

1. Verificar que Simprosys está sincronizado sem erros
2. Criar campanha P.Max no Google Ads:
   - Nome: `INCLUO - PMAX FEED`
   - Orçamento: R$200-300/dia
   - Sem target ROAS (fase de aprendizado)
   - Sem assets criativos (feed-only por 7-10 dias)
   - Sinal de audiência: compradores Shopify + visitantes do site
3. Não mexer por 7-10 dias mínimo
4. Após 30 conversões: definir target ROAS 3x e adicionar assets

> **Estratégia completa:** `07_memory/vault/global/google-ads-strategy-incluo.md`

---

## ⚠️ Pendências menores (pós-aprovação GMC — não bloqueiam review)

| # | Item | Status |
|---|---|---|
| P1 | Botão flutuante WhatsApp (app externo): número +55 (77) 99933364 ≠ oficial 77 99820-5841 | ⬜ Corrigir no painel do app |
| P2 | Categorias Google subótimas: Pebolim (9219774677154), Penico (9219762028706), Temporizador (8928559300770) | ⬜ Pós-aprovação |
| P3 | numberzap no tema: "351910576252" → "77998205841" (addzap=false, está desabilitado — baixo risco) | ⬜ Pós-aprovação |

---

## ✅ CONCLUÍDO — GMC Misrepresentation Remediation COMPLETA (15 Fases)

### Fase 0–9 (2026-05-23 a 05-28) — 345+ mutations
- 143 produtos: body, title, SEO, tags, productType, handles, alt text, metafields ✅
- 15 coleções: body, SEO, handles + 301 redirects ✅
- 2 artigos blog: tags, body, links ✅
- Footer: CNPJ, endereço, disclaimer obrigatório ✅
- FAQ /pages/faq criada (disclaimer não-dispositivo-médico) ✅
- GMC Business Info + Phone + Shipping + Returns ✅
- Simprosys sync: 444 produtos ✅
- **GMC Request Review 1 submetido 2026-05-28** ✅

### Fase 10–13 (2026-05-30 a 05-31)
- GMC Review 1 reprovado → diagnóstico → 8 bloqueadores adicionais encontrados e corrigidos ✅
- Auditoria forense 143/143 produtos ✅
- Imagem síndrome-de-down homepage substituída ✅
- Vídeo homepage alt text preenchido ✅
- Menu label "Recursos de Organização" → "Recursos de Conforto e Bem-Estar Sensorial" ✅

### Fase 14 (2026-06-01 manhã) — 10 produtos CDN
- Colete Sensorial (7), Saco Sensorial (8), Tapete Tátil Pedras (6), Tapete Tátil Pontos (5), Blocos Equilíbrio (5), Kit Ferramentas Bucais (4), Kit Canudos Sopro (4), Colar Pingente Lágrima (5), Colar Mordedor Aranha (7), Mordedor em T (imgs 1-5) ✅

### Fase 15 (2026-06-01 tarde) — 26 produtos CDN — ZERADO
- Todos os 26 produtos restantes com filenames clínicos re-uploaded ✅
- **ZERO imagens com filenames clínicos em qualquer produto ativo** ✅
- Feed duplicado (Shopify App API 292 produtos) removido do GMC ✅

### 2026-06-02/03 — Passos manuais GMC
- Google Business Profile criado: Incluo Brasil, Av. Serrinha 3262, VCA-BA ✅
- Descrição GBP adicionada (texto neutro, sem linguagem clínica) ✅
- Guest checkout confirmado OK via Yampi ✅
- Políticas Shopify: em preenchimento ⏳

---

## Regras

- Item executado → remover daqui + entrada em session-log.md + atualizar current-state.md
- Antes de puxar, ler handoff-log.md
