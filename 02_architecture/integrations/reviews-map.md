# Reviews integration map

Mapa detalhado da camada de reviews. Cobre fontes possíveis, fluxo de ingestão, moderação, publicação, e impacto em SEO/conversão.

## Componentes envolvidos

| Componente | Onde mora | Função |
|---|---|---|
| Adapter multi-provedor | `05_integrations/review-apps/` | interface única `ReviewProvider` + 6 stubs |
| Serviço | `04_apps/review-service/` | ingest + workers + jobs + webhooks |
| Agente | `03_agents/reviews-ops/` | VoC, drafts, claim detection |
| Tema (apresentação) | `04_apps/shopify-theme/` | schema.org JSON-LD + widgets de social proof |
| Admin app (moderação manual) | `04_apps/shopify-admin-app/` | UI de revisão + override humano |

## Fontes possíveis (providers)

Catálogo declarativo em [`05_integrations/review-apps/providers.yaml`](../../05_integrations/review-apps/providers.yaml).

| Provider | Notas-chave |
|---|---|
| **Judge.me** | free tier + webhook + photo/video; **escolha v0 recomendada** |
| **Shopify nativo (Product Reviews legacy)** | zero custo, sem webhook (polling), sem mídia; **fallback** |
| Yotpo | robusto, caro em volume |
| Loox | forte em photo/video, webhook parcial |
| Stamped | balanceado, free tier limitado |
| Okendo | mid-market, sem free tier |

A escolha é **por tenant** (cada lojista usa o que tem). Adapter é multi-provedor por design — agente nunca vê qual.

## Fluxo end-to-end

```
                  ┌──────── fonte externa ────────┐
                  │  Judge.me / Yotpo / Loox /    │
                  │  Stamped / Okendo / Shopify   │
                  └──────────────┬────────────────┘
                                 │ webhook OU polling
                                 ▼
                  [05_integrations/review-apps/providers/<name>]
                                 │ normalize → Review (tipo do nosso domínio)
                                 ▼
                  [review-service / webhooks ou ingesters]
                                 │ enqueue
                                 ▼
                  [worker: process-review]
                                 │ scrub PII + persist
                                 ▼
                  07_memory/<tenant>/working/reviews/<provider>/<id>.md
                                 │
              ┌──────────────────┼─────────────────────────────┐
              │                  │                             │
              ▼                  ▼                             ▼
    [reviews-ops Fluxo 2]   [reviews-ops Fluxo 3]    [aggregate-rating-sync]
    synthesize VoC          draft response             recalc + write metafield
              │                  │                             │
              │                  ▼                             ▼
              │     [governance-risk-qa]               Shopify metafield
              │                  │                             │
              │       approve ───┼─── revise/block             ▼
              │                  ▼                    [shopify-theme]
              │     [publish-response]                schema.org JSON-LD
              │                  │                    + widgets
              │                  ▼
              │     adapter.respondToReview
              │
              ▼
    07_memory/<tenant>/voc/<scope>/<timestamp>.md
              │
              ▼
    consumido por: product-offer, design-ux-localization,
                   marketing-director, product-feed-seo
```

## Ingestão

### Modos

- **Webhook** (preferido quando disponível) — provider envia POST em evento.
- **Polling** (fallback) — job `poll-reviews` no `review-service` a cada 15min varre desde cursor por tenant.

### Garantias

- Verificação de assinatura (HMAC) por provider — handler delega ao adapter.
- Deduplicação por `(provider, external_id)`.
- Isolamento por tenant: provider config carrega `tenant_id`; cross-tenant impossível.
- HTTP responde 200 imediatamente após validar + enqueue (handler async).

### PII

- Nome/email do reviewer entram apenas em `07_memory/<tenant>/working/reviews/<provider>/<id>.md` com frontmatter marcado.
- Email **nunca** sai do adapter para outros agentes (scrub por `@cao/guardrails`).
- Política de retenção: a definir (rascunho — 12 meses).

## Moderação

Dois eixos:

### Moderação de **resposta** (saída do nosso sistema)

- Toda resposta gerada por `reviews-ops` Fluxo 3 passa por `governance-risk-qa`.
- Reviews com **claim sensível** (saúde, segurança, regulação) → rota humana obrigatória.
- Resposta **nunca** admite culpa legal ou compromete reembolso sem aprovação humana.

### Moderação de **review** (entrada)

- Não moderamos reviews dos clientes — quem modera é o provider e/ou o lojista no admin do provider.
- Sinalizamos para o lojista no `shopify-admin-app` reviews com:
  - rating ≤ 2 (atenção urgente)
  - claim sensível detectado
  - sinais de spam (sem comprar, mesmo IP em massa — quando provider expõe)

## Publicação

- `publish-response` worker chama `adapter.respondToReview(id, body)`.
- Falha → registra audit + alerta humano; **não** retenta automaticamente (resposta moderada manualmente requer atenção).
- Provider que não suporta reply (raro) → resposta fica como markdown em `07_memory/<tenant>/audit/responses/` (humano publica via admin do provider).

## Impacto em SEO

### Rich snippets via schema.org JSON-LD

`shopify-theme` injeta no template do produto:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{{ product.title }}",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "{{ product.metafields.cao.avg_rating }}",
    "reviewCount": "{{ product.metafields.cao.review_count }}"
  },
  "review": [
    {
      "@type": "Review",
      "author": {"@type": "Person", "name": "..."},
      "reviewRating": {"@type": "Rating", "ratingValue": "5"},
      "reviewBody": "..."
    }
  ]
}
</script>
```

Convenção:
- `aggregate-rating-sync` job escreve nos **metafields** Shopify (`cao.avg_rating`, `cao.review_count`).
- Tema lê metafields e renderiza JSON-LD.
- Apenas reviews com `verified` ou rating ≥ 4 entram no array `review` (qualidade do snippet > volume).

### Google Merchant Center

GMC consome reviews via **Product Ratings** (programa separado) — fora de escopo v0/v1. Reavaliar quando volume justificar.

## Impacto em conversão (social proof)

Padrões aplicados no `shopify-theme`:

| Padrão | Implementação |
|---|---|
| AggregateRating no PDP (estrelas + count) | seção liquid `product-rating.liquid` lê metafield |
| Top reviews carousel | seção `product-reviews.liquid` consome widget do provider |
| Photo reviews em destaque | quando provider suporta media |
| Badges ("Bestseller", "Highly rated") | regra: rating ≥ 4.5 + count ≥ 20 → badge automático via metafield `cao.badges` |
| VoC summary no PDP ("Most mentioned: comfort, fit, value") | `reviews-ops` Fluxo 2 → memory `voc/` → metafield `cao.voc_summary` → seção `product-voc-summary.liquid` |
| Q&A pareado com reviews | provider-dependent; postergado |

## Conexão com outros agentes

| Agente | Como consome reviews |
|---|---|
| `product-offer` | VoC mostra atributos valorizados → ajusta positioning |
| `design-ux-localization` | claims positivos viram bullets de PDP / FAQ |
| `marketing-director` | mensagem central derivada de VoC |
| `product-feed-seo` | claims positivos verificáveis viram atributos do feed (cautela) |
| `merchant-compliance` | reviews podem revelar claims problemáticos publicados no feed |
| `analytics-optimization` | review count, avg rating, sentiment trend → KPIs |

## Multi-tenant

- Cada tenant tem `provider_config` em DB: qual provider, qual token, qual webhook secret.
- Token **nunca** em log; mascarar últimos 4 chars.
- Crossover entre tenants é impossível por construção.

## Riscos

| Risco | Mitigação |
|---|---|
| Provider de reviews muda schema | normalize.ts isolado por provider; quebrar 1 não derruba os outros |
| Custo de provider de reviews escalar (Yotpo, Okendo) | recomendação v0 começa com Judge.me free tier |
| Reviews falsos / spam | sinalização para o lojista; nunca filtramos automaticamente reviews públicos |
| Publish failure deixa estado inconsistente | response fica em `07_memory/audit/responses/` para retry manual |
| LGPD/GDPR para PII em reviews | scrub agressivo + retenção limitada + endpoint de delete por tenant |
| schema.org markup inflado (review spam) | seleção rigorosa: rating ≥ 4 + verified |

## Decisões em aberto

- [ ] Provider default para v0 (Judge.me proposto).
- [ ] Política de retenção de PII em `working/reviews/`.
- [ ] Token storage por tenant (secret manager vs Prisma).
- [ ] Q&A integrado ou não (postergado).
- [ ] Threshold de auto-resposta (rating ≤ 3 proposto).
- [ ] Threshold de inclusão em JSON-LD (rating ≥ 4 + verified proposto).
- [ ] Programa Google Customer Reviews / Product Ratings em GMC — quando ativar.

## Referências de upstream

Nenhum upstream estudado cobre diretamente reviews — não há repo entre os 20 que faça isso. Adapter é 100% autoral. Inspiração de padrão multi-provider segue ideias de adapters de pagamento (Stripe-like adapters em Saleor, Medusa) — não copiamos código de nenhum.
