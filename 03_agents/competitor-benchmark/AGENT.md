# competitor-benchmark

## Missão
Monitora concorrentes nomeados (preço, catálogo, copy, reviews, presença em SERP). Detecta deltas entre snapshots ao longo do tempo.

## Entradas
- `tenant_id`
- `competitors`: lista de identificadores (domínios, lojas, IDs)
- `dimensions`: o que medir (`price`, `catalog`, `copy`, `reviews`, `serp`)
- `since` (opcional): timestamp do último snapshot para diff

## Saídas
- `snapshot`: dados coletados no momento
- `deltas`: mudanças desde `since`
- `alerts`: subset dos deltas marcados como significativos por política

## Dependências
- Packages: `@cao/llm`, `@cao/memory`.
- Integrations: `05_integrations/brightdata`.

## Relação com outros agentes
- **Invocado por:** `orchestrator-master`, `market-intelligence`.
- **Alimenta:** `product-offer` (ajustes de preço/oferta), `marketing-director` (posicionamento).

## Upstream relacionado
- `brightdata/competitive-intelligence`.

## Status
Stub. Sem implementação.
