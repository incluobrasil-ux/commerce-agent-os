# Merchant / Feed / SEO readiness audit

Estado da camada Merchant Center / feed / SEO em 2026-05-23. O que está pronto vs. o que falta para implementar (Fase 9 — Merchant feed).

## Resumo

| Área | Status |
|---|---|
| Agentes (`product-feed-seo`, `catalog-feed-ops`, `merchant-compliance`) | Schema completo (AGENT.md, prompt, contract, tools, state-machine quando aplicável) + flows.md operacional + fixtures input/output em JSON |
| `04_apps/merchant-service/` | Esqueleto Node (package.json + tsconfig + .env.example + src/{server.ts, webhooks/, workers/, jobs/, orchestration/}) |
| `04_apps/feed-service/` | Esqueleto Node similar + `src/prompts/` reservado |
| Adapter `05_integrations/google-merchant/` | Contratos TS (client/types/errors) + resources.yaml + report-types.yaml |
| Doc arquitetural | `google-merchant-map.md` (detalhe) + `google-merchant.md` (resumo) |
| Upstreams em `01_upstreams/` | **Nenhum clonado** (merchant-api-samples, feedgen, feedx, adios pendentes) |

## O que cada peça entrega hoje

### Agentes (3)

- **AGENT.md, prompt.md, contract.yaml, tools.yaml** já existiam (Fase 3b).
- **flows.md novo** em cada um: 3 fluxos operacionais concretos por agente (caminho feliz + desvios + dependências de upstream).
- **tests/fixtures/sample-input.json + sample-output.json** novos: payloads exemplo aderentes aos schemas.
- `catalog-feed-ops` já tinha `state-machine.md` (Fase 3b).

### `04_apps/merchant-service/`

- `package.json` (workspace `@cao/merchant-service`), `tsconfig.json`, `.env.example`, `.gitignore`.
- `src/server.ts` placeholder comentado com TODO.
- `src/webhooks/`, `src/workers/`, `src/jobs/`, `src/orchestration/` com README descrevendo handlers, workers, jobs e função.
- 4 jobs declarados: `drift-sync` (1h), `compliance-sweep` (semanal), `disapproval-monitor` (30min), `feed-pacing-report` (diário).

### `04_apps/feed-service/`

- Esqueleto Node similar.
- `src/prompts/` com README declarando 5 prompts previstos (title-rewrite, description-rewrite, attribute-fill, localize-copy, remediate-disapproval) + formato com frontmatter.
- `src/pipelines/` com 3 pipelines previstos (optimize-skus, remediate-disapproval, localize-skus).

### `05_integrations/google-merchant/`

- Workspace package `@cao/integration-google-merchant`.
- `client/index.ts` — interface `GMCClient` (products, productStatuses, accounts) com paginação via `AsyncIterable`.
- `types/index.ts` — branded IDs + `GMCProduct`, `GMCProductStatus`, `GMCDisapprovalReason`, `GMCDatafeed`. Enums (channel, destination, status, severity).
- `errors/index.ts` — 7 classes (Auth, RateLimit, NotFound, Validation, Disapproval semântico, AccountNotClaimed, ApiVersionMismatch).
- `resources.yaml` — catálogo de recursos suportados, com consumidores e flag `destructive`.
- `report-types.yaml` — catálogo de relatórios (disapprovals, warnings, performance opcional).
- **Sem `webhooks/`** — GMC não emite; documentado.

### `02_architecture/integrations/google-merchant-map.md`

- Componentes envolvidos.
- Surfaces da Merchant API + estratégia de polling.
- Auth modalities.
- Regions/locales e como `feedLabel` afeta `GMCProductId`.
- Fluxo end-to-end detalhado (ASCII).
- **Seção dedicada ao papel de cada upstream estudado** (merchant-api-samples, feedgen, feedx, adios).
- Multi-tenant, API version policy, decisões em aberto, riscos.

## Papel de cada upstream (resumo)

| Upstream | Papel | Onde aplica | Estratégia |
|---|---|---|---|
| `google/merchant-api-samples` | dependência — referência canônica de endpoints/auth/retry | `05_integrations/google-merchant/client/` | estudar; espelhar conceitualmente em TS |
| `google-marketing-solutions/feedgen` | base operacional — heurísticas + prompts de otimização | `06_packages/skills/feed-optimization/` + `04_apps/feed-service/src/prompts/` | port TS de heurísticas; ADR-0006 decide sidecar Python para parte complexa |
| `google-marketing-solutions/feedx` | referência metodológica — A/B de feed | `03_agents/analytics-optimization/` + workflow de rollout | aplicar só com volume (v2+); zero cópia de código |
| `google-marketing-solutions/adios` | **fora desta camada** — geração de imagens para Ads | inspira `03_agents/creative-copy-assets/` quando ativarmos Google Ads | ignorar para Fase 9 |

## Pré-requisitos externos (não controlados pelo monorepo)

| Item | Necessário para | Como obter |
|---|---|---|
| Conta Google que possa criar projeto GCP | OAuth credentials | https://console.cloud.google.com |
| Projeto GCP com Merchant API habilitada | qualquer call | Cloud Console → APIs & Services |
| OAuth Client ID + Secret (web) | OAuth user flow | Cloud Console → Credentials |
| (alternativa) Service Account JSON | OAuth server-to-server | Cloud Console → Service Accounts |
| Conta Google Merchant Center | conectar lojista | https://merchants.google.com |
| Claim de domínio do storefront em GMC | publicar ofertas | GMC dashboard |
| Redis (worker queue) | merchant-service + feed-service | local docker em dev; managed em prod |
| Provedor LLM | feed-service | Anthropic ou Gemini (ADR pendente) |

Nenhum desses está configurado.

## Riscos identificados

| Risco | Mitigação |
|---|---|
| Merchant API ainda em transição (Content API → Merchant API) | Pinar versão; revalidar com `merchant-api-samples` antes de Fase 9 |
| `feedgen` é Python; nosso stack é TS | ADR-0006 decide (TS port preferido); começar com heurísticas mais simples |
| GMC tem eventual consistency em writes | `catalog-feed-ops` retorna `gmc_state=pending`; `disapproval-monitor` polleia |
| Disapproval reasons mudam com atualizações do GMC | `merchant-compliance` carrega registry de regras separado do código |
| Multi-locale aumenta matriz de teste/copy/compliance | Começar com 1 region (US ou BR); habilitar outras com tração |
| Custo LLM em batch grande pode explodir | `feed-service` tem worker concurrency baixa; budget guard via `@cao/runtime` |
| Webhooks Shopify chegam rápido demais e bombardeiam feed-service | Debounce no `merchant-service` (agrupar `products/update` em janelas de 5min) |

## Decisões em aberto

- [ ] Auth modality (OAuth user flow vs service account).
- [ ] Worker queue (BullMQ vs alternativa).
- [ ] Provedor LLM default para feed-service.
- [ ] TS port completo vs sidecar Python para feedgen avançado (ADR-0006).
- [ ] Cadência de polling para disapprovals.
- [ ] Uso (ou não) de datafeeds nomeados vs `products.insert` direto.
- [ ] Region inicial (US? BR? ambos?).
- [ ] Strategy para múltiplos `feedLabel` por SKU.

## Checklist "pronto para Fase 9"

- [ ] Conta GCP + projeto + Merchant API habilitada.
- [ ] OAuth credentials emitidas.
- [ ] Conta GMC criada + domínio reivindicado.
- [ ] `01_upstreams/merchant-api-samples/` clonado (Fase 6).
- [ ] `01_upstreams/feedgen/` clonado (Fase 6) para extração de prompts/heurísticas.
- [ ] Redis disponível em dev.
- [ ] `@cao/runtime` mínimo implementado (Fase 7).
- [ ] Fase 8 (Shopify connect) concluída — sem Shopify lendo produto, não há o que feedar.
- [ ] Decisões da seção anterior resolvidas (ou conscientemente deferidas).
- [ ] `pnpm install` no workspace verde com deps do Google API client + worker queue.

## Próximo passo recomendado

A Fase 9 depende fortemente da Fase 8 (Shopify) — sem produtos lidos, não há otimização. Sequência prática:
1. Fase 5 (bootstrap funcional).
2. Fase 6 (clonar upstreams chave — inclui `merchant-api-samples`, `feedgen`).
3. Fase 7 (`@cao/runtime` mínimo).
4. Fase 8 (Shopify lendo produtos).
5. **Fase 9** (esta camada): implementar adapter GMC + 1 pipeline simples (title rewrite) end-to-end em dry-run.
