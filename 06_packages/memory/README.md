# @cao/memory

Memória persistente markdown-first. CRUD + busca + tenancy.

## API prevista
- `read(tenant, path)`, `write(tenant, path, content, frontmatter?)`.
- `search(tenant, query, { topK, scopes })` — busca textual + (opcional) semântica.
- `bundle(tenant, query, { tokenBudget })` — materializa contexto para `memory-context`.
- `snapshot(tenant, scope)` — para `competitor-benchmark`.
- `curate(tenant, ops[])` — aplicado por `learning-memory-curation`.
- Tenancy enforced: path canonicalizado por `<tenant>/...`; cross-tenant proibido.

## Layout em disco
```
07_memory/
└─ <tenant_id>/
   ├─ facts/              # fatos estáveis promovidos
   ├─ working/            # working memory recente
   ├─ voc/                # voice of customer
   ├─ competitor-benchmark/<competitor>/<timestamp>.md
   └─ audit/              # logs de ação
```

## Upstream
- `01_upstreams/basic-memory` (base operacional).
- `01_upstreams/obsidian-agent-memory-skills` (inspiração de skills).

## Status
Stub.
