# Tests — creative-copy-assets

Casos mínimos a cobrir:

- `outputs_required` totalmente coberto em `assets` + `copy_variants`.
- Brand violation detectada → erro `BrandViolation` (impede entrega).
- Provedor de mídia indisponível → retry e depois `ProviderUnavailable` parcial.
- `provenance` populada para todo asset gerado (auditabilidade).
- PII em copy retornado → erro de guardrail antes da entrega.
