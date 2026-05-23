# State machine — catalog-feed-ops

Estado **por SKU** dentro de uma execução (o agente é stateless; o estado vive no provider + cache).

```
   ┌────────────┐
   │  approved  │  mudança chegou com approved_by
   └─────┬──────┘
         │ mode=apply
         ▼
   ┌────────────┐  rejected     ┌──────────┐
   │  writing   │──────────────▶│  failed  │
   └─────┬──────┘               └──────────┘
         │ ok
         ▼
   ┌────────────┐                ┌────────────┐
   │  written   │  GMC check ───▶│   pending  │ (GMC processando)
   └────────────┘                └─────┬──────┘
                                       │
                          ┌────────────┴────────────┐
                          ▼                         ▼
                   ┌────────────┐            ┌──────────────┐
                   │  approved  │            │ disapproved  │  ──► invoca merchant-compliance
                   └────────────┘            └──────────────┘
```

## Invariantes
- Transição `writing → written` exige idempotency key registrada.
- `disapproved` aciona `merchant-compliance` automaticamente.
- Falha em um SKU não move o estado dos demais.
