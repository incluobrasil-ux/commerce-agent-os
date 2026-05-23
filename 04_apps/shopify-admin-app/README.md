# shopify-admin-app

App embedded no admin Shopify. Ponto de entrada principal para lojistas operarem os agentes.

## Stack

- **React Router v7** (framework do template oficial Shopify atual).
- **Polaris** (componentes UI Shopify) + **App Bridge** (auth + UX em iframe).
- **TypeScript**.
- **Prisma + SQLite** em dev (padrão do template; produção pode trocar — ADR a escrever).
- **Vite** como bundler.

## Relação com o template (upstream)

Este app **não é um fork** de [Shopify/shopify-app-template-react-router](https://github.com/Shopify/shopify-app-template-react-router). Estratégia:

1. Quando `01_upstreams/shopify-app-template-react-router/` for clonado:
   - Comparar com nossa estrutura abaixo.
   - **Copiar arquivos essenciais uma vez** (root.tsx, shopify.server.ts, db.server.ts) — anotando origem no header.
   - A partir daí evoluir como código autoral. Sem rebase contra o template.
2. Updates do template viram PRs manuais comparando diffs — não merge automático.

## Estrutura

```
shopify-admin-app/
├─ app/
│  ├─ root.tsx                  layout raiz React Router + Polaris AppProvider + App Bridge
│  ├─ routes/                   rotas React Router (cada arquivo = uma rota)
│  ├─ lib/                      helpers internos (auth wrappers, agent invocation, etc.)
│  ├─ shopify.server.ts         init do Shopify App SDK (sessões, auth, webhooks)
│  └─ db.server.ts              Prisma client
├─ prisma/
│  └─ schema.prisma             Session storage (e mais quando necessário)
├─ public/                      estáticos servidos diretamente
├─ extensions/                  Shopify app extensions (theme blocks, admin actions, etc.)
├─ shopify.app.toml             metadados do app + scopes + URLs
├─ shopify.web.toml             config do "web" component para Shopify CLI
├─ .env.example                 exemplo de variáveis (sem segredos)
├─ vite.config.ts
├─ tsconfig.json
└─ package.json
```

## Como rodar (quando configurado)

```
cd 04_apps/shopify-admin-app
pnpm install
pnpm dev              # Shopify CLI inicia túnel + servidor
```

Requer:
- Shopify Partners account + dev store.
- Variáveis em `.env` (ver `.env.example`).
- Túnel: Shopify CLI usa cloudflared por padrão.

## Conexão com o resto do monorepo

| Consome | Para quê |
|---|---|
| `05_integrations/shopify` | acesso a Admin GraphQL + sessão |
| `05_integrations/posthog` | telemetria de uso |
| `@cao/runtime` | invocar `orchestrator-master` |
| `@cao/observability` | tracing + capture |
| `@cao/shared-types`, `@cao/shared-schemas` | tipos/validação no boundary |
| `@cao/shared-config` | nomes de env vars |
| `@cao/shopify-client` | helpers de paginação/cache GraphQL |

## Não fazer aqui

- Lógica de domínio profunda — apenas orquestrar e exibir.
- Acesso direto a banco de dados de outros serviços — sempre via API/integration.
- Inferência LLM no app — delegar para `creative-ops-service`, `feed-service`, etc.

## Status

Esqueleto criado. Arquivos `app/*.tsx` são placeholders comentados. Sem `pnpm install` executado.

## Pendências

- Clonar `01_upstreams/shopify-app-template-react-router` (Fase 6).
- Decidir scopes finais (rascunho em `shopify.app.toml`).
- Decidir DB de produção (continuar SQLite vs Postgres).
- Configurar Shopify Partners + dev store.
