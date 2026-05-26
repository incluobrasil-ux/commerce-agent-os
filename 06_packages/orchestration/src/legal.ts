// Camada jurídico-operacional internacional para BR / EU / US.
//
// IMPORTANTE: esta camada NÃO substitui parecer jurídico humano. Ela serve
// para que o Chefe não execute fluxos sensíveis cegamente. Sinaliza risco,
// exige presença de páginas/políticas mínimas e classifica decisões em
// allowed/blocked. Nada mais.
//
// Princípios:
// 1. Conservadora por padrão (negar quando incerto).
// 2. Reaproveita merchant-compliance + governance-risk-qa quando disponível.
// 3. Determinística — sem LLM neste módulo.

export type Jurisdiction = 'BR' | 'EU' | 'US-CA' | 'US-FED';

export type LegalRiskType =
  | 'privacy_risk'
  | 'consent_risk'
  | 'consumer_rights_risk'
  | 'claims_risk'
  | 'review_endorsement_risk'
  | 'deceptive_design_risk'
  | 'merchant_trust_risk'
  | 'cross_border_risk'
  | 'legal_review_required';

export type LegalDecision =
  | 'allowed'
  | 'allowed_with_warnings'
  | 'blocked_pending_legal_review'
  | 'blocked_missing_policy'
  | 'blocked_missing_market_profile';

export interface LegalRiskFinding {
  type: LegalRiskType;
  jurisdiction: Jurisdiction;
  /** Severidade operacional: hard bloqueia, soft alerta. */
  severity: 'hard' | 'soft';
  /** ID curto da regra (ex.: BR-LGPD-PRIVACY-PAGE). */
  ruleId: string;
  /** Texto explicativo curto. */
  message: string;
  /** Sugestão de remediação concreta. */
  remediation: string;
}

/**
 * Perfil legal/mercado de uma loja. Declarado por tenant/store no vault em
 * `tenants/<t>/stores/<s>/legal-profile.json` (não-versionado — local-only).
 */
export interface StoreLegalProfile {
  storeId: string;
  tenantId: string;
  /** Países/regiões onde a loja opera ativamente. */
  jurisdictions: Jurisdiction[];
  /** Idioma principal (ISO-639-1, ex.: 'pt-BR', 'en-US', 'de-DE'). */
  primaryLocale: string;
  /** Moeda principal (ISO-4217). */
  primaryCurrency: string;
  /** Maturidade jurídica: o quanto a loja já tem cobertura legal. */
  maturityLevel: 'starter' | 'intermediate' | 'mature';
  /** Páginas/políticas que a loja possui (URLs ou ids). */
  existingPolicies: ReadonlyArray<{
    type: 'privacy' | 'terms' | 'refund' | 'returns' | 'shipping' | 'contact' | 'about' | 'cookies';
    url: string;
  }>;
  /** Regime de consentimento em uso. */
  consentRegime?: 'opt-in-strict' | 'opt-out' | 'gpc-aware' | 'none';
  /** Se a loja autoriza writeback automático em conteúdo sensível. */
  allowsSensitiveWriteback: boolean;
  /** Empresa responsável (CNPJ/EIN/VAT, endereço, contato). */
  companyIdentity?: {
    legalName: string;
    registrationId: string; // CNPJ, EIN, VAT EU, etc.
    address: string;
    contactEmail: string;
    contactPhone?: string;
  };
}

/**
 * Tipo de operação sendo planejada — usado pelo Chefe para consultar a
 * regulatory matrix antes de executar.
 */
export type OperationType =
  | 'product_description_update'
  | 'pdp_update'
  | 'claims_creation' // novo claim de marketing
  | 'review_publication'
  | 'price_update'
  | 'subscription_or_trial_setup'
  | 'privacy_policy_update'
  | 'cookie_banner_update'
  | 'campaign_launch'
  | 'cross_border_expansion'
  | 'data_export_or_deletion';

/**
 * Matrix regulatória mínima por mercado. Cada regra é uma função pura que
 * recebe perfil + operação e devolve findings.
 */
interface RegulatoryRule {
  ruleId: string;
  jurisdiction: Jurisdiction;
  appliesTo: ReadonlyArray<OperationType | '*'>;
  evaluate: (
    profile: StoreLegalProfile,
    operation: OperationType,
    payload?: unknown,
  ) => LegalRiskFinding | null;
}

const RULES: readonly RegulatoryRule[] = [
  // ===== BR — LGPD + CDC + CONAR =====
  {
    ruleId: 'BR-LGPD-PRIVACY-PAGE',
    jurisdiction: 'BR',
    appliesTo: [
      'privacy_policy_update',
      'pdp_update',
      'campaign_launch',
      'data_export_or_deletion',
    ],
    evaluate: (profile) => {
      if (!profile.jurisdictions.includes('BR')) return null;
      const hasPrivacy = profile.existingPolicies.some((p) => p.type === 'privacy');
      if (hasPrivacy) return null;
      return {
        type: 'privacy_risk',
        jurisdiction: 'BR',
        severity: 'hard',
        ruleId: 'BR-LGPD-PRIVACY-PAGE',
        message: 'Loja opera no Brasil sem Política de Privacidade publicada — LGPD Art. 9º exige.',
        remediation:
          'Publicar política de privacidade no domínio próprio (não apenas em /checkout) cobrindo bases legais, finalidades, direitos do titular, contato do encarregado.',
      };
    },
  },
  {
    ruleId: 'BR-CDC-COMPANY-IDENTITY',
    jurisdiction: 'BR',
    appliesTo: ['pdp_update', '*'],
    evaluate: (profile) => {
      if (!profile.jurisdictions.includes('BR')) return null;
      const ok = profile.companyIdentity && profile.companyIdentity.registrationId.length > 0;
      if (ok) return null;
      return {
        type: 'merchant_trust_risk',
        jurisdiction: 'BR',
        severity: 'hard',
        ruleId: 'BR-CDC-COMPANY-IDENTITY',
        message:
          'CNPJ/razão social/endereço não declarados — CDC Art. 31 exige identificação clara do fornecedor.',
        remediation:
          'Preencher companyIdentity no perfil legal (legalName, CNPJ, address, contactEmail).',
      };
    },
  },
  {
    ruleId: 'BR-CDC-RETURNS-7-DAYS',
    jurisdiction: 'BR',
    appliesTo: ['pdp_update', 'campaign_launch'],
    evaluate: (profile) => {
      if (!profile.jurisdictions.includes('BR')) return null;
      const hasReturns = profile.existingPolicies.some(
        (p) => p.type === 'refund' || p.type === 'returns',
      );
      if (hasReturns) return null;
      return {
        type: 'consumer_rights_risk',
        jurisdiction: 'BR',
        severity: 'hard',
        ruleId: 'BR-CDC-RETURNS-7-DAYS',
        message:
          'Política de devolução ausente — CDC Art. 49 garante direito de arrependimento em 7 dias para compras online.',
        remediation:
          'Publicar política de devolução cobrindo prazo 7 dias + condições + custo do frete reverso.',
      };
    },
  },
  {
    ruleId: 'BR-CONAR-CLAIMS-MEDICAL',
    jurisdiction: 'BR',
    appliesTo: ['claims_creation', 'pdp_update'],
    evaluate: (_profile, _op, payload) => {
      const text = typeof payload === 'string' ? payload.toLowerCase() : '';
      if (!text) return null;
      const medicalKeywords = [
        'cura',
        'trata',
        'tdah',
        'autismo',
        'tea',
        'depressão',
        'ansiedade',
        'terapêutico',
        'autorregulação sensorial',
      ];
      const hit = medicalKeywords.find((kw) => text.includes(kw));
      if (!hit) return null;
      return {
        type: 'claims_risk',
        jurisdiction: 'BR',
        severity: 'hard',
        ruleId: 'BR-CONAR-CLAIMS-MEDICAL',
        message: `Claim "${hit}" pode ser interpretado como alegação terapêutica — ANVISA RDC 204/2017 + CDC Art. 37 + CONAR + Lei 12.764/2012 (Berenice Piana se TEA).`,
        remediation:
          'Substituir por linguagem comercial/lúdica. Para manter associação clínica: registrar produto na ANVISA + obter parecer jurídico-sanitário.',
      };
    },
  },
  // ===== EU — GDPR + Consumer Rights Directive =====
  {
    ruleId: 'EU-GDPR-PRIVACY-PAGE',
    jurisdiction: 'EU',
    appliesTo: ['privacy_policy_update', 'pdp_update', 'cookie_banner_update', '*'],
    evaluate: (profile) => {
      if (!profile.jurisdictions.includes('EU')) return null;
      const hasPrivacy = profile.existingPolicies.some((p) => p.type === 'privacy');
      if (hasPrivacy) return null;
      return {
        type: 'privacy_risk',
        jurisdiction: 'EU',
        severity: 'hard',
        ruleId: 'EU-GDPR-PRIVACY-PAGE',
        message:
          'Operação na UE sem privacy policy — GDPR Art. 13/14 exige transparência sobre coleta.',
        remediation:
          'Publicar privacy policy cobrindo data controller, base legal (Art. 6), direitos do titular, prazo de retenção, DPO contact.',
      };
    },
  },
  {
    ruleId: 'EU-GDPR-CONSENT-COOKIES',
    jurisdiction: 'EU',
    appliesTo: ['cookie_banner_update', 'campaign_launch'],
    evaluate: (profile) => {
      if (!profile.jurisdictions.includes('EU')) return null;
      if (profile.consentRegime === 'opt-in-strict' || profile.consentRegime === 'gpc-aware')
        return null;
      return {
        type: 'consent_risk',
        jurisdiction: 'EU',
        severity: 'hard',
        ruleId: 'EU-GDPR-CONSENT-COOKIES',
        message:
          'Operação na UE sem consentimento opt-in estrito — GDPR + ePrivacy exigem opt-in explícito para cookies não-essenciais.',
        remediation:
          'Implementar consent banner com opt-in granular (não pré-marcado). Marcar consentRegime: opt-in-strict.',
      };
    },
  },
  {
    ruleId: 'EU-CRD-RIGHT-OF-WITHDRAWAL-14-DAYS',
    jurisdiction: 'EU',
    appliesTo: ['pdp_update', 'campaign_launch'],
    evaluate: (profile) => {
      if (!profile.jurisdictions.includes('EU')) return null;
      const hasReturns = profile.existingPolicies.some(
        (p) => p.type === 'refund' || p.type === 'returns',
      );
      if (hasReturns) return null;
      return {
        type: 'consumer_rights_risk',
        jurisdiction: 'EU',
        severity: 'hard',
        ruleId: 'EU-CRD-RIGHT-OF-WITHDRAWAL-14-DAYS',
        message:
          'Sem política de devolução visível — Consumer Rights Directive (2011/83/EU) garante 14 dias de withdrawal sem motivo.',
        remediation:
          'Publicar política de returns/refund cobrindo prazo 14 dias + formulário modelo + custo do frete reverso.',
      };
    },
  },
  {
    ruleId: 'EU-OMNIBUS-PRICE-DISCLOSURE',
    jurisdiction: 'EU',
    appliesTo: ['price_update', 'campaign_launch'],
    evaluate: (profile) => {
      if (!profile.jurisdictions.includes('EU')) return null;
      // soft warning para preço com desconto/comparativo
      return {
        type: 'deceptive_design_risk',
        jurisdiction: 'EU',
        severity: 'soft',
        ruleId: 'EU-OMNIBUS-PRICE-DISCLOSURE',
        message:
          'Lembre: Omnibus Directive exige mostrar menor preço dos últimos 30 dias quando anunciar desconto.',
        remediation:
          'Quando publicar `compareAtPrice`, verifique se o valor reflete menor preço dos últimos 30 dias.',
      };
    },
  },
  // ===== US — FTC + CCPA/CPRA (CA) =====
  {
    ruleId: 'US-FTC-CLAIMS-SUBSTANTIATION',
    jurisdiction: 'US-FED',
    appliesTo: ['claims_creation', 'pdp_update'],
    evaluate: (_profile, _op, payload) => {
      const text = typeof payload === 'string' ? payload.toLowerCase() : '';
      if (!text) return null;
      const triggers = [
        'guaranteed',
        'cure',
        '100%',
        'best in the world',
        'clinically proven',
        'doctor recommended',
        'risk-free',
      ];
      const hit = triggers.find((kw) => text.includes(kw));
      if (!hit) return null;
      return {
        type: 'claims_risk',
        jurisdiction: 'US-FED',
        severity: 'hard',
        ruleId: 'US-FTC-CLAIMS-SUBSTANTIATION',
        message: `Claim "${hit}" exige substantiation sob FTC Truth-in-Advertising (15 U.S.C. §§ 45, 52).`,
        remediation:
          'Remover claim ou anexar evidência científica/registry/dado mensurável. FTC pode exigir cessation order.',
      };
    },
  },
  {
    ruleId: 'US-FTC-ENDORSEMENT-DISCLOSURE',
    jurisdiction: 'US-FED',
    appliesTo: ['review_publication', 'campaign_launch'],
    evaluate: (_profile) => {
      return {
        type: 'review_endorsement_risk',
        jurisdiction: 'US-FED',
        severity: 'soft',
        ruleId: 'US-FTC-ENDORSEMENT-DISCLOSURE',
        message:
          'Reviews/endossos pagos ou incentivados exigem disclosure clara (FTC Endorsement Guides 16 CFR 255 atualizado 2023).',
        remediation:
          'Marcar "#ad", "sponsored", ou disclosure equivalente em qualquer endosso com material connection.',
      };
    },
  },
  {
    ruleId: 'US-CCPA-NOTICE-AT-COLLECTION',
    jurisdiction: 'US-CA',
    appliesTo: ['privacy_policy_update', 'pdp_update', '*'],
    evaluate: (profile) => {
      if (!profile.jurisdictions.includes('US-CA')) return null;
      const hasPrivacy = profile.existingPolicies.some((p) => p.type === 'privacy');
      if (!hasPrivacy) {
        return {
          type: 'privacy_risk',
          jurisdiction: 'US-CA',
          severity: 'hard',
          ruleId: 'US-CCPA-NOTICE-AT-COLLECTION',
          message:
            'Loja serve Califórnia sem privacy policy — CCPA/CPRA exigem Notice at Collection.',
          remediation:
            'Publicar privacy policy com seções específicas: categorias de PI coletadas, finalidades, sale/share, opt-out link "Do Not Sell or Share My Personal Information".',
        };
      }
      return null;
    },
  },
  {
    ruleId: 'US-CCPA-OPT-OUT-LINK',
    jurisdiction: 'US-CA',
    appliesTo: ['privacy_policy_update', 'cookie_banner_update'],
    evaluate: (profile) => {
      if (!profile.jurisdictions.includes('US-CA')) return null;
      if (profile.consentRegime === 'gpc-aware' || profile.consentRegime === 'opt-out') return null;
      return {
        type: 'consent_risk',
        jurisdiction: 'US-CA',
        severity: 'hard',
        ruleId: 'US-CCPA-OPT-OUT-LINK',
        message:
          'CCPA/CPRA exigem link "Do Not Sell or Share My Personal Information" + reconhecer Global Privacy Control (GPC).',
        remediation: 'Adicionar link no footer + respeitar GPC. Marcar consentRegime: gpc-aware.',
      };
    },
  },
];

/**
 * Avalia uma operação contra a matrix regulatória. Retorna findings agregados
 * + decisão final (allowed/blocked).
 */
export interface LegalEvaluation {
  decision: LegalDecision;
  findings: LegalRiskFinding[];
  jurisdictionsConsidered: Jurisdiction[];
  requiresHumanApproval: boolean;
  escalationReason?: string;
}

export function evaluateOperation(
  profile: StoreLegalProfile,
  operation: OperationType,
  payload?: unknown,
): LegalEvaluation {
  if (profile.jurisdictions.length === 0) {
    return {
      decision: 'blocked_missing_market_profile',
      findings: [],
      jurisdictionsConsidered: [],
      requiresHumanApproval: true,
      escalationReason: 'Store legal profile has empty jurisdictions[].',
    };
  }

  const findings: LegalRiskFinding[] = [];
  for (const rule of RULES) {
    if (!profile.jurisdictions.includes(rule.jurisdiction)) continue;
    if (!rule.appliesTo.includes(operation) && !rule.appliesTo.includes('*')) continue;
    const finding = rule.evaluate(profile, operation, payload);
    if (finding) findings.push(finding);
  }

  const hardBlocks = findings.filter((f) => f.severity === 'hard');
  const missingPolicy = hardBlocks.find(
    (f) => f.type === 'privacy_risk' || f.type === 'consumer_rights_risk',
  );

  let decision: LegalDecision;
  if (missingPolicy) {
    decision = 'blocked_missing_policy';
  } else if (hardBlocks.length > 0) {
    decision = 'blocked_pending_legal_review';
  } else if (findings.length > 0) {
    decision = 'allowed_with_warnings';
  } else {
    decision = 'allowed';
  }

  const requiresHumanApproval = hardBlocks.length > 0;
  const result: LegalEvaluation = {
    decision,
    findings,
    jurisdictionsConsidered: [...profile.jurisdictions],
    requiresHumanApproval,
  };
  if (hardBlocks[0]) {
    result.escalationReason = `${hardBlocks.length} hard block(s); first: ${hardBlocks[0].ruleId}`;
  }
  return result;
}

/** Default profile factory para tenants novos (starter, conservador). */
export function defaultLegalProfile(input: {
  tenantId: string;
  storeId: string;
  jurisdictions: Jurisdiction[];
  primaryLocale: string;
  primaryCurrency: string;
}): StoreLegalProfile {
  return {
    storeId: input.storeId,
    tenantId: input.tenantId,
    jurisdictions: input.jurisdictions,
    primaryLocale: input.primaryLocale,
    primaryCurrency: input.primaryCurrency,
    maturityLevel: 'starter',
    existingPolicies: [],
    allowsSensitiveWriteback: false,
  };
}
