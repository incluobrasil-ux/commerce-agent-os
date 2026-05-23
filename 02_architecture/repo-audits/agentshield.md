# affaan-m/agentshield

- **Objetivo:** guardrails/safety layer para agentes. ⚠ verificar implementação.
- **Por que foi selecionado:** módulo de proteção (prompt injection, output validation, rate limits) é requisito real para agentes em produção e-commerce.
- **Papel no projeto:** base operacional para `06_packages/guardrails`.
- **Categoria no monorepo:** `01_upstreams/agentshield` (read-only) + adaptação em `06_packages/guardrails`.
- **Modo de uso:** base operacional.
- **Risco / limitação:** repo pessoal — pode ter cobertura parcial; comparar com NeMo Guardrails, Guardrails-AI antes de adotar.
- **Prioridade:** média.
- **Status local:** não clonado.
- **Notas a verificar:** quais ataques cobre; integra com qual SDK; licença.
