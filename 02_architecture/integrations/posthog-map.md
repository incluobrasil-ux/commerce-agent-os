# PostHog integration map

Mapa detalhado da camada de analytics. Eventos, funil, sinais de otimização, ligação criativo↔campanha↔onsite, escopo, PII.

## Componentes envolvidos

| Componente | Onde mora | Função |
|---|---|---|
| Adapter | `05_integrations/posthog/` | client + taxonomia + scrub |
| Serviço | `04_apps/analytics-service/` | jobs + pipelines + queries HogQL |
| Agente | `03_agents/analytics-optimization/` | findings + experimentos propostos |
| Wrapper de instrumentação | `06_packages/observability/` | API única que todos os apps usam para capturar |

## Cloud vs self-host

Recomendação default: **PostHog Cloud (EU ou US)**. Justificativa:
- Setup near-zero (sem ops de ClickHouse).
- LLM analytics e features novas chegam primeiro no Cloud.
- Custo escala com volume (mais barato em low/mid scale).

Self-host só faz sentido se:
- Volume muito alto (custo do Cloud > custo de ops próprio).
- LGPD/GDPR exige dados em região específica que o Cloud não atende.
- Política do tenant proíbe SaaS analytics.

Decisão: **ADR a escrever**. Default proposto: **Cloud EU** (proximidade legal para clientes EU/BR; LGPD aceita data residency EU).

## Surfaces que usamos

| Surface | Quando | Onde |
|---|---|---|
| `capture` (server) | toda escrita no `merchant-service`, `feed-service`, `review-service`, `analytics-service`, `creative-ops-service`, `shopify-admin-app` | `@cao/observability` server |
| `capture` (web) | eventos onsite no `shopify-theme` | `@cao/observability` web (via theme app extension ou pixel) |
| `identify` (admin) | quando lojista entra no admin-app | `shopify-admin-app/app/lib/auth.server.ts` |
| `feature_flags` (read) | A/B em tema/admin-app | leitura apenas — não criamos flags automaticamente |
| `query.hogQL` (server) | `analytics-optimization` lê dados | `analytics-service/src/queries/` |
| LLM analytics | quando GA na PostHog | `@cao/observability` + agentes via `runtime` |

## Eventos canônicos

Lista completa em [`05_integrations/posthog/events-taxonomy.yaml`](../../05_integrations/posthog/events-taxonomy.yaml). Resumo por surface:

| Surface | Eventos centrais |
|---|---|
| **Onsite** | page.viewed, product.viewed, collection.viewed, search.performed, cart.item_added, cart.item_removed, checkout.begun, purchase.completed |
| **Agent** | agent.invoked, agent.completed, agent.failed, tool.invoked |
| **Feed** | feed.proposed, feed.applied, feed.disapproved |
| **Campaign** | creative.generated, creative.approved, campaign.launched, campaign.paused, campaign.ended |
| **Review** | review.ingested, review.synthesized, review.responded |
| **Compliance** | compliance.audited, governance.decided |
| **Admin** | admin.signed_in, admin.action_performed |

Naming: `<surface>.<verb>` em snake_case. Toda mudança é PR consciente nos YAMLs.

## Propriedades canônicas

Lista completa em [`05_integrations/posthog/properties-taxonomy.yaml`](../../05_integrations/posthog/properties-taxonomy.yaml). Destaques:

- **Common (todo evento herda):** `tenant_id`, `env`, `app`, `app_version`.
- **Agent:** `agent_name`, `tier`, `intent`, `run_id`, `ms`, `tokens`, `cost_usd`, `outcome`.
- **Commerce:** `sku`, `price_value`, `currency`, `order_id`, `cart_value`, `total_value`.
- **UTM (attribution):** `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`.
  - **Convenção crítica:** `utm_campaign` carrega `initiative_id` quando vier de `marketing-director`; `utm_content` carrega `asset_id` quando vier de `creative-copy-assets`.
- **Campaign:** `initiative_id`, `asset_id`, `channel`, `budget_usd`, `spent_usd`, `conversions`.
- **Feed:** `sku_count`, `applied_count`, `targets`, `disapproval_reason`.
- **Review:** `provider`, `review_id`, `rating`, `has_media`, `themes_count`.

## Funil canônico

```
page.viewed
   │
   ▼
product.viewed
   │
   ▼
cart.item_added
   │
   ▼
checkout.begun
   │
   ▼
purchase.completed
```

Breakdowns sempre disponíveis: `device`, `locale`, `channel` (via UTM), `initiative_id` (quando entrou via campanha).

`analytics-optimization` Fluxo 1 monitora step-by-step conversion rate, identificando o maior drop-off relativo ao baseline.

## Sinais de otimização (cross-source)

| Sinal | Fonte | Consumidor primário |
|---|---|---|
| Drop-off por step de funil | `page.viewed`/`product.viewed`/`cart.item_added`/`checkout.begun`/`purchase.completed` | analytics-optimization |
| CR por device (mobile vs desktop) | breakdown automático | analytics-optimization → design-ux-localization |
| CTR por variante de criativo | `campaign.launched` + `purchase.completed` pareados via `asset_id` em utm_content | marketing-director |
| ROAS por initiative | `campaign.ended` (spent_usd) ÷ purchases atribuídas (initiative_id em utm_campaign) | marketing-director |
| Impacto de mudança de feed | `feed.applied` timestamp + `product.viewed`/`purchase.completed` para SKUs afetados | analytics-optimization → product-feed-seo |
| Disapproval rate em GMC | `feed.disapproved` agregado por SKU | merchant-compliance |
| VoC themes vs CR | `review.synthesized` themes + step rates | analytics-optimization → marketing-director |
| Custo por agente vs valor downstream | `agent.invoked`/`agent.completed` (cost_usd) × `purchase.completed` em janela 7d | analytics-optimization (job daily) |
| Brand violation rate | `governance.decided` com `decision=block` por `artifact_type` | creative-ops-service tuning |

## Ligação criativo → campanha → onsite

Esta é a **espinha dorsal** da atribuição. Cadeia:

```
[creative-copy-assets gera asset]
   │ asset_id assignado
   │ → evento: creative.generated(asset_id, channel, format, locale, cost_usd)
   ▼
[governance-risk-qa aprova]
   │ → evento: creative.approved(asset_id, approved_by)
   ▼
[traffic-campaigns cria campanha]
   │ initiative_id da marketing-director, asset_id incluído
   │ → evento: campaign.launched(initiative_id, asset_id, channel, budget_usd)
   │
   │ URLs da campanha SEMPRE com UTM:
   │   utm_source = <provider>          (google, meta, ...)
   │   utm_medium = <medium>             (cpc, email, ...)
   │   utm_campaign = <initiative_id>    ← elo com marketing-director
   │   utm_content = <asset_id>          ← elo com creative
   │   utm_term = <keyword|audience>     opcional
   ▼
[usuário clica → storefront]
   │ posthog-js auto-captura UTM no $session_props
   │ session inteira carrega initiative_id + asset_id
   ▼
[product.viewed / cart.item_added / purchase.completed]
   │ TODOS herdam initiative_id + asset_id via session
   ▼
[analytics-optimization Fluxo 2 / job campaign-performance-weekly]
   │ HogQL join: campaign events ↔ session events
   │ ROAS por initiative_id; CTR por asset_id
   ▼
[marketing-director re-prioriza]
```

Invariante: **toda URL de campanha gerada por `traffic-campaigns` carrega UTM completo** com `initiative_id` em `utm_campaign` e `asset_id` em `utm_content`. Sem isso, atribuição quebra silenciosamente.

## Política de PII

Lista forbidden em `properties-taxonomy.yaml/forbidden`:
- email, phone, full_name, address, ip_address bruto, device_id raw.

Garantias:
- Adapter **rejeita** com `PostHogPiiError` se property em forbidden chegar.
- `identify` no admin-app usa `user_id` Shopify (não email do staff).
- IP anonymization habilitado no projeto PostHog.
- Eventos onsite usam `distinctId` anônimo (session-scoped) por padrão.

## Custo e quotas

PostHog Cloud cobra por evento + retenção. Para controlar:
- **Sampling** em eventos de alto volume (`page.viewed`, `tool.invoked`) — config via taxonomia futura.
- **Filtrar bots** via PostHog setting.
- **Não enviar eventos de dev** (`env=development` filtrado em projeto de prod; uso de projeto separado para dev).
- Alert quando volume cresce 30%+ semana sobre semana.

## Decisões em aberto

- [ ] **Cloud EU vs Cloud US vs self-host** (proposto: Cloud EU).
- [ ] **Sampling rates** por evento de alto volume.
- [ ] **distinctId strategy** — anônimo session-scoped vs persistente cross-session (cookie/lookup).
- [ ] **LLM analytics** — habilitar quando GA?
- [ ] **Projetos PostHog** — um por env (`dev`, `staging`, `prod`) vs um único com filtro `env`?
- [ ] **Tema integration** — theme app extension dedicada vs script tag direto via Shopify settings?
- [ ] **Identification de staff** vs **shopper anônimo** — staff via `user_id` Shopify; shopper via session distinct id.

## Onde PostHog NÃO entra

- Audit log primário de agentes — vive em `07_memory/<tenant>/audit/` em markdown. PostHog recebe agregados.
- Persistência de domínio (produtos, ordens) — Shopify é fonte.
- Estado de campanha (budget, criativo) — vive em `creative-ops-service` DB. PostHog tem eventos, não estado.
- Decisão automatizada — agentes leem PostHog mas decisão final passa por humano.

## Referências cruzadas

- [`05_integrations/posthog/events-taxonomy.yaml`](../../05_integrations/posthog/events-taxonomy.yaml)
- [`05_integrations/posthog/properties-taxonomy.yaml`](../../05_integrations/posthog/properties-taxonomy.yaml)
- [`04_apps/analytics-service/src/queries/`](../../04_apps/analytics-service/src/queries/)
- [`06_packages/observability/README.md`](../../06_packages/observability/README.md)
- [`02_architecture/security-model/security-overview.md`](../security-model/security-overview.md) — PII handling
