# analytics-optimization

## Missão
Consome PostHog + dados internos para identificar oportunidades de otimização e sugerir experimentos. Não roda experimentos sozinho — propõe e mede.

## Entradas
- `tenant_id`
- `surface`: o que analisar (`funnel`, `pdp`, `feed`, `campaign`, `voc`)
- `window`
- `baseline_ref` (opcional): comparar contra baseline anterior

## Saídas
- `findings`: oportunidades identificadas (com impacto estimado)
- `experiments_proposed`: hipóteses testáveis (variante, métrica primária, tamanho de amostra)
- `summary.markdown`

## Dependências
- Packages: `@cao/llm`, `@cao/memory`.
- Integrations: `05_integrations/posthog`.

## Relação com outros agentes
- **Invocado por:** `orchestrator-master`, `marketing-director`.
- **Alimenta:** `marketing-director`, `product-feed-seo` (sinais), `design-ux-localization`.

## Upstream relacionado
- `PostHog/posthog` (SDK).
- `google-marketing-solutions/feedx` (inspiração metodológica de experimentação).

## Status
Stub. Sem implementação.
