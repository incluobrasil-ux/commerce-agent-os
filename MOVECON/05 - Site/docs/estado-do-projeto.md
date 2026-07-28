# Estado do projeto — mapa vivo

> ✅ **RECONCILIADO em 2026-07-27 na máquina principal.** A branch
> `pc2-trabalho` foi mergeada em `main` e apagada. Os marcadores `⟳` da §5 foram
> rebaixados um a um contra o estado real do repositório e do site — nenhum por
> suposição. O roteiro que guiou esta reconciliação está em
> `docs/reconciliacao-pc2-para-maquina-principal.md`.

> **O que é.** Onde estamos e o que falta no site da MOVECON, derivado do
> repositório e reconciliado contra o resumo de decisões da conversa com o
> cliente. Atualizado ao fim de cada item concluído.
>
> **Método.** Tudo abaixo foi lido dos arquivos, não da memória. Onde o
> repositório e o resumo divergem, a divergência está registrada na seção 5 —
> nenhum dos dois foi assumido como certo.

## Proveniência desta leitura

**Reconciliado.** O relatório original foi produzido num clone defasado; esta
versão foi conferida contra a máquina principal e contra o site no ar.

| | Original (clone pc2) | Reconciliado |
|---|---|---|
| Fonte | clone de `movecon-site` | máquina principal, `commerce-agent-os/MOVECON/` |
| HEAD | `516b255` — 2026-07-26 21:49 | `148e8f5` — 2026-07-27 |
| Defasagem | ~2 dias | nenhuma |
| Medição no ar | não executada | executada (D8 e contagens abaixo) |

**A causa da defasagem foi confirmada e corrigida:** o `git subtree push` não
havia rodado desde 26/07 21:49. Ao reconciliar, 12 commits do MOVECON foram
enviados de uma vez — incluindo P3, os 14 artigos, os guias, o bloco de
compliance e a engorda dos hubs.

## 1. Placar geral

### Rotas (fonte: `content/keyword-map.json`)

| Métrica | Valor |
|---|---:|
| Rotas mapeadas | **102** |
| No ar (`status: no-ar`) | **99** |
| Planejadas (`status: planejada`) | **3** |
| Indexáveis (`indexavel: true`) | **80** |
| Não-indexáveis | **22** |
| No sitemap (indexável **e** no ar) | **78** |

As 3 planejadas: `/simulador/moto/`, `/politica-de-privacidade/`,
`/termos-de-uso/`. As 22 não-indexáveis: os 7 simuladores (`/simulador/` +
6 categorias, em `noindex` desde 25/07) + as 15 LPs (`/lp/` + 14). O número
78 do sitemap = 80 indexáveis − 2 planejadas indexáveis (as duas legais);
bate exatamente com o "78 URLs" registrado na P9.

### Por camada / por intenção

| Camada | Rotas | | Intenção | Rotas |
|---|---:|---|---|---:|
| filha | 36 | | comercial | 45 |
| guia | 21 | | informacional | 27 |
| lp | 15 | | transacional | 22 |
| hub | 9 | | navegacional | 8 |
| conversao | 7 | | | |
| institucional | 4 | | | |
| confianca | 4 | | | |
| artigo | 3 | | | |
| glossario | 3 | | | |

`local` está declarada em `CAMADAS` no `check_seo.py` com **zero rotas**
(PR1 recusado; ver §4b).

### Palavras por camada (auditoria on-page de 26/07/2026, HTML servido)

| Camada | Páginas | Mediana | Mínimo do plano | No padrão |
|---|---:|---:|---:|---|
| Hubs | 9 | 457 | 1.200 | **0 de 9** |
| Filhas | 36 | 301 | 600 | **0 de 36** |
| Guias | 21 | 352 | 800 | **0 de 21** |

Nenhuma página atinge a extensão mínima. É o padrão do site inteiro, e é a
origem da fila de trabalho da Fase 3 (§6).

### Detectores ativos (`scripts/check_seo.py`)

| Detector | Papel |
|---|---|
| `PLACEHOLDER` | placeholder não resolvido no build |
| `MODALIDADE` (`TERMOS_MODALIDADE`) | termo de uma modalidade vazando para outra (ex.: FGTS fora de imóveis) |
| `PARCELA_FIXA` | promessa de parcela que não muda (reajuste é do contrato) |
| `SEM_ENTRADA` | "sem entrada" sem a ressalva da 1ª parcela maior, no mesmo bloco |

Todos com allow-list de fonte única no próprio módulo. Além do validador de
commit, há um **gate corretivo separado**, `scripts/gate_correcao_entrada.py`
(mede o HTML **servido**: COMPLIANCE / DELÍRIO / kFirst vazando / REGRESSÃO), e
o auditor `scripts/auditar_onpage.py`.

> ⚠️ O resumo lista **6** detectores, incluindo `ESCOPO_TERMO` e `PAGINA_VAZIA`.
> Este clone tem **4** — ver divergência **D6**.

### Gates aprovados (`docs/auditorias/`)

`gate-fase-0.md` · `gate-fase-1.md` · `gate-correcao-antecipacao.md`.

---

## 2. Fases — o que cada uma entregou (commits-chave)

**Fase 0 — Fundação / portabilidade do mapa**
- `3aae076` prompt 0.1 + gate 0.2 — `/docs/` derivado do `keyword-map`
- `5385785` baseline pós-uniformização da razão social

**Fase 1 — Higiene e engorda inicial das 99 rotas (ENCERRADA)**
- `29eba00` FASE 1 do plano mestre — higiene das 99 rotas
- `8ab3d04` `/consorcio-imoveis/` — engorda do hub molde (Prompt 1.1)
- `dfe7364` `/consorcio-veiculos/` — replicação do molde (Prompt 1.2)
- `588a369` engorda dos 6 hubs restantes — lote aprovado
- `f90ab11` `/consorcio-contemplado/` com estrutura própria — **FASE 1 ENCERRADA**
- publicações da base: `997172e` 20 guias + índice, `435630d` glossário (41
  verbetes), `03d7eaf` `/perguntas/` (12 transversais + índice de 110),
  `3601a71` `/quem-somos/` e `/seguranca/`, `a713c25` 14 LPs, filhas de silo
  (`362f7a3`, `85c24d8`, `d0add12`, `92f6f61`, `0f3e359`)

> "Engorda" na Fase 1 = construção inicial dos hubs. A auditoria on-page de
> 26/07 mostra que os 9 seguem curtos (457 de mediana contra 1.200) — a
> **segunda** engorda é item em curso (§3), não a mesma coisa.

**Fase 2 (no clone: auditoria on-page das indexáveis)**
- `887dacb` publica o blog e os 2 artigos comparativos
- `57ab5cf` FASE 2 — auditoria on-page das 66 páginas indexáveis
- `649c495` navegação alcança as 99 páginas · `0412011` remove tabelas de nota dos 2 artigos

> ⚠️ O resumo chama de "FASE 2 concluída" a **pauta de 15 artigos (14
> publicados) com autor Samuel Tanan**. Isso **não está neste clone** — ver
> D1/D2. O que o clone rotula "Fase 2" é a auditoria on-page.

**Correção de produto + infra (últimos commits do clone)**
- `9564c2b` correção de produto — antecipação da taxa de administração
- `fe39e25` P8 backup com restore testado + P9 preparada
- `61e690b` **P8b resolvida** — repo privado + envio externo preparado
- `516b255` (HEAD) registra a sequência GSC → P7 → GA4

---

## 3. Em curso

No estado do clone, o item vivo é a **segunda engorda**, cuja ordem foi definida
pela auditoria on-page de 26/07 (`docs/auditoria-onpage-2026-07-26.md`):

1. Links de fonte primária nos 21 guias — mecânico, não depende de P3
2. Datas visíveis nos guias
3. Bloco de compliance **no corpo** das páginas comerciais (hoje a atribuição à
   Alpha existe só no rodapé global — invisível para trecho extraído por IA)
4. Engorda dos hubs: imóveis → veículos → caminhão
5. Engorda das 36 filhas, começando pelas 10 menores (280–295 palavras)

**O resumo indica que os itens 1–3 e o molde do item 4 já avançaram na máquina
principal** (molde de `/consorcio-imoveis/` aprovado — 3 blocos + FAQ 6→8, com
regularização baseada na alienação fiduciária; regime molde → lote de 4
aprovações; fila veículos + caminhão). **Confirmado na principal e concluído** (D9,
commit `26e7312`). A **próxima parada** de aprovação
(molde da 1ª filha menor → lote das 9) segue valendo — paradas de molde são a
exceção ao "tudo que precisa do cliente fica para o final".

**Para fechar a auditoria pós-fase-2** faltam, pela leitura do clone: confirmar
itens 1–3 aplicados e versionados, o molde de hub replicado nos 9, e o molde de
filha replicado nas 36.

---

## 4. Pendências

### 4a. Do cliente — o que cada uma destrava

| Pendência | Destrava | Fonte |
|---|---|---|
| **Tabela vigente da MOVECON, da Alpha, por escrito, com validade** | indexação dos 6 simuladores (P1) · `/simulador/moto/` (P6) · CTA "Simular minha parcela" (P6b) · `Product`/`Offer` (PR4) | P1 |
| **Autor real** — sobrenome, foto, tempo de atuação, credencial | `author` pessoa nos 21 guias (P3) · caixa de autor · (resumo) publicação da Fase 2 | P3 · `Autor - dados pendentes.md` |
| **Credencial de destino externo de backup** (S3/B2/rclone/SSH) | fecha P8 — hoje as cópias estão no mesmo disco do VPS | P8 |
| **`content=` do Search Console** | submissão do sitemap (já pronto, 78 URLs) | P9 |
| **`G-XXXXXXXXXX` do GA4** | medição orgânica — **só depois da P7** (LGPD) | P9 |
| **Banner de consentimento** (reinstalar Complianz) | qualquer campanha + GA4 | P7 |
| **Alinhamento com Alpha + Gustavo/Pablo** | publicar a nova `/administrado-pela-alpha/` (escrita e retida) | P2 |
| **Revisão jurídica** das 2 páginas legais | `/politica-de-privacidade/` e `/termos-de-uso/` (exposição LGPD ativa) | P5 |
| **Parâmetros de moto da Alpha** (faixa de crédito, prazo) | `/simulador/moto/` (P6) | P6 |
| **Contato real** — telefone, e-mail @movecon, WhatsApp próprio | `/contato/` (hoje usa WhatsApp da Crelider como provisório) | HANDOFF |
| **Dados de equipe / depoimentos reais** | `/quem-somos/` · `/avaliacoes/` · prova social | HANDOFF |
| **Confirmação por e-mail da Alpha** da composição da 1ª parcela | reforço documental (não bloqueante — já confirmado verbalmente pelo sócio) | P1 (a) |

Fora do site (Funil 01): auditoria dos criativos/LPs com a régua "sem entrada"
e confirmação por escrito da Alpha (composição, tabela com validade, parâmetros
de moto → P1b/P1c). Simuladores seguem `noindex` até P1 fechar.

### 4b. Técnicas — estado real conferido em `06-pendencias.md`

| # | Estado no clone | Bloqueia |
|---|---|---|
| **P1** | (a) composição da 1ª parcela **RESOLVIDA** (antecipação da taxa; confirmada pelo sócio junto à Alpha) · (b) validade/versão da tabela **ABERTA** · (c) parâmetros de moto **ABERTA** (`null` em `simuladores.json`) | indexação dos 6 simuladores |
| **P2** | nova versão **escrita e retida**; artigos comparativos liberados e publicados em 26/07 | nova `/administrado-pela-alpha/` |
| **P3** | **ABERTA** — sem `author` pessoa; guias sem assinatura; `Autor - dados pendentes.md` aberto | `Article`/`author` nos 21 guias · **(resumo diz fechada — D1)** |
| **P4** | página de recrutamento **não existe**; FAQ publicada com texto e **sem link** (nenhuma URL inventada) | link da FAQ "como me tornar representante" |
| **P5** | 2 legais **escritas e retidas** p/ revisão jurídica | as duas rotas legais |
| **P6** | tabela não separa moto de veículo | `/simulador/moto/` |
| **P6b** | mitigado — CTA "Simular meu consórcio" nos hubs de moto/embarcações (nenhum valor no ar) | precisão do CTA |
| **P7** | **nenhum plugin de consentimento instalado** (Complianz desinstalado, 11 options limpos) | toda campanha + GA4 |
| **P8** | **PARCIALMENTE RESOLVIDA** — backup diário 03:20 + restore testado; falta **destino externo** | perda do VPS |
| **P8b** | **RESOLVIDA** — repo privado criado; fluxo `git subtree push` manual por sessão | *(é a causa da defasagem deste clone)* |
| **P9** | **PREPARADA** — sitemap conferido (78 URLs); falta `content=` (GSC) e `G-XXXX` (GA4, só após P7) | GSC / GA4 |

**Propostas do relatório sem rota (nenhuma criada — aguardam aprovação):**
PR1 SEO local por cidade — **recusado** (operação nacional) · PR2 FAQ com uma
URL por pergunta · PR3 selos de E-E-A-T no rodapé (Bacen/ABAC/Reclame Aqui) ·
PR4 `WebSite`+`SearchAction` e `Product`/`Offer` · PR5 depoimentos nominais.
**Backlog de schema:** `DefinedTerm` não implementado (decisão de não fazer
agora; prioridade segue `FAQPage`/`Organization`/`BreadcrumbList`).

---

## 5. Divergências — RESOLVIDAS em 2026-07-27

Todos os nove marcadores eram **commit não enviado**, exatamente a hipótese que
o relatório original registrou. Nenhum era decisão não executada.

| # | O que o resumo afirmava | Verificação na principal | Resultado |
|---|---|---|---|
| **D1** | P3 fechada, autor Samuel Tanan, `/autor/` | `content/autor.json` preenchido; rotas `/autor/` e `/autor/samuel-tanan/` no mapa, ambas `no-ar`; `author` Person no schema | **concluído** — `854ccfb` |
| **D2** | 14 artigos da Fase 2 publicados | camada `artigo` = **17 rotas** (`/blog/` + 2 comparativos + 14 novos) | **concluído** — `c73da5b`, `97cbcde`, `854ccfb` |
| **D3** | atribuição à Alpha no corpo de 94/94 | medido no HTML servido, com recorte que descarta `nav`/`footer`: **94 de 94** | **concluído** — `be9e8bd` |
| **D4** | fontes primárias + data nos guias | 20 de 20 com fonte linkada e data dinâmica; **divergência 20 vs 21 resolvida** — são 20 guias de conteúdo mais o índice `/guia/`, que soma 21 rotas no mapa | **concluído** — `3f2b845` |
| **D5** | molde de hub aprovado (3 blocos, FAQ 6→8) | `secoes` em `segmentos.json` nos 3 hubs; imóveis 1.286→1.974, veículos 1.177→1.653, caminhão 1.112→1.556 | **concluído** — `26e7312` |
| **D6** | 6 detectores, com `ESCOPO_TERMO` e `PAGINA_VAZIA` | `grep` em `check_seo.py`: 6 blocos de regra, incluindo `ESCOPO_TERMO` (linha 167) e `MIN_CORPO` (linha 522) | **concluído** — `d864ef3`, `f5aa2f1` |
| **D7** | `compliance.py` como módulo único | `scripts/compliance.py` existe; `gerar_hubs`, `gerar_filhas`, `gerar_guias`, `gerar_dados`, `gerar_indice_blog` e `gerar_indice_guias` importam dele | **concluído** — `be9e8bd`. O nome no resumo estava certo |
| **D8** | `llms.txt`, sitemap e robots no ar | HTTP **200** nos três; `sitemap-movecon.xml` com **94 URLs** = exatamente as 94 indexáveis no ar | **concluído** — `5ea3f85` |
| **D9** | regime molde→lote, fila veículos+caminhão | registrado em `02-mapeamento-blueprint.md`; veículos e caminhão publicados no lote único | **concluído** — `26e7312` |

### Sobre o `white-label` (parte do D6)

O clone lia o HANDOFF, onde o termo era **proibido sem exceção**. A regra mudou
por decisão do cliente em 26/07: passou a ser **escopo por audiência** —
permitido em `/quem-somos/`, `/seja-um-representante/` e página de autor;
proibido em toda página de consumidor. O clone não estava errado; estava lendo
a versão anterior da regra.

## 6. Próximos passos

### Fila do agente (não depende do cliente)
Ordem da auditoria on-page — itens 1–3 são estruturais (cabem em gerador,
atingem dezenas de páginas); item 4 é escrita, 1 página por ciclo, com parada
de molde:
1. ~~Links de fonte primária nos guias~~ — **feito**, 20/20 (`3f2b845`)
2. ~~Datas visíveis nos guias~~ — **feito**, 20/20, dinâmicas (`3f2b845`)
3. ~~Bloco de compliance no corpo~~ — **feito**, 94/94 (`be9e8bd`)
4. ~~Engorda dos hubs: imóveis → veículos → caminhão~~ — **feito** (`26e7312`)
5. **Engorda das filhas** — único item aberto da auditoria. 35 de 36 abaixo de
   600 palavras; menor é `/consorcio-empresa/equipamentos/`, com 336
5. Engorda das 36 filhas (10 menores primeiro)

### Fila do cliente (destrava o resto — ver §4a)
Tabela da Alpha (por escrito, com validade) · autor real · credencial de backup
externo · `content=` do GSC · banner/Complianz (P7, antes do GA4) · alinhamento
Alpha+Gustavo/Pablo (P2) · revisão jurídica das 2 legais (P5) · parâmetros de
moto · contato/equipe/depoimentos reais.

---

## 7. Fase 3 (ainda não iniciada — apenas listada)

**Propostas registradas e não criadas:**
- **FAQ com uma URL por pergunta** (PR2) — decidir canibalização com as FAQ já
  embutidas nas páginas
- **Selos de E-E-A-T no rodapé** (PR3) — depende de confirmar filiação ABAC da
  Alpha e reivindicar perfil no Reclame Aqui **antes** da 1ª reclamação
- **`WebSite` + `SearchAction`** e **`Product`/`Offer`** (PR4) — o `Product`
  depende de P1 (sem tabela oficial não há "parcela a partir de")
- **Depoimentos nominais**, idealmente em vídeo (PR5) — depende de clientes reais
- **`DefinedTerm`** no glossário (backlog de schema) — os 41 verbetes já têm
  âncora e estrutura prontas
- **`llms.txt` ampliado**

**O que os dados do GSC deverão decidir:**
- Quais páginas engordar primeiro (por impressão/posição), acima da ordem do plano
- Se a PR2 (uma URL por pergunta) vale o risco de canibalização
- Confirmar que o bounce alto de `/consorcio-contemplado/` é **sucesso**
  (interceptação protetiva), não problema — decisão já registrada, a não ser
  contrariada por dado.

---

*Mapa vivo. Atualizar ao fim de cada item concluído.*

*Reconciliação de 2026-07-27 encerrada: os nove marcadores viraram "concluído",
nenhum sobrou como pendência real. A causa da defasagem era uma só — o `git
subtree push` não roda sozinho.*

**Passo obrigatório de fechamento de sessão:** rodar
`git subtree push --prefix=MOVECON movecon main`. Enquanto não roda, o código só
existe na máquina local — foi o que produziu os 57 commits nunca enviados e,
depois, esta reconciliação.*
