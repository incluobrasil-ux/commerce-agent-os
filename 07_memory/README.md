# 07_memory

**Sistema de memória ativa e coordenação operacional.** Markdown-first — arquivos `.md` são a verdade; embeddings/índices são derivações.

Não é "vault de notas". É infraestrutura de:
- **estado curado** (onde estamos / o que decidimos / o que vem),
- **coordenação multi-operador** (vários humanos + Claudes em máquinas diferentes),
- **memória runtime de agentes** (por tenant).

## Duas camadas

| Camada | Pasta | Quem escreve | Versionado em git | Propósito |
|---|---|---|---|---|
| **Cérebro operacional do projeto** | `vault/projects/<projeto>/` | humanos + agentes (curado) | **sim** | estado, decisões, prioridades, handoffs, resumos |
| **Memória runtime por tenant** | `vault/<tenant_id>/` | agentes em runtime | **não** (privacy + ruído) | working/long-term memory por loja Shopify |

Mesmo motor (`@cao/memory`), propósitos diferentes. Não misturar.

## Camada 1 — Cérebro operacional (`vault/projects/commerce-agent-os/`)

**Entrada:** [`vault/projects/commerce-agent-os/project-home.md`](vault/projects/commerce-agent-os/project-home.md).

**Para que serve:** transformar contexto, execuções, decisões e progresso em artefatos úteis para a operação. **Fonte única de verdade** curada para equipe e agentes — onde decidir, priorizar e continuar de onde alguém parou.

**Como a equipe usa (resumo):**
1. Antes de uma sessão: ler `current-state.md` → `handoff-log.md` → `next-actions.md` (5 min).
2. Durante: editar arquivos curados (não logs), seguir [sync-protocol.md](vault/projects/commerce-agent-os/sync-protocol.md).
3. Ao encerrar: registrar em `session-log.md`; se há WIP aberto, também em `handoff-log.md`; se mudou estado, atualizar `current-state.md`/`ops-brief.md`.

Detalhe completo em [`sync-protocol.md`](vault/projects/commerce-agent-os/sync-protocol.md) e [`source-of-truth.md`](vault/projects/commerce-agent-os/source-of-truth.md).

**O que entra:**
- Estado curado: visão, status, decisões aceitas, próximas ações, riscos.
- Logs append-only de sessão e handoff.
- Resumos curados de execuções de agentes (em `run-summaries/`).
- Governança do próprio cérebro (`source-of-truth.md`, `sync-protocol.md`).

**O que NÃO entra:**
- Dump bruto de logs (vai para `12_reports/` ou audit log de tenant).
- PII de lojas, segredos, credenciais.
- Documentos canônicos já existentes em `00_meta/` ou `02_architecture/adr/` — aqui só ficam links e snapshots curtos. **Oficial vence sobre curado.**
- Backups, exports, dumps.

## Camada 2 — Memória runtime por tenant (`vault/<tenant_id>/`)

**Para que serve:** working/long-term memory dos agentes por loja Shopify. Cada tenant é uma loja isolada.

**Layout interno:** [`vault/_template/README.md`](vault/_template/README.md) e [ADR-0005](../02_architecture/adr/ADR-0005-memory-vault.md).

**Regras-chave:**
- Isolamento por tenant é estrito (`@cao/memory` rejeita cross-tenant).
- Buckets fixos: `facts`, `working`, `voc`, `competitor-benchmark`, `audit`. Novos buckets exigem ADR.
- `audit/` é append-only.
- Nada de PII em `working/` ou `voc/` sem necessidade — `@cao/guardrails` faz scrub.
- Provisionamento de tenant novo = copiar `_template/` para `<tenant_id>/`.

## Nota bruta vs memória curada

| | Bruto | Curado |
|---|---|---|
| Origem | execução de agente, log automático, draft humano | filtragem manual ou via `learning-memory-curation` |
| Local | `working/` (tenant), `audit/` (tenant), `12_reports/` | `facts/` (tenant), `vault/projects/<projeto>/` (operacional) |
| Garantia | nenhuma — pode ter ruído, contradição, PII | revisada, com `confidence` ou contexto explícito |
| Quem confia | só o agente que escreveu | qualquer agente / qualquer humano da equipe |

**Promover bruto → curado é ato deliberado.** Nenhum agente promove sozinho hoje. Critérios e formato em [`vault/projects/commerce-agent-os/run-summaries/README.md`](vault/projects/commerce-agent-os/run-summaries/README.md).

## Multi-operador

Cérebro é compartilhado via GitHub. Múltiplos PCs, múltiplos operadores (humanos + Claudes) editam o mesmo conteúdo. Para evitar bagunça:

- **Arquivos curados são pequenos e focados** → conflitos raros.
- **Logs são append-only** → conflitos viram entradas em paralelo, não merges difíceis.
- **`source-of-truth.md`** define qual arquivo é autoridade para cada pergunta.
- **`sync-protocol.md`** define o ritual de início/fim de sessão e como promover bruto → curado.

## Quem escreve em vault de tenant

| Agente | Escreve em |
|---|---|
| `memory-context` | só lê |
| `learning-memory-curation` | reorganiza, promove para `facts/`, demote/delete em `working/` |
| `competitor-benchmark` | `competitor-benchmark/<competitor>/<timestamp>.md` (append) |
| `reviews-ops` | `voc/` |
| qualquer agente | `audit/` (via `@cao/observability`) |

## Como outputs do sistema alimentam o cérebro

Hoje 100% manual (automação fica para depois):

1. Agente executa → output em `12_reports/` ou audit log de tenant.
2. Operador decide se o output merece resumo curado (critérios em [run-summaries/README.md](vault/projects/commerce-agent-os/run-summaries/README.md)).
3. Resumo entra em `vault/projects/commerce-agent-os/run-summaries/<date>-<kind>-<slug>.md`.
4. Linha de index em `run-summaries/index.md`.
5. Se gerou ação → `next-actions.md` ou `operational-priorities.md`.
6. Se mudou estado → `current-state.md` / `ops-brief.md`.
7. 1 linha em `session-log.md`.

## Não fazer

- Não commitar conteúdo de `vault/<tenant_id>/` em git. `vault/_template/` e `vault/projects/` **podem** ser commitados.
- Não armazenar binários — só refs (URLs/IDs).
- Não duplicar docs de `00_meta/` ou `02_architecture/adr/` aqui — sempre linkar.
- Não editar log append-only (correção = nova entrada).
- Não criar arquivo novo no cérebro antes de checar [`source-of-truth.md`](vault/projects/commerce-agent-os/source-of-truth.md).
