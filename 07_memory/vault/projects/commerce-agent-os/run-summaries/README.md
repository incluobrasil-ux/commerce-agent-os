---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-23T00:00:00Z
tags: [run-summaries, pattern]
source: human:incluobrasil
confidence: 1.0
---

# Run Summaries

**Para que serve:** transformar **outputs relevantes** de execuções de agentes (ou sessões de trabalho longas) em resumos curados que viram memória útil. Não é log bruto — é o que sobra **depois** de filtrar ruído.

**Como usar:** depois que um agente executa e produz output em `12_reports/` (ou audit log do tenant), o operador decide:

1. Output é relevante para a equipe (decisão, descoberta, regressão, marco)? Se sim, criar arquivo aqui.
2. Output é só ruído de execução? Deixa em `12_reports/` e não cria resumo.

**Output que gera:** biblioteca curada e pesquisável de "o que o sistema descobriu / decidiu / fez de importante".

**Hoje 100% manual.** Não automatizar antes do padrão estar estável (depois de ~10–20 resumos reais).

## Quando criar um resumo

Criar **se** uma das condições for verdade:

- Execução tomou ou influenciou uma decisão (entra também em `decision-index.md`).
- Execução descobriu algo não óbvio (bug crítico, gap arquitetural, oportunidade).
- Execução é o **primeiro** de seu tipo (ex.: primeira chamada Anthropic real, primeiro deploy, primeiro tenant provisionado).
- Execução falhou de modo que vale registrar para não repetir.
- Execução produziu artefato que outro agente vai consumir depois.

Não criar para:

- Smoke/CI passando "normalmente".
- Output rotineiro de agente já estabelecido (vai pra audit log, não pra aqui).
- Dump de logs sem síntese.

## Naming e localização

```
run-summaries/<YYYY-MM-DD>-<kind>-<slug>.md
```

`<kind>` é um de:

| kind | quando usar | exemplo |
|---|---|---|
| `agent-run` | execução de um agente em runtime | `2026-05-30-agent-run-repo-auditor-first-run.md` |
| `audit` | resultado de auditoria (manual ou via `repo-auditor` / `governance-risk-qa`) | `2026-05-23-audit-phase-1-gap-analysis.md` |
| `test-milestone` | passagem ou regressão relevante de smoke/integration/e2e | `2026-05-23-test-milestone-sub-phase-2-2-suite-green.md` |
| `impl-milestone` | implementação que destrava algo (sub-fase concluída, primeiro deploy, OAuth funcionando) | `2026-05-23-impl-milestone-phase-1-setup-complete.md` |

Slug em kebab-case, ≤ 60 chars no total (incluindo prefixo). Sem acentos.

## Convenção de campos no frontmatter

Padrão único para todos os `kind`. Detalhe em [_template.md](_template.md).

| Campo | Obrigatório | Conteúdo |
|---|---|---|
| `created_at` | sim | ISO 8601 UTC |
| `updated_at` | sim | ISO 8601 UTC |
| `tags` | sim | kebab-case, 2–5 tags |
| `source` | sim | `agent:<name>` \| `human:<id>` \| `mixed` |
| `kind` | sim | um dos 4 acima |
| `result` | sim | `green` \| `yellow` \| `red` |
| `confidence` | sim | 0.0–1.0 (1.0 para audit/milestone humano; menor para extração automática) |
| `related` | recomendado | lista de paths para raw report / audit log / código |

## Convenção mínima por seção

Padrão para o corpo (mesmo esqueleto, ênfase muda por `kind`):

| Seção | Para todos | Ênfase por kind |
|---|---|---|
| **Origem** (linha 1 de Contexto) | "rodou em <data>, em input/escopo X" | `agent-run`: nome do agente + tenant; `audit`: escopo auditado; `test-milestone`: suíte; `impl-milestone`: sub-fase |
| **Resultado** (frontmatter `result` + 1 linha em "O que aconteceu") | sempre green/yellow/red | `agent-run`: output válido?; `audit`: gaps abertos; `test-milestone`: contagem verde/vermelho; `impl-milestone`: critério da DoD batido? |
| **Impacto** | sempre 1 parágrafo curto | `agent-run`: mudou estado de tenant?; `audit`: bloqueia próxima fase?; `test-milestone`: regressão ou destrava?; `impl-milestone`: novo semáforo em ops-brief |
| **Próximo passo** (em "Ações geradas") | sempre — mesmo que vazio | apontar para `next-actions.md` / `active-todos.md` / `decision-index.md` |

## Formato padrão

Cada resumo segue o esqueleto em [_template.md](_template.md). Manter **curto** — se passar de 1 página renderizada, dividir em arquivos.

Esqueleto resumido (copiar do template):

```markdown
---
created_at: ...
updated_at: ...
tags: [...]
source: ...
kind: agent-run | audit | test-milestone | impl-milestone
result: green | yellow | red
confidence: 0.0–1.0
related: [...]
---

# Título

## Contexto
## O que aconteceu
## Achados / decisões
## Impacto
## Ações geradas
## Referências
```

**Exemplos reais** já no diretório — usar como referência:
- `2026-05-23-impl-milestone-phase-1-setup-complete.md`
- `2026-05-23-audit-phase-1-gap-analysis.md`
- `2026-05-23-test-milestone-sub-phase-2-2-suite-green.md`

## Como conecta com o resto do cérebro

```
agente roda
   ↓ output bruto
12_reports/  ou  vault/<tenant>/audit/
   ↓ curadoria manual
run-summaries/<slug>.md  ←─ você está aqui
   ↓ se gera ação
next-actions.md  ou  active-todos.md
   ↓ se muda decisão
decision-index.md  (e abre ADR se estrutural)
   ↓ se muda semáforo
ops-brief.md
   ↓ sempre
session-log.md (1 linha apontando para o resumo)
```

## Antipadrões

- ❌ Resumo = transcrição do output completo. Se não tem síntese, não é resumo.
- ❌ Resumo sem "Ações geradas" (mesmo que vazio explicitamente: `- nenhuma`).
- ❌ Criar resumo só por hábito quando nada relevante aconteceu.
- ❌ Resumir múltiplas execuções não relacionadas no mesmo arquivo.

## Próximo nível (não fazer ainda)

Quando houver ~10–20 resumos manuais bem-formatados:

1. Avaliar se vale um agente `summary-curator` que sugere resumo a partir de output bruto.
2. Avaliar índice automático (tags / busca semântica) — depende de `@cao/memory` ter index derivado (ver ADR-0005).

Por enquanto: padrão manual primeiro, automação depois.
