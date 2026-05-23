# Flows — merchant-compliance

Fluxos operacionais. Dois modos principais: **preventivo** (audit antes de aplicar) e **corretivo** (após disapproval).

## Fluxo 1 — Audit preventivo de lote

**Trigger:** `orchestrator-master` invoca antes de `catalog-feed-ops` aplicar mudanças significativas.

```
[1] receber scope (SKUs ou feed snapshot) + policies[gmc, shopify, region:*]
    │
    ▼
[2] policy_load: carregar todas as regras das policies pedidas
    │
    ▼
[3] para cada SKU:
    │   shopify_product_read (campos auxiliares)
    │   skills_compliance:
    │     ├── GTIN check (válido? unique?)
    │     ├── taxonomy check (google_product_category na taxonomia oficial)
    │     ├── attribute completeness por categoria (apparel → gender, size, color obrigatórios)
    │     ├── claim check (palavras reguladas por região: 'cures', 'guaranteed', etc.)
    │     └── image policy (resolução mínima, fundo branco para categorias regulamentadas)
    │
    ▼
[4] findings[] populado com {sku, rule_id, severity, evidence}
    │
    ▼
[5] mode=audit?
    ├── sim → remediations vazio; sair
    └── remediate → tentar correção por finding com alta certeza:
        │ ex.: gtin malformatado mas com checksum reconstituível → corrigir
        │ ex.: taxonomia ausente → propor categoria via skill (incerta → não aplicar)
        │ aplicadas viram applied=true; demais applied=false
    │
    ▼
[6] compliance_summary: % aprovados por policy + overall_pass_rate
```

## Fluxo 2 — Reação a disapproval (corretivo)

**Trigger:** `catalog-feed-ops` retornou SKUs com `gmc_state=disapproved` (state-machine).

```
[1] orchestrator chama merchant-compliance com scope=disapproved_skus, mode=audit
[2] gmc_disapproval_read: motivos exatos da GMC por SKU
[3] mapear motivo GMC → rule_id interno (algumas regras GMC ↔ skills_compliance)
[4] findings populadas com severidade=hard (disapprovals são duros por definição)
[5] sugerir remediations:
    [a] correções automatizáveis (GTIN, taxonomy, gender ausente)
    [b] correções que exigem product-feed-seo (descrição, título)
    [c] não-corrigíveis automaticamente (políticas de conteúdo subjetivas)
[6] retornar para orchestrator que decide:
    [a] → catalog-feed-ops (apply direto)
    [b] → product-feed-seo (replay) → governance → catalog-feed-ops
    [c] → notificação humana via shopify-admin-app
```

## Fluxo 3 — Verificação periódica

**Trigger:** job semanal agendado em `merchant-service`.

```
[1] orchestrator chama merchant-compliance com scope=feed_snapshot, mode=audit, policies=[gmc, shopify, region:US, region:BR]
[2] mesmo Fluxo 1 mas em catálogo inteiro
[3] resultado persistido em 07_memory/<tenant>/working/merchant-compliance/<timestamp>.md
[4] alertas (severidade hard) → notificação humana
```

## Regiões e variações

- Política `gmc` é universal; políticas `region:*` adicionam camadas (ex.: claims de saúde mais estritos em EU).
- Quando policies conflitam (raramente), a mais restritiva ganha.
- `compliance_summary.by_policy` sempre quebra por policy individual para diagnose.

## Critérios de qualidade

- **Nunca** alterar SKU em `mode=audit` (mesmo trivialmente).
- **Nunca** marcar como `applied=true` algo que tem ambiguidade — `mode=remediate` é conservador.
- Todo finding cita `rule_id` da política — nada genérico tipo "parece errado".

## Inputs/Outputs canônicos

- Fixtures em `tests/fixtures/`.

## Dependências de upstream

| Upstream | Como ajuda |
|---|---|
| `google/merchant-api-samples` | endpoints para `productstatuses.get` (disapproval reasons) + schemas de Issues |
| `google-marketing-solutions/feedgen` | n/a (feedgen é geração, não compliance) |
