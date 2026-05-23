# src/pipelines/

Pipelines determinísticos brief → generate → validate → store → index.

## Pipeline `creative-brief`

```
[input: brief + outputs_required[] + brand_style_ref]
    │
    ▼
[step: load-brand-style]     lê 07_memory/<tenant>/facts/brand-style.md
[step: per-variant generate] usa providers conforme variant.format
[step: brand-validate]       @cao/guardrails
[step: tech-validate]        dimensões, formato, peso (per channel)
[step: moderation-check]     policy do provider
[step: store-and-index]      upload + DB
    │
    ▼
[output: assets[] + provenance[] + step_status[]]
```

## Convenções

- Cada step com timeout próprio.
- Pipeline **stateless**.
- step_status[] sempre populado para diagnose.

## Status

Stub.
