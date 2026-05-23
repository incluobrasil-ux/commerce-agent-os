# basicmachines-co/basic-memory

- **Objetivo:** sistema de memória persistente baseado em arquivos markdown locais.
- **Por que foi selecionado:** alinha com a estratégia de `07_memory/` (markdown como verdade); reduz dependência de bancos vetoriais externos em fases iniciais.
- **Papel no projeto:** base operacional do subsistema de memória.
- **Categoria no monorepo:** `01_upstreams/basic-memory` (read-only) + adaptação/consumo em `06_packages/memory`.
- **Modo de uso:** base operacional.
- **Risco / limitação:** depende de filesystem local — escalar entre máquinas exige sync (git, Drive, etc.).
- **Prioridade:** alta.
- **Status local:** não clonado.
- **Notas a verificar:** API/CLI, formato dos arquivos, modelo de busca (keyword vs embedding).
