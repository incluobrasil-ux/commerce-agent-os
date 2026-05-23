# Tests — product-offer

Casos mínimos a cobrir:

- Margin infeasible dentro do price_band → erro `MarginInfeasible`.
- Estoque zerado → erro `StockUnavailable`.
- `bundle` só populado quando scope.kind=collection.
- `justification` cita ≥2 fontes do context_ref.
- Preço sempre dentro do price_band.
