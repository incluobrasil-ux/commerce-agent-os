---
created_at: 2026-05-26T19:30:00Z
updated_at: 2026-05-26T19:30:00Z
tags: [shopify, writeback, milestone, sub-fase-2.6]
source: mixed
kind: implementation-milestone
result: green
confidence: 1.0
related:
  - 05_integrations/shopify/writeback/
  - 04_apps/shopify-admin-app/scripts/writeback.ts
  - 07_memory/vault/tenants/incluo-tenant/stores/incluo/shopify-writeback/20260526-190257-conjunto-montessori-contas.md
---

# Sub-fase 2.6 minimal — Shopify writeback (compliance → dry-run/apply + audit log)

## Contexto

PR [#18](https://github.com/incluobrasil-ux/commerce-agent-os/pull/18) fechou o loop entre o output do `merchant:compliance` (markdown com revisões antes/depois) e o catálogo Shopify. Antes desta entrega o pipeline era one-way: agentes geravam recomendações que ficavam paradas no vault. Agora existe um caminho determinístico para parsear, planejar diff, validar (dry-run) e — sob gate `--apply` explícito — aplicar via `productUpdate`.

## O que aconteceu

- Novo módulo `05_integrations/shopify/writeback/` com 3 unidades puras:
  - `compliance-parser.ts` — extrai blocos antes/depois de markdown merchant-compliance + detecta placeholders (`[inserir...]`, `[Remover...]`).
  - `apply-revisions.ts` — str-replace literal sobre `descriptionHtml` + diff humano + skip de placeholders.
  - `audit-log.ts` — `WritebackAuditEntry` + render markdown + filename builder.
- `admin-graphql.ts` ganhou `getProductByHandle()`, `updateProduct()` (productUpdate mutation) e tipo `ProductSnapshot`.
- CLI novo: `pnpm shopify:writeback` (default = dry-run; `--apply` é gate explícito).
- 24 testes novos (4 arquivos: compliance-parser, apply-revisions, audit-log, admin-graphql ampliado). **Suíte 309 → 333 verdes em 39 arquivos.**
- Dry-run validado end-to-end no compliance file real Incluo (`contas-madeira-pdp-review-20260526-174712.md`): 9 revisões parseadas, 2 placeholders skipados, 7 not-found (esperado — sem produto remoto sem token). Audit log gravado em [stores/incluo/shopify-writeback/20260526-190257-conjunto-montessori-contas.md](../../../tenants/incluo-tenant/stores/incluo/shopify-writeback/20260526-190257-conjunto-montessori-contas.md).

## Achados / decisões

- **Default dry-run, `--apply` é gate.** Decisão consciente: o sistema nunca toca produto sem flag explícita. Severity HIGH no compliance file dispara aviso para revisão jurídica.
- **Audit log sempre escrito**, mesmo em dry-run. Garante trilha para revisão/compliance independente do modo.
- **Placeholders entre `[colchetes]` são skipados**, não aplicados. Evita propagar instruções TODO ("[inserir CNPJ]") como conteúdo real.
- **str-replace literal**, não regex: confiabilidade > flexibilidade. Se o "antes" não existir exatamente no `descriptionHtml`, fica `not-found` no log e segue.
- **Bloqueador para `--apply` real**: `SHOPIFY_ADMIN_TOKEN` ausente em `.env.local` + severity HIGH do compliance Incluo (10 risks legais brasileiros) requer revisão jurídica antes de tocar PDP.

## Impacto

- Sub-fase 2.6 minimal entregue. Pipeline write-back fechou em código (dry-run end-to-end). 
- Loop `compliance → diff → audit` agora reproduzível para qualquer compliance file de qualquer tenant/store.
- Próximo gate é operacional (token + jurídico), não técnico.
- Padrão "gate explícito por --apply + audit log default" replicável para futuros writebacks (preços, GTIN, metafields).

## Ações geradas

- [ ] Provisionar `SHOPIFY_ADMIN_TOKEN` em `.env.local` (Custom App em dev store, ~3 min).
- [ ] Revisão jurídica do compliance review HIGH antes do primeiro `--apply` em produto sensível (contas madeira / claims TDAH-TEA).
- [ ] Primeiro `--apply` real em SKU de baixo risco (não em PDPs flagados HIGH) para validar caminho de `productUpdate`.

## Referências

- código: `05_integrations/shopify/writeback/`
- CLI: `04_apps/shopify-admin-app/scripts/writeback.ts`
- audit log de validação: `07_memory/vault/tenants/incluo-tenant/stores/incluo/shopify-writeback/20260526-190257-conjunto-montessori-contas.md`
- commit: `6904f59`
- PR: [#18](https://github.com/incluobrasil-ux/commerce-agent-os/pull/18) (merged em `9b63563`)
