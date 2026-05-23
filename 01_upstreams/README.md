# 01_upstreams

Repositórios externos, **read-only** (ADR-0002). Conteúdo **não** é versionado no monorepo — cada operador clona localmente.

## Bootstrap

```bash
bash 10_ops/scripts/clone-upstreams.sh                    # todos
bash 10_ops/scripts/clone-upstreams.sh langgraph          # um específico
```

SHAs pinados no próprio script. Atualizar = editar o script + re-clonar.

## Política

- Nunca editar conteúdo aqui. Adaptações vivem em `06_packages/` ou `05_integrations/` com header de atribuição (ADR-0002).
- Auditoria de cada upstream via `pnpm audit:repo 01_upstreams/<name>` (output em `12_reports/audits/repo-auditor/`).
- Classificação completa: [`../00_meta/REPO_SELECTION.md`](../00_meta/REPO_SELECTION.md).

## Upstreams atualmente listados

| Nome | Pin SHA |
|---|---|
| `langgraph` | `d1e2ff05` |
| `shopify-app-template-react-router` | `5a0017b0` |

8 upstreams restantes (de `REPO_SELECTION.md` prioridade alta) podem ser adicionados ao script conforme necessário.
