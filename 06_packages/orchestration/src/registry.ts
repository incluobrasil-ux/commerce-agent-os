// Capability registry — fonte da verdade sobre quais agentes existem, o que
// fazem, quais inputs/outputs têm e como o Chefe deve compor rotas.
//
// Esta camada NÃO duplica os contratos dos agentes (esses vivem em
// `03_agents/<name>/src/index.ts`). Aqui é só metadado operacional para
// roteamento — leve, sem deps externas.
//
// Filosofia: o orquestrador consulta esta tabela antes de cada decisão. Se um
// agente não estiver listado, ele não existe do ponto de vista do Chefe.

export type AgentExecutionMode = 'read-only' | 'dry-run' | 'planning' | 'validation' | 'writeback';
export type AgentTier = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type CredentialRequirement = 'none' | 'anthropic' | 'shopify-admin' | 'google-merchant';
export type ContextSupport = 'tenant-only' | 'tenant-or-store' | 'global-only';

export interface AgentCapability {
  /** Nome canônico em kebab-case (bate com `03_agents/<name>/`). */
  name: string;
  tier: AgentTier;
  /** O que o agente faz, em 1 linha. */
  purpose: string;
  /** Modos de execução suportados pelo agente. */
  modes: AgentExecutionMode[];
  /** Credenciais que o agente precisa para sair de SKIPPED. */
  credentials: CredentialRequirement[];
  /** Se o agente é determinístico (sem LLM) ou LLM-based. */
  kind: 'deterministic' | 'llm' | 'mixed';
  /** Como o agente lida com contexto multi-tenant/multi-store. */
  contextSupport: ContextSupport;
  /** Inputs mínimos esperados (nomes de campos do CLI ou contract). */
  inputsRequired: string[];
  /** Outputs principais que o agente produz (nomes de campos do contract). */
  outputsMain: string[];
  /** Agentes que costumam vir antes deste no fluxo (handoff predecessors). */
  typicalPredecessors: string[];
  /** Agentes que costumam vir depois deste (handoff successors). */
  typicalSuccessors: string[];
  /** Risco operacional default deste agente: muda dados / só lê / etc. */
  sideEffects: 'none' | 'writes-vault-only' | 'writes-shopify' | 'writes-external';
  /** Comando pnpm para invocar localmente. Vazio se library-only. */
  pnpmCommand: string;
  /** Status real de execução. */
  executable: 'real' | 'stub' | 'library-only';
}

/**
 * Registry completo de agentes. Single source of truth para o roteamento do
 * Chefe. Quando adicionar/remover agente, atualize aqui.
 */
export const AGENT_REGISTRY: readonly AgentCapability[] = [
  // ===== Tier 0 — orquestração =====
  {
    name: 'orchestrator-master',
    tier: 0,
    purpose: 'Recebe objetivo NL, classifica intent, decide rota e dispara agentes.',
    modes: ['planning', 'dry-run'],
    credentials: ['anthropic'],
    kind: 'mixed',
    contextSupport: 'tenant-or-store',
    inputsRequired: ['objective', 'tenantId'],
    outputsMain: ['route', 'aggregatedSummary', 'risks', 'nextActions'],
    typicalPredecessors: [],
    typicalSuccessors: ['memory-context', 'merchant-compliance', 'product-offer'],
    sideEffects: 'writes-vault-only',
    pnpmCommand: 'orchestrate:master',
    executable: 'real',
  },
  // ===== Tier 1 — memória/auditoria base =====
  {
    name: 'memory-context',
    tier: 1,
    purpose: 'Empacota/desempacota ContextBundle entre agentes; brief leve por tenant/store.',
    modes: ['read-only'],
    credentials: ['anthropic'],
    kind: 'llm',
    contextSupport: 'tenant-or-store',
    inputsRequired: ['tenantId', 'topic'],
    outputsMain: ['contextBrief', 'memorySnippets'],
    typicalPredecessors: ['orchestrator-master'],
    typicalSuccessors: ['product-offer', 'marketing-director', 'merchant-compliance'],
    sideEffects: 'none',
    pnpmCommand: 'context:brief',
    executable: 'real',
  },
  {
    name: 'learning-memory-curation',
    tier: 1,
    purpose: 'Organiza outputs em facts/decisions/lessons no vault do tenant.',
    modes: ['read-only', 'validation'],
    credentials: ['anthropic'],
    kind: 'llm',
    contextSupport: 'tenant-or-store',
    inputsRequired: ['tenantId'],
    outputsMain: ['curatedFacts', 'memoryDeltas'],
    typicalPredecessors: ['memory-context'],
    typicalSuccessors: [],
    sideEffects: 'writes-vault-only',
    pnpmCommand: 'curate:memory',
    executable: 'real',
  },
  {
    name: 'audit-synthesizer',
    tier: 1,
    purpose: 'Consolida múltiplos relatórios em síntese executiva única.',
    modes: ['read-only'],
    credentials: ['anthropic'],
    kind: 'llm',
    contextSupport: 'tenant-only',
    inputsRequired: ['inputs'],
    outputsMain: ['summary', 'topActions'],
    typicalPredecessors: ['merchant-compliance', 'governance-risk-qa', 'reviews-ops'],
    typicalSuccessors: [],
    sideEffects: 'writes-vault-only',
    pnpmCommand: 'synthesize:audit',
    executable: 'real',
  },
  {
    name: 'repo-auditor',
    tier: 1,
    purpose: 'Audita repositório local (estrutura, licenças, gaps). 100% determinístico.',
    modes: ['read-only', 'validation'],
    credentials: ['none'],
    kind: 'deterministic',
    contextSupport: 'global-only',
    inputsRequired: ['target'],
    outputsMain: ['findings', 'score'],
    typicalPredecessors: [],
    typicalSuccessors: ['audit-synthesizer'],
    sideEffects: 'writes-vault-only',
    pnpmCommand: 'audit:repo',
    executable: 'real',
  },
  // ===== Tier 2 — catálogo + merchant =====
  {
    name: 'catalog-feed-ops',
    tier: 2,
    purpose: 'Audit determinístico de catálogo (scorer) + dry-run de feed Google Merchant.',
    modes: ['read-only', 'dry-run', 'validation'],
    credentials: ['none'],
    kind: 'deterministic',
    contextSupport: 'tenant-or-store',
    inputsRequired: ['source', 'tenantId'],
    outputsMain: ['rowScores', 'summary', 'findings'],
    typicalPredecessors: [],
    typicalSuccessors: ['merchant-compliance', 'product-offer', 'product-feed-seo'],
    sideEffects: 'writes-vault-only',
    pnpmCommand: 'merchant:audit',
    executable: 'real',
  },
  {
    name: 'product-feed-seo',
    tier: 2,
    purpose:
      'Otimiza title/description para SEO + Google Merchant. Library-only (consumido por catalog-feed-ops).',
    modes: ['planning'],
    credentials: ['anthropic'],
    kind: 'llm',
    contextSupport: 'tenant-or-store',
    inputsRequired: ['skuIds'],
    outputsMain: ['proposedChanges', 'signalsUsed'],
    typicalPredecessors: ['catalog-feed-ops'],
    typicalSuccessors: ['governance-risk-qa', 'merchant-compliance'],
    sideEffects: 'writes-vault-only',
    pnpmCommand: '',
    executable: 'library-only',
  },
  {
    name: 'merchant-compliance',
    tier: 2,
    purpose: 'Análise de conteúdo/PDP contra políticas GMC + regulatório (ANVISA/CDC/GDPR/FTC).',
    modes: ['validation'],
    credentials: ['anthropic'],
    kind: 'llm',
    contextSupport: 'tenant-or-store',
    inputsRequired: ['contentType', 'content', 'targetMarket'],
    outputsMain: ['overallSeverity', 'legalRisks', 'suggestedRevisions'],
    typicalPredecessors: ['catalog-feed-ops', 'product-feed-seo', 'creative-copy-assets'],
    typicalSuccessors: ['governance-risk-qa'],
    sideEffects: 'writes-vault-only',
    pnpmCommand: 'merchant:compliance',
    executable: 'real',
  },
  // ===== Tier 3 — oferta + design =====
  {
    name: 'product-offer',
    tier: 3,
    purpose: 'Define preço/bundle/posicionamento baseado em CMV/competidor/estoque.',
    modes: ['planning'],
    credentials: ['anthropic'],
    kind: 'llm',
    contextSupport: 'tenant-or-store',
    inputsRequired: ['scope'],
    outputsMain: ['offer', 'justification'],
    typicalPredecessors: ['memory-context', 'market-intelligence'],
    typicalSuccessors: ['creative-copy-assets', 'merchant-compliance'],
    sideEffects: 'writes-vault-only',
    pnpmCommand: 'product:offer',
    executable: 'real',
  },
  {
    name: 'design-ux-localization',
    tier: 3,
    purpose: 'Brief de UX/visual/localização por PDP/coleção e mercado.',
    modes: ['planning'],
    credentials: ['anthropic'],
    kind: 'llm',
    contextSupport: 'tenant-or-store',
    inputsRequired: ['scope', 'name'],
    outputsMain: ['designBlocks', 'localeAdaptations', 'a11yChecks'],
    typicalPredecessors: ['product-offer'],
    typicalSuccessors: ['creative-copy-assets', 'governance-risk-qa'],
    sideEffects: 'writes-vault-only',
    pnpmCommand: 'design:ux',
    executable: 'real',
  },
  // ===== Tier 4 — marketing/criativo =====
  {
    name: 'marketing-director',
    tier: 4,
    purpose: 'Plano de marketing de horizonte (semana/trimestre) com KPIs e budget split.',
    modes: ['planning'],
    credentials: ['anthropic'],
    kind: 'llm',
    contextSupport: 'tenant-or-store',
    inputsRequired: ['horizon', 'objective'],
    outputsMain: ['initiatives', 'budgetSplit', 'kpis'],
    typicalPredecessors: ['memory-context', 'market-intelligence'],
    typicalSuccessors: ['creative-copy-assets', 'traffic-campaigns'],
    sideEffects: 'writes-vault-only',
    pnpmCommand: 'marketing:plan',
    executable: 'real',
  },
  {
    name: 'creative-copy-assets',
    tier: 4,
    purpose: 'Variantes de copy/criativo para campanha (4–8 versões com hooks distintos).',
    modes: ['planning'],
    credentials: ['anthropic'],
    kind: 'llm',
    contextSupport: 'tenant-or-store',
    inputsRequired: ['campaign'],
    outputsMain: ['copyVariants', 'angleNotes'],
    typicalPredecessors: ['marketing-director', 'product-offer'],
    typicalSuccessors: ['governance-risk-qa', 'traffic-campaigns'],
    sideEffects: 'writes-vault-only',
    pnpmCommand: 'creative:assets',
    executable: 'real',
  },
  {
    name: 'traffic-campaigns',
    tier: 4,
    purpose: 'Plano de mídia/tráfego pago: estrutura de campanhas, públicos, budgets.',
    modes: ['planning'],
    credentials: ['anthropic'],
    kind: 'llm',
    contextSupport: 'tenant-or-store',
    inputsRequired: ['campaign', 'budget'],
    outputsMain: ['campaignTree', 'audiences', 'budgetAllocation'],
    typicalPredecessors: ['marketing-director', 'creative-copy-assets'],
    typicalSuccessors: ['governance-risk-qa'],
    sideEffects: 'writes-vault-only',
    pnpmCommand: 'traffic:plan',
    executable: 'real',
  },
  // ===== Tier 5 — inteligência externa =====
  {
    name: 'market-intelligence',
    tier: 5,
    purpose: 'Briefing de mercado/tendências por categoria/região.',
    modes: ['read-only'],
    credentials: ['anthropic'],
    kind: 'llm',
    contextSupport: 'tenant-or-store',
    inputsRequired: ['category'],
    outputsMain: ['trends', 'signals'],
    typicalPredecessors: [],
    typicalSuccessors: ['product-offer', 'marketing-director'],
    sideEffects: 'writes-vault-only',
    pnpmCommand: 'market:intelligence',
    executable: 'real',
  },
  {
    name: 'competitor-benchmark',
    tier: 5,
    purpose: 'Benchmark de competidor por dimensão (preço/oferta/copy/UX).',
    modes: ['read-only'],
    credentials: ['anthropic'],
    kind: 'llm',
    contextSupport: 'tenant-or-store',
    inputsRequired: ['competitor', 'goal'],
    outputsMain: ['snapshot', 'gapAnalysis'],
    typicalPredecessors: [],
    typicalSuccessors: ['product-offer', 'marketing-director'],
    sideEffects: 'writes-vault-only',
    pnpmCommand: 'competitor:benchmark',
    executable: 'real',
  },
  {
    name: 'product-mining',
    tier: 5,
    purpose:
      'Pipeline AliExpress: minera por queries, cura por avaliação/pedidos/preço, gera imagens via Higgsfield. Sidecar Python externo invocado via @cao/ecommerce-pipeline.',
    modes: ['read-only', 'planning'],
    credentials: ['none'],
    kind: 'deterministic',
    contextSupport: 'tenant-or-store',
    inputsRequired: ['projectName', 'step'],
    outputsMain: ['minedProducts', 'curatedSelection', 'generatedImages'],
    typicalPredecessors: ['market-intelligence'],
    typicalSuccessors: ['product-offer', 'creative-copy-assets', 'merchant-compliance'],
    sideEffects: 'writes-external',
    pnpmCommand: 'mining:run',
    executable: 'real',
  },
  {
    name: 'reviews-ops',
    tier: 5,
    purpose: 'Voz do cliente: agrega reviews em temas, gera respostas.',
    modes: ['read-only'],
    credentials: ['anthropic'],
    kind: 'llm',
    contextSupport: 'tenant-or-store',
    inputsRequired: ['source'],
    outputsMain: ['themes', 'sentimentMap', 'responseDrafts'],
    typicalPredecessors: [],
    typicalSuccessors: ['marketing-director', 'product-offer'],
    sideEffects: 'writes-vault-only',
    pnpmCommand: 'reviews:ops',
    executable: 'real',
  },
  // ===== Tier 6 — governance + journey =====
  {
    name: 'governance-risk-qa',
    tier: 6,
    purpose: 'Porta de qualidade: approve|revise|block em qualquer artifact pré-publicação.',
    modes: ['validation'],
    credentials: ['anthropic'],
    kind: 'llm',
    contextSupport: 'tenant-or-store',
    inputsRequired: ['agentName', 'output'],
    outputsMain: ['decision', 'reasons', 'suggestedRevisions'],
    typicalPredecessors: [
      'product-feed-seo',
      'creative-copy-assets',
      'design-ux-localization',
      'product-offer',
    ],
    typicalSuccessors: [],
    sideEffects: 'writes-vault-only',
    pnpmCommand: 'governance:qa',
    executable: 'real',
  },
  {
    name: 'customer-journey-ops',
    tier: 6,
    purpose: 'Mapeia jornada do cliente, identifica drop-offs e oportunidades.',
    modes: ['read-only', 'planning'],
    credentials: ['anthropic'],
    kind: 'llm',
    contextSupport: 'tenant-or-store',
    inputsRequired: ['journey'],
    outputsMain: ['journeyMap', 'opportunities'],
    typicalPredecessors: ['reviews-ops'],
    typicalSuccessors: ['marketing-director'],
    sideEffects: 'writes-vault-only',
    pnpmCommand: 'journey:map',
    executable: 'real',
  },
  {
    name: 'finance-margin-radar',
    tier: 6,
    purpose: 'Margem por produto/coleção, alertas de erosão.',
    modes: ['read-only'],
    credentials: ['anthropic'],
    kind: 'llm',
    contextSupport: 'tenant-or-store',
    inputsRequired: ['scope'],
    outputsMain: ['marginReport', 'alerts'],
    typicalPredecessors: [],
    typicalSuccessors: ['product-offer'],
    sideEffects: 'writes-vault-only',
    pnpmCommand: 'finance:radar',
    executable: 'real',
  },
  {
    name: 'visual-asset-ops',
    tier: 6,
    purpose: 'Briefing/ops de assets visuais (mood, especificações, references).',
    modes: ['planning'],
    credentials: ['anthropic'],
    kind: 'llm',
    contextSupport: 'tenant-or-store',
    inputsRequired: ['scope'],
    outputsMain: ['assetBriefs'],
    typicalPredecessors: ['creative-copy-assets'],
    typicalSuccessors: [],
    sideEffects: 'writes-vault-only',
    pnpmCommand: 'visual:asset',
    executable: 'real',
  },
  {
    name: 'ads-launchpad',
    tier: 6,
    purpose: 'Launch plan de ads (timeline, criativos, audiences, budgets, gates).',
    modes: ['planning'],
    credentials: ['anthropic'],
    kind: 'llm',
    contextSupport: 'tenant-or-store',
    inputsRequired: ['campaign'],
    outputsMain: ['launchPlan', 'gates'],
    typicalPredecessors: ['traffic-campaigns'],
    typicalSuccessors: ['governance-risk-qa'],
    sideEffects: 'writes-vault-only',
    pnpmCommand: 'ads:plan',
    executable: 'real',
  },
] as const;

/** Lookup por nome canônico. */
export function getAgent(name: string): AgentCapability | undefined {
  return AGENT_REGISTRY.find((a) => a.name === name);
}

/** Filtra agentes por modo de execução. */
export function agentsByMode(mode: AgentExecutionMode): readonly AgentCapability[] {
  return AGENT_REGISTRY.filter((a) => a.modes.includes(mode));
}

/** Filtra agentes determinísticos (sem credencial LLM). */
export function deterministicAgents(): readonly AgentCapability[] {
  return AGENT_REGISTRY.filter((a) => a.kind === 'deterministic');
}

/** Filtra agentes que suportam store-level. */
export function storeAwareAgents(): readonly AgentCapability[] {
  return AGENT_REGISTRY.filter((a) => a.contextSupport === 'tenant-or-store');
}

/** Filtra agentes por credencial necessária (para SKIPPED gracioso). */
export function agentsRequiringCredential(cred: CredentialRequirement): readonly AgentCapability[] {
  return AGENT_REGISTRY.filter((a) => a.credentials.includes(cred));
}

/** Lista nomes canônicos para uso em CLI/contracts. */
export function allAgentNames(): readonly string[] {
  return AGENT_REGISTRY.map((a) => a.name);
}
