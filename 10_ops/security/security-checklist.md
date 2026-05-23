# Security checklist

Checklist operacional. **Curto e executável.** Cada item ou é verificável por script, ou é decisão consciente registrada.

## Como usar

- **Pre-PR (dev local):** itens marcados `[L]` — automatizar quando possível.
- **CI (cada push):** itens `[C]` — não merge sem verde.
- **Pre-release v1:** todos os itens.
- **Periódico (mensal):** itens marcados `[M]`.

## Secrets

- `[L]` Nada de `.env` em commit.
- `[L][C]` `secretScan` (gitleaks ou equivalente) no diff retorna zero achados.
- `[C]` Toda env var é declarada em `@cao/shared-config` `SECRET_NAMES`.
- `[C]` Logs mascaram secrets (mostrar só últimos 4 chars).
- `[ ]` Secret manager em uso em prod (a definir — AWS SM / Doppler / outro). v1 milestone.

## PII

- `[L][C]` `properties-taxonomy.yaml/forbidden` é fonte da verdade.
- `[C]` `@cao/guardrails` rejeita propriedades em forbidden list (PostHogPiiError).
- `[C]` Tests com fixtures NÃO contêm PII real (nomes/emails de pessoas reais).
- `[ ]` `redactPII` aplicado em `07_memory/<tenant>/working/reviews/` quando aplicável.
- `[ ]` Endpoint GDPR `customers/redact` (Shopify) apaga dados do tenant.

## Upstreams

- `[L]` Nunca editar arquivo em `01_upstreams/<repo>/`.
- `[L][C]` Adaptações de código upstream têm header de origem (URL + SHA + license + adaptations).
- `[C]` `pnpm audit` retorna zero high/critical CVEs (ou justificativa em PR).
- `[M]` Review periódica em `00_meta/REPO_SELECTION.md` — upstreams sem manutenção?
- `[ ]` SAST (Semgrep candidato) em deps upstream — futuro.

## Dependências

- `[L][C]` Lock file (`pnpm-lock.yaml`) commitado.
- `[L][C]` Versões pinadas (nada de `^` em deps críticas — runtime, adapters).
- `[M]` Update bot (Dependabot/Renovate) com auto-merge para patch + manual para minor/major.

## Auth e tokens

- `[C]` Shopify OAuth: scopes mínimos (lista em `05_integrations/shopify/scopes.yaml`).
- `[C]` Webhook HMAC verify obrigatório (Shopify, providers de review).
- `[C]` Dedup de webhook por `X-Shopify-Webhook-Id` (Shopify) / equivalente.
- `[ ]` Token storage por tenant em secret manager (não em DB de aplicação).
- `[ ]` Rotação de tokens documentada por provider (mensal manual; automação futura).

## Agentes

- `[C]` Todo agente declara `tools.yaml` — nada de tool ad-hoc.
- `[C]` Toda chamada de tool passa por `@cao/guardrails` (enforced pelo runtime).
- `[C]` Toda ação destrutiva tem `governance-risk-qa.decision = approve` no audit.
- `[C]` Toda execução LLM tem `cost_usd` no audit.
- `[ ]` Budget guard runtime (`policy.max_cost_usd`) implementado. Fase 7.

## Multi-tenant

- `[C]` `tenant_id` obrigatório em todo path de memória, toda query, todo evento.
- `[C]` `@cao/memory` rejeita acesso cross-tenant.
- `[C]` HogQL sempre carrega `WHERE tenant_id = {tenant}`.
- `[C]` Tests verificam que tenant A não lê dados de tenant B.

## Logs e observabilidade

- `[C]` Todo audit log persistido em `07_memory/<tenant>/audit/`.
- `[C]` PostHog event `agent.invoked` correlacionado com `agent.completed`/`agent.failed` via `run_id`.
- `[ ]` Retenção de logs de audit documentada e aplicada. v1 milestone.

## Network e perímetro

- `[ ]` HTTPS obrigatório em produção (sem fallback HTTP).
- `[ ]` CORS restrito (sem `*`).
- `[ ]` Rate limit em endpoints públicos (webhooks).
- `[ ]` Firewall rules de saída — só para destinos esperados (Shopify, GMC, PostHog, providers explícitos).

## CI / Pipeline

- `[C]` Pre-commit roda smoke + typecheck.
- `[C]` PR roda smoke + typecheck + lint + contract tests.
- `[C]` Main roda integration tests.
- `[ ]` Nightly roda E2E + performance.
- `[ ]` SAST (Semgrep) no CI. v1 milestone.
- `[ ]` DAST (ZAP) — reavaliar para v2.

## Release

- `[ ]` Tag de versão.
- `[ ]` Changelog gerado.
- `[ ]` Rollback procedure documentada por serviço.
- `[ ]` Smoke test pós-deploy executa antes de marcar release como "ok".

## Itens NÃO no escopo v0/v1

- Penetration test externo (reavaliar v2).
- SOC2 / ISO27001 (depende do mercado-alvo).
- Bug bounty (depende de exposição pública).

## Status atual

Maioria dos itens é **bloqueio futuro** — não há código rodando ainda. Itens com `[L][C]` que dependem só de doc/estrutura **já estão atendidos** pelo scaffold das fases anteriores. Itens com `[ ]` em branco precisam de implementação real.
