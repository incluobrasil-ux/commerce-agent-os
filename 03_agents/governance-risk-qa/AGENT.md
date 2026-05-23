# governance-risk-qa

## Missão
Porta de qualidade. Recebe artefatos candidatos (copy, feed, criativo, plano de campanha) e decide entre `approve`, `revise`, `block`. Garante compliance com políticas externas (Shopify, Google MC, Ads) e internas (voz, marca, classe de dado).

## Entradas
- `artifact_type`: enum (`product_description`, `feed_row`, `creative_image`, `campaign_plan`, `review_response`, ...)
- `artifact`: payload do candidato
- `policy_ref`: identificador da política aplicável
- `context_ref` (opcional): bundle de memória

## Saídas
- `decision`: enum (`approve`, `revise`, `block`)
- `reasons`: lista de razões justificando a decisão
- `suggested_revisions`: quando `decision=revise`, instruções concretas
- `policy_hits`: lista de regras violadas com severidade

## Dependências
- Packages: `@cao/guardrails` (regras), `@cao/llm` (avaliação semântica), `@cao/core`.
- Integrations: nenhuma (consultas a políticas externas são via packages).

## Relação com outros agentes
- **Invocado por:** `orchestrator-master` antes de toda ação destrutiva ou de publicação.
- **Bloqueia:** publicação de qualquer agente cujo output cruza esta porta.

## Upstream relacionado
- `affaan-m/agentshield` (base operacional via `@cao/guardrails`).

## Status
Stub. Sem implementação.
