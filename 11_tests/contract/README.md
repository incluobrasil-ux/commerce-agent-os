# 11_tests/contract

Testes que verificam que **contratos publicados não quebram** — schemas de input/output de agentes, formato de eventos, payload de adapters, schemas runtime.

## Por que existir como camada separada

- **Unitários** testam unidades (funções/classes).
- **Integration** testam cross-package real.
- **Contract** testa **forma** — que o que um produtor emite continua compatível com o que um consumidor espera.

Contract test é o "freio" entre `@cao/shared-types` / `contract.yaml` de agente / `events-taxonomy.yaml` de PostHog e os consumidores reais.

## O que cobrir

- **Agentes:** cada agente em `03_agents/<name>/contract.yaml` tem ao menos 1 contract test que valida fixture `tests/fixtures/sample-output.json` contra o schema declarado.
- **Eventos PostHog:** todo evento emitido em código real bate com entry em `05_integrations/posthog/events-taxonomy.yaml`.
- **Adapters:** retorno dos clients (`05_integrations/<x>/client/`) é parseável pelos schemas em `05_integrations/<x>/types/`.
- **Schemas compartilhados:** todo schema em `@cao/shared-schemas` parseia os tipos em `@cao/shared-types`.

## Stack

- vitest (a confirmar em ADR; default da Fase 5).
- zod para schemas runtime (a confirmar).
- Fixtures vivem **junto do produtor** (`<agent>/tests/fixtures/`); contract test importa.

## Convenções

- Nome do arquivo: `<scope>.contract.test.ts`.
- **Zero rede.** Tudo determinístico.
- Tempo alvo: total < 5min em CI.
- Falha de contract test **bloqueia merge**.

## Testes previstos (não implementados)

| Arquivo | O que valida |
|---|---|
| `agents.contract.test.ts` | Para cada agente, sample-output.json valida contra `contract.yaml#output` |
| `events.contract.test.ts` | Todo evento listado em código bate com `events-taxonomy.yaml` |
| `shopify-types.contract.test.ts` | Payload Shopify GraphQL parser bate com tipos em `05_integrations/shopify/types/` |
| `gmc-types.contract.test.ts` | Idem para GMC |
| `reviews-types.contract.test.ts` | Idem para review providers (cada provider stub testa normalize) |
| `shared-schemas.contract.test.ts` | Schemas em `@cao/shared-schemas` aceitam tipos em `@cao/shared-types` |

## Status

Stub. Implementação na Fase 5 (após `pnpm install` + vitest disponível).
