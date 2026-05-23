# 11_tests/smoke

Smoke tests do monorepo. Objetivo: detectar quebras grosseiras rapidamente.

## Regras

- Cada teste roda **< 30s** isoladamente.
- **Zero rede externa.**
- Falham mesmo sem `node_modules` instalado (idealmente — para os testes shell).
- Saída humana legível + exit code UNIX.

## Testes atuais

| Teste | O que valida | Tipo | Status |
|---|---|---|---|
| `structure.smoke.sh` | Árvore monorepo conforme `validate-structure.sh` | shell | placeholder funcional |
| `packages-build.smoke.ts` | `pnpm typecheck` passa em todos os packages de `06_packages/` | vitest (futuro) | placeholder |
| `shared-types-importable.smoke.ts` | `@cao/shared-types`, `@cao/shared-schemas`, `@cao/shared-config` importáveis | vitest (futuro) | placeholder |

## Como rodar (quando habilitado)

```
pnpm test:smoke         # placeholder — Fase 5
bash 11_tests/smoke/structure.smoke.sh   # já funciona
```
