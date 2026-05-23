# Tests — traffic-campaigns

Casos mínimos a cobrir:

- `mode=dry_run` nunca chama provider destrutivamente.
- Daily cap excedido em pacing → recomendar `pause` (não aplicar autonomamente).
- `creative_ref` ausente → erro `CreativeMissing` antes de chamar provider.
- Auth falha → `ProviderAuthFailure` sem deixar campanhas em estado inconsistente.
- Toda transição de status registra audit_log.
