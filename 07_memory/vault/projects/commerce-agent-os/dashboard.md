---
aliases: [Dashboard, Painel Operacional, Operações ao Vivo]
tags: [dashboard, live-view]
created_at: 2026-05-27T20:40:00Z
updated_at: 2026-05-27T20:50:00Z
---

# 🛰 Dashboard Operacional — `commerce-agent-os`

> **Para ativar este dashboard** (uma vez por máquina):
> 1. Obsidian → `Settings` → `Community plugins` → `Turn on community plugins`
> 2. `Browse` → buscar **Dataview** → `Install` → `Enable`
> 3. Recarregar este arquivo (`Ctrl+W` e abrir de novo, ou recarregar vault)
>
> Sem o plugin, as queries abaixo aparecem como blocos de código markdown. **Com o plugin**, elas viram tabelas vivas que leem o filesystem.

**O que este arquivo faz:** lê o vault em tempo real e mostra estado atual + últimos runs + tarefas + audits. Cada vez que um agente roda com `--capture`, este dashboard atualiza na próxima visualização — sem mexer aqui.

**Visão visual complementar:** [[operations/operations-map.canvas|Canvas Operations Map]] (estrutura). Este dashboard mostra o **movimento**.

---

## ⚡ Quick Commands (copiar e colar no terminal)

Cada callout abaixo tem um comando pronto. **Fluxo**: clicar na caixa → selecionar o comando → `Ctrl+C` → terminal → `Ctrl+V` → Enter → o run aparece no dashboard automaticamente (queries Dataview re-executam).

> [!example]+ **Audit determinístico** — zero credencial, zero risco
> ```bash
> pnpm audit:repo . --capture
> ```
> Audita estrutura/licença do próprio repo. Output em `12_reports/audits/` + run-summary curado no vault.

> [!example]+ **Merchant audit** — scoring de catálogo (fixture, zero credencial)
> ```bash
> pnpm merchant:audit --source=fixture --capture
> ```
> 3 SKUs da fixture, score 0–100, findings classificados, remediação. Relatório em `12_reports/merchant-audits/`.

> [!example]+ **Chief plan-only** — ver rota antes de executar
> ```bash
> pnpm chief --tenant=incluo-tenant --store=incluo --objective="auditar catálogo da loja"
> ```
> Classifica intent, escolhe playbook, monta rota, mostra warnings — não despacha.

> [!example]+ **Chief execute** — Chefe dispara os agentes via child_process
> ```bash
> pnpm chief --tenant=incluo-tenant --store=incluo --objective="auditar catálogo" --execute
> ```
> Despacha cada step. Checkpoint a cada agente em `vault/tenants/<t>/[stores/<s>/]runs/<runId>.json`.

> [!tip]+ **Pipeline LLM** — precisa `ANTHROPIC_API_KEY` em `.env.local`
> ```bash
> pnpm llm:smoke
> pnpm marketing:plan --horizon=Q3 --objective="..." --voice="..." --budget=10000 --tenant=incluo-tenant --store=incluo --capture
> pnpm creative:assets --campaign="..." --tenant=incluo-tenant --store=incluo --capture
> ```
> Cada `--capture` adiciona run-summary ao vault, dashboard atualiza.

> [!warning]+ **Shopify writeback real** — precisa `SHOPIFY_ADMIN_TOKEN` + `legal-profile.json` + revisão jurídica
> ```bash
> pnpm chief --tenant=incluo-tenant --store=incluo --objective="aplicar fixes do compliance" --mode=writeback --execute
> ```
> Passa pelo writeback-gate quíntuplo. Bloqueia se faltar policy ou token. **Não rodar antes de N27 + N29 desbloqueados.**

> [!info]+ **Validar ambiente** — checa setup completo
> ```bash
> pnpm doctor
> ```
> 10 checks cross-platform. 10🟢 = pronto.

---

## Estado agora

Snapshot resumido. Para detalhe: [[current-state]] · [[ops-brief]] · [[workstreams]].

```dataview
TABLE WITHOUT ID
  file.link AS "Arquivo",
  updated_at AS "Atualizado"
FROM "projects/commerce-agent-os"
WHERE file.name = "current-state" OR file.name = "ops-brief" OR file.name = "workstreams"
SORT updated_at DESC
```

---

## Últimos 10 runs (impl + test milestones, audits, agent-runs)

```dataview
TABLE WITHOUT ID
  file.link AS "Run",
  kind AS "Tipo",
  result AS "Resultado",
  created_at AS "Data"
FROM "projects/commerce-agent-os/run-summaries"
WHERE file.name != "_template" AND file.name != "index" AND file.name != "README"
SORT created_at DESC
LIMIT 10
```

---

## Marcos de implementação (impl-milestone)

```dataview
TABLE WITHOUT ID
  file.link AS "Marco",
  result AS "Resultado",
  created_at AS "Data"
FROM "projects/commerce-agent-os/run-summaries"
WHERE contains(kind, "impl") AND contains(kind, "milestone")
SORT created_at DESC
LIMIT 8
```

---

## Audits recentes

```dataview
TABLE WITHOUT ID
  file.link AS "Audit",
  result AS "Resultado",
  created_at AS "Data"
FROM "projects/commerce-agent-os/run-summaries"
WHERE kind = "audit"
SORT created_at DESC
LIMIT 6
```

---

## Tarefas em espera (pendentes externamente)

Fonte canônica: [[next-actions]] · [[tarefas-em-espera|Tarefas em Espera (mapa visual)]].

| ID | O que | Bloqueio | Esforço |
|---|---|---|---|
| **N27** | Primeiro `pnpm chief --execute --mode=writeback` real em Incluo | depende de B6 + revisão jurídica | depende de humano |
| **N28** | Adotar exit code `3` (SKIPPED gracioso) nos 17 agentes LLM | bulk refactor | ~2-3h |
| **N29** | `legal-profile.json` por loja real (Incluo + outras) | decisão produto por loja | ~5 min/loja |
| **B6** | `SHOPIFY_ADMIN_TOKEN` em `.env.local` | criar Custom App em Partners | ~3 min |
| **B1** | `ANTHROPIC_API_KEY` rotação no `.env.local` | rotação manual | 30s |

---

## Run-summaries por resultado

```dataview
TABLE WITHOUT ID
  result AS "Resultado",
  length(rows) AS "Quantidade"
FROM "projects/commerce-agent-os/run-summaries"
WHERE file.name != "_template" AND file.name != "index" AND file.name != "README" AND result
GROUP BY result
```

---

## Como o dashboard atualiza

```
agente roda com --capture          (terminal)
    ↓
@cao/brain-bridge escreve em vault (filesystem)
    ↓
Obsidian detecta mudança automática (hot reload)
    ↓
Dataview re-executa queries deste arquivo
    ↓
você vê linhas novas aqui
```

**Não há cron, não há WebSocket, não há servidor.** É só o Obsidian recarregando o filesystem. Quando outro operador faz `git pull`, o dashboard dele também atualiza com o que você produziu.

---

## Atalhos úteis

- `Ctrl+O` → "Dashboard" abre este arquivo
- `Ctrl+P` → "Reload app without saving" se queries pararem de atualizar
- Botão `Ctrl+E` alterna entre modo edição (vê o markdown bruto) e modo preview (vê as tabelas Dataview renderizadas)

## Manutenção

Este arquivo **não precisa ser editado** durante operação normal — ele lê o vault automaticamente. Só editar se:
- Quiser adicionar nova query (ex.: filtro por tag, por tenant, por jurisdição)
- Mudou o schema do frontmatter dos run-summaries
- Quer reorganizar seções

Sintaxe Dataview: [docs oficiais](https://blacksmithgu.github.io/obsidian-dataview/).

---

## Opcional avançado — disparar comandos direto do Obsidian

Se quiser **eliminar o copy-paste** e executar comandos clicando dentro do Obsidian, há um plugin community:

1. `Settings` → `Community plugins` → `Browse` → buscar **`Shell commands`** → `Install` + `Enable`
2. Configurar: `Settings` → `Shell commands` → `New shell command` → adicionar cada comando do Quick Commands acima
3. Atribuir hotkey ou rodar via Command Palette (`Ctrl+P` → nome do comando)

**Trade-off honesto:** o plugin executa comandos com o ambiente do Obsidian (PATH, cwd), que **varia por máquina**. Pode falhar em uma máquina e funcionar em outra. Plus: cada operador precisa configurar seus próprios comandos (config armazenada em `.obsidian/plugins/shellcommands/data.json`, que é per-user).

**Recomendação:** se você usa o sistema sozinho na mesma máquina, vale a pena. Para o time, o copy-paste do Quick Commands acima é mais previsível.
