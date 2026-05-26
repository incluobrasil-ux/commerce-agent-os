// Writeback safety gate — checks que rodam ANTES de qualquer escrita real no
// Shopify ou outro provider externo.
//
// Filosofia: writeback é a operação de maior risco. Esta porta inspeciona
// bundle + perfil legal + tipo de mudança e decide se libera ou bloqueia.

import type { OrchestrationBundle } from './bundle.js';
import type { OperationType, StoreLegalProfile } from './legal.js';
import { evaluateOperation } from './legal.js';

export interface WritebackGateInput {
  bundle: OrchestrationBundle;
  legalProfile: StoreLegalProfile;
  operation: OperationType;
  /** Conteúdo proposto para mudança (texto, JSON, etc) — usado em claims check. */
  payload?: unknown;
  hasShopifyToken: boolean;
  /** Se o operador deu approve explícito. */
  humanApproved: boolean;
}

export interface WritebackGateResult {
  allow: boolean;
  /** Modo efetivo: writeback aplica, dry-run apenas simula. */
  effectiveMode: 'writeback' | 'dry-run' | 'blocked';
  reasons: string[];
  /** Findings adicionais descobertos no gate. */
  legalFindings: ReturnType<typeof evaluateOperation>['findings'];
}

/**
 * Avalia se a operação de writeback pode prosseguir.
 *
 * Regras (em ordem):
 * 1. Sem token Shopify → blocked.
 * 2. Bundle.executionScope ≠ 'store' → blocked.
 * 3. Profile não autoriza sensitive writeback → dry-run only.
 * 4. Legal evaluation = blocked_* → blocked.
 * 5. requiresHumanApproval e !humanApproved → blocked com motivo.
 * 6. allowed_with_warnings → permite mas anota.
 * 7. allowed → permite.
 */
export function gateWriteback(input: WritebackGateInput): WritebackGateResult {
  const reasons: string[] = [];

  if (!input.hasShopifyToken) {
    return {
      allow: false,
      effectiveMode: 'blocked',
      reasons: ['SHOPIFY_ADMIN_TOKEN ausente'],
      legalFindings: [],
    };
  }

  if (input.bundle.executionScope !== 'store') {
    return {
      allow: false,
      effectiveMode: 'blocked',
      reasons: [`executionScope=${input.bundle.executionScope} (writeback exige store)`],
      legalFindings: [],
    };
  }

  const evaluation = evaluateOperation(input.legalProfile, input.operation, input.payload);

  // Bloqueios duros da camada legal.
  if (
    evaluation.decision === 'blocked_pending_legal_review' ||
    evaluation.decision === 'blocked_missing_policy' ||
    evaluation.decision === 'blocked_missing_market_profile'
  ) {
    return {
      allow: false,
      effectiveMode: 'blocked',
      reasons: [`Legal: ${evaluation.decision} — ${evaluation.escalationReason ?? 'sem razão'}`],
      legalFindings: evaluation.findings,
    };
  }

  // Profile não autoriza writeback sensível → degrada para dry-run.
  if (!input.legalProfile.allowsSensitiveWriteback && isSensitive(input.operation)) {
    return {
      allow: false,
      effectiveMode: 'dry-run',
      reasons: ['Store profile não autoriza sensitive writeback (allowsSensitiveWriteback=false)'],
      legalFindings: evaluation.findings,
    };
  }

  // Exige aprovação humana e não tem → blocked.
  if (evaluation.requiresHumanApproval && !input.humanApproved) {
    return {
      allow: false,
      effectiveMode: 'blocked',
      reasons: ['Aprovação humana obrigatória — aguardando --approve explícito'],
      legalFindings: evaluation.findings,
    };
  }

  // Warnings.
  if (evaluation.decision === 'allowed_with_warnings') {
    reasons.push(`${evaluation.findings.length} warning(s) — aplicar com cautela`);
  }

  return {
    allow: true,
    effectiveMode: 'writeback',
    reasons: reasons.length > 0 ? reasons : ['Allowed by legal gate'],
    legalFindings: evaluation.findings,
  };
}

function isSensitive(op: OperationType): boolean {
  return (
    op === 'claims_creation' ||
    op === 'privacy_policy_update' ||
    op === 'cookie_banner_update' ||
    op === 'subscription_or_trial_setup' ||
    op === 'review_publication'
  );
}
