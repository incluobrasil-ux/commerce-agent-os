# Tests — orchestrator-master

Casos mínimos a cobrir (não implementados):

- **intent conhecida → plan.status=ok** com nodes esperados.
- **intent ambígua → plan.status=needs_clarification** com pergunta populada.
- **policy.allow_destructive=false** bloqueia agentes que requerem ação destrutiva.
- **budget exceeded mid-run** interrompe e retorna `BudgetExceeded` com `audit_trail` parcial.
- **sub-agent failure** propaga com `SubAgentFailure` mas mantém audit.
- **dois sub-agentes do mesmo tier** com recurso concorrente são serializados.

Fixtures vão para `tests/fixtures/`. Teste de comportamento, não de LLM.
