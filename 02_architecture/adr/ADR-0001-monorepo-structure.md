# ADR-0001 — Estrutura do monorepo

- **Data:** 2026-05-23
- **Status:** aceita
- **Supersede:** —

## Contexto

O projeto comporta múltiplas dimensões heterogêneas:
- agentes de cognição,
- apps de produto (Shopify embedded, serviços),
- integrações com SaaS externos,
- pacotes compartilhados,
- estudos de upstreams,
- prompts operacionais, dados, ops, testes, relatórios.

Misturar tudo em uma única árvore convencional (`src/`, `apps/`, `packages/`) embaralha código autoral com referências externas e dificulta navegação entre fases.

## Decisão

Adotar **estrutura numerada por área** na raiz do repositório:

```
00_meta/  01_upstreams/  02_architecture/  03_agents/  04_apps/
05_integrations/  06_packages/  07_memory/  08_data/
09_prompts/  10_ops/  11_tests/  12_reports/
```

- Os números (`00_` … `12_`) preservam ordem visual estável.
- Cada pasta tem responsabilidade única.
- Pastas que contêm pacotes pnpm (`03_agents/*`, `04_apps/*`, `05_integrations/*`, `06_packages/*`) participam de `pnpm-workspace.yaml`. As demais não são packages.

## Consequências

**Positivas**
- Separação clara entre código autoral e upstreams.
- Cada fase grava saída em diretório previsível.
- Navegação previsível por ordem numérica.

**Negativas / trade-offs**
- Convenção não-padrão na comunidade Node.js — exige onboarding de colaboradores.
- Caminhos mais longos (`03_agents/foo` vs `agents/foo`).

**Mitigações**
- `CLAUDE.md` documenta o layout no topo do repo.
- Imports usam aliases (a configurar via tsconfig paths) para evitar caminhos relativos longos.
