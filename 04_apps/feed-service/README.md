# feed-service

Serviço cognitivo de geração/otimização de feed. **Separado de `merchant-service`** para isolar carga LLM (latência + custo) das loops operacionais de sincronização.

## Stack

- Node 20+ / TypeScript
- Worker pool com concorrência limitada (chamadas LLM são caras + lentas)
- Sem HTTP público — recebe trabalho via worker queue interna do `merchant-service`

## Relação com `feedgen` (upstream)

A lógica de otimização adapta `google-marketing-solutions/feedgen`:

- **Heurísticas** (que campos otimizar, ordem, fallback) ⇒ portadas para `@cao/skills/feed-optimization/`.
- **Prompts** ⇒ catalogados em `src/prompts/` deste serviço (versionados, A/B testáveis).
- **Pipeline de Sheets/Apps Script** ⇒ não portamos; nosso input é Shopify/GMC direto via integrations.

Duas opções para a parte Python do `feedgen`:
1. **Port para TS** (preferido) — controle total, sem subprocess overhead.
2. **Sidecar Python** — preserva fidelidade ao upstream; pior DX.

ADR em aberto. Padrão: começar com cherry-pick de heurísticas para TS.

## Estrutura

```
feed-service/
├─ src/
│  ├─ workers/             consome fila vinda de merchant-service
│  ├─ pipelines/           ingest → optimize → propose → return
│  ├─ prompts/             prompts versionados (markdown + frontmatter)
│  ├─ orchestration/       invocações ao @cao/runtime
│  └─ server.ts            health endpoint + boot
├─ package.json
├─ tsconfig.json
├─ .env.example
└─ .gitignore
```

## Pipelines

```
[fila reanalyze-product]
        │
        ▼
[ingest]      ler dados atuais (shopify + gmc report)
[optimize]    skills_feed_optimization (heurísticas + prompts)
[propose]     consolida diff e signals_used
[return]      enqueue resposta para merchant-service / orchestrator
```

## Deps internas

- `@cao/runtime`, `@cao/llm`, `@cao/skills`, `@cao/observability`, `@cao/guardrails`
- `@cao/shared-types`, `@cao/shared-schemas`, `@cao/shared-config`
- `05_integrations/shopify` (leitura)
- `05_integrations/google-merchant` (leitura de reports)

## Não fazer aqui

- Aplicar mudanças. Apenas propõe — `catalog-feed-ops` (no `merchant-service`) aplica.
- Sincronização operacional. Vai para `merchant-service`.

## Status

Esqueleto criado. Sem implementação. Decisão pendente sobre TS vs sidecar Python para `feedgen`.

## Pendências

- ADR-0006: estratégia para `feedgen` (TS port vs sidecar).
- Catalogar primeiros prompts em `src/prompts/` (placeholder).
- Definir provedor LLM default (Anthropic vs Gemini — Gemini é o usado em `feedgen` original).
