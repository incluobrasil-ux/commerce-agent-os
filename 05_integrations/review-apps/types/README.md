# review-apps/types/

Tipo normalizado `Review` que **todos** os providers emitem. Consumidores (agentes, workers) nunca veem payload do provider.

## Tipos

- `ProviderName` — enum de providers conhecidos.
- `ReviewId` — branded id `<provider>:<external_id>`.
- `Review` — payload normalizado.
- `ReviewAuthor` — autor (PII escopo restrito).
- `ReviewMedia` — fotos/vídeos quando o provider suporta.
- `ReviewResponse` — resposta publicada (se houver).

## Convenções

- Rating sempre em escala **1.0–5.0** com 1 casa decimal — normalizar do provider.
- `verifiedPurchase` é `boolean | null` (null quando provider não distingue).
- `language` em ISO 639-1 (`en`, `pt`, `es`).
- `createdAt` ISO 8601 UTC.

## Status

Stub.
