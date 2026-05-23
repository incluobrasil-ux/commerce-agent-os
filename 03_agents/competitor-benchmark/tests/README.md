# Tests — competitor-benchmark

Casos mínimos a cobrir:

- Primeira execução (sem `since`) → `deltas` vazio; `snapshot` populado.
- Execução com `since` → deltas calculados corretamente.
- Competitor inacessível → erro `CompetitorUnreachable` apenas para esse; outros completam.
- Dimensão `price` muda > limiar de política → alert `critical`.
- ToS bloqueado para um competitor → erro `LegalBlocked` e snapshot omite.
