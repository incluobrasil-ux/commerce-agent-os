# langchain-ai/langgraph

- **Objetivo:** runtime de orquestração de agentes baseado em grafos com estado.
- **Por que foi selecionado:** padrão maduro para multi-agente com checkpoints, streaming e tools. Permite expressar fluxos não-triviais (loops, fan-out, condicionais) sem reinventar.
- **Papel no projeto:** núcleo de orquestração dos agentes em `03_agents/`.
- **Categoria no monorepo:** `06_packages/runtime` (wrapper autoral) + `01_upstreams/langgraph` (read-only).
- **Modo de uso:** upstream read-only para referência + base operacional via SDK oficial (não fork).
- **Risco / limitação:** surface de API ainda evolui; preferir consumir como dependência versionada em vez de fork.
- **Prioridade:** alta.
- **Status local:** não clonado.
- **Notas a verificar:** confirmar runtime alvo (TS vs Python). LangGraph tem versão JS — preferível se o resto do stack for TS.
