# google-marketing-solutions/feedgen

- **Objetivo:** ferramenta para otimizar/gerar feeds de produto (títulos, descrições, atributos) usando LLM, exportando de volta para Merchant Center / Sheets.
- **Por que foi selecionado:** resolve diretamente o problema "qualidade de feed" — central no eixo Merchant Feed/SEO do projeto.
- **Papel no projeto:** base operacional do agente de feed em `03_agents/feed-optimizer` + lógica em `05_integrations/google-merchant`.
- **Categoria no monorepo:** `01_upstreams/feedgen` (read-only) + adaptação autoral.
- **Modo de uso:** base operacional (portar/adaptar lógica chave; não fork inteiro).
- **Risco / limitação:** projeto principalmente em Python e centrado em Sheets/Apps Script — port para TS exige refactor; manter compat com schema do Merchant Center.
- **Prioridade:** alta.
- **Status local:** não clonado.
- **Notas a verificar:** runtime exato; quais prompts/heurísticas valem extrair; dependência de Sheets.
