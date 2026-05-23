# higgsfield-ai/skills

- **Objetivo:** repositório de "skills" da Higgsfield — unidades reutilizáveis de capacidade para agentes (provavelmente alinhado ao formato Claude Skills/Anthropic Skills).
- **Por que foi selecionado:** se o formato for compatível com Skills do Claude/Anthropic, ganhamos ecossistema imediato e padronizado.
- **Papel no projeto:** upstream + base operacional. Skills selecionadas viram dependências em `06_packages/skills` e/ou são invocadas direto pelos agentes.
- **Categoria no monorepo:** `01_upstreams/higgsfield-skills` (read-only) + extratos/wrapper em `06_packages/skills`.
- **Modo de uso:** upstream read-only + base operacional (selecionar skills, não importar bloco).
- **Risco / limitação:** confirmar formato/runtime; checar licença; confirmar manutenção.
- **Prioridade:** alta.
- **Status local:** não clonado.
- **Notas a verificar:** schema das skills; relação com higgsfield-ai/cli; quais skills cobrem marketing/e-commerce.
