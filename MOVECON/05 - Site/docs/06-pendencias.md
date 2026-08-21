# 06 — Pendências

> Backlog vivo. Nada aqui pode ser preenchido pelo modelo: são dados que só o
> cliente, a Alpha ou uma fonte externa fornecem. Onde um destes bloqueia uma
> página, a página usa `{{DADO_PENDENTE}}` ou não vai ao ar.

## P3 — dados de autoria (ABERTA)

**Estado em 26/07/2026: infraestrutura pronta, faltam 4 valores.**

Confirmado pelo cliente: **Samuel Tanan, sócio-fundador da MOVECON e da
Crelider**. Esse é o único dado real recebido — os outros quatro campos
chegaram como marcadores de template (`[COLAR BIO CURTA]`, `[COLAR BIO
LONGA]`, `[anexar/caminho]`, `[LinkedIn/Instagram ou "nenhum por ora"]`)
e **não foram preenchidos por inferência**.

### O que falta

| Campo | Formato |
|---|---|
| `bioCurta` | 1 a 2 frases, até ~240 caracteres — vai na caixa ao fim de cada artigo |
| `bioLonga` | 2 a 4 parágrafos — vai na página de autor |
| `foto` | mínimo 400×400, quadrada |
| `linkExterno` | URL do LinkedIn/Instagram, **ou** a string `nenhum` |

### O que já está pronto

- `content/autor.json` — ficha, fonte única dos três lugares
- `scripts/gerar_autor.py` — página e caixa; **aborta com exit 1** se houver
  campo obrigatório pendente, sem escrever nada
- `movecon-schema-artigos.php` — `author` Person quando a ficha estiver
  completa, `Organization` enquanto não estiver
- `check_seo.py` / `validar_autoria()` — a bio passa pelas 11 expressões
  proibidas, mais seis variações específicas de autoria
- Rota `/autor/samuel-tanan/` registrada, camada `confianca`, `planejada`

### Por que nada publicou

A caixa de autor entra em **toda** página de artigo. Publicar com pendente
espalharia `[COLAR BIO CURTA]` por 15 páginas de uma vez — exatamente o que a
regra permanente do gate proíbe.

Sobre o `author` Person: enquanto a bio pública não existir, o schema **não**
afirma autoria de pessoa. Apontar `author` para uma página de autor vazia é
pior do que declarar `Organization`, porque promete ao buscador uma credencial
que o visitante não encontra ao clicar.

### Atenção registrada pelo cliente

A bio **não** pode conter nenhuma das expressões proibidas. Em especial,
nada de `white-label` — a construção aprovada é "autorizada pela Alpha, que
administra os grupos" (revisada em 20/08/2026). O validador foi testado com
violação injetada e barra com exit 1.

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

### Subitens, após a correção de produto de 26/07/2026

**(a) Composição da primeira parcela — RESOLVIDA.** A primeira parcela maior é
antecipação da taxa de administração, padrão da Alpha. Confirmado por Samuel,
sócio da operação, diretamente com o proprietário da Alpha, na semana de
20/07/2026, com autorização de uso na comunicação. Log completo em
`01-compliance.md`.
*Pendente como reforço documental, não bloqueante:* confirmação por e-mail da
Alpha.

**(b) Validade e versão da tabela — ABERTA.** `content/simuladores.json` não
registra data da tabela nem prazo de revalidação. Tabela de consórcio muda, e
hoje não há como saber se a que está no arquivo ainda vale. **Registrar a data
da tabela vigente e definir prazo de revalidação.**

**(c) Parâmetros de moto — ABERTA.** `kFirst`, `tot` e as faixas estão todos
`null` para moto. **Enquanto isso, nenhuma promessa de condição específica em
página de moto** — nem primeira parcela, nem faixa de crédito, nem prazo.

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
conteúdo anônimo; guia com autor inventado não tem autoria real.

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

## P8 — Backup · PARCIALMENTE RESOLVIDA em 26/07/2026

**Feito, e funcionando:** `backup-movecon.sh` diário às 03:20, com banco,
uploads e configs. Retenção de 7 diários + 4 semanais. Trava que aborta se o
dump vier vazio. **Restore testado em ambiente isolado** — 99 páginas, 9 hubs,
24 itens de menu e 41 KB de CSS conferidos. Documentado em `backup-restore.md`.

**O que falta:** as cópias estão no **mesmo disco do site**. Protege contra erro
humano e corrupção de banco; **não protege contra perda do VPS**, que é o
cenário que originou a pendência.

**Precisa de você:** credencial de um destino externo — bucket S3 ou compatível,
rclone para Drive/OneDrive, ou outro servidor com SSH. Escolhido o destino, o
envio é uma linha no fim do script.

O UpdraftPlus segue instalado e vazio. Não foi usado: um script versionado é
auditável e testável; a configuração de um plugin vive só no banco — e o banco
é justamente o que se está tentando proteger.

## P8b — Repositório privado · RESOLVIDA em 26/07/2026

**Feito:** criado `incluobrasil-ux/movecon-site`, **privado**, com os 40 commits
que tocam `MOVECON/` extraídos por `git subtree split` — histórico preservado,
com o projeto na raiz.

Confirmado nos dois sentidos: o repositório privado tem o projeto completo, e
`commerce-agent-os` **continua público com zero arquivos de MOVECON**. A
visibilidade do monorepo não foi alterada, conforme decidido.

`gitleaks` sobre os 40 commits antes do push: **nenhum segredo**.

**Fluxo a partir de agora**, documentado em `repositorio.md`:

```bash
git subtree push --prefix=MOVECON movecon main
```

**Rode a cada sessão de trabalho.** Enquanto não rodar, o código só existe na
máquina local — foi essa a situação encontrada, com 57 commits nunca enviados.

### O texto original desta pendência, para registro

## P8b — O repositório remoto é PÚBLICO

**Descoberto em 26/07/2026, antes de qualquer push. Nada vazou.**

`origin` aponta para `github.com/incluobrasil-ux/commerce-agent-os`, e a
consulta à API retorna `"visibility":"PUBLIC"`.

**57 commits nunca foram enviados.** O último commit no remoto é de 28/05/2026 —
todo o projeto MOVECON existe apenas na máquina local. Confirmado que o remoto
tem **zero arquivos** de `MOVECON/`.

Um push levaria 104 arquivos e 18.826 linhas para um repositório público,
incluindo estratégia de compliance, a decisão de não mencionar o processo
administrativo da Alpha, análise pontuada de concorrentes nomeados e as
decisões internas do HANDOFF.

`gitleaks` nos 57 commits: **nenhum segredo**. Mas ausência de credencial não
é o mesmo que conteúdo publicável.

**Precisa de você — três caminhos:**

1. Tornar `commerce-agent-os` privado. Um comando, mas afeta todo o monorepo e
   qualquer coisa que dependa dele ser público.
2. Criar um repositório privado novo só para MOVECON e apontar o `origin` do
   subprojeto para lá.
3. Manter o monorepo público e mover MOVECON para outro repositório privado.

**Não faço nenhum dos três sem sua escolha explícita** — mudar visibilidade de
repositório é ação de sentido único quando erra para o lado aberto.

Enquanto isso, **o código não tem backup externo nenhum.**

## P9 — Search Console e GA4 · PREPARADA em 26/07/2026

**Feito:** sitemap conferido — 78 URLs, exatamente as rotas indexáveis no ar,
XML válido, zero LP vazando, zero duplicata, robots apontando. Passo a passo de
criação das propriedades documentado em `medicao-gsc-ga4.md`.

**Precisa de você:** criar as propriedades na conta Google da MOVECON e me
mandar (a) o valor da meta tag de verificação do Search Console e (b) o ID
`G-XXXXXXXXXX` do GA4. Eu insiro os dois num mu-plugin.

**ORDEM OBRIGATÓRIA:** Search Console pode ser agora — não coleta dado do
visitante. **GA4 só depois da P7**, porque GA4 sem banner de consentimento é
violação de LGPD, e o próprio plano mestre lista o GA4 como o primeiro dos
quatro gatilhos que exigem o banner.

## Regra da Fase 2 — nenhum artigo publica sem autor real

**Decisão do cliente, 26/07/2026.**

A pauta do Prompt 2.1 **pode** ser escrita e aprovada com a P3 em aberto. Os
artigos **podem** ser escritos. Mas **nenhum vai ao ar sem autor real definido**.

Motivo: conteúdo YMYL sobre dinheiro sem autoria identificável é a pior
categoria possível para E-E-A-T — e assinar com autor inventado não é
otimização, é conteúdo sem autoria real. Os 21 guias já estão no ar sem caixa de autor por essa mesma razão;
artigo de blog terá o mesmo tratamento até a P3 fechar.

O `Article` schema segue com `publisher` `Organization` e **sem `author`
pessoa**.

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
  "carta contemplada" é o de maior volume do setor, dominado por corretoras, e é
  onde o leitor chega com mais pressa e menos informação sobre a operação.
- **Bounce de leitor informado é sucesso, não custo.** Quem chega com pressa
  para comprar contemplação e sai sabendo que ela não se compra, e sim se
  transfere pela administradora, saiu ganhando.
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
