# Flows — product-offer

Define a oferta (preço, bundle, posicionamento) por SKU/coleção. Combina sinais externos (Tier 1) com restrições do tenant (margem, marca, faixa).

## Fluxo 1 — Definir oferta de SKU

**Trigger:** `orchestrator-master` recebe intent `define_offer` (lançamento de SKU ou revisão periódica).

```
[1] receber scope (sku ou collection) + constraints + context_ref opcional
    │
    ▼
[2] shopify_product_read: estado atual (preço, custo, estoque, posicionamento)
    │
    ▼
[3] memory_read context_ref:
    │   market-intelligence: faixa de preço, ângulos quentes
    │   competitor-benchmark: como concorrente posiciona SKU similar
    │
    ▼
[4] checagens hard:
    │   estoque > 0 ? senão → erro StockUnavailable
    │   preço dentro de constraints.price_band ?
    │   margem ≥ constraints.margin_min ? senão → erro MarginInfeasible
    │
    ▼
[5] skills_pricing avalia 3 estratégias:
    │   - cost-plus (margem-base)
    │   - value-based (referencia competitor + tema marca)
    │   - dynamic (sensibilidade observada se houver baseline)
    │
    ▼
[6] llm_compose monta:
    │   offer.positioning: 1 sentença ("para corredor X que valoriza Y vs Z")
    │   offer.justification: 1 parágrafo citando ≥2 fontes do context_ref
    │
    ▼
[7] retornar offer + confidence
```

**Saída usada por:** `marketing-director` (input para creative_brief), `product-feed-seo` (positioning entra em title/description), `design-ux-localization` (ângulo central de PDP).

## Fluxo 2 — Bundle / coleção

**Trigger:** scope.kind=collection.

```
[1] iterar SKUs da coleção
[2] determinar quais SKUs compõem o bundle (heurística + restrições)
[3] preço do bundle: soma com desconto sugerido baseado em valor percebido
[4] positioning do bundle como um produto único
```

**Cuidado:** bundles cruzam atributos (cores, tamanhos). `governance-risk-qa` revisa antes de qualquer publicação.

## Fluxo 3 — Revisão dirigida por mudança de competidor

**Trigger:** alert do `competitor-benchmark` (delta de preço significativo).

```
[1] receber sinal + SKU afetado
[2] re-rodar Fluxo 1 com prioridade alta + scope=sku
[3] resultado é uma proposta de mudança (não aplica)
[4] orchestrator → governance → catalog-feed-ops apenas se aprovado
```

## Desvios

| Situação | Ação |
|---|---|
| Margem infeasível dentro do band | erro `MarginInfeasible`; sugere fora-band em `justification` |
| Estoque zerado | erro `StockUnavailable` |
| Context_ref ausente ou ralo | `justification` cita "low-confidence" + `confidence` baixa |
| Brand rules conflitam com positioning natural | escolher brand rules; reportar trade-off |

## Inputs/Outputs canônicos

- Schemas em `contract.yaml`.
- Fixtures em `tests/fixtures/`.

## Dependências de upstream

| Upstream | Como ajuda |
|---|---|
| `FlatNineOrg/ecommerce-skills` | heurísticas de offer / merchandising (via `@cao/skills/pricing` + `@cao/skills/copy`) |
| `coreyhaines31/marketingskills` | framing de positioning ICP-first (via `@cao/skills/marketing`) |
| `agency-ai-solutions/ad-factory-agent` | não direto neste agente — alimenta `creative-copy-assets` que consome `offer.positioning` |
