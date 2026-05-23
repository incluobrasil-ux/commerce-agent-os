---
created_at: 2026-05-23T23:40:00Z
updated_at: 2026-05-23T23:40:00Z
tags: [impl-milestone, sub-fase-2-7, merchant, dry-run, pipeline]
source: human:incluobrasil
kind: impl-milestone
result: green
confidence: 1.0
related:
  - 05_integrations/google-merchant/client/feed-row.ts
  - 05_integrations/google-merchant/client/dry-run.ts
  - 03_agents/product-feed-seo/src/index.ts
  - 03_agents/catalog-feed-ops/src/pipeline.ts
  - 03_agents/catalog-feed-ops/src/cli.ts
  - 12_reports/merchant-dry-runs/
---

# Sub-fase 2.7 — Merchant dry-run end-to-end funcional

## Contexto

Primeiro fluxo operacional Shopify → Merchant em dry-run. Objetivo: gerar valor real no catálogo/feed sem precisar de credenciais Google nem mexer em produção. Pipeline 100% local: produtos (fixture ou Shopify real) → opcional SEO LLM → transform → validate → relatório auditável.

## O que aconteceu

**3 novos pacotes/módulos:**

1. `05_integrations/google-merchant/client/`:
   - `feed-row.ts`: schema zod runtime `FeedRow`, `validateFeedRow()`, `productToFeedRow()` (Shopify → GMC com defaults + warnings).
   - `dry-run.ts`: `writeDryRunReport()` — escreve JSON + Markdown auditável em `12_reports/merchant-dry-runs/`.
   - Schema reforçado: `amount` deve ser > 0 (Google rejeita 0); `currencyCode` 3 letras; `link/imageLink` URLs válidas; títulos ≤ 150 chars.

2. `03_agents/product-feed-seo/`:
   - Agente LLM minimal seguindo padrão dos 4 anteriores.
   - Input: `{ productHandle, originalTitle, originalDescription, brand, productType, maxTitleChars, maxDescriptionChars }`.
   - Output: `{ suggestedTitle, suggestedDescription, rationale, changedTitle, changedDescription, riskFlags }`.
   - System prompt enfatiza: conservador, sem hyperbole, sem inventar atributos. Idempotente quando original já está strong.

3. `03_agents/catalog-feed-ops/`:
   - `pipeline.ts`: pura, recebe produtos + opções → roda SEO opcional → transforma → valida. Sem CLI.
   - `cli.ts`: orquestra tudo — flags `--source`, `--first`, `--seo`, `--tenant`, `--shop-domain`, `--feed-label`, `--content-language`.
   - `fixture.ts`: 3 produtos sample (1 completo, 1 médio, 1 com campos faltando) para rodar 100% local.

**Comando único:** `pnpm feed:dry-run [opções]`.

**Real run executado (sem credenciais):**
```
[feed:dry-run] carregados 3 produto(s) via fixture
[feed:dry-run] 2 ok / 1 fail / 5 warnings
[feed:dry-run] report: 12_reports/merchant-dry-runs/_test-20260523-233340.md
[feed:dry-run] json:   12_reports/merchant-dry-runs/_test-20260523-233340.json
```
Exit 1 (porque 1 row falhou — esperado: o sticker pack do fixture sem price).

**Markdown gerado** mostra tabela: offerId / title / availability / price / valid? / warnings / erros. Auditável por humano.

**+18 testes** (suíte 96 → **114 verdes** em 17 arquivos): 11 cobrindo feed-row/dry-run + 5 cobrindo product-feed-seo + 2 ajustes em outros.

## Achados / decisões

- **Schema reforçado vs schema permissivo:** decisão de fazer o validador rejeitar `amount: '0.00'` (refine > 0). Razão: Google Merchant rejeita produtos com price zero, então rejeitar no dry-run é melhor que mascarar. Tradeoff: produtos sem price + sem defaultPrice geram fail loudly (visível no relatório), o que é exatamente o que queremos para catalog ops.
- **Warnings != erros.** Warnings (5 no fixture: imagem placeholder, availability derivada, price ausente etc.) viram coluna no markdown mas não causam fail. Erros (1: price.amount = 0) bloqueiam aprovação.
- **SEO é opcional e tolerante a credencial ausente.** `--seo` ativa otimização Claude; se key ausente, mensagem informa "SEO desativado neste run" e continua sem otimizar. Pipeline nunca quebra por causa de LLM.
- **`exactOptionalPropertyTypes` exigiu** declarar campos como `T | undefined` explicitamente nos inputs do transformer. Inconveniente menor; mantido por consistência com o resto do projeto.
- **CLI tolerante a fonte ausente:** `--source=shopify` sem credenciais cai automaticamente para fixture (em vez de falhar). Mantém o pipeline rodável.
- **0 dependência adicional** instalada — só usa `node:fs`, `node:path`, zod (já tinha) e os pacotes workspace existentes.

## Impacto

- **Sub-fase 2.7 (Merchant dry-run) entregue.** Critério de DoR: "ler lote pequeno → transformar → validar → simular envio → gerar saída auditável" todos atendidos.
- **Pipeline real Shopify → SEO → Merchant funciona 100% local** com fixture. Mesma pipeline rodaria com produtos reais Shopify se `SHOPIFY_SHOP`+`SHOPIFY_ADMIN_TOKEN` estivessem em `.env.local`.
- **6 agentes reais** no sistema (era 4). Total comandos `pnpm`: **7**.
- Pipeline serve como **base para Fase 9 produção**: cliente HTTP real Merchant só precisa de + handler que recebe `FeedRow[]` + manda PUT/POST para Content API. Schema + transformer + warnings continuam válidos.
- Validação rejeitando price zero **já capturou um caso real no fixture** — demonstra que validação local pega problema antes de chegar em produção.

## Ações geradas

- [ ] **Sequência manual (passos 1→3 destravam pipeline real end-to-end):**
  1. Anthropic key → `.env.local`
  2. Shopify Custom App → `.env.local`
  3. Rodar `pnpm feed:dry-run --source=shopify --seo --first=5` → primeiro relatório real com dados Shopify + otimização Claude
- [ ] **Passo 4 (deferido):** Google Merchant credentials + implementação HTTP do client real (`makeClient(tenant)` que hoje é stub). Fora do escopo de dry-run.
- [ ] Considerar agente `merchant-compliance` (Tier 3) que lê o JSON do dry-run e propõe correções para os fails/warnings.

## Referências

- código: [`05_integrations/google-merchant/client/`](../../../../../05_integrations/google-merchant/client/), [`03_agents/product-feed-seo/src/`](../../../../../03_agents/product-feed-seo/src/), [`03_agents/catalog-feed-ops/src/`](../../../../../03_agents/catalog-feed-ops/src/)
- comando: `pnpm feed:dry-run [--source=fixture|shopify] [--seo] [--first=N] [--tenant=<id>]`
- relatórios: [`12_reports/merchant-dry-runs/`](../../../../../12_reports/merchant-dry-runs/)
- primeiro dry-run real: `_test-20260523-233340.{md,json}`
