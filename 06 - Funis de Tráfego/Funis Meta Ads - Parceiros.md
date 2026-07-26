---
tags: [trafego, funil, meta-ads, parceiros, prioridade, status/em-andamento]
---
# 🧲 Funis Meta Ads — Prospecção de Parceiros (B2B)

Dois funis de tráfego pago no Facebook/Instagram para recrutar **parceiros/representantes** entre quem já opera no mercado.
Relacionado: [[00 - Funil Cadastro de Representantes]] · [[Arquitetura do Site]] · [[Mapa de Páginas]] · [[Posicionamento & Credibilidade]]

## Objetivo
Captar donos de operação como parceiros MOVECON. Os grupos são administrados pela Alpha Administradora de Consórcio Ltda. Dois públicos:
- **Funil A** — empresas/escritórios de consórcio que já existem.
- **Funil B** — concessionárias e revendas de carro.

---

## Arquitetura compartilhada
```
Meta Ads (Reels/Feed/Stories)
   → Destino: LP dedicada /lp/ (ou Formulário instantâneo)
      → Lead → distribuição round-robin no WhatsApp
         → SDR/comercial qualifica
            → reunião / proposta
               → fechamento → onboarding (Trilha Comum + trilha Representante)
```

### Destino: LP dedicada vs. Formulário instantâneo
- **LP dedicada (`/lp/`)** — mais qualificado, carrega credibilidade, ativa pixel/retargeting. **Recomendado** pra parceiro de maior valor.
- **Lead Ads (form instantâneo)** — mais volume e mais barato, menos qualificado. Bom como teste de topo em paralelo.
- Estratégia: LP como principal + um conjunto rodando Lead Ads pra comparar CPL e qualidade.

---

## 🏢 Funil A — Empresas de consórcio existentes
**Quem:** escritórios/pontos de venda, corretores autônomos e representações que já vendem consórcio de outras administradoras.
**Insight/dor:** já vendem, mas dependem da estrutura de terceiros, com comissão apertada e sem marca própria.
**Oferta MOVECON:** estrutura de administradora (Alpha/Bacen), comissão melhor, marca, geração de leads, plataforma de treinamento e CRM.
**Gancho:** *"Você já vende consórcio? Está na hora de ter sua própria estrutura."*

- **Segmentação:** interesses (consórcio, marcas de administradoras, empreendedorismo, gestão de vendas) · comportamento (donos/admins de página de negócio) · **lookalike** da base/CRM atual · geo · qualificação no próprio criativo.
- **Criativos:** Reels UGC falando com o dono ("se você já vende consórcio...") · carrossel comparando comissão/estrutura · depoimento de parceiro.
- **LP `/lp/parceria-consorcio`:** headline pro dono de operação · benefícios (comissão, marca, Alpha/Bacen, leads, treinamento, CRM) · prova · formulário (nome, empresa, cidade, volume atual) · CTA WhatsApp.
- **Qualificação:** volume mensal, tamanho da carteira, estrutura atual, região.

## 🚗 Funil B — Concessionárias de carro
**Quem:** donos e gerentes de concessionárias e revendas (novos e seminovos).
**Insight/dor:** perdem venda quando o cliente tem financiamento negado (score/juros) e vai embora sem comprar.
**Oferta MOVECON:** oferecer consórcio recupera essa venda, gera **comissão recorrente**, sem risco e sem custo — a MOVECON cuida do processo.
**Gancho:** *"Quantas vendas você perde por mês quando o banco nega o financiamento?"*

- **Segmentação:** interesses (setor automotivo, revenda de veículos, concessionária) · comportamento (donos de negócio no automotivo) · cargos (gerente de vendas / F&I, onde disponível) · **lookalike** · geo · qualificação no criativo.
- **Criativos:** Reels falando com o dono da loja (a dor da venda perdida) · carrossel do modelo de parceria · "calculadora" de comissão por venda.
- **LP `/lp/concessionaria-parceira`:** headline pro lojista · dor (venda perdida no crédito negado) · solução (consórcio como recuperação + comissão) · como funciona (fácil, sem risco) · credencial "com grupos administrados pela Alpha Administradora de Consórcio Ltda." · formulário (nome, loja, cidade, vendas/mês) · CTA.
- **Qualificação:** tipo de loja, volume de vendas, já oferece consórcio?

---

## Setup Meta Ads (comum aos dois)
- **Objetivo de campanha:** Cadastros/Leads (evento Lead via Pixel + CAPI).
- **Estrutura:** 1 campanha por funil (A e B) · conjuntos por público (interesse · lookalike · retargeting · Advantage+ como teste) · 3-5 criativos por conjunto.
- **Orçamento:** teste inicial (ex. R$ 50-100/dia por funil), escalar pelo CPL e pela qualidade do lead.
- **Criativos:** priorizar Reels/vídeo com gancho nos 3s que **qualifica o público** (chama o dono pelo nome do negócio).
- **Rastreamento:** Pixel + Conversions API no site · eventos Lead, ViewContent, Contact.
- **Retargeting:** quem visitou a LP e não converteu + engajadores dos criativos → anúncio de prova/depoimento.
- **Distribuição:** leads caem no round-robin do WhatsApp e o SDR qualifica.

## Compliance (Meta)
- Enquadrar como **parceria/oportunidade de negócio**, não "vaga de emprego" (evita categoria especial Emprego e mantém segmentação aberta).
- **Sem promessa de renda garantida / ganhos ilimitados.**
- Sem "contemplação garantida" em qualquer peça.

## Onde o site entra no funil (resposta direta)
1. **Destino do anúncio:** as LPs `/lp/parceria-consorcio` e `/lp/concessionaria-parceira` (noindex, 1 objetivo) — a camada de conversão.
2. **Backstop de confiança:** o parceiro vai pesquisar "MOVECON" antes de fechar. As páginas institucionais (`/administrado-pela-alpha`, `/regulamentacao`, `/sobre`) fecham a credibilidade B2B.
3. **Dados:** Pixel + CAPI no site alimentam otimização e retargeting.
> Sequência obrigatória: **LPs + institucional no ar → pixel instalado → só então escalar verba.** Rodar ads sem o site pronto queima orçamento.

## KPIs
CPL · taxa lead→reunião · reunião→fechamento · CAC por parceiro · tempo de resposta ao lead.

## Pré-requisitos e próximos passos
- [ ] Publicar as 2 LPs + institucional e instalar Pixel/CAPI.
- [ ] Definir orçamento de teste por funil (kickoff).
- [ ] Escrever a copy das 2 LPs e os 3 primeiros criativos de cada funil.
