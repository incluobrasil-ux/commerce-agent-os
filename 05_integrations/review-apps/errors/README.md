# review-apps/errors/

Erros normalizados. Mesmo conjunto independente do provider.

## Classes

| Classe | Quando |
|---|---|
| `ReviewsAuthError` | API key/token inválido ou expirado |
| `ReviewsRateLimitError` | provider retornou 429; carrega `retryAfterMs` |
| `ReviewsResourceNotFound` | review/produto não encontrado |
| `ReviewsProviderUnavailable` | provider down (5xx, timeout) |
| `ReviewsWebhookSignatureError` | HMAC/assinatura inválida em webhook |
| `ReviewsReplyForbidden` | provider não permite resposta ao review (algumas categorias) |
| `ReviewsModerationConflict` | tentativa de publicar resposta a review já moderada/deletada |

## Convenção

Cada erro carrega `provider` no contexto (para diagnose), além de `code`, `cause`, `context`.

## Status

Stub.
