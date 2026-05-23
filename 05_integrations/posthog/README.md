# posthog

Adapter autoral fino sobre `posthog-js` (web) e `posthog-node` (server). Centraliza **taxonomia** + **convenções de uso** + **PII scrub**. **Não** clonamos o monorepo do PostHog.

> Detalhe completo em [`02_architecture/integrations/posthog-map.md`](../../02_architecture/integrations/posthog-map.md).

## Por que existir como adapter

Embora os SDKs sejam diretos, queremos:
- **Injetar `tenant_id`** automaticamente em todo evento (cross-tenant é invariante).
- **Validar nomes de evento e propriedades** contra `events-taxonomy.yaml` e `properties-taxonomy.yaml` em dev/staging.
- **Aplicar PII scrub** via `@cao/guardrails` antes de `capture`.
- **Wrapping de HogQL** com query templates de `analytics-service/src/queries/`.
- **Cost tracking** unificado por chamada.

## Superfície

- `capture(event, properties)` — eventos.
- `identify(distinctId, properties)` — usuários (com restrições de PII).
- `feature_flags.get(key)` — leitura apenas.
- `query.hogQL(template, vars)` — wrapper sobre Personal API Key.
- `llm_observability` — quando GA (a confirmar status).

## Estrutura

```
posthog/
├─ client/         init server/web + tenant tagging + scrub
├─ types/          Event, Identity, FlagPayload, HogQLResult
├─ errors/         PostHogConfigError, PostHogQueryError, PostHogTaxonomyError
├─ events-taxonomy.yaml      ← canônico (toda mudança é PR consciente)
├─ properties-taxonomy.yaml  ← canônico
├─ index.ts
├─ package.json
└─ tsconfig.json
```

## Auth

- `POSTHOG_PROJECT_API_KEY` (write, server + web).
- `POSTHOG_PERSONAL_API_KEY` (HogQL queries — só server).
- `POSTHOG_HOST` — `https://us.i.posthog.com` ou self-host.
- `POSTHOG_PROJECT_ID`.

## Onde PostHog entra

- **Captura** de eventos onsite + agente + campanha + criativo + review + compliance.
- **Leitura** de eventos via HogQL para `analytics-optimization`.
- **Feature flags** (leitura) para A/B em tema/admin-app.

## Onde PostHog NÃO entra

- **Não substitui** `07_memory/` — memória é markdown, audit logs são primariamente lá; PostHog é telemetria/agregado.
- **Não substitui** `@cao/runtime` audit trail — agente persiste audit em memory; PostHog recebe um evento agregado.
- **Não recebe PII** (email, telefone, endereço) — listadas em `properties-taxonomy.yaml/forbidden`.
- **Não cria experimentos** automaticamente. `analytics-optimization` propõe; humano cria no PostHog.
- **Não armazena** dados sensíveis de pagamento, ordens com itens completos, ou anything coberto por LGPD/GDPR sem decisão consciente.

## Consumido por

- **Todos os apps** em `04_apps/` (escrita).
- **Agentes** indiretamente via `@cao/observability` (escrita); `analytics-optimization` direto (leitura HogQL).

## Convenções

- Naming de eventos: `<surface>.<verb>` snake_case. Lista canônica em `events-taxonomy.yaml`.
- Naming de properties: snake_case. Lista canônica em `properties-taxonomy.yaml`.
- Toda chamada inclui `tenant_id` (injetado pelo adapter — consumidor não precisa lembrar).
- PII scrub aplicado antes de enviar.
- Eventos novos exigem entrada nas taxonomias (PR consciente).

## Upstream

- `PostHog/posthog` (referência apenas — código consumido via SDK npm). Audit em `02_architecture/repo-audits/posthog.md`.

## Status

Stub. Contratos TS + taxonomias completas. Sem implementação.
