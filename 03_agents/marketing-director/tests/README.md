# Tests — marketing-director

Casos mínimos a cobrir:

- Sum(budget por iniciativa) == budget_usd total.
- Toda iniciativa tem `kpi.target` e `kpi.unit`.
- Objetivos conflitantes (ex.: maximizar volume e margem) geram `risks` com trade-off explicado.
- Budget insuficiente para cobrir objetivos prio≤2 → erro `BudgetUnderfunded`.
- `creative_brief` é compatível com input de `creative-copy-assets`.
