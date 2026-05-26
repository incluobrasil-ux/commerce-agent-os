---
created_at: 2026-05-25T18:10:00Z
updated_at: 2026-05-25T18:10:00Z
tags: [merchant, audit, sub-fase-2.8]
source: human:incluobrasil-ux
kind: impl-milestone
result: green
confidence: 1.0
related:
  - 05_integrations/google-merchant/audit/scorer.ts
  - 05_integrations/google-merchant/audit/report.ts
  - 03_agents/catalog-feed-ops/src/audit-cli.ts
  - 08_data/fixtures/catalog-sample.json
---

# Sub-fase 2.8 — Merchant audit MVP (score + findings + remediações por SKU)

## Contexto

Phase 4 do pedido do usuário: "quero conseguir usar este sistema para olhar um catálogo e receber um relatório operacional útil sobre risco Merchant". O `pnpm feed:dry-run` existente já validava feed rows com zod (binário ok/fail) mas faltavam: (a) score por SKU, (b) categorização de findings por severidade, (c) remediação concreta por finding, (d) input por JSON local.

## O que aconteceu

- Criado módulo `05_integrations/google-merchant/audit/`:
  - `scorer.ts` — `scoreRow()` + `summarizeAudit()` pure functions. Severidades critical/high/medium/low; penalidades 40/20/8/3. Bands green ≥ 80, yellow 50-79, red < 50.
  - Regras: validation errors (critical), warnings mapeados do transformer (placeholder image = critical, default price = high, derived description = medium, etc.), semantic checks (missing brand/gtin/mpn/category, title length, description length, high-risk keywords como "miracle/cure/guaranteed").
  - `report.ts` — `writeAuditReport()` gera markdown operacional + JSON em `12_reports/merchant-audits/`. Markdown tem: summary geral, top findings, ranking de SKUs por pior score, detalhe completo dos 10 piores com remediação por finding.
- Novo CLI `pnpm merchant:audit` em `03_agents/catalog-feed-ops/src/audit-cli.ts`. Suporta `--source=fixture|json|shopify`, `--file=path`, `--tenant`, `--capture`. Exit 1 se há SKU red (útil para CI gate).
- Fixture `08_data/fixtures/catalog-sample.json` com 5 SKUs deliberadamente variados (perfeito → totalmente quebrado) para validar todas as regras.
- 13 testes novos em `audit/scorer.test.ts`. Suíte 228 → **241 verdes em 34 arquivos**.
- Run real validado: `pnpm merchant:audit --source=json --file=08_data/fixtures/catalog-sample.json --tenant=_demo` → 5 SKUs, score médio 37.4, distribuição 1🟢/1🟡/3🔴, findings 6 critical / 2 high / 17 medium / 7 low. Relatório útil para operador humano decidir o que corrigir.

## Achados / decisões

- **Determinístico é importante**: o scorer NÃO usa LLM. Isso permite rodar localmente sem credencial, sem custo, repetível.
- **Regras semânticas vs validation**: as regras estruturais (zod) cobrem o que o GMC rejeita por contrato; as regras semânticas cobrem o que reduz performance/CPC.
- **Output operacional > output técnico**: o markdown tem ranking, detalhe dos 10 piores, remediação por finding. Pensado para operador humano abrir uma vez por semana e priorizar.
- **Exit code 1 quando há red** funciona como gate de CI sem precisar lógica adicional.
- **Próximo gap natural**: presets por categoria (ex.: eletrônicos exige GTIN, fashion exige size+color), mais keywords de risco PT-BR, integração com merchant-compliance LLM para validar copy ambíguo.

## Impacto

- Repo agora tem **caminho útil de pré-análise GMC sem dependência externa**. Operador pode rodar contra export local de catálogo e receber lista priorizada de correções antes de submeter.
- Próximas evoluções (presets por categoria, mais regras) são incrementais ao mesmo módulo, sem refatoração.
- Combinando `merchant:audit` (regras estruturais + semânticas) com `merchant:compliance` LLM (copy ambíguo, jurídico) cobre os dois eixos de risco GMC.

## Ações geradas

- [x] Atualizar `current-state.md` (sub-fase 2.8 + 241 testes + 23 comandos).
- [x] Atualizar `next-actions.md` (N20 marcado concluído, N26 = run real adicionado).
- [ ] N26 (próxima sessão): rodar audit em catálogo Shopify real (depende de B6).
- [ ] Evolução incremental: presets por categoria, mais keywords PT-BR (sem urgência — quando uso real revelar gaps).

## Referências

- código: `05_integrations/google-merchant/audit/scorer.ts`, `audit/report.ts`, `03_agents/catalog-feed-ops/src/audit-cli.ts`
- fixture: `08_data/fixtures/catalog-sample.json`
- exemplo de output: `12_reports/merchant-audits/_demo-json-20260525-210835.md`
- testes: `05_integrations/google-merchant/audit/scorer.test.ts` (13 testes)
