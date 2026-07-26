# 06 — Pendências

> Backlog vivo. Nada aqui pode ser preenchido pelo modelo: são dados que só o
> cliente, a Alpha ou uma fonte externa fornecem. Onde um destes bloqueia uma
> página, a página usa `{{DADO_PENDENTE}}` ou não vai ao ar.

## P1 — Tabela comercial da MOVECON, por escrito, da Alpha

**Bloqueia:** indexação dos 6 simuladores.

Os simuladores estão no ar e em `noindex` desde 25/07/2026. A fórmula foi lida
da origem e está correta, mas **os parâmetros vieram da tabela da Crelider** e
foram publicados sob a marca MOVECON. Canal diferente pode ter condição
comercial diferente, e ninguém da Alpha validou esses valores para a MOVECON.

Modo de falha: o lead simula um valor, o vendedor apresenta outro.

**Condição de reversão — as quatro, juntas:**

1. tabela vigente da MOVECON
2. recebida da Alpha por escrito
3. com data de validade
4. conferida contra a fórmula (1ª parcela = valor × kFirst; demais = valor × tot ÷ prazo)

## P2 — Alinhamento sobre `/administrado-pela-alpha/`

**Bloqueia:** a nova versão da página âncora de confiança.

A versão atual está no ar. A **nova versão está escrita e retida**, aguardando
alinhamento do cliente com a Alpha e com Gustavo/Pablo.

Nota: o cliente liberou os artigos comparativos em 26/07/2026, que o plano
mestre listava como dependentes de P2. Os artigos estão publicados.

## P3 — Autor com credencial verificável (YMYL)

**Bloqueia:** `Article` schema com `author` pessoa nos 21 guias.

Falta: nome completo, foto, anos de experiência no setor, credencial
verificável e perfil público. Enquanto não houver, o `publisher` é
`Organization` e **não existe `author` pessoa** — guia sem assinatura é
conteúdo anônimo; guia com autor inventado é fraude.

O relatório de concorrentes registra que **quase nenhum player identifica
autoria de blog**. É ganho fácil e barato, e depende só do cliente.

## P4 — Página do Funil 01 (representantes)

**Bloqueia:** o link da FAQ "Como me tornar representante da MOVECON?" nos dois
artigos comparativos.

Não existe página de recrutamento no site. A FAQ está publicada **com o texto e
sem link** — nenhuma URL foi inventada. Registrado também em `_pendencias` no
keyword-map e no cabeçalho de `scripts/gerar_artigos.py`.

## P5 — Revisão jurídica das duas páginas legais

**Bloqueia:** `/politica-de-privacidade/` e `/termos-de-uso/`.

Escritas e retidas por instrução do cliente, aguardando revisão jurídica junto
à Alpha. São as duas únicas rotas `planejada` além de `/simulador/moto/`.

Enquanto isso, o site capta lead por WhatsApp **sem política de privacidade
publicada** — exposição LGPD que independe de campanha.

## P6 — Parâmetros de moto na tabela da Alpha

**Bloqueia:** `/simulador/moto/`.

A tabela não separa moto de veículo. As páginas de moto apontam para
`/simulador/veiculos/` e nenhuma exibe valor de parcela.

## P6b — Simulador próprio para moto e embarcações

**Não bloqueia página. Bloqueia precisão do CTA.**

`/consorcio-moto/` aponta para `/simulador/veiculos/` e
`/consorcio-embarcacoes/` para `/simulador/servicos/`. Nenhuma das duas exibe
valor de parcela, então **não há dado errado no ar** — mas o botão leva a uma
calculadora que não é do bem.

Mitigação aplicada em 26/07/2026: nesses dois hubs o botão diz **"Simular meu
consórcio"** em vez de "Simular minha parcela", que seria promessa de cálculo
específico.

**Quando P1 chegar:** criar rota de simulador própria para as duas modalidades,
ou parametrizar o bem no simulador atual. Aí o CTA volta a "Simular minha
parcela".

## P7 — Banner de consentimento

**Bloqueia:** qualquer campanha, e também GA4 em tráfego orgânico.

O Complianz foi desinstalado e os 11 options residuais limpos. **Nenhum plugin
de consentimento está instalado.** Ver `PRÉ-REQUISITO DE CAMPANHA` no HANDOFF.

## P8 — Backup

**Não bloqueia página nenhuma. É o item de maior risco do projeto.**

UpdraftPlus instalado e **completamente vazio**: sem destino remoto, sem
agendamento, nenhum backup jamais executado. 99 páginas num único VPS sem cópia.

## P9 — Search Console e GA4

**Bloqueia:** medição, os KPIs do plano mestre e o ciclo de quick wins.

Site Kit instalado com `propertyID` vazio nos dois. 99 páginas no ar e ninguém
sabe se estão sendo indexadas.

---

# Propostas do relatório sem rota correspondente

**Nenhuma foi criada.** Aguardam aprovação explícita do cliente, conforme a
correção 1 de 26/07/2026.

## PR1 — SEO local por cidade

O relatório aponta como **gap nº 1 do setor**: só a Embracon faz bem, com
páginas de filial por cidade e bairro.

**Status: recusado pelo cliente em 26/07/2026** — a operação é nacional. A
camada `local` continua declarada em `CAMADAS` no `check_seo.py` com zero
rotas. Reabrir só se a decisão mudar.

## PR2 — FAQ com uma URL por pergunta

Padrão da Evoy (`/contato/duvidas-frequentes/<pergunta>`) e da CAIXA
(`/central-de-ajuda/<pergunta>`). O relatório chama de melhor AEO do setor.

Hoje a MOVECON tem `/perguntas/` com 12 perguntas transversais e um índice de
110 respondidas nos silos. **Uma URL por pergunta seria dezenas de rotas novas**
e precisa de decisão sobre canibalização com as FAQ já existentes nas páginas.

## PR3 — Selos de E-E-A-T no rodapé

Relatório: Banco Central, ABAC e Reclame Aqui são padrão nos 6 concorrentes.

Depende de: confirmar se a Alpha é associada à ABAC, e criar perfil no Reclame
Aqui — que o próprio plano mestre recomenda reivindicar **antes** da primeira
reclamação existir.

## PR4 — `WebSite` + `SearchAction` e `Product`/`Offer`

Schema que o relatório recomenda e o site não emite. `Product`/`Offer` no
simulador depende de P1: sem tabela oficial não há "parcela a partir de".

## PR5 — Depoimentos nominais, idealmente em vídeo

Padrão da Evoy e da Tradição. Depende de clientes reais. A `/avaliacoes/`
explica hoje, por escrito, por que a página não exibe depoimento.

---

# Dados do relatório que precisam de revalidação antes de uso público

O próprio relatório os marca como não verificados:

| Dado | Ressalva do relatório |
|---|---|
| R$ 500,27 bi em créditos, 12,76 mi de participantes | "revalidar antes de citar publicamente" |
| Schema JSON-LD dos concorrentes | "não confirmado em código-fonte" |
| URLs da CAIXA | "vieram de SERP — não 100% verificados" |
| Volumes de blog | "estimativas por paginação observada" |
| Nº de filiais da Embracon | site diz 120+, institucional diz ~90 |

**A `/dados/` do site não usa nenhum deles.** Ela cita ABAC de abril e maio de
2026, lidos na fonte primária, com período de referência e link por número.

---

# Decisão de keyword — `/consorcio-contemplado/`

**Decisão do cliente, 26/07/2026. Registrada aqui para ninguém "otimizar" isso
no futuro achando que é erro.**

O hub mantém `"carta de crédito contemplada"` como keyword secundária no
keyword-map — palavra de **intenção transacional de compra**. A página responde
essa busca dizendo que **não vendemos**.

Isso é deliberado, e não um descuido de otimização:

- Interceptar essa intenção é **proteção do usuário e da marca**. O cluster
  "carta contemplada" é o de maior volume e menor defesa do setor, dominado por
  corretoras, e é onde mora a fraude mais comum do consórcio brasileiro.
- **Bounce de leitor avisado é sucesso, não custo.** Quem chega com pressa para
  comprar contemplação e sai sabendo que ela não se compra saiu ganhando — e
  não pagou um golpe.
- O relatório de concorrentes registra que nenhum player defende a própria SERP
  nesse cluster.

**Não remova a secundária.** Se a métrica de bounce ou de conversão apontar essa
página como problema, a leitura correta é que ela está funcionando.

A página inteira foi construída em torno disso: disclaimer acima da dobra, FAQ
abrindo com "Vocês vendem carta contemplada?" respondida com "Não.", e CTA que
oferece a única aceleração legítima — o lance.

# Regra: material de origem não se edita por conformidade

**Decisão do cliente, 26/07/2026.**

Fonte é registro fiel. A restrição de vocabulário se aplica na **camada de
saída** — o texto público —, que o `check_seo.py` já cobre varrendo `_codigo/`
e `build/`.

Eu havia trocado "white-label reverso" por "marca branca reverso" ao gravar o
`relatorio-pesquisa-concorrentes.md`. **Foi revertido:** o original está de
volta.

**Procedimento quando a fonte conflitar com uma regra de saída:**

1. Não editar a fonte.
2. Anotar o conflito aqui, neste arquivo.
3. Aplicar a regra apenas ao texto público derivado.

## Conflitos de vocabulário já anotados

| Fonte | Trecho | Regra de saída |
|---|---|---|
| `relatorio-pesquisa-concorrentes.md`, análise da Âncora | "modelo white-label reverso" | `white-label` é expressão proibida em texto público. O termo pode ser lido e discutido internamente; nunca sai em página do site. |

## Backlog de schema

**`DefinedTerm` — não implementado.** O plano mestre das 96 rotas afirmava que
o mu-plugin já suportava. Não suporta: zero ocorrência no código e zero no HTML
de `/glossario/`.

Decisão do cliente em 26/07/2026: **não implementar agora**. A prioridade de
schema segue `FAQPage`, `Organization` e `BreadcrumbList`, conforme
`05-schema-specs.md`. Os 41 verbetes já têm âncora própria e estrutura pronta
para receber o schema quando for feito.

O plano mestre, quando for revisado, precisa ter essa afirmação removida ou
marcada como backlog — ele não está versionado neste repositório.
