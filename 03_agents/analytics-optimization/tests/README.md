# Tests — analytics-optimization

Casos mínimos a cobrir:

- Métrica inexistente em PostHog → erro `MetricNotFound`.
- Janela sem dados suficientes → erro `InsufficientData`.
- Cada experimento proposto tem `primary_metric` + `sample_size`.
- `delta_vs_baseline` requer `baseline_ref`; sem ele, campo omitido.
- Findings sempre citam métrica + janela.
- Nenhuma escrita em PostHog (agente é read-only).
