# Team onboarding

Bem-vindo ao `commerce-agent-os`. Este doc é o **ponto de entrada** para qualquer pessoa nova no projeto.

- Versão: 0.1
- Data: 2026-05-23
- Status: vivo

> Tempo de leitura: ~15 min. Tempo até primeiro PR útil: ~1 dia (depende da sub-fase ativa).

## O que você está olhando

Você acabou de receber acesso a um monorepo que é a **planta arquitetural** de um sistema operacional de agentes para lojistas Shopify. **Não é um produto funcional ainda.**

O repositório contém:
- 17 agentes especializados em 7 tiers (todos com contratos, nenhum executando)
- 7 apps (Shopify admin + tema + 5 serviços headless) — scaffolded, sem implementação
- 7 adapters de integração (Shopify, Google Merchant, PostHog, reviews, etc.)
- 12 packages internos `@cao/*`
- 8 ADRs aceitos cobrindo decisões estruturais
- 6 integration maps, 5 readiness audits, 20 repo audits de upstreams

`main` é **estável** (build verde) mas **não funcional** — typecheck/lint/smoke verdes garantem que a planta está consistente, **não** que o produto roda.

Para o estado completo: [`12_reports/releases/current-project-status.md`](../12_reports/releases/current-project-status.md).

## Os 5 fatos que você precisa absorver antes de tocar em qualquer coisa

1. **`01_upstreams/` é read-only.** São 20 repositórios externos estudados como referência. **Nunca edite nada lá dentro.** Política em [ADR-0002](../02_architecture/adr/ADR-0002-upstream-policy.md).

2. **Baseline ≠ release.** `main` é baseline arquitetural estável. **Não use `main` como base de produto.** Releases reais virão da v1.0.0 em diante (Fase 12).

3. **Decisões estruturais exigem ADR.** Quer mudar layout, runtime, stack? Abra um ADR em `02_architecture/adr/` com status `proposta`. ADRs aceitos (status `aceita`) não se reabrem sem novo ADR.

4. **Conventional Commits 1.0.0 obrigatório.** Formato `<type>(<scope>): <subject>`. Enforced pelo `commitlint` em PR. Detalhe em [ADR-0017](../02_architecture/adr/ADR-0017-commit-conventions.md) e [`STACK_RULES.md §8`](./STACK_RULES.md).

5. **Sub-fase atual define onde contribuir.** Olhe [`10_ops/scripts/NEXT_STEPS.md`](../10_ops/scripts/NEXT_STEPS.md) para saber em qual sub-fase estamos. Não pule fases — implementação de domínio antes da Sub-fase 2.4 (runtime mínimo) será reescrita.

## Checklist do primeiro dia

### 1. Setup local (15 min)

Requisitos: Node ≥ 20, pnpm ≥ 9, git.

```bash
git clone https://github.com/incluobrasil-ux/commerce-agent-os.git
cd commerce-agent-os
pnpm install         # ~10s
pnpm typecheck       # tsc -b verde
pnpm lint            # biome verde
pnpm test:smoke      # 3 testes em ~500ms
```

Se algum desses falhar, **pare e reporte antes de continuar** — algo está fora do baseline.

### 2. Leitura essencial (~1h)

Em ordem:

1. [`README.md`](../README.md) — overview e regras de uso de `main`.
2. [`00_meta/PROJECT_SCOPE.md`](./PROJECT_SCOPE.md) — o que o projeto é e o que **não** é.
3. [`00_meta/STACK_RULES.md`](./STACK_RULES.md) — naming, estilo, validação, testes, commits.
4. [`00_meta/DECISIONS.md`](./DECISIONS.md) — índice de ADRs aceitos + queue.
5. [`02_architecture/domain-model/project-map.md`](../02_architecture/domain-model/project-map.md) — mapa de camadas (apps → agentes → packages → integrations).
6. [`10_ops/scripts/NEXT_STEPS.md`](../10_ops/scripts/NEXT_STEPS.md) — qual sub-fase está aberta agora.

### 3. Leitura por papel (1-2h conforme seu foco)

| Seu papel | Leia |
|---|---|
| **Backend (TS)** | docs em `06_packages/<package>/README.md` dos packages do seu escopo; agente em `03_agents/<agent>/AGENT.md + flows.md` |
| **Shopify dev** | [`02_architecture/integrations/shopify-map.md`](../02_architecture/integrations/shopify-map.md); [`04_apps/shopify-admin-app/README.md`](../04_apps/shopify-admin-app/README.md); [`12_reports/audits/shopify-readiness.md`](../12_reports/audits/shopify-readiness.md) |
| **Frontend / tema Shopify** | [`04_apps/shopify-theme/`](../04_apps/shopify-theme/) (todos os READMEs em sections/snippets/templates) |
| **Data / Analytics** | [`02_architecture/integrations/posthog-map.md`](../02_architecture/integrations/posthog-map.md); [`05_integrations/posthog/events-taxonomy.yaml`](../05_integrations/posthog/events-taxonomy.yaml); [`03_agents/analytics-optimization/`](../03_agents/analytics-optimization/) |
| **Marketing / Creative ops** | [`02_architecture/integrations/higgsfield-map.md`](../02_architecture/integrations/higgsfield-map.md); [`03_agents/marketing-director/`](../03_agents/marketing-director/); [`03_agents/creative-copy-assets/`](../03_agents/creative-copy-assets/) |
| **Security / QA** | [`02_architecture/security-model/`](../02_architecture/security-model/); [`10_ops/security/security-checklist.md`](../10_ops/security/security-checklist.md); [`11_tests/README.md`](../11_tests/README.md) |
| **Product / discovery** | [`00_meta/PROJECT_SCOPE.md`](./PROJECT_SCOPE.md); [`00_meta/SUCCESS_CRITERIA.md`](./SUCCESS_CRITERIA.md); [`12_reports/releases/current-project-status.md`](../12_reports/releases/current-project-status.md) |

## O que você PODE editar livremente (em branch + PR)

- Conteúdo dentro de `03_agents/<seu-agente>/`, `04_apps/<seu-app>/`, `05_integrations/<seu-adapter>/`, `06_packages/<seu-pkg>/`.
- Docs em `02_architecture/` que descrevem seu escopo (mas mudar contrato exige ADR).
- Testes em `11_tests/` da sua camada.
- Audits em `12_reports/audits/` cobrindo seu escopo.
- Fixtures em `tests/fixtures/`.

## O que você NÃO PODE editar (ou exige cuidado)

| Não editar | Por quê |
|---|---|
| `01_upstreams/**` | read-only, [ADR-0002](../02_architecture/adr/ADR-0002-upstream-policy.md) |
| `02_architecture/adr/ADR-*-*.md` com status `aceita` | decisões já tomadas; abra novo ADR para mudar |
| `00_meta/REPO_SELECTION.md` em produção (audits) | só atualize ao concluir Sub-fase 2.3 |
| `pnpm-workspace.yaml` | mexer em workspace exige discussão arquitetural |
| `tsconfig.base.json`, `vitest.config.ts`, `biome.json`, `.gitleaks.toml`, `commitlint.config.js` | decididos por ADR-0006; mudança = ADR |
| `LICENSE` | decisão de governança |
| `.github/workflows/ci.yml` | mudança = ADR de CI (futuro) |

## Fluxo de contribuição (resumo)

Detalhe completo em [`10_ops/CONTRIBUTING.md`](../10_ops/CONTRIBUTING.md). Resumo:

```
1. Pegue uma sub-fase aberta em NEXT_STEPS.md (ou item priorizado).
2. Crie branch: feat/<scope-curto>  (ou fix/, docs/, chore/)
3. Codifique respeitando STACK_RULES (TS strict, named exports, etc.).
4. Commits Conventional Commits.
5. Rode local: pnpm typecheck && pnpm lint && pnpm test:smoke.
6. Push da branch.
7. Abra PR — CI roda automático.
8. Aguarde review.
9. Merge (squash) após aprovação + CI verde.
```

Política de branches: [`10_ops/branching-model.md`](../10_ops/branching-model.md).

## Onde registrar dúvidas e decisões

| O quê | Onde |
|---|---|
| **Dúvida sobre escopo / "isto entra aqui?"** | issue no GitHub com label `question` |
| **Bug ou inconsistência entre doc e código** | issue com label `docs-drift` ou `bug` |
| **Proposta arquitetural** | rascunhe ADR em `02_architecture/adr/ADR-XXXX-slug.md` com status `proposta` + abra PR |
| **Decisão técnica não-arquitetural** | mencione no body do PR + atualize doc local relevante |
| **Insight de discovery / pesquisa** | `12_reports/<tipo>/<arquivo>.md` (audits, benchmarks, etc.) |
| **Tarefa operacional pendente** | atualize `10_ops/scripts/NEXT_STEPS.md` no mesmo PR que a faz |

## Sinais de que você está no caminho errado

- Quer mexer em `01_upstreams/` para "ajustar uma coisinha" → **pare**, leia ADR-0002.
- Está implementando um agente sem `@cao/runtime` rodando → **pare**, espere Sub-fase 2.4.
- Quer adicionar uma dep nova que não está em ADR-0006 → **pare**, abra ADR.
- Seu commit message é "fix" ou "wip" → **pare**, leia ADR-0017.
- Você não sabe em que sub-fase está → leia `NEXT_STEPS.md`.

## Sinais de que você está no caminho certo

- Você abriu `NEXT_STEPS.md` antes de começar.
- Seu PR cita ADR ou doc que justifica a mudança.
- Commit message é `feat(runtime): add agent retry policy`.
- Seu PR mexe em < 15 arquivos relacionados ao mesmo escopo.
- Você adicionou ou atualizou um teste correspondente à mudança.

## Próximo passo concreto

1. ✅ Você terminou o checklist do primeiro dia.
2. Leia [`10_ops/CONTRIBUTING.md`](../10_ops/CONTRIBUTING.md) — workflow detalhado.
3. Veja qual sub-fase está aberta em [`10_ops/scripts/NEXT_STEPS.md`](../10_ops/scripts/NEXT_STEPS.md).
4. Pegue um item, abra branch, codifique, PR.

Bem-vindo.
