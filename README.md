# commerce-agent-os

Sistema operacional de agentes para e-commerce.

## Status

Fase atual: **4 — fundação operacional** (scaffold + docs canônicos). Sem lógica de negócio implementada.

## Estrutura

Veja [CLAUDE.md](./CLAUDE.md) para layout, regras e convenções.

## Documentos canônicos

- [PROJECT_SCOPE](./00_meta/PROJECT_SCOPE.md)
- [SUCCESS_CRITERIA](./00_meta/SUCCESS_CRITERIA.md)
- [ROADMAP](./00_meta/ROADMAP.md)
- [DECISIONS](./00_meta/DECISIONS.md)
- [STACK_RULES](./00_meta/STACK_RULES.md)

## Upstreams estudados

Classificação em [00_meta/REPO_SELECTION.md](./00_meta/REPO_SELECTION.md). Lista resumida em [00_meta/upstreams_index.md](./00_meta/upstreams_index.md).

## Fases

Os prompts operacionais por fase estão em [09_prompts/](./09_prompts/):

1. `00_bootstrap` — preparação do ambiente
2. `01_repo_audit` — auditoria dos upstreams
3. `02_architecture` — arquitetura do sistema
4. `03_scaffold` — scaffolding inicial
5. `04_foundation` — base de pacotes e agentes
6. `05_shopify` — integração Shopify
7. `06_merchant_feed_seo` — feeds e SEO
8. `07_reviews` — reviews e reputação
9. `08_marketing_research` — pesquisa de marketing
10. `09_analytics` — analytics (PostHog etc.)
11. `10_security_qa` — segurança e QA
12. `11_hardening_release` — endurecimento e release
