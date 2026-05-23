# higgsfield-ai/cli

- **Objetivo:** CLI da Higgsfield para descobrir, instalar e executar skills.
- **Por que foi selecionado:** ferramenta padrão para gerenciar o ecossistema de skills; evita reinventar gestão de pacotes de skills.
- **Papel no projeto:** base operacional em `10_ops/higgsfield-cli` como ferramenta de dev/ops (não como dependência runtime de agentes).
- **Categoria no monorepo:** `01_upstreams/higgsfield-cli` (read-only) + wrapper/scripts em `10_ops/`.
- **Modo de uso:** base operacional (consumir a CLI como ferramenta externa; não fork).
- **Risco / limitação:** dependência operacional — se a CLI mudar, scripts quebram; mitigar com pin de versão.
- **Prioridade:** alta (acompanha higgsfield-skills).
- **Status local:** não clonado.
- **Notas a verificar:** método de instalação (npm/pipx/binário); subcomandos chave; autenticação eventual.
