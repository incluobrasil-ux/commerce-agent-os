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

| Nome | Pin SHA | Licença | Tamanho |
|---|---|---|---|
| `langgraph` | `d1e2ff05` | MIT | 17M |
| `shopify-app-template-react-router` | `5a0017b0` | MIT | 323K |
| `dawn` | `9ccdacf8` | MIT | 6.2M |
| `merchant-api-samples` | `371468ac` | Apache-2.0 | 4.7M |
| `feedgen` | `cf264a5f` | Apache-2.0 | 4.4M |
| `basic-memory` | `a7e2368f` | **AGPL-3.0** ⚠ | 12M |
| `agentshield` | `25d91f00` | MIT | 5.3M |
| `ad-factory-agent` | `8596feeb` | **UNKNOWN** ⚠ | 1.3M |
| `higgsfield-skills` | `5af02582` | MIT | 585K |
| `higgsfield-cli` | `46cc997c` | MIT | 514K |

**Atenções:**
- `basic-memory` é AGPL-3.0 (copyleft forte): seguro como **referência conceitual**; importar código exigiria publicar nosso projeto como AGPL.
- `ad-factory-agent` sem LICENSE: tecnicamente "all rights reserved". Usar **apenas para estudo**, não para copiar código.

Audits completos: [`12_reports/audits/upstream-pass2/`](../12_reports/audits/upstream-pass2/).
