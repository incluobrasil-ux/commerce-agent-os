---
created_at: 2026-05-25T17:10:00Z
updated_at: 2026-05-25T17:10:00Z
tags: [agents, sub-fase-2.5, bloco-b]
source: human:incluobrasil-ux
kind: impl-milestone
result: green
confidence: 1.0
related:
  - 03_agents/marketing-director/
  - 03_agents/creative-copy-assets/
  - 03_agents/design-ux-localization/
  - 03_agents/traffic-campaigns/
---

# Bloco B Sub-fase 2.5 — 4 agentes novos (marketing/creative/design/traffic)

## Contexto

Auditoria desta sessão revelou descompasso entre brain e código: brain reportava "4–6 agentes reais", reality eram 16 REAL_EXECUTABLE. Faltavam 4 do Bloco B priorizado pelo usuário: `marketing-director`, `creative-copy-assets`, `design-ux-localization`, `traffic-campaigns`. Pastas declarativas existiam (AGENT.md, contract.yaml, prompt.md), mas sem `src/` nem `package.json`.

## O que aconteceu

- Validado baseline: 202 testes verdes, typecheck OK, lint OK.
- Branch `feat/system-retomada-operacional` criada.
- Lido pattern de `product-offer` (Tier-2) como template.
- Implementados os 4 agentes seguindo o padrão `defineAgent + zod + runAgent + Memory.write + --capture`:
  - **marketing-director** → `pnpm marketing:plan` — plano de iniciativas (canais/budget/KPI/risco) salvo em `<tenant>/marketing/`.
  - **creative-copy-assets** → `pnpm creative:assets` — variantes de copy por canal/locale + brief visual em `<tenant>/creative/`.
  - **design-ux-localization** → `pnpm design:ux` — blueprint de PDP + copy localizado por mercado + notas A11y em `<tenant>/design/`.
  - **traffic-campaigns** → `pnpm traffic:plan` — dry-run de plano de mídia (channel mix, audiências, hipóteses, scale scenarios) em `<tenant>/traffic/`. **Não compra mídia.**
- Wired em `tsconfig.json` (composite refs) + `package.json` scripts.
- `pnpm install` registrou os 4 novos packages no workspace.
- Auto-format aplicou 7 fixes (linhas > 100 char no `cli.ts` dos 4 novos).
- Re-validação final: typecheck OK, lint OK, **228 testes verdes em 33 arquivos** (+26 novos), smoke OK, doctor exit 0.

## Achados / decisões

- **Brain estava muito stale**: dizia 4 agentes reais, suíte 126 testes. Reality (pré-sessão): 16 reais, 202 testes. Pós-sessão: **20 reais, 228 testes**.
- README também desalinhado ("baseline arquitetural + 1 agente real funcional") — atualizado nesta milestone.
- Os 4 novos agentes **não dependem de credenciais externas** além de `ANTHROPIC_API_KEY` (graceful skip caso ausente — padrão do monorepo).
- Roles bem definidas, sem overlap com `ads-launchpad` (tactical ad campaign launch) ou `marketing-director` (strategic plan rollup).

## Impacto

- **20/22 agentes** agora REAL_EXECUTABLE (era 16). Restam apenas `analytics-optimization` (não scaffoldado) e `product-feed-seo` (library-only intencionalmente, sem CLI).
- Cobertura completa do Bloco A+B priorizado pelo usuário.
- 4 novos comandos no DX: `pnpm marketing:plan`, `pnpm creative:assets`, `pnpm design:ux`, `pnpm traffic:plan`.
- Próxima sub-fase pode focar em integração entre agentes (handoff marketing-director → creative-copy-assets → design-ux-localization) ou em melhorar Merchant MVP.

## Ações geradas

- [x] Atualizar `current-state.md`, `workstreams.md` (W2 status), `next-actions.md` para refletir reality.
- [x] Atualizar README.md removendo claims stale.
- [ ] Phase 4 (próximo): auditar `merchant-compliance` + `catalog-feed-ops` e enhance score/findings por SKU se gap encontrado.
- [ ] Próximo bloqueio externo continua sendo `.env.local` com Anthropic key rotacionada (para runs reais).

## Referências

- código: `03_agents/marketing-director/src/`, `creative-copy-assets/src/`, `design-ux-localization/src/`, `traffic-campaigns/src/`
- pattern referência: `03_agents/product-offer/src/`
- root config: `tsconfig.json:36-46`, `package.json:30-33`
