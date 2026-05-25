// Gera 12 URLs do GitHub compare com title + body pré-preenchidos.
// Uso: node 10_ops/scripts/generate-pr-links.mjs

const OWNER = 'incluobrasil-ux';
const REPO = 'commerce-agent-os';
const baseUrl = `https://github.com/${OWNER}/${REPO}/compare`;

const prs = [
  {
    base: 'main',
    head: 'feat/core-runtime-and-first-agent',
    title: 'feat(core): runtime + 6 primeiros agentes + cérebro operacional',
    body: [
      '## Resumo',
      '',
      'PR base da nova ondada. Contém 30 commits cobrindo:',
      '- Núcleo @cao/* (core, runtime, llm, memory, observability, brain-bridge, guardrails)',
      '- 6 agentes iniciais (repo-auditor, audit-synthesizer, learning-memory-curation, memory-context, product-feed-seo, catalog-feed-ops)',
      '- pnpm doctor cross-platform',
      '- Cérebro operacional (current-state.md + project-home.md)',
      '',
      '## Métricas',
      '- Suite: 126 verdes',
      '- Lint: limpo',
      '- Doctor: 10 🟢 / 0 🟡 / 0 🔴',
      '',
      '## Próximos PRs (stacked em cima deste)',
      '#2–#12 trazem 11 novos agentes (Tier 0–3) seguindo o mesmo padrão.',
    ].join('\n'),
  },
  {
    base: 'feat/core-runtime-and-first-agent',
    head: 'feat/agent-orchestrator-master',
    title: 'feat(orchestrator-master): tier 0 router — plan-mode entre agentes',
    body: [
      '## Resumo',
      'Tier 0 router que recebe objetivo + agentes disponíveis e retorna route, aggregatedSummary, artifacts, risks, nextActions. Modos plan|dispatch.',
      '',
      '## CLI',
      '`pnpm orchestrate:master --objective="..." --available=a,b --max-steps=4 --mode=plan [--capture]`',
      '',
      '## Testes: 7 novos (suite 126 → 133)',
      '',
      '## Stack',
      'Base: PR #1 (core-runtime). Próximo: market-intelligence.',
    ].join('\n'),
  },
  {
    base: 'feat/agent-orchestrator-master',
    head: 'feat/agent-market-intelligence',
    title: 'feat(market-intelligence): tier 1 — síntese de mercado a partir de textos',
    body: [
      '## Resumo',
      'Recebe marketQuestion + sourceTexts[] (paste-in) e produz summary, signals[{signal, evidence, confidence}], opportunities, threats, recommendedActions, assumptions.',
      '',
      'Sintetiza **somente** do material fornecido — sem fetcher/crawler.',
      '',
      '## CLI',
      '`pnpm market:intelligence --question="..." --source-text="..." [--source-text=... --capture]`',
      '',
      '## Testes: 6 novos (suite 133 → 139)',
    ].join('\n'),
  },
  {
    base: 'feat/agent-market-intelligence',
    head: 'feat/agent-competitor-benchmark',
    title: 'feat(competitor-benchmark): tier 1 — snapshot imutável por tenant',
    body: [
      '## Resumo',
      'Recebe competitor + sourceType (url|html|text) + sourceValue + benchmarkGoal e produz positioningSummary, pricingSignals, messagingPatterns, strengths, weaknesses, watchouts.',
      '',
      'Persiste em `competitor-benchmark/<competitor>/<ts>.md` — imutável, slug sanitizado.',
      '',
      '## CLI',
      '`pnpm competitor:benchmark --competitor=acme --source-type=html --source-value="..." --goal="..." [--capture]`',
      '',
      '## Testes: 7 novos (suite 139 → 146)',
    ].join('\n'),
  },
  {
    base: 'feat/agent-competitor-benchmark',
    head: 'feat/agent-reviews-ops',
    title: 'feat(reviews-ops): tier 1 — voice-of-customer em <tenant>/voc/',
    body: [
      '## Resumo',
      'Ingere reviews JSON (inline ou file) e extrai sampleSize, averageRating, topThemes, painPoints, desiredOutcomes, quoteCandidates, actionIdeas, riskFlags.',
      '',
      'Persiste em `voc/<slug>-<ts>.md`.',
      '',
      '## CLI',
      '`pnpm reviews:ops --reviews-file=path.json --product-name="..." [--capture]`',
      '',
      '## Testes: 7 novos (suite 146 → 153)',
    ].join('\n'),
  },
  {
    base: 'feat/agent-reviews-ops',
    head: 'feat/agent-product-offer',
    title: 'feat(product-offer): tier 2 — copy de oferta',
    body: [
      '## Resumo',
      'Recebe brief de produto + audience + brand voice + conversion goal e gera heroHeadline, subhead, valueProps, objectionResponses, bundleSuggestions, ctaOptions, pricingNotes, abTestIdeas, riskFlags.',
      '',
      'Aceita contexto VoC + competitor (paste-in) → encadeia com #4 e #5.',
      '',
      '## CLI',
      '`pnpm product:offer --product-name=... --description=... --audience=... --voice=... [--voc-context=... --capture]`',
      '',
      '## Testes: 7 novos (suite 153 → 160)',
    ].join('\n'),
  },
  {
    base: 'feat/agent-product-offer',
    head: 'feat/agent-merchant-compliance',
    title: 'feat(merchant-compliance): tier 2 — triagem legal, PII e claims',
    body: [
      '## Resumo',
      'Revisa copy/descrição/política/email/ad e produz overallSeverity (none|low|medium|high), legalRisks, piiFlags (LGPD), requiredDisclaimers, policyGaps, recommendedRevisions ({original, suggested, reason}), followups.',
      '',
      '**Não substitui jurídico** — triagem para humano decidir.',
      '',
      '## CLI',
      '`pnpm merchant:compliance --content-file=path.txt --content-type=copy --target-market=BR [--sensitive=health-claims --capture]`',
      '',
      '## Testes: 7 novos (suite 160 → 167)',
    ].join('\n'),
  },
  {
    base: 'feat/agent-merchant-compliance',
    head: 'feat/agent-governance-risk-qa',
    title: 'feat(governance-risk-qa): tier 3 meta-guardrail — verdict pass|warn|block',
    body: [
      '## Resumo',
      'Recebe saída de outro agente + contexto e emite verdict (pass|warn|block), rationale, riskFlags com severity, qualityConcerns, factualityChecks ({claim, needsVerification, suggestedSource}), suggestedFollowups, blockingReasons.',
      '',
      '**Exit code 3** quando block — sinal explícito para pipelines.',
      '',
      '## CLI',
      '`pnpm governance:qa --agent-name=product-offer --output-file=path.json --sensitivity=medium [--publishing-channel=pdp --capture]`',
      '',
      '## Testes: 8 novos (suite 167 → 175)',
    ].join('\n'),
  },
  {
    base: 'feat/agent-governance-risk-qa',
    head: 'feat/agent-visual-asset-ops',
    title: 'feat(visual-asset-ops): tier 3 — brief visual para Midjourney/Higgsfield',
    body: [
      '## Resumo',
      'Recebe brief de produto + canal (PDP, Instagram, TikTok, ads, email) e produz shot list com prompts prontos para tools de geração (composition, lighting, camera, caption), styleGuide, palette, doNotInclude, usageNotes, riskFlags.',
      '',
      '**Não gera imagem** — apenas o brief.',
      '',
      '## CLI',
      '`pnpm visual:asset --product-name=... --description=... --channel=pdp --brand-style=... --audience=... [--mood=... --capture]`',
      '',
      '## Testes: 6 novos (suite 175 → 181)',
    ].join('\n'),
  },
  {
    base: 'feat/agent-visual-asset-ops',
    head: 'feat/agent-customer-journey-ops',
    title: 'feat(customer-journey-ops): tier 3 — mapa awareness→advocacy',
    body: [
      '## Resumo',
      'Mapeia jornada em 3–5 stages ({awareness, consideration, decision, retention, advocacy}) com customerState, touchpoints, frictions, opportunities por stage. Produz priorityMoves com effort/impact, measurementSuggestions, retentionLevers.',
      '',
      '## CLI',
      '`pnpm journey:map --brand=acme --product-line=... --audience=... --goal=... [--touchpoint=... --pain=... --voc-context=... --capture]`',
      '',
      '## Testes: 7 novos (suite 181 → 188)',
    ].join('\n'),
  },
  {
    base: 'feat/agent-customer-journey-ops',
    head: 'feat/agent-ads-launchpad',
    title: 'feat(ads-launchpad): tier 3 — plano de mídia paga (Meta/Google/TikTok)',
    body: [
      '## Resumo',
      'Prepara plano de paid media: strategicSummary, angles ({name, hypothesis, hookExample}), audienceSegments com channelFit, copySets ({angleRef, headline, primaryText, cta}), creativeBriefs por canal, kpiTargets, budgetSplitNotes, abTestPlan, complianceCaveats, riskFlags.',
      '',
      '**Não dispara campanha** — plano para humano executar. System prompt explícito sobre não prometer números de performance.',
      '',
      '## CLI',
      '`pnpm ads:plan --product-name=... --description=... --audience=... --goal=... --budget=500 --channel=meta --channel=google [--capture]`',
      '',
      '## Testes: 7 novos (suite 188 → 195)',
    ].join('\n'),
  },
  {
    base: 'feat/agent-ads-launchpad',
    head: 'feat/agent-finance-margin-radar',
    title: 'feat(finance-margin-radar): tier 3 — análise de margem por SKU',
    body: [
      '## Resumo',
      'Recebe productLines colados pelo operador (cost, price, fees, shipping, monthlyUnits) + targetMargin + fixedCosts e produz overallHealth (critical|tight|healthy|strong), summary, marginAnalysis por linha (gross %, contribution abs, health), breakEvenInsights, pricingMoves com effort/impact, risksAndWatchouts, recommendedExperiments, confidenceCaveats (sempre populado).',
      '',
      '**Não consulta ERP** — números são input do operador. System prompt explícito sobre caveats de exchange/tax/returns.',
      '',
      '## CLI',
      '`pnpm finance:radar --lines-file=path.json --currency=BRL --target-margin=35 --fixed-costs=8500 [--label=... --capture]`',
      '',
      '## Testes: 7 novos (suite 195 → 202)',
      '',
      '## 🎉 Stack completo',
      'Último PR da campanha (#12 de 12). Total: 11 agentes novos · suite 126 → 202 (+76 testes) · zero deps externas novas · doctor 10 🟢.',
    ].join('\n'),
  },
];

const lines = [];
lines.push('# Links para abrir os 12 PRs (na ordem)');
lines.push('');
lines.push(
  'Para cada PR: clique no link, confira título/descrição já preenchidos e aperte **Create pull request**.',
);
lines.push('');
prs.forEach((pr, i) => {
  const url = `${baseUrl}/${pr.base}...${pr.head}?expand=1&title=${encodeURIComponent(pr.title)}&body=${encodeURIComponent(pr.body)}`;
  lines.push(`## PR #${i + 1}: \`${pr.head}\` → \`${pr.base}\``);
  lines.push('');
  lines.push(`- **Título:** ${pr.title}`);
  lines.push(`- **Link:** ${url}`);
  lines.push('');
});

console.log(lines.join('\n'));
