# ADR-0003 — Estratégia da camada de agentes

- **Data:** 2026-05-23
- **Status:** aceita
- **Supersede:** —

## Contexto

A camada `03_agents/` terá 17+ agentes. Sem uma estratégia clara, isso vira:
- duplicação de tools entre agentes,
- acoplamento direto a SDKs externos,
- agentes que reimplementam memória/guardrails localmente,
- orquestração ad-hoc difícil de raciocinar.

## Decisão

### 1. Tiers (papéis em camadas)

| Tier | Papel | Agentes |
|---|---|---|
| 0 — meta | orquestram, memorizam, auditam, governam | `orchestrator-master`, `memory-context`, `governance-risk-qa`, `repo-auditor`, `learning-memory-curation` |
| 1 — research | coletam contexto externo | `market-intelligence`, `competitor-benchmark` |
| 2 — produto | definem oferta e experiência | `product-offer`, `design-ux-localization` |
| 3 — marketing | direção e criativo | `marketing-director`, `creative-copy-assets`, `traffic-campaigns` |
| 4 — catálogo | publicação e compliance | `product-feed-seo`, `catalog-feed-ops`, `merchant-compliance` |
| 5 — pós-venda | reputação | `reviews-ops` |
| 6 — analytics | medição e otimização | `analytics-optimization` |

Tier 0 vê todos os demais. Tiers 1–6 não chamam agentes de outro tier diretamente — todo cross-tier passa pelo `orchestrator-master`.

### 2. Runtime único

Todos os agentes usam o mesmo runtime através de `06_packages/runtime`, que encapsula LangGraph (ver `01_upstreams/langgraph`). Agentes **não** importam LangGraph diretamente. Isso permite trocar o runtime sem mexer em cada agente.

### 3. Memória centralizada

Acesso a memória só via `06_packages/memory` (encapsula `basic-memory`). Convenção:
- Memória curta (working memory) — em estado do grafo do runtime.
- Memória longa — markdown em `07_memory/<tenant>/<agent>/...`, indexada pelo package.

### 4. Skills como unidades reutilizáveis

Capacidades atômicas (escrever copy, validar feed, gerar imagem, etc.) vivem em `06_packages/skills` e são invocadas pelos agentes como tools. Origem: Higgsfield + e-commerce + marketing (cherry-pick), nunca importar em bloco.

### 5. Guardrails obrigatórios

Toda chamada a tool externa ou LLM passa por `06_packages/guardrails`:
- validação de input/output,
- allow-list de ações destrutivas,
- audit log automático.

Agentes não podem pular guardrails — enforcement via runtime.

### 6. Contrato mínimo de agente

Cada `03_agents/<name>/` expõe:
- `agent.ts` (ou equivalente) — definição declarativa: input schema, output schema, tools, prompt, modelo.
- `README.md` — papel, entradas, saídas, dependências.
- `tests/` — fixtures e testes de comportamento (não unitários do LLM).

Não há "main" no agente. O agente é uma unidade declarativa que o runtime instancia.

### 7. Comunicação entre tiers

- Tier 0 → Tier 1–6: invocação direta via runtime.
- Tier 1–6 → Tier 0: callbacks via runtime (eventos, não chamadas síncronas).
- Tier N → Tier M (M ≠ 0): proibido. Se necessário, o orchestrator-master encadeia.

## Consequências

**Positivas**
- Trocar runtime ou memória não cascateia em 17 lugares.
- Skills reutilizáveis evitam reescrever lógica em cada agente.
- Guardrails enforced no runtime → impossível esquecer.

**Negativas / trade-offs**
- Indireções (agente → package → integration) custam DX inicial.
- Tier 0 vira gargalo se não escalar — mitigação: paralelismo no `orchestrator-master`.

**Riscos a monitorar**
- Acoplamento acidental ao formato Skills da Higgsfield. Se mudar, isolar via interface em `06_packages/skills`.
