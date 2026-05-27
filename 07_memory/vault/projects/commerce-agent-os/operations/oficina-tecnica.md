---
aliases: [Oficina, Oficina Técnica, Build, CI, Tooling]
tags: [operations-map, role:dev-tooling]
icon: icons/oficina-tecnica.svg
category: tooling
color: "#94A3B8"
technical_name: CI + biome + tsc + vitest + commitlint + gitleaks
technical_path: .github/workflows, biome.json, tsconfig.json
---

# Oficina Técnica

**Papel:** infraestrutura que garante que código entra no repo sem quebrar. Não é cérebro operacional — é o que protege o cérebro.

**Componentes:**
- **biome** (`pnpm lint`) — lint + format unificado
- **tsc -b** (`pnpm typecheck`) — typecheck cross-workspace
- **vitest** (`pnpm test`, `pnpm test:smoke`) — 378 testes em 42 arquivos
- **gitleaks** (`pnpm secret-scan`) — secret scan no pre-commit
- **commitlint** — Conventional Commits enforcement
- **CI GitHub Actions** — lint + typecheck + smoke + commitlint em PR
- **`pnpm doctor`** — 10 checks cross-platform

**Quando entra:** automaticamente em todo commit (pre-commit hook) e PR. Não afeta operação de loja.
