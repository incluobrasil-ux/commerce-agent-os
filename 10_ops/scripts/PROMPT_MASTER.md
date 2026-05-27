# prompt-master — ferramenta auxiliar de operador

**O que é:** Claude skill (markdown puro, sem código) que ajuda a escrever prompts otimizados para LLMs antes de jogá-los em qualquer agente. Repo: <https://github.com/nidhinjs/prompt-master> · licença MIT · v1.6.0.

**Papel no `commerce-agent-os`:** **ferramenta auxiliar do operador**, não dependência do core. NÃO é invocado por nenhum agente, NÃO está em `package.json`, NÃO afeta `pnpm doctor` / lint / test. Cada operador decide se quer usá-lo.

## Quando usar

- Refinar o `--objective="..."` antes de `pnpm chief` quando o pedido está vago.
- Melhorar prompts antes de rodar `marketing:plan`, `creative:assets`, `merchant:compliance`, etc.
- Gerar prompts para outras ferramentas (Midjourney, Cursor, etc.) usadas pelo time.

**Quando NÃO usar:** rotinas determinísticas (`audit:repo`, `merchant:audit --source=fixture`, `feed:dry-run`) — não há prompt LLM envolvido.

## Instalação (cada operador, uma vez)

User-level (não vai pro repo, reversível, individual):

```bash
mkdir -p ~/.claude/skills
git clone https://github.com/nidhinjs/prompt-master.git ~/.claude/skills/prompt-master
```

Pronto. Claude Code reconhece o skill automaticamente. Atualizar depois: `git -C ~/.claude/skills/prompt-master pull`.

**Não instale** dentro deste repo. Não adicione ao `package.json`. Skill é descoberta pelo Claude Code via `~/.claude/skills/`.

## Como usar (dentro do Claude Code)

Peça em linguagem natural — o skill ativa apenas quando você **explicitamente** pede para escrever/melhorar prompt:

```
"escreve um prompt para o Claude rodar um audit de catálogo Shopify"
"melhora esse prompt para o marketing:plan"
"adapta esse prompt para Midjourney"
```

Não ativa em chat geral, escrita de código ou perguntas comuns.

## Limites e riscos

- **Não é parte do `pnpm chief`** — Chefe não consulta nem depende dele.
- **Não substitui** os agentes do projeto (`marketing-director`, `creative-copy-assets`, etc.). Ele produz **prompts**, eles produzem **decisões/artefatos**.
- **Não tem memória entre sessões** — cada uso é independente.
- **Sem riscos legais** — markdown só. Mas o prompt gerado pode pedir conteúdo sensível: aplique o mesmo gate de compliance que você aplicaria a qualquer entrada de agente LLM.

## Desinstalação

```bash
rm -rf ~/.claude/skills/prompt-master
```

## Distribuição alternativa para o time (não recomendada por default)

Se a equipe decidir distribuir via repo (todos os operadores recebem por default), copiar para `.claude/skills/prompt-master/` na raiz do projeto. **Não fazer hoje** — instalação user-level já cobre o caso de uso. Distribuir via repo significa versionar 50KB de docs externos cuja única dependência é "quem usa Claude Code". Considerar só se todos do time forem usar e quiserem versão pinada.
