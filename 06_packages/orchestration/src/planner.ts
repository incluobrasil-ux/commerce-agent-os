// Planner — converte intent NL + escopo em um plano de execução concreto.
//
// Estratégia:
// 1. Classifica intent (rule-based, sem LLM).
// 2. Casa com um playbook oficial.
// 3. Filtra steps por credenciais disponíveis.
// 4. Aplica policy (forçar dry-run, escalonar governance, etc).
// 5. Devolve um plano + bundle inicial.

import type { ExecutionMode, OrchestrationBundle } from './bundle.js';
import { newBundle } from './bundle.js';
import type { Jurisdiction, StoreLegalProfile } from './legal.js';
import { evaluateOperation } from './legal.js';
import type { Playbook } from './playbooks.js';
import { PLAYBOOKS, getPlaybook } from './playbooks.js';
import { selectRouteLength, shouldEscalateGovernance } from './policy.js';
import { getAgent } from './registry.js';

export type IntentCategory =
  | 'audit'
  | 'catalog_merchant'
  | 'offer'
  | 'marketing'
  | 'creative'
  | 'design_ux'
  | 'governance'
  | 'cross_store'
  | 'writeback'
  | 'general';

const INTENT_KEYWORDS: Record<IntentCategory, RegExp> = {
  audit: /\b(audit|auditar|auditoria|diagnostic|diagnostico|sanity|healthcheck|readiness)\b/i,
  catalog_merchant: /\b(catalog|merchant|gmc|feed|sku|catálogo|produto)\b/i,
  offer: /\b(offer|preço|pricing|bundle|posicionamento|oferta)\b/i,
  marketing: /\b(marketing|plano|campanha|horizonte|kpi)\b/i,
  creative: /\b(creative|copy|criativo|variantes|hook)\b/i,
  design_ux: /\b(design|ux|pdp|localização|locale|a11y|acessibilidade)\b/i,
  governance: /\b(governance|qa|revisão|review|approve|block|risco)\b/i,
  cross_store: /\b(cross-?store|multi-?loja|todas as lojas|comparar lojas)\b/i,
  writeback: /\b(writeback|aplicar|publicar|push|--apply|enviar)\b/i,
  general: /.*/,
};

/** Classifica intent baseado em keywords. Determinístico. */
export function classifyIntent(objective: string): IntentCategory {
  for (const [cat, regex] of Object.entries(INTENT_KEYWORDS) as Array<[IntentCategory, RegExp]>) {
    if (cat === 'general') continue;
    if (regex.test(objective)) return cat;
  }
  return 'general';
}

/** Casa intent com playbook default. */
export function pickPlaybook(intent: IntentCategory): Playbook | undefined {
  const mapping: Record<IntentCategory, string> = {
    audit: 'merchant-audit',
    catalog_merchant: 'merchant-audit',
    offer: 'offer-improvement',
    marketing: 'marketing-creative-chain',
    creative: 'marketing-creative-chain',
    design_ux: 'pdp-ux-review',
    governance: 'governance-review',
    cross_store: 'cross-store-diagnostic',
    writeback: 'safe-shopify-writeback',
    general: 'merchant-audit',
  };
  return getPlaybook(mapping[intent]);
}

export interface PlanInputs {
  tenantId: string;
  storeId?: string;
  objective: string;
  /** Override do playbook auto-selecionado. */
  playbookId?: string;
  /** Override do modo de execução. */
  executionMode?: ExecutionMode;
  jurisdictions: Jurisdiction[];
  /** Credenciais disponíveis. */
  hasAnthropicKey: boolean;
  hasShopifyToken: boolean;
  hasGoogleMerchantCreds: boolean;
  /** Perfil legal opcional (se já carregado). */
  legalProfile?: StoreLegalProfile;
}

export interface ExecutionPlan {
  intent: IntentCategory;
  playbook: Playbook;
  bundle: OrchestrationBundle;
  /** Steps efetivos depois de filtrar por credenciais e policy. */
  effectiveSteps: ReadonlyArray<{
    agent: string;
    purpose: string;
    willSkip: boolean;
    skipReason?: string;
  }>;
  warnings: string[];
}

/**
 * Monta plano completo a partir do objetivo. Pode rebaixar modo (writeback ->
 * dry-run se faltar credencial). Nunca emite mutação aqui — só plano.
 */
export function planRun(inputs: PlanInputs): ExecutionPlan {
  const intent = classifyIntent(inputs.objective);
  const playbook = inputs.playbookId ? getPlaybook(inputs.playbookId) : pickPlaybook(intent);
  if (!playbook) {
    throw new Error(
      `Playbook não encontrado para intent=${intent} playbookId=${inputs.playbookId ?? '(auto)'}`,
    );
  }

  const warnings: string[] = [];

  // Define modo efetivo (override > playbook default).
  // Playbook defaults podem usar tipos do registry (planning/validation); rebaixamos para bundle modes.
  const pbDefault = playbook.defaultExecutionMode as string;
  let executionMode: ExecutionMode =
    inputs.executionMode ??
    (pbDefault === 'planning' || pbDefault === 'validation'
      ? 'dry-run'
      : (pbDefault as ExecutionMode));

  // Define escopo.
  const executionScope: 'global' | 'tenant' | 'store' = inputs.storeId
    ? 'store'
    : intent === 'cross_store'
      ? 'tenant'
      : 'tenant';

  // Writeback exige store; rebaixar se ausente.
  if (executionMode === 'writeback' && !inputs.storeId) {
    warnings.push('Writeback exige storeId; rebaixado para dry-run.');
    executionMode = 'dry-run';
  }
  if (executionMode === 'writeback' && !inputs.hasShopifyToken) {
    warnings.push('SHOPIFY_ADMIN_TOKEN ausente; rebaixado para dry-run.');
    executionMode = 'dry-run';
  }

  // Bundle inicial.
  const bundle = newBundle({
    tenantId: inputs.tenantId,
    storeId: inputs.storeId ?? '_no-store_',
    runId: `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    objective: inputs.objective,
    executionScope,
    executionMode,
    jurisdictions: inputs.jurisdictions,
    plannedRoute: playbook.steps.map((s) => ({ agent: s.agent, purpose: s.purpose })),
  });

  // Camada legal: se há perfil + writeback/dry-run em conteúdo sensível, avalia.
  if (
    inputs.legalProfile &&
    (executionMode === 'writeback' ||
      playbook.id === 'pdp-ux-review' ||
      playbook.id === 'safe-shopify-writeback')
  ) {
    const evaluation = evaluateOperation(inputs.legalProfile, 'pdp_update', inputs.objective);
    bundle.legalFindings = evaluation.findings;
    bundle.requiresHumanApproval = evaluation.requiresHumanApproval;
    bundle.lastLegalDecision = evaluation.decision;
    if (evaluation.escalationReason) bundle.legalEscalationReason = evaluation.escalationReason;
    bundle.legalRiskLevel = evaluation.findings.some((f) => f.severity === 'hard')
      ? 'high'
      : evaluation.findings.length > 0
        ? 'medium'
        : 'none';
    if (evaluation.decision !== 'allowed' && evaluation.decision !== 'allowed_with_warnings') {
      warnings.push(
        `Camada jurídica: ${evaluation.decision} (${evaluation.escalationReason ?? 'sem razão'}).`,
      );
    }
  }

  // Escalonar governance se policy mandar.
  if (
    shouldEscalateGovernance(bundle) &&
    !playbook.steps.some((s) => s.agent === 'governance-risk-qa')
  ) {
    warnings.push('Policy escalou para governance-risk-qa — adicionado ao final da rota.');
  }

  // Filtrar steps por credenciais.
  const effectiveSteps = playbook.steps.map((step) => {
    const agent = getAgent(step.agent);
    if (!agent) {
      return {
        agent: step.agent,
        purpose: step.purpose,
        willSkip: true,
        skipReason: 'agent_not_in_registry',
      };
    }
    if (agent.credentials.includes('anthropic') && !inputs.hasAnthropicKey) {
      return {
        agent: step.agent,
        purpose: step.purpose,
        willSkip: true,
        skipReason: 'missing_credential:anthropic',
      };
    }
    if (agent.credentials.includes('shopify-admin') && !inputs.hasShopifyToken) {
      return {
        agent: step.agent,
        purpose: step.purpose,
        willSkip: true,
        skipReason: 'missing_credential:shopify-admin',
      };
    }
    if (agent.credentials.includes('google-merchant') && !inputs.hasGoogleMerchantCreds) {
      return {
        agent: step.agent,
        purpose: step.purpose,
        willSkip: true,
        skipReason: 'missing_credential:google-merchant',
      };
    }
    return { agent: step.agent, purpose: step.purpose, willSkip: false };
  });

  // Route length warning.
  if (selectRouteLength(bundle) === 'full' && effectiveSteps.length < 3) {
    warnings.push(
      'Policy sugere rota completa (full) mas playbook tem <3 steps. Verifique escopo.',
    );
  }

  return { intent, playbook, bundle, effectiveSteps, warnings };
}
