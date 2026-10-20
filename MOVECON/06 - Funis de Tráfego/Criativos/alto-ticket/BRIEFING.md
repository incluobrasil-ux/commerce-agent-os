---
tags: [trafego, meta-ads, alto-ticket, bmw, maquinas, status/em-andamento]
criado: 2026-10-15
---
# Campanhas de alto ticket — BMW e Máquinas

Funil: **anúncio → página com formulário de qualificação → SDR no WhatsApp → videochamada → fechamento.**
Base: mineração da Biblioteca de Anúncios em 15/10/2026 (`C:\Users\samue\pesquisas\consorcio-bmw-maquinas`).

## Planos (iguais nas duas campanhas)

| Plano | Carta | Crédito líquido (30% embutido) | 1ª parcela | Demais | Lance do bolso | Lance livre (bolso + 10%) |
|---|---|---|---|---|---|---|
| 306 | R$ 437.183,05 | **R$ 306.028,13** | R$ 16.620,70 | 120x R$ 3.478,40 ou 60x R$ 6.956,80 | — | R$ 120.225,34 (27,5% da carta, a confirmar) |
| 696 | R$ 994.591,43 | **R$ 696.214,00** | R$ 37.812,18 | 79x R$ 7.704,86 | R$ 248.647,85 (25%) | R$ 273.512,64 |
| 902 | R$ 1.289.689,97 | **R$ 902.782,97** | R$ 49.031,20 | 79x R$ 9.990,72 | R$ 322.422,49 (25%) | R$ 354.664,74 |

## Bem ilustrativo de cada plano (preço de referência, out/2026)

| Plano | BMW | Máquinas |
|---|---|---|
| 306 | Série 3 (320i 0 km ≈ R$ 337–390 mil → crédito cobre seminova recente ou 0 km com complemento) | Trator 4x4 ~90 cv (Case Farmall 80 ≈ R$ 263 mil; NH TL 5.90 ≈ R$ 296 mil) |
| 696 | X3 (≈ R$ 516–654 mil) | Trator ~200 cv (NH T7 ≈ R$ 686 mil) |
| 902 | X6 (≈ R$ 888 mil) | 2 retroescavadeiras 0 km (Case 580N / NH B95C ≈ R$ 410–420 mil cada) |

## Estrutura no Gerenciador

- **Campanha 1:** `[MOVECON] Leads | BMW | LP` → página `/lp/credito-bmw`
- **Campanha 2:** `[MOVECON] Leads | Maquinas | LP` → página `/lp/credito-maquinas`
- Objetivo **Cadastros**, conversão no **site**, evento **Lead** (Pixel + API de Conversões).
- 1 conjunto por campanha: Brasil, 28–65+, público Advantage+ aberto, posicionamentos Advantage+.
  Se o Gerenciador exigir **categoria especial (serviços financeiros/crédito)**, marque. A estrutura já é aberta justamente por isso.
- Orçamento de teste: **R$ 100/dia por campanha**, 7 dias sem mexer. Depois cortar o criativo com pior custo por **lead qualificado**, não por lead bruto.
- Nome dos anúncios = id do criativo (`bmw-v1-902` etc.) e `utm_content` com o mesmo id, para o SDR saber qual plano o lead viu.

## Os 6 criativos

Gerados por `python criativos.py` → pasta `out/`. Vídeo 9:16 de 15 s com música: abertura já com crédito e parcela (o 1º quadro vira a capa) → como funciona → lance livre → tela final. Imagem 4:5. Sem bloco de aviso legal na arte (decisão de 15/10/2026).

### Campanha 1 — BMW

**bmw-v1-902 · vídeo · BMW X6**
- Texto principal: Tem R$ 322 mil parados e quer uma BMW X6? Em vez de financiar e pagar juros, dá para planejar com uma carta de crédito de R$ 902 mil.
  ✔ 79 parcelas de R$ 9.990,72 (1ª de R$ 49.031,20)
  ✔ Lance: R$ 322 mil do bolso + 30% embutido na própria carta
  ✔ Sem juros
  Toque em Saiba mais, responda 6 perguntas e um especialista te chama no WhatsApp para uma videochamada.
- Título: Carta de crédito de R$ 902 mil · Descrição: Simulação por videochamada · CTA: Saiba mais

**bmw-v2-696 · vídeo · BMW X3**
- Texto principal: Quem financia uma BMW paga juros. Quem planeja, não. Carta de crédito de R$ 696 mil para sua BMW X3:
  ✔ 79 parcelas de R$ 7.704,86 (1ª de R$ 37.812,18)
  ✔ Lance: R$ 248 mil do bolso + 30% embutido na própria carta
  ✔ Sem juros
  Simule em 1 minuto e receba a proposta por videochamada.
- Título: Sua BMW X3 com carta de crédito · CTA: Saiba mais

**bmw-i1-306 · imagem · BMW Série 3**
- Texto principal: Sua BMW Série 3 começa com um plano. Carta de crédito de R$ 306 mil, parcelas de R$ 3.478,40 em 120 meses (ou 60x de R$ 6.956,80) e 30% do lance embutido na própria carta. Sem juros.
- Título: Carta de crédito de R$ 306 mil · CTA: Simular

### Campanha 2 — Máquinas

**maq-v1-902 · vídeo · 2 retroescavadeiras**
- Texto principal: Ainda alugando retroescavadeira? Com uma carta de crédito de R$ 902 mil você monta a sua frota: dá para 2 retroescavadeiras 0 km.
  ✔ 79 parcelas de R$ 9.990,72 (1ª de R$ 49.031,20)
  ✔ Lance: R$ 322 mil do bolso + 30% embutido na própria carta
  ✔ Sem juros de banco
  Atendimento para todo o Brasil por videochamada.
- Título: Sua frota própria com carta de crédito · CTA: Saiba mais

**maq-v2-696 · vídeo · trator ~200 cv**
- Texto principal: Trator de 200 cv sem juros de banco. Carta de crédito de R$ 696 mil para renovar a frota:
  ✔ 79 parcelas de R$ 7.704,86 (1ª de R$ 37.812,18)
  ✔ Lance: R$ 248 mil do bolso + 30% embutido na própria carta
  ✔ Sem juros
- Título: Carta de crédito para trator · CTA: Saiba mais

**maq-i1-306 · imagem · trator 4x4 ~90 cv**
- Texto principal: Trator 4x4 novo com parcela que cabe na safra. Carta de crédito de R$ 306 mil, 120 parcelas de R$ 3.478,40 (ou 60x de R$ 6.956,80), 30% do lance embutido na carta.
- Título: Trator 4x4 com carta de crédito · CTA: Simular

**Fechar todo texto principal com:** "Crédito sujeito a contemplação por sorteio ou lance, sem data garantida. A MOVECON é plataforma de consórcio; os grupos são administrados pela Alpha Administradora de Consórcio Ltda." Na campanha BMW, somar: "BMW é marca de seu titular, sem vínculo com a MOVECON."

**Regras:** nunca escrever "Consórcio BMW" (é nome de produto de terceiro) · sem logotipo da BMW, New Holland etc. na arte · nunca prometer data de contemplação · não chamar a MOVECON de administradora.

## Mídias (escolhidas em 15/10/2026)

Bancos com uso comercial livre (Pexels, Pixabay, Unsplash). Arquivos em `midia/<slot>/`, origem e link de cada um em `midia/CREDITOS.md`. Placas legíveis cobertas com tarja preta (arquivos `-limpa.jpg`).

| Criativo | Cena 1 (gancho) | Cena 2 (crédito) | Cena 3 (condições) | Cena 4 (tela final) |
|---|---|---|---|---|
| bmw-v1-902 | X6 M preta na neve (foto) | X6 azul na estrada, deslizando da frente para a lateral | farol da X6 | frente da X6 M |
| bmw-v2-696 | X3 M no campo com neblina | X3 na estrada de montanha | X3 M preta na estrada | farol da X3 |
| maq-v1-902 | retro cavando (vídeo) | retro na obra, com operador | retro vista de cima | retro no canteiro |
| maq-v2-696 | trator grande passando perto (vídeo vertical) | trator com plantadeira, vista aérea | trator com semeadora | trator no pôr do sol |

Estáticas: `bmw-i1-306` = Série 3 branca (placa já em branco na foto) · `maq-i1-306` = trator 4x4 de cabine (~90 cv).

Para trocar uma cena: baixe a mídia para `midia/<slot>/`, aponte o arquivo na lista `cenas` do criativo em `criativos.py` e rode `python criativos.py <id>`. Em cada cena dá para ajustar zoom (`z`), enquadramento (`c0`/`c1` nas fotos, `fx` nos vídeos) e o segundo inicial do clipe (`ini`).

Reservas já baixadas: X6 (3 fotos de detalhe e frente), X3 (3), Série 3 (4), trator 90 cv (3).
Vídeo de banco da BMW atual praticamente não existe, por isso os vídeos da BMW são montados com fotos em movimento.
Se quiser cenas exclusivas, os prompts do Codex continuam valendo (sem texto, sem logotipo, placa em branco).

## Música

Faixas do Pixabay Music (licença de uso comercial), em `midia/musica/`. O script escolhe o trecho de 15 s com mais energia e normaliza em −14 LUFS.
A Biblioteca de Anúncios não mostra o áudio dos anúncios, e música comercial em alta nos Reels não é liberada para anúncio de empresa — por isso o estilo segue o que domina o nicho:

| Criativo | Faixa |
|---|---|
| bmw-v1-902 | Brazilian Phonk (alex-morgan) |
| bmw-v2-696 | Luxury trap (vaitsez) |
| maq-v1-902 | Country Southern Rock (Echobrainz) |
| maq-v2-696 | Country Rock (JonasBlakewood) |

Reservas: `reserva_phonk-drift.mp3`, `reserva_car-promo.mp3`. Para trocar, mude `musica=` do criativo no `criativos.py`.

## Formulários (um por campanha)

Mesma base, com perguntas específicas por segmento. Campos ocultos: `utm_source`, `utm_campaign`, `utm_content` (id do criativo), `fbclid`.

1. **Qual bem você quer?**
   BMW: Série 3 / X1 · X3 · X5 / X6 · Outro modelo
   Máquinas: Trator · Retroescavadeira · Escavadeira / pá carregadeira · Colheitadeira · Outra
2. **Valor aproximado do bem:** até R$ 350 mil · R$ 350–750 mil · acima de R$ 750 mil
3. **Quanto você tem disponível hoje para dar de lance?** nada · até R$ 100 mil · R$ 100–250 mil · R$ 250–350 mil · acima de R$ 350 mil
4. **Para quando você quer o bem?** o quanto antes · 3 a 6 meses · 6 a 12 meses · sem pressa
5. Máquinas: **Você é:** produtor rural · empresa de obra/terraplanagem · prestador de serviço com máquina · outro.
   BMW: **Compra no:** CPF · CNPJ
6. Nome · WhatsApp · Estado/cidade · Melhor horário para a videochamada

**Regra de prioridade do SDR:** planos 696 e 902 só ficam "quentes" com lance disponível ≥ R$ 250 mil. Abaixo disso, o SDR oferece o plano 306.

## Pendências
- [x] Mídias escolhidas e criativos renderizados (15/10/2026)
- [ ] Páginas `/lp/credito-bmw` e `/lp/credito-maquinas` no moveconconsorcio.com com o formulário acima
- [ ] Pixel + API de Conversões com evento Lead
- [ ] Automação do SDR (n8n → WhatsApp oficial → agenda da videochamada)
- [ ] Música livre de direitos nos vídeos (opcional; os vídeos saem sem áudio)
