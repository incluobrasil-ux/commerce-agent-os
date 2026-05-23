# commerce-agent-os

Sistema operacional de **agentes especializados** para lojistas Shopify — automação de catálogo, feed Google Merchant, marketing, reviews e analytics, sob runtime + memória + guardrails comuns.

> ⚠️ **Estado do projeto:** baseline arquitetural estável em `main`. **Não é um produto funcional.**
>
> O que há hoje: 17 agentes + 7 apps + 7 integrações + 12 packages **declarados** em contratos TypeScript e documentação. Build verde (typecheck + smoke). **Zero lógica de negócio implementada.** Nenhum agente roda end-to-end; nenhuma loja Shopify está conectada.
>
> Tag de referência: [`v0.1.0-architecture-baseline`](https://github.com/incluobrasil-ux/commerce-agent-os/releases/tag/v0.1.0-architecture-baseline).

## Em uma frase

Você está olhando para a **planta arquitetural** de um produto que ainda não foi construído — pronta para receber implementação. Útil hoje como briefing técnico, prova de pensamento estratégico, e base de partida para desenvolvimento.

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
| Fase 3a/b — scaffold técnico (agentes/apps/integrações) | ✅ | 17 agentes + 7 apps + 7 integrações + 12 packages |
| Fase 4 — fundação operacional | ✅ | UPPERCASE docs + shared packages + vault template |
| Sub-fase 2.0 — ADRs operacionais (QA, scope, commits) | ✅ | ADR-0006, 0009, 0017 aceitos |
| Sub-fase 2.1 — bootstrap funcional | ✅ | `pnpm install + typecheck + smoke` verdes |
| Sub-fase 2.2 — CI mínimo | ✅ | `.github/workflows/ci.yml` ativo |
| **Sub-fase 2.3 — ingestão de upstreams** | 🔴 **próxima** | `01_upstreams/` ainda vazio |
| Sub-fase 2.4 — `@cao/runtime` + 1º agente real | 🔴 pendente | implementação real começa aqui |
| Sub-fases 2.5–2.11 | 🔴 pendentes | Shopify connect, feed, analytics, reviews, marketing, release v1 |

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

Requisitos:
- Node ≥ 20
- pnpm ≥ 9 (instale via `npm install -g pnpm@9` ou corepack)
- Git

```bash
git clone https://github.com/incluobrasil-ux/commerce-agent-os.git
cd commerce-agent-os
pnpm install
pnpm typecheck   # tsc -b — deve retornar verde
pnpm lint        # biome — deve retornar verde
pnpm test:smoke  # vitest — 3 testes passando
```

O que você verá ao rodar: **nada acontecendo no domínio.** O build apenas confirma que a planta está consistente. Os 17 agentes, 7 apps e 7 integrações têm contratos válidos mas nenhuma implementação.

## Como navegar a documentação

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
| Como cada integração funciona | [`02_architecture/integrations/`](./02_architecture/integrations/) |
| Próxima ação concreta | [`10_ops/scripts/NEXT_STEPS.md`](./10_ops/scripts/NEXT_STEPS.md) |
| Lacunas e riscos | [`12_reports/audits/phase-1-gap-analysis.md`](./12_reports/audits/phase-1-gap-analysis.md) |
| Estado atual executivo | [`12_reports/releases/current-project-status.md`](./12_reports/releases/current-project-status.md) |

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

### Onde contribuir agora (Sub-fase 2.3)
[Sub-fase 2.3 do `NEXT_STEPS.md`](./10_ops/scripts/NEXT_STEPS.md) — ingerir 10 upstreams de alta prioridade em `01_upstreams/`. Trabalho operacional, baixo risco arquitetural.

### Onde NÃO contribuir agora
- ❌ Implementação de domínio antes da Sub-fase 2.4 (`@cao/runtime` mínimo). Sem runtime, qualquer código de agente vai precisar ser reescrito.
- ❌ Integração com Shopify real antes da Sub-fase 2.6.
- ❌ Adicionar dependências externas pesadas sem ADR.

## Licença

[MIT](./LICENSE). Troque conforme decisão antes de uso comercial.

## Manutenção desta linha de base

Esta versão (`v0.1.0-architecture-baseline`) deve ser mantida como **referência canônica** até a Sub-fase 2.4 entregar o primeiro agente rodando end-to-end. A partir daí, `main` evolui em direção a v1.0.0 (Fase 12 — release v1).

Reportar inconsistências entre documentação e código: abrir issue com label `docs-drift`.
