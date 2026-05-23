# Tests — reviews-ops

Casos mínimos a cobrir:

- Janela sem reviews → erro `NoReviewsInWindow`.
- `mode=synthesize` produz `voc.themes` com `citations` não vazias.
- Claim de saúde detectado → entrada em `claims_flagged` com `category=health`.
- `mode=draft_responses`: cada draft é compatível com input de `governance-risk-qa`.
- Resposta nunca contém PII do reviewer.
- Provider down → `ProviderUnreachable`; agente não silencia.
