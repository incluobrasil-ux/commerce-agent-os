# Google Ads Strategy — Incluo Brasil
# Meta: R$1.000/dia de lucro líquido

> Documento gerado em 2026-05-28 com base em pesquisa de mercado, contexto da loja e dados iniciais de campanha (4 vendas em 2 dias).  
> **Usar como blueprint quando GMC for aprovado.**

---

## CONTEXTO DE PARTIDA

| Dado | Valor |
|---|---|
| Loja | incluobrasil.com — brinquedos sensoriais |
| Nicho | Sensorial/educacional — públicos: famílias, educadores, crianças alta energia |
| Produtos | 143 SKUs ativos — fidgets, mordedores, kits sensoriais, tapetes, tendas, etc. |
| Ticket médio estimado | R$80–R$200 (mix de produtos) |
| Campanha atual | P.Max ativo (2 dias) — 4 vendas, algumas de ticket alto |
| Facebook | Ativo — dados de audiência já acumulando |
| GMC | Review submetido 2026-05-28 — aguardando aprovação |
| Meta lucro | R$1.000/dia líquido |
| Margem estimada | ~25% sobre receita bruta |
| Receita necessária | R$4.000/dia para R$1.000 de lucro |

---

## MATEMÁTICA DA META

```
Meta: R$1.000/dia de lucro líquido
Margem produto: ~40% sobre receita (custo do produto ~60%)
Custo Google Ads: ~15-20% do revenue (ROAS 5x a 6.7x)
Margem líquida após ads: ~20-25%

Cálculo conservador (margem 25%):
→ Receita necessária: R$1.000 / 0,25 = R$4.000/dia
→ Com ROAS 4x: orçamento ads = R$4.000 / 4 = R$1.000/dia em ads
→ Com ROAS 6x: orçamento ads = R$4.000 / 6 = ~R$667/dia em ads

Ticket médio R$120 → ~33 vendas/dia necessárias
Ticket médio R$150 → ~27 vendas/dia necessárias
```

---

## ESTRUTURA DE CAMPANHAS RECOMENDADA

### Hierarquia

```
Conta Google Ads
├── P.Max #1 — Feed-Only (FASE 1: sem assets criativos)
│   ├── Asset Group: Fidgets & Foco
│   ├── Asset Group: Sensoriais Táteis  
│   └── Asset Group: Kits Completos
├── Standard Shopping — Top SKUs (FASE 2+)
│   └── Produtos com histórico de conversão
└── Search — Alta Intenção (FASE 2+)
    ├── Campanha: Compra direta ("comprar fidget spinner", "brinquedo sensorial preço")
    └── Campanha: Remarketing RLSA
```

---

## FASE 1 — SEMANAS 1-2 (Imediatamente após aprovação GMC)

### P.Max Feed-Only
- **SEM** assets de imagem/vídeo/texto na fase inicial
- O algoritmo aprende 100% pelo feed de produtos (título, descrição, preço, categoria)
- Vantagem: evita leilão de Shopping puro, usa Google Signals para expandir
- Orçamento inicial: **R$200-300/dia** — deixar rodar 7-10 dias sem mexer
- **SEM target ROAS** por 7-10 dias (até ter 30+ conversões no histórico)

### Otimização do feed para P.Max (fazer ANTES de subir)
Títulos otimizados para Shopping são o ativo mais importante:

| Produto | Título atual (exemplo) | Título otimizado P.Max |
|---|---|---|
| Fidget Spinner | Fidget Spinner Sensorial | Fidget Spinner Sensorial Foco Brinquedo Anti Stress Adulto Infantil |
| Kit Mordedor | Kit Mordedor Sensorial | Kit Mordedor Sensorial Bebê Silicone Grau Alimentar 10 Peças |
| Tenda Sensorial | Tenda Sensorial Infantil | Tenda Sensorial Infantil Criança Espaço Calmo Leitura Brincar |

**Regra:** título deve ter 150 caracteres, incluir: produto + material/cor + benefício + público alvo + "brinquedo sensorial"

### Configuração do P.Max Feed-Only
```
Campanha: "INCLUO - PMAX FEED"
Orçamento: R$300/dia
Sem target ROAS (fase de aprendizado)
Sinal de audiência: 
  - Lista de compradores (Shopify customer list)
  - Visitantes do site (remarketing)
  - Custom intent: concorrentes + palavras-chave do nicho
Localizações: Brasil
Idioma: Português
```

---

## FASE 2 — SEMANAS 3-4

### Adicionar assets ao P.Max (após 30+ conversões)

**Asset Groups por tema:**

#### Asset Group 1 — Fidgets & Foco
```
Produtos: fidget spinners, fidget cubes, pop it, sliders magnéticos
Títulos (máx. 15):
- "Fidget Toys para Crianças e Adultos"
- "Brinquedos Sensoriais Fidget — Foco e Calma"
- "Fidget Spinner e Cubos — Envio Rápido"
- [+ 12 variações]

Descrições (máx. 4):
- "Brinquedos sensoriais fidget para ajudar no foco, calma e estimulação tátil. Ideal para crianças com alta energia. Frete grátis acima de R$X."
- [+ 3 variações]

Imagens: produtos em uso + fundo branco limpo
```

#### Asset Group 2 — Sensoriais Táteis
```
Produtos: mordedores, sacos sensoriais, tapetes, slimes, massinha
Títulos: foco em "estimulação tátil", "sensorial", "educacional"
```

#### Asset Group 3 — Kits Completos
```
Produtos: kits 5-10 peças, combos temáticos
Títulos: foco em "kit completo", "presente educativo", "caixa sensorial"
```

### Standard Shopping — Top SKUs
- Pegar os 10-15 produtos com maior conversão do P.Max
- Criar campanha Standard Shopping específica para eles
- Dar lance manual: **ROAS alvo 4x** nos melhores SKUs
- Objetivo: maior controle sobre os produtos que já provaram converter

### Search — Alta Intenção
```
Palavras-chave (exact/phrase match):
[comprar fidget spinner]
[brinquedo sensorial]
[fidget spinner infantil]
[kit brinquedos sensoriais]
[brinquedo para criança agitada]
[fidget toys]
[pop it sensorial]
[brinquedo anti stress]
[tenda sensorial infantil]
[kit fidget]

Negativas obrigatórias:
"autismo" (claim terapêutico)
"TDAH" (claim terapêutico)
"terapia" (claim terapêutico)
"grátis" / "gratuito"
"como fazer" / "DIY"
```

---

## FASE 3 — MÊS 2+ (ESCALA)

### Target ROAS + Scale
- Após 50+ conversões: definir **target ROAS 3x** no P.Max
- Aumentar orçamento 15-20% por semana quando ROAS mantido
- Não aumentar mais de 20%/semana — algoritmo precisa re-aprender

### Customer Match
```
Fontes de dados:
1. Compradores Shopify → exportar CSV → upload Google Ads
2. Emails Facebook Leads → upload como audience signal P.Max
3. Visitantes 30/60/90 dias (Google Audiences)

Uso:
- Audience signal no P.Max → acelera aprendizado
- Remarketing no Search → lances mais altos para quem já comprou/visitou
- Similar audiences → expansão para perfis parecidos com compradores
```

### Display Remarketing
- Pixel Google Ads instalado via Shopify → capturar visitantes
- Audiência: visitou produto mas não comprou (últimos 30 dias)
- Frequência: 3-5 impressões/semana/usuário
- Creative: imagem do produto específico que visitou (dynamic remarketing)

---

## FUNIL GOOGLE + FACEBOOK INTEGRADO

```
TOPO DE FUNIL (Awareness)
├── Facebook: vídeo/carrossel — emoção ("seu filho vai amar")
└── Google Display: interesses relacionados

MEIO DE FUNIL (Consideração)
├── Google P.Max: produto no momento de busca
├── Facebook Retargeting: visitantes que não compraram
└── Google Search: intenção de compra direta

FUNDO DE FUNIL (Conversão)
├── Google Search: exact match "comprar X"
├── Google Shopping: comparação de preço
└── Facebook/Google Remarketing: abandono de carrinho

PÓS-COMPRA (Retenção)
└── Customer Match: ofertas exclusivas, produtos complementares
```

---

## ANÁLISE DE CONCORRENTES

### Players identificados no nicho brinquedos sensoriais PT-BR

| Concorrente tipo | Posicionamento | Fraqueza explorada |
|---|---|---|
| AliExpress/ML vendedores genéricos | Preço baixo, sem marca | Sem garantia, sem experiência, prazo longo |
| Lojas generalistas (Magazine, Americanas) | Grande volume, sem especialização | Sem curadoria, mistura terapêutico/recreativo confuso |
| Lojas terapêuticas (clínicas) | Linguagem clínica, preço alto | Não passa no GMC, afasta compra por pais comuns |
| Importadores diretos | Preço médio, sem suporte | Sem português, sem confiança, sem devoluções claras |

### Posicionamento diferencial Incluo

**O gap do mercado:** nenhum concorrente fala a mesma língua que os pais — todos estão ou em linguagem clínica (excluindo) ou em linguagem genérica (sem conexão).

**Ângulo Incluo: "O brinquedo certo, para a criança que é do seu jeito"**

---

## COPY ANGLES — GOOGLE ADS

### Para Search (textos de anúncio)

**Headline pool (até 15):**
```
Brinquedos Sensoriais para Crianças
Fidget Toys — Foco e Diversão
Kits Sensoriais — Frete Rápido
Brinquedos Educativos Sensoriais
Para Crianças com Muita Energia
Loja Especializada — Brinquedos Sensoriais
Entrega para Todo o Brasil
Qualidade e Segurança Garantidas
Estimulação Tátil e Visual
Presente Educativo para Crianças
Fidget Spinners e Cubos Sensoriais
Explore Nossos Kits Completos
Mais de 100 Brinquedos Sensoriais
Atendimento SAC Personalizado
Satisfação Garantida ou Devolução
```

**Description pool (até 4):**
```
1. Brinquedos sensoriais pensados para crianças com muita energia, curiosidade e vontade de explorar. Frete rápido, atendimento humanizado.

2. Mais de 100 opções de fidgets, mordedores, kits e tapetes sensoriais. Produtos seguros, com curadoria especializada. Compre agora.

3. Seu filho vai adorar explorar texturas, cores e formas. Nossos brinquedos educativos chegam rapidinho. Satisfação garantida.

4. Kits sensoriais completos para casa, escola ou presente. Qualidade comprovada, sem linguagem clínica. Só diversão e aprendizado.
```

### Para P.Max / Display (visuais e copy)

**Hook principal:** "Brinquedos para crianças que vivem no modo turbo"

**Variações de hook:**
- "Fidget toys que realmente funcionam"
- "O kit sensorial que os pais adoram dar de presente"
- "Para crianças que adoram tocar, explorar e se mover"
- "Estimulação sensorial? A gente faz parecer brincadeira"

---

## DIFERENCIAÇÃO GOOGLE vs FACEBOOK

### Google Ads — Captura de demanda existente
- Pessoas já procurando: "fidget spinner", "brinquedo sensorial", "kit sensorial"
- Intenção de compra alta → foco em produto, preço, prazo de entrega
- Copy: direto ao produto, specs claros, CTA "Compre agora"

### Facebook Ads — Criação de demanda
- Pessoas que NÃO estão buscando mas se identificam com o problema
- Público: mães de 25-45, grupos de educação, grupos de parentalidade
- Copy: storytelling, antes/depois emocional, conteúdo educativo + venda suave
- Formato: vídeo curto (Reels) mostrando criança brincando + comentário de mãe

### Sinergia dos dois canais
```
Facebook → gera awareness + interesse
Google → captura quando a pessoa pesquisa depois de ver o anúncio
Remarketing (ambos) → fecha quem ficou no meio do caminho
Customer Match → reativa compradores com novos produtos
```

---

## CALENDÁRIO DE LANÇAMENTO

| Semana | Ação | Meta |
|---|---|---|
| Aprovação GMC (D0) | Subir P.Max feed-only R$200/dia | Aprendizado — não interferir |
| Semana 1 | Otimizar títulos do feed, monitorar CPCs | Primeiras conversões P.Max |
| Semana 2 | Analisar relatório de termos de busca | Identificar top produtos |
| Semana 3 | Adicionar assets ao P.Max, criar Search | 30+ conversões, definir ROAS 3x |
| Semana 4 | Standard Shopping top 10 SKUs | ROAS 3x+ em produtos provados |
| Mês 2 | Escalar 15%/semana, Customer Match | Caminhar para R$1.000/dia |
| Mês 3 | Display Remarketing + Lookalike | Topo de funil escalando |

---

## KPIs SEMANAIS A MONITORAR

| KPI | Meta Fase 1 | Meta Fase 2 | Meta Fase 3 |
|---|---|---|---|
| ROAS | > 2x (aprendizado) | > 3x | > 4x |
| CPA | < R$60 | < R$40 | < R$30 |
| CTR Search | > 5% | > 7% | > 8% |
| Conversão site | > 1,5% | > 2% | > 2,5% |
| Revenue/dia | R$500-800 | R$1.500-2.000 | R$4.000+ |

---

## ALERTAS E REGRAS DE PAUSA

- Se ROAS < 1,5x por 3 dias consecutivos → pausar e revisar feed/landing
- Se CPA > R$100 por semana → revisar segmentação e negativos
- Não aumentar orçamento mais de 20%/semana
- Não mexer em P.Max nos primeiros 7-10 dias (período de aprendizado)
- Não definir target ROAS antes de 30 conversões no histórico

---

## CHECKLIST PRÉ-LANÇAMENTO (ANTES DE SUBIR CAMPANHA)

- [ ] GMC aprovado e conta ativa
- [ ] Pixel Google Ads instalado na Shopify (via app Google & YouTube)
- [ ] Conversões rastreadas: Compra, Iniciar checkout, Add to cart
- [ ] Feed Simprosys sincronizado sem erros
- [ ] Títulos do feed otimizados (150 chars, palavras-chave incluídas)
- [ ] Lista de emails compradores exportada (Customer Match)
- [ ] Negativos gerais configurados: "autismo", "TDAH", "terapia", "grátis", "como fazer"
- [ ] Budget aprovado: mínimo R$200/dia para fase de aprendizado

---

*Gerado em 2026-05-28 | Sessão de planejamento Google Ads + análise de concorrentes*  
*Basear-se neste documento quando GMC for aprovado para configurar campanhas em tempo real*
