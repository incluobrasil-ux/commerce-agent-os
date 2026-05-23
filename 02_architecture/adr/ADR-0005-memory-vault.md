# ADR-0005 — Layout do vault de memória

- **Data:** 2026-05-23
- **Status:** aceita
- **Supersede:** —

## Contexto

Memória persistente dos agentes vive em `07_memory/`. Sem layout canônico, cada agente inventa o seu, multi-tenant vira inseguro, e `learning-memory-curation` não consegue raciocinar sobre a estrutura.

## Decisão

### Layout

```
07_memory/
└─ vault/
   ├─ _template/                  # estrutura de referência (não é tenant real)
   │  ├─ facts/                   # fatos estáveis promovidos
   │  ├─ working/                 # working memory recente
   │  ├─ voc/                     # voice of customer
   │  ├─ competitor-benchmark/
   │  │  └─ <competitor>/<timestamp>.md
   │  ├─ audit/                   # logs de ação por agente
   │  └─ README.md
   └─ <tenant_id>/                # mesma estrutura por tenant
      ├─ facts/
      ├─ working/
      ├─ voc/
      ├─ competitor-benchmark/
      └─ audit/
```

### Regras

1. **Particionamento por tenant é estrito.** Caminhos canonicalizados por `vault/<tenant_id>/`. `@cao/memory` rejeita qualquer leitura/escrita que tente sair da pasta do tenant.
2. **`_template/`** é a **referência canônica**. Quando um tenant novo é provisionado, a estrutura é copiada do template.
3. **Buckets fixos:** `facts`, `working`, `voc`, `competitor-benchmark`, `audit`. Novos buckets exigem ADR.
4. **Arquivos são markdown** com frontmatter YAML para metadados (created_at, tags, source, confidence).
5. **`audit/` é append-only**, jamais editado.
6. **`facts/`** só recebe promoções por `learning-memory-curation` com evidência (mínimo 2 ocorrências distintas).
7. **`working/`** pode ser higienizado pelo curator (consolidar/demote/delete).
8. **`competitor-benchmark/<competitor>/<timestamp>.md`** preserva snapshots para cálculo de delta — não regravar arquivos antigos.

### Naming de arquivo

- `kebab-case-slug.md` com no máximo 80 chars.
- Slug não contém data — data vive no frontmatter ou no path (`<timestamp>.md` apenas em snapshots).

## Consequências

**Positivas**
- Cross-tenant leak fica difícil — caminho enforce.
- `memory-context` tem regras claras de onde ir buscar.
- `learning-memory-curation` opera sobre estrutura conhecida.
- Migração futura para outro backend (vetorial, DB) preserva a abstração.

**Negativas**
- Sync entre máquinas exige strategia (git, Drive, S3 sync) — não resolvido aqui.
- Markdown não é o mais eficiente para queries complexas — aceitar trade-off em troca de auditabilidade humana.

## Pendências

- Política de retenção por bucket (quanto tempo `working/` antes de demote/delete) — em `SUCCESS_CRITERIA.md` para v1.
- Estratégia de backup/sync — ADR futuro.
- Schema canônico de frontmatter — em `@cao/shared-schemas` quando implementado.
