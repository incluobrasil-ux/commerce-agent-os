# PROMPT 0 — SETUP do vault de auditoria (rodar primeiro, uma única vez)
## Cria o projeto Obsidian limpo + as regras anti-alucinação + o dashboard

> Cole no Claude Code. Anexe os 3 arquivos de contexto na sessão:
> `auditoria-incluo-compliance-gmc-2026.md`, `dossie-google-ads-gmc-2026__2_.md`,
> e a auditoria nova (`AUDITORIA-MISREP-incluo-2026-06-14`).
> Garanta que os MCPs Shopify estão conectados.

---

```
# PAPEL
Você é um especialista sênior em Google Merchant Center / Google Ads e auditor de
compliance para e-commerce dropshipping no Brasil. Vamos refazer a auditoria de
Misrepresentation da Incluo Brasil DO ZERO, eixo por eixo, registrando TUDO num
vault Obsidian novo e limpo. A auditoria anterior existe (anexada) mas vamos tratá-la
como NÃO CONFIÁVEL até reprovar cada achado ao vivo. O objetivo é um registro à prova
de alucinação onde dá pra ver, em cada linha, COMO você soube de cada coisa.

# REGRA Nº1 — PROVENIÊNCIA OBRIGATÓRIA (a regra que mata alucinação)
NENHUMA afirmação entra no vault sem uma etiqueta de fonte. Use SEMPRE uma destas:
- [LIVE] — você leu agora via MCP. Cole a query/mutation usada e o trecho literal do retorno.
- [VAULT] — veio de um arquivo anexado/nota antiga. Pode estar DESATUALIZADO. Marque a data do arquivo.
- [INFERIDO] — você deduziu. Diga de qual evidência [LIVE] partiu. Inferência nunca vira "fato".
- [NÃO-AUDITÁVEL-MCP] — não dá pra ver via MCP (config Yampi, GMC, Simprosys, robots.txt, banner Ads). Vira tarefa MANUAL minha.

Proibições absolutas:
- PROIBIDO escrever "isso foi corrigido em tal data" como fato. Você não viu a correção
  acontecer. Escreva no máximo: "[LIVE] estado atual = limpo (verificado em DATA)".
- PROIBIDO dar número redondo sem prova. Toda contagem ("280 SKUs", "16 marcas",
  "138 produtos") TEM que vir com (a) a query exata e (b) a LISTA de IDs/handles que
  compõem o número. Se você não consegue listar item a item, escreva
  "[INFERIDO] contagem não confirmada — listar antes de confiar".
- PROIBIDO dizer "0 ocorrências" sem antes colar a BLOCKLIST exata de termos que você
  buscou. Um "zero" só vale acompanhado da lista de termos testados.
- PROIBIDO misturar lados de uma comparação sem etiquetar cada lado. Ex.: frete =
  "[LIVE] loja 10-21d × [VAULT/27-mai] GMC 4-7d" — nunca "mismatch crítico" seco.

# REGRA Nº2 — ANTI-REGRESSÃO (já é sua regra, reforço)
Esta sessão é SOMENTE-LEITURA. Você NÃO corrige nada. Só audita e registra. Quando
formos corrigir (outra sessão), aí sim: snapshot → escrita cirúrgica → re-leitura →
re-varredura total.

# REGRA Nº3 — LIMITES TÉCNICOS
- Saída ~32k tokens → 1 eixo por prompt, nunca o catálogo todo de uma vez.
- Shopify MCP graphql_query devolve ~10 itens/página → pagine com cursor SEMPRE e
  registre quantas páginas você leu e se hasNextPage=false (prova de varredura completa).
- Volume grande → script Node fora da tool.

# TAREFA DESTE PROMPT (setup, sem auditar ainda)
Crie a estrutura do vault novo. Use o caminho do vault Obsidian de operações da loja
(se não souber, me pergunte o caminho absoluto). Crie a pasta:

  /AUDITORIA-GMC-2026/

Dentro dela, crie estes arquivos com o conteúdo especificado:

## 1. `_DASHBOARD.md` — painel central com Dataview
Cabeçalho + uma tabela Dataview que lê o frontmatter de todas as notas de eixo, e a
tabela de tarefas. Use exatamente este conteúdo:

---
title: Dashboard Auditoria GMC — Incluo Brasil
tipo: dashboard
atualizado: {{DATA}}
---

# 🛡️ Auditoria Misrepresentation — Incluo Brasil
Loja: incluobrasil.com · Iniciada: {{DATA}} · Modo: somente-leitura

## Status por eixo
```dataview
TABLE score AS "Score", veredito AS "Veredito (1 linha)", auditado_em AS "Auditado", fonte_predominante AS "Fonte"
FROM "AUDITORIA-GMC-2026"
WHERE tipo = "eixo"
SORT eixo ASC
```

## Tarefas abertas (o que fazer agora)
```dataview
TABLE WITHOUT ID
  prioridade AS "P",
  tarefa AS "Tarefa",
  responsavel AS "Quem",
  status AS "Status",
  eixo_origem AS "Eixo",
  bloqueia_review AS "Bloqueia review?"
FROM "AUDITORIA-GMC-2026/tarefas"
WHERE tipo = "tarefa"
SORT prioridade ASC
```

## Itens NÃO-AUDITÁVEIS via MCP (ações manuais minhas)
```dataview
LIST rows.tarefa
FROM "AUDITORIA-GMC-2026/tarefas"
WHERE responsavel = "manual"
GROUP BY eixo_origem
```

## Pré-requisitos do Request Review (todos têm que estar ✅)
- [ ] Todos os eixos 🔴 resolvidos e re-verificados [LIVE]
- [ ] Re-varredura final dos 138 produtos sem regressão
- [ ] Identidade in-account GMC concluída (doc = Roberto dos Santos Medrado)
- [ ] Recrawl aguardado (~7 dias)

---

## 2. `_REGRAS-E-PROVENIENCIA.md`
Cole as Regras Nº1, Nº2, Nº3 acima na íntegra, pra ficar registrado no vault como
contrato da auditoria.

## 3. `_BLOCKLIST-CLAIMS.md` — a lista de termos que define o "zero" do Eixo 1
Crie com frontmatter `tipo: blocklist, versao: 1` e liste, em seções, TODOS os termos
clínicos/proibidos que você vai buscar. Inclua no mínimo (expanda se souber mais):
- Diagnósticos: autismo, TEA, TDAH, TDA, Asperger, dislexia, deficit de atenção
- Estados: ansiedade, ansioso, estresse, stress, depressão, pânico, angústia, medo,
  nervosismo, agitação, hiperatividade, insônia
- Neuro: autorregulação, autorregular, regulação emocional, propriocepção,
  proprioceptivo, vestibular, integração sensorial, sobrecarga sensorial, disfunção
- Terapia: terapêutico, terapia, terapeuta, fonoaudiólogo, psicólogo, TO (terapia
  ocupacional), reabilitação, tratamento, tratar, curar, cura, alívio, aliviar
- Função: acalma, acalmar, calmante, relaxa, relaxar (clínico), concentração, foco,
  atenção (como benefício), desenvolve (habilidade), melhora (capacidade), estimula
  (função), reduz (sintoma)
- Médico: dispositivo médico, uso clínico, indicado para, recomendado por médicos,
  dor, tensão muscular
Marque quais aparecem APENAS dentro do disclaimer negado (uso conforme) vs uso real.

## 4. `tarefas/` (pasta) — uma nota por tarefa
Por enquanto crie só a pasta vazia e um arquivo `tarefas/_TEMPLATE-tarefa.md` com este
frontmatter modelo (os eixos vão preencher depois):

---
tipo: tarefa
tarefa: "descrição curta da ação"
prioridade: 1   # 1=crítico 🔴, 2=importante 🟡, 3=soft 🟢
status: aberto  # aberto | em-andamento | feito
responsavel: claude   # claude (via MCP) | manual (você fora do VSCode)
eixo_origem: 4
bloqueia_review: sim  # sim | não
fonte: "[LIVE] / [VAULT] / [NÃO-AUDITÁVEL-MCP]"
---

## 5. `eixos/` (pasta) — uma nota por eixo
Crie a pasta e um arquivo `eixos/_TEMPLATE-eixo.md` com este frontmatter modelo:

---
tipo: eixo
eixo: 0
nome: "nome do eixo"
score: "⚪ pendente"   # 🟢 | 🟡 | 🔴 | ⚪
veredito: "ainda não auditado"
auditado_em: ""
fonte_predominante: ""   # LIVE | VAULT | MISTO
paginas_lidas: 0
varredura_completa: false   # true só se hasNextPage=false
---

# DEPOIS de criar tudo
1. Confirme a árvore de arquivos criada (liste os caminhos).
2. Me diga o caminho absoluto do vault que você usou.
3. NÃO comece a auditar. Pare e diga: "Setup pronto. Mande o PROMPT 1 (Eixo 1)."
```

---

## Nota de uso

- Se ele não souber o caminho do vault, ele vai te perguntar — responda com o caminho
  absoluto da pasta do Obsidian (ex.: `/Users/voce/Obsidian/Loja/`).
- Os blocos ```dataview``` precisam do **plugin Dataview** instalado e habilitado no
  Obsidian. Se não tiver, instale em Settings → Community plugins → Dataview.
- Só avance pro PROMPT 1 depois que ele confirmar a árvore criada.
