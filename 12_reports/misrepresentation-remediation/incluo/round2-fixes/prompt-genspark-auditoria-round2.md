# PROMPT GENSPARK — Auditoria Round 2 | GMC Incluo Brasil

---

Preciso que você atue como um auditor especialista em Google Merchant Center e e-commerce. Vou te dar todo o contexto do que já foi feito e o que ainda falta. Quero que você:

1. Analise o que foi feito e identifique se algo foi mal executado ou incompleto
2. Audite o que ainda falta fazer e priorize por impacto na aprovação
3. Identifique riscos que ainda não foram mapeados
4. Me dê um plano de execução para o dia 4 de junho (próxima janela de revisão GMC)

---

## CONTEXTO DA LOJA

**Loja:** Incluo Brasil — incluobrasil.com
**Shopify interno:** v0ycj3-1u.myshopify.com
**CNPJ:** 65.393.441/0001-46 (Roberto dos Santos Medrado)
**Endereço:** Av. Serrinha, 3262, Vitória da Conquista - BA, CEP 45.075-220
**Contato:** contato@incluobrasil.com | (77) 99820-5841
**Nicho:** Brinquedos sensoriais e educacionais
**Modelo:** Dropshipping (fornecedores China via AliExpress)
**Catálogo:** 143 produtos ativos — fidget toys, temporizadores, mordedores, tapetes sensoriais, pranchas de comunicação visual, cobertores ponderados
**GMC Account ID:** 5782238032

---

## HISTÓRICO DO PROBLEMA

A loja foi suspensa no GMC por **Deturpação (Misrepresentation)**. O catálogo original usava linguagem clínica/terapêutica: autismo, TEA, TDAH, ABA, TEACCH, PECS, autorregulação, anti-estresse, terapêutico, integração sensorial, Oral Motor, terapeutas ocupacionais — em títulos, descrições, URLs, tags, alt text e coleções.

O Google interpretou como enganação ao consumidor, pois a loja não é clínica e não tem habilitação para claims terapêuticos/médicos.

---

## O QUE JÁ FOI FEITO

### Round 1 — 27-28 de maio de 2026 (345+ mutations via API Shopify)

**Produtos (143 produtos):**
- ✅ Títulos: todos limpos
- ✅ Descrições HTML (body): linguagem clínica → educacional/recreativa
- ✅ SEO title + meta description: limpos
- ✅ ProductType: "Antiestresse" → "Sensoriais Fidget"
- ✅ Tags: removidas (Clinica ABA, rotina-aba, Anti-Stress, Autorregulação, kit-terapeutico, etc.)
- ✅ Handles/URLs: 26 URLs antigas com claims → novas URLs educacionais (301 redirect)
- ✅ Alt text: 80+ imagens preenchidas (range 9229xxx estavam vazias)
- ✅ Metafields (custom.detalhes_do_produto): limpos em 12 produtos
- ✅ 2 variantes "China Mainland" deletadas
- ✅ Categorias médicas corrigidas (equipamentos fisioterapia, protetores bucais → brinquedos)
- ✅ 2 produtos arquivados (Trampolim + Cobertor, sem preço definido)
- ✅ "Oral Motor" → "Estimulação Oral" em títulos e SEO (2 produtos)

**Coleções (15 coleções):**
- ✅ Descrições HTML, SEO, handles: limpos
- ✅ "autorregulação" → "organização pessoal"
- ✅ "ABA/TEACCH" → "metodologias educacionais estruturadas"
- ✅ Body da coleção "Pranchas PECS": limpo
- ❌ **TÍTULO e HANDLE da coleção "Pranchas PECS" NÃO foram renomeados** — ainda em `/collections/pranchas-pecs-e-comunicacao-alternativa` com H1 "Pranchas PECS e Comunicação Alternativa"

**Blog (2 artigos):**
- ✅ Tags terapêuticas removidas
- ✅ Links para URLs antigas corrigidos

**Páginas institucionais:**
- ✅ Sobre Nós: disclaimers fortes + linguagem educacional
- ✅ Termos de Serviço §10: "NÃO substituem terapias"
- ✅ Aviso Legal §9: disclaimer explícito
- ✅ FAQ Q10: resposta direta
- ✅ Footer: disclaimer permanente

**GMC Painel:**
- ✅ Business Info: CNPJ, endereço, telefone
- ✅ Phone Verification
- ✅ Shipping Service configurado
- ✅ Return Policy: 7 dias, sem custo
- ✅ Simprosys sync executado
- ✅ Request Review submetido em 28/05 → **REPROVADO (verificação MANUAL)**

---

### Round 2 — 30 de maio de 2026

**Diagnóstico executado:**
- ✅ Scan de 250 produtos ativos: **China Mainland = LIMPO** (0 variantes)
- ✅ Schema markup / JSON-LD verificado: **LIMPO** (sem claims em dados estruturados)
- ✅ Sitemap auditado: **1 URL problemática** = `/collections/pranchas-pecs-e-comunicacao-alternativa`
- ✅ Sitemap products: URLs limpas nos handles (CDN filenames com "oral-motor" — não alteráveis)

**Correções executadas hoje:**
- ✅ Kit Ferramentas de Estimulação Oral (ID 8928401457314):
  - Body: "Oral Motor" → "Estimulação Oral", "coordenação oral-motora" → "coordenação oral"
  - Tags: removidos "oral motor", "fonoaudiologia"
- ✅ Kit Canudos e Bolas (ID 8928405160098):
  - Body: "oral motor" → "estimulação oral", "musculatura oral" → "musculatura bucal"
  - Tags: removidos "oral motor", "fonoaudiologia"

---

## O QUE AINDA ESTÁ PENDENTE

### CRÍTICO — sem esses, a conta provavelmente reprova de novo:

**1. Coleção "Pranchas PECS" — MANUAL no Shopify Admin**
- URL atual (200 OK, no sitemap): `incluobrasil.com/collections/pranchas-pecs-e-comunicacao-alternativa`
- H1 na página: "Pranchas PECS e Comunicação Alternativa"
- O que fazer: Shopify Admin → `/admin/collections/326443630754` → mudar título para "Pranchas de Comunicação Visual Alternativa" → handle: `pranchas-comunicacao-visual-alternativa` → Salvar (cria 301 automático)

**2. Prazo de entrega GMC — MANUAL no painel GMC**
- Configurado: "4 a 7 dias" (FALSO para dropshipping China)
- Real: 15-30 dias
- O que fazer: GMC → Entregas e devoluções → editar política → mudar para "20 a 35 dias corridos"

**3. Local de origem do envio — MANUAL no painel GMC**
- Campo "Locais de origem do envio" está VAZIO
- O que fazer: GMC → Entregas e devoluções → Adicionar local → Av. Serrinha, 3262, Vitória da Conquista, BA, 45075-220

**4. Verificação de identidade — MANUAL no painel GMC**
- Nunca submetida
- O que fazer: GMC → "Corrigir problema" → fluxo de verificação → submeter CNH do Roberto + comprovante de endereço + CNPJ impresso da Receita Federal

**5. Alt text com "Oral Motor" — precisa GraphQL Shopify**
- Kit Ferramentas: 4 imagens com alt "Kit Ferramentas de Exercicio Oral Motor Incluo"
  - Image IDs: 45705876603042, 45705876963490, 45705877127330, 45705877422242
  - Novo alt: "Kit Ferramentas de Estimulação Oral Incluo - imagem N"
- Kit Canudos: 4 imagens com alt "Kit Canudos e Bolas para Sopro Oral Motor Incluo"
  - Image IDs: 45705882566818, 45705883025570, 45705883582626, 45705884205218
  - Novo alt: "Kit Canudos e Bolas para Sopro Incluo - imagem N"

**6. Forçar resync dos feeds**
- GMC → Fontes de dados → Shopify App API → 3 pontos → Sincronizar agora
- Shopify Admin → Apps → Simprosys → Sync

---

### IMPORTANTE — aumenta chance de aprovação:

**7. Zero reviews na loja**
- Reviewer manual vê loja sem nenhuma avaliação de produto
- GMC cita explicitamente "reputação online com avaliações e selos de aprovação"
- App recomendado: Judge.me (gratuito) + importar reviews do AliExpress

**8. Política de Privacidade muito curta (1 parágrafo)**
- Inadequada para LGPD
- Precisa seções: dados coletados, finalidade, cookies, direitos do titular, DPO, retenção

**9. Taxonomy categories erradas (3 produtos)**
- Pebolim de Mesa (ID 9219774677154): categoria "Brinquedos para bebês" → corrigir para brinquedos de mesa/família
- Penico Portátil (ID 9219762028706): "Acessórios para grades" → acessórios infantis
- Temporizador Visual (ID 8928559300770): "Relógios de ponto" → Temporizadores (node 3689)

**10. Dois feeds concorrentes**
- Shopify App API (405 produtos) + Simprosys Feed (43 produtos): ambos ativos simultaneamente
- Risco: dados conflitantes, Simprosys pode ter cache pré-remediação
- Recomendação: avaliar pausar/remover Simprosys feed

**11. identifier_exists=false não declarado**
- Produtos sem GTIN (código de barras) precisam declarar explicitamente
- Sem isso: GMC gera warnings de qualidade de dados

**12. CDN image filenames com "oral-motor" e "autorregulacao"**
- Arquivos no CDN Shopify com nomes problemáticos:
  - `kit-ferramentas-de-exercicio-oral-motor-3-pecas-pp-metal-*.webp`
  - `kit-canudos-e-bolas-para-sopro-oral-motor-autorregulacao-respiratoria-*.webp`
- Não são alteráveis (CDN permanente) mas alt text e body foram corrigidos
- Avaliação: baixo impacto vs. esforço de substituir imagens

---

## O QUE O GOOGLE DISSE NA REPROVAÇÃO

**Tipo:** Verificação MANUAL (humano revisou a loja)
**Mensagem:** "clientes estão sendo enganados no Google"
**Checklist fornecido pelo Google:**
1. "Seja transparente com a identidade, o modelo de negócios, as políticas e como os clientes podem interagir com sua empresa"
2. "Melhore sua reputação on-line mostrando avaliações ou destacando selos de aprovação"
3. "Use um design profissional para sua loja on-line que inclua um certificado SSL"
4. "Adicione as informações comerciais nas configurações do Merchant Center"
5. "Siga as diretrizes de SEO, melhore sua qualificação na classificações do vendedor e confirme se os dados do produto no Merchant Center correspondem aos da loja on-line"

**Qualidade da loja:** "Boa" — na média do mercado (não é o problema)
**Produtos:** 448 total, todos os 448 reprovados (100%)

---

## DADOS TÉCNICOS ADICIONAIS

**Feeds ativos no GMC:**
- Shopify App API: 405 produtos | Última atualização: "-" (sem data)
- Simprosys Feed: 43 produtos | Última atualização: "-" (sem data)

**Política de frete atual:** gratuito, 4 a 7 dias, Brasil
**Política de devolução:** 7 dias, sem custo (configurada)
**SSL:** ativo ✅
**Site verificado + reivindicado no GMC:** ✅
**Qualidade da loja:** Boa ✅

**URL da coleção problemática (confirmada 200 OK):**
`https://incluobrasil.com/collections/pranchas-pecs-e-comunicacao-alternativa`

---

## O QUE QUERO QUE VOCÊ FAÇA

### 1. AUDITE o que foi feito
Analisando tudo que eu descrevi acima, identifique:
- Algo que pode ter sido feito de forma incompleta ou incorreta?
- Algo que parece estar correto mas que um reviewer manual ainda poderia reprovar?
- Alguma superfície que não foi mencionada e pode estar contaminada?

### 2. AUDITE o que falta
Com base no checklist de pendências acima e no padrão de reprovação do GMC:
- O que é absolutamente crítico para o dia 4 de junho?
- O que pode esperar pós-aprovação?
- Tem algo faltando que não está na minha lista?

### 3. ANALISE o risco dos CDN filenames
Os nomes de arquivo no CDN Shopify contêm "oral-motor" e "autorregulacao". O Google consegue penalizar isso? Vale o esforço de trocar as imagens inteiras? Qual é o impacto real?

### 4. SOBRE reviews
Como uma loja dropshipping nova consegue reviews legítimos e rapidamente? Quais apps funcionam melhor para importar reviews de fornecedores AliExpress sem violar políticas do Google?

### 5. SOBRE o prazo de entrega
Como declarar o prazo real de forma honesta no GMC sem afastar clientes? Tem uma estratégia para balancear transparência com conversão?

### 6. SOBRE o modelo dropshipping
O Google exige disclosure explícito de que é dropshipping? Onde colocar isso na loja? Tem template ou linguagem recomendada?

### 7. PLANO DE EXECUÇÃO para o dia 4 de junho
Me dê uma sequência exata e priorizada do que fazer, separando:
- O que fazer HOJE
- O que fazer amanhã
- O que fazer no dia 3 de junho (véspera)
- O que fazer no dia 4 de junho (hora de submeter)

### 8. TEXTO DE JUSTIFICATIVA
Melhore ou valide o texto abaixo que pretendo usar no formulário de revisão do GMC:

---
*"Realizamos remediação completa do catálogo: 350+ correções em títulos, descrições, SEO, URLs, coleções e blog — removendo toda linguagem clínica/terapêutica. Adicionamos disclaimers explícitos em 5 pontos do site. Corrigimos prazo de entrega, adicionamos origem do envio e submetemos verificação de identidade. A loja vende brinquedos sensoriais recreativos, não dispositivos médicos."*

---

### 9. RISCOS QUE EU NÃO MAPEEI
O que mais poderia causar reprovação que eu não mencionei neste prompt?

---

## IMPORTANTE

- Próxima análise disponível: **4 de junho de 2026**
- Cada reprovação adiciona mais tempo de espera (ciclos de análise ficam mais longos)
- Quando aprovado: campanha P.Max feed-only imediata (R$200-300/dia)
- A loja já teve 4 vendas nos primeiros 2 dias de Google Ads antes da suspensão — o produto converte
- O problema hoje é **aprovação**, não performance

Analise tudo com profundidade e me entregue respostas práticas e diretas.
