# 04 — Padrões on-page

> Extraído do `relatorio-pesquisa-concorrentes.md` e cruzado com o que a
> auditoria de 26/07/2026 mediu no site real
> (`docs/auditoria-onpage-2026-07-26.md`).

## Formulação de referência — custo de adesão

**Texto aprovado em 26/07/2026. Nenhum conteúdo novo menciona custo de adesão
fora desta formulação.**

### Completa — answer-first, FAQ, corpo

> Não há entrada destinada ao bem: 100% do crédito continua disponível para a
> compra. Na adesão, antecipa-se parte da taxa de administração, o que torna a
> primeira parcela maior que as demais — o valor exato depende da modalidade e
> do plano, e o simulador mostra a primeira parcela e as seguintes
> separadamente.

### Curta — meta description, card, linha de tabela

> Sem entrada para o bem — a primeira parcela é maior.

### A distinção que precisa sobreviver

**"Entrada destinada ao bem" de fato não existe**, e isso pode e deve continuar
sendo dito: é diferencial real contra o financiamento, onde a entrada abate o
preço do bem e sai antes de você tê-lo.

**O que não pode é omitir a primeira parcela maior.** As duas coisas cabem na
mesma frase, e é assim que devem aparecer.

Ver `01-compliance.md` para a magnitude por modalidade e o log de decisão.

### Defeito estrutural corrigido junto — colisão de nome de arquivo

`gerar_filhas.py` escrevia `build/filha-<slug>.html`. Duas filhas com o mesmo
slug em silos diferentes — **`frota` em `/consorcio-caminhao/` e em
`/consorcio-empresa/`** — geravam o mesmo arquivo, e a segunda sobrescrevia a
primeira.

No ar, `/consorcio-caminhao/frota/` servia o texto de empresa: duas URLs com
conteúdo idêntico, e a página de caminhão sem o próprio conteúdo — o que fala
de transportadora, frete e cavalo mecânico.

O `check_seo` não pegava porque compara keywords do keyword-map, e as duas são
diferentes. O defeito estava no nome do arquivo de saída.

**Corrigido:** o nome passa a ser `filha-<silo>-<slug>.html`, e o gerador aborta
se dois conteúdos tentarem escrever o mesmo arquivo.

**A publicação também mudou:** o ID da página é resolvido por **pai + slug**,
nunca por slug sozinho. `wp post list --name=frota` devolve as duas — foi assim
que uma página ficou meses servindo o conteúdo da outra.

## Limites duros

**Extensão é meta indicativa, não gate.** Decisão do cliente em 26/07/2026: as
contagens abaixo orientam a priorização; nenhuma delas bloqueia publicação.
Completar página com texto vazio para fechar métrica é o oposto do que a
auditoria pediu — se a página está completa com menos, publica com menos.

Os limites da tabela seguinte, esses sim, são duros.

| Campo | Limite | Onde vive |
|---|---|---|
| `title` | ≤ 60 caracteres | keyword-map |
| `description` | 120-160 caracteres | keyword-map |
| Answer-first | ≤ 55 palavras | conteúdo da página |
| H1 | **um só** por página | conteúdo ou `post_title` |

**Regra de severidade da description** — está no HANDOFF e não é inconsistência:
description curta é **aviso** em rota `planejada` e **erro** em rota `no-ar`.
Rascunho não trava commit; página que existe para o Google, sim.

## Answer-first

Primeiro parágrafo da página, dentro de `<p class="resposta-curta">`. Responde
a keyword antes de qualquer contexto. É o trecho que motor generativo extrai e
cita.

**Precisa fazer sentido copiado isolado.** Se depender do parágrafo seguinte,
está errado.

Não colocar storytelling antes. Não enfeitar. Não mover.

O padrão do relatório é "resposta direta na 1ª frase" — a MOVECON já cumpre em
100% das páginas medidas.

## Estrutura do pilar (hub)

Ordem observada nos 6 concorrentes, adaptada:

1. **Hero** — eyebrow, H1, answer-first, lead, CTA duplo
2. **Vantagens** — 4 cards (sem juros, sem entrada, FGTS quando aplicável, parcela que cabe)
3. **Cobertura** — o que a carta cobre no segmento
4. **Tabela comparativa** do segmento — consórcio × financiamento
5. **Por objetivo** — links para as filhas do silo
6. **FAQ** — 5 a 7 perguntas
7. **Bloco de compliance no corpo**
8. **CTA final**

### O que a auditoria encontrou nos 9 hubs

| Critério | Padrão | Real |
|---|---|---|
| Extensão | 1.200 palavras | 390 a 583 — **0 de 9 dentro** |
| Tabela HTML | obrigatória | **0 de 9 têm** |
| FAQ | 5 a 7 perguntas | **3 nos 9** |
| Answer-first ≤55 | obrigatório | 9 de 9 ✓ |
| Links para filhas | obrigatório | 9 de 9 ✓ |

**Tabela HTML de verdade, nunca imagem.** É o formato que ganha featured
snippet em consulta comparativa, e o único que leitor de tela percorre.

## Estrutura da filha de silo

- 600 a 900 palavras — **hoje: mediana de 301, nenhuma dentro**
- H1 = keyword da filha, **nunca** a do hub pai
- 3 cards de conteúdo próprio + 3 perguntas de FAQ específicas
- Links: hub pai (obrigatório) + simulador — **36 de 36 cumprem**
- Breadcrumb visível, não só no schema

**Teste anti-thin:** ≥3 fatos específicos que não estão no hub pai. As 36
passam, com pouca margem. **Nenhuma é candidata a 301** — consolidar destruiria
cobertura long-tail já indexada.

## Estrutura do guia

- 1.500-2.500 palavras nos pilares, 800-1.200 nos clusters — **hoje: mediana de 352**
- H2 em formato de pergunta → resposta direta no 1º parágrafo → aprofundamento
  — **21 de 21 cumprem**
- **Citar fonte primária COM link:** Lei 11.795/08 no planalto.gov.br, dados
  ABAC, página do Bacen — **0 de 21 fazem**
- Data de publicação e de atualização visíveis — **0 de 21**
- Sem CTA agressivo no primeiro terço

Os dois zeros são o achado mais sério da auditoria. O relatório diz que citar
fonte primária "é o que separa blog de vendedor de referência nível Brasil".

## Linkagem interna

Do relatório: **o simulador é o hub com maior número de links internos do
site.** Toda página e todo artigo linkam.

- Hub → todas as filhas do silo, simulador, guia pilar, 1 termo do glossário
- Filha → hub pai, 1-2 irmãs, simulador
- Guia → 3 guias relacionados, hub do segmento quando houver
- Rodapé → hubs, camada Aprenda, camada Institucional

**As 36 filhas não entram no rodapé:** são alcançadas pelo hub pai, que é onde
o contexto existe. Rodapé com 36 links vira ruído.

Alcançabilidade medida em 26/07/2026: **78 de 78 rotas indexáveis em 2 cliques
da home, zero órfãs.**

## Bloco de compliance — no corpo, não só no rodapé

A auditoria encontrou a atribuição à Alpha **apenas no rodapé global**. Zero
ocorrência no corpo das páginas.

Funciona para o leitor. **Não funciona para trecho extraído por IA**, que
recorta o conteúdo e descarta o rodapé do site. Texto obrigatório em
`01-compliance.md`.

## CTA

- **Duplo:** simulador (frio) + falar com consultor (quente)
- Todo CTA de simulação aponta para a rota real do simulador do segmento
- **Nenhum CTA promete prazo**

## Replicação de molde — o que herda e o que não

A estrutura herda; o texto não. Regra do prompt 1.2 do manual.

**Item permanente do checklist de aceite:** nenhuma menção a benefício ou custo
que não se aplica à modalidade. **FGTS fora de imóveis é falha, não aviso.**

Codificado em `validar_modalidade()` no `check_seo.py`, que falha com exit 1:

| Termo | Só pode aparecer em |
|---|---|
| `fgts` | imóveis, `/guia/primeiro-imovel/`, glossário, `/guia/lance-no-consorcio/`, `/perguntas/` |
| `itbi`, `escritura` | imóveis, `/guia/primeiro-imovel/` |
| `emplacamento`, `licenciamento` | veículos, moto, caminhão, máquinas agrícolas |

A varredura é sobre os JSON de conteúdo, não sobre o HTML: no JSON a rota é
conhecida com precisão. Existe porque replicação de molde é onde esse erro
nasce — FGTS, ITBI e escritura viajam junto com a estrutura se ninguém segurar,
e checklist humano falha na quinta replicação.

**O que PODE repetir entre hubs**, por ser estrutura e não conteúdo:

- bloco de compliance (texto literal de `01-compliance.md`)
- nota "Sem juros — mas com custo"
- copy do CTA final
- nota da tabela comparativa

## Anti-padrões a não repetir

Do relatório:

- **Embracon:** slugs quase duplicados para a mesma modalidade — canibalização
  auto-infligida. O `check_seo.py` bloqueia no pre-commit.
- **CAIXA:** taxonomia inconsistente entre pilares — usa
  `caixaconsorcio.com.br/consorcio-de-veiculos-leves/` com barra final ao lado
  de `caixaconsorcio.com.br/consorcio-imobiliario` sem barra.

**Notação:** slug de concorrente aparece sempre com o domínio dentro do mesmo
trecho de código. Caminho iniciado por `/` neste documento é **sempre** rota da
MOVECON existente no keyword-map — é o que o gate 0.2 verifica.
- **Âncora:** dois padrões de slug convivendo no mesmo site.
- **Quase todos:** blog sem autoria identificada — ver P3.
