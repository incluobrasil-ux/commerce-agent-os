---
created_at: 2026-05-30T00:00:00Z
type: run-summary
task: Round 2 — execução completa pré-review 4 junho
status: completed
mutations_applied: 2
errors: 0
---

# Run Summary — Round 2 Execução Completa (2026-05-30)

## DESCOBERTAS NOVAS (não identificadas no round 1)

### 🔴 Coleção "Pranchas PECS" — URL VIVA NO SITEMAP
- URL `incluobrasil.com/collections/pranchas-pecs-e-comunicacao-alternativa` retorna 200 OK
- H1: "Pranchas PECS e Comunicação Alternativa"
- Title: "Pranchas PECS e Comunicação Alternativa com Suporte Visual - Incluo"
- Está no sitemap_collections_1.xml — Google indexa esta URL com "PECS"
- **NÃO FOI RENOMEADA** nesta sessão (GraphQL MCP expirado)
- **AÇÃO MANUAL NECESSÁRIA:** Shopify Admin → /admin/collections/326443630754

### 🔴 Produtos "Oral Motor" — body e tags não corrigidos no round 1
O run summary do round 1 (Fase 8) registrou: "Oral Motor substituído" mas apenas o TÍTULO e SEO foram alterados. O BODY e as TAGS ainda tinham "oral motor" / "fonoaudiologia".

**Produto 8928401457314 — Kit Ferramentas de Estimulação Oral:**
- Body: tinha "Kit Ferramentas de Exercício Oral Motor" no H2, "coordenação oral-motora" no text
- Tags: tinha "oral motor, fonoaudiologia, motor"
- Alt text: tinha "Kit Ferramentas de Exercicio Oral Motor Incluo" (4 imagens)
- ✅ Body CORRIGIDO nesta sessão
- ✅ Tags CORRIGIDAS nesta sessão
- ❌ Alt text: AINDA com "Oral Motor" — precisa GraphQL

**Produto 8928405160098 — Kit Canudos e Bolas:**
- Body: tinha "estímulo oral motor", "Fortalecimento oral motor" no text
- Tags: tinha "oral motor, fonoaudiologia, motor"
- Alt text: tinha "Kit Canudos e Bolas para Sopro Oral Motor Incluo" (4 imagens)
- Image CDN filenames: `kit-canudos-e-bolas-para-sopro-oral-motor-autorregulacao-respiratoria-*.webp`
- ✅ Body CORRIGIDO nesta sessão
- ✅ Tags CORRIGIDAS nesta sessão
- ❌ Alt text: AINDA com "Oral Motor" — precisa GraphQL
- ❌ CDN filenames: não alteráveis (são permanentes no CDN Shopify)

### ✅ Schema markup: LIMPO
Verificação em `cubo-fidget-12-lados-foco-conforto-tatil` — nenhum JSON-LD com claims terapêuticos encontrado.

### ✅ Sitemap collections: 1 URL flagrada
`pranchas-pecs-e-comunicacao-alternativa` — única URL com term problemático nas coleções.

### ✅ Sitemap products: URLs limpas
Produtos flagrados apenas por filenames CDN com "oral-motor" (não alteráveis) e "autorregulação" em captions de imagens antigas.

---

## MUTATIONS APLICADAS NESTA SESSÃO

| Produto | Campo | Antes | Depois | Status |
|---|---|---|---|---|
| 8928401457314 | body_html | "Oral Motor" em H2, descriptions, palavras-chave | "Estimulação Oral", "musculatura bucal" | ✅ |
| 8928401457314 | tags | "oral motor, fonoaudiologia, motor" | "estimulação oral, desenvolvimento oral" | ✅ |
| 8928405160098 | body_html | "oral motor", "Fortalecimento oral motor" | "estimulação oral", "Fortalecimento bucal" | ✅ |
| 8928405160098 | tags | "oral motor, fonoaudiologia, motor" | "estimulação oral, desenvolvimento respiratório" | ✅ |

**Total sessão:** 2 mutations, 0 erros

---

## PENDÊNCIAS QUE AINDA PRECISAM DE AÇÃO

### Via Shopify Admin (manual — 5 min):
1. **Coleção 326443630754:** Mudar título para "Pranchas de Comunicação Visual Alternativa" + handle `pranchas-comunicacao-visual-alternativa`
   - URL: `incluo.myshopify.com/admin/collections/326443630754`

### Via GraphQL (próxima sessão claude.ai com MCP ativo):
2. **Alt text produto 8928401457314:** 4 imagens com "Oral Motor" no alt
   - IDs: 45705876603042, 45705876963490, 45705877127330, 45705877422242
   - Novo alt: "Kit Ferramentas de Estimulação Oral Incluo [imagem N]"
3. **Alt text produto 8928405160098:** 4 imagens com "Oral Motor" no alt
   - IDs: 45705882566818, 45705883025570, 45705883582626, 45705884205218
   - Novo alt: "Kit Canudos e Bolas para Sopro Incluo [imagem N]"
4. **Taxonomy categories:** Pebolim, Penico, Temporizador
5. **Coleção rename via GraphQL** (se admin manual não for feito)

### Via GMC painel (manual):
6. Prazo de entrega → 20-35 dias corridos
7. Local de origem do envio → Av. Serrinha, 3262, Vitória da Conquista - BA
8. Verificação de identidade → documentos
9. Forçar resync Shopify App API + Simprosys

### Antes do dia 4:
10. Reviews: instalar Judge.me + importar reviews AliExpress
11. Política de Privacidade: expandir para LGPD completa

---

## JUSTIFICATIVA GMC PRONTA
Arquivo: `12_reports/misrepresentation-remediation/incluo/round2-fixes/justificativa-gmc-4junho.md`

---

## STATUS GERAL ROUND 2

| Área | Status |
|---|---|
| China Mainland (250 produtos) | ✅ LIMPO |
| Schema markup | ✅ LIMPO |
| Sitemap products | ✅ Limpo (CDN filenames não controlamos) |
| Body "Oral Motor" (2 produtos) | ✅ CORRIGIDO agora |
| Tags "oral motor / fonoaudiologia" | ✅ CORRIGIDO agora |
| Alt text "Oral Motor" (8 imagens) | ❌ Pendente GraphQL |
| Coleção "Pranchas PECS" renomear | ❌ Pendente manual |
| GMC prazo de entrega | ❌ Pendente manual |
| GMC local de origem | ❌ Pendente manual |
| GMC verificação identidade | ❌ Pendente manual |
| Reviews na loja | ❌ Pendente |
| Política de Privacidade | ❌ Pendente |
