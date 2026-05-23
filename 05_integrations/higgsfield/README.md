# higgsfield

Adapter autoral para o ecossistema Higgsfield. Cobre **duas superfícies distintas**:

1. **Skills (runtime):** descobrir e executar skills durante runs de agentes.
2. **CLI (dev/ops):** gerenciamento de skills (install, list, update) — wrapper fino em `10_ops/higgsfield-cli/` (scripts), não como dependência runtime.

> Detalhes completos em [`02_architecture/integrations/higgsfield-map.md`](../../02_architecture/integrations/higgsfield-map.md).

## Superfície coberta

| Superfície | Forma | Localização |
|---|---|---|
| Skill discovery (lista de skills disponíveis) | a confirmar (CLI / registry HTTP) | `client/` |
| Skill manifest read | leitura de metadados | `client/` |
| Skill execution | invocação | `client/` |
| Skill install / update | via CLI | `10_ops/higgsfield-cli/` (wrappers shell) |

## Estrutura

```
higgsfield/
├─ client/         HTTP/CLI client + auth (quando aplicável)
├─ types/          Skill, SkillManifest, SkillExecutionInput/Result
├─ errors/         classes normalizadas
├─ skills-catalog.yaml  catálogo declarativo de skills selecionadas (cherry-pick)
├─ index.ts        barrel
├─ package.json
└─ tsconfig.json
```

## Auth

- `HIGGSFIELD_API_KEY` (a confirmar — depende se há registry HTTP autenticado).

## Consumido por

- `06_packages/skills` — registry interno faz proxy de skills selecionadas.
- `10_ops/higgsfield-cli` — scripts de dev/ops invocam CLI direto.
- Agentes (indiretamente) via `@cao/runtime` que invoca `@cao/skills`.

## Upstream

- `01_upstreams/higgsfield-skills` — biblioteca de skills (cherry-pick).
- `01_upstreams/higgsfield-cli` — CLI oficial (wrapped).

**Nenhum dos dois clonado ainda.** Bloqueia confirmação de formato/runtime exato.

## Status

Stub. Contratos TS preliminares baseados na premissa de "skills como unidades declarativas com manifest + executor". Formato exato será confirmado ao clonar upstreams (Fase 6).

## Pendências

- Clonar `higgsfield-ai/skills` e `higgsfield-ai/cli`.
- Confirmar:
  - Existe registry HTTP ou tudo via CLI?
  - Auth (API key? OAuth? local config?).
  - Formato de manifest de skill (JSON? YAML? Markdown com frontmatter?).
  - Modelo de execução (sandbox? eval direto? subprocess?).
- Decidir mecanismo de cherry-pick em `06_packages/skills`.
