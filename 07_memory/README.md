# 07_memory

Memória operacional dos agentes. **Markdown-first** — arquivos `.md` com frontmatter YAML são a verdade; embeddings/índices são derivações.

## Layout

```
07_memory/
└─ vault/
   ├─ _template/      # estrutura canônica de referência (não é tenant real)
   └─ <tenant_id>/    # uma pasta por loja Shopify
```

Estrutura interna de cada tenant — ver `vault/_template/README.md` e [ADR-0005](../02_architecture/adr/ADR-0005-memory-vault.md).

## Regras-chave

- **Isolamento por tenant é estrito.** `@cao/memory` rejeita qualquer leitura/escrita fora do `<tenant_id>/` solicitado.
- **Buckets fixos:** `facts`, `working`, `voc`, `competitor-benchmark`, `audit`. Novos buckets exigem ADR.
- **`audit/` é append-only.**
- Nada de PII em `working/` ou `voc/` sem necessidade — `@cao/guardrails` faz scrub.
- Provisionamento de tenant novo = copiar `_template/` para `<tenant_id>/`.

## Quem escreve aqui

| Agente | Escreve em |
|---|---|
| `memory-context` | só lê |
| `learning-memory-curation` | reorganiza, promove para `facts/`, demote/delete em `working/` |
| `competitor-benchmark` | `competitor-benchmark/<competitor>/<timestamp>.md` (append) |
| `reviews-ops` | `voc/` |
| qualquer agente | `audit/` (via `@cao/observability`) |

## Não fazer

- Não commitar conteúdo de `vault/<tenant_id>/` em git (privacy + ruído). `vault/_template/` **pode** ser commitado.
- Não armazenar binários (imagens, vídeos) aqui — só refs (URLs/IDs). Object storage tem outro escopo.
