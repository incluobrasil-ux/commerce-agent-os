# State machine — orchestrator-master

```
        ┌──────────────┐
        │   received   │  intent + policy
        └──────┬───────┘
               ▼
        ┌──────────────┐
        │   planning   │  decompõe intent
        └──┬─────────┬─┘
           │         │ intent ambígua
           │         ▼
           │   ┌────────────────────┐
           │   │ needs_clarification│──► fim
           │   └────────────────────┘
           ▼
        ┌──────────────┐
        │  executing   │  invoca sub-agentes
        └──┬───────┬───┘
           │       │ falha não recuperável
           │       ▼
           │   ┌──────────┐
           │   │ blocked  │──► fim
           │   └──────────┘
           ▼
        ┌──────────────┐
        │ consolidating│  monta result + audit_trail
        └──────┬───────┘
               ▼
        ┌──────────────┐
        │   completed  │
        └──────────────┘
```

## Transições

| de | para | gatilho |
|---|---|---|
| received | planning | input válido |
| planning | needs_clarification | intent ambígua |
| planning | executing | plan resolvido |
| executing | blocked | falha de sub-agente irreversível ou budget exceeded |
| executing | consolidating | todos os nós terminaram |
| consolidating | completed | audit_trail finalizado |

## Invariantes
- Nunca executar ação destrutiva sem passar por `governance-risk-qa`.
- `audit_trail` é append-only e persistido mesmo em estados `blocked`/`needs_clarification`.
