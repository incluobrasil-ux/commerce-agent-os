# 03 — Gap de imagens e direção de arte

> [!warning] Registro historico - anterior a 20/08/2026
> Este documento descreve o site como ele estava na data acima. Em
> 20/08/2026 o vocabulario mudou: o termo "plataforma" saiu do site
> (a MOVECON passou a se apresentar como "autorizada pela Alpha") e o
> enquadramento de golpe/fraude foi substituido por enquadramento
> positivo. Rotas e frases citadas aqui podem nao existir mais.

> Auditoria de 2026-08-07. Substitui a seção de posicionamento do
> `plano-visual-e-prompts.md` (28/07). **Não substitui** os prompts de geração
> daquele documento, que seguem válidos e já produziram 29 ativos.

## Por que este documento existe

O plano de 28/07 mapeou 60 slots, consolidou em 31 ativos e escreveu os prompts.
Foi bom naquilo. Mas a especificação de **onde cada imagem entra** cabe em uma
linha, perdida numa seção sobre mudanças de código:

> *"`gerar_hubs.py` / `gerar_filhas.py` — slot de imagem no hero, opcional, com
> `width`/`height` fixos."* — §8, linha 414

Uma linha para a decisão mais visível do site inteiro. O resultado previsível:
duas tentativas de implementação em 07/08, ambas rejeitadas. A primeira pôs a
foto como faixa de largura total depois do hero; a segunda, dentro do hero, na
segunda coluna. Nenhuma das duas foi aprovada.

**O diagnóstico não é de execução, é de ordem.** Começamos pelo ativo de
justificativa mais fraca (foto de objeto) na posição mais nobre da página
(hero). Este documento inverte isso.

---

## 1. Estado medido hoje

| | |
|---|---|
| Ativos gerados e no servidor | **29 imagens + 7 diagramas SVG** |
| `og:image` | ✅ **no ar nas 118 rotas**, 4 moldes por camada |
| `<img>` no **corpo** das páginas | **0 em 115 de 115** |
| Ativos aguardando fiação | **17 imagens + 7 SVG** |

Tudo está servindo em `/wp-content/movecon/img/` e `/wp-content/movecon/svg/`.
Nenhum código aponta para eles. Não falta arquivo: falta decisão de onde entram.

---

## 2. O critério que faltava: o teste do ornamento, aplicado antes

O próprio plano de 28/07 define a régua e não a aplicou na hora de posicionar:

> *"Apague a legenda. Se a imagem continua 'funcionando', ela era decoração
> vestida de prova. Mate a peça."*

Aplicando a régua aos quatro tipos de ativo:

| Ativo | O que ele informa | Passa no teste? |
|---|---|---|
| **7 diagramas SVG** | o mecanismo do consórcio — ciclo, lance, anatomia da parcela | **Sim, com folga.** É a única informação do site que texto não transmite bem |
| **Bloco de fronteira** | que MOVECON e Alpha são entidades separadas e ligadas | **Sim.** Resolve a dúvida nº 1 do visitante |
| **6 objetos dark (LP)** | nada sobre o produto — mas dá continuidade visual com o anúncio pago | **Parcial.** Justificativa é de conversão, não de informação |
| **9 fotos-objeto de hub** | nada que o H1 já não diga | **Não.** Um pneu numa página sobre consórcio de veículo é reconhecimento, não informação |

**Consequência direta:** a ordem de execução do plano (§9) põe as fotos de hub
no Lote 4 e os diagramas no Lote 3. Pela régua do próprio plano, **os diagramas
deveriam vir muito antes** — e as fotos de hub são as únicas do conjunto que o
site pode dispensar sem perder nada.

Foi por isso que as duas tentativas pareceram sem nexo: puseram no lugar mais
nobre a peça que menos justifica estar lá.

---

## 3. Alocação recomendada — por página, com posição exata

### 3.1 Diagramas SVG — prioridade máxima

Sete arquivos, 17 KB somados, já escritos e no servidor.

| Diagrama | Página de destino | Posição exata |
|---|---|---|
| `svg-caminho-do-pagamento` | `/seguranca/` e `/guia/golpe-consorcio-como-identificar/` | logo após o primeiro `<h2>`, dentro de `.sec`, largura máx. 720px centralizada |
| `svg-fronteira-rotulos` | `/administrado-pela-alpha/` | sobreposto ao ativo `fronteira-movecon-alpha.webp` — ver 3.2 |
| `svg-sorteio-e-lance` | `/guia/como-funciona-o-consorcio/` | na seção que já explica assembleia, **substituindo** o parágrafo descritivo |
| `svg-anatomia-da-parcela` | `/guia/quanto-custa-um-consorcio/` e hubs | idem, na seção de custos |
| `svg-ciclo-do-grupo` | `/guia/como-funciona-o-consorcio/` | abertura da página, antes do primeiro `<h2>` |
| `svg-arvore-de-decisao` | `/consorcio-contemplado/` e `/simulador/` | antes do CTA final |
| `svg-lance-abate-saldo` | `/guia/quanto-dar-de-lance-no-consorcio/` | após o parágrafo que hoje explica em texto |

**Estrutura HTML:**

```html
<figure class="mv-diag">
  <!-- SVG inline, nao <img src>: precisa herdar currentColor -->
  <svg …>…</svg>
  <figcaption>Uma frase que o diagrama nao diz.</figcaption>
</figure>
```

**Regra que não pode ser quebrada:** o SVG entra **inline no HTML**, nunca como
`<img src="....svg">`. Via `<img>` ele perde `currentColor` (não adapta a tema),
perde o texto no DOM (não indexa, não lê em leitor de tela) e perde o `<title>`
para acessibilidade — que é justamente o que o torna superior a uma imagem.

**CSS:** `max-width: 720px; margin-inline: auto;` — os SVGs têm `viewBox`
`0 0 720 300` e `width="100%"`, então escalam sozinhos. **Zero trabalho de mobile.**

---

### 3.2 Bloco de fronteira MOVECON / Alpha

Um ativo, `fronteira-movecon-alpha.webp`, 1600×900, 126 KB.

| Página | Posição |
|---|---|
| `/administrado-pela-alpha/` | **acima da dobra**, logo abaixo do H1 — é a tese da página |
| `/seguranca/` | após a seção "quem faz o quê" |
| `/quem-somos/` | após o primeiro bloco institucional |
| `/` (home) | **não usar** — ver abaixo |

**Por que não na home.** O hero da home já resolve isso com a lista de fatos na
segunda coluna do `.hero-grid`. O plano de 28/07 defende essa lista como o
diferencial do site: *"onde o concorrente põe família sorrindo com a chave, traz
uma lista de fatos"*. Trocar prova por foto na única dobra que todo visitante vê
é o pior negócio possível.

**Estrutura:** `<figure>` com a imagem e o `svg-fronteira-rotulos` sobreposto por
CSS (`position:absolute` sobre um wrapper `position:relative`). Os rótulos ficam
em SVG, não queimados no pixel — regra dura nº 2 do plano.

**Largura:** máx. 900px, centralizada. Não largura total: 16:9 em 1200px vira
faixa panorâmica e domina a página.

---

### 3.3 Objetos dark nas LPs — 6 ativos

`lp-<modalidade>-objeto-dark.webp`, 1800×1200, sobre `#0a1a30`.

As LPs são as **5 primeiras do ranking crítico** do relatório 02 (nota 4,3 a 4,6).
São `noindex`, existem só para tráfego pago, e é onde continuidade visual com o
criativo do anúncio tem valor mensurável.

**Posição:** hero da LP, em `.hero-grid`, segunda coluna. **Aqui o hero é o lugar
certo** — ao contrário do hub, porque:

1. A LP não tem parágrafo *answer-first* a proteger; o hub tem
2. O visitante chega de um anúncio e precisa reconhecer que chegou no lugar certo
3. O fundo já é `#0a1a30`, e o objeto foi gerado para esse fundo

**Mobile:** empilha abaixo do texto, `max-width: 420px`. `loading="lazy"` — o
texto da LP tem que pintar primeiro.

---

### 3.4 Fotos-objeto de hub — 9 ativos, e a recomendação é adiar

Os arquivos existem, estão corretos (1800×1200, todos abaixo de 180 KB) e não
custam nada parados. Mas:

- Não passam no teste do ornamento
- Duas tentativas de posicionamento já foram rejeitadas
- Os hubs já têm o objeto como `og:image` (molde de silo), que é onde a foto de
  objeto tem função real: **preview de compartilhamento**, onde não há texto

**Recomendação: não usar no corpo dos hubs por enquanto.** Se depois dos
diagramas e da fronteira o site parecer seco demais, a posição menos ruim é uma
faixa `.sec--alt` **entre o último bloco de conteúdo e a FAQ** — nunca no hero,
nunca acima da dobra, com largura máxima de 720px.

**Se você quiser usar assim mesmo**, a implementação está pronta e testada; é
mudar uma constante no `gerar_hubs.py`.

---

### 3.5 Onde não vai imagem, de propósito

| Página | Por quê |
|---|---|
| `/avaliacoes/` | fala de reputação numa empresa sem histórico; imagem empurra para prova social inexistente |
| As 36 filhas | vira papel de parede e infla o site sem ganho |
| Os 21 guias | diagrama apenas — foto de modalidade num guia genérico causa erro de escopo |

---

## 4. Ativos ainda não gerados

Dos 31 do plano, 24 estão prontos. Faltam **7**, e a distinção importa:

### 4.1 Não geráveis — dependem de você

| Ativo | Por que ninguém gera | O que fazer |
|---|---|---|
| **Screenshot da consulta ao Bacen** | é prova verificável; gerada, vira falsificação de página de órgão regulador | capturar a tela real, anotar por cima em SVG |
| **Foto do Samuel** (fecha a P3b) | rosto de pessoa real; gerar é fabricar likeness | foto real, mín. 400×400, fundo neutro |
| **Fachada da sede** | prova de existência física | foto real, ou **remover o slot do plano** |
| **Screencast do Bacen** | idem screenshot, em movimento | gravar a tela real |
| **Depoimentos em vídeo** | não há clientes ainda | nada a fazer hoje |

Estes cinco são o gargalo real do relatório 02: **prova social é 0 de 115** e
nenhum deles se resolve com geração de imagem.

### 4.2 Geráveis — prompt pronto

**`textura-ciclorama-mobile.webp`** — 1200×675, recorte vertical-friendly da
textura existente, para fundos em telas estreitas.

```
Photograph of an empty studio cyclorama in off-white #f7f8f9, no objects,
with the soft curve between wall and floor visible in the lower third of the
frame. Wide, even lighting with a subtle natural gradient: slightly brighter
in the upper centre, discreetly darker in the lower corners. Very subtle
surface texture, almost imperceptible. No hard shadows, no objects, no marks.
Clean space ready to receive elements. Aspect ratio 16:9. High resolution.
No words, letters, numbers, logos, watermarks or seals. No people, no hands.
Real photography, not a 3D render.
```

**`og-molde-lp.webp`** — 1200×630, molde de compartilhamento para as 15 LPs,
que hoje herdam o molde institucional.

```
Studio photograph of a matte metal set square resting on an infinite very dark
blue background #0a1a30, positioned in the right third of the frame. Single
key light from the right at 45 degrees describing the volume, plus a discreet
cool rim light from the left separating the contour from the dark background.
No frontal fill light: shadows stay deep and clean. The left third of the
frame remains in near-total darkness, reserved for light text. 85mm lens.
Natural object colour, no duotone. High contrast, dense blacks retaining
detail. Aspect ratio 1.91:1. High resolution. No words, letters, numbers,
logos, watermarks or seals. No people, no hands. Real photography, not a 3D
render.
```

---

## 5. Alt text — texto pronto, compliance-safe

Regra aplicada: descrever **o que se vê**, nunca o que se promete. Nenhum alt
menciona contemplação, prazo ou retorno.

| Arquivo | Alt em PT-BR |
|---|---|
| `hub-imoveis-objeto` | Molho de chaves de porta residencial e trena metálica fechada sobre fundo de estúdio offwhite |
| `hub-veiculos-objeto` | Pneu de carro de passeio apoiado em pé sobre fundo de estúdio offwhite |
| `hub-moto-objeto` | Capacete de motociclista fechado apoiado de lado sobre fundo de estúdio offwhite |
| `hub-caminhao-objeto` | Retrovisor de caminhão desmontado apoiado sobre fundo de estúdio offwhite |
| `hub-maquinas-agricolas-objeto` | Disco de arado com barro seco apoiado em pé sobre fundo de estúdio offwhite |
| `hub-servicos-objeto` | Placa fotovoltaica pequena apoiada em ângulo sobre fundo de estúdio offwhite |
| `hub-empresa-objeto` | Caixa de ferramentas metálica fechada sobre fundo de estúdio offwhite |
| `hub-embarcacoes-objeto` | Cornamusa de aço inox e cabo náutico enrolado sobre fundo de estúdio offwhite |
| `hub-contemplado-objeto` | Carimbo de protocolo e envelope pardo fechado sobre fundo de estúdio offwhite |
| `fronteira-movecon-alpha` | Duas folhas de papel lado a lado sobre concreto claro, ligadas por um fio azul esticado atravessando a fresta entre elas |
| `lp-*-objeto-dark` | *(mesmo texto do hub correspondente, trocando "offwhite" por "fundo azul escuro")* |
| `textura-ciclorama` | *(decorativa — `alt=""`)* |

Os 7 SVG **não levam `alt`**: levam `<title>` e `<desc>`, que já estão escritos
dentro de cada arquivo.

---

## 6. Especificação técnica

| Item | Regra |
|---|---|
| Formato | WebP (os 29 ativos já estão assim). AVIF fica para quando houver ganho medido |
| `width`/`height` | **obrigatórios em todo `<img>`** — sem eles há CLS |
| `loading` | `eager` só no ativo acima da dobra da LP; `lazy` em todo o resto |
| Largura máxima exibida | diagrama 720px · fronteira 900px · objeto de hub 720px · LP 2ª coluna do grid |
| CSS | **no Customizer**, nunca `<style>` por página |
| `srcset` | pendente — o ativo de 172 KB exibido a 460px é desperdício. Ver Onda 3 |
| Terceiros | zero. Nada de CDN, nada de embed |

---

## 7. Ordem recomendada — e por que ela difere do plano de 28/07

| Ordem | Lote | Justificativa |
|---:|---|---|
| 1 | **7 diagramas SVG** | passam no teste do ornamento com folga, pesam 17 KB, explicam o produto. Zero risco visual |
| 2 | **Bloco de fronteira** em 3 páginas | resolve a confusão MOVECON/Alpha, que é a objeção nº 1 |
| 3 | **6 objetos dark nas LPs** | as 5 páginas mais críticas do relatório 02 |
| 4 | *(opcional)* fotos de hub | só se, depois de 1 a 3, o site parecer seco |

O plano de 28/07 punha as fotos de hub em 4º e os diagramas em 3º, mas com a
engorda de og:image na frente. Na prática o og:image foi entregue em 06/08 e o
que sobrou foi começar pelo item mais decorativo. **Esta ordem corrige isso.**
