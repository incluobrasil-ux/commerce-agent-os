# Teardown de SEO de 6 Consórcios Brasileiros + Padrões Replicáveis para a MOVECON

> Fonte: pesquisa aprofundada (jul/2026) sobre Embracon, CAIXA Consórcio, Tradição, Evoy, Âncora e HS Consórcios.
> USO NESTE PROJETO: fonte de PADRÕES e KEYWORDS. As URLs citadas são dos concorrentes ou sugestões genéricas — a arquitetura de URLs da MOVECON é definida EXCLUSIVAMENTE pelo keyword-map.json do repositório. Nenhuma URL deste relatório deve ser criada se colidir com rota existente.

## Resumo executivo

- O "molde" vencedor no setor: uma página-pilar por modalidade de bem com URLs limpas, simulador usado como hub central de conversão (destino de quase todos os CTAs e links internos), blog de fundo/meio de funil ancorado em clusters como "consórcio vale a pena", "consórcio x financiamento", "carta de crédito" e "como funciona o lance", e selos E-E-A-T (autorização do Banco Central, ABAC, Reclame Aqui) no rodapé de todas as páginas.
- Embracon e CAIXA são benchmarks de escala; Tradição, Evoy, Âncora e HS são os benchmarks realistas. Todos convergem para a mesma arquitetura de 5 modalidades + FAQ + simulador.
- Maiores oportunidades: SEO local por cidade (quase inexistente fora da Embracon), pilares de nicho (agro, náutico, pesados, energia solar), fundo de funil bem estruturado, e AEO/dados estruturados (FAQPage schema, FAQ por URL) — só a Evoy está bem posicionada; nenhum dos 6 usa llms.txt.

## Principais achados transversais

1. **Arquitetura convergente:** todos organizam por modalidade (Imóveis, Carros, Motos, Pesados, Serviços). Evoy e HS estendem para nichos (viagens, eletroeletrônicos, estética, festas; náutico, máquinas agrícolas, energia solar).
2. **Slug padrão-ouro dos concorrentes:** `/consorcio-de-[bem]` (Embracon) ou slug curto `/imoveis/` (HS, Tradição). CAIXA é contraexemplo negativo: taxonomia inconsistente.
3. **Simulador como hub:** CTA "Simular" dominante, repetido várias vezes por página (Embracon: ~6 CTAs na página de imóveis), sempre para rota única.
4. **Blog como diferencial de escala:** Embracon com blog massivo (paginação até page 82), organizado por tags/clusters, fundo de funil forte. Os menores têm blog fraco (Evoy modesto; Tradição e Âncora apostam em FAQ on-page).
5. **E-E-A-T padronizado:** CNPJ + "Autorizado pelo Banco Central Nº [...]" no rodapé; selos ABAC, Banco Central e Reclame Aqui (Âncora: RA1000 + ISO 9001; Tradição: Prêmio RA 2025); tempo de mercado como âncora (Embracon 37 anos; Âncora desde 1989; Tradição desde 2002; HS desde 1993).
6. **Maior gap coletivo:** dados estruturados/AEO. Evoy tem a melhor estrutura (uma URL por pergunta em /contato/duvidas-frequentes/...); CAIXA tem Central de Ajuda com URL por pergunta. Schema JSON-LD provavelmente subutilizado por todos. Nenhum llms.txt.

Contexto de mercado (Anuário ABAC 2026, dados 2025): créditos comercializados ultrapassaram R$ 500,27 bi (+32,1% vs 2024), 12,76 mi de participantes ativos; imóveis acima de R$ 283 bi. Setor em forte alta.

## Análise por concorrente

### 1. Embracon (embracon.com.br) — benchmark de escala

- Stack Next.js. Slugs: /consorcio-de-imoveis, /consorcio-de-carros, /consorcio-de-motos, /consorcio-de-veiculos-pesados, /consorcio-de-servicos. Hub simulador em /consorcio. Apoio: /carta-de-credito, /conhecaoconsorcio/o-que-e-consorcio, /a-embracon, /governanca, /guia-do-contemplado.
- **SEO local/programático (o mais forte do grupo):** páginas de filial por cidade/bairro (/filiais/rio-de-janeiro, /filiais/ipiranga...), franquias por cidade, página de vendedores (/nossos-consultores). Site cita "mais de 120 filiais"; material institucional cita ~90 próprias (divergência).
- **Blog massivo** (paginação até 82), tags/clusters (/blog/tags/consorcio-x-financiamento), fundo de funil ("vale a pena investir em consórcio", "como funciona o lance", "15 dúvidas sobre consórcio de imóveis"). RISCO observado: slugs quase duplicados para mesma modalidade (/consorcio-de-carro, /consorcio-de-veiculos, /consorcio-de-automoveis) — anti-padrão a evitar.
- On-page: Title "Consórcio de Imóveis - Embracon"; meta com benefício+CTA; H1 "Simule e compre seu consórcio online"; blocos de vantagens ("Sem Juros", "Quite seu financiamento") + cross-sell de modalidades no fim.
- E-E-A-T: rodapé com CNPJ + autorização Bacen com nº e data; seção robusta de prevenção à fraude; fusão com CNP Consórcio (out/2025) — ~500 mil clientes combinados, top 5 do setor. Blog em geral sem autor identificado (gap).
- Rankeia para: "consórcio de imóveis", "consórcio Embracon vale a pena", "como funciona o lance", "consórcio de carros".

### 2. CAIXA Consórcio (caixaconsorcio.com.br) — escala/marca (operado pela XS5 Administradora)

- Apenas 3 pilares: /consorcio-de-veiculos-leves/, /consorcio-de-veiculos-pesados/ (absorve agro), /consorcio-imobiliario (slug inconsistente). Sem pilar de agro dedicado (gap).
- **AEO forte:** Central de Ajuda com hub, categorias e UMA URL POR PERGUNTA (/central-de-ajuda/preciso-ter-conta-na-caixa-para-fazer-consorcio/). FAQ on-page nos pilares.
- Blog em domínio separado (blogcaixaconsorcio.com.br) com clusters de imóveis, veículos, agro, "como funciona".
- Sem SEO local. Stack parcialmente React; WAF agressivo.

### 3. Consórcio Tradição (consorciotradicao.com.br) — benchmark realista

- Next.js; slugs curtos: /automoveis, /imoveis, /motos, /pesados, /servicos; /quem-somos; /perguntas-frequentes-sobre-consorcio/.
- **FAQ on-page muito completa na home** (o que é consórcio, tipos de lance com exemplos numéricos, reajuste IPCA, desistência) — material ideal para FAQPage schema.
- Prova social: depoimentos nominais com foto; patrocínios de futebol (Santos, Fortaleza, CSA).
- Rodapé: razão social + CNPJ + certificado Bacen com nº/data + "não comercializa cotas contempladas". Selos RA "Verificada"/"Ótimo" e Prêmio RA 2025. Blog fraco — aposta em FAQ on-page.

### 4. Evoy Consórcios (evoyconsorcios.com.br) — benchmark realista, líder em AEO

- Arquitetura ampla em nichos: /consorcios-carros, -imoveis, -motos, -pesados, -servicos, -viagens, -eletroeletronicos, -procedimentos-esteticos, -festas-eventos. Hub simulador: /credito-personalizado.
- **Melhor AEO do setor:** hub de Dúvidas Frequentes com UMA URL POR PERGUNTA (/contato/duvidas-frequentes/como-funciona-o-consorcio-evoy, /e-vale-a-pena-fazer-um-consorcio...). Blog com categorias (Negócios, Investimentos). Agente de IA próprio (Consorciopédia/Ivy).
- E-E-A-T: governança detalhada (compliance, LGPD, PLD/CFT, demonstrações financeiras), selos Bacen/ABAC/GPTW, dezenas de logos de imprensa, depoimentos em vídeo, logo do Banco Central ao lado do formulário de simulação (confiança no ponto de conversão).

### 5. Âncora Consórcios (ancoraconsorcios.com.br) — benchmark realista

- Simulador embutido na home (form multi-modalidade). Slugs em dois padrões (inconsistência a evitar): /imoveis, /carros, /motos no rodapé vs /consorcio/consorcio-de-servicos etc.
- **FAQ on-page gigante na home** (tipos de lance, contemplação, reajuste INCC/IGPM, FGTS, desistência) — ideal para FAQPage schema.
- E-E-A-T mais forte entre os menores: "36 anos", "150 mil+ bens entregues", "97 mil+ cotas ativas", "500+ contemplações/mês"; RA1000, ISO 9001, GPTW, Bacen, ABAC. Administradora oficial de marcas (Kawasaki, Voltz, XCMG, Dafra, Bajaj, CFMOTO, Yanmar) com subdomínios próprios — modelo white-label reverso relevante como referência estrutural.
- Blog fraco; "Âncora é confiável" nas SERPs é dominado por terceiros (iDinheiro, ABAC) — gap de branded SERP.

### 6. HS Consórcios (hsconsorcios.com.br) — benchmark mais parecido com a MOVECON

- Nota: "HP Consórcios" não existe como administradora relevante; o player real é a HS (Grupo Herval, RS).
- **Stack: WordPress + Elementor** — mesmo stack da MOVECON. Slugs curtos: /imoveis/, /veiculos/ (com sub-páginas /veiculos/utilitarios/, /veiculos/caminhoes/), /investimentos/. Apoio: /sobre-nos/, /entenda-mais-sobre-consorcio/, /governanca/, /onde-encontrar/ (SEO local leve), /simulador/, /blog/.
- FAQ on-page na home; CTA "Simule Agora" repetido; disclaimer "não comercializa cotas contempladas".
- E-E-A-T: desde 1993; "maior administradora independente do setor imobiliário, líder no RS, 200 mil+ cotas ativas em 12 estados"; Grupo Herval (65+ anos); cartas de 100 mil a 16 milhões, prazos até 240 meses; selos Bacen/ABAC/RA. Posiciona consórcio como investimento (/investimentos/) — cluster diferenciado; produto "meia parcela" como gancho de conteúdo.

## Mapa de SERP — quem domina o quê

- **"consórcio de imóveis"/"de carros" (transacional genérico):** bancos e grandes (BB, Caixa, Sicoob, Rodobens, Embracon, Mycon). Difícil para player pequeno no curto prazo.
- **"simulador de consórcio":** agregadores (iDinheiro, Serasa, Kittium) e bancos — oportunidade de nicho com simulador próprio otimizado.
- **"[marca] é confiável"/"vale a pena":** dominado por terceiros; as próprias administradoras não defendem o branded SERP — GAP claro (criar página "MOVECON é confiável" desde o dia 1).
- **"carta de crédito contemplada"/"consórcio contemplado":** dominado por corretoras (Ademicon, DP, Tramontana) e Serasa — cluster de alto volume pouco defendido pelas administradoras; atacar com conteúdo educativo + disclaimer de não comercialização.
- **Fundo de funil ("como funciona o lance", "consórcio x financiamento"):** Embracon domina; os 4 menores estão ausentes — maior oportunidade de conteúdo.

## Padrões replicáveis (aplicar sobre as rotas EXISTENTES da MOVECON)

### On-page

- Title (pilar): "Consórcio de [Bem] — Sem Juros e Sem Entrada | MOVECON" (≤60 chars).
- Meta description: benefício + CTA + menção à administração pela Alpha autorizada pelo Bacen (≤155 chars).
- H1 transacional com verbo de ação ("Simule seu consórcio de imóveis online").
- Estrutura de blocos: simulação → vantagens (4 cards: sem juros, sem entrada, FGTS quando aplicável, parcela no bolso) → como funciona (4 passos) → carta de crédito → FAQ (respostas diretas na 1ª frase) → cross-sell de modalidades → bloco compliance.
- Linkagem interna: toda página e artigo linka o simulador (hub com maior nº de links internos do site) + 2-3 pilares relacionados.

### Clusters de conteúdo prioritários (keywords extraídas dos concorrentes)

- Decisão: "consórcio vale a pena", "consórcio x financiamento", "consórcio é confiável", "vale a pena investir em consórcio", "consórcio para empresa".
- Mecânica: "como funciona o lance", "tipos de lance (livre, fixo, embutido, FGTS)", "como funciona a contemplação", "o que é carta de crédito", "assembleia".
- Alto valor pouco defendido: "carta de crédito contemplada", "consórcio contemplado", "como comprar carta contemplada".
- Uso do bem: "consórcio para sair do aluguel", "consórcio para reforma", "consórcio de carro usado", "FGTS no consórcio de imóveis", "consórcio para máquinas agrícolas".
- Nichos cauda longa: náutico, energia solar, estética, viagem, festas.

### Schema (maior gap do setor — vantagem competitiva)

- Organization/FinancialService sitewide (MOVECON como plataforma; Alpha como administradora); FAQPage em todo pilar e página educacional; BreadcrumbList com breadcrumbs visíveis; WebSite+SearchAction; Product/Offer no simulador quando houver parcela "a partir de".

### E-E-A-T (adaptado ao modelo MOVECON/Alpha)

1. Rodapé em todas as páginas com a construção aprovada do projeto: MOVECON como plataforma; grupos administrados pela Alpha, autorizada pelo Banco Central (razão social/nº do certificado conforme lista oficial do BCB — validar).
2. Selos: Banco Central + ABAC (verificar associação da Alpha) + Reclame Aqui.
3. Página institucional explicando o modelo e a Alpha (fundada em 1981, Erechim/RS).
4. Disclaimer setorial: não comercializa cotas contempladas nem garante contemplação.
5. Autoria de blog identificada com credencial (gap de quase todos — ganho fácil).
6. Depoimentos nominais, idealmente em vídeo (padrão Evoy).
7. Contato com endereço físico, CNPJ e ouvidoria da Alpha.
8. Cuidado reputacional: há processo administrativo do Bacen envolvendo a Alpha (uso de recursos de grupos) — tom conservador, comunicação factual, monitorar desfecho.

### Gaps onde a MOVECON pode rankear primeiro

1. SEO local por cidade (só Embracon faz bem).
2. Cluster contemplados (dominado por corretoras, não administradoras).
3. FAQPage schema + FAQ por URL + respostas diretas (só Evoy/CAIXA parcialmente) + llms.txt (ninguém tem).
4. Fundo de funil informacional (menores ausentes).
5. Pilares de nicho: agro dedicado, náutico, solar.
6. Branded SERP próprio ("MOVECON é confiável") desde o início.

## Ressalvas

- Schema JSON-LD dos concorrentes não confirmado em código-fonte (verificar com Rich Results Test antes de assumir ausência).
- CAIXA bloqueou fetch direto; detalhes de URL vieram de SERP — alta probabilidade, não 100% verificados.
- Volumes de blog/páginas são estimativas por paginação observada.
- Dados ABAC (R$ 500,27 bi; 12,76 mi participantes) do Anuário/Blog ABAC 2026 — revalidar antes de citar publicamente.
- Números da Embracon divergem entre site (120+ filiais) e material institucional (~90 próprias).
