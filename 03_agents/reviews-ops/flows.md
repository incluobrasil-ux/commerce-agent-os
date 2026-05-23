# Flows — reviews-ops

Três fluxos centrais: **ingest**, **synthesize**, **draft_responses**. Cada um pode rodar isolado ou encadeado.

## Fluxo 1 — ingest

**Trigger:** webhook do provedor de reviews (quando suportado) ou job de polling no `review-service`.

```
[1] provider adapter recebe payload bruto
[2] adapter normaliza → tipo Review do nosso domínio (05_integrations/review-apps/types)
[3] enqueue em fila ingest do review-service
[4] worker:
    │   redact_pii (scrub de nome/email do reviewer se necessário)
    │   memory_write em 07_memory/<tenant>/working/reviews/<provider>/<review_id>.md
    │       (frontmatter: rating, sentiment placeholder, verified, locale)
    │   audit_log
```

**Garantias:**
- Idempotência por `(provider, external_id)` — reingestão não duplica.
- Cross-tenant impossível: provider config carrega `tenant_id`.

## Fluxo 2 — synthesize (VoC)

**Trigger:** job semanal ou manual via admin-app.

```
[1] receber scope (sku | collection | store) + window
[2] memory_iter por reviews no escopo + janela
[3] skills_voc:
    │   ├── extrair temas (clusters de tópico)
    │   ├── prevalência (% de reviews mencionando cada tema)
    │   ├── sentimento por tema (pos/neg/neutro/misto)
    │   └── citações exemplares (com link para review original)
[4] claim_classifier:
    │   ├── identificar claims sensíveis (saúde, segurança, regulação)
    │   └── populate claims_flagged[]
[5] memory_write: voc/<scope>/<timestamp>.md (consolidado)
[6] retornar voc + claims_flagged
```

**Saída usada por:** `product-offer` (posicionamento), `design-ux-localization` (FAQ, badges), `marketing-director` (mensagem central).

## Fluxo 3 — draft_responses

**Trigger:** novos reviews chegam (Fluxo 1) — alguns precisam de resposta (rating ≤ 3 ou flagged).

```
[1] selecionar reviews que requerem resposta (regra de política do tenant)
[2] para cada review:
    │   memory_read: brand voice + respostas anteriores aprovadas
    │   llm_compose: rascunho empático, factual, não-comprometedor
    │   tone tag: "empathetic" | "informative" | "apologetic"
[3] retornar response_drafts[]
[4] handoff → governance-risk-qa
    │   reviews com claim sensível: rota especial
    │   resposta não pode admitir culpa legal sem aprovação humana
[5] approve → publicar via adapter (Fluxo 4)
    revise → loop com instruções
    block → escalar para humano via admin-app
```

## Fluxo 4 — publish (interno, não exposto no contract.yaml)

Acionado por orchestrator quando uma resposta foi aprovada.

```
[1] adapter.respondToReview(review_id, response_text)
[2] audit_log
[3] memory_write atualiza working/reviews/<provider>/<review_id>.md (response: posted_at)
```

## Desvios e erros

| Situação | Ação |
|---|---|
| Provider indisponível (Fluxo 1) | retry com backoff; após N tentativas → DLQ + alerta |
| Janela sem reviews (Fluxo 2) | erro `NoReviewsInWindow`; saída vazia |
| Claim regulado detectado (Fluxo 3) | sempre rota humana — nunca auto-aprovar |
| Provider muda schema | `ReviewsProviderUnavailable` ou erro de validação no adapter; congela ingest sem afetar synthesize sobre dados antigos |

## Inputs/Outputs canônicos

- Schemas em `contract.yaml`.
- Fixtures em `tests/fixtures/sample-input.json` e `sample-output.json`.

## Dependências de upstream

| Upstream | Como ajuda |
|---|---|
| nenhum direto | n/a — provedor de reviews é a definir (Shopify native, Judge.me, Yotpo, Loox, Stamped, Okendo) |

Decisão de provedor é externa ao monorepo (depende do que cada lojista usa).
