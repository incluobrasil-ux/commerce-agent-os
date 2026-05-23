# Fase 1 (setup) — sumário executivo

**Data:** 2026-05-23. **Status:** concluída. **Versão do scaffold:** 0.1.

> "Fase 1" aqui é a **macro-fase de setup/scaffold do monorepo** — cobre o que o `ROADMAP.md` interno chama de Fases 0 a 4 + os pré-trabalhos das fases 8–12. Resultado: arquitetura completa, zero implementação de domínio.

## O que entregamos

### Estrutura

```
commerce-agent-os/
├─ 00_meta/         6 docs canônicos (PROJECT_SCOPE, SUCCESS_CRITERIA, ROADMAP,
│                   DECISIONS, STACK_RULES, REPO_SELECTION) + glossary + upstreams_index
├─ 01_upstreams/    vazio — 20 repos classificados mas não clonados
├─ 02_architecture/ 5 ADRs + 6 integration maps + 20 repo-audits + project-map
│                   + integration-map + security-overview + qa-governance-map
├─ 03_agents/       17 agentes em 7 tiers; cada um com schema (AGENT.md + prompt
│                   + contract.yaml + tools.yaml + tests/); 11 com flows.md +
│                   fixtures JSON; 4 com state-machine.md
├─ 04_apps/         7 apps scaffoldados (shopify-theme + shopify-admin-app
│                   completos; merchant/feed/review/creative/analytics-service)
├─ 05_integrations/ 7 adapters com contratos TS (shopify, google-merchant,
│                   google-ads stub, brightdata, posthog, higgsfield,
│                   review-apps multi-provedor + 6 providers stub)
├─ 06_packages/     12 packages @cao/* com package.json + tsconfig + src/index.ts
│                   + README (core, config, llm, runtime, memory, guardrails,
│                   skills, observability, shopify-client, shared-types,
│                   shared-schemas, shared-config)
├─ 07_memory/       vault template (_template/ com facts/working/voc/
│                   competitor-benchmark/audit)
├─ 08_data/         placeholder (.gitkeep)
├─ 09_prompts/      12 prompts placeholder (todos "A preencher")
├─ 10_ops/          scripts (check-env, validate-structure, bootstrap) +
│                   security/ (checklist operacional ~50 itens)
├─ 11_tests/        5 camadas: smoke (funcional) + contract/integration/e2e/
│                   performance (READMEs com testes previstos)
└─ 12_reports/      5 readiness audits + 1 benchmark + REPO_SELECTION (em 00_meta)
                    + este summary
```

**434 arquivos totais.** `validate-structure.sh` verde.

### Contagens por camada

| Camada | Contagem | Notas |
|---|---|---|
| Agentes | 17 (7 tiers) | 11 com flows.md + fixtures; 6 só schema (Tier 0 meta + design/traffic) |
| Apps | 7 | 2 completamente scaffoldados (shopify-theme + admin-app); 5 com src/ stub |
| Integrações | 7 | Todas com contratos TS; nenhuma com implementação |
| Packages internos | 12 (`@cao/*`) | Todos com `package.json` + `tsconfig` + `src/index.ts` stub |
| ADRs | 5 | 0001-monorepo, 0002-upstream, 0003-agent-layer, 0004-shared-pkgs, 0005-vault |
| Integration maps detalhados | 6 | shopify, google-merchant, higgsfield, reviews, posthog, qa-governance |
| Readiness audits | 5 | shopify, merchant-feed-seo, reviews, analytics, security-qa |
| Upstreams classificados | 20 | em `REPO_SELECTION.md` com prioridade; **nenhum clonado** |

## O que **funciona agora** (executável)

- `bash 10_ops/scripts/validate-structure.sh` ✅
- `bash 11_tests/smoke/structure.smoke.sh` ✅
- Estrutura completa navegável (CLAUDE.md → docs canônicos → maps → flows → fixtures).
- `@cao/shared-config` exporta `SECRET_NAMES` real.
- `@cao/shared-types` exporta branded types `TenantId`, `AgentName`.
- Adapters em `05_integrations/{shopify, google-merchant, review-apps, higgsfield, posthog}` expõem **interfaces TS reais** (`declare function`).
- Errors classes em todos os adapters são código real (não stub).
- Taxonomia PostHog (events + properties) é YAML canônico consumível.
- 11 agentes têm fixtures válidos.

## O que **NÃO funciona ainda** (esperado — é scaffold)

- `pnpm install` nunca rodou. Sem `node_modules`, sem ferramentas.
- Nenhuma das `declare function` tem corpo.
- Nenhum upstream clonado em `01_upstreams/`.
- Nenhum agente roda end-to-end.
- Nenhuma chamada de rede real.
- Nenhum teste vitest existe (só smoke shell).
- `09_prompts/` continua placeholder.
- 6 agentes sem `flows.md` ainda (Tier 0 meta + design + traffic).

## Decisões tomadas

ADRs aceitos:
- **ADR-0001** — layout numerado por área (`00_meta`…`12_reports`).
- **ADR-0002** — `01_upstreams/` read-only; 3 métodos de ingestão.
- **ADR-0003** — agentes em tiers; `@cao/runtime` único; guardrails enforced.
- **ADR-0004** — separação `shared-types`/`shared-schemas`/`shared-config` vs `core`/`config`.
- **ADR-0005** — layout do vault de memória markdown-first.

Decisões implícitas adotadas (a formalizar em ADR):
- Naming convention completa (em `STACK_RULES.md`).
- Taxonomia PostHog canônica (events + properties).
- Scope `@cao/*` para todos os packages internos.
- TypeScript default; Python só em sidecar isolado.
- Adapter pattern em `05_integrations/`: client + types + errors + (webhooks quando aplicável).
- Markdown-first para memória (`07_memory/`); embeddings opcionais.
- Multi-tenant isolation enforced no `tenant_id` em todo path.

## Convenções estabelecidas

- Pastas raiz numeradas; internas em kebab-case.
- Docs canônicos em `00_meta/` em UPPERCASE.md.
- Naming de evento PostHog: `<surface>.<verb>` snake_case.
- Naming de package: `@cao/<kebab-case>`.
- Agente: pasta com 5 arquivos obrigatórios + opcional state-machine + flows.
- Integração: pasta com client/types/errors (+ webhooks quando aplicável).
- UTM convention obrigatória para attribution: `utm_campaign=initiative_id`, `utm_content=asset_id`.
- Header de origem obrigatório em adaptações de upstream.

## Como navegar a partir daqui

1. **Quero entender o que esse projeto é** → [`00_meta/PROJECT_SCOPE.md`](../../00_meta/PROJECT_SCOPE.md)
2. **Quero ver o mapa de domínio** → [`02_architecture/domain-model/project-map.md`](../../02_architecture/domain-model/project-map.md)
3. **Quero entender um agente específico** → `03_agents/<agente>/AGENT.md` + `flows.md`
4. **Quero entender uma integração** → `02_architecture/integrations/<provider>-map.md`
5. **Quero saber por que algo foi decidido** → [`00_meta/DECISIONS.md`](../../00_meta/DECISIONS.md) (índice) → `02_architecture/adr/`
6. **Quero saber o que falta para algo rodar** → `12_reports/audits/<area>-readiness.md`
7. **Quero saber os gaps consolidados** → [`12_reports/audits/phase-1-gap-analysis.md`](../audits/phase-1-gap-analysis.md)
8. **Quero saber a próxima ação concreta** → [`10_ops/scripts/NEXT_STEPS.md`](../../10_ops/scripts/NEXT_STEPS.md)

## Indicadores de saúde da Fase 1

| Indicador | Estado |
|---|---|
| Coerência arquitetural | ✅ apps → agentes → packages → integrations seguido em toda a árvore |
| Coerência de contratos | ✅ todo agente tem schema; todo adapter tem interface tipada |
| Coerência cross-fase | ✅ Shopify ↔ Merchant ↔ Reviews ↔ Marketing ↔ Analytics ↔ Security se referenciam mutuamente sem dangling links |
| Documentação de governança | ✅ docs canônicos UPPERCASE em `00_meta/`; 5 ADRs |
| Estratégia de QA | ✅ 5 camadas declaradas com tempo alvo e quando rodam |
| Política de segurança | ✅ defense in depth + checklist operacional + política de upstream |
| Cobertura de fixtures | 🟡 11 de 17 agentes (Tier 0 meta + design/traffic faltam) |
| Prompts operacionais | 🟡 0 de 12 preenchidos |
| Build verde | 🔴 nunca rodou (`pnpm install` pendente) |
| Implementação real | 🔴 zero código de domínio |

🔴 esperado para fim da Fase 1.

## Próxima macro-fase (Fase 2 — implementação)

Detalhe em [`10_ops/scripts/NEXT_STEPS.md`](../../10_ops/scripts/NEXT_STEPS.md). Sequência proposta:

1. Bootstrap funcional (`pnpm install` + typecheck + smoke verde).
2. Ingestão de upstreams alta prioridade.
3. `@cao/runtime` mínimo + `repo-auditor` como primeiro agente real.
4. Shopify connect.
5. Merchant feed.
6. Analytics instrumentação.
7. Reviews ingestão.
8. Marketing/Creative.
9. Hardening + release v1.
