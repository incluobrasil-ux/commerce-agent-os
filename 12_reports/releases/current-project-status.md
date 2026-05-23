# Current project status

**Data:** 2026-05-23
**Branch:** `main`
**Tag de referência:** `v0.1.0-architecture-baseline`
**Repo:** https://github.com/incluobrasil-ux/commerce-agent-os

## Resumo executivo

`commerce-agent-os` está em **baseline arquitetural estável**. Todas as decisões estruturais foram tomadas (8 ADRs aceitos), todas as áreas do domínio estão documentadas (17 agentes, 7 apps, 7 integrações, 12 packages) com contratos TypeScript e fixtures de teste. O build local roda verde (`pnpm install + typecheck + lint + smoke`) e CI no GitHub Actions valida cada PR.

**Nada de lógica de negócio foi implementado.** Os arquivos `.ts` de domínio são `export {}` ou apenas tipos. Nenhum agente executa, nenhuma loja Shopify está conectada, nenhuma chamada LLM é feita.

O projeto é hoje um **briefing técnico executável**: alguém clona, `pnpm install`, e tem prova viva de que a planta está consistente. Não é um produto.

A próxima sub-fase concreta (2.3 — ingestão de upstreams) é puramente operacional, baixo risco, destrava a Sub-fase 2.4 onde a implementação real começa.

## Entregáveis concluídos

### Governança e decisões
- 6 docs canônicos UPPERCASE em `00_meta/` (PROJECT_SCOPE, SUCCESS_CRITERIA, ROADMAP, DECISIONS, STACK_RULES, REPO_SELECTION).
- 8 ADRs aceitos:
  - ADR-0001 — estrutura do monorepo
  - ADR-0002 — política de upstreams
  - ADR-0003 — estratégia da camada de agentes
  - ADR-0004 — packages compartilhados
  - ADR-0005 — layout do vault de memória
  - ADR-0006 — stack de QA (vitest + biome + zod + gitleaks + simple-git-hooks + commitlint)
  - ADR-0009 — scope `@cao/` confirmado
  - ADR-0017 — Conventional Commits 1.0.0

### Arquitetura
- 6 integration maps detalhados (Shopify, Google Merchant, Reviews, Higgsfield, PostHog, Google Ads).
- 20 audits de upstreams classificados por papel e prioridade.
- Project map + integration map + security overview + qa-governance map.
- 5 readiness audits + 1 benchmark de stack marketing/creative.

### Scaffold técnico
- 17 agentes em 7 tiers (cada um com AGENT.md + prompt.md + contract.yaml + tools.yaml + tests/; 11 com flows.md + fixtures JSON; 4 com state-machine.md).
- 7 apps scaffoldados (shopify-theme com estrutura Liquid completa; shopify-admin-app com React Router config; 5 serviços headless).
- 7 adapters de integração com contratos TS (client, types, errors) — Shopify, Google Merchant, Review-apps multi-provedor (6 providers), Higgsfield, PostHog, BrightData, Google Ads stub.
- 12 packages `@cao/*` com `package.json` + `tsconfig.json` + `src/index.ts` + README.
- Taxonomia PostHog canônica (events-taxonomy.yaml + properties-taxonomy.yaml).
- Vault template em `07_memory/vault/_template/`.

### Bootstrap funcional
- `pnpm install` verde (24 workspace projects, devDeps pinadas).
- `pnpm typecheck` verde (tsc -b sem erros).
- `pnpm lint` verde (biome — 128 arquivos).
- `pnpm test:smoke` verde (3 testes / 1 arquivo / ~540ms).
- CI workflow em `.github/workflows/ci.yml` rodando lint + typecheck + smoke + commitlint.

### Operacional
- `10_ops/security/security-checklist.md` com ~50 itens em 11 categorias.
- 5 camadas de teste declaradas (smoke funcional, contract/integration/e2e/performance stubs).
- `10_ops/scripts/NEXT_STEPS.md` com 12 sub-fases mapeadas (2.0 → 2.11).

### Publicação
- Repo público em `incluobrasil-ux/commerce-agent-os`.
- Tag `v0.1.0-architecture-baseline` apontando para `9bd369b`.
- LICENSE MIT.
- 2 commits Conventional Commits limpos.

## Lacunas atuais

### Bloqueios para próximas sub-fases

| Lacuna | Bloqueia | Sub-fase |
|---|---|---|
| Nenhum upstream clonado em `01_upstreams/` | validação de premissas (higgsfield, agentshield, feedgen, template Shopify) | 2.3 |
| `@cao/runtime` não implementado | execução de qualquer agente | 2.4 |
| `@cao/memory` não implementado | persistência de estado de agente | 2.4 |
| `@cao/guardrails` não implementado | validação/sanitização em runtime | 2.4 |
| `@cao/llm` não implementado | chamada de modelo (Anthropic/Gemini) | 2.4 |
| `@cao/observability` não implementado | instrumentação PostHog real | 2.4 / 2.8 |
| Shopify Partners + dev store não configurados | conexão Shopify | 2.6 |
| Conta Google Cloud + Merchant Center não criada | feed Google | 2.7 |
| Projeto PostHog não criado + API keys ausentes | analytics | 2.8 |
| Provider de reviews não confirmado (Judge.me proposto) | reviews-ops | 2.9 |

### Decisões ainda em queue (não bloqueiam imediatamente)

- ADR-0007 — runtime alvo (TS via LangGraph JS) — necessário antes da 2.4
- ADR-0008 — worker queue
- ADR-0010 — DB de aplicação para prod
- ADR-0011 — estratégia para `feedgen` (Python port vs sidecar)
- ADR-0012 — provider de reviews
- ADR-0013 — PostHog cloud vs self-host
- ADR-0014 — provedor de mídia (image/video)
- ADR-0015 — object storage
- ADR-0016 — secret manager

### Lacunas operacionais (polish da Sub-fase 2.1/2.2)

- Binário `gitleaks` instalado localmente + pre-commit ativado via `npx simple-git-hooks`.
- `10_ops/scripts/check-env.sh` e `bootstrap.sh` populados com checks reais.
- Branch protection em `main` no GitHub (Settings → Branches).
- 6 agentes ainda sem `flows.md` + fixtures (orchestrator-master, memory-context, repo-auditor, learning-memory-curation, design-ux-localization, traffic-campaigns).

### Lacunas conceituais (longo prazo)

- Nenhuma chamada de rede real testada.
- E2E ambiente staging não montado.
- Performance baselines vazias.
- Override humano em `block` (governance) não modelado no admin-app.
- Política de retenção de `07_memory/` + logs PostHog não definida (afeta LGPD/GDPR).

## Próxima sub-fase

**Sub-fase 2.3 — ingestão de upstreams de alta prioridade.**

Objetivo: popular `01_upstreams/` com 10 upstreams chave (langgraph, shopify-app-template-react-router, dawn, merchant-api-samples, feedgen, basic-memory, agentshield, ad-factory-agent, higgsfield-skills, higgsfield-cli) seguindo a política do ADR-0002 (read-only).

Tipo de trabalho: **operacional**, baixo risco arquitetural. Cada upstream é decidido entre submodule, clone raso, ou referência via SDK (conforme ADR-0002).

Critérios de aceite:
- 10 upstreams presentes em `01_upstreams/`.
- `repo-auditor` rodado (manualmente, por humano) em cada um — licença + secret scan + findings em `12_reports/audits/upstream-pass2/`.
- `00_meta/REPO_SELECTION.md` atualizado removendo flags `⚠ verificar` resolvidas.
- Premissas confirmadas/derrubadas (schema real de skill em higgsfield; stack do template Shopify; heurísticas de feedgen).

Tempo estimado: 1 semana (operacional).

Detalhe em [`10_ops/scripts/NEXT_STEPS.md`](../../10_ops/scripts/NEXT_STEPS.md) seção 2.3.

## Risco principal atual

**Confundir "baseline arquitetural" com "produto funcional".**

Sintomas observáveis:
- Stakeholder lê o repo e assume que pode instalar em uma loja Shopify hoje.
- Colaborador novo começa a implementar agente sem `@cao/runtime` mínimo, gerando código que precisará ser reescrito.
- Investidor/cliente potencial vê `v0.1.0` e espera demo funcional.
- Vendor/agência cobra valor de produto pronto enquanto o que existe é spec.

Mitigação ativa:
- README.md (atualizado hoje) explicita "main = baseline arquitetural, NÃO release funcional".
- Tag nomeada `v0.1.0-architecture-baseline` em vez de `v0.1.0` puro.
- Este doc (`current-project-status.md`) referenciado no README.
- `12_reports/audits/phase-1-gap-analysis.md` lista 31 gaps por severidade.

Risco residual: alguém ignorar a documentação. Mitigação: comunicação verbal explícita ao apresentar o repo.

### Riscos secundários

- **Decisões em queue acumulando** sem ADR formal — bloqueia Sub-fases 2.4+. Mitigação: ADR-0007 deve ser próximo passo decisional antes de 2.4 começar.
- **Drift entre documentação e código** quando implementação começar. Mitigação: regra em STACK_RULES.md §10 — mudança que altera contrato exige atualização do `contract.yaml` no mesmo commit.
- **Scope creep** na 2.3 (alguém começar a implementar enquanto cloning). Mitigação: 2.3 é estritamente cópia + audit + atualização de REPO_SELECTION; código fica para 2.4.

## Referências cruzadas

- [`README.md`](../../README.md) — overview público.
- [`12_reports/releases/phase-1-setup-summary.md`](./phase-1-setup-summary.md) — sumário detalhado da macro-fase 1.
- [`12_reports/audits/phase-1-gap-analysis.md`](../audits/phase-1-gap-analysis.md) — 31 gaps consolidados por severidade.
- [`00_meta/ROADMAP.md`](../../00_meta/ROADMAP.md) — fases.
- [`00_meta/DECISIONS.md`](../../00_meta/DECISIONS.md) — índice de ADRs.
- [`10_ops/scripts/NEXT_STEPS.md`](../../10_ops/scripts/NEXT_STEPS.md) — checklist executável.
