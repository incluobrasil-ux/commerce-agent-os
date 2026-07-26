---
tags: [site, arquitetura, seo, status/em-andamento]
---
# 🏗️ Arquitetura do Site — MOVECON

Relacionado: [[00 - Briefing do Site]] · [[Posicionamento & Credibilidade]] · [[Mapa de Páginas]] · [[00 - Funil Cadastro de Representantes]]

## 0. Posicionamento do site
A MOVECON é uma **plataforma de consórcio**. Os grupos são administrados pela **Alpha Administradora de Consórcio Ltda.** No site, a MOVECON **é o produto** — não compara nem lista concorrentes; apresenta os próprios grupos e conduz o cliente da simulação à contemplação com segurança.

> [!warning] Regra de precisão (compliance)
> MOVECON = "**plataforma de consórcio. Os grupos são administrados pela Alpha Administradora de Consórcio Ltda.**".
> Ao citar a Alpha: "**Alpha Administradora de Consórcio Ltda. — autorizada pelo Banco Central (Cert. BCB 03/100/213/88 · CNPJ 90.982.679/0001-54)**".
> Nunca "MOVECON autorizada pelo Bacen". Nunca usar "white-label".

> [!success] Decisões batidas em 2026-07-25 (ver [[Decisões]])
> - **Escopo:** nacional (sem camada de páginas de cidade)
> - **CMS:** WordPress
> - **Modelo:** foco no cliente final — recrutamento de representantes fora do institucional

## 1. Camada de confiança (global — em todo o site)
Consórcio é **YMYL** (dinheiro/finanças): o Google só rankeia bem quem prova **E-E-A-T**. Elementos fixos:
- Endereço físico, telefone e **CNPJ da MOVECON** visíveis.
- Equipe com **rosto + nome + certificação ABAC PCA-10**.
- Página-âncora ⭐ `/administrado-pela-alpha` — **concentra** a prova de regulação em vez de espalhá-la.

> [!info] Dosagem da menção ao Banco Central (decidido 25/07/2026)
> A autorização do Bacen **não é elemento recorrente**. Aparece **só onde a Alpha é citada** — e ali completa, com certificado e CNPJ. Sem selo no header, sem faixa repetida entre seções. Ver a tabela de dosagem em [[Posicionamento & Credibilidade]].
- **Área do Consorciado** e 2ª via de boleto (confiança + retenção + busca de marca).
- Schema.org: `Organization` + `FinancialService`, `FAQPage`, `BreadcrumbList`, `Review/AggregateRating`.
- Contemplações e depoimentos **reais** (nunca fabricados).

## 2. SEO orgânico ("dominar o Google")
- **Mapa de intenção por URL (anti-canibalização):** 1 intenção por página.
  - Informacional → **Blog** ("o que é", "vale a pena", "como funciona").
  - Comercial/Transacional → **página de segmento** ("consórcio de carro", "consórcio imóvel FGTS").
  - Navegacional/marca → institucional + Área do Consorciado.
  - Local → camada cidade × segmento.
- **Hub-and-spoke + interlinking:** cada spoke linka pro hub e pro simulador; o hub agrega os spokes.
- **E-E-A-T (YMYL):** autor identificado, citar Bacen/Lei 11.795/08/ABAC, dados atualizados, institucional forte — o que destrava ranqueamento em nicho financeiro.
- **Página-âncora de confiança** (`/administrado-pela-alpha`) recebe links internos de todo o site — concentra autoridade e sinal de marca.
- **Contemplado / carta contemplada:** volume alto, mas minado por golpe — só atacar com conteúdo que reforça segurança.
- **Técnico:** sitemap.xml, schema, Core Web Vitals, mobile-first, canonical, breadcrumbs.

## 3. SEO pago (Google Ads)
- **Search por intenção:** campanhas separadas — marca · genérico · concorrente · local. Cada uma → LP dedicada de `/lp/`.
- **Performance Max / Demand Gen:** com assets e feed; forte pra segmentos visuais (carro, imóvel).
- **Quality Score:** LP dedicada (rápida, 1 objetivo, keyword no H1) rankeia melhor que página institucional.
- **Recrutamento pago:** campanha própria → `/lp/seja-representante` → funil (nunca misturar com campanhas de cliente final).
- **Rastreamento:** GTM, conversões de formulário + clique WhatsApp + simulação.
- **Regra:** nunca apontar anúncio pra página de SEO (protege Quality Score e evita canibalização de métrica).

## 4. Faseamento de implementação
1. Aplicar identidade visual da MOVECON ([[Identidade & Marca]]).
2. Copy de plataforma ("nossos grupos", "com grupos administrados pela Alpha Administradora de Consórcio Ltda.").
3. Publicar a página-âncora `/administrado-pela-alpha` e a de segurança/anti-golpe.
4. Adicionar Área do Consorciado, 2ª via e a seção de Representantes.
5. Montar a taxonomia de URLs de segmento e o blog em clusters.
6. Definir o CMS antes de escalar a camada programática de cidades.

## Próximos passos
- [ ] Fechar as 3 decisões (geografia, CMS, modelo) no kickoff.
- [ ] Escrever a copy da **Home** e da página-âncora **`/administrado-pela-alpha`**.
- [ ] Montar o mapa de palavras-chave por URL (expandir o cluster de segurança).
