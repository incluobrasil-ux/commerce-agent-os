# src/jobs/

Jobs agendados. Cron interno (ou via worker queue periódico).

## Jobs

| Arquivo | Cron | O que faz |
|---|---|---|
| `drift-sync.ts` | `0 * * * *` (a cada hora) | invoca `catalog-feed-ops` Fluxo 2 por tenant ativo |
| `compliance-sweep.ts` | `0 6 * * 1` (segunda 06:00) | invoca `merchant-compliance` Fluxo 3 em todo catálogo |
| `disapproval-monitor.ts` | `*/30 * * * *` | varre `productstatuses` e dispara remediation |
| `feed-pacing-report.ts` | `0 7 * * *` (diário 07:00) | invoca `analytics-optimization` com surface=`feed` |

## Convenções

- Jobs nunca rodam todos para todos os tenants ao mesmo tempo — staggering por hash do tenant.
- Cada job loga início/fim e métricas em `@cao/observability`.
- Job é idempotente: rodar 2× na mesma janela é ok.

## Status

Stub.
