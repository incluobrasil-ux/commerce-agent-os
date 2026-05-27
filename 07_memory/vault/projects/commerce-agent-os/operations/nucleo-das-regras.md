---
aliases: [Núcleo, Núcleo das Regras, Core, Contracts, Legal]
tags: [operations-map, role:core-rules]
icon: icons/nucleo-das-regras.svg
category: core
color: "#3B82F6"
technical_name: "@cao/core + @cao/shared-types + @cao/orchestration/legal"
technical_path: 06_packages/core, 06_packages/shared-types, 06_packages/orchestration/src/legal.ts
---

# Núcleo das Regras

**Papel:** contém as regras invariantes do sistema. Quem viola é bloqueado antes de qualquer execução.

**Camadas:**
- **`@cao/core`** — branded types (TenantId, StoreId, RunId), assertions multi-tenant (`assertTenantContext`, `assertTenantStoreContext`), ContextBundle base, errors/result/clock/id/retry.
- **`@cao/shared-types` + `@cao/shared-schemas`** — contratos zod compartilhados entre agentes.
- **Camada legal BR/EU/US** ([`@cao/orchestration/legal.ts`](../../../../../06_packages/orchestration/src/legal.ts)) — 11 regras hard/soft (LGPD+CDC+CONAR+ANVISA, GDPR+CRD+Omnibus, FTC+CCPA/CPRA), 9 risk types, 5 decisions (allowed / allowed_with_warnings / blocked_pending_legal_review / blocked_missing_policy / blocked_missing_market_profile).

**Quem consulta:** [[chefe-da-operacao]] antes de cada rota; [[mesa-de-comando]] no writeback-gate; [[motor-dos-agentes]] em runtime para validar input.

**Templates:** [[../../templates/legal-profile.README]] — como configurar `legal-profile.json` por loja.
