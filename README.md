# commerce-agent-os

Sistema operacional de **agentes especializados** para lojistas Shopify — automação de catálogo, feed Google Merchant, marketing, reviews e analytics, sob runtime + memória + guardrails comuns.

> ⚙️ **Estado do projeto (2026-05-25):** núcleo `@cao/*` + **20 agentes reais executáveis** (de 22 catalogados). Pipeline Merchant dry-run end-to-end funciona local com fixture. **Ainda não é produto** — falta conectar credenciais externas (Anthropic, Shopify, GMC) para runs reais.
>
> O que há hoje:
> - **20 agentes REAL_EXECUTABLE** com CLI thin (`pnpm <verbo>:<noun>`), zod schemas, testes reais e graceful `SKIPPED` quando credencial ausente. Catálogo abaixo.
> - **6 packages `@cao/*`** (core, llm, memory, guardrails, observability, runtime) + brain-bridge + 5 integrations (shopify, google-merchant, review-apps, higgsfield, posthog).
> - **Pipeline Merchant dry-run:** `pnpm feed:dry-run` transforma produto (fixture ou Shopify) → valida zod → escreve relatório em `12_reports/merchant-dry-runs/`. **100% local sem credenciais.**
> - **Cérebro operacional multi-operador** em `07_memory/vault/projects/commerce-agent-os/` (current-state, next-actions, workstreams, run-summaries, etc.) com `--capture` integrado.
> - **`pnpm doctor`** — 10 checks cross-platform que validam onboarding em outro PC em < 1 min.
> - Suíte: **228 testes verdes em 33 arquivos**. CI ativo. Branch protection em `main`. 8 ADRs aceitos.
>
> O que **ainda não** há: instalação Shopify real, chamadas LLM em produção (key precisa ser ativada), upload Google Merchant real (apenas dry-run).
>
> Tag de referência: [`v0.1.0-architecture-baseline`](https://github.com/incluobrasil-ux/commerce-agent-os/releases/tag/v0.1.0-architecture-baseline) (snapshot pré-agentes; histórico).

## Em uma frase

Você está olhando para um monorepo Shopify-agents com **20 agentes executáveis** e pipeline Merchant dry-run funcionando local. Clone → `pnpm install` → `pnpm doctor` → `pnpm feed:dry-run` em ≤ 5 min, **sem credenciais externas**.

## Agentes disponíveis

22 agentes catalogados; 20 com CLI real, 1 library-only (`product-feed-seo`), 1 stub (`analytics-optimization`).

| Tier | Agente | Comando | Output |
|---|---|---|---|
| 0 | `orchestrator-master` | `pnpm orchestrate:master` | Plano de execução |
| 1 | `market-intelligence` | `pnpm market:intelligence` | Inteligência de mercado |
| 1 | `competitor-benchmark` | `pnpm competitor:benchmark` | Benchmark competitivo |
| 1 | `reviews-ops` | `pnpm reviews:ops` | Voice-of-customer (temas/dores) |
| 1 | `catalog-feed-ops` | `pnpm feed:dry-run` | Pipeline Merchant dry-run |
| 2 | `product-offer` | `pnpm product:offer` | Hero + value props + bundles |
| 2 | `merchant-compliance` | `pnpm merchant:compliance` | Risco legal/PII em conteúdo |
| 2 | `marketing-director` | `pnpm marketing:plan` | Plano de marketing (iniciativas) |
| 2 | `creative-copy-assets` | `pnpm creative:assets` | Copy variantes + visual brief |
| 2 | `design-ux-localization` | `pnpm design:ux` | PDP blueprint + locale copy |
| 2 | `traffic-campaigns` | `pnpm traffic:plan` | Dry-run media plan |
| 2 | `customer-journey-ops` | `pnpm journey:map` | Mapa de jornada do cliente |
| 2 | `finance-margin-radar` | `pnpm finance:radar` | Radar de margem |
| 2 | `ads-launchpad` | `pnpm ads:plan` | Plano tático de anúncio |
| 2 | `audit-synthesizer` | `pnpm synthesize:audit` | Síntese de auditoria |
| 2 | `learning-memory-curation` | `pnpm curate:memory` | Curadoria de memória |
| 2 | `memory-context` | `pnpm context:brief` | Context brief para tarefa |
| 2 | `visual-asset-ops` | `pnpm visual:asset` | Brief visual (shot list) |
| 3 | `governance-risk-qa` | `pnpm governance:qa` | Verdict (pass/warn/block) |
| 3 | `repo-auditor` | `pnpm audit:repo <path>` | Audit determinístico de repo |
| 3 | _(catalog-feed-ops)_ | `pnpm merchant:audit` | **Score+findings+remediações por SKU (determinístico)** |
| — | `product-feed-seo` | _(library; via `catalog-feed-ops`)_ | SEO otimizado de produtos |
| — | `analytics-optimization` | _(não scaffoldado)_ | _Pendente_ |

## O que este projeto é

Um monorepo que define como **17 agentes especializados** vão operar uma loja Shopify de médio porte:

- **Catálogo + Feed SEO:** otimização de títulos, descrições, atributos para Google Merchant Center.
- **Marketing + Criativo:** plano de campanhas e geração de copy + assets em escala.
- **Inteligência:** mercado, concorrentes, voz do cliente (reviews).
- **Analytics:** funil, atribuição, experimentos via PostHog.
- **Governance:** todo agente passa por `governance-risk-qa` antes de ação destrutiva.

Stack: TypeScript + ESM + pnpm workspaces + LangGraph (a ser ativado) + zod + PostHog + Shopify Admin API + Google Merchant API.

## O que NÃO é (hoje)

- ❌ App instalável em uma loja Shopify
- ❌ Pipeline rodando produtos em produção
- ❌ Agentes invocando LLM e gerando output
- ❌ Substituto para apps comerciais existentes (Simprosys, Yotpo, Judge.me, Klaviyo, etc.)

Para esses casos, consulte [Cenários em `current-project-status.md`](./12_reports/releases/current-project-status.md).

## Status atual

| Macro-fase / Sub-fase | Status | Detalhe |
|---|---|---|
| Fase 0–1 — scaffold + audit upstreams | ✅ | 13 dirs + 10 upstreams clonados/auditados |
| Fase 2 — arquitetura | ✅ | 8 ADRs + integration maps |
| Fase 3a/b — scaffold técnico | ✅ | 22 agentes + 7 apps + 7 integrações + 14 packages |
| Sub-fase 2.1 — bootstrap funcional | ✅ | install + typecheck + lint + smoke verdes |
| Sub-fase 2.2 — núcleo `@cao/*` + CI | ✅ | 6 packages com testes; CI ativo |
| Sub-fase 2.3 — upstreams clonados | ✅ | 10 upstreams auditados via `repo-auditor` |
| Sub-fase 2.5 — agentes (Bloco A+B) | ✅ | **20/22 agentes REAL_EXECUTABLE** (2026-05-25) |
| Sub-fase 2.6 — Shopify minimal | ✅ | Admin client + OAuth helpers + CLI (SKIPPED sem creds) |
| Sub-fase 2.7 — Merchant dry-run | ✅ | `pnpm feed:dry-run` 100% local com fixture |
| Sub-fase 2.4 — LLM end-to-end real | 🟡 | código pronto; **falta ativar `ANTHROPIC_API_KEY` em `.env.local`** |
| Sub-fase 2.8 — Shopify dev store real | 🔴 | depende de criar custom app em Partners (~3 min) |
| Sub-fase 2.9 — GMC upload real | 🔴 | depende de creds Google Merchant (não bloqueia dry-run) |

Detalhe completo: [`12_reports/releases/current-project-status.md`](./12_reports/releases/current-project-status.md) e [`12_reports/releases/phase-1-setup-summary.md`](./12_reports/releases/phase-1-setup-summary.md).

## Como `main` deve ser interpretado

`main` é a **linha de base arquitetural estável**, não release funcional.

Isso significa:
- ✅ Build verde garantido (CI + tag `v0.1.0-architecture-baseline`).
- ✅ Contratos, schemas e ADRs aceitos são estáveis e podem ser referenciados.
- ✅ Onboarding de novos colaboradores é confiável: clone → install → typecheck verde.
- ❌ **Não há funcionalidade rodando.** Nenhum endpoint, nenhum agente executando, nenhum dado processado.
- ❌ **Não use `main` como base de release de produto.** Releases reais virão a partir de v1.0.0 (após Fases 7–12).

## Como rodar localmente

Requisitos: **Node ≥ 20**, **pnpm ≥ 9**, **Git**.

```bash
git clone https://github.com/incluobrasil-ux/commerce-agent-os.git
cd commerce-agent-os
pnpm install
pnpm doctor
```

`pnpm doctor` é o comando único de verificação — checa Node/pnpm/git, install, typecheck, lint, smoke, `.env.local`, gitleaks, cérebro. Se tudo verde, está pronto.

Próximos passos (zero credencial):

```bash
pnpm audit:repo .                          # audit determinístico do repo
pnpm feed:dry-run                          # pipeline Merchant com fixture
pnpm merchant:audit --source=fixture       # score por SKU + findings + remediações
pnpm merchant:audit --source=json --file=08_data/fixtures/catalog-sample.json
pnpm test                                  # 241 testes em ~3s
```

`pnpm merchant:audit` lê produtos (fixture/JSON/Shopify), valida com `feedRowSchema` + aplica regras semânticas (brand/GTIN/category, title/description length, high-risk keywords) e gera relatório operacional em `12_reports/merchant-audits/` com:
- score 0-100 por SKU + band 🟢🟡🔴
- findings categorizados (critical/high/medium/low)
- remediação concreta por finding
- ranking de SKUs (piores primeiro)
- exit 1 quando há SKU red (útil para CI gate)

Para usar agentes LLM (precisa Anthropic key em `.env.local`):

```bash
pnpm marketing:plan --horizon="Q3 2026" --objective="..." --voice="..." --budget=50000
pnpm creative:assets --campaign="..." --theme="..." --audience="..." --voice="..." \
  --offer="..." --channel=meta-ads --format=feed-image --locale=pt-BR
pnpm design:ux --scope=product --name="..." --summary="..." --style="..." \
  --market=pt-BR:BRL:BR --market=en-US:USD:US
pnpm traffic:plan --campaign="..." --product="..." --total-budget=10000 \
  --daily-cap=400 --cpa-target=35 --channel=meta-ads --channel=google-ads
```

Sem a key todos saem `SKIPPED` graciosamente, sem quebrar.

Detalhe + setup completo + troubleshooting: [`10_ops/scripts/SETUP_LOCAL.md`](./10_ops/scripts/SETUP_LOCAL.md).
Todos os comandos: [`10_ops/scripts/COMMANDS.md`](./10_ops/scripts/COMMANDS.md).
Variáveis de ambiente: [`.env.example`](./.env.example) (copiar para `.env.local` quando ativar LLM/Shopify/Merchant).

## Como navegar a documentação

**Para uso da equipe** (cérebro operacional):

| Quero... | Vá para |
|---|---|
| Onde estamos **agora** | [`07_memory/vault/projects/commerce-agent-os/current-state.md`](./07_memory/vault/projects/commerce-agent-os/current-state.md) |
| O que puxar nesta sessão | [`07_memory/vault/projects/commerce-agent-os/next-actions.md`](./07_memory/vault/projects/commerce-agent-os/next-actions.md) |
| Trilhas paralelas + status | [`07_memory/vault/projects/commerce-agent-os/workstreams.md`](./07_memory/vault/projects/commerce-agent-os/workstreams.md) |
| Protocolo multi-operador | [`07_memory/vault/projects/commerce-agent-os/sync-protocol.md`](./07_memory/vault/projects/commerce-agent-os/sync-protocol.md) |
| Qual arquivo é autoridade | [`07_memory/vault/projects/commerce-agent-os/source-of-truth.md`](./07_memory/vault/projects/commerce-agent-os/source-of-truth.md) |
| Entrada do cérebro | [`07_memory/vault/projects/commerce-agent-os/project-home.md`](./07_memory/vault/projects/commerce-agent-os/project-home.md) |
| Setup local em outro PC | [`10_ops/scripts/SETUP_LOCAL.md`](./10_ops/scripts/SETUP_LOCAL.md) |
| Lista de comandos | [`10_ops/scripts/COMMANDS.md`](./10_ops/scripts/COMMANDS.md) |

**Para governança e arquitetura** (canônico, mudança via ADR):

| Quero saber... | Vá para |
|---|---|
| O que este projeto é (escopo, fronteiras) | [`00_meta/PROJECT_SCOPE.md`](./00_meta/PROJECT_SCOPE.md) |
| Critérios de "feito" por marco | [`00_meta/SUCCESS_CRITERIA.md`](./00_meta/SUCCESS_CRITERIA.md) |
| Roadmap por fases | [`00_meta/ROADMAP.md`](./00_meta/ROADMAP.md) |
| Decisões arquiteturais (ADRs) | [`00_meta/DECISIONS.md`](./00_meta/DECISIONS.md) → `02_architecture/adr/` |
| Regras de stack, naming, estilo | [`00_meta/STACK_RULES.md`](./00_meta/STACK_RULES.md) |
| Upstreams estudados (20 repos) | [`00_meta/REPO_SELECTION.md`](./00_meta/REPO_SELECTION.md) |
| Layout do monorepo | [`CLAUDE.md`](./CLAUDE.md) |
| Mapa de domínio + camadas | [`02_architecture/domain-model/project-map.md`](./02_architecture/domain-model/project-map.md) |
| Status executivo | [`12_reports/releases/current-project-status.md`](./12_reports/releases/current-project-status.md) |
| Lacunas e riscos consolidados | [`12_reports/audits/phase-1-gap-analysis.md`](./12_reports/audits/phase-1-gap-analysis.md) |

## Como colaborar

### Antes de tocar em código
1. Leia [`STACK_RULES.md`](./00_meta/STACK_RULES.md) — convenções de naming, lint, testes, commits.
2. Leia [`DECISIONS.md`](./00_meta/DECISIONS.md) — não reabra decisões já aceitas sem ADR novo.
3. Verifique [`NEXT_STEPS.md`](./10_ops/scripts/NEXT_STEPS.md) — qual sub-fase está aberta agora.

### Workflow
- **Branches:** `main` é estável; trabalhe em branches `feat/<scope>`, `fix/<scope>`, `docs/<scope>`.
- **Commits:** [Conventional Commits 1.0.0](https://www.conventionalcommits.org/) (ADR-0017). Lint via `commitlint` em PR. Exemplos em [`STACK_RULES.md` §8](./00_meta/STACK_RULES.md).
- **PR:** CI roda automático (lint + typecheck + smoke + commitlint). Verde obrigatório.
- **ADR para decisões estruturais:** mudou algo arquitetural? Abra ADR em `02_architecture/adr/` com status `proposta` antes de implementar.

### Onde contribuir agora

Ver [`07_memory/vault/projects/commerce-agent-os/next-actions.md`](./07_memory/vault/projects/commerce-agent-os/next-actions.md) — N1–N7 com pré-requisito, resultado esperado e papel sugerido. Antes de puxar item, ler [`handoff-log.md`](./07_memory/vault/projects/commerce-agent-os/handoff-log.md) (alguém pode já estar nele) e [`sync-protocol.md`](./07_memory/vault/projects/commerce-agent-os/sync-protocol.md) (convenções multi-operador).

Foco atual: **Sub-fase 2.3** — ingerir 10 upstreams de alta prioridade em `01_upstreams/`. `repo-auditor` está pronto para auditar cada clone (`pnpm audit:repo 01_upstreams/<repo>`).

### Onde NÃO contribuir agora
- ❌ Integração Shopify real antes da Sub-fase 2.6.
- ❌ Adicionar dependências externas pesadas sem ADR.
- ❌ Implementar agente novo antes de ter um upstream relevante clonado (Sub-fase 2.3).

## Licença

[MIT](./LICENSE). Troque conforme decisão antes de uso comercial.

## Manutenção desta linha de base

A tag `v0.1.0-architecture-baseline` permanece como **referência canônica de scaffold puro**. A partir da Sub-fase 2.2, `main` evolui com núcleo `@cao/*` + agentes reais; próximo marco taggeado: agente invocando LLM end-to-end (Sub-fase 2.4).

Reportar inconsistências entre documentação e código: abrir issue com label `docs-drift`.
