---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-23T16:10:00Z
tags: [index, run-summaries]
source: mixed
confidence: 1.0
---

# Run Summaries — Index

**Para que serve:** catálogo único de todos os resumos curados. Diferente do [README.md](README.md) (que ensina o **padrão**), este lista o **conteúdo real**.

**Como usar:** quando criar resumo novo, adicionar 1 linha aqui no topo da tabela do `kind` correspondente. Quando procurar "já resumimos X?", consultar aqui primeiro.

**Output que gera:** entrada única para descobrir o que o sistema já documentou.

**Regra:** uma linha por resumo, ≤ 150 caracteres. Sem prosa. Se o título não diz o suficiente, o slug do arquivo está errado — renomear.

---

## Impl milestones

Marcos de implementação (sub-fase concluída, primeiro deploy, OAuth funcionando, etc.).

| Data | Título | Resultado | Arquivo |
|---|---|---|---|
| 2026-05-23 | Macro-fase 1 (setup/scaffold) concluída | 🟢 | [2026-05-23-impl-milestone-phase-1-setup-complete.md](2026-05-23-impl-milestone-phase-1-setup-complete.md) |

## Test milestones

Passagem ou regressão relevante de suíte.

| Data | Título | Resultado | Arquivo |
|---|---|---|---|
| 2026-05-23 | Sub-fase 2.2 — suite completa verde (41 testes) | 🟢 | [2026-05-23-test-milestone-sub-phase-2-2-suite-green.md](2026-05-23-test-milestone-sub-phase-2-2-suite-green.md) |

## Audits

Resultado de auditoria (manual ou via agente).

| Data | Título | Resultado | Arquivo |
|---|---|---|---|
| 2026-05-23 | Auditoria de gaps da Macro-fase 1 (31 gaps em 4 severidades) | 🟡 | [2026-05-23-audit-phase-1-gap-analysis.md](2026-05-23-audit-phase-1-gap-analysis.md) |

## Agent runs

Execuções de agentes em runtime real.

| Data | Título | Resultado | Arquivo |
|---|---|---|---|
| 2026-05-23 | Primeira execução real do `repo-auditor` (self-audit) | 🟢 | [2026-05-23-agent-run-repo-auditor-self-audit.md](2026-05-23-agent-run-repo-auditor-self-audit.md) |

---

## Como adicionar entrada

1. Criar o resumo a partir de [`_template.md`](_template.md), salvar como `<YYYY-MM-DD>-<kind>-<slug>.md`.
2. Adicionar 1 linha **no topo** da tabela do `kind` correspondente acima.
3. Atualizar `updated_at` no frontmatter deste arquivo.
4. Commitar junto com o resumo.

## Como remover entrada

Não remover. Resumo superseded → atualizar o resumo com nota `superseded by <slug>` no topo + manter linha aqui. Histórico inteiro fica preservado.

## Sobre filtro / busca

Hoje 100% manual (Ctrl+F no arquivo). Quando passar de ~20 resumos, avaliar:
- separar este index em múltiplos arquivos por trilha ([workstreams.md](../workstreams.md)) ou por agente.
- avaliar index automático via `@cao/memory` (ADR-0005 prevê).
