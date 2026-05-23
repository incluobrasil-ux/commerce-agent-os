# catalog-feed-ops

## Missão
Sincronização operacional Shopify ↔ Google Merchant Center. Aplica mudanças propostas (vindas de `product-feed-seo`) com idempotência, agenda jobs, gerencia diffs e estados de feed.

## Entradas
- `tenant_id`
- `changes`: lista de mudanças aprovadas (output de `product-feed-seo` aprovado por governance)
- `mode`: enum (`dry_run`, `apply`)
- `schedule` (opcional): cron ou one-shot

## Saídas
- `applied`: lista de mudanças efetivamente aplicadas (com IDs externos)
- `skipped`: mudanças não aplicadas com motivo
- `feed_status`: status atual em GMC por SKU

## Dependências
- Packages: `@cao/runtime`, `@cao/observability`.
- Integrations: `05_integrations/shopify`, `05_integrations/google-merchant`.

## Relação com outros agentes
- **Invocado por:** `orchestrator-master`.
- **Lê de:** `product-feed-seo` (proposed_changes aprovadas).
- **Submete a:** `governance-risk-qa` (toda escrita).
- **Coopera com:** `merchant-compliance` (revalidar pós-apply).

## Upstream relacionado
- `google/merchant-api-samples` (via integration adapter).

## Status
Stub. Sem implementação.
