# 11_tests/integration

Testes **cross-package** com dependências reais (DBs locais, fixtures completos), mas **sem rede externa**. Verificam que peças se encaixam quando combinadas.

## O que cobrir

- **Agente real + runtime + memory:** instanciar agente via `@cao/runtime`, rodar com `@cao/memory` real (filesystem temp), verificar output.
- **Adapter real + DB local:** quando aplicável (ex.: Shopify adapter contra mock server local; admin-app + prisma + sqlite efêmero).
- **Pipeline de serviço:** `feed-service` pipeline `optimize-skus` rodando com mock de provider Shopify + mock GMC, mas LLM real (com fixtures determinísticos onde possível).
- **Multi-tenant isolamento:** plantar dados em tenant A; verificar que código rodando como tenant B não enxerga.

## Stack

- vitest com `--run --reporter=verbose`.
- Mocks de provedor externo (mock server local — `msw` candidato).
- DB temp por teste suite (sqlite em arquivo descartado, redis em-memory quando aplicável).
- Sem credenciais reais — sempre fixtures + mocks.

## Convenções

- Nome: `<scope>.integration.test.ts`.
- **Sem rede externa de verdade.** Endpoints externos são mockados.
- Tempo alvo: total < 15min em CI principal.
- **Não roda em pre-commit** (lento). Roda em PR para `main`.

## Testes previstos

| Arquivo | O que valida |
|---|---|
| `runtime-memory.integration.test.ts` | `@cao/runtime` instancia agente, persiste em `@cao/memory` filesystem temp |
| `shopify-app-auth.integration.test.ts` | OAuth flow do shopify-admin-app com mock Shopify server |
| `feed-pipeline.integration.test.ts` | feed-service pipeline `optimize-skus` end-to-end com mocks |
| `webhook-dedup.integration.test.ts` | Shopify webhook chega 2× — handler processa apenas 1× |
| `multi-tenant-isolation.integration.test.ts` | tenant A não lê memória/dados de tenant B |
| `governance-gate.integration.test.ts` | catalog-feed-ops requer governance.decision=approve antes de write |

## Diferença vs E2E

- **Integration** usa mocks no perímetro externo (Shopify, GMC, providers).
- **E2E** usa o sistema todo, possivelmente contra ambiente staging com credenciais reais.

## Status

Stub. Implementação acompanha cada fase de implementação real (Fases 7+).
