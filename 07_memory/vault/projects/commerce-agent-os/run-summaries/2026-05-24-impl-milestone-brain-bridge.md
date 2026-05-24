---
created_at: 2026-05-24T00:10:00.000Z
updated_at: 2026-05-24T00:10:00.000Z
tags: [impl-milestone, brain, ops-capture, automation]
source: human:incluobrasil
kind: impl-milestone
result: green
confidence: 1.0
related:
  - 06_packages/brain-bridge/src/capture.ts
  - 06_packages/brain-bridge/src/markdown-utils.ts
  - 06_packages/brain-bridge/scripts/capture-cli.ts
  - 03_agents/repo-auditor/src/cli.ts
  - 03_agents/catalog-feed-ops/src/cli.ts
---

# `@cao/brain-bridge` — ponte mínima entre execução e cérebro

## Contexto

Cérebro até agora era atualizado manualmente após cada execução relevante. Esta entrega criou a **ponte mínima** que faz isso virar 1 flag (`--capture`) ou 1 comando (`pnpm ops:capture <input.json>`). Sem automação pesada — apenas escrita determinística em arquivos markdown.

## O que aconteceu

**1. `@cao/brain-bridge` (novo package):**
- `captureRun(input)`: 1 chamada → escreve run-summary + atualiza index + bump `updated_at` em current-state. Opcionalmente: append entrada em session-log; novos blocos em next-actions; novas linhas em operational-priorities (bucket correto); novos bloqueios em blockers-and-risks.
- `markdown-utils.ts`: `bumpUpdatedAt`, `insertAfterAnchor` (robusto a prosa entre heading e tabela), `insertBeforeHeading`.
- 10 unit tests cobrindo cada caminho + 3 testes diretos dos utils. Tmp brain skeleton para isolamento total.
- Suíte 124 → **126 verdes**.

**2. `pnpm ops:capture <input.json>` (CLI standalone):**
- Aceita JSON conforme `CaptureInput` schema (zod-validado).
- Útil para humanos OU scripts externos quererem registrar uma execução.

**3. `--capture` integrado em 2 CLIs ricos:**
- `pnpm audit:repo <path> --capture`: ao final, gera summary tipo `audit` com findings agregados + bump current-state.
- `pnpm feed:dry-run --capture`: ao final, gera summary tipo `agent-run` com counts ok/fail/warnings + lista de fails.
- Outros CLIs (`llm:smoke`, `shopify:list-products`, `synthesize:audit`, `curate:memory`, `context:brief`) continuam funcionando — usuário roda `ops:capture` manual quando quiser.

**4. Validação real:**
- `pnpm audit:repo . --profile=license --capture` → gerou 4 arquivos atualizados (summary + index + session-log + current-state).
- `pnpm feed:dry-run --capture` → gerou 4 arquivos atualizados.
- Descobriu **2 bugs reais** no markdown-utils que NÃO apareceram nos testes unit:
  - `insertAfterAnchor` parava em prosa descritiva entre heading e tabela → corrigido (avança até achar separador `|---|`).
  - `sessionLogLine` regex `^(---\s*\n)/m` pegava o `---` do frontmatter em vez do separador depois do header → corrigido (busca `^## YYYY-MM-DD` em vez disso).

## Achados / decisões

- **Não auto-modifica current-state.md além do `updated_at`.** Mudança de conteúdo (verde/red, marcos) continua decisão humana — capture só sinaliza que algo aconteceu. Operador edita conscientemente. Evita drift silencioso.
- **`--capture` é opt-in, não default.** Roda algo trivial 100 vezes não enche o cérebro de ruído. Operador decide quando vale registrar.
- **Padrão de slug:** `<kind>-<event-id>-<context>` em kebab-case. Regex `[a-z0-9-]+` no schema rejeita underscores → adicionado normalizador `replace(/[^a-z0-9-]/gi, '-').toLowerCase()` nos CLIs.
- **Index é append-only por design.** Se rodar `--capture` duas vezes para o mesmo evento, vira 2 linhas no index. Operador pode limpar manualmente; preferimos isso a deduplicar e ocultar.
- **Testes unit ≠ testes integrados.** Os testes com tmp brain pegaram bugs lógicos, mas só rodar no brain real expôs:
  - Prosa entre `## Audits\n\n` e `| Data | ... |` (não havia esse caso no fixture).
  - Frontmatter com `---\n...\n---` que confunde regex global `^---$/m`.
  - Lição: **sempre rodar a integração real em arquivo de produção pelo menos 1x** antes de commitar utilities de manipulação de texto.

## Impacto

- **6 CLIs do sistema** (`audit:repo`, `synthesize:audit`, `curate:memory`, `context:brief`, `llm:smoke`, `shopify:list-products`, `feed:dry-run`) podem agora alimentar o cérebro com 1 flag ou 1 comando. Total comandos `pnpm`: **8**.
- Cérebro deixa de ser "memória curada manual" e passa a ser "memória que absorve a operação". Sem pesado: tudo continua markdown comitado em git.
- Próximo agente novo (Tier 1+) já sai sabendo que tem `@cao/brain-bridge.captureRun` para conectar ao cérebro.
- Caminho preparado para futura agentic-loop: agente roda → escreve audit log → captureRun → cérebro atualizado → próximo agente lê context.

## Ações geradas

- [ ] Quando criar próximo agente, adicionar `--capture` no CLI dele (5 linhas, padrão dos 2 existentes).
- [ ] Quando passar de ~20 run-summaries no index, considerar partition por kind ou trilha.
- [ ] Considerar adicionar `--capture` aos outros 5 CLIs existentes (caso operadores prefiram um único padrão).
- [ ] Avaliar (não fazer agora): hook em `@cao/runtime.runAgent()` que automaticamente captura quando `result.outcome === 'error'` ou `cost > threshold`.

## Referências

- código: [`06_packages/brain-bridge/src/`](../../../../../06_packages/brain-bridge/src/), [`06_packages/brain-bridge/scripts/capture-cli.ts`](../../../../../06_packages/brain-bridge/scripts/capture-cli.ts)
- CLIs integrados: [`03_agents/repo-auditor/src/cli.ts`](../../../../../03_agents/repo-auditor/src/cli.ts), [`03_agents/catalog-feed-ops/src/cli.ts`](../../../../../03_agents/catalog-feed-ops/src/cli.ts)
- comandos: `pnpm ops:capture <input.json>` / `pnpm audit:repo <path> --capture` / `pnpm feed:dry-run --capture`
