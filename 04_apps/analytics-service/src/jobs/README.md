# src/jobs/

Jobs agendados. Cada um invoca um pipeline + persiste o resultado.

## Jobs

| Arquivo | Cron | Fluxo |
|---|---|---|
| `funnel-daily.ts` | `0 7 * * *` | analytics-optimization Fluxo 1 com baseline anterior |
| `campaign-performance-weekly.ts` | `0 8 * * 1` | Fluxo 2 |
| `feed-change-impact.ts` | sob demanda (event-driven) | Fluxo 3 |
| `cross-signal-weekly.ts` | `0 9 * * 1` | Fluxo 4 |
| `cost-vs-outcome-daily.ts` | `0 6 * * *` | resumo de custo agentes vs valor downstream |

## Convenções

- Cada job é **idempotente** — rodar 2× na mesma janela é ok.
- Cada job loga start/end + métricas em `@cao/observability`.
- Staggering por hash do `tenant_id` para evitar pico simultâneo.
- Job lê de PostHog; **nunca** escreve.

## Status

Stub.
