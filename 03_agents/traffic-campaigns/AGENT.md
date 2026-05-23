# traffic-campaigns

## Missão
Orquestra campanhas pagas (Google Ads, Meta Ads, etc.). Recebe planos de mídia do `marketing-director`, materializa em campanhas reais via integração, monitora performance e aciona ajustes.

## Entradas
- `tenant_id`
- `media_plan`: subset do output de `marketing-director` (iniciativas com `channel=ads`)
- `mode`: enum (`dry_run`, `launch`, `pause`, `tune`)
- `policy`: caps de orçamento diário, limites de CPA

## Saídas
- `campaigns`: lista de campanhas criadas/atualizadas (id externo, status)
- `pacing_report`: gasto vs orçamento por iniciativa
- `recommendations`: ajustes propostos (sem aplicar em `dry_run`)

## Dependências
- Packages: `@cao/runtime`, `@cao/guardrails`.
- Integrations: `05_integrations/google-ads` (postergado), futuramente outras.

## Relação com outros agentes
- **Invocado por:** `marketing-director`, `orchestrator-master`.
- **Coopera com:** `analytics-optimization` (sinais de performance).
- **Submete a:** `governance-risk-qa` (orçamento, brand safety).

## Upstream relacionado
- `google-marketing-solutions/adios` (inspiração para criativo).

## Status
Stub. Postergado — depende de Google Ads e/ou outros adapters em `05_integrations/`.
