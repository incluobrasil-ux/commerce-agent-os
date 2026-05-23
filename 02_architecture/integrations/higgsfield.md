# Higgsfield

> **Detalhe completo:** [higgsfield-map.md](./higgsfield-map.md) — superfícies (skills runtime vs CLI dev/ops), fluxos, relação com `@cao/skills`, política de cherry-pick.
> Este doc é o resumo executivo.

## Escopo

Skills reutilizáveis + CLI para gerenciá-las.

## Repositórios cobertos

- `higgsfield-ai/skills` — biblioteca de skills.
- `higgsfield-ai/cli` — ferramenta de linha de comando.

## Superfície externa

- CLI Higgsfield para descobrir/instalar/executar skills.
- Formato de skill — confirmar se é compatível com Claude/Anthropic skills.

## Localização autoral

- Skills selecionadas: `06_packages/skills/` (cherry-pick).
- Wrapper de CLI/runners: `10_ops/higgsfield-cli/` (scripts).
- Agentes que consomem: `03_agents/*`.

## Risco / limitação

- Formato e runtime ainda a confirmar; dependência externa pode mudar.
- Pin de versão obrigatório para reprodutibilidade.

## Status

Pendente: clonar e inspecionar formato; mapear quais skills cobrem nossos eixos (feed, copy, reviews, research, ads).
