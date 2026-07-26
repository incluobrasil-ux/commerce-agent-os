# 04 — Padrões on-page

> Extraído do `relatorio-pesquisa-concorrentes.md` e cruzado com o que a
> auditoria de 26/07/2026 mediu no site real
> (`docs/auditoria-onpage-2026-07-26.md`).

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
