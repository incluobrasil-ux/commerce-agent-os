# Tests — merchant-compliance

Casos mínimos a cobrir:

- `mode=audit` → `remediations[i].applied=false` sempre.
- Política desconhecida → erro `PolicyUnknown`.
- GTIN inválido → finding severidade `hard`.
- Falta de atributo obrigatório (ex.: `gender` em apparel) → finding `hard`.
- `compliance_summary.overall_pass_rate` consistente com count(findings hard).
- Regras region-specific só disparam quando policy correspondente está incluída.
