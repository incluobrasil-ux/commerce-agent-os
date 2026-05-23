# src/webhooks/

Handlers HTTP de webhooks dos providers de reviews.

## Convenção

Cada provider tem seu próprio mecanismo de assinatura (HMAC, basic auth, IP allowlist). O adapter `05_integrations/review-apps/providers/<name>/` expõe o verificador correto.

Cada handler:
1. Verifica assinatura/identidade (via adapter).
2. Faz parse + normalização (via adapter → tipo `Review` do nosso domínio).
3. Enqueue em `reviews.ingested` (worker assíncrono).
4. Responde 200 imediatamente.

## Handlers previstos

| Arquivo | Provider |
|---|---|
| `judge-me.ts` | Judge.me |
| `yotpo.ts` | Yotpo |
| `loox.ts` | Loox (parcial; complementar com polling) |
| `stamped.ts` | Stamped |
| `okendo.ts` | Okendo |

Shopify nativo (Product Reviews legacy) **não tem webhook** — coberto pelo `ingesters/shopify-native.ts`.

## Status

Stub.
