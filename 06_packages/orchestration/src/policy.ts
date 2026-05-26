// Decision policy / guardrails do Chefe.
//
// Conjunto de regras determinísticas que respondem perguntas como:
// - rota curta vs longa?
// - LLM vs determinístico?
// - SKIPPED gracioso vs blocker?
// - precisa aprovação humana?
// - dry-run forçado?
//
// Tudo aqui é função pura. Sem IO. Sem LLM. Consumido pelo planner.

import type { ExecutionMode, OrchestrationBundle } from './bundle.js';
import type { AgentCapability } from './registry.js';

export interface PolicyDecision {
  proceed: boolean;
  /** Modo a usar (pode rebaixar dry-run -> read-only). */
  forcedMode?: ExecutionMode;
  /** Razão da decisão. */
  reason: string;
  /** Se for SKIPPED gracioso, qual mensagem para o operador. */
  skippedMessage?: string;
}

export interface PolicyInputs {
  bundle: OrchestrationBundle;
  agent: AgentCapability;
  hasAnthropicKey: boolean;
  hasShopifyToken: boolean;
  hasGoogleMerchantCreds: boolean;
}

/**
 * Decide se um agente pode rodar agora, dado o estado do bundle e credenciais.
 * Nunca é destrutivo — apenas filtra/rebaixa.
 */
export function shouldRunAgent(inputs: PolicyInputs): PolicyDecision {
  const { bundle, agent, hasAnthropicKey, hasShopifyToken, hasGoogleMerchantCreds } = inputs;

  // 1. Credenciais ausentes -> SKIPPED gracioso (não falha o run inteiro).
  if (agent.credentials.includes('anthropic') && !hasAnthropicKey) {
    return {
      proceed: false,
      reason: 'missing_credential:anthropic',
      skippedMessage: `${agent.name} requer ANTHROPIC_API_KEY — SKIPPED.`,
    };
  }
  if (agent.credentials.includes('shopify-admin') && !hasShopifyToken) {
    return {
      proceed: false,
      reason: 'missing_credential:shopify-admin',
      skippedMessage: `${agent.name} requer SHOPIFY_ADMIN_TOKEN — SKIPPED.`,
    };
  }
  if (agent.credentials.includes('google-merchant') && !hasGoogleMerchantCreds) {
    return {
      proceed: false,
      reason: 'missing_credential:google-merchant',
      skippedMessage: `${agent.name} requer credenciais Google Merchant — SKIPPED.`,
    };
  }

  // 2. Modo writeback exige escopo store + perfil legal + autorização.
  if (bundle.executionMode === 'writeback') {
    if (bundle.executionScope !== 'store') {
      return {
        proceed: false,
        reason: 'writeback_requires_store_scope',
        skippedMessage: 'Writeback exige executionScope=store (não tenant/global).',
      };
    }
    if (bundle.requiresHumanApproval && bundle.status !== 'awaiting_approval') {
      return {
        proceed: false,
        reason: 'writeback_blocked_pending_human',
        skippedMessage: `Writeback bloqueado: ${bundle.legalEscalationReason ?? 'aprovação humana pendente'}.`,
      };
    }
  }

  // 3. Agente writeback rodando em bundle dry-run -> forçar dry-run.
  if (agent.sideEffects === 'writes-shopify' && bundle.executionMode === 'dry-run') {
    return {
      proceed: true,
      forcedMode: 'dry-run',
      reason: 'agent_supports_writeback_but_bundle_is_dry_run',
    };
  }

  // 4. Agente determinístico sem credencial -> sempre OK.
  if (agent.kind === 'deterministic') {
    return { proceed: true, reason: 'deterministic_agent_always_allowed' };
  }

  // 5. Default: prossegue.
  return { proceed: true, reason: 'default_allow' };
}

/**
 * Decide se a rota deve usar atalho (rota curta) ou rota completa.
 * Heurística: read-only/dry-run usa rota curta; writeback usa rota completa
 * com governance-risk-qa obrigatório.
 */
export function selectRouteLength(bundle: OrchestrationBundle): 'short' | 'full' {
  if (bundle.executionMode === 'writeback') return 'full';
  if (bundle.legalRiskLevel === 'high') return 'full';
  if (bundle.requiresHumanApproval) return 'full';
  return 'short';
}

/**
 * Decide quando escalar para governance-risk-qa.
 */
export function shouldEscalateGovernance(bundle: OrchestrationBundle): boolean {
  return (
    bundle.executionMode === 'writeback' ||
    bundle.legalRiskLevel === 'high' ||
    bundle.findings.some((f) => f.severity === 'critical' || f.severity === 'high') ||
    bundle.legalFindings.some((f) => f.severity === 'hard')
  );
}

/**
 * Decide quando o Chefe deve encerrar em vez de continuar chamando agentes.
 */
export function shouldStop(bundle: OrchestrationBundle): { stop: boolean; reason: string } {
  if (bundle.status === 'completed') return { stop: true, reason: 'already_completed' };
  if (bundle.status === 'failed_terminal') return { stop: true, reason: 'terminal_failure' };
  if (bundle.status === 'blocked_external') return { stop: true, reason: 'external_block' };
  if (bundle.stage >= bundle.plannedRoute.length) return { stop: true, reason: 'route_exhausted' };
  if (bundle.blockers.length >= 3) return { stop: true, reason: 'too_many_blockers' };
  return { stop: false, reason: 'continue' };
}
