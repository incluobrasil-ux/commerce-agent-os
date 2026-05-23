# Flows — governance-risk-qa

Porta de qualidade. Decide `approve | revise | block` em artefatos. Não modifica o artefato — avalia e sugere.

State machine completa em [`state-machine.md`](./state-machine.md).

## Fluxo 1 — Revisão de artefato canônico

**Trigger:** `orchestrator-master` invoca antes de qualquer publicação ou ação destrutiva.

```
[1] receber artifact + artifact_type + policy_ref + context_ref opcional
    │
    ▼
[2] schema_validate: estrutura do artifact bate com schema do tipo?
    │   não → erro ArtifactMalformed (não é decisão; é erro de input)
    │
    ▼
[3] policy_load: carregar regras da policy_ref
    │
    ▼
[4] DETERMINISTIC PASS (regras hard primeiro — barato, autoritativo):
    │   - regex de palavras proibidas
    │   - char limits por canal
    │   - GTIN/atributo obrigatório (quando feed_row)
    │   - PII detection no artifact
    │   ⇒ hit hard? → decision = "block"; retornar
    │
    ▼
[5] SEMANTIC PASS (LLM apenas se necessário):
    │   - tom de marca / brand_style_ref
    │   - claims regulados subjetivos (saúde, segurança)
    │   - aderência ao positioning
    │   ⇒ hits soft? → decision = "revise" + suggested_revisions[]
    │
    ▼
[6] Se ninguém disparou → decision = "approve"
    │
    ▼
[7] policy_hits[] populado em qualquer caso
[8] audit_log via @cao/observability
[9] retornar
```

## Fluxo 2 — Batch (otimização)

**Trigger:** lote grande (ex.: 200 SKUs com feed proposto).

```
[1] paralelizar Fluxo 1 com concurrency limit
[2] artefatos com mesma policy_ref reusam policy_load
[3] retornar resultados[] preservando ordem do input
```

**Importante:** budget LLM excedido → continuar com apenas deterministic; reportar `truncated_semantic_review=true` no envelope. Decisão `approve` sob esse modo deve ser tratada com cautela pelo consumidor (e.g., `catalog-feed-ops` pode escolher dry-run em vez de apply).

## Fluxo 3 — Revisão dirigida (replay)

**Trigger:** após `revise`, agente origem (ex.: `creative-copy-assets`) regenera; vem segunda volta.

```
[1] mesmo Fluxo 1 mas marca attempt_count
[2] attempt_count > N (configurável; default 3) → decision = "block" com motivo "exhausted_revisions"
[3] previne loop infinito agent ↔ governance
```

## Tipos de artefato suportados (artifact_type)

| Tipo | Schema | Regras hard típicas | Quem revisa |
|---|---|---|---|
| `product_description` | Shopify product → fields | char limit, brand voice, claims | creative-copy-assets output |
| `feed_row` | GMC product schema | GTIN, taxonomy, attribute completeness | product-feed-seo output |
| `creative_image` | image + metadata | dimensões, peso, moderation flags do provider | creative-copy-assets output |
| `creative_video` | video + metadata | duration, peso, captions | creative-copy-assets output |
| `campaign_plan` | marketing-director plan | budget sum, KPI presence, conflict resolution | marketing-director output |
| `review_response` | resposta a review | claim de saúde/legal, PII | reviews-ops output |
| `generic` | qualquer texto | só regex + PII | fallback |

## Política de severidade

- **`severity: hard`** — bloqueante. Sempre `block`. Exemplos: PII no copy, palavra proibida regulada, GTIN inválido, brand voice violado em campos críticos.
- **`severity: soft`** — sugestivo. Vira `revise` com `suggested_revisions[]`. Exemplos: copy genérico, baixa especificidade, atributo opcional faltando.

## Invariantes

- `block` exige ≥1 hit com `severity: hard`.
- `revise` exige ≥1 `suggested_revisions[]` com instrução concreta.
- `reasons[]` sempre cita `rule_id` da policy — nunca genérico.
- Nunca modifica `artifact` — apenas avalia.
- Toda decisão persistida em audit (`07_memory/<tenant>/audit/governance/...`) + evento `governance.decided`.

## Desvios

| Situação | Ação |
|---|---|
| `policy_ref` inexistente | `PolicyNotFound` (erro, não decisão) |
| `artifact` malformado | `ArtifactMalformed` |
| Budget LLM esgotado | continuar com deterministic only; flag `truncated_semantic_review` |
| Conflito de regras (raro) | regra hard ganha sobre soft; entre hards, regra mais específica ganha |
| Loop infinito (attempt > N) | `block` com motivo `exhausted_revisions` |

## Inputs/Outputs canônicos

- Schemas em `contract.yaml`.
- Fixtures em `tests/fixtures/`.

## Dependências de upstream

| Upstream | Como ajuda |
|---|---|
| `affaan-m/agentshield` | **base operacional** — patterns de validação input/output, allow-list de ações, audit log. Lógica adaptada para `@cao/guardrails`. |
| `affaan-m/ECC` | **inspiração** — gates de publicação em fluxo de e-commerce; padrões de revisão pré-publish. |
| `garrytan/gstack` | **inspiração de práticas** — convenções de testing/CI/env (não diretamente sobre governance, mas sobre como ops dá suporte a governance). |
