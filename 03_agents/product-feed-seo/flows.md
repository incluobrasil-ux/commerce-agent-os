# Flows — product-feed-seo

Fluxos operacionais concretos. Cada um descreve o caminho feliz e desvios principais. Não é spec exata — é o "como pensar" do agente.

## Fluxo 1 — Otimizar lote de SKUs (entrada padrão)

**Trigger:** `orchestrator-master` recebe intent `optimize_feed_batch` (manual ou agendado).

**Entrada:** lista de `sku_ids` (10–500), `targets=[google_mc, seo_pdp]`, `policy`.

```
[1] receber input → validar contra contract.yaml
    │
    ▼
[2] memory-context bundle: contexto da marca, voz, ICP, fatos estáveis em facts/
    │
    ▼
[3] para cada SKU:
    │   shopify_product_read    → dados atuais (title, description, attrs)
    │   gmc_report_read         → disapprovals/warnings atuais no Merchant Center
    │   skills_feed_optimization → variantes propostas (lógica adaptada de feedgen)
    │   llm_compose             → polimento + adaptação por target/locale
    │   policy_enforce          → char limits + forbidden words
    │
    ▼
[4] consolidar proposed_changes com diff explícito (from → to)
    │
    ▼
[5] anexar signals_used (cada mudança cita motivo: trend, gmc_disapproval, competitor)
    │
    ▼
[6] retornar para orchestrator (modo proposta — não publica)
```

**Saída:** consumida por `governance-risk-qa` → se `approve`, segue para `catalog-feed-ops`.

## Fluxo 2 — Correção dirigida por disapproval (reativo)

**Trigger:** webhook ou polling de `merchant-compliance` detecta SKUs com `gmc_state=disapproved`.

```
[1] orchestrator invoca product-feed-seo com scope=disapproved_skus
[2] gmc_report_read → motivos exatos da disapproval por SKU
[3] cherry-pick de skills_feed_optimization (apenas campos afetados)
[4] policy_enforce + diff
[5] retorna para orchestrator → governance-risk-qa → catalog-feed-ops (canal "remediation")
```

**Por que separado do Fluxo 1:** prioridade alta (SKU está fora de circulação no GMC); escopo cirúrgico (não mexer no que está OK); justificativa do diff aponta para `disapproval_reason_code` específico.

## Fluxo 3 — Localização para novo mercado

**Trigger:** lojista habilita um locale novo (ex.: `pt-BR`) no admin-app.

```
[1] orchestrator chama product-feed-seo com targets=[google_mc:pt-BR, seo_pdp:pt-BR]
[2] memory-context: além do contexto de marca, pega exemplos de copy aprovados no locale principal
[3] llm_compose com instrução de localização (tom regional, unidades, claims regulados por região)
[4] policy_enforce com policy específica do locale (palavras proibidas variam)
[5] diff multi-locale: from=en-US to=pt-BR
```

**Cuidado:** cada locale tem seu próprio `expected_lift` (não dá para extrapolar do principal).

## Desvios e erros

| Situação | Ação |
|---|---|
| SKU inexistente | erro `SkuNotFound`; demais SKUs continuam |
| Char limit estourado mesmo após regenerar | tentar 2 retries com instrução de encurtar; falha → marcar `truncated` no item |
| Forbidden word só detectada após geração | regenerar com word adicionada ao prompt-block; se persistir → `PolicyViolation` |
| `gmc_report_read` indisponível | seguir sem o sinal; logar warning; `signals_used` carrega `gmc_report_unavailable` |
| Budget LLM excedido | parar; retornar parcial com `truncated=true` no envelope |

## Inputs canônicos esperados

- Schema em `contract.yaml`.
- Fixture mínimo em `tests/fixtures/sample-input.json`.

## Outputs canônicos

- Schema em `contract.yaml`.
- Fixture mínimo em `tests/fixtures/sample-output.json`.

## Dependências de upstream

| Upstream | Como ajuda |
|---|---|
| `google-marketing-solutions/feedgen` | heurísticas e prompts de otimização de feed (base operacional via `@cao/skills`); decidir port TS vs sidecar Python |
| `google/merchant-api-samples` | referência para `gmc_report_read` |
