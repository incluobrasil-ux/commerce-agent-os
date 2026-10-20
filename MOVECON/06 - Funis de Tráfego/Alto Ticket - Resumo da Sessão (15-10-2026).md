---
tags: [trafego, meta-ads, alto-ticket, bmw, maquinas, sdr, resumo]
sessao: 2026-10-15
atualizado: 2026-10-19
---
# Alto ticket (BMW e Máquinas) — tudo o que foi feito na sessão de 15/10/2026

Funil montado: **Meta Ads (Brasil todo) → página com formulário por segmento → SDR no WhatsApp → videochamada → fechamento pelo Samuel.**

Arquivos de apoio:
- [[BRIEFING]] (campanhas e criativos)
- [[00 - Estrutura do SDR]]
- [[01 - Roteiro e Quebra de Objeções]]

---

## 1. Mineração da Biblioteca de Anúncios (Meta)

16 buscas no Brasil, só anúncios ativos, cerca de 550 anúncios lidos. Ferramenta: `C:\Users\samue\ferramentas\biblioteca_anuncios.py`.
Dados brutos e capturas: `C:\Users\samue\pesquisas\consorcio-bmw-maquinas\`.

**Conclusão principal:** quase não há concorrência em **consórcio de BMW carro de ticket alto**. Os cerca de 240 anúncios de "consórcio BMW" são, em grande parte, de **moto** (BMW Motorrad) e de concessionárias locais. Linha amarela e retroescavadeira também têm pouca gente (cerca de 50 anúncios).

| Quem está escalado | Sinal | O que copiar como padrão |
|---|---|---|
| Modelo "Para quem entende de valor e não de pressa" (BS Capital, Faz Consórcio, G&G — Embracon) | ~150 anúncios, até 15 cópias, 302 dias | Vídeo vertical com o bem + crédito + parcela na tela, formulário |
| Âncora Consórcios (BMW Motorrad, XCMG, Yanmar) | 121 a 262 dias rodando | Imagem com parcela gigante, "sem entrada", WhatsApp |
| Consórcio New Holland | ~16 anúncios, várias versões | Valor exato do crédito por modelo de trator |
| Jeferson CON (BMW moto) | 5 cópias, 66 dias | Consultor falando para a câmera, "30% embutido sem tirar do bolso" |
| Meu Consórcio BMW (Haus Motors) | ~38 anúncios | O único com BMW carro: parcela + lance embutido + lance parcelado |

**Descartados:**
- **Prospecty:** promete contemplação no 1º mês.
- **ARN, BN e FM:** compram cotas de consórcio, não vendem.
- **Promova:** agência vendendo leads para representantes.

## 2. Planos e valores (iguais em criativo, página e SDR)

| Carta | Crédito (30% embutido) | 1ª parcela | Demais | Lance do bolso | **Lance livre** (bolso + 10%) |
|---|---|---|---|---|---|
| R$ 437.183,05 | **R$ 306.028,13** | R$ 16.620,70 | 120x R$ 3.478,40 ou 60x R$ 6.956,80 | — | **R$ 120.225,34** ⚠️ estimativa (27,5% da carta) |
| R$ 994.591,43 | **R$ 696.214,00** | R$ 37.812,18 | 79x R$ 7.704,86 | R$ 248.647,85 | **R$ 273.512,64** |
| R$ 1.289.689,97 | **R$ 902.782,97** | R$ 49.031,20 | 79x R$ 9.990,72 | R$ 322.422,49 | **R$ 354.664,74** |

Bem ilustrativo de cada plano (preço de referência em out/2026):

| Crédito | BMW | Máquinas |
|---|---|---|
| R$ 306 mil | Série 3 (0 km ≈ R$ 337–390 mil → seminova ou 0 km com complemento) | Trator 4x4 ~90 cv |
| R$ 696 mil | X3 (≈ R$ 516–654 mil) | Trator ~200 cv (NH T7 ≈ R$ 686 mil) |
| R$ 902 mil | X6 (≈ R$ 888 mil) | 2 retroescavadeiras 0 km (≈ R$ 415 mil cada) |

## 3. Estrutura das campanhas

- **Campanha 1:** `[MOVECON] Leads | BMW | LP` → `/lp/credito-bmw/`
- **Campanha 2:** `[MOVECON] Leads | Maquinas | LP` → `/lp/credito-maquinas/`
- **Configuração comum:**
  - objetivo **Cadastros**, conversão no site, evento **Lead** (Pixel + API de Conversões);
  - 1 conjunto por campanha: Brasil, 28–65+, público Advantage+ aberto, posicionamentos Advantage+;
  - se o Gerenciador pedir categoria especial de serviços financeiros, marcar.
- **Orçamento de teste:** R$ 100/dia por campanha, 7 dias sem mexer, cortando pelo custo por **lead qualificado**.
- **Nomes:** nome do anúncio = id do criativo, e `utm_content` = id do criativo.

## 4. Criativos (6 peças, 3 por campanha)

Pasta: `06 - Funis de Tráfego/Criativos/alto-ticket/`. Gerados por `python criativos.py` (ou `python criativos.py <id>`), saída em `out/`.

| Id | Formato | Bem | Música |
|---|---|---|---|
| `bmw-v1-902` | Vídeo 9:16, 15 s | X6 (fotos atuais em movimento) | Brazilian Phonk |
| `bmw-v2-696` | Vídeo 9:16, 15 s | X3 (fotos atuais em movimento) | Luxury trap |
| `bmw-i1-306` | Imagem 4:5 | Série 3 branca | — |
| `maq-v1-902` | Vídeo 9:16, 15 s | Retroescavadeiras (vídeo real) | Country southern rock |
| `maq-v2-696` | Vídeo 9:16, 15 s | Trator grande (vídeo real) | Country rock |
| `maq-i1-306` | Imagem 4:5 | Trator 4x4 John Deere | — |

**Roteiro dos vídeos:**

| Tempo | Cena |
|---|---|
| 0–3,6 s | Abertura já com crédito e parcela; o 1º quadro vira a capa no feed |
| 3,6–7,8 s | Como funciona (prazo, 1ª parcela, 30% embutido, sem juros) |
| 7,8–11,8 s | "Quer antecipar a liberação do crédito?" + lance livre |
| 11,8–15 s | Tela final MOVECON + "Toque em Saiba mais" |

**Mídia:**
- **Origem:** bancos de uso comercial livre (Pexels, Pixabay, Unsplash; músicas do Pixabay Music). Origem e link de cada arquivo em `midia/CREDITOS.md`.
- **Placas:** as legíveis (X6 #73 e X3 #37) foram cobertas com tarja preta.
- **BMW em foto, não em vídeo:** vídeo de banco da BMW atual praticamente não existe; por isso os vídeos da BMW usam fotos com movimento.
- **Música:** volume normalizado em −14 LUFS, com o trecho de mais energia escolhido automaticamente. Há 2 faixas reservas.

**Decisões do Samuel nos criativos:**
- sem bloco de aviso legal na arte (fica só o selo "Imagem ilustrativa");
- só "Sem juros", sem "com taxa de administração";
- valores já na abertura de todos os vídeos;
- um único valor de lance na tela: o lance livre, com "+ 30% de lance embutido na própria carta";
- nas imagens: "Lance livre: R$ X para antecipar a liberação do crédito".

**Alertas:**
- **Vídeo de terceiro:** comercial de montadora ou vídeo de YouTube não pode entrar no anúncio, mesmo como "ilustrativo". A Meta derruba por direito autoral.
- **Música em alta:** as músicas comerciais em alta nos Reels não são liberadas para anúncio de empresa.
- **Tamanho:** a pasta `midia` tem 213 MB; avaliar antes de versionar no Git.

## 5. Páginas com formulário (site da MOVECON)

| Página | ID no WordPress | Status |
|---|---|---|
| `moveconconsorcio.com/lp/credito-bmw/` | 463 | **Rascunho** |
| `moveconconsorcio.com/lp/credito-maquinas/` | 464 | **Rascunho** |

- **Visibilidade:** fora do Google, sem menu e sem rodapé de navegação, pela regra automática de `/lp/`.
- **Conteúdo:** os 3 planos em cards, o formulário, "como funciona" e as dúvidas comuns.
- **Plano marcado:** quem chega pelo anúncio cai com o plano do criativo já selecionado.
- **Formulário (6 perguntas):**
  - carta (306 / 696 / 902 / outro) e bem;
  - quanto tem disponível para lance hoje;
  - para quando quer o bem;
  - perfil — BMW: CPF ou CNPJ; máquinas: produtor, obra, prestador ou outro;
  - nome, WhatsApp, estado, cidade e melhor horário, mais o aceite de contato com link para a política de privacidade.
- **Para onde vai o lead** (plugin `movecon-leads.php`, já no servidor):
  - salvo no painel do WordPress, menu **"Leads"**, com prioridade quente, morno ou frio;
  - e-mail de aviso para `mv_leads_email` (não configurado → vai para `incluobrasil@gmail.com`);
  - repasse em JSON para `mv_leads_webhook` (vazio; é onde o n8n do SDR vai entrar);
  - proteção contra robô e limite de 5 envios a cada 10 minutos por IP.
- **Teste de ponta a ponta:** feito em 15/10. O lead foi salvo como "quente" e o WhatsApp normalizado; o lead de teste já foi apagado.
- **Código:** `C:\projetos-incluo\movecon-site\05 - Site\`
  - `scripts/gerar_lps_credito.py`
  - `_codigo/movecon-leads.php`
  - `_codigo/movecon.css` (bloco "LPs de alto ticket")
  - `scripts/portar_mapa.py` (rotas registradas como "planejada")
  - registro em `HANDOFF.md`
- **CSS publicado:** foi o CSS que estava no ar + o bloco novo. O CSS local estava sem o ajuste do banner de 26/08, que agora também está no arquivo local.

## 6. SDR

Pasta: `06 - Funis de Tráfego/SDR - Alto Ticket/` (rascunho para o Samuel corrigir).

- **Estrutura** (`00 - Estrutura do SDR.md`):
  - papel do SDR: responder em até 5 minutos, qualificar e agendar a videochamada;
  - tabela de prioridade e cadência de mensagens até o D+4;
  - agendamento com 2 horários, lembretes D-1 / 1 h / 10 min e roteiro para não comparecimento;
  - resumo do lead para o closer e regras que o SDR nunca quebra;
  - desenho da automação (n8n + WhatsApp API oficial + Google Calendar) e metas da semana.
- **Roteiro** (`01 - Roteiro e Quebra de Objeções.md`):
  - mensagens prontas de abertura, qualificação, convite, lembretes, sem resposta e não comparecimento;
  - cerca de 20 objeções em 5 grupos: confiança, prazo, dinheiro, decisão e uso do crédito;
  - 8 itens **[CONFIRMAR]** com a Alpha.

---

## 7. Pendências (em ordem)

### Para publicar as páginas e ligar a campanha
1. **Trava LGPD do site.** Publicar e reescrever a **política de privacidade** (`/politica-de-privacidade/` ainda não existe e o formulário já aponta para ela) e configurar o **banner de consentimento**. Só então tirar as páginas do rascunho.
2. **ID do Pixel da Meta** para instalar e disparar o evento Lead (o formulário já chama `fbq('track','Lead')` quando o pixel existir).
3. **E-mail que recebe os leads** (opção `mv_leads_email`).

### Conteúdo a corrigir
4. **Vocabulário "plataforma":** decisão de 20/08 (pedido do Kaio, commit `ff73290` no vault) tirou "plataforma" e o vocabulário de golpe do site, trocando por "autorizada pela Alpha Administradora de Consórcio Ltda., que administra os grupos". Ainda dizem "plataforma de consórcio":
   - a FAQ "Quem administra os grupos?" das duas páginas (`gerar_lps_credito.py`);
   - a regra 3 do `00 - Estrutura do SDR.md`;
   - a resposta "Isso é golpe?" do roteiro, que também usa a palavra "golpe";
   - o aviso do `criativos.py` e do `BRIEFING.md`.

   O próprio commit registra que "autorizada pela Alpha" ainda depende de confirmação jurídica.
5. **Lance livre do plano de R$ 306 mil** (R$ 120.225,34 é estimativa).
6. **Itens [CONFIRMAR] com a Alpha:**
   - composição da 1ª parcela;
   - taxa de administração, fundo de reserva e seguro;
   - índice de reajuste;
   - lance parcelado;
   - uso do crédito em seminovo, usado ou implemento;
   - desistência e transferência;
   - dia das assembleias.
7. **Correções do Samuel no roteiro do SDR.**

### Para automatizar o SDR
8. Número de WhatsApp da MOVECON para a API oficial e aprovação do modelo da 1ª mensagem.
9. Agenda Google do Samuel para as videochamadas.
10. Onde roda o n8n (VPS da MOVECON ou o do CRM). Depois, preencher `mv_leads_webhook` e `mv_leads_webhook_token`.

### Organização
11. **GitHub (19/10/2026):** tudo desta sessão foi para o repositório **privado** `incluobrasil-ux/movecon-site`, na branch `campanha/alto-ticket`: código do site, página da campanha, criativos finais, fotos, músicas e SDR. Os clipes de vídeo brutos (`midia/**/*.mp4`, ~200 MB) ficaram fora do Git e são re-baixáveis pelos links de `midia/CREDITOS.md`. O vault `commerce-agent-os` **não** recebeu push: ele é **público** e a branch dele tem 127 commits de outros trabalhos ainda não enviados.
