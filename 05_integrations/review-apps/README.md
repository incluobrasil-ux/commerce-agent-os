# review-apps

Adapter **multi-provedor** para apps de reviews. Cada tenant escolhe seu provider; o adapter expõe uma interface única `ReviewProvider` que todos implementam.

## Por que multi-provedor

- Lojistas Shopify usam apps diferentes (Judge.me, Yotpo, Loox, Stamped, Okendo…).
- O agente `reviews-ops` não pode saber qual.
- Adapter normaliza: `reviews-ops` vê apenas `Review` do nosso domínio.

## Providers suportados (status declarado)

Catálogo declarativo em `providers.yaml`. Cada provider tem implementação stub em `providers/<name>/`.

| Provider | Webhook | Reply API | Photo reviews | Free tier | Status |
|---|---|---|---|---|---|
| `judge-me` | ✅ | ✅ | ✅ | sim | recomendado v0 |
| `shopify-native` | ❌ | parcial | não | nativo | fallback simples |
| `yotpo` | ✅ | ✅ | ✅ | limitado | considerado |
| `loox` | ⚠ parcial | ✅ | ✅ | não | considerado |
| `stamped` | ✅ | ✅ | ✅ | limitado | considerado |
| `okendo` | ✅ | ✅ | ✅ | não | considerado |

## Estrutura

```
review-apps/
├─ index.ts                barrel + factory de provider
├─ providers/
│  ├─ README.md
│  ├─ judge-me/index.ts
│  ├─ yotpo/index.ts
│  ├─ loox/index.ts
│  ├─ stamped/index.ts
│  ├─ okendo/index.ts
│  └─ shopify-native/index.ts
├─ types/index.ts          tipo Review normalizado + branded IDs
├─ errors/index.ts         classes de erro normalizadas
├─ providers.yaml          comparativo declarativo
├─ package.json
├─ tsconfig.json
```

## Interface central

```ts
interface ReviewProvider {
  readonly name: ProviderName;
  listReviews(opts: { sinceCursor?: string }): AsyncIterable<Review>;
  getReview(id: ReviewId): Promise<Review>;
  respondToReview(id: ReviewId, body: string): Promise<void>;
  verifyWebhook(headers, body): Promise<boolean>;  // quando provider suporta
}

function makeProvider(tenant: TenantId, name: ProviderName): ReviewProvider;
```

## Consumido por

- `04_apps/review-service` (principal).
- `04_apps/shopify-admin-app` (UI de moderação manual).

## Não fazer aqui

- VoC / síntese — agente `reviews-ops`.
- Cálculo de AggregateRating — `review-service/src/workers/aggregate-rating-sync`.
- Schema.org markup — `04_apps/shopify-theme` (Liquid).

## Status

Stub. Contratos TS e enum de providers; nenhuma implementação real.
