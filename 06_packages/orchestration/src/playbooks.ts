// Playbooks oficiais — rotas pré-definidas que o Chefe reutiliza.
//
// Cada playbook declara: objetivo, agentes, ordem, pré-requisitos, critérios
// de parada, saídas esperadas e gates (credenciais / aprovação humana /
// jurisdição). O planner casa a intent do operador com um destes playbooks.
//
// Adicionar playbook = adicionar entry aqui. Sem mágica, sem reflection.

import type { ExecutionMode } from './bundle.js';
import type { Jurisdiction } from './legal.js';

export interface PlaybookStep {
  agent: string;
  purpose: string;
  /** Se este step pode ser SKIPPED sem matar o run. */
  optional?: boolean;
  /** Modo de execução para este step específico (override do bundle). */
  modeOverride?: ExecutionMode;
}

export interface Playbook {
  id: string;
  name: string;
  objective: string;
  steps: PlaybookStep[];
  /** Agentes ou condições obrigatórias antes do playbook rodar. */
  prerequisites: string[];
  /** Critérios para encerrar o run cedo. */
  stopCriteria: string[];
  /** Outputs esperados ao final. */
  expectedOutputs: string[];
  /** Credenciais que destravam steps específicos (mas não bloqueiam playbook). */
  credentialsHelpful: ReadonlyArray<'anthropic' | 'shopify-admin' | 'google-merchant'>;
  /** Se o playbook exige aprovação humana em algum step. */
  requiresHumanApproval: boolean;
  /** Jurisdições suportadas. '*' = qualquer. */
  supportedJurisdictions: ReadonlyArray<Jurisdiction | '*'>;
  /** Riscos jurídicos relevantes a flagrar antes do playbook. */
  relevantLegalRisks: ReadonlyArray<
    | 'privacy_risk'
    | 'consent_risk'
    | 'consumer_rights_risk'
    | 'claims_risk'
    | 'review_endorsement_risk'
    | 'deceptive_design_risk'
    | 'merchant_trust_risk'
    | 'cross_border_risk'
  >;
  /** Páginas/políticas mínimas exigidas pelo playbook. */
  requiredPolicies: ReadonlyArray<
    'privacy' | 'terms' | 'refund' | 'returns' | 'shipping' | 'contact'
  >;
  /** Se este playbook PODE rodar em modo audit-only sem aplicar nada. */
  canAuditOnly: boolean;
  /** Default execution mode. */
  defaultExecutionMode: ExecutionMode;
}

export const PLAYBOOKS: readonly Playbook[] = [
  // 1. Merchant audit / catalog quality
  {
    id: 'merchant-audit',
    name: 'Merchant audit / catalog quality',
    objective:
      'Auditar catálogo de uma store contra políticas Google Merchant e gerar relatório com findings.',
    steps: [
      {
        agent: 'catalog-feed-ops',
        purpose: 'Scorer determinístico por SKU com findings classificados.',
      },
      {
        agent: 'merchant-compliance',
        purpose: 'Validação semântica de conteúdo sensível.',
        optional: true,
      },
      {
        agent: 'audit-synthesizer',
        purpose: 'Consolida findings em síntese executiva.',
        optional: true,
      },
    ],
    prerequisites: ['fixture ou shopify snapshot disponível'],
    stopCriteria: ['scorer green ≥80', 'sem critical/high findings'],
    expectedOutputs: ['12_reports/merchant-audits/<tenant>/<file>.md', 'vault run-summary'],
    credentialsHelpful: ['anthropic'],
    requiresHumanApproval: false,
    supportedJurisdictions: ['*'],
    relevantLegalRisks: ['claims_risk', 'deceptive_design_risk'],
    requiredPolicies: [],
    canAuditOnly: true,
    defaultExecutionMode: 'read-only',
  },
  // 2. Offer improvement
  {
    id: 'offer-improvement',
    name: 'Offer improvement',
    objective: 'Otimizar preço/bundle/posicionamento de um SKU ou coleção.',
    steps: [
      {
        agent: 'memory-context',
        purpose: 'Carrega contexto da loja e do produto.',
        optional: true,
      },
      { agent: 'market-intelligence', purpose: 'Sinais de mercado/tendências.', optional: true },
      { agent: 'competitor-benchmark', purpose: 'Snapshot de competidores.', optional: true },
      { agent: 'product-offer', purpose: 'Define oferta + justificativa.' },
      { agent: 'governance-risk-qa', purpose: 'Aprova/revisa antes de publicar.', optional: true },
    ],
    prerequisites: ['SKU ou coleção identificado'],
    stopCriteria: ['oferta aprovada por governance'],
    expectedOutputs: ['vault offer artifact', 'pricing decision'],
    credentialsHelpful: ['anthropic'],
    requiresHumanApproval: true,
    supportedJurisdictions: ['*'],
    relevantLegalRisks: ['deceptive_design_risk', 'consumer_rights_risk'],
    requiredPolicies: [],
    canAuditOnly: true,
    defaultExecutionMode: 'planning' as ExecutionMode,
  },
  // 3. Marketing + creative chain
  {
    id: 'marketing-creative-chain',
    name: 'Marketing + creative chain',
    objective: 'Planejar campanha + gerar variantes de criativo + plano de mídia.',
    steps: [
      { agent: 'memory-context', purpose: 'Brief da loja e voz.', optional: true },
      { agent: 'marketing-director', purpose: 'Plano de horizonte com iniciativas + budget.' },
      { agent: 'creative-copy-assets', purpose: '4–8 variantes de copy/criativo.' },
      {
        agent: 'design-ux-localization',
        purpose: 'Adaptação visual e localização.',
        optional: true,
      },
      { agent: 'traffic-campaigns', purpose: 'Estrutura de mídia/audiences.', optional: true },
      { agent: 'governance-risk-qa', purpose: 'Aprova claims e disclosures.' },
    ],
    prerequisites: ['horizonte e objetivo declarados'],
    stopCriteria: ['plano aprovado'],
    expectedOutputs: ['marketing plan', 'creative variants', 'traffic plan'],
    credentialsHelpful: ['anthropic'],
    requiresHumanApproval: true,
    supportedJurisdictions: ['*'],
    relevantLegalRisks: ['claims_risk', 'review_endorsement_risk', 'deceptive_design_risk'],
    requiredPolicies: [],
    canAuditOnly: true,
    defaultExecutionMode: 'planning' as ExecutionMode,
  },
  // 4. PDP / UX / localization review
  {
    id: 'pdp-ux-review',
    name: 'PDP / UX / localization review',
    objective: 'Revisar PDP em uma jurisdição: UX + claims + localização + compliance.',
    steps: [
      { agent: 'memory-context', purpose: 'Carrega contexto.', optional: true },
      { agent: 'design-ux-localization', purpose: 'Brief de UX/localização.' },
      { agent: 'merchant-compliance', purpose: 'Análise jurídico-comercial.' },
      { agent: 'governance-risk-qa', purpose: 'Decisão approve/revise/block.' },
    ],
    prerequisites: ['PDP/SKU identificado', 'jurisdição definida'],
    stopCriteria: ['decisão de governance final'],
    expectedOutputs: ['design brief', 'compliance review', 'governance decision'],
    credentialsHelpful: ['anthropic'],
    requiresHumanApproval: true,
    supportedJurisdictions: ['BR', 'EU', 'US-CA', 'US-FED'],
    relevantLegalRisks: ['claims_risk', 'consumer_rights_risk', 'privacy_risk'],
    requiredPolicies: ['privacy'],
    canAuditOnly: true,
    defaultExecutionMode: 'dry-run',
  },
  // 5. Governance review (standalone)
  {
    id: 'governance-review',
    name: 'Governance review',
    objective: 'Submeter um artifact existente ao gate de qualidade.',
    steps: [{ agent: 'governance-risk-qa', purpose: 'approve|revise|block com reasons.' }],
    prerequisites: ['artifact existente no vault'],
    stopCriteria: ['decisão emitida'],
    expectedOutputs: ['governance decision', 'reasons + suggested_revisions'],
    credentialsHelpful: ['anthropic'],
    requiresHumanApproval: false,
    supportedJurisdictions: ['*'],
    relevantLegalRisks: ['claims_risk', 'consent_risk', 'privacy_risk'],
    requiredPolicies: [],
    canAuditOnly: true,
    defaultExecutionMode: 'validation' as ExecutionMode,
  },
  // 6. Store readiness check
  {
    id: 'store-readiness',
    name: 'Store readiness check',
    objective: 'Verifica se a store está pronta para campanha/Merchant Center/jurisdição.',
    steps: [
      { agent: 'repo-auditor', purpose: 'Sanity check de configurações.', optional: true },
      { agent: 'catalog-feed-ops', purpose: 'Audit determinístico do catálogo.' },
      { agent: 'merchant-compliance', purpose: 'Verifica conteúdo sensível.', optional: true },
      { agent: 'audit-synthesizer', purpose: 'Sumário executivo readiness.', optional: true },
    ],
    prerequisites: ['store legal profile declarado'],
    stopCriteria: ['readiness score ≥80'],
    expectedOutputs: ['readiness report', 'blockers list'],
    credentialsHelpful: ['anthropic'],
    requiresHumanApproval: false,
    supportedJurisdictions: ['BR', 'EU', 'US-CA', 'US-FED'],
    relevantLegalRisks: ['privacy_risk', 'consumer_rights_risk', 'merchant_trust_risk'],
    requiredPolicies: ['privacy', 'refund', 'contact'],
    canAuditOnly: true,
    defaultExecutionMode: 'read-only',
  },
  // 7. Cross-store diagnostic
  {
    id: 'cross-store-diagnostic',
    name: 'Cross-store diagnostic',
    objective: 'Rodar diagnóstico em N stores do mesmo tenant e comparar.',
    steps: [
      { agent: 'catalog-feed-ops', purpose: 'Audit por store.' },
      { agent: 'audit-synthesizer', purpose: 'Compara stores e ranqueia.' },
    ],
    prerequisites: ['lista de storeIds do tenant'],
    stopCriteria: ['comparativo gerado'],
    expectedOutputs: ['cross-store report'],
    credentialsHelpful: ['anthropic'],
    requiresHumanApproval: false,
    supportedJurisdictions: ['*'],
    relevantLegalRisks: ['cross_border_risk'],
    requiredPolicies: [],
    canAuditOnly: true,
    defaultExecutionMode: 'read-only',
  },
  // 8. Safe Shopify writeback flow
  {
    id: 'safe-shopify-writeback',
    name: 'Safe Shopify writeback flow',
    objective: 'Aplicar mudanças em uma store Shopify com gates de segurança.',
    steps: [
      {
        agent: 'memory-context',
        purpose: 'Contexto da store + escopo da mudança.',
        optional: true,
      },
      { agent: 'merchant-compliance', purpose: 'Valida conteúdo proposto.' },
      { agent: 'governance-risk-qa', purpose: 'Aprova mudança contra políticas.' },
      {
        agent: 'catalog-feed-ops',
        purpose: 'Dry-run do impacto no feed.',
        modeOverride: 'dry-run',
      },
    ],
    prerequisites: [
      'SHOPIFY_ADMIN_TOKEN disponível',
      'store legal profile declarado',
      'changeset definido',
    ],
    stopCriteria: ['governance approve + dry-run OK'],
    expectedOutputs: ['dry-run diff', 'governance approval', 'writeback audit log'],
    credentialsHelpful: ['shopify-admin', 'anthropic'],
    requiresHumanApproval: true,
    supportedJurisdictions: ['*'],
    relevantLegalRisks: [
      'privacy_risk',
      'claims_risk',
      'consumer_rights_risk',
      'review_endorsement_risk',
      'deceptive_design_risk',
    ],
    requiredPolicies: ['privacy', 'refund'],
    canAuditOnly: true,
    defaultExecutionMode: 'dry-run',
  },
];

/** Lookup por id. */
export function getPlaybook(id: string): Playbook | undefined {
  return PLAYBOOKS.find((p) => p.id === id);
}

/** Lista nomes para CLI/help. */
export function allPlaybookIds(): readonly string[] {
  return PLAYBOOKS.map((p) => p.id);
}
