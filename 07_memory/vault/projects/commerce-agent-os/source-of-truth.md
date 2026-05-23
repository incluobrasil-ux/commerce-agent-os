---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-23T00:00:00Z
tags: [governance, source-of-truth]
source: human:incluobrasil
confidence: 1.0
---

# Source of Truth

**Para que serve:** dizer **qual arquivo é a verdade** para cada tipo de pergunta. Múltiplos operadores em múltiplas máquinas precisam saber onde escrever e onde ler — sem isso, contexto se duplica e contradiz.

**Como usar:** consultar quando estiver na dúvida "atualizo isso aqui ou em outro lugar?". Quando criar conteúdo novo, classificar em uma das 4 categorias abaixo.

**Output que gera:** taxonomia única que cada operador e cada agente pode invocar para evitar duplicação.

---

## 4 categorias de arquivo

| Categoria | Definição | Conflito é grave? | Onde vive |
|---|---|---|---|
| **Oficial / governança** | Verdade canônica do projeto. ADRs, scope, roadmap, success criteria. Editado deliberadamente, sempre em PR revisado. | sim — autoridade | `00_meta/`, `02_architecture/adr/` |
| **Estado curado (cérebro)** | Visão atual da operação. Atualizado continuamente por operadores. | sim — pode confundir equipe | `07_memory/vault/projects/<projeto>/*.md` (este diretório) |
| **Log append-only** | Histórico de eventos — nunca reescrever. | não — só adicionar | `07_memory/vault/projects/<projeto>/handoff-log.md`, `session-log.md`; audit logs por tenant |
| **Raw / temporário** | Output bruto de execução, relatórios automáticos, fixtures. Pode regenerar. | não — descartável | `12_reports/`, `08_data/`, `<tenant>/working/`, `<tenant>/audit/` |

## Mapa por pergunta

| "Onde vejo / onde escrevo…" | Arquivo oficial | Categoria |
|---|---|---|
| O que esse projeto é / não é? | [`00_meta/PROJECT_SCOPE.md`](../../../../00_meta/PROJECT_SCOPE.md) | oficial |
| Roadmap de fases? | [`00_meta/ROADMAP.md`](../../../../00_meta/ROADMAP.md) | oficial |
| Critérios de "feito" por marco? | [`00_meta/SUCCESS_CRITERIA.md`](../../../../00_meta/SUCCESS_CRITERIA.md) | oficial |
| Regras de stack/naming/teste? | [`00_meta/STACK_RULES.md`](../../../../00_meta/STACK_RULES.md) | oficial |
| Decisão arquitetural detalhada? | [`02_architecture/adr/ADR-NNNN-*.md`](../../../../02_architecture/adr/) | oficial |
| Índice operacional de decisões? | [decision-index.md](decision-index.md) | curado |
| Estado curto da operação agora? | [current-state.md](current-state.md) | curado |
| Brief operacional (semáforos)? | [ops-brief.md](ops-brief.md) | curado |
| Fila de prioridades? | [operational-priorities.md](operational-priorities.md) | curado |
| Próximas ações executáveis? | [next-actions.md](next-actions.md) | curado |
| Bloqueios e riscos ativos? | [blockers-and-risks.md](blockers-and-risks.md) | curado |
| Trilhas paralelas e status? | [workstreams.md](workstreams.md) | curado |
| Entrada do cérebro / visão executiva? | [project-home.md](project-home.md) | curado |
| Como múltiplos operadores coexistem? | [sync-protocol.md](sync-protocol.md) | curado |
| Padrão de resumo de execução? | [run-summaries/README.md](run-summaries/README.md) + [`_template.md`](run-summaries/_template.md) | curado |
| Catálogo dos resumos curados? | [run-summaries/index.md](run-summaries/index.md) | curado |
| Resumo curado de execução? | `run-summaries/<date>-<kind>-<slug>.md` | curado |
| Log diário de sessões? | [session-log.md](session-log.md) | append-only |
| Handoff entre operadores/máquinas? | [handoff-log.md](handoff-log.md) | append-only |
| Audit log de agente (por tenant)? | `vault/<tenant_id>/audit/<date>.md` | append-only |
| Relatório bruto de fase / readiness / benchmark? | `12_reports/...` | raw |
| Working memory por tenant? | `vault/<tenant_id>/working/` | raw |

## Quando há dois lugares possíveis

| Caso | Regra |
|---|---|
| Curado vs oficial em conflito | **Oficial vence.** Atualizar o curado para refletir oficial; abrir ADR se a divergência for proposta de mudança. |
| Curado vs append-only | Append-only é histórico (não é fonte de estado). Estado vive no curado. |
| Curado vs raw | Raw alimenta resumos no curado; raw nunca é citado como autoridade. |
| Resumo curado contradiz outro resumo | O mais recente vence; corrigir o antigo com nota de "superseded by <slug>" no topo. |

## Regras

1. **Antes de criar arquivo novo no cérebro, perguntar:** já existe lugar oficial para isso? Se sim, não criar — atualizar lá.
2. **Editar conteúdo curado exige bater `updated_at`** no frontmatter.
3. **Edição de oficial exige PR** (mudança estrutural → ADR).
4. **Append-only nunca é reescrito** — só acréscimo. Correção = nova entrada.
5. **Raw nunca é referenciado como verdade** — vira síntese curada em `run-summaries/` se relevante.
