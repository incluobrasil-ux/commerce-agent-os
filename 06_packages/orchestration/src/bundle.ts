// ContextBundle estendido — handoff padrão entre agentes orquestrados.
//
// Estende `ContextBundle` mínimo do @cao/core (que carrega tenantId/storeId/runId)
// adicionando campos operacionais que o Chefe precisa propagar entre steps.
//
// Filosofia: cada agente recebe um OrchestrationBundle, lê o que precisa,
// produz seu output e retorna um NextHandoff. O runner persiste tudo.

import type { ContextBundle } from '@cao/core';
import type { Jurisdiction, LegalDecision, LegalRiskFinding } from './legal.js';

export type ExecutionMode = 'read-only' | 'dry-run' | 'writeback';
export type StageStatus =
  | 'queued'
  | 'running'
  | 'waiting_context'
  | 'blocked_external'
  | 'skipped_gracefully'
  | 'awaiting_approval'
  | 'completed'
  | 'failed_recoverable'
  | 'failed_terminal';

export interface ArtifactRef {
  /** Onde o artefato vive (vault path, report path, mutation id, etc). */
  uri: string;
  /** Mime/kind: 'markdown', 'json', 'shopify-mutation', etc. */
  kind: string;
  /** Identidade do agente que produziu. */
  producedBy: string;
  /** Stage do run. */
  producedAtStage: number;
}

export interface Blocker {
  kind:
    | 'missing_credential'
    | 'missing_policy'
    | 'awaiting_human'
    | 'external_error'
    | 'tenant_limit';
  message: string;
  remediation?: string;
}

export interface DecisionTrailEntry {
  stage: number;
  agentName: string;
  decisionKind: 'pick_next' | 'skip' | 'block' | 'approve' | 'revise' | 'route_change';
  reason: string;
  /** Timestamp ISO-8601. */
  at: string;
}

/**
 * Bundle completo trafegando entre agentes em um run orquestrado.
 *
 * Persistido no vault em `07_memory/vault/tenants/<t>/stores/<s>/runs/<runId>.json`
 * a cada checkpoint.
 */
export interface OrchestrationBundle extends ContextBundle {
  /** Objetivo original em linguagem natural. */
  objective: string;
  /** Escopo declarado pelo operador. */
  executionScope: 'global' | 'tenant' | 'store';
  /** Modo de execução. */
  executionMode: ExecutionMode;
  /** Step atual (0-indexed). */
  stage: number;
  /** Status do run. */
  status: StageStatus;
  /** Plano de rota: lista de agentes na ordem prevista. */
  plannedRoute: ReadonlyArray<{ agent: string; purpose: string }>;
  /** Artefatos produzidos até agora. */
  artifacts: ArtifactRef[];
  /** Findings principais (compliance, audit, etc). */
  findings: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low';
    message: string;
    ruleId?: string;
  }>;
  /** Blockers externos. */
  blockers: Blocker[];
  /** Trail de decisões do orquestrador. */
  decisionTrail: DecisionTrailEntry[];
  /** Confidence agregado (0..1). */
  confidence: number;
  /** Próximo agente recomendado (se status=completed e há follow-up). */
  nextRecommendedStep?: { agent: string; reason: string };
  /** ===== Camada jurídica ===== */
  jurisdictions: Jurisdiction[];
  legalRiskLevel: 'none' | 'low' | 'medium' | 'high';
  legalFindings: LegalRiskFinding[];
  requiredPolicies: ReadonlyArray<
    'privacy' | 'terms' | 'refund' | 'returns' | 'shipping' | 'contact' | 'cookies'
  >;
  requiresHumanApproval: boolean;
  legalEscalationReason?: string;
  lastLegalDecision?: LegalDecision;
}

export function newBundle(input: {
  tenantId: string;
  storeId: string;
  runId: string;
  objective: string;
  executionScope: 'global' | 'tenant' | 'store';
  executionMode: ExecutionMode;
  jurisdictions: Jurisdiction[];
  plannedRoute: ReadonlyArray<{ agent: string; purpose: string }>;
}): OrchestrationBundle {
  return {
    tenantId: input.tenantId,
    storeId: input.storeId,
    runId: input.runId,
    objective: input.objective,
    executionScope: input.executionScope,
    executionMode: input.executionMode,
    stage: 0,
    status: 'queued',
    plannedRoute: input.plannedRoute,
    artifacts: [],
    findings: [],
    blockers: [],
    decisionTrail: [],
    confidence: 1.0,
    jurisdictions: input.jurisdictions,
    legalRiskLevel: 'none',
    legalFindings: [],
    requiredPolicies: [],
    requiresHumanApproval: false,
  };
}

/** Avança o bundle para o próximo step (idempotente). */
export function advanceStage(
  bundle: OrchestrationBundle,
  decision: Omit<DecisionTrailEntry, 'stage' | 'at'>,
): OrchestrationBundle {
  return {
    ...bundle,
    stage: bundle.stage + 1,
    status: 'running',
    decisionTrail: [
      ...bundle.decisionTrail,
      { ...decision, stage: bundle.stage, at: new Date().toISOString() },
    ],
  };
}

/** Marca o bundle como bloqueado. */
export function blockBundle(
  bundle: OrchestrationBundle,
  blocker: Blocker,
  status: StageStatus = 'blocked_external',
): OrchestrationBundle {
  return {
    ...bundle,
    status,
    blockers: [...bundle.blockers, blocker],
  };
}
