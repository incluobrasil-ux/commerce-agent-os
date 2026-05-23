// @cao/shared-types — placeholder
// Tipos canônicos do domínio do projeto. Apenas types (compilação some em runtime).
// Implementação real começará na Fase 5/7.
//
// Exports planejados:
// - TenantId, AgentName, ArtifactType, ArtifactRef
// - ProductEvent, CreativeBrief, FeedRow
// - AgentAuditEntry, ResultEnvelope, PolicyRef
// - Locale, Currency, Region, Money

export type TenantId = string & { readonly __brand: 'TenantId' };
export type AgentName = string & { readonly __brand: 'AgentName' };
