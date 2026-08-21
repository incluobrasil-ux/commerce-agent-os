# 02 - Auditoria de credibilidade página a página

> [!warning] Registro historico - anterior a 20/08/2026
> Este documento descreve o site como ele estava na data acima. Em
> 20/08/2026 o vocabulario mudou: o termo "plataforma" saiu do site
> (a MOVECON passou a se apresentar como "autorizada pela Alpha") e o
> enquadramento de golpe/fraude foi substituido por enquadramento
> positivo. Rotas e frases citadas aqui podem nao existir mais.


> Auditoria de 2026-08-07 sobre as **115 rotas no ar**. Cada sinal foi medido no HTML
> servido, separando o **corpo da página** do **rodapé global** — sem essa separação
> todo sinal do rodapé se repetiria em 115 páginas e inflaria a nota de todas.

## Regras aplicadas

Por sua decisão, valem as **decisões registradas do projeto**, não as do briefing.
As divergências estão registradas em `04-componentes-globais.md`.

## Como a nota foi montada

| Critério | Como pontua |
|---|---|
| Atribuição à Alpha | 5 pela frase completa no rodapé global + até 5 pela repetição no corpo |
| Prova social | 0 a 2 — **teto baixo de propósito**: não existe depoimento real no site |
| Sinais institucionais | 6 por CNPJ + endereço globais, +2 WhatsApp, +2 telefone |
| Selos e segurança | 5 fixo — SSL válido, mas as 2 páginas legais não existem |
| Transparência do produto | 4 taxa de administração + 3 FAQ + 3 atribuição no corpo |
| Consistência visual | 9 fixo — design system único aplicado em 100% das rotas |
| Hierarquia de CTA | 1 CTA = 10 · 2 = 8 · 3+ = 5 · nenhum = 3 |

A nota final é a média simples dos sete. Dois critérios têm valor fixo porque a
medição mostrou que **não variam entre páginas** — inventar variação ali seria ruído.

## O que a medição encontrou no site inteiro

| Sinal | Páginas (de 115) | Leitura |
|---|---:|---|
| Atribuição Alpha completa **no corpo** | 33 | o resto se apoia só no rodapé |
| Menção à Alpha (qualquer forma) | 108 | cobertura boa |
| Banco Central | 102 | sempre junto da Alpha — respeita a decisão de 25/07 |
| CNPJ da Alpha | 97 | |
| Taxa de administração explicada | 81 | **34 páginas sem** |
| FAQ na página | 76 | |
| Depoimento / prova social | **10** | o buraco mais grave |
| WhatsApp | **4** | canal de conversão quase ausente |
| Telefone | **0** | **zero em 115** |
| Imagem no corpo | **0** | zero — ver `03-gap-imagens.md` |

### Rodapé global — medido uma vez, idêntico em todas

| Elemento | Estado |
|---|---|
| Atribuição Alpha completa | OK |
| Banco Central + Cert. BCB | OK |
| CNPJ da Alpha e da MOVECON | OK |
| Endereço | OK |
| Link para `/administrado-pela-alpha/` | OK |
| **Telefone** | AUSENTE |
| **WhatsApp** | AUSENTE |
| **Política de Privacidade** | AUSENTE — a página não existe |
| **Termos de Uso** | AUSENTE — a página não existe |

> As duas legais ausentes **não são descuido**: as páginas estão escritas e retidas
> aguardando revisão jurídica (pendência P5). Linkar URL inexistente seria pior.
> Mas o site opera hoje com formulário de contato **sem política de privacidade
> publicada**, e isso é exposição de LGPD ativa, não risco teórico.

## Nota média por camada

| Camada | Páginas | Nota média |
|---|---:|---:|
| `lp` | 15 | **5.2** |
| `artigo` | 17 | **5.4** |
| `conversao` | 6 | **5.7** |
| `guia` | 21 | **5.7** |
| `filha` | 36 | **5.7** |
| `hub` | 9 | **5.8** |
| `institucional` | 2 | **5.8** |
| `confianca` | 6 | **5.8** |
| `glossario` | 3 | **6.1** |

Média geral do site: **5.6/10**.

## Ranking — as 10 páginas mais críticas

Critério: *peso comercial da rota × distância da nota até 10*. Não é a lista das
piores notas — é onde a nota ruim custa mais caro.

| # | Rota | Camada | Nota | Peso | O que puxa a nota para baixo |
|---:|---|---|---:|---:|---|
| 1 | `/lp/caminhao/` | lp | 4.3 | 11 | sem prova social; sem canal direto; não explica a taxa |
| 2 | `/lp/agro/` | lp | 4.3 | 11 | sem prova social; sem canal direto; não explica a taxa |
| 3 | `/lp/servicos/` | lp | 4.3 | 11 | sem prova social; sem canal direto; não explica a taxa |
| 4 | `/lp/moto/` | lp | 4.6 | 11 | sem prova social; não explica a taxa; atribuição só no rodapé |
| 5 | `/lp/empresa/` | lp | 4.6 | 11 | sem prova social; não explica a taxa; atribuição só no rodapé |
| 6 | `/lp/veiculos/` | lp | 4.9 | 11 | sem prova social; sem canal direto; atribuição só no rodapé |
| 7 | `/lp/imoveis/` | lp | 4.9 | 11 | sem prova social; sem canal direto; atribuição só no rodapé |
| 8 | `/simulador/` | conversao | 5.6 | 12 | sem prova social; sem canal direto; atribuição só no rodapé |
| 9 | `/simulador/veiculos/` | conversao | 5.7 | 12 | sem prova social; sem canal direto; atribuição só no rodapé |
| 10 | `/simulador/imoveis/` | conversao | 5.7 | 12 | sem prova social; sem canal direto; atribuição só no rodapé |

## Os três problemas que se repetem em quase tudo

**1. Prova social zero.** 10 de 115 rotas têm qualquer coisa parecida com
depoimento. Num setor onde golpe é a objeção número 1, é a lacuna mais cara — e é a
única que **nenhuma edição de código resolve**: depende de cliente real.

**2. Nenhum canal direto na página.** Telefone: 0 de 115. WhatsApp: 4 de 115.
O visitante convencido no meio de um hub não tem o que fazer sem voltar ao menu.

**3. Taxa de administração ausente em 34 páginas.** É o único custo real
do produto. Página comercial que não o menciona empurra a objeção para depois do clique.

## Um achado fora do escopo do briefing

O CSS do Customizer é servido com **101 blocos de comentário de desenvolvimento** em
todas as páginas, incluindo decisões internas do projeto. Exemplo real, visível hoje
no código-fonte de qualquer página:

> *"NÃO usar no header nem como faixa recorrente entre seções — a menção ao Bacen
> aparece só onde a Alpha é citada."*

Não é falha de segurança e não vaza credencial. Mas é discussão interna publicada,
e some com uma minificação na hora de gravar o Customizer.
