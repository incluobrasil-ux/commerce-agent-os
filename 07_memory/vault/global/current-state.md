---
updated_at: 2026-05-26T19:30:00Z
tags: [global, current-state]
---

# Global — current state

> Atualizar **a cada milestone cross-tenant**. ≤ 25 linhas.

## Fase

| | |
|---|---|
| Macro | 2 — Implementação |
| Último marco (2026-05-26) | Sub-fase 2.6 minimal: `shopify:writeback` CLI (compliance → diff → dry-run/apply → audit log). Dry-run validado em Incluo. 24 testes novos. |
| Próximo marco | Provisionar SHOPIFY_ADMIN_TOKEN → primeiro `--apply` real em produto de baixo risco (não Contas Madeira). |

## Verde (cross-tenant)

- **20/22 agentes** REAL_EXECUTABLE; 6 com `--store=<id>` explícito (merchant:audit, merchant:compliance, product:offer, marketing:plan, creative:assets, design:ux).
- **333 testes verdes** em 39 arquivos; smoke 17 (incl. 12 multi-tenant isolation).
- **Pipeline Merchant** dry-run + audit determinístico (zero-cred) + LLM pipeline 5/5 validado real.
- **Writeback Shopify** dry-run validado em Incluo (parser + diff + audit log); `--apply` aguarda token + revisão jurídica para HIGH-severity.
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

> 20 agentes reais, 6 store-scoped, multi-tenant + brain consolidados, 1 tenant em produção piloto (incluo), 333 testes verdes, pipeline LLM 5/5 + writeback Shopify dry-run validado.

Detalhe operacional por tenant: `07_memory/vault/tenants/<id>/current-state.md`.
History canônico do projeto: `07_memory/vault/projects/commerce-agent-os/`.
