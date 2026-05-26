---
created_at: 2026-05-23T00:00:00Z
updated_at: 2026-05-26T23:40:00Z
tags: [index, run-summaries]
source: mixed
confidence: 1.0
---

# Run Summaries — Index

**Para que serve:** catálogo único de todos os resumos curados. Diferente do [README.md](README.md) (que ensina o **padrão**), este lista o **conteúdo real**.

**Como usar:** quando criar resumo novo, adicionar 1 linha aqui no topo da tabela do `kind` correspondente. Quando procurar "já resumimos X?", consultar aqui primeiro.

**Output que gera:** entrada única para descobrir o que o sistema já documentou.

**Regra:** uma linha por resumo, ≤ 150 caracteres. Sem prosa. Se o título não diz o suficiente, o slug do arquivo está errado — renomear.

---

## Impl milestones

Marcos de implementação (sub-fase concluída, primeiro deploy, OAuth funcionando, etc.).

| Data | Título | Resultado | Arquivo |
|---|---|---|---|
| 2026-05-26 | **Chefe OS consolidado — `@cao/orchestration` + `pnpm chief`** — capability registry (22 agentes), 8 playbooks oficiais, planner rule-based, runner com checkpoints, writeback gate, camada jurídica BR/EU/US (11 regras LGPD/CDC/CONAR/GDPR/CRD/Omnibus/FTC/CCPA). 28 testes novos. Total: 366 verdes em 40 arquivos. | 🟢 | [2026-05-26-impl-milestone-chief-os-consolidation.md](2026-05-26-impl-milestone-chief-os-consolidation.md) |
| 2026-05-26 | **T2 aplicado + SKU normalization 39 produtos / 119 variantes** — função jurídica técnica (3 PDPs com "autorregulação sensorial" → "brinquedo manipulativo" baseado em ANVISA/CDC/CONAR/Berenice) + convenção SKU INC-<P>-<V> via batch productVariantsBulkUpdate. Audit Incluo 92.8 → **94.0/100, 50🟢/0🟡/0🔴 ALL GREEN** pela primeira vez. Total dia: 42 mutations Shopify | 🟢 | [2026-05-26-impl-milestone-t2-applied-sku-normalized.md](2026-05-26-impl-milestone-t2-applied-sku-normalized.md) |
| 2026-05-26 | **N20.2 + 8 mutations Shopify aplicadas** — scorer ganhou 21 keywords PT-BR + `link:therapeutic-claim`; orchestrator conduziu pesquisa de mercado, fix price=89,90/compareAt=109,90 + reescreveu 7 handles com redirect 301 auto; score 93.2→89.2 (gap exposto)→92.8 (pós-fixes); 256 verdes (+5) | 🟢 | [2026-05-26-impl-milestone-n20-2-and-gmc-fixes-applied.md](2026-05-26-impl-milestone-n20-2-and-gmc-fixes-applied.md) |
| 2026-05-26 | **Sub-fase 2.6 writeback minimal** — Shopify productUpdate via compliance MD; dry-run/apply gate; audit log; 333 verdes (+24) | 🟢 | [2026-05-26-impl-milestone-shopify-writeback-minimal.md](2026-05-26-impl-milestone-shopify-writeback-minimal.md) |
| 2026-05-26 | **N21 — pipeline LLM real Incluo** (4/5 sucessos, $0.174). marketing+creative+offer+compliance OK; design:ux deferred. 2 bugs fixed (max_tokens, schemas) | 🟢 | [2026-05-26-impl-milestone-n21-llm-pipeline-real.md](2026-05-26-impl-milestone-n21-llm-pipeline-real.md) |
| 2026-05-25 | **Multi-tenant/multi-store hardening** — branded types + helpers + Memory/brain storeId + merchant:audit pilot; 309 verdes (+58); smoke 17 | 🟢 | [2026-05-25-impl-milestone-multi-tenant-hardening.md](2026-05-25-impl-milestone-multi-tenant-hardening.md) |
| 2026-05-25 | **Sub-fase 2.8 Merchant audit MVP** — score por SKU + findings + remediações; 241 testes verdes | 🟢 | [2026-05-25-impl-milestone-merchant-audit-mvp.md](2026-05-25-impl-milestone-merchant-audit-mvp.md) |
| 2026-05-25 | **Bloco B completo** — 4 agentes novos (marketing/creative/design/traffic); 228 testes verdes | 🟢 | [2026-05-25-impl-milestone-four-new-agents.md](2026-05-25-impl-milestone-four-new-agents.md) |
| 2026-05-24 | **Repo fechado para equipe** — `pnpm doctor` valida 10 checks; docs harmonizados (README+SETUP+COMMANDS) | 🟢 | [2026-05-24-impl-milestone-team-ready.md](2026-05-24-impl-milestone-team-ready.md) |
| 2026-05-24 | `@cao/brain-bridge` — ponte mínima execução→cérebro (`--capture` + `pnpm ops:capture`; 126 verdes) | 🟢 | [2026-05-24-impl-milestone-brain-bridge.md](2026-05-24-impl-milestone-brain-bridge.md) |
| 2026-05-23 | Sub-fase 2.7 — Merchant dry-run end-to-end funcional (pipeline Shopify→SEO→Merchant; 114 testes verdes) | 🟢 | [2026-05-23-impl-milestone-merchant-dry-run.md](2026-05-23-impl-milestone-merchant-dry-run.md) |
| 2026-05-23 | Sub-fase 2.6 — caminho mínimo Shopify (admin client + OAuth helpers + CLI; 96 testes verdes) | 🟢 | [2026-05-23-impl-milestone-shopify-minimal.md](2026-05-23-impl-milestone-shopify-minimal.md) |
| 2026-05-23 | `@cao/llm` ganha noop fallback + `pnpm llm:smoke` (81 testes verdes) | 🟢 | [2026-05-23-impl-milestone-llm-fallback-and-smoke.md](2026-05-23-impl-milestone-llm-fallback-and-smoke.md) |
| 2026-05-23 | 4º agente real: `memory-context` (read-only context brief) | 🟢 | [2026-05-23-impl-milestone-fourth-agent-memory-context.md](2026-05-23-impl-milestone-fourth-agent-memory-context.md) |
| 2026-05-23 | Sub-fase 2.5 iniciada: 3º agente real + secret scan ativo | 🟢 | [2026-05-23-impl-milestone-third-agent-and-gitleaks.md](2026-05-23-impl-milestone-third-agent-and-gitleaks.md) |
| 2026-05-23 | Macro-fase 1 (setup/scaffold) concluída | 🟢 | [2026-05-23-impl-milestone-phase-1-setup-complete.md](2026-05-23-impl-milestone-phase-1-setup-complete.md) |

## Test milestones

Passagem ou regressão relevante de suíte.

| Data | Título | Resultado | Arquivo |
|---|---|---|---|
| 2026-05-23 | Sub-fase 2.2 — suite completa verde (41 testes) | 🟢 | [2026-05-23-test-milestone-sub-phase-2-2-suite-green.md](2026-05-23-test-milestone-sub-phase-2-2-suite-green.md) |

## Audits

Resultado de auditoria (manual ou via agente).

| Data | Título | Resultado | Arquivo |
|---|---|---|---|
| 2026-05-26 | GMC multi-agent audit re-run Incluo — score baseline 93.2 confirmado; cruzamento com compliance LLM HIGH (13 risks legais BR); 3 achados novos (handles claim, SKU ALI, "terapêutico" desc); proposta N20.2 | 🟢 | [2026-05-26-audit-gmc-multi-agent-rerun-incluo.md](2026-05-26-audit-gmc-multi-agent-rerun-incluo.md) |
| 2026-05-25 | Merchant audit (json, 50 SKUs, tenant=incluo) | 🟢 | [2026-05-25-audit-merchant-audit-incluo-json.md](2026-05-25-audit-merchant-audit-incluo-json.md) |
| 2026-05-25 | Merchant audit (json, 50 SKUs, tenant=incluo) | 🔴 | [2026-05-25-audit-merchant-audit-incluo-json.md](2026-05-25-audit-merchant-audit-incluo-json.md) |
| 2026-05-23 | Audit commerce-agent-os (profile=license) | 🟢 | [2026-05-23-audit-repo-auditor-commerce-agent-os.md](2026-05-23-audit-repo-auditor-commerce-agent-os.md) |
| 2026-05-23 | Sub-fase 2.3 — pass 2: 10 upstreams auditados (2 reclassificações de licença) | 🟡 | [2026-05-23-audit-upstream-pass2-ten-repos.md](2026-05-23-audit-upstream-pass2-ten-repos.md) |
| 2026-05-23 | Auditoria de gaps da Macro-fase 1 (31 gaps em 4 severidades) | 🟡 | [2026-05-23-audit-phase-1-gap-analysis.md](2026-05-23-audit-phase-1-gap-analysis.md) |

## Agent runs

Execuções de agentes em runtime real.

| Data | Título | Resultado | Arquivo |
|---|---|---|---|
| 2026-05-24 | Merchant dry-run (fixture, 3 prod, tenant=_test) | 🔴 | [2026-05-24-agent-run-feed-dry-run--test-fixture.md](2026-05-24-agent-run-feed-dry-run--test-fixture.md) |
| 2026-05-23 | **Primeiras chamadas LLM reais (`audit-synthesizer` × 2)** | 🟢 | [2026-05-23-agent-run-llm-first-real-calls.md](2026-05-23-agent-run-llm-first-real-calls.md) |
| 2026-05-23 | `repo-auditor` em 2 upstreams (langgraph + shopify-app-template) | 🟢 | [2026-05-23-agent-run-repo-auditor-2-upstreams.md](2026-05-23-agent-run-repo-auditor-2-upstreams.md) |
| 2026-05-23 | Primeira execução real do `repo-auditor` (self-audit) | 🟢 | [2026-05-23-agent-run-repo-auditor-self-audit.md](2026-05-23-agent-run-repo-auditor-self-audit.md) |

---

## Como adicionar entrada

1. Criar o resumo a partir de [`_template.md`](_template.md), salvar como `<YYYY-MM-DD>-<kind>-<slug>.md`.
2. Adicionar 1 linha **no topo** da tabela do `kind` correspondente acima.
3. Atualizar `updated_at` no frontmatter deste arquivo.
4. Commitar junto com o resumo.

## Como remover entrada

Não remover. Resumo superseded → atualizar o resumo com nota `superseded by <slug>` no topo + manter linha aqui. Histórico inteiro fica preservado.

## Sobre filtro / busca

Hoje 100% manual (Ctrl+F no arquivo). Quando passar de ~20 resumos, avaliar:
- separar este index em múltiplos arquivos por trilha ([workstreams.md](../workstreams.md)) ou por agente.
- avaliar index automático via `@cao/memory` (ADR-0005 prevê).
