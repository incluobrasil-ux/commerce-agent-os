# Success criteria

Critérios mensuráveis de "feito" por marco. Sem critério, todo trabalho parece infinito.

- Versão: 0.1
- Data: 2026-05-23
- Status: vivo

## v0 — Proof of foundation (sem produção)

**Definição:** o esqueleto é coerente, navegável e mecanicamente correto. Nenhum agente toca dado real ainda.

Critérios:
- [ ] Estrutura monorepo conforme `02_architecture/domain-model/project-map.md`.
- [ ] `pnpm install` na raiz roda sem erros.
- [ ] `pnpm typecheck` passa em todos os packages de `06_packages/`.
- [ ] `pnpm test` (smoke) roda e passa em `11_tests/smoke/`.
- [ ] Cada agente em `03_agents/` tem AGENT.md + prompt.md + contract.yaml + tools.yaml + tests/.
- [ ] Cada package em `06_packages/` tem README + `src/index.ts` válido.
- [ ] Cada integração em `05_integrations/` tem README + subdirs reservados.
- [ ] `00_meta/REPO_SELECTION.md` está atualizado com prioridades.
- [ ] `00_meta/DECISIONS.md` tem ADRs cobrindo: layout, upstreams, agentes, packages compartilhados, vault.

## v1 — Loja-piloto

**Definição:** uma loja Shopify real conectada; um caminho end-to-end roda sem intervenção.

Critérios:
- [ ] App `shopify-admin-app` instalável em loja de dev (OAuth completo).
- [ ] `05_integrations/shopify` lê produtos via Admin GraphQL.
- [ ] `05_integrations/google-merchant` autenticado e lendo relatórios de feed.
- [ ] Agente `product-feed-seo` propõe mudanças em 10+ SKUs (modo dry-run).
- [ ] Agente `governance-risk-qa` revisa propostas com decisão `approve|revise|block`.
- [ ] Agente `catalog-feed-ops` aplica mudanças aprovadas (manualmente confirmadas).
- [ ] `07_memory/<tenant>/` populada com VoC e snapshots de competitor.
- [ ] PostHog instrumentado com taxonomia de eventos em `@cao/observability`.
- [ ] Pelo menos 1 experimento proposto por `analytics-optimization`.
- [ ] Runbook em `10_ops/` para operar a loja-piloto.

## v2+ — Expansão controlada

A definir após v1. Inclui: campanhas pagas (Google Ads), criativo em volume (`creative-ops-service`), múltiplos tenants ativos, observabilidade de LLM cost.

## Métricas-guarda

Independente da versão, **não regredir**:
- Custo médio por execução de agente < orçamento por tenant.
- Latência p95 de orchestrator < 30s para intents simples.
- Zero vazamento cross-tenant em logs/memória/eventos.
- Zero secrets em commit; zero PII em logs em texto claro.

## O que NÃO é critério de sucesso

- Quantidade de agentes implementados — qualidade > quantidade.
- Cobertura de testes alta isoladamente — testes têm que pegar regressão real.
- Beleza de UI — Polaris padrão é suficiente para v0/v1.
- Performance prematura — corretude e segurança primeiro.
