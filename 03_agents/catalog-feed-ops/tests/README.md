# Tests — catalog-feed-ops

Casos mínimos a cobrir:

- `mode=dry_run` → applied vazio; skipped popula com motivo `dry_run`.
- Mudança sem `approved_by` → erro `ChangesUnapproved` antes de chamar provider.
- Idempotência: reaplicar a mesma mudança não duplica chamada.
- Falha em SKU A não bloqueia SKU B (atomicidade por SKU).
- `feed_status` reflete estado real consultado pós-apply.
- Toda escrita gera audit_log com `external_ids`.
