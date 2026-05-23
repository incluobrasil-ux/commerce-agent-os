# market-intelligence

## Missão
Entende mercado/categoria/tendências macro relevantes para o tenant. Responde "o que está acontecendo no segmento X neste momento" combinando dados externos (Bright Data, SERPs) com sinais internos (PostHog).

## Entradas
- `tenant_id`
- `scope`: categoria/segmento/região
- `horizon`: período de análise (ex.: últimos 30/90 dias)
- `signals` (opcional): sinais internos a considerar

## Saídas
- `report.markdown`: análise narrativa
- `signals_outbound`: sinais estruturados consumíveis por outros agentes (ex.: "alta busca por X em região Y")
- `confidence`: 0..1

## Dependências
- Packages: `@cao/llm`, `@cao/memory`.
- Integrations: `05_integrations/brightdata`, `05_integrations/posthog`.

## Relação com outros agentes
- **Invocado por:** `orchestrator-master`, `marketing-director`.
- **Alimenta:** `competitor-benchmark`, `product-offer`, `marketing-director`.

## Upstream relacionado
- `brightdata/competitive-intelligence` (dependência via adapter).

## Status
Stub. Sem implementação.
