# src/workers/

Workers consumindo fila interna.

## Workers

| Worker | Fila | Função |
|---|---|---|
| `generate-asset` | `creative.generate` | invoca pipeline brief→generate→validate→store para 1 variante |
| `store-asset` | `creative.store` | upload para object storage + index em DB |
| `refresh-aggregate` | cron diário | estatísticas de uso (asset views por canal) |

## Convenções

- Concurrency baixa (default 2-4) — chamadas a image/video providers são caras.
- Retry: 2× para transient (timeout, 5xx); terminal → DLQ + notificação humana.
- Cost tracking em `@cao/observability` por asset.

## Status

Stub.
