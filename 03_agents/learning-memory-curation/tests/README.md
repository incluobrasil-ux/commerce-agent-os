# Tests — learning-memory-curation

Casos mínimos a cobrir:

- `mode=dry_run` → nenhuma escrita; apenas `actions` propostas.
- Duas entradas semanticamente equivalentes acima de `dedup_threshold` → ação `merge`.
- Entrada acima de `max_age_days` sem reforço → ação `demote` ou `delete`.
- Fato com ≥2 ocorrências distintas → ação `promote`.
- `mode=apply` em índice locked → erro `IndexLocked`.
- Multi-tenant: nunca tocar memória de outro tenant.
