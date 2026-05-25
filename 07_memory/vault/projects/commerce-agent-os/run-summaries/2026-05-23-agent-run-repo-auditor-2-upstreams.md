---
created_at: 2026-05-23T16:40:00Z
updated_at: 2026-05-23T16:40:00Z
tags: [agent-run, repo-auditor, upstreams, sub-fase-2-3]
source: agent:repo-auditor
kind: agent-run
result: green
confidence: 1.0
related:
  - 12_reports/audits/repo-auditor/langgraph-20260523-163921.md
  - 12_reports/audits/repo-auditor/shopify-app-template-react-router-20260523-163922.md
  - 10_ops/scripts/clone-upstreams.sh
  - 00_meta/upstreams_index.md
---

# `repo-auditor` em 2 upstreams (langgraph + shopify-app-template)

## Contexto

Início efetivo da Sub-fase 2.3 (ingestão de upstreams). Clonados `langgraph` (@d1e2ff05) e `shopify-app-template-react-router` (@5a0017b0) em `01_upstreams/` via `bash 10_ops/scripts/clone-upstreams.sh` (clone raso, SHA pinado conforme ADR-0002). Rodado `pnpm audit:repo` em cada um.

## O que aconteceu

- Política de upstreams confirmada: conteúdo de `01_upstreams/*/` agora **gitignored** — cada operador clona via script. Mantém o monorepo leve (~17MB de langgraph ficaria fora do git history).
- 1ª execução do auditor em `langgraph`: license `MIT`, 0 críticos, 0 warnings.
- 1ª execução em `shopify-app-template-react-router`: **bug encontrado** — detector retornava `UNKNOWN` mesmo com `LICENSE.md` presente (Shopify usa MIT mas sem header "MIT License" literal).
- **Fix aplicado** no detector: `SPDX_KEYWORDS` virou `SPDX_PATTERNS` com matchers alternativos. Adicionado pattern canônico de MIT (`"Permission is hereby granted, free of charge"` + `"without restriction"` + `"THE SOFTWARE IS PROVIDED \"AS IS\""`).
- Quando LICENSE existe mas SPDX é `UNKNOWN`, agora **gera finding warning** em vez de silenciar.
- 2 testes novos: detecção MIT canônica + warning de SPDX desconhecido. Suíte sobe de 52 para **54 testes verdes**.
- Re-execução: ambos upstreams identificados como `MIT` corretamente.

## Achados / decisões

- **Política de gitignore em upstreams:** `01_upstreams/*/` excluído (exceto `01_upstreams/README.md`). Operadores rodam `bash 10_ops/scripts/clone-upstreams.sh` no setup local. Pin via SHA dentro do próprio script (manifest leve).
- **Detector de licença era frágil:** 2/2 dos primeiros upstreams reais já expuseram um caso edge. Heurísticas atuais ainda são limitadas — quando aparecer Apache 2.0 ou BSD-3 num clone futuro, esperar bug similar e adicionar pattern.
- **`langgraph` é Python primário** (não TS) — `Apache License 2.0` ❌ ERRADO, é MIT — apesar do nome do projeto sugerir TS via "LangGraph JS". O TS lives em `libs/langgraph-js/` dentro do monorepo principal. Detalhe relevante para ADR-0007 (que cita LangGraph JS como design reference).
- **`shopify-app-template-react-router`** é leve (323KB), TS + Remix/React Router 7, Prisma stub. Stack confirmada para Sub-fase 2.6.

## Impacto

Bloqueio B2 (nenhum upstream clonado) **resolvido**. Sub-fase 2.3 minimamente atendida (2/10 upstreams; outros 8 podem ser adicionados ao script conforme demanda). Bloqueio formal para Sub-fase 2.4 (LLM end-to-end) é agora apenas N5 — todos os pré-requisitos foram satisfeitos. Detector de auditoria evolui de heurística shallow para algo testado contra dois casos reais.

## Ações geradas

- [ ] N5 — LLM end-to-end (próximo).
- [ ] Quando clonarmos upstreams com Apache 2.0 ou BSD-3 — adicionar mais patterns alternativos em `SPDX_PATTERNS` (ex.: Apache pelo `Licensed under the Apache License, Version 2.0`).
- [ ] Considerar adicionar `01_upstreams/MANIFEST.yaml` quando passar de 4–5 upstreams (o array no shell script vai ficar feio).

## Referências

- raw langgraph: [`12_reports/audits/repo-auditor/langgraph-20260523-163921.md`](../../../../../12_reports/audits/repo-auditor/langgraph-20260523-163921.md)
- raw shopify: [`12_reports/audits/repo-auditor/shopify-app-template-react-router-20260523-163922.md`](../../../../../12_reports/audits/repo-auditor/shopify-app-template-react-router-20260523-163922.md)
- script: [`10_ops/scripts/clone-upstreams.sh`](../../../../../10_ops/scripts/clone-upstreams.sh)
- detector: [`03_agents/repo-auditor/src/index.ts`](../../../../../03_agents/repo-auditor/src/index.ts) (`SPDX_PATTERNS`)
- index atualizado: [`00_meta/upstreams_index.md`](../../../../../00_meta/upstreams_index.md)
