# Plano visual do site MOVECON — mapa de ativos e prompts Nano Banana Pro

> Produzido em 2026-07-28. Base: auditoria visual medida no site no ar (115 rotas)
> + mapeamento multiagente de slots + júri de direção de arte.

---

## 1. Resumo executivo

**Estado medido hoje**, não estimado:

| | |
|---|---|
| `<img>` no corpo | **0 em 115 de 115 rotas** |
| vídeo | **0** |
| biblioteca de mídia no WordPress | **2 ativos** (logo e símbolo) |
| `og:image` | **ausente nas 115** |
| `twitter:card` | declarado `summary_large_image` **sem imagem** — contrato quebrado |
| SVG inline já existentes | 53 (chevrons, ícones) |
| recursos de terceiro | 0 — fontes auto-hospedadas |

O site é 100% texto e CSS. **Isso não é falha: é a razão de ele parecer honesto.**
No hero da home, a segunda coluna do `.hero-grid` — onde o concorrente põe família
sorrindo com a chave — traz uma lista de fatos: MOVECON, Alpha, Lei 11.795/2008.

O plano abaixo adiciona imagem **sem desfazer isso**.

**60 slots** foram mapeados e consolidados em **31 ativos**. Desses:

- **19 se geram no Nano Banana Pro**
- **7 são SVG** — devem ser código, não imagem gerada (§5)
- **5 não se geram de jeito nenhum** — captura real ou foto de pessoa real (§6)

---

## 2. Direção visual: **Vistoria & Esquema**

Escolhida entre três direções concorrentes por um júri que avaliou cada uma
contra o material real do site.

> **Tese.** O bem existe e o mecanismo tem regra. Mostre os dois — nunca a
> promessa, nunca o cliente.

O objeto sobre ciclorama **não afirma nada sobre a MOVECON**: um caminhão é um
caminhão. Nenhum cliente encenado, nenhuma operação alegada, nenhuma
contemplação sugerida.

### Por que as outras duas caíram

**Fotografia documental** foi a mais bem escrita e caiu pelo próprio argumento:
foto documental vale pelo índice — afirma *"isto aconteceu"*. Gerada por modelo,
afirma isso **falsamente**, num site que linka Planalto e Bacen para sustentar
cada frase. Resolver com "imagem ilustrativa" no rodapé é consertar no
disclaimer o que está na estrutura — a mesma manobra que o projeto já recusou ao
não reaproveitar avaliações de outra empresa.

**Prancha técnica pura** não mostra o bem, e 9 hubs, 6 simuladores e 15 LPs de
tráfego pago precisam do objeto. 36 filhas com a mesma prancha viram papel de
parede.

### As três regras duras

1. **Zero pessoa nas 115 rotas.** A MOVECON é empresa nova e não tem carteira.
   Qualquer pessoa em quadro é lida como cliente — depoimento fabricado.
2. **Zero número dentro de pixel.** Número fica no HTML: grepável, corrigível,
   legível por leitor de tela, e não apodrece dentro de um `.webp`.
3. **Nenhum logo MOVECON em fachada, balcão ou cartão.** Sugere estrutura física
   que não foi verificada.

### Paleta, amarrada aos tokens reais

| Token | Hex | Uso na imagem |
|---|---|---|
| Offwhite | `#f7f8f9` | ciclorama, fundo padrão |
| Azul MOVECON | `#1a3a66` | linha de anotação, estrutura |
| Turquesa | `#2fc4b2` | **só** o elemento que a figura quer que você olhe |
| Petróleo | `#2c7a8c` | camada secundária |
| Grafite | `#0f2444` | texto e contorno |
| Azul 900 | `#0a1a30` | fundo dark de LP e simulador |

**Cor encontrada, não aplicada:** azul e turquesa entram como objeto do mundo
(um contêiner azul, uma lona turquesa) ou como camada de anotação por cima.
Duotone e tint são proibidos — são o tell visual de banco genérico.

**Desgaste obrigatório:** o bem aparece **em uso**, nunca zero-quilômetro sendo
entregue. Caminhão com poeira de estrada, trator com barro seco, moto com marca
de uso. Isso mata dois clichês de uma vez: o render publicitário e a promessa de
ascensão social.

### Teste do ornamento

> Apague a legenda. Se a imagem continua "funcionando", ela era decoração
> vestida de prova. Mate a peça.

---

## 3. Alocação por camada

| Camada | Rotas | Tratamento |
|---|---|---|
| home | 1 | diagrama do mecanismo + bloco de fronteira |
| hub | 9 | 1 foto-objeto 3:2 sobre offwhite; o objeto define a modalidade |
| filha | 36 | **nenhuma imagem nova** — recorte do objeto do hub só se houver sub-bem distinto |
| guia | 21 | **diagrama apenas** — zero foto elimina erro de modalidade na origem |
| artigo | 17 | diagrama e tabela reaproveitados |
| confiança | 6 | fronteira em `/administrado-pela-alpha/` e `/seguranca/`; **`/avaliacoes/` com zero imagem** |
| conversão + LP | 21 | objeto sobre `#0a1a30` + árvore de decisão |
| referência | 3 | prancha das 60 cotas |
| og:image | 94 | 4 moldes reaproveitados |

**`/avaliacoes/` fica sem imagem de propósito.** É a página que fala de reputação
numa empresa sem histórico. Qualquer ativo ali empurra para prova social que não
existe.

---

## 4. Ativos geráveis no Nano Banana Pro

### Como usar estes prompts

Nano Banana Pro aceita instrução longa. Cole o bloco inteiro. Onde houver
`[MODALIDADE]`, troque pelo termo da tabela. **Não peça texto na imagem** — o
texto entra depois em HTML.

Sufixo comum a todos (cole ao fim de qualquer prompt desta seção):

```
Sem nenhuma palavra, letra, número, logotipo, marca d'água ou selo na imagem.
Sem pessoas, sem mãos, sem partes do corpo. Sem confete, laço, fita, chave
sendo entregue, cronômetro ou calendário. Sem gradiente roxo-azul, sem
hexágonos flutuantes, sem estética "futurista" ou "corporativa genérica".
Fotografia real, não render 3D. Proporção [X:Y]. Alta resolução.
```

---

### A. og:image — o buraco mais grave do site

Hoje **94 rotas indexáveis compartilham sem imagem**, e o `twitter:card` promete
imagem grande. Num setor onde a confiança é a objeção nº 1, link sem preview
parece link suspeito.

São **4 moldes**, não 94 imagens. Texto e rota entram por cima em HTML/SVG.

#### A1 · `og-molde-institucional.webp` — 1200×630

Usado em: `/`, 6 rotas de confiança, `/contato/`.

```
Fotografia macro de uma superfície de papel offwhite levemente texturado, cor
#f7f8f9, ocupando todo o quadro, iluminada por luz lateral suave vinda da
esquerda a 30 graus, criando um relevo muito sutil na textura da fibra.
Sobre a superfície, no terço direito, repousa uma única régua de metal escovado
em ângulo diagonal suave, com brilho fosco, cor aço neutro. A régua está
parcialmente fora do quadro à direita. Sombra longa e macia projetada à direita.
O terço esquerdo permanece completamente vazio e limpo, sem nenhum objeto, para
receber texto depois. Profundidade de campo rasa, foco na régua. Estética de
mesa de trabalho técnica, não de escritório corporativo. Paleta rigorosamente
neutra: apenas offwhite #f7f8f9, cinzas do metal e sombra cinza-azulada fria.
Proporção 1,91:1.
```

#### A2 · `og-molde-silo.webp` — 1200×630 · **9 variações**

Usado em: os 9 hubs e, por herança, as 36 filhas.

```
Fotografia de estúdio de [OBJETO] posicionado no terço direito de um ciclorama
infinito offwhite #f7f8f9, sem horizonte visível. O objeto mostra uso real:
[DESGASTE]. Iluminação de estúdio ampla e difusa vinda de cima e da frente,
com uma segunda fonte fria e discreta pela esquerda para separar o objeto do
fundo. Sombra de contato suave sob o objeto, sem sombra dramática. O terço
esquerdo do quadro fica inteiramente vazio, no offwhite liso, reservado para
texto. Lente 50mm, perspectiva neutra à altura do objeto, sem distorção de
grande angular. Cor natural do objeto preservada, sem duotone e sem tratamento
de cor. Contraste médio, saturação levemente contida. Proporção 1,91:1.
```

| Hub | `[OBJETO]` | `[DESGASTE]` |
|---|---|---|
| imóveis | um molho de chaves comum de porta residencial e uma trena metálica fechada | risco de uso nas chaves, trena com poeira fina |
| veículos | um pneu de carro de passeio apoiado em pé | sulcos com desgaste médio, poeira de asfalto na banda |
| moto | um capacete de motociclista fechado, apoiado de lado | riscos leves na viseira, marca de uso na aba |
| caminhão | um retrovisor de caminhão desmontado, apoiado | poeira de estrada seca, borracha ressecada na base |
| máquinas agrícolas | um disco de arado apoiado em pé | barro seco na face, brilho de atrito no fio |
| serviços | uma placa fotovoltaica pequena apoiada em ângulo | poeira fina uniforme, moldura com marca de fixação |
| empresa | uma caixa de ferramentas metálica fechada | tinta gasta nos cantos, arranhões no punho |
| embarcações | uma cornamusa de aço inox e um cabo náutico enrolado | oxidação leve, cabo com fibras abertas pelo uso |
| contemplado | um carimbo de protocolo de papel e um envelope pardo fechado | **sem desgaste; objeto limpo, formal, burocrático** |

**Por que o contemplado foge do padrão:** é a página que explica a
formalização da transferência. Objeto de processo formal — protocolo, envelope —
reforça "isto se resolve por documento", que é exatamente a tese do texto.

#### A3 · `og-molde-guia.webp` — 1200×630

Usado em: os 21 guias e as 3 rotas de referência.

```
Fotografia cenital de uma prancheta de metal escovado sobre superfície offwhite
#f7f8f9, vista de cima em ângulo reto perfeito. Sobre a prancheta, folhas de
papel em branco absoluto, sem nenhuma escrita, levemente desalinhadas entre si,
presas pelo clipe superior. Ao lado da prancheta, um lápis de grafite comum com
a ponta gasta, posicionado na diagonal. Luz difusa e uniforme de cima,
reproduzindo luz de janela em dia nublado, sombras muito suaves e curtas.
Metade esquerda do quadro deixada vazia, apenas a superfície offwhite, para
receber texto. Estética de documento de trabalho, austera, sem nenhum elemento
decorativo. Paleta: offwhite, branco do papel, cinza do metal, grafite escuro.
Proporção 1,91:1.
```

#### A4 · `og-molde-artigo.webp` — 1200×630

Usado em: os 17 artigos do blog.

```
Fotografia macro em ângulo rasante de uma pilha baixa de três folhas de papel
offwhite #f7f8f9 empilhadas de forma imperfeita sobre uma mesa de madeira clara
de fibra fina. As bordas do papel captam luz lateral quente e suave vinda da
direita, criando uma linha de luz nas quebras. As folhas estão em branco, sem
nenhuma escrita. Profundidade de campo muito rasa: a borda frontal em foco, o
fundo dissolvido. Área superior esquerda deixada limpa para texto. Estética
editorial silenciosa, de mesa de leitura, não de escritório. Paleta quente-neutra
contida: offwhite, madeira clara dessaturada, sombra cinza-azulada.
Proporção 1,91:1.
```

---

### B. Foto-objeto dos hubs — 3:2, no corpo da página

Mesma família de A2, em enquadramento maior e proporção diferente.

#### B1 · `hub-[modalidade]-objeto.webp` — 1800×1200 · **9 variações**

```
Fotografia de estúdio de [OBJETO DA TABELA A2] sobre ciclorama infinito offwhite
#f7f8f9. Objeto centralizado, ocupando cerca de 60% da altura do quadro, com ar
generoso em volta. Mostra uso real: [DESGASTE DA TABELA A2]. Iluminação de
estúdio suave e envolvente, key light ampla frontal-superior, fill frio pela
esquerda, sem reflexo especular duro. Sombra de contato curta e macia.
Lente 85mm, distância média, perspectiva à altura do objeto. Cor natural
preservada, sem tratamento, sem duotone. Contraste médio-baixo, saturação
contida, aparência de catálogo técnico honesto e não de publicidade.
Proporção 3:2.
```

#### B2 · `lp-[modalidade]-objeto-dark.webp` — 1800×1200 · **6 variações**

Para as LPs de tráfego pago e os simuladores, que usam fundo `#0a1a30`.

Modalidades: veículos, moto, imóveis, caminhão, agro, serviços.

```
Fotografia de estúdio de [OBJETO] sobre fundo infinito azul muito escuro
#0a1a30, sem horizonte. O objeto mostra uso real: [DESGASTE]. Iluminação
dramática porém controlada: uma única key light lateral pela direita a 45 graus
desenhando o volume, e um rim light frio e discreto pela esquerda separando o
contorno do fundo escuro. Nenhuma luz de preenchimento frontal — as sombras
permanecem profundas e limpas. O terço esquerdo fica em escuridão quase total,
reservado para texto claro. Lente 85mm. Cor natural do objeto, sem duotone;
apenas a temperatura fria do rim light. Alto contraste, pretos densos sem
esmagar detalhe. Proporção 3:2.
```

---

### C. Bloco de fronteira — o ativo mais importante do site

Resolve o problema de compreensão nº 1: **quem comercializa e quem administra**.

#### C1 · `fronteira-movecon-alpha.webp` — 1600×900

Usado em: home, `/administrado-pela-alpha/`, `/seguranca/`, `/quem-somos/`.

> ⚠️ Este ativo recebe rótulos em SVG por cima. A imagem gerada é **só o
> substrato**. Não peça texto ao modelo.

```
Fotografia cenital, ângulo reto perfeito, de duas folhas de papel offwhite
#f7f8f9 apoiadas lado a lado sobre uma superfície de concreto claro polido,
separadas por uma fresta estreita e nítida de cerca de dois centímetros entre
elas. As duas folhas são idênticas em tamanho e estão perfeitamente alinhadas.
Ambas estão completamente em branco, sem nenhuma escrita. Atravessando a fresta,
um único fio de algodão azul #1a3a66 esticado e reto liga uma folha à outra,
preso por um pequeno alfinete em cada folha. Luz difusa e uniforme de cima, dia
nublado, sombras curtas e suaves. Enquadramento simétrico e frontal, as duas
folhas com o mesmo peso visual. Estética de mesa de arquivo. Paleta: offwhite,
cinza do concreto, e o azul do fio como único acento.
Proporção 16:9.
```

**Por que funciona:** duas entidades separadas, com peso igual, ligadas por um
vínculo visível e fino. Nem hierarquia, nem fusão. É a relação exata — e
nenhuma palavra é necessária para o leitor sentir a separação.

---

### D. Textura de apoio — uso restrito

#### D1 · `textura-ciclorama.webp` — 2400×1350

Fundo reaproveitável para compor cartões de og:image em SVG sem gerar imagem nova.

```
Fotografia de um ciclorama de estúdio vazio em offwhite #f7f8f9, sem nenhum
objeto, com a curva suave entre parede e piso visível na metade inferior do
quadro. Iluminação ampla e uniforme com um leve gradiente natural: um pouco mais
clara no centro-superior, discretamente mais fechada nos cantos inferiores.
Textura de superfície muito sutil, quase imperceptível. Sem sombras marcadas,
sem objetos, sem marcas. Aparência de espaço limpo pronto para receber
elementos. Proporção 16:9.
```

---

## 5. Os 7 ativos que **não devem** ser imagem gerada

Recomendação técnica, e ela economiza 26 gerações.

Os slots de diagrama — ciclo do grupo, sorteio vs lance, anatomia da parcela,
cadeia de responsabilidade, caminho do pagamento, lance que abate saldo, árvore
de decisão — **devem ser SVG escrito em código**, não imagem gerada. Motivos
concretos:

| | Imagem gerada | SVG |
|---|---|---|
| Número dentro da figura | vira pixel: não corrige, não indexa, não lê em leitor de tela | fica no DOM, grepável, corrigível |
| Peso | 80–200 KB cada | 2–6 KB |
| Tema claro/escuro | duas versões | `currentColor`, uma só |
| Acessibilidade | depende do `alt` | `<title>`, `<desc>`, texto real |
| Correção de conteúdo | regerar e republicar | editar uma linha |
| Coerência com a regra "zero número em pixel" | viola | cumpre |

**Nano Banana Pro é excelente em fotografia e péssimo em diagrama técnico com
rótulo correto** — é onde ele inventa texto. Pedir diagrama a ele contraria a
regra dura nº 2 da própria direção aprovada.

**Os 7 diagramas em SVG**, por ordem de valor:

1. `svg-caminho-do-pagamento` — o dinheiro vai à administradora, nunca a pessoa física *(o de maior consequência do site)*
2. `svg-fronteira-rotulos` — camada de rótulos sobre o ativo C1
3. `svg-sorteio-e-lance` — as duas formas apuradas na mesma assembleia
4. `svg-anatomia-da-parcela` — crédito, taxa, fundo de reserva, seguro
5. `svg-ciclo-do-grupo` — adesão → assembleias → contemplação → quitação
6. `svg-arvore-de-decisao` — as duas saídas com peso igual, a única figura capaz de dizer "não compre"
7. `svg-lance-abate-saldo` — desfaz o equívoco de que lance "adianta parcela"

Posso escrever os sete diretamente no projeto, no padrão do design system.

---

## 6. Os 5 ativos que **ninguém** pode gerar

Honestidade sobre o limite da ferramenta:

| Ativo | Por que não se gera | O que fazer |
|---|---|---|
| **Screenshot da consulta ao Bacen** (P0, o mais valioso do site) | É prova verificável. Gerada, vira falsificação de página de órgão regulador — e o site inteiro se apoia nessa consulta | Capturar a tela real, anotar por cima em SVG |
| **Foto do Samuel** (P0, fecha a P3b) | Rosto de pessoa real. Gerar é fabricar likeness | Foto real, mín. 400×400, fundo neutro |
| **Fachada da sede** | Prova de existência física. Gerada, é prova falsificada | Foto real ou **não publicar** |
| **Screencast da consulta ao Bacen** | idem screenshot, em movimento | Gravar a tela real |
| **Qualquer prova de operação** | A MOVECON é nova | Não inventar substituto |

---

## 7. Vídeo — a resposta honesta

**Os quatro agentes de mapeamento, trabalhando de forma independente, propuseram
o mesmo e único vídeo:** o screencast da consulta ao Banco Central. Nenhum
propôs vídeo institucional, depoimento ou explicativo animado.

Isso é sinal, não coincidência. **Um vídeo se justifica hoje:**

### V1 · `consulta-bacen.mp4` — 40 a 70 segundos, sem áudio, com legenda

Captura de tela real do caminho: `bcb.gov.br` → Estabilidade Financeira → busca
por **CNPJ 90.982.679/0001-54** → resultado.

- Sem locução, sem música, sem intro animada
- Cursor visível e movimento lento e legível
- Legenda em HTML por cima, não queimada no vídeo
- Auto-hospedado — **YouTube embed quebraria a regra de zero recurso de terceiro**
- Termina no resultado da consulta, sem call-to-action

**Por que só ele:** é o único conteúdo do site em que a ordem dos passos importa
e o texto não consegue transmitir. Todo o resto é melhor lido do que assistido.

### O que **não** fazer em vídeo

Institucional da empresa (não há operação filmável ainda), depoimento (não há
clientes), explicativo animado do consórcio (o texto e os SVGs fazem melhor, e
custam 1% do esforço), tour pelo escritório (sugere estrutura não verificada).

---

## 8. Especificação técnica

| Item | Regra |
|---|---|
| Formato | **AVIF** com fallback **WebP**; PNG só para o logo |
| Peso máximo | og:image ≤ 120 KB · foto-objeto ≤ 180 KB · textura ≤ 250 KB |
| Dimensões | og:image **1200×630 exatos** · foto-objeto 1800×1200 · retrato 800×800 |
| `loading` | `lazy` em tudo abaixo da dobra; **`eager` no objeto do hub** |
| CLS | `width` e `height` explícitos em **todo** `<img>` — hoje 4 de 5 têm |
| `alt` | descritivo do que se vê, sem keyword stuffing. Decorativo puro leva `alt=""` |
| Terceiros | **zero**. Nada de CDN, nada de embed. As fontes já são auto-hospedadas |
| Schema | `ImageObject` no `Organization` e nos `Article` |

### O que precisa mudar no código

1. **`movecon-seo.php`** — emitir `og:image` e `twitter:image` por camada, com o
   molde correspondente. Hoje as duas tags simplesmente não existem.
2. **`gerar_hubs.py` / `gerar_filhas.py`** — slot de imagem no hero, opcional,
   com `width`/`height` fixos.
3. **`movecon.css`** — classes para as figuras e legendas, e o par
   `<figure>/<figcaption>`.

---

## 9. Ordem de execução

| Lote | O quê | Por que primeiro |
|---|---|---|
| **1** | 4 moldes de og:image + emissão no `movecon-seo.php` | 94 rotas compartilham sem imagem **hoje**, e o `twitter:card` promete o que não entrega. Maior ganho por hora do plano inteiro |
| **2** | Screenshot real do Bacen + anotação SVG | O ativo mais valioso do site, e não depende de geração |
| **3** | 7 diagramas SVG | Resolvem compreensão, pesam 3 KB, não apodrecem |
| **4** | 9 foto-objeto dos hubs (A2/B1) | Identidade visual por modalidade |
| **5** | Bloco de fronteira C1 + rótulos | Resolve a confusão MOVECON/Alpha |
| **6** | 6 objetos dark para LP e simulador | Continuidade com o criativo do anúncio |
| **7** | Vídeo da consulta ao Bacen | Maior esforço, menor alcance |

---

## 10. O que depende de você

| # | Item | Sem isso |
|---|---|---|
| 1 | **Foto real do Samuel**, mín. 400×400 | A caixa de autor segue sem rosto nos 16 artigos — a lacuna de E-E-A-T que a P3b registra |
| 2 | **Autorização para capturar** a tela do Bacen e publicar | Trava o ativo nº 1 em valor |
| 3 | **Existe sede física fotografável?** | Se não, o slot de fachada sai do plano em vez de ficar aberto |
| 4 | **Confirmar a direção** "Vistoria & Esquema" | Tudo abaixo dela muda se a resposta for outra |
| 5 | **Quem gera** — você no Nano Banana Pro, ou eu escrevo e você executa | Define o formato de entrega dos próximos lotes |

---

## 11. Descartado de propósito

| Ativo | Motivo |
|---|---|
| Qualquer pessoa em qualquer rota | Empresa sem carteira: pessoa em quadro é lida como cliente |
| Imagem em `/avaliacoes/` | Página sobre reputação sem histórico — imagem empurra para prova social inexistente |
| Imagem nova nas 36 filhas | Vira papel de parede e infla o site sem ganho |
| Selo, badge, certificação | A MOVECON não tem nenhum |
| Chave sendo entregue, confete, laço | Promessa de contemplação |
| Fachada com logo MOVECON | Sugere estrutura física não verificada |
| Diagrama gerado por IA com rótulo | Viola "zero número em pixel" e o modelo inventa texto |
