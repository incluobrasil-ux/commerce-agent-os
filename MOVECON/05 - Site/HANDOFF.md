# Prompt de continuidade — site MOVECON

> Copie o bloco abaixo inteiro numa sessão nova do Claude Code.
> Estado apurado em 25/07/2026, verificado contra o site no ar, o keyword-map e o git.

---

```
Você vai continuar a construção do site da MOVECON. Leia este briefing inteiro
antes de qualquer ação. Não confie na sua memória do projeto: a fonte da verdade
são os arquivos.

## ONDE ESTÁ TUDO

Vault/repo:  C:\projetos-incluo\commerce-agent-os\MOVECON\
Site no ar:  https://moveconconsorcio.com
Servidor:    ssh -i ~/.ssh/id_ed25519 root@2.24.220.21
             (a chave hostinger_crm NÃO funciona)
WP-CLI:      bash /root/wpcli-movecon.sh <comando wp>
Containers:  movecon_wp + movecon_db em /opt/movecon/
SSL/proxy:   container crm_caddy, config em /opt/crm/infra/Caddyfile
Admin:       https://moveconconsorcio.com/wp-admin (credenciais em
             /opt/movecon/wp-admin-credentials.txt no servidor)

⚠️ O MESMO VPS hospeda o site da CRELIDER e o CRM. NUNCA altere nada deles.
   A Crelider serve só como referência de leitura.

## O QUE A EMPRESA É — COMPLIANCE, NÃO ESTILO

A MOVECON é uma PLATAFORMA de consórcio. NÃO é administradora.
Os grupos são administrados pela Alpha Administradora de Consórcio Ltda.,
administradora autorizada a funcionar pelo Banco Central do Brasil.

Frase-padrão, use exatamente assim:
  "A MOVECON é uma plataforma de consórcio. Os grupos são administrados pela
   Alpha Administradora de Consórcio Ltda., administradora autorizada a
   funcionar pelo Banco Central do Brasil."

NUNCA escreva: "MOVECON autorizada", "nossa administradora", "administradora
MOVECON", "plataforma autorizada pela Alpha", "representante autorizada",
"white-label", "sem nenhuma ocorrência", "ficha limpa", "histórico impecável",
"nunca foi penalizada", "sem qualquer sanção".

Motivo do primeiro grupo: o objeto social registrado é intermediação,
agenciamento e correspondente de instituições financeiras. Não há CNAE de
administração de consórcio. Chamar a MOVECON de administradora contraria o
contrato social.
Motivo do segundo grupo: existe processo público do Bacen envolvendo a Alpha
(PE 202816, multa por infrações de natureza ordinária, autorização mantida).
O site NÃO menciona o processo — é assunto do parceiro. Mas afirmar histórico
limpo transformaria uma omissão legítima em afirmação falsa.

Outras regras invioláveis:
- Nenhuma página promete contemplação, prazo de contemplação ou carta liberada.
- Consórcio NÃO é investimento e não gera rendimento.
- "Sem juros" sempre acompanhado de "há taxa de administração".
- Nenhum número de taxa, prazo ou valor inventado.
- Depoimento e número de operação só entram se forem reais. Hoje não há nenhum.

Dados cadastrais reais:
  MOVECON Intermediações Financeiras Ltda · nome fantasia MOVECON CONSORCIOS
  CNPJ 67.559.635/0001-02
  Av. Rosa Cruz, 926 — Candeias, Vitória da Conquista/BA — 45.028-045
  Alpha: CNPJ 90.982.679/0001-54 · certificado Bacen nº 03/100/213/88
         Av. Sete de Setembro, 483, sala 12 — Erechim/RS — 99700-084

## ARQUITETURA — COMO O PROJETO FUNCIONA

Stack: WordPress + tema Astra. Decisão firme, não migrar para Next.js.
Páginas são blocos <!-- wp:html --> com <div class="mv-page">.
CSS vive no Customizer, NUNCA <style> por página.

FONTE DA VERDADE das URLs: content/keyword-map.json (100 rotas).
Regra central: UMA INTENÇÃO DE BUSCA = UMA URL. Nenhuma página existe sem estar
registrada lá primeiro.

content/
  keyword-map.json    100 rotas: url, keyword, intenção, camada, title,
                      description, pai, indexavel, status, fase
  segmentos.json      conteúdo dos 9 hubs (answer-first, copy, FAQ)
  simuladores.json    parâmetros de cálculo (planos Alpha)
  lps.json            copy das 14 landing pages
  filhas-imoveis.json conteúdo das 8 filhas de imóveis
  faq-map.json        url -> perguntas, lido pelo mu-plugin para o FAQPage schema

scripts/
  portar_mapa.py         gera content/keyword-map.json (edite AQUI, não o JSON)
  check_seo.py           validador. --wp compara mapa x WordPress
  gerar_hubs.py          gera os hubs de segmento
  gerar_simuladores.py   gera os simuladores
  gerar_lps.py           gera as landing pages
  gerar_filhas.py        gera filhas de silo + atualiza faq-map.json

_codigo/  (espelho do que roda no servidor em wp-content/mu-plugins/)
  movecon-seo.php            title, description, OG, schema, /llms.txt, sitemap,
                             robots.txt, noindex de /lp/
  movecon-header-footer.php  header e rodapé da marca; versão mínima em /lp/
  movecon-simulador.php      JS do simulador + eventos GA4
  movecon-fonts.php          Montserrat + Inter

FLUXO PARA PUBLICAR:
  1. registrar a rota em scripts/portar_mapa.py e rodar `python scripts/portar_mapa.py`
  2. escrever o conteúdo no JSON correspondente em content/
  3. rodar o gerador -> sai em build/
  4. scp para /tmp/ no servidor
  5. bash /root/wpcli-movecon.sh post create /host/<arquivo>.html --post_type=page
     --post_status=publish --post_name=<slug> [--post_parent=<id do pai>]
  6. wp post meta update <ID> site-post-title disabled   (evita H1 duplicado)
  7. marcar status no-ar em portar_mapa.py e regerar
  8. python scripts/check_seo.py --wp   (tem que passar)

REGRAS DE OURO DO WORDPRESS AQUI:
- manter sempre o embrulho <!-- wp:html --> ... <!-- /wp:html -->
- toda página com hero recebe `site-post-title disabled`, senão H1 duplica
- CSS global vive no Customizer (wp_update_custom_css_post)
- Rank Math está instalado mas NÃO renderiza nada no frontend com o WordPress 7.0.
  Todo o SEO sai do mu-plugin movecon-seo.php. Se o Rank Math voltar a funcionar,
  desative o mu-plugin para não duplicar tags.

## O QUE JÁ ESTÁ PRONTO — 40 PÁGINAS NO AR

Infra e fundação
  VPS, Docker, Caddy, HTTPS (Let's Encrypt, renova sozinho)
  DNS na Squarespace, e-mail no Google Workspace (MX, SPF, DKIM, DMARC)
  design system do Manual da Marca v1.0 no Customizer (~30 KB)
  header e rodapé da marca, logo e favicon (símbolo isolado)
  Montserrat + Inter · grafismo de chevrons
  11 plugins gratuitos · 4 mu-plugins próprios
  /llms.txt e /sitemap-movecon.xml, ambos HTTP 200, gerados do mapa
  robots.txt: Disallow /lp/ e /obrigado/, crawlers de IA liberados de propósito
  check_seo.py + hook de pre-commit

Institucional (2)
  /                            Home
  /contato/                    ⏳ sem telefone, e-mail e WhatsApp reais

Confiança (1)
  /administrado-pela-alpha/    página-âncora. Ensina a conferir no Bacen.
                               ⚠️ A VERSÃO NOVA (com certificado, endereço da
                               matriz e caminho de consulta) está ESCRITA mas
                               RETIDA: depende de alinhamento do cliente com a
                               Alpha e com Gustavo/Pablo. NÃO publicar.

Hubs de segmento (8)
  /consorcio-veiculos/  /consorcio-imoveis/  /consorcio-caminhao/
  /consorcio-maquinas-agricolas/  /consorcio-servicos/  /consorcio-empresa/
  /consorcio-embarcacoes/  /consorcio-contemplado/

Simuladores (6)
  /simulador/ + veiculos, imoveis, caminhao, maquinas-agricolas, servicos
  Fórmula tem DUAS componentes:
    1ª parcela      = valor * kFirst
    demais parcelas = valor * tot / prazo
  Ignorar a primeira parcela subestima o custo total. Valores são planos Alpha,
  copiados do simulador da Crelider e confirmados pelo cliente.
  Eventos GA4: sim_start, sim_result, lead_whatsapp (nomes fixos, não inventar).

Landing pages (15: container + 14)
  8 de aquisição + 6 de remarketing. Todas noindex, sem menu, sem rodapé de
  navegação. A regra mora no mu-plugin (mv_e_lp), não em cada página.

Filhas de silo (8) — todas de /consorcio-imoveis/
  casa, apartamento, terreno, construcao, reforma, fgts, imovel-rural,
  investimento. Com breadcrumb, answer-first, FAQ com schema, link para o hub
  e para o simulador, bloco de compliance.

## O QUE FALTA — 60 ROTAS PLANEJADAS

Filhas de silo (28)
  /consorcio-servicos/            5
  /consorcio-veiculos/            4
  /consorcio-caminhao/            4
  /consorcio-maquinas-agricolas/  4
  /consorcio-empresa/             4
  /consorcio-contemplado/         3
  /consorcio-moto/                2
  /consorcio-embarcacoes/         2

Guias (20) — BLOQUEADOS
  Nenhum guia vai ao ar sem autor real vinculado (E-E-A-T, YMYL).
  A página /autores/samuel/ ainda não existe. Faltam do cliente: sobrenome,
  foto, tempo de atuação e, se houver, certificação ABAC PCA-10.
  Ver MOVECON/05 - Site/Autor - dados pendentes.md

Confiança (5)
  /quem-somos/  /seguranca/  /avaliacoes/  /autores/  /imprensa/
  /avaliacoes/ depende de depoimento real. /quem-somos/ depende de dados de equipe.

Glossário e AEO (3)
  /glossario/  /dados/  /perguntas/

Institucional legal (2)
  /politica-de-privacidade/  /termos-de-uso/   ← obrigatórios por LGPD

Hub e simulador de moto (2)
  /consorcio-moto/    GERADO e NÃO PUBLICADO. Aguarda ok final do cliente.
                      H1: "Consórcio de moto: da primeira ao trabalho"
                      Hub é AMPLO (trabalho + lazer + primeira moto). O ângulo
                      motoboy/app vai para a filha /moto-para-trabalhar/.
                      Ao publicar: já removi moto da cobertura de
                      /consorcio-veiculos/; falta cruzar os links.
  /simulador/moto/    BLOQUEADO. A Crelider não separa moto de veículo, então
                      não há parâmetro de moto para copiar. Precisa vir da Alpha.

## PENDÊNCIAS DE DADO — NÃO INVENTE NENHUMA

Bloqueiam páginas inteiras:
  - telefone comercial, e-mail @moveconconsorcio.com, WhatsApp próprio e horário
    (hoje o simulador usa o WhatsApp da CRELIDER, 5577981620921, como provisório
     autorizado. Está isolado em content/simuladores.json, chave "whatsapp")
  - autor: sobrenome, foto, tempo de atuação, ABAC PCA-10
  - equipe com nome e foto (trava /quem-somos/)
  - depoimentos reais (trava /avaliacoes/ e blocos de prova social)
  - URL oficial da consulta de administradoras no bcb.gov.br
  - parâmetros de moto (faixa de crédito e prazo) para o simulador
  - regras de FGTS aceitas pela Alpha, critério de liberação por etapa de obra,
    restrição para imóvel rural

Não bloqueiam, mas fortalecem:
  - SVGs das 4 assinaturas da marca + versão negativa
  - hex das cores neutras (pág. 11 do manual não veio legível)
  - LinkedIn do autor

## PENDÊNCIAS OPERACIONAIS

  - Search Console não está configurado. Nenhum sitemap foi submetido.
    Passos: adicionar o domínio, submeter /sitemap-movecon.xml, inspecionar as
    URLs. O cache do Google foi descontinuado em 2024; para ver o que o
    Googlebot capturou use Inspeção de URL > "Ver página rastreada".
  - UpdraftPlus instalado mas NÃO configurado (exige OAuth do Google Drive no
    navegador). Fazer antes de qualquer volume de conteúdo.
  - 2FA do Wordfence não ativado.
  - 🚨 A rota POST /api/auth/register do CRM está ABERTA na internet, no mesmo
    VPS. Não é do site, mas divide a máquina. Bloquear no Caddy.
  - `pnpm lint` do monorepo FALHA por motivo alheio ao MOVECON, o que faz o
    hook de pre-commit completo travar qualquer commit. Enquanto não for
    consertado, rode gitleaks explicitamente antes de commitar:
    gitleaks detect --source . --log-opts="<range>" --no-banner --redact

## COMO TRABALHAR

- Uma camada por sessão. Não avance de fase sem o cliente aprovar.
- Antes de gerar 10+ páginas, mostre UMA renderizada e espere aprovação.
- Em filhas de silo: escreva os blocos answer-first (máx. 55 palavras) e mostre
  TODOS juntos para aprovação ANTES de escrever o corpo.
- Mudou URL que já estava indexada? 301 na mesma tarefa, sem exceção.
- Ao terminar, atualize o status em portar_mapa.py e rode check_seo.py --wp.
- Faltou dado? Pergunte. Não preencha com estimativa.

Comece lendo, nesta ordem:
  MOVECON/05 - Site/HANDOFF.md            (este arquivo)
  MOVECON/05 - Site/content/keyword-map.json
  MOVECON/01 - Empresa/Posicionamento & Credibilidade.md
  MOVECON/05 - Site/Runbook - DNS e Infra.md

Depois rode `python scripts/check_seo.py --wp` a partir de MOVECON/05 - Site/
e me diga o que encontrou antes de escrever qualquer coisa.
```

---

## Estado numérico (25/07/2026)

| | |
|---|---:|
| Rotas mapeadas | 100 |
| No ar | 40 |
| Planejadas | 60 |
| Páginas publicadas no WordPress | 40 |
| Commits do workstream | 7 |
| Arquivos versionados | 58 |
