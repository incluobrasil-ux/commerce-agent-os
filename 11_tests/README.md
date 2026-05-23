# 11_tests

Testes cross-package em **5 camadas**. Unitários colocalizados em cada package (`<file>.test.ts`) ficam de fora.

## Camadas

| Subdir | Tempo alvo | Externalidades | Quando roda | Detalhe |
|---|---|---|---|---|
| [`smoke/`](./smoke/) | < 30s | zero | pre-commit + CI | sanity check do esqueleto |
| [`contract/`](./contract/) | < 5min | zero (mocks fixos) | CI | schemas declarados vs realidade |
| [`integration/`](./integration/) | < 15min | DB local, mocks | CI principal | cross-package com dependências reais sem rede externa |
| [`e2e/`](./e2e/) | até 30min | staging completo | nightly + release | cenários reais com credenciais reais |
| [`performance/`](./performance/) | budget per test | métricas baseline | CI principal | budgets de latência + custo |

## Stack prevista

- **vitest** como runner (confirmar em ADR-0006).
- Fixtures em `<scope>/fixtures/`.
- Sem rede externa em smoke/contract/unit; mocks em integration; real em e2e.

## Política

Detalhe da estratégia em [`02_architecture/security-model/qa-governance-map.md`](../02_architecture/security-model/qa-governance-map.md).

Falha de teste **bloqueia merge** conforme camada — ver matriz no map.

## Status

| Subdir | Status |
|---|---|
| `smoke/` | 2 stubs funcionais (validate-structure delegate + vitest stub) |
| `contract/` | README com 6 testes previstos; sem implementação |
| `integration/` | README com 6 testes previstos; sem implementação |
| `e2e/` | README com 7 cenários previstos; sem implementação |
| `performance/` | README com 6 testes previstos + alvos rascunho; sem implementação |
