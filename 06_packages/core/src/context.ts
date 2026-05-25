// Helpers de contexto multi-tenant / multi-store.
// Garantem que toda execução tenha tenantId/storeId explícitos quando exigido.
//
// Filosofia: nunca derive contexto implícito de sessão, env ou "última loja
// usada". Quem chama deve passar o contexto explicitamente; quem recebe deve
// asserir antes de operar. Falha cedo, com mensagem clara.

import { BaseError } from './errors.js';

/** Erro lançado quando o contexto exigido está ausente ou inválido. */
export class TenantContextError extends BaseError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'TENANT_CONTEXT', context);
  }
}

/**
 * Forma mínima de um contexto tenant-level (tenant only).
 * Use quando a operação é tenant-global (não específica de uma loja).
 */
export interface TenantContext {
  tenantId: string;
}

/**
 * Forma mínima de um contexto tenant+store. Use quando a operação é
 * específica de uma loja Shopify.
 */
export interface TenantStoreContext extends TenantContext {
  storeId: string;
}

/**
 * Bundle completo de contexto serializável passado entre agentes via handoff.
 * Inclui rastreabilidade (runId, parent run) sem credenciais.
 */
export interface ContextBundle extends TenantStoreContext {
  runId: string;
  /** Identificador opcional do run que originou este (handoff chain). */
  parentRunId?: string;
  /** Agente que está consumindo o contexto. */
  agentName?: string;
  /** Marcadores arbitrários para rastreabilidade. Não inclua segredos. */
  tags?: string[];
}

/**
 * Marker explícito para runs intencionalmente sem tenant (ex.: setup global,
 * health-check, repo audit). Evita confusão com "esqueci de passar tenant".
 */
export interface GlobalContext {
  scope: 'global';
  reason: string;
}

export function isGlobalContext(ctx: unknown): ctx is GlobalContext {
  return (
    typeof ctx === 'object' &&
    ctx !== null &&
    (ctx as GlobalContext).scope === 'global' &&
    typeof (ctx as GlobalContext).reason === 'string'
  );
}

/** Asserta que o contexto tem `tenantId` não-vazio. Lança senão. */
export function assertTenantContext(
  ctx: Partial<TenantContext> | undefined | null,
  agentOrOp?: string,
): asserts ctx is TenantContext {
  if (!ctx || typeof ctx.tenantId !== 'string' || ctx.tenantId.trim() === '') {
    throw new TenantContextError(
      `tenantId obrigatório${agentOrOp ? ` em ${agentOrOp}` : ''}. Passe explicitamente.`,
      { received: ctx, agentOrOp },
    );
  }
}

/** Asserta que o contexto tem `tenantId` e `storeId` não-vazios. Lança senão. */
export function assertTenantStoreContext(
  ctx: Partial<TenantStoreContext> | undefined | null,
  agentOrOp?: string,
): asserts ctx is TenantStoreContext {
  assertTenantContext(ctx, agentOrOp);
  // após assertTenantContext, ctx é TenantContext; storeId requer re-cast.
  const maybe = ctx as Partial<TenantStoreContext>;
  if (typeof maybe.storeId !== 'string' || maybe.storeId.trim() === '') {
    throw new TenantContextError(
      `storeId obrigatório${agentOrOp ? ` em ${agentOrOp}` : ''}. Passe explicitamente.`,
      { received: ctx, agentOrOp },
    );
  }
}

/**
 * Valida que um storeId pertence ao tenantId esperado, contra um registry.
 * Registry é injetado pelo caller (filesystem, in-memory, etc.) — evita
 * dependência de provider concreto neste package.
 */
export function validateStoreBelongsToTenant(
  tenantId: string,
  storeId: string,
  registry: {
    storesByTenant: (tenantId: string) => readonly string[] | Promise<readonly string[]>;
  },
): boolean | Promise<boolean> {
  const result = registry.storesByTenant(tenantId);
  if (Array.isArray(result)) return result.includes(storeId);
  return Promise.resolve(result).then((list) => list.includes(storeId));
}

/**
 * Constrói um ContextBundle pronto para serializar e passar via handoff.
 * Falha cedo se faltar tenantId/storeId/runId.
 */
export function buildContextBundle(input: {
  tenantId: string;
  storeId: string;
  runId: string;
  parentRunId?: string;
  agentName?: string;
  tags?: string[];
}): ContextBundle {
  assertTenantStoreContext({ tenantId: input.tenantId, storeId: input.storeId }, input.agentName);
  if (!input.runId || input.runId.trim() === '') {
    throw new TenantContextError('runId obrigatório em buildContextBundle.', { input });
  }
  const bundle: ContextBundle = {
    tenantId: input.tenantId,
    storeId: input.storeId,
    runId: input.runId,
  };
  if (input.parentRunId) bundle.parentRunId = input.parentRunId;
  if (input.agentName) bundle.agentName = input.agentName;
  if (input.tags && input.tags.length > 0) bundle.tags = [...input.tags];
  return bundle;
}

/**
 * Deriva storeId canônico de um shopDomain Shopify.
 *
 * Convenção:
 *   - `acme.myshopify.com`           → `acme`
 *   - `loja.com.br`                  → `loja-com-br`
 *   - `shop.acme-corp.example.com`   → `shop-acme-corp-example-com`
 *
 * Pure function; o caller pode sobrescrever passando storeId explícito.
 */
export function slugifyShopDomain(shopDomain: string): string {
  if (!shopDomain || typeof shopDomain !== 'string') {
    throw new TenantContextError('shopDomain inválido em slugifyShopDomain.', { shopDomain });
  }
  const trimmed = shopDomain.trim().toLowerCase();
  if (trimmed.endsWith('.myshopify.com')) {
    return trimmed.slice(0, -'.myshopify.com'.length).replace(/[^a-z0-9-]+/g, '-');
  }
  return trimmed.replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
}
