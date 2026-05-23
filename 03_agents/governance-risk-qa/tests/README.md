# Tests — governance-risk-qa

Casos mínimos a cobrir:

- Artefato compliant → `approve` sem hits.
- Artefato com violação soft → `revise` + `suggested_revisions` não vazias.
- Artefato com violação hard → `block` + pelo menos um hit com `severity: hard`.
- `policy_ref` inexistente → erro `PolicyNotFound`.
- `artifact` malformado → erro `ArtifactMalformed`.
- Determinístico antes de LLM: regras determinísticas (regex, schema) ganham precedência sobre llm_judge.
