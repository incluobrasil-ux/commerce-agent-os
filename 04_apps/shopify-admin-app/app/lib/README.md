# app/lib/

Helpers internos do app (server-side por padrão). Coisas que **não** são rotas e que **não** caberiam em `06_packages/` por serem específicas deste app.

## Arquivos previstos

- `auth.server.ts` — wrappers de `shopify.authenticate.*` com normalização do `session.shop` em `TenantId`.
- `agent-invoke.server.ts` — atalho para chamar `@cao/runtime` com contexto do tenant atual.
- `tenant.server.ts` — helpers de provisionamento (clonar `07_memory/vault/_template/` em `<tenant>/`).
- `polaris-toast.tsx` — wrapper de toast com nossa convenção de cor/severidade.

## Não fazer aqui

- Lógica que serve mais de um app — vai para `06_packages/` ou `05_integrations/`.
