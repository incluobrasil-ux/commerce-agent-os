# Setup local

Guia mínimo para clonar e rodar este repo em outro PC. ≤ 5 min do clone ao primeiro `audit:repo` real.

## Pré-requisitos

| Ferramenta | Versão mínima | Verificar |
|---|---|---|
| Node.js | 20 | `node --version` |
| pnpm | 9 | `pnpm --version` (ou `corepack enable && corepack prepare pnpm@9 --activate`) |
| Git | qualquer recente | `git --version` |

Plataformas testadas: **Windows 11** (PowerShell), **macOS**, **Linux**.

## Passo a passo

```bash
# 1. Clonar
git clone https://github.com/incluobrasil-ux/commerce-agent-os.git
cd commerce-agent-os

# 2. Instalar deps (24+ workspaces)
pnpm install

# 3. Configurar variáveis (opcional para o smoke; obrigatório para LLM)
cp .env.example .env.local
# editar .env.local — preencher só o que for usar

# 4. Validar
pnpm typecheck     # tsc -b — zero erros
pnpm lint          # biome — sem warnings
pnpm test:smoke    # 5 testes (build + repo-auditor)

# 5. Rodar primeiro agente real (determinístico, sem LLM)
pnpm audit:repo .
# → relatório em 12_reports/audits/repo-auditor/<repo>-<timestamp>.md
```

## O que esperar

- **Após passo 4:** typecheck/lint/smoke todos verdes. **Esse é o critério mínimo** de ambiente saudável.
- **Após passo 5:** arquivo markdown gerado em `12_reports/audits/repo-auditor/`. Exit code 0 (sem findings críticos no próprio projeto).

## Variáveis de ambiente

`repo-auditor` **não exige** nenhuma chave para rodar. É determinístico.

Variáveis listadas em [`.env.example`](../../.env.example) só ficam necessárias quando:

| Variável | Necessária para |
|---|---|
| `ANTHROPIC_API_KEY` | invocar qualquer agente via `@cao/runtime` (futuro — quando integrarmos LLM no fluxo) |
| `SHOPIFY_API_KEY` / `SHOPIFY_API_SECRET` | Fase 8 (Shopify connect) |
| `GOOGLE_OAUTH_*` | Fase 9 (merchant feed) |
| `POSTHOG_API_KEY` | Fase 10 (analytics) |
| `HIGGSFIELD_API_KEY` | Fase 11 (creative ops) |

Nunca commitar `.env.local`. O `.gitignore` cobre `.env*`.

## Problemas comuns

| Sintoma | Causa provável | Fix |
|---|---|---|
| `pnpm: command not found` | pnpm não instalado | `npm install -g pnpm@9` ou `corepack enable && corepack prepare pnpm@9 --activate` |
| `node: bad option` | Node < 20 | atualizar para Node 20+ (use `nvm` / `volta` / `fnm`) |
| `pnpm install` falha em fetch | rede / proxy corporativo | configurar proxy: `pnpm config set https-proxy ...` |
| Typecheck reclama de `@cao/<pkg>` | esqueceu `pnpm install` após clone | `pnpm install` |
| `audit:repo` reclama "Repo not found" | path inválido | usar caminho absoluto ou `.` (raiz do repo) |
| Path com espaços/acentos quebra na CLI | shell escapando errado | passar entre aspas: `pnpm audit:repo "C:/path com espaço"` |

## Próximo passo

Depois do setup verde:

1. Ler [`07_memory/vault/projects/commerce-agent-os/project-home.md`](../../07_memory/vault/projects/commerce-agent-os/project-home.md) — entrada do cérebro operacional.
2. Ler [`07_memory/vault/projects/commerce-agent-os/current-state.md`](../../07_memory/vault/projects/commerce-agent-os/current-state.md) — estado atual.
3. Ler [`07_memory/vault/projects/commerce-agent-os/next-actions.md`](../../07_memory/vault/projects/commerce-agent-os/next-actions.md) — o que puxar.
4. Antes de puxar item: [`07_memory/vault/projects/commerce-agent-os/sync-protocol.md`](../../07_memory/vault/projects/commerce-agent-os/sync-protocol.md).

Lista completa de comandos: [`COMMANDS.md`](./COMMANDS.md).
