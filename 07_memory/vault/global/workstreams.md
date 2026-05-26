---
updated_at: 2026-05-26T15:00:00Z
tags: [global, workstreams]
---

# Workstreams — global

> Trilhas paralelas cross-tenant (afetam todos) ou infra. Operação por-tenant fica em `tenants/<id>/workstreams.md`.

## W1 — Multi-tenant hardening

| | |
|---|---|
| Status | 🟢 base entregue (sub-fase 2.9 + 2.9.1) |
| Próximo marco | Migrar 14 agentes restantes para `--store=<id>` sob demanda |
| Itens ativos | — (incremental por agente quando necessário) |

## W2 — Pipeline LLM real

| | |
|---|---|
| Status | 🟢 5/5 validado no contexto Incluo (custo $0.22/loop) |
| Próximo marco | N24 — handoff entre agentes via `memory-context` + `buildContextBundle` |
| Bloqueios | B1 rotação Anthropic key (chave atual ativa mas exposta em chat) |

## W3 — Merchant audit (catálogo + compliance)

| | |
|---|---|
| Status | 🟢 score por SKU + findings + remediações; 1 catálogo real auditado (Incluo) |
| Próximo marco | Ampliar `GMC_CATEGORY_OVERRIDES` (Apparel, Electronics, Food); presets PT-BR |
| Itens ativos | — |

## W4 — Onboard 2º tenant

| | |
|---|---|
| Status | ⚪ não iniciado |
| Próximo marco | Quando houver 2º tenant: testar isolamento real (não simulação) + criar `tenants/<id>/` skeleton via script |
| Pré-requisito | demanda de operação real para outra loja |

## W5 — Shopify connect real

| | |
|---|---|
| Status | 🟡 MCP funciona; `--source=shopify` direto depende de credenciais por tenant |
| Próximo marco | Shopify dev store + admin token (B6) → `pnpm shopify:list-products` + `--source=shopify` real |
| Bloqueios | B6 |

## W6 — GMC upload real

| | |
|---|---|
| Status | 🔴 só dry-run + audit local funcionam |
| Próximo marco | Cliente HTTP Merchant real + OAuth (Fase 9) |
| Bloqueios | B7 + decisão sobre client HTTP (ver ADR-0011 feedgen strategy) |

## Trilhas paralelizáveis hoje

- W1 (migração agentes) ⟂ W3 (presets categoria) ⟂ W5 (Shopify connect).
- W2 (handoff) depende de W1 estabilizar (precisa ≥ 6 agentes store-scoped: ✅).
