# @cao/shared-config

Schemas e **nomes canônicos** de configuração. Centraliza:
- Validação de `process.env` (schema).
- Nomes de env vars como **constantes** (evita typo em string literal espalhada).
- Schemas de feature flags e policy refs.

## Por que existe (e não no `@cao/config`)

- `@cao/config` é a **camada runtime** que lê env, carrega defaults por ambiente, mascara secrets em logs.
- `@cao/shared-config` é a **definição** dos schemas e constantes. Sem código runtime de I/O.
- Separação permite que packages que só precisam dos nomes (ex.: docs gen, tests) importem `shared-config` sem puxar `dotenv` ou parser.
- Ver [ADR-0004](../../02_architecture/adr/ADR-0004-shared-packages.md).

## API atual (mínima)

```ts
import { SECRET_NAMES } from '@cao/shared-config';
SECRET_NAMES.SHOPIFY_API_KEY  // 'SHOPIFY_API_KEY'
```

## API prevista

- `EnvSchema` — zod schema validando o conjunto inteiro de env vars exigidas.
- `featureFlag(name)` helper tipado.
- `PolicyRefSchema` para identificadores de policy.

## Consumido por

- `@cao/config` (carga runtime).
- Adapters em `05_integrations/` (declaração de quais secrets esperam).
- Apps em `04_apps/` (boot check).

## Status

Stub funcional: `SECRET_NAMES` populado com as chaves de `integration-map.md`.
