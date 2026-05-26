---
updated_at: 2026-05-26T15:00:00Z
tags: [global, run-summaries, index]
---

# Global run-summaries — index

> Aqui só **milestones cross-tenant** ou arquiteturais. Runs específicos de tenant ficam em `tenants/<id>/stores/<s>/run-summaries/` (não promovem automaticamente).

## Impl milestones (cross-tenant / arquiteturais)

| Data | Título | Result | Detalhe |
|---|---|---|---|
| 2026-05-26 | **N21 + design:ux fix + Memory consolidada** | 🟢 | Pipeline LLM 5/5 validado real; Memory + brain-bridge alinhados em `vault/tenants/<t>/`. Detalhe em [projects brain](../../projects/commerce-agent-os/run-summaries/2026-05-26-impl-milestone-n21-llm-pipeline-real.md). |
| 2026-05-25 | **Multi-tenant hardening + 6 agentes store-scoped** | 🟢 | Branded types, helpers, assertions, `Memory.storeId`, `captureRun` tenant-aware, 12 smoke tests de isolamento. |
| 2026-05-25 | **Merchant audit MVP** | 🟢 | Score 0-100 por SKU + findings categorizados + remediações; 13 testes scorer. |
| 2026-05-25 | **Bloco B (4 agentes novos)** | 🟢 | marketing-director, creative-copy-assets, design-ux-localization, traffic-campaigns. |

## Audits cross-tenant

| Data | Título | Result | Detalhe |
|---|---|---|---|
| 2026-05-23 | Sub-fase 2.3 — 10 upstreams auditados | 🟡 | 2 reclassificações de licença. |

## Como adicionar entrada aqui

Critério: o milestone afeta **infra** ou **mais de 1 tenant**. Se for específico de uma loja, vai em `tenants/<id>/stores/<s>/run-summaries/`. Curadoria é manual — nada de cópia automática.
