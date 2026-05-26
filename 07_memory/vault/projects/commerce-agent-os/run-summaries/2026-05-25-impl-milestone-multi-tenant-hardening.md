---
created_at: 2026-05-25T23:30:00Z
updated_at: 2026-05-25T23:30:00Z
tags: [multi-tenant, multi-store, hardening, isolation]
source: human:incluobrasil-ux
kind: impl-milestone
result: green
confidence: 1.0
related:
  - 06_packages/shared-types/src/index.ts
  - 06_packages/core/src/context.ts
  - 06_packages/memory/src/memory.ts
  - 06_packages/runtime/src/runtime.ts
  - 06_packages/brain-bridge/src/capture.ts
  - 05_integrations/google-merchant/audit/report.ts
  - 03_agents/catalog-feed-ops/src/audit-cli.ts
  - 11_tests/smoke/multi-tenant-isolation.smoke.ts
---

# Multi-tenant / multi-store hardening — base técnica

## Contexto

Auditoria mostrou que o repo era tenant-aware mas não store-aware: captureRun escrevia em path único hardcoded (risco crítico de mistura entre tenants), Memory só conhecia tenantId, AgentContext sem storeId, nenhum helper de assertion. Pedido: implementar base técnica sem reescrever arquitetura, sem inventar DB, isolamento por runtime + filesystem + metadata local.

## O que aconteceu

- **shared-types**: 7 branded types canônicos (`TenantId`, `StoreId`, `InstallationId`, `ShopDomain`, `RunId`, `ArtifactId`, `AgentName`).
- **core/context.ts**: `assertTenantContext`, `assertTenantStoreContext`, `validateStoreBelongsToTenant`, `buildContextBundle`, `slugifyShopDomain`, `isGlobalContext`. Pure functions; sem deps. +20 testes.
- **memory**: `MemoryConfig.storeId` opcional. Path resolve para `<tenant>/stores/<store>/` quando presente. `safePath` mantém isolamento. +8 testes.
- **runtime**: `AgentContext.storeId` + `RunOptions.storeId` opcionais. Propagados para observability events (`store_id`).
- **brain-bridge**: `CaptureInput.tenantId` + `storeId` opcionais. Nova função `resolveBrainDir(repoRoot, input)` com 4 níveis: `brainDir` explícito > `tenant+store` > `tenant` > project brain fallback. +7 testes incl. integração com captureRun.
- **google-merchant/report**: `AuditReportInput.storeId` opcional. Reports vão para `12_reports/merchant-audits/<tenant>/stores/<store>/` quando ambos presentes. Mantém legacy path para `_test`/`_demo`.
- **catalog-feed-ops/audit-cli**: novo `--store=<id>`. Assertion via `assertTenantStoreContext` quando passado, senão `assertTenantContext` apenas. Captura passa tenantId+storeId para captureRun → escreve em `07_memory/vault/tenants/<t>/stores/<s>/run-summaries/`. Slug do capture inclui store para evitar colisão. Quando `--store` ausente mas `--source=shopify` com domain custom, deriva via `slugifyShopDomain`.
- **smoke tests**: 12 novos em `11_tests/smoke/multi-tenant-isolation.smoke.ts` cobrindo isolamento Memory tenant↔tenant, Memory store↔store, brain-bridge, assertions, buildContextBundle, slugifyShopDomain, path traversal.

## Achados / decisões

- **Backward compat preservada**: todos os params novos opcionais. `_test`/`_demo` (defaults dev) continuam escrevendo em paths legados. Tests existentes 100% verdes sem mudança.
- **Filesystem-based isolation**: sem DB, sem registry server-side. `Memory.safePath` + `resolveBrainDir` puros + `assertTenantStoreContext` cedo garantem isolamento por construção.
- **Pilot end-to-end validado**: `pnpm merchant:audit --source=json --tenant=incluo-tenant --store=incluo --gmc-default=3793 --capture` escreveu report em `12_reports/merchant-audits/incluo-tenant/stores/incluo/` e capture em `07_memory/vault/tenants/incluo-tenant/stores/incluo/run-summaries/`. Score 93.2 (igual ao run anterior — só o roteamento mudou).
- **Outros 20 agentes não migrados** ainda — pattern estabelecido em `audit-cli.ts` serve como modelo. Próximos agentes adotam incrementalmente.
- **Não tocou em**: Shopify client (1 cred por instância continua), registry de stores (não criado), `12_reports/merchant-dry-runs/` (legado).

## Impacto

- Suíte **251 → 309** verdes em **36 arquivos** (+58 testes).
- Smoke **5 → 17** (+12 isolamento multi-tenant).
- Sem regressões: typecheck OK, lint OK.
- Repo **suporta operação multi-loja** sem risco de mistura no caminho do merchant:audit (pilot).
- Helpers reutilizáveis: qualquer agente novo herda `assertTenantStoreContext` + `buildContextBundle` direto.

## Ações geradas

- [ ] Migrar próximos agentes para `--store=<id>` + assertion: `merchant-compliance`, `product-offer`, `marketing-director`, `creative-copy-assets`, `design-ux-localization`.
- [ ] Quando criar 2ª loja real: validar isolamento end-to-end com tenants reais.
- [ ] Considerar registry filesystem em `07_memory/vault/global/tenants.json` para `validateStoreBelongsToTenant`.
- [ ] Shopify client: aceitar `storeRegistry` injetado quando precisar suportar múltiplas lojas no mesmo processo.

## Referências

- código: `06_packages/{shared-types,core,memory,runtime,brain-bridge}/src/`, `05_integrations/google-merchant/audit/report.ts`, `03_agents/catalog-feed-ops/src/audit-cli.ts`
- smoke: `11_tests/smoke/multi-tenant-isolation.smoke.ts`
- pilot real: `12_reports/merchant-audits/incluo-tenant/stores/incluo/json-20260525-230438.{md,json}`
- capture real: `07_memory/vault/tenants/incluo-tenant/stores/incluo/run-summaries/2026-05-25-audit-merchant-audit-incluo-tenant-incluo-json.md`
