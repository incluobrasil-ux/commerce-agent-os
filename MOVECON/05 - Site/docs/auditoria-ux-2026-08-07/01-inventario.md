# 01 — Inventário do site MOVECON

> Auditoria de 2026-08-07. Tudo abaixo foi **medido** no HTML servido em
> `https://moveconconsorcio.com` e cruzado com `content/keyword-map.json` e com a
> lista de páginas publicadas no WordPress. Nada foi assumido de memória.

## Correção de premissa do briefing

O prompt pede a raiz do tema, os templates e os CPTs. **Nenhum dos três existe.**

| Premissa do briefing | Realidade medida |
|---|---|
| Tema custom | **Astra 4.13.6 de fábrica**, sem tema-filho |
| Templates de página | **não existem** — as páginas nascem de scripts Python a partir de JSON |
| CPTs | **nenhum** — só tipos internos do WordPress e do Pods |
| Raiz WordPress local | **não existe** — o site roda em Docker no VPS `2.24.220.21` |
| Mapa de rotas | ✅ `content/keyword-map.json` |

Onde o briefing diz *template responsável*, este relatório lê **gerador responsável**.
Onde diz *CSS do tema*, lê **CSS no Customizer** (22 KB, fonte única).

## Placar

| Métrica | Valor |
|---|---:|
| Rotas mapeadas | **118** |
| No ar | **115** |
| Planejadas | **3** |
| Indexáveis | **96** |
| Páginas publicadas no WordPress | **110** |
| Páginas órfãs | **0** |
| Páginas duplicadas | **0** |

## Por camada

| Camada | Rotas | Objetivo | Gerador responsável |
|---|---:|---|---|
| `filha` | 36 | Long tail dentro do silo; sub-bem ou recorte especifico | `gerar_filhas.py` |
| `guia` | 21 | Intencao informacional; sustentar E-E-A-T e alimentar citacao por IA | `gerar_guias.py + gerar_indice_guias.py` |
| `artigo` | 17 | Blog; captura editorial e comparativos | `gerar_artigos.py + gerar_indice_blog.py` |
| `lp` | 15 | Trafego pago; noindex por decisao | `gerar_lps.py` |
| `hub` | 9 | Capturar a busca da modalidade e distribuir para as filhas do silo | `gerar_hubs.py (8) + gerar_hub_contemplado.py (1)` |
| `conversao` | 7 | Simuladores; noindex ate a tabela oficial da Alpha (P1) | `gerar_simuladores.py` |
| `confianca` | 6 | Prova de regulacao, seguranca e identidade | `_codigo/pagina-*.html (manual)` |
| `institucional` | 4 | Home, contato e paginas legais | `_codigo/pagina-*.html (manual) + gerar_legais.py` |
| `glossario` | 3 | Referencia; verbetes, dados e perguntas transversais | `gerar_glossario.py / gerar_dados.py / gerar_perguntas.py` |

## Órfãs, duplicadas e sem propósito

Cruzei os 112 slugs do mapa com os 110 slugs publicados no WordPress.

| Achado | Resultado |
|---|---|
| Página no WP fora do mapa | 1 — o slug `home`, que **é** a rota `/`. Artefato de comparação, não órfã |
| Rota no mapa sem página | 3 — a rota `/` (mesmo artefato) e as 2 legais, `status: planejada` |
| Duplicadas | nenhuma |
| Sem propósito claro | nenhuma |

**As 2 legais não estarem no ar é correto e é bloqueio externo:** dependem da revisão
jurídica (pendência P5). O projeto optou por não publicar página legal sem revisão e
por não linkar URL inexistente — as duas decisões estão certas.

> ⚠️ Limite do método: comparei pelo **último segmento** do slug. Silos diferentes com
> filha de mesmo nome colapsam numa entrada só. Isso explica 110 páginas para 115 rotas
> no ar e **não** indica página faltando.

## Volume de conteúdo por camada (corpo, sem header/rodapé)

| Camada | Páginas | Mediana de palavras |
|---|---:|---:|
| `filha` | 36 | 412 |
| `guia` | 21 | 528 |
| `artigo` | 17 | 1198 |
| `lp` | 15 | 192 |
| `hub` | 9 | 1074 |
| `conversao` | 6 | 306 |
| `confianca` | 6 | 564 |
| `institucional` | 2 | 474 |
| `glossario` | 3 | 1588 |

Mediana geral: **525 palavras**.
