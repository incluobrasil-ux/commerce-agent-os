# 02 — Mapeamento do blueprint para as rotas existentes

> **Gerado** por `scripts/gerar_docs_mapeamento.py` a partir de
> `content/keyword-map.json`. Não editar à mão: a próxima geração sobrescreve.
>
> Substitui o `02-arquitetura.json` previsto no manual de prompts. Aquele
> arquivo seria uma **segunda fonte da verdade** de URLs ao lado do
> keyword-map, e duas fontes significam que nenhuma é a verdade. Aqui a
> tabela é derivada; rota nova continua nascendo em `portar_mapa.py`.

**Zero URLs novas.** Cada padrão do relatório de concorrentes é ligado a uma
rota que já existe. Onde o relatório sugere algo sem rota correspondente, o
item está em `06-pendencias.md` como proposta aguardando aprovação.

## Inventário atual

| Camada | No ar | Planejada |
|---|---|---|
| artigo | 3 | 0 |
| confianca | 4 | 0 |
| conversao | 6 | 1 |
| filha | 36 | 0 |
| glossario | 3 | 0 |
| guia | 21 | 0 |
| hub | 9 | 0 |
| institucional | 2 | 2 |
| lp | 15 | 0 |
| **Total** | **99** | **3** |

## Padrão do relatório → rota real

### Pilar por modalidade de bem (todos os 6 concorrentes)

| Rota | Keyword do mapa | Status |
|---|---|---|
| `/consorcio-imoveis/` | consórcio de imóveis | no-ar |
| `/consorcio-veiculos/` | consórcio de veículos | no-ar |
| `/consorcio-moto/` | consórcio de moto | no-ar |
| `/consorcio-caminhao/` | consórcio de caminhão | no-ar |
| `/consorcio-servicos/` | consórcio de serviços | no-ar |

### Pilares de nicho — gap do setor (Evoy e HS estendem; os outros não)

| Rota | Keyword do mapa | Status |
|---|---|---|
| `/consorcio-maquinas-agricolas/` | consórcio de máquinas agrícolas | no-ar |
| `/consorcio-embarcacoes/` | consórcio de embarcações | no-ar |
| `/consorcio-empresa/` | consórcio para empresa | no-ar |

### Cluster "contemplados" — dominado por corretoras, pouco defendido

| Rota | Keyword do mapa | Status |
|---|---|---|
| `/consorcio-contemplado/` | consórcio contemplado | no-ar |

### Simulador como hub de conversão (Embracon ~6 CTAs por página)

| Rota | Keyword do mapa | Status |
|---|---|---|
| `/simulador/` | simulador de consórcio | no-ar |

### Fundo de funil / decisão — maior oportunidade segundo o relatório

| Rota | Keyword do mapa | Status |
|---|---|---|
| `/guia/consorcio-vale-a-pena/` | consórcio vale a pena | no-ar |
| `/guia/consorcio-ou-financiamento/` | consórcio ou financiamento | no-ar |
| `/guia/consorcio-ou-emprestimo/` | consórcio ou empréstimo | no-ar |
| `/guia/consorcio-ou-poupar/` | consórcio ou juntar dinheiro | no-ar |

### Mecânica do consórcio (cluster forte da Embracon)

| Rota | Keyword do mapa | Status |
|---|---|---|
| `/guia/como-funciona-o-consorcio/` | como funciona o consórcio | no-ar |
| `/guia/carta-de-credito/` | o que é carta de crédito | no-ar |
| `/guia/lance-no-consorcio/` | como funciona o lance no consórcio | no-ar |
| `/guia/lance-embutido-na-pratica/` | lance embutido | no-ar |
| `/guia/depois-da-contemplacao/` | fui contemplado e agora | no-ar |

### Custos e contrato

| Rota | Keyword do mapa | Status |
|---|---|---|
| `/guia/taxa-de-administracao/` | taxa de administração consórcio | no-ar |
| `/guia/fundo-de-reserva/` | fundo de reserva consórcio | no-ar |
| `/guia/reajuste-da-parcela/` | reajuste da parcela do consórcio | no-ar |
| `/guia/atraso-e-desistencia/` | desistir do consórcio | no-ar |
| `/guia/direitos-do-consorciado/` | direitos do consorciado | no-ar |

### Branded SERP — "[marca] é confiável" (gap: ninguém defende)

| Rota | Keyword do mapa | Status |
|---|---|---|
| `/administrado-pela-alpha/` | movecon é confiável | no-ar |
| `/seguranca/` | como saber se o consórcio é seguro | no-ar |
| `/avaliacoes/` | movecon avaliações | no-ar |
| `/quem-somos/` | quem é a movecon | no-ar |
| `/guia/consorcio-e-confiavel/` | consórcio é confiável | no-ar |

### AEO — FAQ com resposta direta e URL própria (só Evoy e CAIXA)

| Rota | Keyword do mapa | Status |
|---|---|---|
| `/perguntas/` | perguntas frequentes sobre consórcio | no-ar |
| `/glossario/` | glossário do consórcio | no-ar |
| `/dados/` | dados do mercado de consórcio no brasil | no-ar |

### llms.txt — nenhum dos 6 concorrentes tem

| Rota | Keyword do mapa | Status |
|---|---|---|
| `/llms.txt` | — | **fora do keyword-map** |

### Blog de fundo de funil (Embracon domina; menores ausentes)

| Rota | Keyword do mapa | Status |
|---|---|---|
| `/blog/` | blog movecon | no-ar |
| `/blog/melhores-parceiras-alpha-consorcios/` | parceiras alpha consórcios | no-ar |
| `/blog/melhores-empresas-consorcio-2026/` | melhores empresas de consórcio | no-ar |

## Anti-padrões observados nos concorrentes

Do relatório, coisas a **não** repetir:

- **Embracon:** slugs quase duplicados para a mesma modalidade —
  `embracon.com.br/consorcio-de-carro`, `.../consorcio-de-veiculos` e
  `.../consorcio-de-automoveis`.
  É canibalização auto-infligida. O `check_seo.py` do projeto bloqueia isso
  no pre-commit.
- **CAIXA:** taxonomia inconsistente —
  `caixaconsorcio.com.br/consorcio-de-veiculos-leves/` com barra final ao
  lado de `caixaconsorcio.com.br/consorcio-imobiliario` sem barra.
- **Âncora:** dois padrões de slug convivendo —
  `ancoraconsorcios.com.br/imoveis` no rodapé e
  `.../consorcio/consorcio-de-servicos` no corpo.

A MOVECON usa um padrão só: `/consorcio-<bem>/` com barra final, filhas em
`/consorcio-<bem>/<caso>/`, guias em `/guia/<assunto>/`.
