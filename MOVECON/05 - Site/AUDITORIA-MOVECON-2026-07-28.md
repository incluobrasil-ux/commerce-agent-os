# AUDITORIA MOVECON — 2026-07-28

> [!warning] Registro historico - anterior a 20/08/2026
> Este documento descreve o site como ele estava na data acima. Em
> 20/08/2026 o vocabulario mudou: o termo "plataforma" saiu do site
> (a MOVECON passou a se apresentar como "autorizada pela Alpha") e o
> enquadramento de golpe/fraude foi substituido por enquadramento
> positivo. Rotas e frases citadas aqui podem nao existir mais.

> Somente leitura. Nenhum arquivo foi alterado nesta auditoria.
> Método: varredura da fonte (`content/`, `_codigo/`, `scripts/`, `docs/`) **e**
> do HTML servido em produção nas 115 rotas no ar. Toda linha da tabela de
> achados tem citação literal.

---

## 1. Resumo executivo

O site está **estruturalmente sólido e regulatoriamente limpo** no que diz
respeito ao núcleo do risco: zero promessa de contemplação, zero MOVECON
descrita como administradora, zero promessa de renda a parceiro, zero venda de
cota contemplada. As 115 rotas respondem 200, sem link interno quebrado e com
JSON-LD válido em todas as 94 indexáveis.

Os achados concentram-se em **três frentes**, e a mais grave não é de SEO:

1. **A Crelider aparece em produção** — em texto visível de 18 páginas (bio do
   autor) e num comentário CSS servido em todas as 115. A regra do projeto e
   deste prompt proíbem a menção.
2. **O nome legal da Alpha diverge** entre este prompt (plural, *Consórcios*) e
   o que está publicado em 81 lugares (singular, *Consórcio Ltda.*). Um dos dois
   está errado, e o certo é o que consta na lista do Banco Central.
3. **O WhatsApp de produção é da Crelider** em 19 rotas — pendência já conhecida
   e autorizada como provisória, mas ainda ativa.

**Achados por severidade:** 🔴 3 · 🟠 2 · 🟡 4 · 🟢 2 — total **11**.
**Não verificáveis (dependem do Samuel):** 4.

Os 5 mais graves: A-01 (nome legal da Alpha), A-02 (Crelider na bio),
A-03 (Crelider no CSS global), B-01 (WhatsApp Crelider), B-02 (páginas legais
ausentes).

---

## 2. Tabela de achados

| ID | Sev | Categoria | Arquivo/Rota | Descrição | Evidência (literal) | Correção recomendada | Esforço |
|---|---|---|---|---|---|---|---|
| **A-01** | 🔴 | Dado da Alpha | `content/keyword-map.json` + 81 ocorrências | O prompt desta auditoria diz **"Alpha Administradora de Consórcio**s** Ltda"** (plural). O site publica **"Alpha Administradora de Consórcio Ltda."** (singular) em 81 lugares. Um dos dois está errado. | `"administradora": "Alpha Administradora de Consórcio Ltda."` — e `docs/01-compliance.md`: *"A grafia bate letra por letra com a lista de administradoras autorizadas do Banco Central: 'Consórcio' singular, COM acento, 'Ltda.' com ponto."* | **NÃO CORRIGIR SEM CONFERIR.** Verificar na relação do Bacen por CNPJ 90.982.679/0001-54 e alinhar as duas fontes. Ver §5. | P (após confirmação) |
| **A-02** | 🔴 | Crelider em material MOVECON | `content/autor.json` → `/autor/`, `/autor/samuel-tanan/` e caixa de autor dos 16 artigos (**18 páginas**) | Menção à Crelider em **texto visível**, no cargo e na bio. | `"cargo": "Sócio-fundador da MOVECON e da Crelider"` · `"...vendedor autônomo e fundou a Crelider."` · `"...fundou a Crelider, consultoria de vendas de consórcio em Vitória da Conquista (BA)..."` | **DECISÃO DO CLIENTE.** O texto foi ditado e aprovado por ele em 27/07; esta regra o proíbe. Conflito real — ver §5. | P (após decisão) |
| **A-03** | 🔴 | Crelider em material MOVECON | `_codigo/movecon.css` → **115 de 115 rotas** | Comentário de cabeçalho do CSS cita a Crelider, e o CSS do customizer entra no HTML de toda página. | `MOVECON — DESIGN TOKENS v1.0 / Base: Manual da Marca MOVECON v1.0 (2026) + metodologia do design system Crelider` | Remover a menção do comentário. Pelo padrão do próprio projeto conta: `check_seo` já declara que varre **"inclusive dentro de comentário HTML, porque comentário também vai no documento servido"**. | P |
| **B-01** | 🟠 | Ativo de outra marca em produção | `content/simuladores.json` → 6 simuladores + 13 LPs (**19 rotas**) | O WhatsApp de conversão do site é o número da Crelider. | `"_whatsapp_provisorio": "PROVISORIO - este e o numero da CRELIDER, autorizado pelo cliente como temporario em 25/07/2026. Leads do site da MOVECON caem no WhatsApp da Crelider."` | Trocar por número MOVECON. **Autorizado como provisório** — não é delírio, é pendência com prazo. | P (falta o número) |
| **B-02** | 🟠 | Página estratégica ausente | `/politica-de-privacidade/`, `/termos-de-uso/` | Ambas `planejada`. E-E-A-T e LGPD pedem as duas no ar. | `status: "planejada"` no keyword-map; `gerar_legais.py`: *"2 paginas legais geradas. NAO publicadas: exigem revisao juridica."* | Publicar após P5 (revisão jurídica). Conteúdo **já gerado**. | P (após revisão) |
| **C-01** | 🟡 | Profundidade de conteúdo | 25 de 36 filhas | Abaixo do piso de 600 palavras do plano. | menor: `/consorcio-maquinas-agricolas/trator/` com **352 palavras** | Engorda no molde já aprovado (3 blocos + FAQ). | G |
| **C-02** | 🟡 | Profundidade de conteúdo | `/consorcio-contemplado/` | 933 palavras, abaixo do mínimo de 1.200 de hub; nota 7,2 (a mais baixa). | `auditar_onpage.py`: `/consorcio-contemplado/ 7.2 933 0 6 3 ok` | Engorda. Ausência de tabela é decisão deliberada do cliente — manter. | M |
| **C-03** | 🟡 | Página estratégica ausente | `/seja-um-representante/` | Não existe no keyword-map. Benchmark (Âncora) usa a página como ativo de SEO. Já há allow-list preparada para ela. | rota ausente do `keyword-map.json`; `ESCOPO_TERMO` já lista `/seja-um-representante/` | Criar. **Atenção compliance:** parceria comercial, nunca linguagem de emprego. | M |
| **C-04** | 🟡 | Meta description | 76 rotas | Fora da faixa 140–160 deste prompt. | ex.: `/consorcio-imoveis/` com 127 caracteres | **Divergência de régua, não defeito**: o projeto adota 110–165 (ideal 120–160) e o `check_seo` valida por ela. Alinhar a régua antes de mexer em 76 páginas. | M |
| **D-01** | 🟢 | Higiene de fonte | `scripts/portar_mapa.py` | Docstring cita scaffold Next.js — resíduo histórico. | `"""Porta content/keyword-map.ts (scaffold Next.js) -> content/keyword-map.json."""` | Atualizar o comentário. Não vaza para produção (0 ocorrências no HTML). | P |
| **D-02** | 🟢 | Higiene de fonte | `05 - Site/Plano de Implementacao (base Crelider).md` | Nome de arquivo interno cita a Crelider. | nome do arquivo | Renomear se a regra valer para artefatos internos. Não publicado. | P |

---

## 3. O que foi verificado e está LIMPO

Registrado porque ausência de achado só vale com evidência de que se procurou.

| Verificação | Resultado |
|---|---|
| Promessa de contemplação / prazo | **0**. As 60 ocorrências de `garantid` são 39 negações explícitas, o nome da rota `/guia/contemplacao-garantida-e-golpe/`, verbete de glossário que nega, e FAQ respondida com "Não" |
| MOVECON como administradora / autorizada pelo BC | **0**. As 45 ocorrências são a construção correta (*grupos administrados pela Alpha*) ou a própria lista de proibições |
| Promessa de renda a parceiro | **0** |
| Venda de cota contemplada | **0** — e há disclaimer ativo: *"A MOVECON não comercializa cotas contempladas, e a Alpha (…) não vende contemplação"* |
| Linguagem empregatícia | **0**. `vaga` aparece 8× como *"vaga em marina"*; `emprego` 4× em contexto de vida pessoal do leitor; `salário` e `CLT`: zero |
| Selos / prêmios inventados | **0**. `lps.json` registra: *"Nenhuma LP tem depoimento, numero de clientes ou selo de resultado. Nao ha dado real."* |
| Depoimentos fabricados | **0** — decisão registrada de recusar reaproveitar avaliações de terceiro |
| "1981" da Alpha | **3**, todas com fonte declarada: *"fundada em 1981, segundo informações institucionais da própria Alpha"* |
| CNPJ da Alpha | 51 ocorrências, todas `90.982.679/0001-54` |
| Next.js / React / Vercel em produção | **0** |
| Lorem ipsum / `[NOME]` / `{{ }}` / `example.com` em produção | **0** |
| Campos internos (`_leia_me`, `_pendente`) vazando | **0** |
| HTTP das 115 rotas | **115 × 200** |
| Links internos quebrados | **0** |
| Páginas órfãs | **0** de 94 |
| Canibalização de keyword | **0** (`check_seo`) |
| JSON-LD inválido | **0** em 94 rotas |
| `title` > 60 chars | **0** |
| Canonical ausente ou cruzado | **0** |
| `<img>` sem alt no corpo | **0** |
| LPs marcadas noindex | 15 de 15 |
| Sitemap | 94 URLs = exatamente as 94 indexáveis |
| Cobertura de FAQ do setor | **20 de 20** perguntas de referência |

---

## 4. Gap analysis vs. mapa de rotas

O mapa tem **118 rotas**; 115 no ar, 3 planejadas.

| Rota | Status | Bloqueio |
|---|---|---|
| `/politica-de-privacidade/` | planejada | P5 — revisão jurídica |
| `/termos-de-uso/` | planejada | P5 — revisão jurídica |
| `/simulador/moto/` | planejada | P6 — a tabela da Alpha não separa moto de veículo |
| `/seja-um-representante/` | **fora do mapa** | decisão de escopo (P4) |

Rotas órfãs (existem no site e não no mapa): **0**.

---

## 5. Pendências que dependem do Samuel

### 5.1 — Nome legal da Alpha 🔴 *(pendência crítica histórica (a) — SEGUE ABERTA)*

Há divergência entre duas fontes suas:

| Fonte | Grafia |
|---|---|
| Prompt desta auditoria | Alpha Administradora de Consórcio**s** Ltda |
| Site + `docs/01-compliance.md` | Alpha Administradora de Consórcio Ltda. |

O `docs/` afirma que a forma singular **bate letra por letra com a lista do Banco Central**, e que a grafia sem acento da Receita é artefato do cadastro dela. Não alterei nada: trocar 81 ocorrências pela grafia errada seria pior que a divergência.

**Preciso de:** a grafia exata como aparece na relação do Bacen, consultada pelo CNPJ 90.982.679/0001-54.

### 5.2 — Crelider na bio do autor 🔴 *(conflito entre duas instruções suas)*

- **27/07:** você ditou e aprovou a bio, que diz *"Sócio-fundador da MOVECON e da Crelider"* e *"fundou a Crelider"*.
- **Este prompt e `docs/01-compliance.md`:** nunca mencionar a Crelider em material MOVECON.

As duas não podem valer ao mesmo tempo. As saídas:

1. **Manter** — a menção é biográfica e verdadeira sobre uma pessoa real; abrir exceção explícita na regra, do mesmo jeito que se fez com `white-label`.
2. **Remover** — a bio passa a citar só a MOVECON e a trajetória, sem nomear a Crelider.

Recomendo a **1**, com registro datado: a regra nasceu para impedir que a marca Crelider apareça como fornecedora do produto, e a bio não faz isso — atribui à pessoa, não ao consórcio. Mas é decisão sua.

### 5.3 — Credenciais de autor YMYL 🟡 *(pendência crítica histórica (b) — PARCIALMENTE RESOLVIDA)*

Resolvido: nome real, cargo, bio curta e longa, página de autor no ar, `author` Person no schema dos 16 artigos.
**Falta:** a foto (mín. 400×400). A caixa está no ar sem ela, por autorização sua de 27/07 — o gerador **omite a tag `<img>`** em vez de renderizar `src` vazio.

### 5.4 — Não verificáveis no repositório

| Item | Por quê |
|---|---|
| Alpha "fundada em 1981" | Publicado com fonte declarada, mas não confirmável aqui |
| Número de grupos ativos da Alpha | Não é citado no site — se vier a ser, precisa de fonte |
| Régua de meta description | 140–160 (prompt) vs. 110–165 (projeto). Qual vale? |
| WhatsApp próprio da MOVECON | Sem o número, B-01 não fecha |

---

## 6. Backlog sequenciado

### Lote 1 — 🔴 críticos
- **A-03** remover Crelider do comentário do `movecon.css` e republicar *(não depende de ninguém)*
- **A-01** aguarda §5.1
- **A-02** aguarda §5.2

### Lote 2 — 🟠 altos
- **B-01** trocar o WhatsApp quando o número existir
- **B-02** publicar as legais após revisão jurídica

### Lote 3 — 🟡 médios
- **C-04** decidir a régua de description **antes** de tocar em 76 páginas
- **C-01** engorda das 25 filhas (molde aprovado)
- **C-02** engorda de `/consorcio-contemplado/`
- **C-03** criar `/seja-um-representante/`

### Lote 4 — 🟢 baixos
- **D-01**, **D-02** higiene de comentário e nome de arquivo

---

## 7. Divergências entre este prompt e o estado registrado do projeto

Não são achados sobre o site — são pontos onde o briefing desta auditoria e a
base documental do projeto discordam. Registrados para que a correção não
introduza o erro oposto.

| Tema | Prompt da auditoria | Projeto |
|---|---|---|
| Nome legal da Alpha | *Consórcios* (plural) | *Consórcio Ltda.* (singular), com nota de conferência no Bacen |
| Fórmula de atribuição | *"consórcio administrado pela Alpha Administradora de Consórcios, autorizada pelo Banco Central do Brasil"* | *"Os grupos são administrados pela Alpha Administradora de Consórcio Ltda., CNPJ (…), administradora autorizada a funcionar pelo Banco Central do Brasil sob o certificado nº 03/100/213/88"* — mais específica, e já em 94/94 rotas |
| Meta description | 140–160 | 110–165, ideal 120–160 |
| Mapa de rotas | ~99 | 118 |
| `white-label` | usado livremente no briefing | regra de escopo por audiência desde 26/07 |
