# Tests — repo-auditor

Casos mínimos a cobrir:

- Repo com LICENSE válido → `license` populado com SPDX.
- Repo sem LICENSE → erro `NoLicenseDetected`.
- Repo com segredo hardcoded (fixture) → finding `critical`.
- Path inexistente → `RepoNotFound`.
- Profile=`license` → não chama llm_summarize (otimização).
- Output do relatório segue schema esperado em `12_reports/audits/`.
