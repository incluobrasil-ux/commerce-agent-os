# PostHog

> **Detalhe completo:** [posthog-map.md](./posthog-map.md) — surfaces, funil canônico, taxonomia, sinais de otimização, attribution UTM, política de PII, cloud vs self-host.
> Este doc é o resumo executivo.

## Escopo

Product analytics + LLM observability dos agentes e dos apps.

## Repositórios cobertos

- `PostHog/posthog` — **não clonar** o monorepo; consumir via SDK.

## Superfície externa

- **posthog-js** (web), **posthog-node** (server-side), **posthog-python** se Python entrar no stack.
- Recursos: capture, identify, feature flags, experiments, LLM analytics.

## Localização autoral

- Adapter: `05_integrations/posthog/` — client + **taxonomia canônica** (events + properties YAML) + scrub.
- Wrapper de instrumentação: `06_packages/observability/` — API única para apps capturar.
- Serviço: `04_apps/analytics-service/` — jobs + HogQL queries + invocação de agente.
- Agente: `03_agents/analytics-optimization/` — findings + experimentos propostos.

## Risco / limitação

- PII em eventos — convenção de scrub obrigatória.
- Cloud vs self-host — decidir cedo (custo vs controle).
- LLM analytics é feature recente; verificar cobertura para o caso multi-agente.

## Status

Pendente: decidir cloud vs self-host; definir taxonomia de eventos antes de instrumentar.
