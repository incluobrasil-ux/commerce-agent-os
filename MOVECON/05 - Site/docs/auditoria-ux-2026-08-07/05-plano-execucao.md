# 05 — Plano de execução em 3 ondas

> Auditoria de 2026-08-07. Esforço: **P** ≤ 2h · **M** meio dia · **G** 1 dia ou mais.
> Nada aqui foi implementado — o briefing pede fase 100% de análise.

## Antes das ondas: o que só depende de você

Quatro itens que **nenhuma onda destrava**, e três deles são o gargalo do site.

| # | Item | O que fica parado sem ele |
|---:|---|---|
| 1 | **Revisão jurídica** das 2 páginas legais (P5) | LGPD ativa: há formulário coletando dados sem política publicada. **É o item mais urgente do documento inteiro** |
| 2 | **Telefone e WhatsApp próprios** | canal direto em 115 páginas; hoje o número em uso é da Crelider |
| 3 | **Cliente real que autorize depoimento nominal** | prova social segue 0 de 115, e é a lacuna mais cara do relatório 02 |
| 4 | **Tabela vigente da Alpha, por escrito, com validade** (P1) | percentual da taxa na FAQ; indexação dos 6 simuladores |

Itens 1 e 2 são administrativos e resolvem sozinhos boa parte da nota. O item 3
é comercial e não tem atalho.

---

## Onda 1 — compliance e confiança nas páginas críticas

**Objetivo:** tirar as 5 LPs do fundo do ranking e fechar a exposição de LGPD.

| # | Página | Ação | Esforço | Depende de |
|---:|---|---|---|---|
| 1.1 | rodapé global | publicar links legais + canais | P | **itens 1 e 2 acima** |
| 1.2 | 15 LPs | inserir componente C3 (canal direto) no fim do conteúdo | M | item 2 |
| 1.3 | 15 LPs | inserir objeto dark no hero (`03-gap-imagens.md` §3.3) | M | — |
| 1.4 | `/seguranca/` `/quem-somos/` | inserir FAQ de objeções (C5) | M | percentual da taxa fica `[A CONFIRMAR]` |
| 1.5 | `/administrado-pela-alpha/` | inserir C2 + bloco de fronteira acima da dobra | M | — |
| 1.6 | 34 páginas sem `taxa de administração` | acrescentar a menção no corpo | M | — |
| 1.7 | 8 páginas com 3+ CTAs | reduzir a 1 CTA primário por dobra | P | — |
| 1.8 | Customizer | minificar o CSS na publicação (remove 101 blocos de comentário interno do HTML público) | P | — |

**Por que as LPs primeiro.** São as 5 primeiras do ranking crítico (nota 4,3 a
4,6), recebem tráfego pago — ou seja, cada visita tem custo — e são `noindex`,
então mudanças ali não têm risco de SEO.

---

## Onda 2 — componentes globais e as imagens que importam

**Objetivo:** ligar os 24 ativos que estão no servidor sem uso.

| # | Alvo | Ação | Esforço | Depende de |
|---:|---|---|---|---|
| 2.1 | `movecon.css` (Customizer) | classes `.mv-fig`, `.mv-diag`, `figcaption` | P | — |
| 2.2 | 5 guias + `/seguranca/` | **7 diagramas SVG inline** — o lote de maior retorno | M | 2.1 |
| 2.3 | `/seguranca/` `/quem-somos/` | bloco de fronteira + rótulos SVG | M | 2.1 |
| 2.4 | 9 hubs | componente C2 ("quem faz o quê") | M | — |
| 2.5 | hubs, filhas, simuladores | componente C3 (canal direto) | M | item 2 |
| 2.6 | `/avaliacoes/` | componente C4 (depoimentos) | M | **item 3 — sem cliente real, não publicar** |
| 2.7 | `gerar_lps.py` | `og-molde-lp.webp` para as 15 LPs | P | gerar o ativo (§4.2) |

**2.2 é o item de melhor retorno do plano inteiro:** 7 arquivos já escritos,
17 KB somados, que explicam o produto — e são a única peça visual que passa no
teste do ornamento com folga.

---

## Onda 3 — refinamento do restante

| # | Alvo | Ação | Esforço | Depende de |
|---:|---|---|---|---|
| 3.1 | todos os ativos | `srcset` — hoje um arquivo de 172 KB é exibido a 460px | M | — |
| 3.2 | 36 filhas | atribuição completa à Alpha no corpo (hoje 33 de 115) | M | — |
| 3.3 | 6 simuladores | tirar de `noindex` | P | **item 4 (P1)** |
| 3.4 | `/blog/` (17 artigos) | caixa de autor com foto real | P | foto do Samuel (P3b) |
| 3.5 | `/administrado-pela-alpha/` | screenshot real do Bacen + anotação SVG | M | **autorização sua para capturar e publicar** |
| 3.6 | 9 hubs | *(opcional)* foto-objeto — só se o site parecer seco após 2.2 e 2.3 | P | decisão sua |
| 3.7 | site todo | AVIF com fallback, se a medição mostrar ganho | M | 3.1 |

---

## O que este plano deliberadamente não faz

| Não faz | Por quê |
|---|---|
| Faixa global de Banco Central | contraria a decisão de 25/07 e cria risco regulatório — ver `04` D1 |
| Foto de objeto no hero dos hubs | duas tentativas rejeitadas; não passa no teste do ornamento |
| Imagem em `/avaliacoes/` | página sobre reputação sem histórico |
| Imagem nas 36 filhas | vira papel de parede |
| Qualquer número de clientes ou anos | empresa aberta em 17/06/2026 |

---

## Sequência mínima, se você quiser só o essencial

Se for para fazer três coisas e parar:

1. **Destravar a revisão jurídica** — é LGPD ativa, não é estética
2. **Definir telefone e WhatsApp próprios** — resolve 115 páginas de uma vez
3. **Ligar os 7 diagramas SVG** (2.1 + 2.2) — meio dia de trabalho, e é a única
   entrega que melhora a compreensão do produto em vez da aparência dele

Os três somam menos de um dia de execução. Dois dependem de decisão sua, não de
código.
