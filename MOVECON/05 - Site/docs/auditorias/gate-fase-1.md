# GATE — Fase 1

Executado em 26/07/2026. Checklist da seção 5.4 do manual de prompts.
**Auditor não corrige — apenas reporta.** Medido no HTML servido.

| Rota | Palavras | Tabela | Passos | FAQ | schema=visível | Compliance | Proibidas |
|---|---|---|---|---|---|---|---|
| `/consorcio-caminhao/` | 1035 | 1 | 4 | 6 | OK | OK | nenhuma |
| `/consorcio-contemplado/` | 933 | 0 | 6 | 6 | OK | OK | nenhuma |
| `/consorcio-embarcacoes/` | 837 | 1 | 4 | 6 | OK | OK | nenhuma |
| `/consorcio-empresa/` | 931 | 1 | 4 | 6 | OK | OK | nenhuma |
| `/consorcio-imoveis/` | 1239 | 1 | 4 | 6 | OK | OK | nenhuma |
| `/consorcio-maquinas-agricolas/` | 989 | 1 | 4 | 6 | OK | OK | nenhuma |
| `/consorcio-moto/` | 896 | 1 | 4 | 6 | OK | OK | nenhuma |
| `/consorcio-servicos/` | 1060 | 1 | 4 | 6 | OK | OK | nenhuma |
| `/consorcio-veiculos/` | 1120 | 1 | 4 | 6 | OK | OK | nenhuma |

**Total nos 9 hubs: 9040 palavras.**

## Checklist da seção 5.4

| # | Item | Status | Evidência |
|---|---|---|---|
| 1 | Bloco Alpha literal presente | **OK** | certificado 03/100/213/88 no corpo dos 9 |
| 1 | Frase proibida | **OK** | zero ocorrências das 11 |
| 1 | MOVECON como administradora | **OK** | `validar_prosa` varre `_codigo/` e `build/` no pre-commit |
| 2 | Slugs no keyword-map | **OK** | 99 páginas WP = 99 rotas `no-ar`, bijeção conferida nos dois sentidos |
| 2 | URL órfã ou variante duplicada | **OK** | `validar_mapa` bloqueia canibalização; 78 de 78 rotas indexáveis alcançáveis em 2 cliques |
| 3 | Titles ≤60, metas 120-160, H1 único | **OK** | validado por `check_seo`; H1 conferido nas 99 |
| 4 | Conteúdo linka o simulador | **OK** | 8 hubs com CTA de simulador; contemplado não tem por decisão |
| 4 | Links internos apontam para slugs existentes | **OK** | geradores abortam se a rota não está no mapa |
| 5 | Número/claim sem origem | **OK** | zero taxa ou percentual em hub; `PARCELA_FIXA` e `TERMOS_MODALIDADE` bloqueiam no pre-commit |
| 6 | Pendências refletidas em 06-pendencias.md | **OK** | 10 bloqueios + 5 propostas |

## Regras codificadas durante a Fase 1

Cada uma nasceu de um erro real encontrado, não de precaução abstrata:

| Regra | O que bloqueia | Como foi descoberta |
|---|---|---|
| `PLACEHOLDER NAO RESOLVIDO` | `{{...}}` em página publicada | proposta de tabela com `{{DADO_PENDENTE}}` |
| `TERMOS_MODALIDADE` | FGTS fora de imóveis, emplacamento fora de veículo | replicação do molde para veículos |
| `PARCELA_FIXA` | promessa de parcela que não muda | **12 violações já no ar em 7 arquivos** |

## Veredito

**APROVADO. Fase 1 encerrada.**

Os 9 hubs estão no ar, 8 com o molde completo e 1 com estrutura própria
justificada. Nenhuma falha de compliance, schema ou arquitetura.

Pendências que **não** bloqueiam a Fase 2 e seguem abertas: P1 (tabela
Alpha), P3 (autor YMYL), P5 (legais), P7 (banner), P8 (backup) e P9 (GSC).
