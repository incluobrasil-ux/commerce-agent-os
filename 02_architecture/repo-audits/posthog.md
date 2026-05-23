# PostHog/posthog

- **Objetivo:** plataforma open-source de product analytics (events, funnels, session replay, feature flags, experiments).
- **Por que foi selecionado:** instrumentação de produto e dos próprios agentes (uso, sucesso, custo); base para análises de funil e LLM observability.
- **Papel no projeto:** integração via SDK (não embarcar o monorepo do PostHog).
- **Categoria no monorepo:** `05_integrations/posthog` (adapter autoral, fino). NÃO clonar o repo completo do PostHog em `01_upstreams/` por padrão.
- **Modo de uso:** integração (cloud SaaS recomendado; self-host só se houver motivo).
- **Risco / limitação:** SDK web vs server-side têm convenções diferentes; PII em eventos exige governança; LLM analytics da PostHog ainda evolui.
- **Prioridade:** alta.
- **Status local:** não clonado (e não deve ser — basta o SDK como dependência).
- **Notas a verificar:** definir hostname (cloud vs self-host); convenção de naming de eventos antes de instrumentar.
