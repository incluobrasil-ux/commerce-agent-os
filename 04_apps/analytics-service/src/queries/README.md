# src/queries/

HogQL queries canônicos. **Single source of truth** — qualquer consumidor importa daqui em vez de inline.

## Convenção de arquivo

```
queries/
├─ funnel-standard.v1.hql           query versionada
├─ funnel-standard.v1.test.json     fixture de eventos + resultado esperado (futuro)
├─ campaign-attribution.v1.hql
├─ agent-cost-vs-outcome.v1.hql
└─ voc-vs-cr.v1.hql
```

## Convenções de HogQL

- Sempre `WHERE tenant_id = {tenant}` — multi-tenant é obrigatório.
- Sempre janela explícita (`AND timestamp >= {from} AND timestamp < {to}`).
- Sem `SELECT *` — listar colunas para detectar quebras de schema.
- Funções pesadas (`aggregate_funnel_*`) com TIMEOUT explícito.
- Comentário no topo: o que retorna, quem consome.

## Queries planejadas

| Arquivo | Retorna | Consumidor |
|---|---|---|
| `funnel-standard.v1.hql` | step conversion rates por etapa | `analytics-optimization` Fluxo 1 |
| `campaign-attribution.v1.hql` | events agrupados por `initiative_id` via utm_campaign | Fluxo 2 |
| `agent-cost-vs-outcome.v1.hql` | agent_invoked → value events em janela 7d | cost-vs-outcome job |
| `voc-vs-cr.v1.hql` | join VoC themes (custom event) × conversion rate | Fluxo 4 |
| `feed-pre-post.v1.hql` | impressions/CR antes/depois de timestamp para SKUs | Fluxo 3 |

## Status

Stub. Queries reais virão na Fase 10 com fixtures de eventos.
