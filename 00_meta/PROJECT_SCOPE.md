# Project scope

Define **o que este projeto é**, **o que não é**, e onde estão os limites com sistemas vizinhos. Documento curto, datado e versionado.

- Versão: 0.1
- Data: 2026-05-23
- Status: vivo (atualizar conforme decisões)

## O que este projeto é

`commerce-agent-os` é um **sistema operacional de agentes para lojistas Shopify**. O objetivo é automatizar trabalho repetitivo e ambíguo de operação de e-commerce com agentes especializados, organizados em tiers, sob uma camada comum de runtime, memória e guardrails.

Áreas-foco:
- **Catálogo e feeds:** otimizar conteúdo de produto para Shopify, Google Merchant Center e SEO on-site.
- **Marketing e criativo:** planejar campanhas e produzir copy + assets em escala.
- **Inteligência:** mercado, concorrência, e voz do cliente (reviews).
- **Analytics e otimização:** medir, propor experimentos, fechar o loop.

## O que este projeto NÃO é

- Não é uma plataforma de e-commerce — Shopify é a **fonte da verdade** do catálogo, pedidos e clientes.
- Não é um produto de analytics — PostHog é a base; nós **consumimos**, não substituímos.
- Não é um CRM — gestão de relacionamento fora do que o admin Shopify cobre é out-of-scope para v0/v1.
- Não é um ERP — gestão de estoque, financeiro, contabilidade são out-of-scope.
- Não é um marketplace nem solução B2B/wholesale dedicada.
- Não é um agente único genérico — é uma **constelação tiered** com responsabilidades claras.

## Limites com sistemas vizinhos

| Sistema | Papel | Nossa fronteira |
|---|---|---|
| Shopify | catálogo, pedidos, clientes, storefront | consumimos via Admin API; nunca duplicamos estado |
| Google Merchant Center | feed de produto Google | sincronização; GMC é destino canônico |
| Google Ads | mídia paga Google | postergado; integração futura |
| PostHog | analytics + observability | SDK; nunca embarcamos o monorepo PostHog |
| Bright Data | competitive intelligence | SaaS pago; uso restrito a casos com ROI claro |
| Higgsfield | skills + CLI | dependência runtime para skills |
| LLM providers | inferência | encapsulados em `@cao/llm`; intercambiáveis |

## Premissas

- Multi-tenant: cada loja Shopify é um tenant; isolamento estrito por `tenant_id`.
- Markdown-first para memória; embeddings opcionais.
- TypeScript como linguagem default; Python só se necessário (ex.: ports de `feedgen`).
- Cloud-first; self-host só se houver motivo específico.

## Versões alvo

- **v0 (proof of foundation):** estrutura completa, agentes scaffolded, build verde, primeiro agente end-to-end (a definir qual). Sem publicar nada em produção.
- **v1 (loja-piloto):** uma loja Shopify real conectada; pipeline de feed funcionando end-to-end; primeira síntese de VoC.
- **v2+:** expansão por tier conforme `ROADMAP.md`.

## Decisões em aberto que afetam escopo

Ver `DECISIONS.md` e checklist em `ROADMAP.md`.
