# google-merchant/errors/

Classes de erro normalizadas. Consumidores nunca pegam erros raw do client REST.

## Classes

| Classe | Quando |
|---|---|
| `GMCAuthError` | OAuth/service account falhou; token expirado; conta não autorizada |
| `GMCRateLimitError` | HTTP 429; carrega `retryAfterMs` |
| `GMCResourceNotFound` | produto/status/conta inexistente |
| `GMCValidationError` | request malformado (400) — não recuperável sem mudar payload |
| `GMCDisapprovalError` | semântico — não é erro de API, mas leitura de productstatus mostrando disapproval; usado em fluxos defensivos |
| `GMCAccountNotClaimed` | claim de domínio ausente |
| `GMCApiVersionMismatch` | resposta com versão diferente da pinada |

## Convenção

Cada erro carrega `code`, `cause` (opcional), `context` (mascarado).

## Status

Stub.
