# Security overview

Modelo de segurança macro do commerce-agent-os. Documento vivo — atualizar conforme decisões.

## Superfícies de risco

1. **Credenciais externas** — Shopify, Google, BrightData, PostHog, Higgsfield, LLM providers.
2. **Dados de loja** — produtos, pedidos, clientes (PII), inventário.
3. **Conteúdo gerado por agente** — copy, criativos, descrições publicadas; risco de output incorreto/incompatível com políticas das plataformas.
4. **Código upstream** — `01_upstreams/` é código de terceiros; nunca executar cego.
5. **Memória dos agentes** — `07_memory/` pode conter trechos sensíveis se mal classificado.

## Identidade e autenticação

| Provedor | Mecanismo | Onde vive |
|---|---|---|
| Shopify | OAuth2 offline + session token (App Bridge) | `05_integrations/shopify` |
| Google (Merchant/Ads) | OAuth2 (service account ou user) | `05_integrations/google-merchant` |
| BrightData | API key | env var |
| PostHog | Project key (client) + personal API key (server) | env var |
| Higgsfield | a confirmar | env var |
| LLM providers | API key | env var |

Regras:
- Nunca commitar `.env`.
- Nunca logar token completo (mascarar últimos 4 chars).
- Rotação periódica documentada por provedor.
- Em produção: secret manager (a definir — AWS SM, Doppler, etc.).

## Classificação de dados

| Classe | Exemplo | Tratamento |
|---|---|---|
| Público | catálogo já publicado | sem restrição |
| Interno | descrições em rascunho, prompts | apenas no monorepo |
| Confidencial | chaves API, credenciais | nunca em repo; secret manager |
| PII | nome/email de cliente, endereço, pedidos | nunca enviar a LLM sem necessidade; scrub em logs e em PostHog |

`08_data/` aceita apenas classes Público e Interno. Confidencial e PII nunca entram em `08_data/`.

## Agentes — guardrails

`06_packages/guardrails` (derivado de `agentshield`) cobre:
- **Input validation** — sanitização de prompts de usuário, anti-injection.
- **Output validation** — schema check (zod/JSON schema), filtros de conteúdo.
- **Rate limits** — por agente, por tenant.
- **Action allow-list** — toda ação que altera estado externo (publicar produto, criar campanha) passa por uma política explícita.
- **Audit log** — toda chamada de tool por agente é registrada em `07_memory/audit/`.

Política de ações destrutivas:
- Ações reversíveis (criar rascunho) podem ser autônomas.
- Ações irreversíveis ou de alto impacto (publicar feed, enviar email em massa, criar campanha paga) **exigem confirmação humana**.

## Isolamento por tenant

Modelo presumido: multi-tenant na camada de app (cada loja Shopify = um tenant). Regras:
- Credenciais por tenant nunca cruzam (chave Shopify de loja A nunca acessa loja B).
- `07_memory/` é particionado por tenant: `07_memory/<tenant-id>/...`.
- Logs e eventos PostHog carregam `tenant_id`.

## Webhooks e endpoints

- Verificação HMAC obrigatória em webhooks Shopify.
- Deduplicação por `X-Shopify-Webhook-Id`.
- Endpoints públicos com rate limit (ex.: 100 req/min por IP).
- HTTPS obrigatório em produção; túneis dev (cloudflared) só local.

## Política de upstreams (resumo)

- Nunca executar código de `01_upstreams/` em produção sem revisão.
- Dependências reais via `package.json` com versão pinada — não via cópia manual de código upstream.
- Auditar `01_upstreams/` para padrões de risco (segredos hardcoded, execução de código arbitrário).

Detalhes em `../adr/ADR-0002-upstream-policy.md`.

## Decisões em aberto

- Escolher secret manager.
- Definir política de retenção de logs e de `07_memory/`.
- Definir se PostHog é cloud (EU/US) ou self-host (afeta LGPD/GDPR).
- Definir SAST/DAST no CI.
