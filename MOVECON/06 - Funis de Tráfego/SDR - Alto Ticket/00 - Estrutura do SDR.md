---
tags: [sdr, comercial, alto-ticket, bmw, maquinas, status/rascunho]
criado: 2026-10-15
---
# SDR — Alto ticket (BMW e Máquinas)

**Rascunho para o Samuel corrigir.** O que depende de regra da Alpha está marcado **[CONFIRMAR]**.
Relacionado: [[01 - Roteiro e Quebra de Objeções]] · [[BRIEFING]] (campanhas e criativos)

## Papel do SDR

O SDR **não vende**. Ele faz três coisas, nesta ordem:
1. **Responder rápido** (até 5 minutos do formulário).
2. **Qualificar**: confirmar bem, carta, lance disponível, prazo e quem decide.
3. **Agendar a videochamada** com o Samuel (closer), com quem decide presente.

Sucesso do SDR = **videochamada realizada com lead qualificado**, não mensagem enviada.

## Fluxo

```
Anúncio → LP /lp/credito-bmw/ ou /lp/credito-maquinas/ → formulário
   → lead salvo no WordPress (menu "Leads") + e-mail + webhook
      → SDR chama no WhatsApp (≤ 5 min)
         → qualifica → agenda videochamada (Google Meet)
            → lembretes (D-1, 1 h antes, 10 min antes)
               → Samuel fecha na videochamada
                  → adesão digital pela Alpha
```

## O que chega do formulário

| Campo | Para que serve |
|---|---|
| Carta (306 / 696 / 902 / outro) | Plano de partida da conversa |
| Bem | Personalizar a abordagem (X6, retro, trator…) |
| **Lance disponível hoje** | Define a prioridade (abaixo) |
| Prazo para ter o bem | Urgência |
| Perfil (CPF/CNPJ · produtor/obra/prestador) | Argumento e documentação |
| Cidade/UF, melhor horário | Agendamento |
| Criativo (`utm_content`) | Qual anúncio ele viu: o SDR cita o mesmo plano |

### Prioridade (calculada sozinha pelo site)

| Carta | Quente | Morno | Frio |
|---|---|---|---|
| R$ 902 mil (lance do bolso R$ 322 mil) | lance > R$ 350 mil | R$ 250–350 mil | abaixo → oferecer 696 ou 306 |
| R$ 696 mil (lance do bolso R$ 248 mil) | lance ≥ R$ 250 mil | R$ 100–250 mil | abaixo → oferecer 306 |
| R$ 306 mil | quer o bem em até 6 meses | mais de 6 meses | — |

**Quente**: liga/manda áudio na hora e agenda para hoje ou amanhã.
**Morno**: qualifica a fundo antes de agendar (pode virar quente com lance embutido ou outro plano).
**Frio**: não descarta — reposiciona para o plano que cabe e agenda se aceitar.

## Cadência de contato (sem resposta)

| Quando | Canal | Mensagem |
|---|---|---|
| T + 0 a 5 min | WhatsApp (modelo aprovado) | Abertura (roteiro §1) |
| T + 30 min | WhatsApp | Áudio curto de 20 s, se o número aceitar |
| T + 3 h | WhatsApp | Lembrete com o valor do plano que ele escolheu |
| D + 1, no horário que ele indicou | Ligação + WhatsApp | "Tentei te ligar…" |
| D + 2 | WhatsApp | Pergunta de sim/não ("ainda faz sentido para você?") |
| D + 4 | WhatsApp | Encerramento educado (deixa a porta aberta) |

Depois disso, o lead vai para a lista de nutrição (remarketing + mensagem mensal). **Nunca** mais de 1 mensagem por dia depois do D + 1.

## Agendamento da videochamada

- Oferecer **2 horários** dentro do período que ele marcou (manhã/tarde/noite). Nunca "qual horário fica bom?".
- Duração: **20 a 30 minutos**, Google Meet, convite com o nome dele.
- **Quem decide precisa estar**: cônjuge, sócio, pai no agro. Perguntar sempre.
- Confirmações: na hora do agendamento, D-1 à noite, 1 h antes e 10 min antes (com o link).
- No-show: remarcar em até 15 min depois do horário (roteiro §6).

## Passagem para o Samuel (resumo do lead)

O SDR manda este cartão antes de cada videochamada:

```
🟢 QUENTE · Máquinas · R$ 696 mil
Nome: João Silva — Luís Eduardo Magalhães/BA
Bem: trator ~200 cv · quer em 3 a 6 meses
Lance disponível: R$ 250–350 mil (+ 30% embutido)
Perfil: produtor rural · decide com o filho (vai estar na call)
Hoje usa: aluga / financiou no banco / já teve consórcio
Objeção principal: "Finame é mais barato"
Videochamada: qui 16/10 · 19h · link do Meet
Criativo: maq-v2-696
```

## Regras que o SDR nunca quebra

1. **Nunca prometer data de contemplação.** Lance aumenta a chance; não garante.
2. **Nunca pedir pagamento, Pix ou dados de cartão.** Qualquer pagamento é boleto/contrato da administradora, na adesão.
3. **Nunca chamar a MOVECON de administradora.** A MOVECON é plataforma; os grupos são da **Alpha Administradora de Consórcio Ltda.**, autorizada pelo Banco Central.
4. **Nunca chamar consórcio de investimento** nem prometer "valorização".
5. Se perguntarem custo: **sem juros, com taxa de administração** — dizer na conversa, sem esconder. O valor exato vem por escrito na videochamada.
6. Dúvida de regra (uso em seminovo, reajuste, lance parcelado): "vou confirmar e te mando por escrito" — **nunca chutar**.

## Automação (próximo passo de construção)

| Peça | Como |
|---|---|
| Entrada | Formulário → plugin `movecon-leads` → webhook (opção `mv_leads_webhook`, já pronta no site) |
| Orquestração | n8n recebe o lead e dispara a cadência |
| WhatsApp | **WhatsApp Business API oficial** (Cloud API). A 1ª mensagem precisa ser **modelo aprovado pela Meta** |
| Conversa | Agente de IA com este roteiro e a base de objeções; passa para humano em pedido explícito, irritação ou pergunta fora da base |
| Agenda | Google Calendar do Samuel: consulta horários livres, cria o evento com Meet e manda o convite |
| Lembretes | n8n agenda D-1, 1 h e 10 min |
| Painel | Status do lead atualizado no WordPress (novo → contatado → qualificado → agendado → realizado → fechado/perdido) |

Decisões pendentes para montar: número de WhatsApp da MOVECON para a API, conta do Google Calendar do Samuel, onde roda o n8n (VPS da MOVECON ou o do CRM).

## Métricas da semana

| Métrica | Meta inicial |
|---|---|
| Tempo até o 1º contato | ≤ 5 min |
| Taxa de resposta | ≥ 60% |
| Lead → videochamada agendada | ≥ 30% |
| Agendada → realizada (show) | ≥ 70% |
| Realizada → fechada | medir nas 2 primeiras semanas |
