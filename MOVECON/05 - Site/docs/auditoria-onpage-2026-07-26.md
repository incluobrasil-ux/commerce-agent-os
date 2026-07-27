# Auditoria on-page — 26/07/2026

Medido no **HTML servido**, não nos arquivos de build: é o que o usuário e o
Googlebot recebem de fato, depois de mu-plugin, tema e cache. Reproduzível com
`python scripts/auditar_onpage.py`.

**Limite do método:** contagem de palavra e presença de bloco são proxy de
completude, não de qualidade. A nota prioriza o que olhar; ela não decide.

## RESOLVIDO em 27/07/2026 — os dois zeros dos guias

| Critério | Antes | Depois |
|---|---|---|
| Fonte primária linkada | 0 de 20 | **20 de 20** |
| Data de publicação/atualização visível | 0 de 20 | **20 de 20** |

### Fontes — conferidas uma a uma antes de entrar

Cada URL foi buscada e, onde o HTML permite ler, teve o conteúdo comparado com
a afirmação. A Lei 11.795/08 foi lida no Planalto (decodificada em
`iso-8859-1`) e a ementa confere: *"Dispõe sobre o Sistema de Consórcio"*.

**Descartadas, e o motivo importa mais que a lista:**

| Candidata | Por quê |
|---|---|
| `abac.org.br/imprensa/numeros-do-setor` | 404 |
| Circular 3.432 do Bacen | responde 200, mas o conteúdo é renderizado por JS e não consigo comprovar que é o normativo que eu afirmaria ser. Citar número de norma sem conferir é inventar credencial — mesma regra que vale para taxa e prazo |

As páginas do Bacen são SPA: retornam 200 sem texto no HTML cru. Entraram
porque o caminho corresponde ao que o cliente confirmou em 25/07/2026.

**Distribuição:** todo guia recebe Lei 11.795/08 + Bacen (os 20 descrevem o
regime que a lei cria, e o rodapé global já a cita em todos — linkar torna
verificável uma citação que já existe). As demais entram só onde a matéria as
invoca: consulta de autorizadas em `/guia/consorcio-e-confiavel/` e
`/guia/contemplacao-garantida-e-golpe/`; canal de reclamação em
`/guia/direitos-do-consorciado/`; ABAC em `/guia/consorcio-vale-a-pena/`.

### Data — dinâmica, nunca assada

O gerador emite `<!--MV_DATA-->`; o `movecon-seo.php` substitui em tempo de
requisição pelo `post_modified` real.

**Assar a data no HTML seria exibir a data da geração, não a da última
alteração** — bastaria uma correção de vírgula pelo painel para a página passar
a mentir sobre quando foi revisada. Numa página que se apresenta como
referência, data errada é pior que data nenhuma: é uma afirmação verificável e
falsa.

Quando publicação e modificação caem no mesmo dia, exibe só "Publicado em" —
mostrar as duas sugeriria uma revisão que não houve.

**Defeito encontrado e corrigido na verificação:** a primeira versão publicou
*"26 de July de 2026"* em 20 guias. O locale deste WordPress é `en_US` e
`wp_date('F')` devolve o mês em inglês. O mês passou a vir de tabela própria —
trocar o locale do site inteiro para consertar uma data seria efeito colateral
grande demais para o problema.

### O que segue aberto da auditoria

Itens 3 a 5 da ordem sugerida: bloco de compliance no corpo das páginas
comerciais, engorda dos hubs e engorda das filhas.

## Veredito geral

Nenhuma das 66 páginas medidas atinge a extensão mínima do plano. Não é um
problema de algumas páginas fracas: é o padrão do site inteiro. O conteúdo
foi escrito para ser correto e denso, e é — mas curto demais para disputar
head keyword.

| Camada | Páginas | Mediana de palavras | Mínimo do plano | Dentro do padrão |
|---|---|---|---|---|
| Hubs | 9 | 457 | 1200 | **0 de 9** |
| Filhas | 36 | 301 | 600 | **0 de 36** |
| Guias | 21 | 352 | 800 | **0 de 21** |

## 2.1 — Hubs (9)

| Hub | Nota | Palavras | Tabela | FAQ | Links p/ filhas |
|---|---|---|---|---|---|
| `/consorcio-embarcacoes/` | **4.7** | 390 | 0 | 3 | 2 |
| `/consorcio-moto/` | **4.8** | 419 | 0 | 3 | 2 |
| `/consorcio-maquinas-agricolas/` | **4.8** | 444 | 0 | 3 | 4 |
| `/consorcio-empresa/` | **4.8** | 438 | 0 | 3 | 4 |
| `/consorcio-veiculos/` | **4.9** | 488 | 0 | 3 | 4 |
| `/consorcio-caminhao/` | **4.9** | 457 | 0 | 3 | 4 |
| `/consorcio-servicos/` | **4.9** | 482 | 0 | 3 | 5 |
| `/consorcio-contemplado/` | **4.9** | 496 | 0 | 3 | 3 |
| `/consorcio-imoveis/` | **5.1** | 583 | 0 | 3 | 8 |

### Os 3 gaps que se repetem nos 9

1. **Extensão.** 390 a 583 palavras contra 1.200 do padrão. Nenhum passa de metade.
2. **Zero tabela HTML.** Nenhum dos 9 tem tabela comparativa — e tabela é o
   formato que ganha featured snippet em consulta comparativa.
3. **FAQ com 3 perguntas**, padrão pede 5-7. Uniforme nos 9, porque veio do gerador.

### Um achado que a nota não mostra

A coluna "compliance" saiu FALTA nos 9, e não é erro de medição: a atribuição à
Alpha existe **apenas no rodapé global**, injetado pelo mu-plugin. Zero ocorrência
no corpo das páginas. O padrão 1.1 do plano pede bloco de compliance no rodapé *da
página*. Funciona para o leitor; não funciona para um trecho extraído por IA, que
recorta o corpo e descarta o rodapé do site.

## 2.2 — Filhas de silo (36)

**Todas as 36 abaixo do mínimo.** Mediana de 301 palavras contra 600 do padrão;
a maior tem 576.

O que está certo e não precisa de trabalho:

- **36 de 36 linkam o hub pai** — obrigatório no padrão 1.2, cumprido
- **36 de 36 linkam simulador**
- Nenhuma repete a keyword do pai (o validador já garante)

### Veredito anti-thin

O teste do plano é "≥3 fatos específicos que não estão no hub pai". Aplicando-o
à estrutura real: cada filha tem 3 cards de conteúdo próprio e 3 perguntas de FAQ
específicas — ou seja, **passa no critério de existência**, mas com pouca margem.

**Veredito: engordar as 36, candidata a 301 nenhuma.** Consolidar em 301 seria
destruir cobertura de long-tail que já está indexada e que responde intenção
distinta. O problema não é redundância — é profundidade.

Prioridade por menor extensão:

| Filha | Palavras |
|---|---|
| `/consorcio-maquinas-agricolas/implementos/` | 280 |
| `/consorcio-empresa/equipamentos/` | 280 |
| `/consorcio-caminhao/carreta-implementos/` | 285 |
| `/consorcio-empresa/imovel-comercial/` | 287 |
| `/consorcio-imoveis/imovel-rural/` | 289 |
| `/consorcio-servicos/educacao/` | 289 |
| `/consorcio-empresa/frota/` | 290 |
| `/consorcio-embarcacoes/jet-ski/` | 290 |
| `/consorcio-embarcacoes/lancha/` | 293 |
| `/consorcio-servicos/viagem/` | 295 |

## 2.3 — Guias (21)

| Critério | Resultado |
|---|---|
| Extensão ≥800 palavras | **0 de 21** (mediana 352) |
| H2 em formato de pergunta | **21 de 21** ✓ |
| Fonte primária linkada | **0 de 21** |
| Data de publicação/atualização visível | **0 de 21** |

Os dois zeros são o achado mais sério da auditoria inteira. O padrão 1.3 diz que
citar fonte primária com link "é o que separa blog de vendedor de referência nível
Brasil" — e os 21 guias citam a Lei 11.795/08, o Banco Central e a ABAC **no texto,
sem um único link**. É o trabalho de maior retorno por hora do site.

### Os 5 mais fracos

| Guia | Palavras |
|---|---|
| `/guia/consorcio-ou-emprestimo/` | 316 |
| `/guia/depois-da-contemplacao/` | 320 |
| `/guia/como-ser-contemplado-mais-rapido/` | 322 |
| `/guia/consorcio-para-autonomo/` | 322 |
| `/guia/consorcio-para-negativado/` | 338 |

## Ordem de trabalho sugerida para a Fase 3

Não é a ordem do plano, e a divergência é deliberada:

1. **Links de fonte primária nos 21 guias.** Mecânico, rápido, reversível, e é o
   sinal de E-E-A-T mais barato disponível. Não depende de P3.
2. **Datas visíveis nos guias.** Mesma natureza.
3. **Bloco de compliance no corpo** das páginas comerciais, não só no rodapé global.
4. **Engorda dos hubs**, na ordem do plano: imóveis → veículos → caminhão.
5. **Engorda das filhas**, começando pelas 10 menores.

Os itens 1 a 3 são estruturais e cabem em gerador — atingem dezenas de páginas de
uma vez. O item 4 é escrita, 1 página por ciclo, como o plano determina.
