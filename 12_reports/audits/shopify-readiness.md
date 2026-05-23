# Shopify readiness audit

Estado da camada Shopify em 2026-05-23. O que está pronto vs. o que falta para começar a implementar (Fase 8 — Shopify connect).

## Resumo

| Área | Status |
|---|---|
| Tema (`04_apps/shopify-theme/`) | esqueleto Liquid scaffoldado (dirs + READMEs + `theme.liquid` placeholder + `shopify.theme.toml`) |
| App embedded (`04_apps/shopify-admin-app/`) | esqueleto TS scaffoldado (package.json + tsconfig + vite + shopify.app.toml + shopify.web.toml + app/ placeholders + prisma stub) |
| Adapter (`05_integrations/shopify/`) | contratos TS (client/types/errors/webhooks) + scopes.yaml + webhook-topics.yaml |
| Doc arquitetural | `02_architecture/integrations/shopify-map.md` (detalhe) + `shopify.md` (resumo) |
| Upstreams (`01_upstreams/dawn`, `shopify-app-template-react-router`) | **não clonados** |

## O que cada peça entrega hoje

### `04_apps/shopify-theme/`
- Estrutura canônica de tema Shopify (assets, config, layout, locales, sections, snippets, templates, templates/customers).
- `shopify.theme.toml`, `.shopifyignore` prontos para `shopify theme dev/push`.
- `layout/theme.liquid` mínimo válido (renderiza `{{ content_for_layout }}`).
- `config/settings_schema.json` + `settings_data.json` mínimos válidos.
- Locales en + pt-BR vazios.
- READMEs em sections/snippets/templates/assets descrevendo convenção.

### `04_apps/shopify-admin-app/`
- `package.json` (workspace member) sem deps reais ainda — deps virão na Fase 8.
- `tsconfig.json` que estende `tsconfig.base.json`.
- `vite.config.ts` placeholder.
- `shopify.app.toml` com **rascunho de scopes + webhooks GDPR obrigatórios**.
- `shopify.web.toml` para Shopify CLI.
- `.env.example` listando todas as env vars (espelhando `SECRET_NAMES` de `@cao/shared-config`).
- `app/root.tsx`, `app/shopify.server.ts`, `app/db.server.ts` — placeholders comentados com TODO.
- `app/routes/_index.tsx`, `app/routes/app.tsx` — rotas placeholder.
- `prisma/schema.prisma` placeholder com modelo `Session` comentado.

### `05_integrations/shopify/`
- **Workspace package** (`@cao/integration-shopify`) com `package.json` + `tsconfig.json` + `index.ts` barrel.
- `client/index.ts` — interface `ShopifyClient` (products, collections, orders, customers, inventory) tipada com tipos do nosso domínio.
- `types/index.ts` — branded IDs + estruturas `ShopifyProduct`, `ShopifyVariant`, etc. Money preserva precisão como string.
- `errors/index.ts` — 7 classes de erro com code estável e nome.
- `webhooks/index.ts` — `WebhookHandler` contract + `WebhookRegistry`.
- `scopes.yaml` — 7 scopes solicitados + justificativa por consumidor + lista explícita do que **não** pedimos.
- `webhook-topics.yaml` — 9 topics com handler, motivo, marcação `mandatory: true` (GDPR + app/uninstalled) e `opt_in: true` (orders).

### `02_architecture/integrations/`
- `shopify-map.md` — detalhe completo (surfaces, scopes, webhooks, OAuth, fluxo, multi-tenant, errors, API version policy).
- `shopify.md` — resumo executivo apontando para o map.

## Como serão usadas as referências upstream

| Upstream | Função | Quando clonar |
|---|---|---|
| `Shopify/shopify-app-template-react-router` | template oficial; estrutura de `app/root.tsx`, `app/shopify.server.ts`, `app/db.server.ts`, `vite.config.ts`, `prisma/schema.prisma` reais | Fase 6 (ingestão de upstreams) — antes de Fase 8 |
| `Shopify/dawn` | tema oficial de referência; padrões de section/snippet/accessibility/i18n | Fase 6 — antes de qualquer customização real do tema |

Estratégia de uso (recordando ADR-0002):
- **`01_upstreams/` é read-only.** Nunca editar.
- Cópias seletivas (root.tsx, shopify.server.ts, db.server.ts, schema.prisma) **uma vez** para `04_apps/shopify-admin-app/`, com header anotando origem (URL + SHA + licença).
- Tema: zero cópia; só reler padrões.

## Pré-requisitos externos (não controlados pelo monorepo)

| Item | Necessário para | Como obter |
|---|---|---|
| Conta Shopify Partners | criar app dev | https://partners.shopify.com |
| Loja Shopify de desenvolvimento | testes locais + OAuth real | criar pelo Partners dashboard |
| Shopify CLI instalado (`shopify`) | `shopify theme dev`, `shopify app dev` | `pnpm add -g @shopify/cli` ou via brew |
| Túnel HTTPS público | dev local do app embedded | Shopify CLI usa cloudflared por padrão (sem account); ngrok como alternativa |
| `cloudflared` (opcional explícito) | tunnel estável | https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/ |
| API credentials (key + secret + scopes) | OAuth | após criar app no Partners — vão para `.env` |

Nenhum desses está configurado. Itens marcados em `ROADMAP.md` Fase 8.

## Riscos identificados

| Risco | Mitigação |
|---|---|
| Template oficial muda estrutura significativamente | Pinar SHA do template ao clonar; updates viram PRs manuais |
| API version vira deprecated mid-projeto | Versão pinada em `@cao/shared-config`; upgrade é checklist consciente |
| Scope `write_products` pode aprovar mudança errada | Toda escrita passa por `governance-risk-qa`; `catalog-feed-ops` é o **único** agente com permissão de chamar |
| Webhook handler lento bloqueia HTTP | Adapter responde 200 imediato; handler enfileira; worker processa |
| GDPR webhook handler incompleto reprovará revisão Shopify | Implementar `shop/redact`, `customers/redact`, `customers/data_request` é **mandatório** antes de publicar app |
| Túnel cloudflared expira em dev | Aceitar — re-rodar `shopify app dev`; em CI usar mock |
| Polaris muda versão major | Pin de versão; UI tests visuais em milestone, não contínuos |
| `Session` em SQLite não escala multi-host | Migrar para Postgres antes de publicar em produção (ADR a escrever) |

## Decisões em aberto (bloqueiam Fase 8 parcialmente)

- [ ] Confirmar `api_version` (`2025-01` é o rascunho).
- [ ] Confirmar scopes (rascunho em `scopes.yaml`).
- [ ] Decidir DB de produção (SQLite vs Postgres).
- [ ] Decidir uso de Tailwind no tema ou seguir CSS sem framework.
- [ ] Decidir se publicaremos no Shopify App Store (afeta requisitos GDPR e theme app extensions) ou se será app privado/custom apenas.
- [ ] Estratégia de provisionamento de tenant pós-OAuth (auto-clonar `07_memory/vault/_template/`).

## Checklist "pronto para Fase 8"

- [ ] Conta Shopify Partners criada.
- [ ] Loja de desenvolvimento criada.
- [ ] `01_upstreams/shopify-app-template-react-router/` clonado (Fase 6).
- [ ] `01_upstreams/dawn/` clonado (Fase 6).
- [ ] `@cao/runtime` mínimo implementado (Fase 7).
- [ ] `@cao/shopify-client` com helpers de paginação básicos.
- [ ] `pnpm install` no workspace verde com deps de `@shopify/*` adicionadas.
- [ ] `.env` populado em local de dev.
- [ ] Decisões da seção anterior resolvidas (ou conscientemente deferidas).

## Próximo passo recomendado

1. Antes de Fase 8: rodar Fase 5 (bootstrap funcional — `pnpm install` + typecheck verde) e Fase 6 (clonar upstreams chave).
2. Depois disso: Fase 8 implementa OAuth + leitura de produtos como primeira fatia vertical.
