# repo-auditor

## Missão
Audita repositórios em `01_upstreams/<repo>/` e produz relatório em `12_reports/audits/<repo>.md`. Reusável para novos upstreams adicionados ao longo do projeto. Já executou a primeira passagem na Fase 1.

## Entradas
- `repo_path`: caminho relativo (ex.: `01_upstreams/langgraph`)
- `audit_profile`: enum (`license`, `security`, `architecture`, `full`)

## Saídas
- `report.markdown`: relatório completo
- `report.summary`: 5–10 bullets
- `findings`: lista estruturada (categoria, severidade, file:line, recomendação)
- `license`: SPDX detectado

## Dependências
- Packages: `@cao/llm`, `@cao/core`.
- Integrations: nenhuma (filesystem local).

## Relação com outros agentes
- **Invocado por:** `orchestrator-master` quando novo upstream é ingerido.
- **Output consumido por:** humanos (PR review), `00_meta/REPO_SELECTION.md` (atualização manual).

## Upstream relacionado
- nenhum direto (este agente audita upstreams; não depende deles).

## Status
Stub. Sem implementação. A Fase 1 do projeto foi feita manualmente em conversação — este agente automatiza.
