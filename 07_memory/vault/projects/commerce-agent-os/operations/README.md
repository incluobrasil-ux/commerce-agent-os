---
aliases: [Mapa Operacional, Operations Map, Visão Principal]
tags: [operations-map, index]
---

# Mapa Operacional do `commerce-agent-os`

**Visão visual principal:** abrir [[operations-map.canvas|operations-map]] (Canvas nativo do Obsidian — `Ctrl+P` → "operations-map").

**Para que serve:** dar a qualquer operador, em 1 olhada, uma compreensão visual de quem faz o quê no sistema. Camada amigável **acima** do código técnico — não substitui, complementa.

## Como ler o mapa

```
                  [Radar da Operação]
                          │
                          │ sinais
                          ▼
[Painel do Operador] → [CHEFE DA OPERAÇÃO] → [Mesa de Comando]
       │ humano             │                       │
       │                    │ decide rota           │ contém
       │                    ▼                       ▼
       │           [Motor dos Agentes]    [registry · playbooks · planner · runner · gate]
       │                    │
       │                    ▼
       └──────────►  Terminal Determinístico  ◄── consulta ──  Núcleo das Regras
                    Terminal LLM                                (core + legal BR/EU/US)

[Oficina Técnica]   [Guia da Equipe]   [Tarefas em Espera]
   build/CI/QA          docs/onboarding      bloqueios externos
```

**Centro do mapa:** [[chefe-da-operacao]] — toda execução composta passa por ele.

**Cores das categorias** (consistentes no Canvas):

| Cor | Categoria | Componentes |
|---|---|---|
| 🟡 dourado | Liderança | [[chefe-da-operacao]] |
| 🟣 roxo | Orquestração | [[mesa-de-comando]] |
| 🟦 ciano | Observação | [[radar-da-operacao]] |
| 🟢 verde | Interface humana | [[painel-do-operador]] |
| 🟧 laranja | Execução | [[motor-dos-agentes]] |
| 🔵 azul | Regras | [[nucleo-das-regras]] |
| 🩶 cinza | Tooling | [[oficina-tecnica]] |
| 🩷 rosa | Docs | [[guia-da-equipe]] |
| 🟢 verde-escuro | Terminal determinístico | [[terminal-deterministico]] |
| 🟣 roxo-escuro | Terminal LLM | [[terminal-llm]] |
| 🔴 vermelho | Pendências | [[tarefas-em-espera]] |

## Nome amigável ↔ nome técnico

Cada nota deste diretório tem `aliases:` no frontmatter — `Ctrl+O` no Obsidian aceita qualquer alias. Internamente, o código continua usando o nome técnico (`orchestrator-master`, `@cao/orchestration`, etc.) — **nenhum arquivo de código foi renomeado**.

| Amigável | Nome técnico real |
|---|---|
| Chefe da Operação | `orchestrator-master` + `@cao/orchestration` + `pnpm chief` |
| Radar da Operação | `@cao/observability` + `@cao/brain-bridge` |
| Mesa de Comando | `@cao/orchestration/{registry,playbooks,planner,runner,writeback-gate}.ts` |
| Painel do Operador | 24 CLIs `pnpm <verb>:<noun>` em `package.json` |
| Motor dos Agentes | `@cao/runtime` |
| Núcleo das Regras | `@cao/core` + `@cao/shared-types` + `@cao/orchestration/legal.ts` |
| Oficina Técnica | biome + tsc + vitest + gitleaks + commitlint + CI |
| Guia da Equipe | `README.md` + `00_meta/` + `SETUP_LOCAL.md` + `COMMANDS.md` |
| Terminal Determinístico | `repo-auditor`, `catalog-feed-ops`, `audit-synthesizer` |
| Terminal LLM | 17 agentes Tier-2+ (marketing/creative/design/...) |
| Tarefas em Espera | `next-actions.md` + `blockers-and-risks.md` |

## O que NÃO entra neste mapa (por design)

- `_template/` e `templates/` — esqueletos, ficam isolados no grafo
- `03_agents/<name>/AGENT.md` — declaração de cada agente individual (fica no código)
- `02_architecture/adr/*.md` — decisões arquiteturais (linkadas via [[../decision-index]])
- `06_packages/<name>/README.md` — docs por package (vivem ao lado do código)
- `12_reports/*` — relatórios standalone gerados por runs antigos

Esses são **docs técnicas**, não cérebro operacional vivo. O mapa cobre apenas o que opera ativamente.

## Como manter o mapa

- **Adicionar componente:** criar nova nota neste diretório + 1 SVG em `icons/` + adicionar nó no Canvas
- **Mudar papel de componente:** editar a nota correspondente (frontmatter + corpo). Não tocar nos arquivos de código
- **Não inflar:** se virou nota > 30 linhas, mover detalhe para a fonte técnica (registry, README do package, ADR) e deixar só pointer

Política de mudança em [[../project-home]] e [[../sync-protocol]].
