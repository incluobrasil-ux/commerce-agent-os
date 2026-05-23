---
created_at: 2026-05-23T22:40:00Z
updated_at: 2026-05-23T22:40:00Z
tags: [audit, sub-fase-2-3, upstreams, license, repo-auditor]
source: agent:repo-auditor
kind: audit
result: yellow
confidence: 1.0
related:
  - 12_reports/audits/upstream-pass2/
  - 00_meta/REPO_SELECTION.md
  - 10_ops/scripts/clone-upstreams.sh
---

# Sub-fase 2.3 — pass 2: 10 upstreams auditados

## Contexto

Sub-fase 2.3 executada de ponta a ponta: 8 upstreams novos clonados via `clone-upstreams.sh` (+ os 2 anteriores, totalizando 10/10 dos prioritários do `REPO_SELECTION.md`). `repo-auditor` rodado em cada um com output em `12_reports/audits/upstream-pass2/`. Detector de licença evoluiu para reconhecer AGPL-3.0 e ignorar templates `.env.{template,sample,dist}`.

## O que aconteceu

**Clones (10/10 ok, zero falhas):**

| Repo | Pin SHA | Tamanho |
|---|---|---|
| dawn | `9ccdacf8` | 6.2M |
| merchant-api-samples | `371468ac` | 4.7M |
| feedgen | `cf264a5f` | 4.4M |
| basic-memory | `a7e2368f` | 12M |
| agentshield | `25d91f00` | 5.3M |
| ad-factory-agent | `8596feeb` | 1.3M |
| higgsfield-skills | `5af02582` | 585K |
| higgsfield-cli | `46cc997c` | 514K |
| langgraph (já existia) | `d1e2ff05` | 17M |
| shopify-app-template-react-router (já existia) | `5a0017b0` | 323K |

Total ~52MB local. Nenhum upstream entra no repo (gitignored).

**Audits — pass 1 (com detector v1):**
- 8/10 verdes (MIT/Apache confirmados).
- basic-memory: license UNKNOWN (warning) — falso negativo, é AGPL-3.0.
- ad-factory-agent: 2 críticos (sem LICENSE + `.env.template` flagado como secret).

**Melhoria do detector aplicada:**
- `SPDX_PATTERNS` ganha `AGPL-3.0` (`"GNU AFFERO GENERAL PUBLIC LICENSE"` + `"Version 3"`).
- Scan de `.env` agora exclui sufixos `.example`, `.template`, `.sample`, `.dist` (todos templates legítimos).
- +2 testes (71 → 73 verdes).

**Audits — pass 2 (após melhoria):**
- 9/10 verdes (incluindo basic-memory agora reportando AGPL-3.0).
- ad-factory-agent continua 1 crítico real: **sem LICENSE** → "all rights reserved".

## Achados / decisões

**Licenças confirmadas (alta confiança):**
- MIT: langgraph, shopify-app-template-react-router, dawn, agentshield, higgsfield-skills, higgsfield-cli.
- Apache-2.0: merchant-api-samples, feedgen.
- **AGPL-3.0: basic-memory** — copyleft forte; código importado obriga todo o nosso projeto a virar AGPL.
- **UNKNOWN/proprietário: ad-factory-agent** — sem LICENSE file = "all rights reserved" por default.

**Impactos de classificação (vs `REPO_SELECTION.md` original):**

| # | Antes | Depois | Razão |
|---|---|---|---|
| 7 (basic-memory) | base operacional (07_memory + 06_packages/memory) | **referência conceitual apenas** | AGPL-3.0 impede adaptação de código sem ADR explícito aceitando AGPL para o projeto inteiro |
| 17 (ad-factory-agent) | base operacional (03_agents/ad-factory) | **referência apenas — não copiar** | Sem LICENSE = uso comercial = risco legal. Reabrir issue com autor antes de adotar |

**Achados técnicos do detector:**
- `langgraph` é Python primário (`libs/langgraph-js/` é o submódulo TS) — nosso `@cao/runtime` continua usando LangGraph **só como referência de design** (ADR-0007).
- `feedgen` é Python puro — ADR-0011 (sidecar vs port) continua pendente; agora há código real para basear a decisão.
- `higgsfield-cli` não tem `.gitignore` no upstream (warning informativo, não afeta nosso uso).
- Detector ainda é shallow: só checa root para `package.json`/`tsconfig`/`README`; multi-language repos como langgraph podem ser sub-detectados.

## Impacto

- **Sub-fase 2.3 fechada de verdade** (era parcial — 2/10 antes, agora 10/10).
- Bloqueio histórico "premissas dos audits originais não verificadas" → 7 das 8 `⚠ verificar` resolvidas (faltam #14 e #16, baixa prioridade).
- 2 mudanças de classificação no `REPO_SELECTION.md` (basic-memory + ad-factory-agent) — afetam Sub-fases 2.5+/2.11.
- Detector evoluiu de v1 para v2 (AGPL + env templates) — testado contra 10 repos reais; cobertura mais confiável para próximas auditorias.
- ADR-0011 (feedgen Python) agora pode ser decidida com base em código real.

## Ações geradas

- [ ] **Decisão de roadmap:** confirmar reclassificação de #7 e #17 — atualizar planejamento de `@cao/memory` (não usar basic-memory como base operacional; manter `@cao/memory` standalone como está) e `03_agents/ad-factory` (rebatizar como "scratch reference"; futuro agente de creative virá de outra fonte).
- [ ] **ADR-0011** — agora desbloqueada para decisão. Recomendação: sidecar Python via subprocess (não port).
- [ ] **Apache-2.0 patterns** no detector — adicionar matcher alternativo (similar ao MIT) já que vimos 2 repos com Apache. Atualmente funciona pelos 2, mas variantes de header podem quebrar.
- [ ] **Aprofundar `repo-auditor`** quando relevante: caminhar para sub-diretórios (`libs/`, `packages/`) para detectar multi-language repos.
- [ ] Quando #14, #16 entrarem em sub-fase: clonar + auditar (mesma pipeline).

## Referências

- relatórios completos: [`12_reports/audits/upstream-pass2/`](../../../../../12_reports/audits/upstream-pass2/)
- manifest pinned: [`10_ops/scripts/clone-upstreams.sh`](../../../../../10_ops/scripts/clone-upstreams.sh)
- classificação atualizada: [`00_meta/REPO_SELECTION.md`](../../../../../00_meta/REPO_SELECTION.md) seção "Audit pass 2"
- detector v2: [`03_agents/repo-auditor/src/index.ts`](../../../../../03_agents/repo-auditor/src/index.ts) (`SPDX_PATTERNS` + `ENV_TEMPLATE_SUFFIXES`)
