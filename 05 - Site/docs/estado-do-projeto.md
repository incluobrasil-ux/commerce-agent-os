# Estado do projeto — mapa vivo

> 🔶 **Branch `pc2-trabalho` — gerada de clone defasado (HEAD `516b255`).
> Reconciliar APÓS o subtree push da máquina principal.**
>
> Esta cópia está ~2 dias atrás da máquina principal. Regra desta máquina:
> **somente trabalho aditivo** (arquivos novos — docs, relatórios, propostas).
> Proibido rodar geradores, publicar em produção ou editar conteúdo existente
> (`segmentos.json`, artigos, guias) — editá-los aqui conflitaria com o trabalho
> da principal. Os marcadores **`⟳`** da §5 só são rebaixados na reconciliação
> pós-push. Passo a passo em `docs/reconciliacao-pc2-para-maquina-principal.md`.

> **O que é.** Onde estamos e o que falta no site da MOVECON, derivado do
> repositório e reconciliado contra o resumo de decisões da conversa com o
> cliente. Atualizado ao fim de cada item concluído.
>
> **Método.** Tudo abaixo foi lido dos arquivos, não da memória. Onde o
> repositório e o resumo divergem, a divergência está registrada na seção 5 —
> nenhum dos dois foi assumido como certo.

## Proveniência desta leitura — LEIA ANTES

Este relatório foi produzido a partir de um **clone do remoto**
`github.com/incluobrasil-ux/movecon-site`, não da máquina principal.

| | |
|---|---|
| Fonte | clone de `github.com/incluobrasil-ux/movecon-site` |
| Commit (HEAD) | `516b2552cefd67d7b21a82e8d2324d1cc22b4f2b` |
| Data do HEAD | **2026-07-26 21:49 -0300** — `docs(movecon): registra a sequencia GSC -> P7 -> GA4` |
| Histórico | 42 commits, de 2026-07-25 21:32 a 2026-07-26 21:49 (≈ 2 dias) |
| Arquivos versionados | 114 |

**O remoto está atrás da máquina principal.** O `git subtree push` é manual,
por sessão (P8b) — enquanto não roda, o código só existe local. O próprio
histórico do projeto registra o caso: *"57 commits nunca enviados"* antes do
push que criou este repositório. A cópia de trabalho principal
(`C:\projetos-incluo\commerce-agent-os\MOVECON\`, citada no HANDOFF) **não está
nesta máquina** — o `commerce-agent-os` presente aqui é um checkout antigo, sem
`MOVECON/`.

**Consequência para a leitura das divergências:** quando o resumo de decisões
cita algo que este clone não contém, a hipótese mais provável é **commit não
enviado**, não decisão não executada. Esses casos estão marcados
**`⟳ verificar na máquina principal`**, e não como pendência real.

> Nada foi executado contra o site em produção a partir desta sessão. Os scripts
> `gate_correcao_entrada.py` e `auditar_onpage.py` fazem requisição a
> `moveconconsorcio.com` — **não foram rodados**. Os números de auditoria abaixo
> vêm dos documentos já versionados, não de uma medição nova.

---

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
aprovações; fila veículos + caminhão). **Nada disso está no clone** →
`⟳ verificar na máquina principal` (D9). A **próxima parada** de aprovação
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

## 5. Divergências (repositório × resumo)

Convenção: **`⟳`** = o resumo está adiante do clone; provável commit não
enviado, a confirmar na máquina principal, **não** pendência real.

| # | Resumo diz | Clone mostra | Leitura |
|---|---|---|---|
| **D1** | P3 fechada: autor **Samuel Tanan**, `/autor/samuel-tanan/`, bio curta/longa, schema `Person` | P3 **ABERTA**; zero ocorrência de `samuel-tanan`, `/autor/`, `author` pessoa; `Autor - dados pendentes.md` aberto; regra "nenhum artigo publica sem autor real" ativa | **`⟳`** |
| **D2** | Fase 2: pauta de 15, **14 artigos publicados** | camada `artigo` = **3 rotas** (`/blog/` + 2 comparativos) | **`⟳`** |
| **D3** | atribuição à Alpha "no corpo de **94/94**"; "sitemap único curado (**94=94**)" | **78** indexáveis no ar / **99** no ar total; auditoria: atribuição à Alpha **só no rodapé global, zero no corpo** dos 9 hubs | **`⟳`** (o número 94 supõe ~14 artigos + itens não versionados aqui) |
| **D4** | "fontes primárias + data dinâmica nos **20 guias** — concluído" | **21 guias**; auditoria: **0 de 21** com fonte primária linkada, **0 de 21** com data visível | **`⟳`** + divergência de contagem (20 vs 21) |
| **D5** | engorda dos hubs: **molde `/consorcio-imoveis/` APROVADO** (3 blocos, FAQ 6→8) | auditoria apenas **recomenda** a engorda (item 4 da fila); molde aprovado não versionado | **`⟳`** |
| **D6** | **6 detectores**: +`ESCOPO_TERMO`, +`PAGINA_VAZIA` | **4 detectores**; `white-label` é **proibido sem exceção** no HANDOFF (a exceção B2B/institucional/autor do `ESCOPO_TERMO` não existe aqui) | **`⟳`** |
| **D7** | "`compliance.py` como módulo único" | não existe `compliance.py`; a lógica de compliance vive no `check_seo.py` (+ `01-compliance.md`) | **`⟳`** provável refactor posterior — **confirmar o nome do módulo** |
| **D8** | "`llms.txt` atualizado/ampliado", "robots com um sitemap", "sitemap único curado" | `llms.txt`, `sitemap*.xml` e `robots.txt` **não são versionados** — são gerados pelo mu-plugin `movecon-seo.php` (vivem na produção) | Não-verificável neste clone; **verificar em produção / máquina principal** |
| **D9** | regime molde→lote (4 aprovações), fila veículos+caminhão, molde de filha | ausente no clone | **`⟳`** (item em curso pós-HEAD) |
| **D10** | — | **Interna ao clone:** `HANDOFF.md` (snapshot de 25/07) diz 40 no ar / 100 rotas / 58 arquivos / 7 commits; `keyword-map` diz 99 no ar / 102 rotas; git diz 114 arquivos / 42 commits | HANDOFF é briefing datado, naturalmente atrás do mapa — não é erro |

Convergências que **batem** (sem divergência): as 3 planejadas do clone
(`/simulador/moto/` + 2 legais) = exatamente o que P5/P6 preveem; os 6
simuladores em `noindex`; o número 78 do sitemap reconcilia com a contagem de
indexáveis; P8b como causa declarada da defasagem.

---

## 6. Próximos passos

### Fila do agente (não depende do cliente)
Ordem da auditoria on-page — itens 1–3 são estruturais (cabem em gerador,
atingem dezenas de páginas); item 4 é escrita, 1 página por ciclo, com parada
de molde:
1. Links de fonte primária nos 21 guias *(o resumo indica feito — `⟳` confirmar)*
2. Datas visíveis nos guias *(idem)*
3. Bloco de compliance no corpo das páginas comerciais *(idem)*
4. Engorda dos hubs: imóveis → veículos → caminhão
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

*Mapa vivo. Atualizar ao fim de cada item concluído. Ao reconciliar contra a
máquina principal, rebaixar cada `⟳` para "concluído" ou "pendente real"
conforme o commit correspondente for encontrado (ou não).*
