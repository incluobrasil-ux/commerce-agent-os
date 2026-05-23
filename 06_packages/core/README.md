# @cao/core

Tipos compartilhados, erros base, utilidades puras (clock, ids, retry, fs_walk, idempotency keys).

## API prevista
- `BaseError` + subclasses por domínio.
- `Result<T,E>` (ou via exceptions tipadas — a definir).
- `Clock` injetável.
- `IdGenerator` (ULID/UUID).
- `fsWalk`, `licenseDetect` — usados por `repo-auditor`.
- `retry(fn, policy)`.

## Consumido por
- Todos os outros packages e apps.

## Não deve depender de
- Nenhum outro package interno (é o nível mais baixo).
- Nenhuma integração externa.

## Status
Stub. `src/index.ts` exporta `{}`.
