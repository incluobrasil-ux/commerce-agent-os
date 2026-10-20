---
tipo: recurso
status: em-andamento
tags: [movecon, materiais, pdf, imagens, nano-banana]
atualizado: 2026-07-28
---

# 🎨 Prompts Nano Banana Pro — Materiais PDF MOVECON

> **Por que a logo saía errada:** modelos de imagem **não conseguem** reproduzir um logotipo
> fielmente — eles sempre reinventam a geometria e a tipografia. A solução aqui é estrutural:
> **as imagens geradas nunca contêm a marca.** O arquivo real da logo é aplicado por cima,
> em vetor, na hora de montar o PDF. Risco de logo errada = zero.

## Como funciona o fluxo

1. Você gera a imagem no Nano Banana Pro com o prompt correspondente.
2. Salva em `assets/img/` com **exatamente** o nome do slot (ex.: `01-capa.png`).
3. Me avisa — eu rodo o script de novo e o PDF sai com as imagens no lugar.

Enquanto o arquivo não existir, o PDF usa um fundo procedural na identidade da marca
(já está assim agora, e está apresentável).

---

## ⚠️ Regras que valem para TODOS os prompts

Cole estas linhas **no fim de todo prompt**, sem exceção:

```
Sem nenhum texto, letra, palavra, número, logotipo, marca d'água ou assinatura na imagem.
Não invente logotipos nem símbolos de empresa. Imagem limpa, apenas cena e luz.
```

**Paleta obrigatória** (repita dentro do prompt):
`azul-marinho profundo #1A3A66` · `azul grafite #0F2444` · `turquesa #2FC4B2` · `petróleo #2C7A8C`

**Nunca peça:** vermelho, dourado, laranja, roxo. A referência ADECON é vermelha — nós somos azul/turquesa.

---

## 01-capa · Capa da apresentação
**Proporção 16:9 · 2048×1152 · destino `assets/img/01-capa.png`**

O terço esquerdo da imagem fica coberto por um escurecimento — é onde entram a logo e o
título. Deixe essa área sem elemento importante.

```
Fotografia arquitetônica de um edifício residencial moderno visto de baixo para cima,
linhas geométricas fortes e repetitivas de sacadas subindo em direção ao céu, sensação de
ascensão e progresso. Fim de tarde, luz suave. Gradação de cor azul-marinho profundo
(#1A3A66) e azul grafite (#0F2444), com reflexos sutis em turquesa (#2FC4B2) nos vidros.
Atmosfera institucional, sólida, corporativa e confiável. O lado esquerdo da imagem deve
ser uma área escura e limpa, sem detalhes; toda a informação visual concentrada do centro
para a direita. Alto contraste, foco nítido, qualidade de fotografia publicitária.
Sem nenhum texto, letra, palavra, número, logotipo, marca d'água ou assinatura na imagem.
Não invente logotipos nem símbolos de empresa. Imagem limpa, apenas cena e luz.
```

---

## 04-alpha · Segurança e regulação
**Proporção 16:9 · 2048×1152 · destino `assets/img/04-alpha.png`**

Página que fala de Banco Central e regulação — precisa transmitir instituição, não venda.

```
Fotografia de interior corporativo sofisticado: átrio de um edifício institucional com
colunas e linhas arquitetônicas simétricas, pé-direito alto, sensação de solidez e
permanência. Iluminação natural fria vinda da direita. Predominância de azul grafite
(#0F2444) e azul-marinho (#1A3A66), com um acento discreto de turquesa (#2FC4B2) na luz.
Ambiente vazio, silencioso, elegante. A metade esquerda deve ser escura e sem detalhe,
área de respiro para texto. Estilo de fotografia institucional de relatório anual.
Sem nenhum texto, letra, palavra, número, logotipo, marca d'água ou assinatura na imagem.
Não invente logotipos nem símbolos de empresa. Imagem limpa, apenas cena e luz.
```

---

## 05-imovel · Segmento imóvel
**Proporção 3:2 · 1536×1024 · destino `assets/img/05-imovel.png`**

```
Fotografia de um casal brasileiro adulto, de costas ou de perfil, olhando pela janela ampla
de um apartamento novo e claro, luz natural suave da manhã. Sensação de conquista tranquila,
sem euforia exagerada. Tratamento de cor frio, puxando para azul-marinho (#1A3A66) nas
sombras. Composição limpa, muito espaço negativo, profundidade de campo rasa.
Fotografia publicitária realista, nada de banco de imagens genérico e sorriso forçado.
Sem nenhum texto, letra, palavra, número, logotipo, marca d'água ou assinatura na imagem.
Não invente logotipos nem símbolos de empresa. Imagem limpa, apenas cena e luz.
```

---

## 05-auto · Segmento automóvel
**Proporção 3:2 · 1536×1024 · destino `assets/img/05-auto.png`**

```
Fotografia de detalhe de um carro sedan moderno em ambiente urbano ao entardecer, ângulo
de três quartos frontal, carroceria em tom escuro com reflexos azulados. Sem nenhuma marca,
emblema ou logotipo visível no veículo — grade e capô limpos. Iluminação lateral dramática,
reflexos em turquesa (#2FC4B2) e azul-marinho (#1A3A66). Fundo desfocado e escuro.
Estilo de fotografia automotiva publicitária, sofisticada e sóbria.
Sem nenhum texto, letra, palavra, número, logotipo, marca d'água ou assinatura na imagem.
Não invente logotipos nem símbolos de empresa. Imagem limpa, apenas cena e luz.
```

> ⚠️ Nesse aqui vale conferir com atenção: modelos adoram inventar emblema na grade do carro.
> Se aparecer, gere de novo ou peça um ângulo mais fechado (só a lateral / farol).

---

## 05-pesados · Segmento pesados
**Proporção 3:2 · 1536×1024 · destino `assets/img/05-pesados.png`**

```
Fotografia de um caminhão de carga moderno em uma rodovia ao amanhecer, vista lateral em
movimento, cabine sem nenhuma marca ou emblema, carroceria lisa em tom escuro. Céu com
gradiente azul-marinho (#1A3A66) e neblina baixa. Sensação de trabalho, produtividade e
força. Tratamento de cor frio e contrastado, estilo fotografia industrial publicitária.
Sem nenhum texto, letra, palavra, número, logotipo, marca d'água ou assinatura na imagem.
Não invente logotipos nem símbolos de empresa. Imagem limpa, apenas cena e luz.
```

---

## 05-servicos · Segmento serviços
**Proporção 3:2 · 1536×1024 · destino `assets/img/05-servicos.png`**

```
Fotografia de painéis solares fotovoltaicos vistos em ângulo diagonal, formando linhas
geométricas repetidas que se afastam no horizonte, sob céu limpo de fim de tarde. Reflexo
azul-marinho (#1A3A66) e turquesa (#2FC4B2) na superfície dos painéis. Composição gráfica,
minimalista, muita geometria e ordem. Estilo fotografia corporativa de energia e infraestrutura.
Sem nenhum texto, letra, palavra, número, logotipo, marca d'água ou assinatura na imagem.
Não invente logotipos nem símbolos de empresa. Imagem limpa, apenas cena e luz.
```

---

## 06-representante · Ser um representante
**Proporção 3:4 (retrato) · 1024×1365 · destino `assets/img/06-representante.png`**

Ocupa a faixa vertical direita do slide. O corte é vertical — pense em enquadramento de retrato.

```
Retrato corporativo vertical de um profissional brasileiro adulto, entre 30 e 45 anos, em
traje social sem gravata, em pé em um escritório moderno com janelas amplas ao fundo
desfocado. Expressão confiante e serena, olhando para a câmera. Iluminação lateral suave.
Tratamento de cor frio com azul-marinho (#1A3A66) dominando o fundo. Enquadramento vertical,
pessoa posicionada no terço inferior, espaço livre acima da cabeça. Roupa lisa, sem estampa,
sem crachá, sem logotipo em nenhuma peça. Fotografia editorial de negócios, realista.
Sem nenhum texto, letra, palavra, número, logotipo, marca d'água ou assinatura na imagem.
Não invente logotipos nem símbolos de empresa. Imagem limpa, apenas cena e luz.
```

---

## 10-encerramento · Página de contato
**Proporção 16:9 · 2048×1152 · destino `assets/img/10-encerramento.png`**

Esta recebe um escurecimento forte por cima — pode ser mais gráfica e abstrata.

```
Composição abstrata 3D de blocos retangulares chanfrados dispostos em degraus ascendentes
da esquerda para a direita, como uma escada modular flutuando no escuro. Material fosco
com leve reflexo. Blocos em azul-marinho (#1A3A66), azul grafite (#0F2444), petróleo
(#2C7A8C) e um único bloco em turquesa (#2FC4B2) no ponto mais alto. Fundo azul grafite
muito escuro, iluminação suave vinda de cima. Sensação de construção gradual e progresso.
Render 3D limpo, minimalista, qualidade de estúdio.
Sem nenhum texto, letra, palavra, número, logotipo, marca d'água ou assinatura na imagem.
Não invente logotipos nem símbolos de empresa. Imagem limpa, apenas cena e luz.
```

---

## Se um dia você quiser o símbolo M em 3D na imagem

Aí sim é o único caso em que a logo entra no gerador. O procedimento:

1. Anexe **`assets/logo/simbolo-principal.png`** (símbolo isolado, fundo transparente).
2. Use este prompt:

```
Use a imagem anexada como referência geométrica EXATA. Reproduza esse símbolo em render 3D,
com volume e chanfro, mantendo com precisão absoluta: o número de módulos, os ângulos, as
proporções e as cores de cada parte. Não redesenhe, não simplifique, não adicione nem
remova elementos, não altere as cores. Material fosco premium, fundo azul grafite escuro
(#0F2444), iluminação de estúdio suave vinda da esquerda, leve reflexo no chão.
Não escreva nenhum texto, letra ou palavra na imagem.
```

3. **Confira módulo a módulo** antes de aprovar: são 3 barras ascendentes sobre o M, nas
   cores turquesa / petróleo / grafite, e o V central simétrico. Se qualquer um estiver
   diferente, descarte e gere de novo — não aceite "parecido".

---

Ligações: [[Identidade & Marca]] · [[Posicionamento & Credibilidade]]
