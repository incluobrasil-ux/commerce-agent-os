# vault/

Raiz de memória. **3 tipos** de pasta filha — não misturar.

## Layout

```
vault/
├─ _template/                    # estrutura canônica para provisionar tenants
├─ projects/
│  └─ commerce-agent-os/         # cérebro operacional (commitado em git)
│     ├─ project-home.md         #   entrada do cérebro
│     ├─ current-state.md        #   snapshot curto agora
│     ├─ ops-brief.md            #   semáforos + 3 focos
│     ├─ workstreams.md          #   trilhas paralelas (W1–W8)
│     ├─ next-actions.md         #   N1–N7 imediatos
│     ├─ operational-priorities  #   fila viva (agora/próximo/depois)
│     ├─ blockers-and-risks.md   #   B1–B4 + R1–R11
│     ├─ decision-index.md       #   ADRs aceitos + abertos
│     ├─ source-of-truth.md      #   taxonomia de arquivos
│     ├─ sync-protocol.md        #   protocolo multi-operador
│     ├─ session-log.md          #   log retrospectivo (append-only)
│     ├─ handoff-log.md          #   passagem de bastão (append-only)
│     └─ run-summaries/
│        ├─ README.md            #   padrão para resumir outputs
│        ├─ _template.md         #   esqueleto fillable
│        ├─ index.md             #   catálogo dos resumos
│        └─ <date>-<kind>-<slug>.md   …
└─ <tenant_id>/                  # memória runtime de loja Shopify (NÃO commitado)
   ├─ facts/
   ├─ working/
   ├─ voc/
   ├─ competitor-benchmark/
   └─ audit/                     # append-only
```

## `projects/` — cérebro operacional

**Para que serve:** sistema de memória ativa do projeto. Não é wiki estática — é o lugar onde a equipe registra estado, decisões, prioridades, handoffs e onde transforma execução em memória útil.

**Como usar:** entrar por [`projects/commerce-agent-os/project-home.md`](projects/commerce-agent-os/project-home.md). De lá, navegar conforme a pergunta. Para saber qual arquivo é fonte oficial de cada coisa: [`source-of-truth.md`](projects/commerce-agent-os/source-of-truth.md). Para protocolo de uso multi-operador: [`sync-protocol.md`](projects/commerce-agent-os/sync-protocol.md).

**Versionado:** sim. Conteúdo curado, sem PII, sem segredos.

**Operadores:** humanos via Git + Claude Code (qualquer máquina); futuro: agentes via `@cao/memory`.

## `<tenant_id>/` — memória runtime

**Para que serve:** working/long-term memory por loja Shopify.

**Layout interno:** [`_template/README.md`](_template/README.md) + [ADR-0005](../../02_architecture/adr/ADR-0005-memory-vault.md).

**Versionado:** **não**. Conteúdo por-tenant, mutável, pode conter dados sensíveis.

**Provisionamento:** copiar `_template/` para `<tenant_id>/` quando uma loja é cadastrada.

## Nota bruta vs memória curada

| | Bruto | Curado |
|---|---|---|
| Vive em | `<tenant>/working/`, `<tenant>/audit/`, `12_reports/` | `<tenant>/facts/`, `projects/<projeto>/` |
| Quem escreve | qualquer agente em runtime | humano ou `learning-memory-curation` |
| Confiança | baixa, pode ter ruído | alta, revisada |
| Quem consome | só quem escreveu | qualquer agente / humano |

**Promover bruto → curado é ato deliberado.** Critérios em [`projects/commerce-agent-os/run-summaries/README.md`](projects/commerce-agent-os/run-summaries/README.md).

## Multi-operador (resumo)

Múltiplas pessoas + múltiplos Claudes editam este vault em máquinas diferentes. Sem automação pesada, com convenção forte:

- **Arquivos curados pequenos** → merges manuais raros e fáceis.
- **Logs append-only** ([session-log.md](projects/commerce-agent-os/session-log.md), [handoff-log.md](projects/commerce-agent-os/handoff-log.md), `<tenant>/audit/...`) → conflitos viram entradas paralelas.
- **Convenção de identidade:** `human:<handle>` (parte do email) ou `agent:<name>` no frontmatter.
- **Ritual de sessão:** ler `current-state.md` + `handoff-log.md` antes; registrar handoff se deixar WIP; bater `updated_at` ao editar curado.

Detalhe operacional em [`projects/commerce-agent-os/sync-protocol.md`](projects/commerce-agent-os/sync-protocol.md).

## Como outputs alimentam o cérebro

```
agente roda
   ↓ output bruto
12_reports/  ou  vault/<tenant>/audit/
   ↓ curadoria manual (operador decide)
projects/<projeto>/run-summaries/<date>-<kind>-<slug>.md
   ↓ 1 linha em
projects/<projeto>/run-summaries/index.md
   ↓ se gera ação
next-actions.md  ou  operational-priorities.md
   ↓ se muda decisão
decision-index.md  (e abre ADR se estrutural)
   ↓ se muda semáforo
current-state.md  /  ops-brief.md  /  workstreams.md
   ↓ sempre
session-log.md (e handoff-log.md se WIP aberto)
```

100% manual hoje. Automação só depois que o padrão estiver provado em ~10–20 ciclos reais.

## Não fazer

- Não criar pasta de tenant dentro de `projects/`. Tenants vivem na raiz de `vault/`.
- Não commitar `<tenant_id>/`. Só `_template/` e `projects/` vão para git.
- Não duplicar ADRs aqui — sempre linkar.
- Não editar log append-only — só adicionar.
- Não criar arquivo curado novo antes de checar [`projects/commerce-agent-os/source-of-truth.md`](projects/commerce-agent-os/source-of-truth.md).
