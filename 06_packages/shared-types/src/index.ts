// @cao/shared-types — tipos canônicos do domínio.
// Apenas types (compilação some em runtime). Sem dependências.

/**
 * Identificador opaco de tenant (organização/cliente que opera o sistema).
 * Multi-tenant safety: nunca derive tenantId implícito de sessão ou env.
 */
export type TenantId = string & { readonly __brand: 'TenantId' };

/**
 * Identificador opaco de store (loja Shopify específica dentro de um tenant).
 * Um tenant pode ter N stores. Convenção sugerida: slug do shopDomain sem TLD
 * (ex.: shopDomain `acme.myshopify.com` → storeId `acme`).
 */
export type StoreId = string & { readonly __brand: 'StoreId' };

/**
 * Identificador opaco de installation Shopify (par tenant+store autenticado
 * via OAuth ou custom-app token). Útil quando o mesmo storeId pode ter
 * múltiplas installations (ex.: re-install).
 */
export type InstallationId = string & { readonly __brand: 'InstallationId' };

/**
 * shopDomain canônico do Shopify (forma `<handle>.myshopify.com` ou domínio
 * custom validado). É a referência externa estável; mapeia para um StoreId
 * interno via registry.
 */
export type ShopDomain = string & { readonly __brand: 'ShopDomain' };

/** Identificador único de uma execução de agente. */
export type RunId = string & { readonly __brand: 'RunId' };

/** Identificador único de um artifact (output gerado por agente/run). */
export type ArtifactId = string & { readonly __brand: 'ArtifactId' };

/** Identificador opaco de agente. */
export type AgentName = string & { readonly __brand: 'AgentName' };
