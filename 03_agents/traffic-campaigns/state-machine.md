# State machine — traffic-campaigns

Ciclo de vida por campanha (não pelo agente — o agente é stateless; o estado vive no provedor + cache em `@cao/memory`).

```
   ┌─────────┐
   │  draft  │  criada localmente (mode=dry_run ou pré-launch)
   └────┬────┘
        │ launch
        ▼
   ┌─────────┐  pause      ┌──────────┐
   │  active │◀───────────▶│  paused  │
   └────┬────┘             └────┬─────┘
        │ ended (kpi ou tempo)  │
        ▼                       ▼
   ┌─────────┐               ┌─────────┐
   │  ended  │               │  ended  │
   └─────────┘               └─────────┘

   * em qualquer transição com erro do provider:
   ┌─────────┐
   │  error  │  isolar e alertar; não cascatear para outras campanhas
   └─────────┘
```

## Invariantes
- Toda transição registra audit_log com evidência.
- `dry_run` nunca produz estado externo no provedor — só `draft` local.
- Recomendações nunca aplicam autonomamente em `mode != tune`.
