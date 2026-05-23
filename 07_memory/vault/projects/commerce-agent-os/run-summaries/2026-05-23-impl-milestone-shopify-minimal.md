---
created_at: 2026-05-23T23:15:00Z
updated_at: 2026-05-23T23:15:00Z
tags: [impl-milestone, sub-fase-2-6, shopify, oauth, admin-graphql]
source: human:incluobrasil
kind: impl-milestone
result: green
confidence: 1.0
related:
  - 05_integrations/shopify/client/admin-graphql.ts
  - 05_integrations/shopify/oauth/index.ts
  - 04_apps/shopify-admin-app/scripts/list-products.ts
---

# Sub-fase 2.6 — caminho mínimo Shopify (Admin GraphQL + OAuth helpers)

## Contexto

Primeiro valor visível pra stakeholder: integração Shopify funcional. Critério "menor caminho até demo" definiu o escopo:
- **Não** subir Remix app embedded.
- **Não** depender de OAuth handshake (precisa tunnel HTTPS + Partners app).
- **Sim** cliente Admin GraphQL real consumível por CLI; **token de Custom App** como caminho mínimo de auth para dev store.
- **Sim** OAuth helpers prontos como funções puras — pra Remix integration futura sem reescrever.

## O que aconteceu

**Novos:**
- [`05_integrations/shopify/client/admin-graphql.ts`](../../../../../05_integrations/shopify/client/admin-graphql.ts):
  - `AdminGraphQLClient` (HTTP POST contra `https://<shop>/admin/api/2025-01/graphql.json`).
  - Header `X-Shopify-Access-Token` + body GraphQL padrão.
  - Erros normalizados: 401/403 → `ShopifyAuthError`; 429 → `ShopifyRateLimitError` (com `retryAfterMs`); GraphQL errors → `ShopifyGraphQLError`.
  - `listProducts(client, { first })` — query mínima retornando `id/handle/title/status/updatedAt`; clamp 1–250.
- [`05_integrations/shopify/oauth/index.ts`](../../../../../05_integrations/shopify/oauth/index.ts):
  - `buildAuthorizeUrl()` — monta URL de OAuth (offline/online).
  - `exchangeCodeForToken()` — troca code por access token persistente.
  - `isValidShopDomain()` — valida `<slug>.myshopify.com` (anti-redirect malicioso).
- [`04_apps/shopify-admin-app/scripts/list-products.ts`](../../../../../04_apps/shopify-admin-app/scripts/list-products.ts):
  - CLI que lê `SHOPIFY_SHOP` + `SHOPIFY_ADMIN_TOKEN` do env.
  - Sem credenciais → SKIPPED exit 0 com instruções de Custom App no topo.
  - Com credenciais → lista produtos + tempo + hasNextPage.
  - Falha de auth → mensagem específica apontando scopes/token.
- 15 testes novos (8 admin-graphql + 7 oauth). Suíte 81 → **96 verdes**.

**Alterações:**
- `05_integrations/shopify/index.ts` (barrel) re-exporta admin-graphql + oauth.
- `05_integrations/shopify/package.json`: subpath export `./oauth`.
- `05_integrations/shopify/tsconfig.json`: include `oauth/**/*.ts`.
- `04_apps/shopify-admin-app/package.json`: deps + `@cao/integration-shopify` (workspace).
- Root `package.json`: `pnpm shopify:list-products`.
- `.env.example`: seção Shopify documenta CAMINHO 1 (Custom App, atual) e CAMINHO 2 (OAuth Partners, futuro).

**Smoke real executado:**
```
$ pnpm shopify:list-products
[shopify:list-products] SKIPPED — SHOPIFY_SHOP ou SHOPIFY_ADMIN_TOKEN ausentes em .env.local.
[shopify:list-products] Veja instruções no topo de 04_apps/shopify-admin-app/scripts/list-products.ts.
[shopify:list-products] Nada quebrou; baseline continua válido.
```
Exit 0 — comportamento exato esperado.

## Achados / decisões

- **Custom App token >> OAuth full para dev store.** Setup do operador: ~3 min (criar dev store + app + copiar token). OAuth real requer: domínio público HTTPS (tunnel cloudflared/ngrok) + Remix server rodando + handler de callback + state validation + hmac validation. Para a meta "demo mostrável", custom app entrega 99% do valor com 1% do esforço.
- **OAuth helpers são funções puras, não rotinas de servidor.** `buildAuthorizeUrl()` retorna string; `exchangeCodeForToken()` aceita `fetchImpl` injetável. Quando Remix entrar (Fase 2.6+ produção), são chamados dos route handlers. Nada de framework lock-in.
- **API version pinada em 2025-01 (current stable).** Mudança virou constante exportada (`ADMIN_API_VERSION`) — facilita ver em PR review futuro quando bumpar.
- **CLI vive em `04_apps/shopify-admin-app/scripts/`** (não em `05_integrations/`). Convenção: integração = bibliotecas reusáveis; app = onde scripts/CLIs específicos do app moram. `04_apps/shopify-admin-app/package.json` agora declara dep workspace, simétrico aos agentes.
- **Não tocado:** `app/root.tsx`, `app/shopify.server.ts`, `app/db.server.ts`, prisma. Continuam scaffolds. Quando virar Remix real, esses arquivos materializam — fora do escopo desta sub-fase.
- **Webhooks fora de escopo** (regra explícita do usuário). Apenas leitura.

## Impacto

- **Sub-fase 2.6 caminho mínimo concluído.** Restam: credenciais reais (B6) + materialização Remix (futuro).
- Total de comandos `pnpm` executáveis para invocar agentes/serviços: **6** (`audit:repo`, `synthesize:audit`, `curate:memory`, `context:brief`, `llm:smoke`, `shopify:list-products`).
- Demo mostrável a stakeholder fica a 1 ação manual de distância (criar custom app).
- Padrão CLI-skip-elegante consolidado: 2 comandos agora detectam credencial ausente e fazem SKIPPED exit 0 (não derrubam baseline) — `pnpm llm:smoke` + `pnpm shopify:list-products`. Bom padrão para próximos.
- **Não introduz dep externa pesada** — só `fetch` nativo (Node 20+ tem). Zero dep adicionada a `node_modules`.

## Ações geradas

- [ ] **N15** — usuário cria dev store + custom app + atualiza `.env.local` → roda `pnpm shopify:list-products` → primeira demo real.
- [ ] Quando rodar real, criar run-summary tipo `agent-run` ou `impl-milestone` registrando o output.
- [ ] Quando Sub-fase 2.6 evoluir para OAuth real (Remix integration): materializar `app/shopify.server.ts` usando os helpers em `05_integrations/shopify/oauth/`.
- [ ] Adicionar webhooks (Sub-fase 2.6.x): `app/uninstalled` + GDPR (`shop/redact`, `customers/redact`). Fora deste milestone.

## Referências

- código: [`05_integrations/shopify/client/admin-graphql.ts`](../../../../../05_integrations/shopify/client/admin-graphql.ts), [`oauth/index.ts`](../../../../../05_integrations/shopify/oauth/index.ts), [`04_apps/shopify-admin-app/scripts/list-products.ts`](../../../../../04_apps/shopify-admin-app/scripts/list-products.ts)
- testes: 8 + 7 (admin-graphql + oauth) — fetch mockado, zero rede
- comando: `pnpm shopify:list-products [--first=N]`
- `.env` template: `.env.example` seção Shopify
