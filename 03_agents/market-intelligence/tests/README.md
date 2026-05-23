# Tests — market-intelligence

Casos mínimos a cobrir:

- Scope vazio → erro `InsufficientData`.
- `signals_outbound` sempre acompanhado de `evidence` não vazia.
- Budget Bright Data esgotado mid-run → `BudgetExceeded` + relatório parcial.
- Confidence < 0.5 lista quais dados faltam.
- Multi-tenant: dados de tenant A não vazam para tenant B.
