# commerce-agent-os

Sistema operacional de **agentes especializados** para lojistas Shopify — automação de catálogo, feed Google Merchant, marketing, reviews e analytics, sob runtime + memória + guardrails comuns.

> ⚙️ **Estado do projeto:** baseline arquitetural + núcleo `@cao/*` mínimo + **primeiro agente real funcional** (`repo-auditor`). **Ainda não é produto.**
>
> O que há hoje:
> - 17 agentes + 7 apps + 7 integrações + 13 packages declarados.
> - **Núcleo executável:** 6 packages `@cao/*` (core, llm, memory, guardrails, observability, runtime) com 41 testes verdes.
> - **1 agente real:** `repo-auditor` — `pnpm audit:repo <path>` produz relatório markdown em `12_reports/audits/repo-auditor/`. Modo determinístico, **sem credenciais externas**.
> - Suíte completa: **52 testes verdes**. CI ativo. Branch protection em `main`.
> - Cérebro operacional multi-operador em `07_memory/vault/projects/commerce-agent-os/`.
>
> O que **ainda não** há: integração Shopify real, chamada LLM em produção, upstreams clonados, deploy.
>
> Tag de referência: [`v0.1.0-architecture-baseline`](https://github.com/incluobrasil-ux/commerce-agent-os/releases/tag/v0.1.0-architecture-baseline) (pré-Sub-fase 2.2).

## Em uma frase

Você está olhando para a **planta arquitetural** de um produto Shopify-agents, com **núcleo executável e 1 agente real funcionando**. Clone → `pnpm install` → `pnpm audit:repo .` em ≤ 5 min, sem credenciais externas.

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

| Macro-fase | Status | Detalhe |
|---|---|---|
| Fase 0 — scaffold inicial | ✅ | 13 dirs raiz + arquivos-base + 12 prompts |
| Fase 1 — repo audit (20 upstreams) | ✅ | `00_meta/REPO_SELECTION.md` + 20 audits |
| Fase 2 — arquitetura | ✅ | 5 ADRs estruturais + 6 integration maps |
| Fase 3a/b — scaffold técnico | ✅ | 17 agentes + 7 apps + 7 integrações + 12 packages |
| Fase 4 — fundação operacional | ✅ | UPPERCASE docs + shared packages + vault template |
| Sub-fase 2.0 — ADRs operacionais | ✅ | ADR-0006, 0009, 0017 aceitos |
| Sub-fase 2.1 — bootstrap funcional | ✅ | `pnpm install + typecheck + lint + smoke` verdes |
| Sub-fase 2.2 — núcleo `@cao/*` + CI | ✅ | 6 packages com 41 testes; CI ativo |
| Sub-fase 2.2.1 — primeiro agente real (`repo-auditor`) | ✅ | `pnpm audit:repo <path>` → markdown real em `12_reports/` |
| Sub-fase 2.2.2 — cérebro operacional multi-operador | ✅ | `07_memory/vault/projects/commerce-agent-os/` estruturado |
| **Sub-fase 2.3 — ingestão de upstreams** | 🔴 **próxima** | `01_upstreams/` vazio; `repo-auditor` pronto para auditar cada clone |
| Sub-fase 2.4 — LLM end-to-end | 🔴 pendente | `@cao/llm` pronto; falta `ANTHROPIC_API_KEY` confirmada |
| Sub-fases 2.5–2.11 | 🔴 pendentes | Shopify, feed, analytics, reviews, marketing, release v1 |

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

Próximo passo (zero credencial):

```bash
pnpm audit:repo .       # 1º agente real determinístico
pnpm feed:dry-run       # pipeline Merchant com fixture
```

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
