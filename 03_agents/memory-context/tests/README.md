# Tests — memory-context

Casos mínimos a cobrir:

- Query simples → retorna bundle com sources não vazias.
- Budget pequeno → `truncated=true` e marca quais sources foram cortadas.
- Memória vazia → erro `NoMemoryFound`.
- PII presente mas query não sobre cliente → bundle redigido.
- Multi-tenant: tenant A não pode ler memória de tenant B.
