# posthog/types/

Tipos do adapter — não duplica os tipos brutos do SDK, mas adiciona tipos canônicos referenciando as taxonomias.

## Tipos

- `EventName` — union string de nomes em `events-taxonomy.yaml`.
- `EventProperties<E>` — propriedades requeridas + opcionais para um event name `E`.
- `Identity` — payload de identify (sem PII).
- `FlagPayload` — leitura de feature flag.
- `HogQLResult<T>` — resultado parametrizado de query.

## Status

Stub. `EventName` será gerada a partir do YAML em build futuro.
