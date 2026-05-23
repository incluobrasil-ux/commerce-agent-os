# review-apps/providers/

Implementações por provider. Cada uma implementa `ReviewProvider` (`../types/index.ts`).

## Convenção por provider

```
providers/<name>/
├─ index.ts             exporta make<Name>Provider(tenant) implementando ReviewProvider
├─ client.ts            HTTP/SDK client específico
├─ normalize.ts         payload bruto → Review
├─ webhook.ts           (se aplicável) verificação + parse de webhook
└─ tests/               fixtures de payloads reais (anonimizados)
```

## Providers atuais

| Provider | Arquivo principal | Status |
|---|---|---|
| Judge.me | `judge-me/index.ts` | stub |
| Shopify nativo (legacy) | `shopify-native/index.ts` | stub |
| Yotpo | `yotpo/index.ts` | stub |
| Loox | `loox/index.ts` | stub |
| Stamped | `stamped/index.ts` | stub |
| Okendo | `okendo/index.ts` | stub |

## Ordem de implementação sugerida

1. `judge-me` (free tier + webhook + photo) — primeiro provider real.
2. `shopify-native` (sem webhook, mas zero custo de assinatura) — fallback.
3. Demais conforme demanda dos primeiros tenants.

Detalhe em `../providers.yaml` e `12_reports/audits/reviews-readiness.md`.
