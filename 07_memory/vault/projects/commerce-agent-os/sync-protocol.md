---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-27T20:35:00Z
tags: [protocol, sync, multi-operator]
source: human:incluobrasil
confidence: 1.0
---

# Sync Protocol

**Para que serve:** protocolo de baixa burocracia para múltiplos operadores em máquinas diferentes coexistirem no cérebro **sem perder contexto, sem sobrescrever trabalho alheio, e sem precisar de automação**.

**Como usar:** ler 1 vez. Voltar quando: (a) for editar arquivo curado, (b) for promover output bruto para curado, (c) suspeitar de conflito.

**Output que gera:** convenção compartilhada — qualquer operador novo sabe como entrar sem quebrar nada.

---

## Princípios

1. **Git é o substrato.** O cérebro vive em `07_memory/vault/projects/commerce-agent-os/` no repo `commerce-agent-os` (commitado). Quem está mais atualizado é quem fez `git pull` mais recente.
2. **Arquivos curados são pequenos e focados** → conflitos são raros e fáceis de resolver.
3. **Logs são append-only** → conflitos viram entradas em paralelo, não merges.
4. **Convenção forte > automação.** Operador segue o protocolo manualmente; agentes seguem o mesmo protocolo no futuro.

---

## Antes de começar uma sessão

1. `git fetch && git pull --rebase` (ou estratégia padrão da equipe).
2. Ler **nesta ordem** (≤ 5 min):
   1. [current-state.md](current-state.md) — onde estamos.
   2. [handoff-log.md](handoff-log.md) topo — alguém deixou trabalho?
   3. [next-actions.md](next-actions.md) — o que pegar.
   4. [blockers-and-risks.md](blockers-and-risks.md) se houver bloqueio relacionado.
3. Decidir foco da sessão. Se vai pegar item de `next-actions.md` em colaboração, anunciar (canal de equipe ou em [session-log.md](session-log.md)) para evitar duas pessoas no mesmo item.

## Durante a sessão

1. Trabalhar em **branch** se for tocar código (`feat/`, `fix/`, `chore/`, `docs/`). Cérebro pode ser editado em `main` direto **se mudança for curta e local** (item de checklist, atualização de status); ainda assim PR é recomendado se for múltiplos arquivos.
2. Ao editar arquivo curado:
   - Bater `updated_at` no frontmatter.
   - Manter o arquivo curto. Se crescer demais, dividir.
   - Não duplicar conteúdo de outro arquivo curado — linkar.
3. Ao escrever em arquivo append-only ([session-log.md](session-log.md), [handoff-log.md](handoff-log.md), `<tenant>/audit/...`):
   - Adicionar **no topo** (entradas mais recentes primeiro).
   - Nunca editar entrada antiga (correção = entrada nova).
4. Quando sistema produzir output relevante em `12_reports/` ou audit log:
   - Decidir se vira [run-summary](run-summaries/) (critérios em [run-summaries/README.md](run-summaries/README.md)).
   - Se sim, copiar [`_template.md`](run-summaries/_template.md), preencher, registrar em [run-summaries/index.md](run-summaries/index.md).

## Ao encerrar sessão

| Situação | O que registrar |
|---|---|
| Tudo limpo (commits pushados, sem WIP) | 1 entrada em [session-log.md](session-log.md). Pronto. |
| WIP aberto, ambiente meia-pronto, alguém pode continuar | 1 entrada em [handoff-log.md](handoff-log.md) **+** 1 em `session-log.md`. |
| Mudou estado do projeto (fase/marco/semáforo) | Atualizar [current-state.md](current-state.md) **e** [ops-brief.md](ops-brief.md) se semáforo mudou. |
| Decisão arquitetural | Abrir ADR + atualizar [decision-index.md](decision-index.md). |
| Bloqueio novo descoberto | Adicionar em [blockers-and-risks.md](blockers-and-risks.md). |
| Item concluído | Remover de [next-actions.md](next-actions.md) e/ou [operational-priorities.md](operational-priorities.md). |

Commit final com mensagem Conventional (`docs(brain): ...`, `chore(brain): ...`). Push.

---

## Fechamento de sessão Claude (anti-compactação)

Sessões do **Claude Code / Claude.ai** têm uma característica que sessões humanas não têm: o **contexto compacta** quando fica longo, e mudanças importantes podem ser perdidas se não forem registradas no vault antes disso.

Regra para operador-Claude (humano que usa Claude, ou agente Claude direto):

| Gatilho | Ação obrigatória |
|---|---|
| Encerrou trabalho significativo (commit, marco, mais de ~5 mudanças relevantes) | 1 entrada em [session-log.md](session-log.md) **antes** de pedir nova tarefa |
| Conversa Claude longa (>30 turnos, perto da compactação) | Curar 1 run-summary com as decisões importantes da sessão |
| WIP aberto que outra pessoa/sessão pode continuar | 1 entrada em [handoff-log.md](handoff-log.md) com branch + próximo passo |
| Decisão arquitetural ou mudança de fase | Atualizar [current-state.md](current-state.md), [ops-brief.md](ops-brief.md), [decision-index.md](decision-index.md) conforme aplicável |

Bootstrap obrigatório está em [`CLAUDE.md`](../../../../CLAUDE.md) raiz do repo — 4 arquivos para ler ao abrir sessão.

**Por que isso importa:** sem registro no vault, próxima sessão Claude começa cega. Cégo + contexto longo = alucinação sobre estado do projeto. Vault registrado = próxima sessão lê os 4 arquivos do bootstrap e parte do estado real.

---

## Identidade do operador

Para identificar quem fez o quê:

- **No frontmatter (`source:`):** `human:<handle>` (ex.: `human:incluobrasil`). Handle = parte antes do `@` no email primário, kebab-case se necessário.
- **No corpo (handoff/session):** mesmo `handle` no campo `Operador:`.
- **Para agentes:** `agent:<name>` (sem `human:`).
- **Máquina/contexto** (handoff): hostname curto ou descrição (`Windows 11 / VSCode + Claude Code`, `MacBook Pro / Cursor`).

Não usar nome completo nem email — handle é suficiente e não polui git diff.

---

## Resolvendo conflito de merge

| Tipo de arquivo | Estratégia |
|---|---|
| Curado (`current-state.md`, `operational-priorities.md`, etc.) | Merge manual. O conteúdo de cada lado é pequeno; ler os dois e consolidar. Bater `updated_at` para `now`. |
| Append-only (`session-log.md`, `handoff-log.md`) | Aceitar ambas as entradas — colocar a mais recente no topo. Nunca descartar. |
| Run-summary curado | Cada resumo é arquivo próprio com data no nome → conflito de filename é praticamente impossível. Conflito de conteúdo = merge manual. |
| ADR / oficial | Resolver em PR. Se duas propostas conflitam, abrir uma terceira ADR de resolução. |

---

## Promover output bruto → memória curada

Disparado por: agente rodou, audit gerou relatório, teste falhou de forma reveladora, marco bateu.

1. Decidir se vale resumir (critérios em [run-summaries/README.md](run-summaries/README.md) — "Quando criar").
2. Copiar [`_template.md`](run-summaries/_template.md) → `run-summaries/<YYYY-MM-DD>-<kind>-<slug>.md`.
3. Preencher (ver formato no template).
4. Adicionar 1 linha em [run-summaries/index.md](run-summaries/index.md).
5. Se gerou ação, mover para [next-actions.md](next-actions.md) ou [operational-priorities.md](operational-priorities.md).
6. Se mudou decisão/semáforo/bloqueio, atualizar [decision-index.md](decision-index.md), [ops-brief.md](ops-brief.md), [current-state.md](current-state.md), [blockers-and-risks.md](blockers-and-risks.md) conforme aplicável.
7. 1 linha em [session-log.md](session-log.md) apontando para o resumo novo.

---

## Anti-padrões

- ❌ Editar `current-state.md` sem ler `handoff-log.md` antes.
- ❌ Adicionar conteúdo novo no cérebro quando já existe lugar para ele (ver [source-of-truth.md](source-of-truth.md)).
- ❌ Reescrever entrada antiga em arquivo append-only.
- ❌ Pular `updated_at` no frontmatter ao editar curado.
- ❌ Esperar coordenação assíncrona perfeita — o protocolo aceita imperfeição e prefere convenção curta.

---

## Quando este protocolo evolui

Mudanças aqui são mudanças de processo. Editar exige:
1. Atualizar este arquivo.
2. Anunciar em [session-log.md](session-log.md) ("protocol updated — read sync-protocol.md").
3. Se for mudança estrutural (novo arquivo no cérebro, nova categoria), abrir ADR.
