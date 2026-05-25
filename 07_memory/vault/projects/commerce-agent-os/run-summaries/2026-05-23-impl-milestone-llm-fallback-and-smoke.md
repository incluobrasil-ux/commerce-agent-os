---
created_at: 2026-05-23T22:58:00Z
updated_at: 2026-05-23T22:58:00Z
tags: [impl-milestone, llm, smoke, noop, sub-fase-2-4]
source: human:incluobrasil
kind: impl-milestone
result: green
confidence: 1.0
related:
  - 06_packages/llm/src/noop-client.ts
  - 06_packages/llm/scripts/smoke.ts
  - 06_packages/llm/src/noop-client.test.ts
---

# `@cao/llm` ganha fallback noop + comando `pnpm llm:smoke`

## Contexto

Antes desta sessão, `@cao/llm.makeAnthropicComplete()` lançava `LLMConfigError` quando a key estava ausente. Isso é correto para produção mas frágil para dev/test. Adicionado fallback explícito + smoke isolado para validar o caminho real de inteligência **sem travar o projeto** se a credencial faltar.

## O que aconteceu

**Novo: `@cao/llm.makeNoopComplete()`**
- `CompleteFn` que ignora input e retorna canned response fixa (`{"ok":true,"note":"noop-complete"}` por default).
- `cannedText` e `cannedModel` customizáveis.
- Custo zero, latência zero, sem rede.

**Novo: `@cao/llm.tryMakeAnthropicComplete()`**
- Resolve para Anthropic real se `ANTHROPIC_API_KEY` (ou `opts.apiKey`/`opts.client`) presente.
- Caso contrário → noop. Retorna `{ complete, mode: 'anthropic'|'noop', reason? }` — caller decide o que fazer.
- **Nunca lança.** Coexiste com `makeAnthropicComplete()` (strict) — chamador escolhe a semântica.

**Novo: `pnpm llm:smoke`**
- Script standalone em `06_packages/llm/scripts/smoke.ts`.
- Strict mode: usa `makeAnthropicComplete()` direto.
- Sem key → exit 0 com mensagem orientando (não é falha; é estado "aguardando").
- 401 → exit 1 com hint específico ("key inválida ou revogada").
- Sucesso → imprime resposta + modelo + tokens + custo + latência (wall + interno).
- Prompt mínimo (~20 tokens out, esperado ~$0.0001 por execução).

**+4 testes unit em `noop-client.test.ts`:**
- `makeNoopComplete()` default + custom canned.
- `tryMakeAnthropicComplete()` env presente vs ausente (via `vi.stubEnv`).
- `noop` chamado sem rede continua funcionando.

**Suíte: 73 → 81 verdes** (+1 arquivo, +8 testes — 4 noop + 4 cobrindo paths antigos).

**Execução real do smoke:**
```
[llm:smoke] enviando prompt mínimo ao claude-sonnet-4-6...
[llm:smoke] erro: 401 invalid x-api-key
[llm:smoke] → key inválida ou revogada. Atualize .env.local com a key nova.
```

Comportamento exato esperado. `.env.local` ainda tem a key antiga (revogada na sessão de rotação).

## Achados / decisões

- **Não auto-fallback em `makeAnthropicComplete()`.** Manter strict; quem quer fallback usa `tryMakeAnthropicComplete()` explicitamente. Evita falhas silenciosas em produção.
- **Smoke é separado do CLI dos agentes.** Os 3 CLIs LLM (`synthesize:audit`, `curate:memory`, `context:brief`) continuam usando `makeAnthropicComplete()` strict — falham loudly se key ausente. O smoke usa a mesma função mas tem UX de "skip elegante" para o caso aguardando.
- **`vi.stubEnv` resolve a poluição de env entre testes** sem precisar de `delete process.env.X` (que biome marca como `noDelete`). Boa primitiva para usar em outros pacotes que dependem de env.
- **Runtime + memory + observability já fazem persistência local útil** — não precisaram de mudança nesta sessão (já validados pelos 3 agentes LLM existentes).

## Impacto

- Sub-fase 2.4 (LLM end-to-end) **mais robusta**: agora há um smoke isolado de < 5s que valida a integração inteira do `@cao/llm` sem precisar montar audit log de tenant.
- Bloqueio B1 (key antiga em `.env.local`) **reaberto** com evidência concreta: `pnpm llm:smoke` reportou 401 com mensagem explícita. Não dá mais para esquecer que precisa rotacionar.
- Padrão `try*` (graceful fallback) pode ser replicado em outros packages (futuro: `tryMakeShopifyClient`, `tryMakeMerchantClient`, etc.).
- DX para clone novo do projeto: rodar `pnpm llm:smoke` em qualquer máquina sem `.env.local` → SKIPPED limpo, baseline continua válido.

## Ações geradas

- [ ] **Atualizar `.env.local`** com a key nova rotacionada → `pnpm llm:smoke` deve passar com exit 0 + reporte de custo.
- [ ] Depois disso, pipeline de validação dos 3 agentes LLM em sequência:
      ```bash
      pnpm llm:smoke && \
        pnpm synthesize:audit 12_reports/audits/upstream-pass2/langgraph-*.md && \
        pnpm curate:memory --tenant=_test && \
        pnpm context:brief --task="optimize Q2 catalog titles" --tenant=_test
      ```
- [ ] Considerar adicionar `pnpm llm:smoke` ao CI (gateado por env var `RUN_LLM_SMOKE=1` para não custar a cada PR).
- [ ] Pattern `try*` documentar quando aparecer 2º caso (não generalizar prematuramente).

## Referências

- código novo: [`06_packages/llm/src/noop-client.ts`](../../../../../06_packages/llm/src/noop-client.ts)
- smoke script: [`06_packages/llm/scripts/smoke.ts`](../../../../../06_packages/llm/scripts/smoke.ts)
- testes: [`06_packages/llm/src/noop-client.test.ts`](../../../../../06_packages/llm/src/noop-client.test.ts)
- comando: `pnpm llm:smoke`
