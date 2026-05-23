# Flows — catalog-feed-ops

Fluxos operacionais concretos. Atomicidade por SKU + idempotência são invariantes em todos os fluxos.

## Fluxo 1 — Aplicar lote aprovado (caminho feliz)

**Trigger:** `orchestrator-master` recebe `changes` aprovadas (output de `product-feed-seo` aprovado por `governance-risk-qa`).

```
[1] receber changes[] com approved_by populado
    │
    ▼
[2] validar: cada change tem approved_by? (senão → ChangesUnapproved e parar)
    │
    ▼
[3] mode=dry_run?
    ├── sim → simular cada change; populate skipped[] com reason="dry_run"; retornar
    └── não → continuar
    │
    ▼
[4] para cada SKU em paralelo (limite de concorrência via runtime):
    │   idempotency_guard.key = hash(sku, field, value, tenant)
    │   ├── já aplicado? → skipped[] com reason="idempotent_replay"
    │   └── novo:
    │        shopify_product_write  → aplica no Shopify
    │        gmc_product_write      → aplica no Merchant Center
    │        audit_log              → registra escrita
    │        applied[] += {sku, field, external_ids, ms}
    │
    ▼
[5] pós-apply: por SKU em applied[], chamar gmc_product_status
    │   feed_status[] += {sku, gmc_state, issues}
    │
    ▼
[6] retornar para orchestrator
```

**Saída:** se algum SKU caiu em `gmc_state=disapproved`, `orchestrator` deve invocar `merchant-compliance` automaticamente (state-machine).

## Fluxo 2 — Sincronização Shopify → GMC (deriva detectada)

**Trigger:** webhook Shopify `products/update` ou job agendado de drift detection.

```
[1] orchestrator chama catalog-feed-ops com scope=sync_drifted
[2] para cada SKU: ler Shopify + ler GMC; calcular delta
[3] delta non-trivial? → preparar internal_changes com approved_by="system:drift_sync"
[4] policy_enforce: drift_sync só vale para campos não-marketing (preço, estoque, status)
[5] aplicar como Fluxo 1
```

**Por que separado:** evita que mudança operacional do lojista (subir preço) requeira fluxo cognitivo (governance LLM); approved_by="system:drift_sync" tem audit diferente.

## Fluxo 3 — Agendamento

**Trigger:** `schedule` populado no input (cron-like ou one-shot).

```
[1] catalog-feed-ops registra job no worker queue do merchant-service
[2] no momento agendado:
    [a] orchestrator dispara catalog-feed-ops com mesmo changes[]
    [b] re-validar: as approvações ainda são válidas? (ex.: <24h)
        ├── sim → executar Fluxo 1
        └── não → marcar todas changes como skipped, reason="approval_expired"
```

**Cuidado:** approvações têm TTL — escrever sem revalidar é antipattern.

## Atomicidade e falhas

- Cada SKU é uma transação atômica. Shopify writes podem suceder e GMC podem falhar — nesse caso, a entrada em `applied[]` carrega `external_ids.gmc=null` + audit registra inconsistência. **Não rollback automático no Shopify** (rollback frequente cria mais drift).
- Failure de provider mid-batch isola: SKUs anteriores ficam em `applied`; SKU atual em `skipped` com reason específico; SKUs posteriores tentam normalmente.

## Inputs canônicos

Fixture: `tests/fixtures/sample-input.json`.

## Outputs canônicos

Fixture: `tests/fixtures/sample-output.json`.

## Dependências de upstream

| Upstream | Como ajuda |
|---|---|
| `google/merchant-api-samples` | endpoints corretos para products.insert / products.update / productstatuses.get; padrões de retry |
| `google-marketing-solutions/feedgen` | n/a aqui (feedgen é geração; este agente é aplicação) |
