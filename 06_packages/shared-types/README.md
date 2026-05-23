# @cao/shared-types

**Tipos canônicos** do domínio. Apenas type-time — sem código runtime.

## Por que existe (e não no `@cao/core`)

- `@cao/core` carrega utilidades runtime (clock, IDs, retry, fs helpers). Misturar tipos canônicos com util runtime atrapalha tree-shaking e cria ciclos.
- `@cao/shared-types` é importável **por todos** sem custo runtime — compilação some.
- Ver [ADR-0004](../../02_architecture/adr/ADR-0004-shared-packages.md).

## API prevista (não implementada)

- **Identificadores branded:** `TenantId`, `AgentName`, `SkuId`, `PolicyRef`, `ArtifactRef`.
- **Domínio:** `ProductEvent`, `CreativeBrief`, `FeedRow`, `OfferProposal`, `VoCTheme`.
- **Envelope:** `ResultEnvelope<T>`, `AgentAuditEntry`, `ToolInvocation`.
- **Localização:** `Locale`, `Currency`, `Region`, `Money`.
- **Memória:** `MemoryEntry`, `MemoryBundle`.

## Regras

- Zero código runtime — apenas `type`, `interface`, `enum const`, `as const` literals.
- Nenhuma dependência externa.
- Tipos exportados são versionados; mudar contract significa subir versão do package.

## Consumido por

- Todos os packages, agents, apps.

## Status

Stub. Apenas dois branded types como sentinela: `TenantId`, `AgentName`.
