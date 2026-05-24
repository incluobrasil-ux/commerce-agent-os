# Setup local

Guia mínimo para clonar e rodar este repo em outro PC. ≤ 5 min do clone ao primeiro `audit:repo` real.

> **TL;DR:** `git clone && cd && pnpm install && pnpm doctor` — se tudo verde, está pronto.

## Pré-requisitos

| Ferramenta | Versão mínima | Verificar | Instalar |
|---|---|---|---|
| Node.js | 20 | `node --version` | nvm / volta / fnm |
| pnpm | 9 | `pnpm --version` | `npm i -g pnpm@9` ou `corepack enable` |
| Git | qualquer recente | `git --version` | |
| gitleaks | 8+ | `gitleaks version` | Windows: `winget install gitleaks` · macOS: `brew install gitleaks` · Linux: `scoop install gitleaks` ou binário oficial |

Plataformas testadas: **Windows 11** (PowerShell), **macOS**, **Linux**.

**Atenção Windows + winget:** o binário fica em `%LOCALAPPDATA%\Microsoft\WinGet\Links\`. Esse path já entra no PATH automaticamente, mas só em **terminais abertos depois da instalação** — reabra o terminal/IDE se `gitleaks version` não funcionar logo após `winget install`.

## Passo a passo (mínimo)

```bash
# 1. Clonar + instalar
git clone https://github.com/incluobrasil-ux/commerce-agent-os.git
cd commerce-agent-os
pnpm install

# 2. Verificação única — checa node, pnpm, git, node_modules, typecheck,
#    lint, smoke, .env.local, gitleaks, cérebro
pnpm doctor

# Se tudo verde: pronto. Primeiro agente real (zero credencial):
pnpm audit:repo .
```

## Passo a passo (completo, se quiser ir até LLM real)

```bash
# 3. Ativar git hooks (pre-commit: lint + smoke + secret-scan; commit-msg: commitlint)
npx simple-git-hooks

# 4. Configurar variáveis (só pra LLM/Shopify/Merchant)
cp .env.example .env.local
# editar .env.local — preencher só o que for usar

# 5. (Opcional) Clonar upstreams (langgraph, shopify-app-template, etc.)
bash 10_ops/scripts/clone-upstreams.sh

# 6. Smoke LLM (precisa ANTHROPIC_API_KEY)
pnpm llm:smoke
# → SKIPPED limpo sem key; OK + custo com key.

# 7. Pipeline Merchant dry-run (fixture, sem credencial)
pnpm feed:dry-run
# → 12_reports/merchant-dry-runs/<tenant>-<timestamp>.{md,json}
```

## O que `pnpm doctor` checa

| Check | Pré-req | Status esperado |
|---|---|---|
| `node` ≥ 20 | OS | 🟢 |
| `pnpm` ≥ 9 | OS | 🟢 |
| `git` | OS | 🟢 |
| `node_modules` | `pnpm install` | 🟢 |
| `typecheck` | install | 🟢 |
| `lint` | install | 🟢 |
| `test:smoke` | install | 🟢 |
| `.env.local` | manual | 🟢 ou 🟡 (opcional p/ baseline) |
| `gitleaks` | OS install | 🟢 ou 🟡 (opcional p/ baseline) |
| Cérebro presente | git clone | 🟢 |

Tudo 🟢: pronto pra qualquer comando. Algum 🔴: bloqueio real, mensagem dá o fix.

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
