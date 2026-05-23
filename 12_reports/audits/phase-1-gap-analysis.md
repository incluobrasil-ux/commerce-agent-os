# Phase 1 gap analysis

Consolidação dos gaps de todos os readiness audits + descobertas da revisão final. Datado 2026-05-23.

## Sumário

Gaps agrupados por severidade. **Severidade reflete bloqueio para próxima fase, não risco em produção.**

| Severidade | Quantidade | Resumo |
|---|---|---|
| 🔴 Crítico (bloqueia Fase 2 inteiramente) | 3 | bootstrap funcional ausente; nenhum upstream clonado; runtime ausente |
| 🟠 Alto (bloqueia subfase específica) | 9 | decisões de stack/infra pendentes |
| 🟡 Médio (planejável) | 12 | melhorias, completude de scaffold |
| 🟢 Baixo (backlog) | 7 | refinamentos não-bloqueantes |

## 🔴 Críticos

### 1. Bootstrap funcional não rodou

- `pnpm install` nunca foi executado.
- Sem `node_modules`, nenhum dos packages funciona em runtime.
- Sem `typescript`, sem `vitest`, sem `zod` instalados.
- **Bloqueia:** tudo. Toda a Fase 2 depende.
- **Onde:** Fase 5 do `ROADMAP.md`.
- **Esforço:** baixo. Decisão de ADR de stack (lint, test runner) + `pnpm install`.

### 2. Nenhum upstream clonado em `01_upstreams/`

- Os 20 repos classificados em `REPO_SELECTION.md` continuam apenas como referência mental.
- 6 repos marcados `⚠ verificar` no audit nunca foram inspecionados localmente.
- **Bloqueia:** Fase 6 inteira; `@cao/runtime` (precisa de LangGraph), `@cao/memory` (basic-memory), `@cao/guardrails` (agentshield), `feed-service` prompts (feedgen), `@cao/skills` (higgsfield-skills/ecommerce-skills/marketingskills).
- **Onde:** Fase 6 do `ROADMAP.md`.
- **Esforço:** médio. Decidir método (submodule/clone raso) + clone + audit pós-clone.

### 3. `@cao/runtime` não implementado

- Sem ele, nenhum agente roda.
- Sem ele, `governance-risk-qa` não consegue gatekeep nada em runtime.
- Sem ele, observability não tem como instrumentar `agent.invoked` real.
- **Bloqueia:** Fases 7+ (qualquer agente real).
- **Onde:** Fase 7 do `ROADMAP.md`.
- **Esforço:** alto. Wrapper sobre LangGraph TS + contrato de agente declarativo + executor + checkpoint + audit log.

## 🟠 Altos

### 4. Ferramentas de QA não escolhidas

- Lint stack (eslint vs biome).
- Test runner (vitest é candidato default).
- Secret scanner (gitleaks candidato).
- Dependency bot (Dependabot vs Renovate).
- SAST (Semgrep candidato).
- **Bloqueia:** itens `[C]` do `security-checklist.md` são aspiracionais até essas decisões.
- **Esforço:** baixo (decisão); médio (configurar).

### 5. Provedor de mídia para `creative-ops-service` não escolhido

- ADR pendente: imagem + vídeo.
- Object storage também pendente (S3 / R2 / GCS).
- **Bloqueia:** Fase 11 (criativo em escala) parte criativa.
- **Esforço:** médio. Comparação de qualidade × custo.

### 6. Provedor de reviews default não escolhido

- Recomendação técnica: Judge.me + Shopify nativo (fallback).
- Não confirmado.
- **Bloqueia:** Fase 11 parte reviews.
- **Esforço:** baixo (decisão); alto (implementação real do adapter).

### 7. PostHog cloud vs self-host não decidido

- Recomendação: Cloud EU.
- Afeta LGPD/GDPR e custo.
- **Bloqueia:** Fase 10 (instrumentação real).
- **Esforço:** baixo (decisão).

### 8. Estratégia para `feedgen` (Python) não definida

- TS port completo vs sidecar Python vs serviço separado.
- ADR-0006 candidato.
- **Bloqueia:** lógica avançada de `product-feed-seo`.
- **Esforço:** médio. Avaliar fidelidade × DX.

### 9. Worker queue não escolhida

- BullMQ candidato; alternativas não avaliadas.
- 4 serviços dependem (merchant, feed, review, creative-ops).
- **Bloqueia:** Fases 8+.
- **Esforço:** baixo.

### 10. DB de aplicação para Shopify session storage

- SQLite (default do template) vs Postgres.
- Multi-host scaling depende.
- **Bloqueia:** Fase 8 produção (dev/staging OK com SQLite).
- **Esforço:** baixo.

### 11. Secret manager para prod não definido

- Doppler / AWS SM / outro.
- **Bloqueia:** release v1.
- **Esforço:** baixo (decisão); médio (migração de `.env` local).

### 12. Política de retenção de `07_memory/` + logs PostHog

- LGPD/GDPR compliance real depende.
- Inclui handler dos webhooks GDPR Shopify (`shop/redact`, `customers/redact`).
- **Bloqueia:** publicação Shopify App Store + release multi-tenant.
- **Esforço:** médio.

## 🟡 Médios

### 13. 6 agentes sem `flows.md`

- `orchestrator-master`, `memory-context`, `repo-auditor`, `learning-memory-curation`, `design-ux-localization`, `traffic-campaigns`.
- 2 desses têm state-machine.md (orchestrator, traffic-campaigns) — parcialmente compensado.
- **Bloqueia:** clareza operacional ao implementar.
- **Esforço:** baixo. Mesma estrutura dos 11 existentes.

### 14. 6 agentes sem fixtures JSON

- Mesmos da seção 13.
- **Bloqueia:** contract tests desses agentes.
- **Esforço:** baixo.

### 15. `09_prompts/*.md` todos placeholder

- 12 arquivos com 1 linha "A preencher".
- **Bloqueia:** uso real do diretório como fonte de prompts operacionais.
- **Decisão:** estes prompts são para **executar fases via Claude**? Se sim, devem ser os prompts que o usuário envia. Se não, repensar propósito.
- **Esforço:** baixo se for só doc; médio se virar interativo.

### 16. Apps com `src/` placeholder

- 5 serviços (`merchant-service`, `feed-service`, `review-service`, `analytics-service`, `creative-ops-service`) têm `src/server.ts` como `export {}`.
- **Bloqueia:** rodar qualquer um.
- **Esforço:** acompanha implementação.

### 17. Adapters `client/` declarados mas vazios

- 7 adapters em `05_integrations/*/client/index.ts` têm apenas `declare function makeClient(...)`.
- **Bloqueia:** qualquer call externa.
- **Esforço:** alto. Cada implementação é um trabalho próprio (Shopify GraphQL, GMC REST, etc.).

### 18. `@cao/runtime` referenced everywhere mas não existe

- 14 docs apontam para `@cao/runtime`; package é apenas stub.
- **Bloqueia:** mesma dependência circular de gap #3.

### 19. `@cao/memory` referenced everywhere mas não existe

- 8 docs apontam; package é stub.
- Bloqueia Tier 0 inteiro (memory-context, learning-memory-curation).

### 20. `@cao/guardrails` referenced everywhere mas não existe

- 12 docs apontam; package é stub.
- Bloqueia `governance-risk-qa` runtime.

### 21. CI pipeline não existe

- `10_ops/ci/` previsto mas não criado.
- Itens `[C]` do security-checklist são aspiracionais.
- **Esforço:** médio. GitHub Actions inicial trivial.

### 22. Ambiente staging não montado

- Bloqueia Fase E2E real.
- Requer: Shopify Partners dev store, GMC sub-account, PostHog projeto staging, contas dev dos providers de review.
- **Esforço:** baixo (criar contas); médio (configurar).

### 23. Performance baselines vazias

- Sem implementação, sem números reais.
- **Bloqueia:** assertions no `11_tests/performance/`.
- **Esforço:** acompanha implementação.

### 24. Override humano em `block` não modelado no admin-app

- `governance-risk-qa` bloqueia; falta UI mostrar.
- **Bloqueia:** workflow real de "lojista revoga decisão automática".
- **Esforço:** médio (UI Polaris + audit dessa ação).

## 🟢 Baixos

### 25. Catálogo de skills em `higgsfield/skills-catalog.yaml` é provisório

- 8 skills listadas como `planned`; schema real depende de clone do upstream.

### 26. Providers em `review-apps/providers/<name>/` são stubs idênticos

- 6 arquivos quase iguais; padronizar quando primeiro for implementado.

### 27. `04_apps/shopify-theme/sections/snippets/templates/` vazios

- Apenas READMEs; tema não renderiza nada útil ainda.

### 28. ADR-0006 sobre stack de testes ainda não escrito

- Decisão precede implementação real.

### 29. ADR-0007 sobre runtime alvo TS vs Python ainda não escrito

- Decisão precede `@cao/runtime`.

### 30. Diagrama visual de arquitetura não existe

- Apenas ASCII em `project-map.md`. Diagrama gerado (Mermaid? Excalidraw?) seria útil para onboarding.

### 31. Não há example-fact em outros buckets do vault

- `_template/facts/example-fact.md` existe; outros buckets só `.gitkeep`.

## Resumo das maiores dores

| Dor | Onde mais aparece | Mitigação imediata |
|---|---|---|
| **Nada roda** | todos os audits | Fase 5 bootstrap |
| **Upstreams não clonados** | merchant-feed-seo, marketing-creative, security-qa, higgsfield audits | Fase 6 ingestão |
| **`@cao/runtime` é referência circular** | 14 docs | Fase 7 implementação |
| **Decisões pendentes acumulam** | todos os audits | sprint dedicado de ADRs (proposta) |

## Próxima ação

Ver [`10_ops/scripts/NEXT_STEPS.md`](../../10_ops/scripts/NEXT_STEPS.md).
