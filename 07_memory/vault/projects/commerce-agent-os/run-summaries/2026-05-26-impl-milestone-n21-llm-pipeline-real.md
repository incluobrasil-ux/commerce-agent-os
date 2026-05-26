---
created_at: 2026-05-26T14:10:00Z
updated_at: 2026-05-26T14:10:00Z
tags: [n21, llm, pipeline, end-to-end, incluo, store-scoped]
source: human:incluobrasil-ux
kind: impl-milestone
result: green
confidence: 1.0
related:
  - 07_memory/vault/incluo-tenant/stores/incluo/marketing/
  - 07_memory/vault/incluo-tenant/stores/incluo/creative/
  - 07_memory/vault/incluo-tenant/stores/incluo/offers/
  - 07_memory/vault/incluo-tenant/stores/incluo/compliance/
  - 07_memory/vault/tenants/incluo-tenant/stores/incluo/run-summaries/
  - 06_packages/llm/src/anthropic-client.ts
  - 03_agents/merchant-compliance/src/index.ts
  - 03_agents/design-ux-localization/src/index.ts
---

# N21 — Pipeline LLM real end-to-end no contexto Incluo (4/5 OK)

## Contexto

Primeira execução real LLM end-to-end depois do multi-tenant hardening. Pipeline com 5 agentes Tier-2 store-scoped (`--tenant=incluo-tenant --store=incluo --capture`), cada um produzindo artifact distinto para o contexto Incluo (brinquedos sensoriais/fidget/Montessori, BR market).

## O que aconteceu

| # | Agente | Status | Custo | Highlights |
|---|---|---|---|---|
| 1 | `marketing:plan` | ✅ | $0.060 | 7 iniciativas, 7 KPIs, 6 risks para Q3 2026. Plano "Incluo Q3 2026: Recompra e Expansão Neurodivergente". |
| 2 | `creative:assets` | ✅ | $0.029 | 4 variantes (meta-ads/email/instagram-stories × feed-image/carousel/email-html), 8 CTAs, visual brief para campanha "volta-as-aulas-q3-2026". |
| 3 | `design:ux` | ❌ | $0 (retry) | Falhou — output JSON 12K chars (precisou bump max_tokens 4096→8192) + zod validation ainda falha (schema needs deeper relaxation; deferido). |
| 4 | `product:offer` | ✅ | $0.027 | Hero "Concentração e coordenação em cada conta", 6 value props, 3 bundles, 6 CTAs para o SKU red `contas-madeira-montessori`. |
| 5 | `merchant:compliance` | ✅ | $0.058 | **SEVERITY HIGH** — 10 legal risks, 6 disclaimers requeridos, 7 revisões. Análise legal-grade citando CDC art. 37, ANVISA, Lei Berenice Piana 12.764/2012, CONANDA Res. 163/2014, INMETRO/ABNT NBR 11786. |

**Total custo: $0.174** (vs estimativa $0.30).

Todos os 4 agentes successful escreveram outputs em `vault/incluo-tenant/stores/incluo/{marketing,creative,offers,compliance}/` e capturaram run-summary em `vault/tenants/incluo-tenant/stores/incluo/run-summaries/`. Multi-tenant routing 100% correto: nenhum artifact vazou para outro tenant/store.

## Achados / decisões

### Bugs descobertos no pipeline

1. **`max_tokens` default 1024 era insuficiente para outputs estruturados Tier-2.** Marketing-director (7 iniciativas × 10 campos) e design-ux gravaram JSON > 1024 tokens e truncaram, gerando `Unterminated string in JSON` errors. **Fix:** bump default para 8192 em [`06_packages/llm/src/anthropic-client.ts`](../../../../06_packages/llm/src/anthropic-client.ts). Custo extra desprezível (cobrado só por tokens gerados).

2. **Zod schemas de merchant-compliance eram apertados demais para análises legais detalhadas.** Claude gera rationale legal de 500-1500 chars; schema limitava em 500. **Fix:** relaxado em [`03_agents/merchant-compliance/src/index.ts`](../../../../03_agents/merchant-compliance/src/index.ts) — legalRisks.excerpt 400→1000, rationale 500→2000, revisions 500→1500, etc.

3. **design-ux zod schema ainda muito apertado** — mesmo após relaxar uxNotes/accessibilityNotes 400→800, contentHint 500→1500, etc., re-run validou JSON OK mas output zod ainda falhou. Schema precisa de surgery mais profunda OU caller precisa simplificar brief. **Deferido** — não bloqueia o resto do pipeline.

### Inconsistência arquitetural identificada

- Memory escreve em `vault/<tenant>/stores/<store>/` (sem prefix `tenants/`).
- brain-bridge captureRun escreve em `vault/tenants/<tenant>/stores/<store>/run-summaries/` (com prefix `tenants/`).
- Ambos isolados corretamente por tenant/store, mas paths divergem.
- **Defer:** consolidar para `tenants/` em ambos seria breaking para Memory tests existentes. Decisão: documentar a inconsistência por enquanto; fix em sub-fase dedicada quando outros agentes forem migrados em massa.

### Valor real demonstrado

O run de `merchant:compliance` no PDP real da Incluo (`contas-madeira-montessori` description) foi **extraordinariamente útil**:
- Identificou 5 HIGH risks com referências legais brasileiras específicas
- Sugeriu 7 revisões textuais concretas
- Listou 6 disclaimers regulatórios obrigatórios (INMETRO, ANVISA, CONAR, ECA)
- Apontou gaps na política da marca (sem critério para uso de terminologia clínica)

Isto é o tipo de output que pode ir direto para o jurídico da Incluo como brief. Validou a tese de que LLM tier-2 com schema bem desenhado entrega valor operacional real.

## Impacto

- **N21 validado**: pipeline LLM real end-to-end funciona com multi-tenant routing.
- **Custo real**: $0.174 para 4 agentes (vs estimativa $0.30). Operacionalmente sustentável.
- **3 bugs descobertos + 2 corrigidos** (max_tokens, merchant-compliance schema). 1 deferido (design-ux schema).
- **6 novos artifacts reais** em `vault/incluo-tenant/stores/incluo/` para a operação Incluo (4 outputs + 4 captures).
- Confirma decisão arquitetural: zod schemas precisam ser permissivos por default — schema apertado é falso conforto que vira validation:failed em produção.

## Ações geradas

- [ ] Aprofundar fix do design-ux schema (próxima sessão; precisa rodar com `--no-validate` mode ou logar JSON rejeitado para diagnóstico).
- [ ] **Operação Incluo (humano):** ler o `compliance review` e decidir revisar a copy de PDP (5 HIGH risks legais reais).
- [ ] **Operação Incluo (humano):** consultar o `marketing plan` Q3 2026 — Claude sugeriu 7 iniciativas; validar se alinha com prioridades reais.
- [ ] Memory + brain-bridge path consolidation: `vault/<tenant>/` → `vault/tenants/<tenant>/` (breaking; agendar sub-fase).
- [ ] Considerar adicionar `--no-capture` flag para retry barato quando schema falha.

## Referências

- LLM client: [`06_packages/llm/src/anthropic-client.ts:42`](../../../../06_packages/llm/src/anthropic-client.ts#L42)
- Schemas relaxados: [`03_agents/merchant-compliance/src/index.ts:11-30`](../../../../03_agents/merchant-compliance/src/index.ts#L11-L30), [`03_agents/design-ux-localization/src/index.ts:11-38`](../../../../03_agents/design-ux-localization/src/index.ts#L11-L38)
- Outputs reais: `vault/incluo-tenant/stores/incluo/{marketing,creative,offers,compliance}/` (gitignored em prod, presentes localmente)
- Captures: `vault/tenants/incluo-tenant/stores/incluo/run-summaries/` (4 entries)
- Run IDs: `5c613116`, `94fdce8f`, `0ac159db`, `b289cc81` (marketing/creative/offer/compliance — sucessos); `ce934215`, `dbc73264`, `af030c50` (design:ux retries falhados).
