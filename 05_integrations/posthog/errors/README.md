# posthog/errors/

Classes de erro normalizadas.

## Classes

| Classe | Quando |
|---|---|
| `PostHogConfigError` | env vars faltando ou inconsistentes |
| `PostHogTaxonomyError` | evento ou property fora da taxonomia (em dev/staging) |
| `PostHogPiiError` | propriedade em `forbidden` foi passada |
| `PostHogQueryError` | HogQL retornou erro |
| `PostHogQuotaExceeded` | quota do plan PostHog excedida |

## Status

Stub.
