# Google Merchant integration map

Mapa detalhado da camada Google Merchant Center / feed / SEO. Complementa o resumo em [`google-merchant.md`](./google-merchant.md).

## Componentes envolvidos

| Componente | Onde mora | Função |
|---|---|---|
| Adapter Merchant API | `05_integrations/google-merchant/` | client REST tipado + types + errors |
| Serviço operacional | `04_apps/merchant-service/` | jobs + webhooks Shopify + sync state |
| Serviço cognitivo | `04_apps/feed-service/` | geração/otimização via LLM |
| Agente — otimização | `03_agents/product-feed-seo/` | propõe mudanças (não publica) |
| Agente — execução | `03_agents/catalog-feed-ops/` | aplica mudanças aprovadas |
| Agente — conformidade | `03_agents/merchant-compliance/` | audit + remediação |
| Skills compartilhadas | `06_packages/skills/feed-optimization/` | heurísticas (adaptadas de `feedgen`) |

## Surfaces da Merchant API

### Endpoints centrais

| Recurso | Métodos | Uso |
|---|---|---|
| `products` | insert / update / delete / list / get | escrita e leitura de ofertas |
| `productstatuses` | get / list | fonte autoritativa de aprovações + disapprovals |
| `accounts` | get | verificação inicial |
| `datafeeds` | (opcional) | gestão de feeds nomeados — não default |
| `reports` | (opcional) | performance ads se Google Ads linkado |

Catálogo completo em [`05_integrations/google-merchant/resources.yaml`](../../05_integrations/google-merchant/resources.yaml).

### Sem webhooks → polling

Merchant API não emite webhooks. Estratégia:
- **Estado pós-write** lido sincronamente via `productstatuses.get` após `products.insert/update` (com backoff — processamento em GMC pode levar segundos a minutos).
- **Disapproval monitoring** via job periódico `disapproval-monitor` no `merchant-service` (a cada 30min).
- **Drift** via job `drift-sync` que reconcilia Shopify (source of truth de catálogo) com GMC.

### Auth

Duas modalidades:
1. **OAuth2 user flow** — exige consentimento do usuário; refresh token persistido. Recomendado para apps multi-tenant onde cada lojista conecta a própria conta GMC.
2. **Service account** — chave JSON; mais simples, server-to-server; menos comum em multi-tenant.

Variáveis: `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_MERCHANT_ACCOUNT_ID` (e/ou `GOOGLE_APPLICATION_CREDENTIALS`).

### Rate limits

- Defaults documentados pela Google; client aplica retry exponencial em 429.
- Cost guard limita paginação infinita.
- Telemetria de cost em `@cao/observability`.

### Regions e locales

- GMC trabalha por **target country** + **content language**.
- `feedLabel` em `GMCProductId` identifica a região: `online:en:US:SKU-100` ≠ `online:pt:BR:SKU-100`.
- Mesmo SKU pode ter múltiplas variantes de feed (US, BR, EU). `catalog-feed-ops` versiona por `feedLabel`.

## Fluxo end-to-end (caso feliz)

```
[lojista solicita otimização via shopify-admin-app]
         │
         ▼
[orchestrator-master  intent=optimize_feed_batch]
         │
         ├──► [memory-context bundle]
         │
         ├──► [product-feed-seo]  Fluxo 1
         │       ├── 05_integrations/shopify (read products)
         │       ├── 05_integrations/google-merchant (read productstatuses, disapprovals)
         │       ├── @cao/skills/feed-optimization (heurísticas adaptadas de feedgen)
         │       ├── @cao/llm (geração de variantes)
         │       └── @cao/guardrails (policy enforce: chars, forbidden words)
         │            ↓
         │       proposed_changes[] (diff explícito)
         │
         ├──► [governance-risk-qa]
         │       ↓
         │       approved | revise | block
         │
         ▼
[catalog-feed-ops]  Fluxo 1 (mode=apply)
         │       ├── idempotency_guard
         │       ├── 05_integrations/shopify (write produto)
         │       ├── 05_integrations/google-merchant (products.insert/update)
         │       └── audit_log
         │            ↓
         │       applied[] + skipped[]
         │
         ▼
[merchant-compliance]  Fluxo 1 (pós-apply audit)
         │       ├── productstatuses.get (estado GMC após processar)
         │       └── findings[]  (se algum SKU caiu em disapproved → invoca remediation Fluxo 2)
         │
         ▼
[07_memory/<tenant>/audit/] persistido por @cao/observability
```

## Como cada upstream ajuda

### `google/merchant-api-samples` — dependência

**Onde entra:** adapter `05_integrations/google-merchant/`.

- Endpoints corretos (algumas APIs Google têm várias versões coexistindo — confirmamos via samples).
- Padrões de autenticação (OAuth user flow + service account).
- Retry/backoff idiomático.
- Schemas de Issue / Disapproval / ProductStatus.

**Estratégia:** estudar, espelhar conceitualmente em TS. Não copiar bloco.

### `google-marketing-solutions/feedgen` — base operacional

**Onde entra:** `03_agents/product-feed-seo/` + `06_packages/skills/feed-optimization/` + `04_apps/feed-service/src/prompts/`.

- **Heurísticas:** quais campos otimizar, em que ordem, com que fallback. Ex.: title primeiro, depois description, depois atributos estruturados.
- **Prompts:** templates Gemini-otimizados para reescrita de title/description.
- **Pipeline:** ingest → enrich → generate → validate. Adaptamos a estrutura, não Sheets/Apps Script.

**Estratégia:** começar com port em TS das heurísticas de mais alto retorno. ADR-0006 decidirá entre TS port completo vs sidecar Python para a parte mais sofisticada.

### `google-marketing-solutions/feedx` — referência metodológica

**Onde entra:** `03_agents/analytics-optimization/` + workflow do `catalog-feed-ops` em rollouts.

- **Experimentação de feed:** medir lift de mudanças via A/B controlado.
- **Desenho estatístico:** tamanho amostra, MDE, janela de coleta para mudanças de feed.
- **Mitigação de viés:** feedx tem padrões para isolar efeito de feed vs sazonalidade/marketing.

**Estratégia:** **referência apenas, sem copiar código.** Aplicar metodologia quando tivermos volume suficiente para A/B (v2+).

### `google-marketing-solutions/adios` — tangencial

**Onde entra:** **não nesta camada.** Adios é geração de imagens para Google Ads — inspira `03_agents/creative-copy-assets/` (camada de marketing/criativo).

**Estratégia:** ignorar para Fase 9. Reavaliar quando ativarmos Google Ads (postergado).

## Multi-tenant

- Cada tenant Shopify conecta a **sua** conta Merchant Center via OAuth.
- `tenant_id` ↔ `GMCAccountId` mantido em DB (a confirmar — provável em `merchant-service`).
- Toda chamada Merchant carrega `tenant_id` no contexto e usa o **refresh token** correspondente.
- Cross-tenant proibido por construção (mesmo princípio do Shopify adapter).

## API version policy

- Pinada em `@cao/shared-config` / `resources.yaml`.
- Upgrade é PR consciente com checklist (similar ao Shopify).
- Não suportamos múltiplas versões simultâneas.

## Decisões em aberto

- [ ] **Auth modality** — service account vs OAuth user flow (provável user flow para multi-tenant).
- [ ] **Datafeeds nomeados** — usar ou ir direto via `products.insert`? Default atual: direto.
- [ ] **TS port vs sidecar Python** para a parte mais complexa de `feedgen` (ADR-0006).
- [ ] **Provedor LLM default** para `feed-service` — Anthropic (default geral) vs Gemini (alinhado com `feedgen`).
- [ ] **Cadência de polling** para disapprovals — 30min é rascunho.
- [ ] **Estratégia para SKUs com múltiplos `feedLabel`** (multi-país) — refletir em `product-feed-seo` Fluxo 3.

## Riscos

| Risco | Mitigação |
|---|---|
| Merchant API ainda em transição (Content API → Merchant API) | Pinar versão; checar `merchant-api-samples` para versão GA atual |
| `feedgen` é Python; nosso stack é TS | ADR-0006 decide entre port (preferido) ou sidecar |
| GMC pode demorar para processar mudança (eventual consistency) | `catalog-feed-ops` Fluxo 1 retorna `gmc_state=pending`; monitor periódico atualiza |
| Múltiplas regiões aumentam matriz de teste/copy | Começar com 1 região (US); habilitar outras só com tração |
| Disapproval reasons mudam com atualizações do GMC | `merchant-compliance` carrega rule registry separado; adicionar regra é PR isolado |
