---
updated_at: 2026-05-26T15:00:00Z
tags: [global, current-state]
---

# Global — current state

> Atualizar **a cada milestone cross-tenant**. ≤ 25 linhas.

## Fase

| | |
|---|---|
| Macro | 2 — Implementação |
| Último marco (2026-05-26) | Pipeline LLM real end-to-end 5/5 + Memory consolidada em `vault/tenants/<t>/[stores/<s>/]` + 6 agentes store-scoped. |
| Próximo marco | Operação real Incluo (1º tenant ativo) aplicar findings reais + decidir onboard de 2º tenant. |

## Verde (cross-tenant)

- **20/22 agentes** REAL_EXECUTABLE; 6 com `--store=<id>` explícito (merchant:audit, merchant:compliance, product:offer, marketing:plan, creative:assets, design:ux).
- **309 testes verdes** em 36 arquivos; smoke 17 (incl. 12 multi-tenant isolation).
- **Pipeline Merchant** dry-run + audit determinístico (zero-cred) + LLM pipeline 5/5 validado real.
- **Multi-tenant**: branded types, assertions, `vault/tenants/<t>/[stores/<s>/]`, brain-bridge dinâmico.
- 8 ADRs aceitos; CI ativo; branch protection em `main`.

## Tenants ativos

| Tenant | Stores | Status | Detalhe |
|---|---|---|---|
| `incluo-tenant` | `incluo` (incluobrasil.com, BR, BRL, sensorial/Montessori) | 🟢 piloto | 1ª loja real. Audit ✅, pipeline LLM ✅. Ver [tenants/incluo-tenant/current-state.md](../tenants/incluo-tenant/current-state.md). |

## Bloqueios cross-tenant

| ID | Bloqueio | Esforço |
|---|---|---|
| B1 | `ANTHROPIC_API_KEY` (rotação pendente — foi pasted em chat) | 5 min |
| B6 | Shopify dev store + admin token (não bloqueia MCP; bloqueia `--source=shopify` direto) | ~3 min |
| B7 | GMC creds (upload real; não bloqueia dry-run nem audit) | 30-60 min |

## Resumo em 1 linha

> 20 agentes reais, 6 store-scoped, multi-tenant + brain consolidados, 1 tenant em produção piloto (incluo), 309 testes verdes, pipeline LLM 5/5 validado.

Detalhe operacional por tenant: `07_memory/vault/tenants/<id>/current-state.md`.
History canônico do projeto: `07_memory/vault/projects/commerce-agent-os/`.
