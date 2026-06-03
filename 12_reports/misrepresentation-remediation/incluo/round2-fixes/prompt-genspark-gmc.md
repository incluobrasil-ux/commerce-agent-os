# PROMPT GENSPARK — Aprovação GMC Incluo Brasil

---

Você é um especialista em Google Merchant Center, Google Shopping e e-commerce. Preciso da sua ajuda para conseguir a aprovação da minha loja no GMC. Vou te dar TODO o contexto do projeto para você analisar e me dizer o que ainda falta fazer.

---

## CONTEXTO DA LOJA

**Loja:** Incluo Brasil (incluobrasil.com)
**Nicho:** Brinquedos sensoriais e educacionais para crianças
**Plataforma:** Shopify (plano Basic)
**CNPJ:** 65.393.441/0001-46
**Razão social:** Roberto dos Santos Medrado
**Endereço:** Av. Serrinha, 3262, Vitória da Conquista - BA, CEP 45.075-220
**Email SAC:** contato@incluobrasil.com
**WhatsApp:** (77) 99820-5841
**Modelo de negócio:** Dropshipping (produtos de fornecedores chineses via AliExpress)
**Catálogo:** 143 produtos ativos — brinquedos sensoriais, fidget toys, temporizadores, pranchas de comunicação visual, mordedores sensoriais, cobertores ponderados, tapetes sensoriais

---

## O PROBLEMA — HISTÓRICO COMPLETO

### Por que foi suspenso
A loja vendia brinquedos sensoriais mas usava linguagem clínica e terapêutica no catálogo inteiro. Exemplos de claims que o Google considerou Misrepresentation:
- "Para crianças com autismo / TEA / TDAH"
- "Autorregulação sensorial"
- "Indicado por terapeutas ocupacionais"
- "Integração sensorial — método ABA e TEACCH"
- "Reduz ansiedade e anti-estresse"
- "Terapêutico" em títulos, descrições, tags e URLs

Isso viola a política de Misrepresentation do Google porque a loja não é clínica nem tem habilitação para fazer claims terapêuticos/médicos. O Google entendeu que os clientes estavam sendo enganados.

### O que já foi feito (Remediação Round 1 — maio/2026)

Fizemos uma remediação massiva: **345+ mutations aplicadas via API Shopify**, corrigindo TODAS as superfícies do catálogo:

**Produtos (143 produtos):**
- Títulos: removidos todos os claims terapêuticos
- Descrições HTML: linguagem clínica → linguagem educacional/recreativa
- Meta title e meta description: limpos
- Tipo de produto (productType): "Brinquedos Antiestresse" → "Brinquedos Sensoriais Fidget"
- Tags: removidas Clinica ABA, rotina-aba, kit-terapeutico, Anti-Stress, Autorregulação, etc.
- URLs (handles): fidget-toys-terapeuticos → fidget-toys-foco (com redirect 301)
- Alt text de imagens: preenchidos (estavam vazios em 16 produtos)
- Metafields: custom.detalhes_do_produto limpos
- Categorias médicas (equipamentos fisioterapia, protetores bucais) → categorias de brinquedos
- 2 variantes "China Mainland" deletadas
- "Oral Motor" → "Estimulação Oral"

**Coleções (15 coleções):**
- Descrições, meta tags e handles limpos
- "autorregulação" → "organização pessoal"
- "ABA/TEACCH" → "metodologias educacionais estruturadas"
- "PECS como metodologia" → "sistema de comunicação visual"

**Blog (2 artigos):**
- Tags terapêuticas removidas
- Links para URLs antigas corrigidos

**Páginas institucionais:**
- Sobre Nós: linguagem clínica removida, disclaimers fortes adicionados
- Termos de Serviço, Aviso Legal, FAQ: disclaimer de não-substituição de terapia em todos

**Footer:**
- Disclaimer adicionado: "Os produtos da Incluo são brinquedos sensoriais para uso recreativo e educacional. Não substituem avaliação ou tratamento de profissional de saúde."

**Google Merchant Center (painel):**
- Business Info: CNPJ, endereço, telefone preenchidos
- Phone Verification: concluída
- Shipping Service: Brasil, BRL configurado
- Return Policy: 7 dias, sem custo
- Simprosys sincronizado

**GMC Request Review submetido em 28/05/2026. Resultado: REPROVADO.**

---

## A REPROVAÇÃO — O QUE O GMC DISSE

**Motivo:** Deturpação (Misrepresentation)
**Tipo de verificação:** MANUAL — um humano do Google entrou na loja e reprovou
**Mensagem:** "Com base nas informações disponíveis sobre sua empresa, temos motivos para acreditar que os clientes estão sendo enganados no Google."

**O GMC listou estas práticas recomendadas:**
1. "Seja transparente com a identidade, o modelo de negócios, as políticas e como os clientes podem interagir com sua empresa"
2. "Melhore sua reputação on-line mostrando avaliações ou destacando selos de aprovação"
3. "Use um design profissional para sua loja on-line que inclua um certificado SSL"
4. "Adicione as informações comerciais nas configurações do Merchant Center"
5. "Siga as diretrizes de SEO, melhore sua qualificação na classificações do vendedor e confirme se os dados do produto no Merchant Center correspondem aos da loja on-line"

**Dados do painel GMC no momento da reprovação:**
- Índice de qualidade da loja: **Boa** (na média do mercado)
- Total de produtos: 448 — todos os 448 reprovados (100%)
- Produtos com "/ China Mainland" no título dentro do GMC (feed desatualizado)
- Local de origem do envio: **VAZIO** — não configurado
- Dois feeds ativos: Shopify App API (405 produtos) + Simprosys (43 produtos), ambos sem data de atualização
- Prazo de entrega configurado no GMC: **4 a 7 dias** (mas produtos vêm da China: 15-30 dias na realidade)
- Política de devolução: aparentemente configurada mas precisa confirmar

**Próxima análise disponível:** 4 de junho de 2026

---

## O QUE JÁ SABEMOS QUE ESTÁ ERRADO

### Confirmados como problemas pendentes:

**1. CRÍTICO — Coleção "Pranchas PECS e Comunicação Alternativa"**
O nome da coleção ainda tem "PECS" (método clínico de comunicação alternativa). O body foi limpo mas o TÍTULO e a URL da coleção ainda contêm "PECS". Um reviewer manual vê esse nome no menu de navegação da loja.

**2. CRÍTICO — Prazo de entrega falso no GMC**
O GMC está configurado com entrega "4 a 7 dias" para Brasil, mas os produtos são dropshipping da China e chegam em 15-30 dias. Isso é misrepresentation direta de prazo de entrega.

**3. CRÍTICO — Local de origem do envio vazio**
A seção "Locais de origem do envio" no GMC está completamente vazia. O Google não sabe de onde os produtos são enviados.

**4. CRÍTICO — Verificação de identidade não realizada**
Em 2026, o Google exige verificação de identidade com documentos para reinstatement de Misrepresentation (CNH/RG + comprovante de endereço + CNPJ). Isso nunca foi feito.

**5. IMPORTANTE — Zero reviews/avaliações na loja**
A loja não tem nenhuma avaliação de produto visível. Para um reviewer manual do Google, isso é sinal forte de loja nova/suspeita ou falsa.

**6. IMPORTANTE — Schema markup / JSON-LD nunca verificado**
Apps de SEO e de produtos podem estar injetando dados estruturados (schema.org) com claims terapêuticos no código-fonte das páginas. O Google lê JSON-LD diretamente, independente do HTML visível.

**7. IMPORTANTE — Política de Privacidade muito curta**
Tem apenas 1 parágrafo. Google considera política de privacidade inadequada como sinal de baixa credibilidade.

**8. IMPORTANTE — Dois feeds concorrentes com dados potencialmente conflitantes**
Shopify App API (405 produtos) e Simprosys (43 produtos) estão ativos ao mesmo tempo. O Simprosys pode ter dados antigos (pré-remediação). Ambos sem data de última sincronização.

**9. IMPORTANTE — identifier_exists=false não declarado**
Produtos sem código de barras/GTIN precisam declarar `identifier_exists: false` no feed. Sem isso, o GMC marca como dado de qualidade ruim.

**10. IMPORTANTE — Modelo de negócio dropshipping**
O Google é muito mais rigoroso com lojas dropshipping. A loja claramente vende produtos AliExpress (SKUs com padrões AliExpress, produtos de múltiplos fornecedores chineses) sem disclosure adequado do modelo de negócio.

---

## TERMOS PROIBIDOS (REFERÊNCIA)

Qualquer um desses termos em qualquer superfície indexável é blocker:

| Proibido | Substituição usada |
|---|---|
| autorregulação / autorregulação sensorial | organização pessoal |
| anti-estresse / antiestresse | relaxamento |
| ansiedade / anti-ansiedade | agitação / descompressão |
| TDAH / ADHD | alta energia |
| autismo / autista / TEA | desenvolvimento (ou removido) |
| terapêutico / terapêutica | prático / educacional |
| integração sensorial | estimulação sensorial |
| processamento sensorial | conforto sensorial |
| ABA / TEACCH | metodologias educacionais estruturadas |
| PECS (como método) | sistema de comunicação visual |
| terapeutas ocupacionais | pais e famílias / educadores |
| regulação emocional | bem-estar emocional |
| Oral Motor | Estimulação Oral |
| consultório | (removido) |
| sobrecarga sensorial | (removido) |

---

## O QUE PRECISO QUE VOCÊ FAÇA

**Com base em todo esse contexto, me ajude a:**

### 1. ANÁLISE DO MOTIVO REAL DA REPROVAÇÃO
O que você acha que foi o motivo principal da reprovação pelo reviewer manual? Qual das issues listadas é mais provável que tenha sido a gota d'água? Considere que:
- O reviewer entrou na loja como consumidor
- Viu o menu de navegação com "Pranchas PECS"
- Viu produtos com "China Mainland" no feed GMC
- Viu prazo de entrega "4-7 dias" mas produtos vêm da China
- A loja tem zero avaliações
- É visivelmente dropshipping

### 2. PLANO DE AÇÃO PRIORIZADO PARA DIA 4 DE JUNHO
Me dê uma lista ordenada por impacto do que fazer antes de submeter nova análise. Separe em:
- O que é blocker absoluto (se não fizer, reprova de novo)
- O que aumenta muito a chance de aprovação
- O que é nice-to-have

### 3. SOBRE O PRAZO DE ENTREGA
Como declarar honestamente o prazo de entrega de produtos dropshipping China no GMC sem parecer lento demais para o cliente? Qual é a melhor prática para lojas que enviam da China para o Brasil?

### 4. SOBRE REVIEWS
Como uma loja nova dropshipping consegue reviews rapidamente antes de uma análise GMC? Quais apps ou estratégias são mais eficazes?

### 5. SOBRE SCHEMA MARKUP
Quais apps Shopify comumente injetam schema markup com dados problemáticos? O que devo verificar no código-fonte?

### 6. SOBRE POLÍTICA DE PRIVACIDADE
O que uma Política de Privacidade adequada para e-commerce brasileiro (LGPD) precisa ter? Me dê a estrutura mínima.

### 7. SOBRE DROPSHIPPING E GMC
Como declarar o modelo de negócio dropshipping de forma transparente sem comprometer a credibilidade da marca? Onde colocar essa informação?

### 8. TEXTO PARA A JUSTIFICATIVA DO REQUEST REVIEW
Me escreva o texto que vou usar no formulário de justificativa quando submeter a nova análise no dia 4. Deve ser claro, específico, mostrar que fizemos mudanças reais e pedir reconhecimento.

### 9. O QUE MAIS VOCÊ VÊ QUE PODE ESTAR ERRADO
Com base em tudo que te contei, o que mais você identificaria como possível causa de reprovação que não mencionei?

---

## CONTEXTO ADICIONAL IMPORTANTE

- A loja já havia tido 4 vendas nos primeiros 2 dias de Google Ads antes da suspensão — o produto funciona
- O Google confirmou que o problema é Misrepresentation, não outro tipo de violação
- A análise foi MANUAL (humano), não algoritmo — então aparência geral e confiança importam tanto quanto termos específicos
- Estamos numa corrida contra o tempo: 4 de junho é a próxima data disponível e cada rejeição adiciona mais tempo de espera
- Quando aprovado, o plano é subir P.Max feed-only em R$200-300/dia imediatamente

Por favor, seja específico, direto e prático. Não quero teoria — quero um plano de ação que funcione.
