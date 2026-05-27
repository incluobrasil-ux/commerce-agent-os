import { describe, expect, it } from 'vitest';
import {
  AGENT_REGISTRY,
  PLAYBOOKS,
  allAgentNames,
  classifyIntent,
  defaultLegalProfile,
  deterministicAgents,
  evaluateOperation,
  gateWriteback,
  getAgent,
  getPlaybook,
  newBundle,
  pickPlaybook,
  planRun,
  selectRouteLength,
  shouldEscalateGovernance,
  shouldStop,
  storeAwareAgents,
} from './index.js';

describe('registry', () => {
  it('lista todos agentes conhecidos', () => {
    expect(AGENT_REGISTRY.length).toBeGreaterThan(10);
    expect(allAgentNames()).toContain('orchestrator-master');
    expect(allAgentNames()).toContain('catalog-feed-ops');
  });

  it('getAgent retorna metadados completos', () => {
    const a = getAgent('catalog-feed-ops');
    expect(a).toBeDefined();
    expect(a?.kind).toBe('deterministic');
    expect(a?.executable).toBe('real');
  });

  it('deterministicAgents inclui catalog-feed-ops e repo-auditor', () => {
    const names = deterministicAgents().map((a) => a.name);
    expect(names).toContain('catalog-feed-ops');
    expect(names).toContain('repo-auditor');
  });

  it('storeAwareAgents inclui product-offer e exclui repo-auditor', () => {
    const names = storeAwareAgents().map((a) => a.name);
    expect(names).toContain('product-offer');
    expect(names).not.toContain('repo-auditor');
  });
});

describe('intent classification', () => {
  it('classifica audit', () => {
    expect(classifyIntent('quero auditar a loja')).toBe('audit');
    expect(classifyIntent('rodar auditoria de catálogo')).toBe('audit');
  });
  it('classifica writeback', () => {
    expect(classifyIntent('aplicar mudanças na loja')).toBe('writeback');
    expect(classifyIntent('publicar mudanças via writeback')).toBe('writeback');
  });
  it('classifica offer', () => {
    expect(classifyIntent('definir preço novo')).toBe('offer');
  });
  it('classifica cross_store', () => {
    expect(classifyIntent('comparar todas as lojas')).toBe('cross_store');
  });
});

describe('playbooks', () => {
  it('tem 8 playbooks oficiais', () => {
    expect(PLAYBOOKS.length).toBeGreaterThanOrEqual(8);
  });
  it('safe-shopify-writeback exige aprovação humana', () => {
    const pb = getPlaybook('safe-shopify-writeback');
    expect(pb?.requiresHumanApproval).toBe(true);
  });
  it('merchant-audit não exige aprovação humana', () => {
    const pb = getPlaybook('merchant-audit');
    expect(pb?.requiresHumanApproval).toBe(false);
    expect(pb?.canAuditOnly).toBe(true);
  });
});

describe('legal layer', () => {
  it('BR sem privacy policy bloqueia operação', () => {
    const profile = defaultLegalProfile({
      tenantId: 't',
      storeId: 's',
      jurisdictions: ['BR'],
      primaryLocale: 'pt-BR',
      primaryCurrency: 'BRL',
    });
    const r = evaluateOperation(profile, 'pdp_update');
    expect(r.decision).toBe('blocked_missing_policy');
    expect(r.findings.some((f) => f.ruleId === 'BR-LGPD-PRIVACY-PAGE')).toBe(true);
  });

  it('EU sem privacy bloqueia + sem consent banner alerta', () => {
    const profile = defaultLegalProfile({
      tenantId: 't',
      storeId: 's',
      jurisdictions: ['EU'],
      primaryLocale: 'de-DE',
      primaryCurrency: 'EUR',
    });
    const r = evaluateOperation(profile, 'campaign_launch');
    expect(r.decision).toBe('blocked_missing_policy');
    expect(r.findings.some((f) => f.ruleId === 'EU-GDPR-PRIVACY-PAGE')).toBe(true);
  });

  it('US-CA exige opt-out + Do Not Sell link', () => {
    const profile = defaultLegalProfile({
      tenantId: 't',
      storeId: 's',
      jurisdictions: ['US-CA'],
      primaryLocale: 'en-US',
      primaryCurrency: 'USD',
    });
    profile.existingPolicies = [{ type: 'privacy', url: 'https://x.com/p' }];
    const r = evaluateOperation(profile, 'privacy_policy_update');
    expect(r.findings.some((f) => f.ruleId === 'US-CCPA-OPT-OUT-LINK')).toBe(true);
  });

  it('BR claim com "TDAH" dispara hard finding', () => {
    const profile = {
      ...defaultLegalProfile({
        tenantId: 't',
        storeId: 's',
        jurisdictions: ['BR'],
        primaryLocale: 'pt-BR',
        primaryCurrency: 'BRL',
      }),
      existingPolicies: [
        { type: 'privacy' as const, url: 'x' },
        { type: 'refund' as const, url: 'x' },
      ],
      companyIdentity: {
        legalName: 'Acme',
        registrationId: '00.000.000/0001-00',
        address: 'rua x',
        contactEmail: 'a@b.c',
      },
    };
    const r = evaluateOperation(
      profile,
      'claims_creation',
      'novo produto que ajuda crianças com TDAH',
    );
    expect(r.findings.some((f) => f.ruleId === 'BR-CONAR-CLAIMS-MEDICAL')).toBe(true);
    expect(r.decision).toBe('blocked_pending_legal_review');
  });

  it('US-FED claim "guaranteed" exige substantiation', () => {
    const profile = defaultLegalProfile({
      tenantId: 't',
      storeId: 's',
      jurisdictions: ['US-FED'],
      primaryLocale: 'en-US',
      primaryCurrency: 'USD',
    });
    const r = evaluateOperation(profile, 'claims_creation', 'Results 100% guaranteed in 30 days');
    expect(r.findings.some((f) => f.ruleId === 'US-FTC-CLAIMS-SUBSTANTIATION')).toBe(true);
  });

  it('jurisdictions vazias = blocked_missing_market_profile', () => {
    const profile = defaultLegalProfile({
      tenantId: 't',
      storeId: 's',
      jurisdictions: [],
      primaryLocale: 'en',
      primaryCurrency: 'USD',
    });
    const r = evaluateOperation(profile, 'pdp_update');
    expect(r.decision).toBe('blocked_missing_market_profile');
  });
});

describe('planner', () => {
  it('planRun com audit gera plano merchant-audit', () => {
    const plan = planRun({
      tenantId: 'incluo',
      storeId: 'main',
      objective: 'auditar catálogo',
      jurisdictions: ['BR'],
      hasAnthropicKey: true,
      hasShopifyToken: false,
      hasGoogleMerchantCreds: false,
    });
    expect(plan.intent).toBe('audit');
    expect(plan.playbook.id).toBe('merchant-audit');
    expect(plan.bundle.tenantId).toBe('incluo');
    expect(plan.bundle.storeId).toBe('main');
    expect(plan.effectiveSteps.length).toBeGreaterThan(0);
  });

  it('writeback sem token rebaixa para dry-run', () => {
    const plan = planRun({
      tenantId: 'incluo',
      storeId: 'main',
      objective: 'aplicar fix de preço',
      executionMode: 'writeback',
      jurisdictions: ['BR'],
      hasAnthropicKey: true,
      hasShopifyToken: false,
      hasGoogleMerchantCreds: false,
    });
    expect(plan.bundle.executionMode).toBe('dry-run');
    expect(plan.warnings.some((w) => w.includes('SHOPIFY_ADMIN_TOKEN'))).toBe(true);
  });

  it('writeback sem store rebaixa para dry-run', () => {
    const plan = planRun({
      tenantId: 'incluo',
      objective: 'aplicar mudança',
      executionMode: 'writeback',
      jurisdictions: ['BR'],
      hasAnthropicKey: true,
      hasShopifyToken: true,
      hasGoogleMerchantCreds: false,
    });
    expect(plan.bundle.executionMode).toBe('dry-run');
    expect(plan.warnings.some((w) => w.includes('storeId'))).toBe(true);
  });

  it('agente que exige anthropic é marcado willSkip sem key', () => {
    const plan = planRun({
      tenantId: 't',
      storeId: 's',
      objective: 'audit',
      jurisdictions: ['BR'],
      hasAnthropicKey: false,
      hasShopifyToken: false,
      hasGoogleMerchantCreds: false,
    });
    const skip = plan.effectiveSteps.find((s) => s.willSkip);
    expect(skip).toBeDefined();
    expect(skip?.skipReason).toMatch(/anthropic/);
  });

  it('bundle.requiredPolicies recebe as do playbook', () => {
    // pdp-ux-review declara requiredPolicies: ['privacy']
    const plan = planRun({
      tenantId: 't',
      storeId: 's',
      objective: 'revisar pdp',
      playbookId: 'pdp-ux-review',
      jurisdictions: ['BR'],
      hasAnthropicKey: true,
      hasShopifyToken: false,
      hasGoogleMerchantCreds: false,
    });
    expect(plan.bundle.requiredPolicies).toContain('privacy');
  });
});

describe('policy', () => {
  it('shouldStop quando rota exaurida', () => {
    const bundle = newBundle({
      tenantId: 't',
      storeId: 's',
      runId: 'r1',
      objective: 'x',
      executionScope: 'store',
      executionMode: 'read-only',
      jurisdictions: ['BR'],
      plannedRoute: [{ agent: 'catalog-feed-ops', purpose: 'p' }],
    });
    bundle.stage = 1;
    expect(shouldStop(bundle).stop).toBe(true);
  });

  it('selectRouteLength=full quando writeback', () => {
    const bundle = newBundle({
      tenantId: 't',
      storeId: 's',
      runId: 'r1',
      objective: 'x',
      executionScope: 'store',
      executionMode: 'writeback',
      jurisdictions: ['BR'],
      plannedRoute: [],
    });
    expect(selectRouteLength(bundle)).toBe('full');
  });

  it('shouldEscalateGovernance true para writeback', () => {
    const bundle = newBundle({
      tenantId: 't',
      storeId: 's',
      runId: 'r1',
      objective: 'x',
      executionScope: 'store',
      executionMode: 'writeback',
      jurisdictions: ['BR'],
      plannedRoute: [],
    });
    expect(shouldEscalateGovernance(bundle)).toBe(true);
  });
});

describe('writeback gate', () => {
  const baseProfile = {
    storeId: 's',
    tenantId: 't',
    jurisdictions: ['BR'] as const,
    primaryLocale: 'pt-BR',
    primaryCurrency: 'BRL',
    maturityLevel: 'intermediate' as const,
    existingPolicies: [
      { type: 'privacy' as const, url: 'x' },
      { type: 'refund' as const, url: 'x' },
    ],
    allowsSensitiveWriteback: true,
    companyIdentity: {
      legalName: 'Acme',
      registrationId: '00.000.000/0001-00',
      address: 'rua x',
      contactEmail: 'a@b.c',
    },
  };
  const baseBundle = newBundle({
    tenantId: 't',
    storeId: 's',
    runId: 'r1',
    objective: 'x',
    executionScope: 'store',
    executionMode: 'writeback',
    jurisdictions: ['BR'],
    plannedRoute: [],
  });

  it('bloqueia sem shopify token', () => {
    const r = gateWriteback({
      bundle: baseBundle,
      legalProfile: { ...baseProfile, jurisdictions: [...baseProfile.jurisdictions] },
      operation: 'pdp_update',
      hasShopifyToken: false,
      humanApproved: true,
    });
    expect(r.allow).toBe(false);
    expect(r.effectiveMode).toBe('blocked');
  });

  it('bloqueia sem store scope', () => {
    const b = { ...baseBundle, executionScope: 'tenant' as const };
    const r = gateWriteback({
      bundle: b,
      legalProfile: { ...baseProfile, jurisdictions: [...baseProfile.jurisdictions] },
      operation: 'pdp_update',
      hasShopifyToken: true,
      humanApproved: true,
    });
    expect(r.allow).toBe(false);
  });

  it('permite com profile + token + approval', () => {
    const r = gateWriteback({
      bundle: baseBundle,
      legalProfile: { ...baseProfile, jurisdictions: [...baseProfile.jurisdictions] },
      operation: 'price_update',
      hasShopifyToken: true,
      humanApproved: true,
    });
    expect(r.allow).toBe(true);
    expect(r.effectiveMode).toBe('writeback');
  });

  it('degrada sensitive sem allow flag para dry-run', () => {
    const r = gateWriteback({
      bundle: baseBundle,
      legalProfile: {
        ...baseProfile,
        jurisdictions: [...baseProfile.jurisdictions],
        allowsSensitiveWriteback: false,
      },
      operation: 'claims_creation',
      payload: 'novo claim simples',
      hasShopifyToken: true,
      humanApproved: true,
    });
    expect(r.allow).toBe(false);
    expect(r.effectiveMode).toBe('dry-run');
  });
});
