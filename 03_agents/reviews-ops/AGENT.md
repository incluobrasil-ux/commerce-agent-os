# reviews-ops

## Missão
Ingestão, síntese e resposta a reviews. Produz "voz do cliente" estruturada (temas, sentimentos, claims) e gera rascunhos de resposta a reviews individuais.

## Entradas
- `tenant_id`
- `scope`: por SKU/coleção/loja inteira
- `mode`: enum (`ingest`, `synthesize`, `draft_responses`)
- `window`: período

## Saídas
- `voc`: voz do cliente (temas, prevalência, sentimento, citações)
- `claims_flagged`: claims problemáticos detectados (saúde, segurança, regulação)
- `response_drafts`: rascunhos por review (em `mode=draft_responses`)

## Dependências
- Packages: `@cao/llm`, `@cao/memory`, `@cao/guardrails`.
- Integrations: `05_integrations/shopify` (reviews nativas) e/ou provedor externo (a definir: Judge.me/Yotpo/Loox).

## Relação com outros agentes
- **Invocado por:** `orchestrator-master`.
- **Alimenta:** `product-offer`, `design-ux-localization` (claims, FAQs), `marketing-director`.
- **Submete a:** `governance-risk-qa` antes de publicar resposta.

## Upstream relacionado
- nenhum direto; provedor de reviews a definir.

## Status
Stub. Pendente decisão de provedor de reviews.
