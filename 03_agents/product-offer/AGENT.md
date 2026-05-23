# product-offer

## Missão
Define a oferta para um SKU ou coleção: preço, bundling, posicionamento, ângulo de venda. Combina dados de competidor, margem, estoque e sinais de mercado.

## Entradas
- `tenant_id`
- `scope`: SKU ID, coleção ou categoria
- `constraints`: margem mínima, faixa de preço, regras de marca
- `context_ref` (opcional): bundle de market-intelligence e competitor-benchmark

## Saídas
- `offer.price`
- `offer.bundle`: itens incluídos quando aplicável
- `offer.positioning`: texto curto descrevendo o ângulo
- `offer.justification`: por que essa oferta dados os inputs
- `confidence`: 0..1

## Dependências
- Packages: `@cao/llm`, `@cao/skills`, `@cao/memory`.
- Integrations: `05_integrations/shopify` (ler estoque/margem/preço atual).

## Relação com outros agentes
- **Invocado por:** `orchestrator-master`, `marketing-director`.
- **Alimenta:** `creative-copy-assets`, `product-feed-seo`, `catalog-feed-ops`.
- **Lê de:** `market-intelligence`, `competitor-benchmark`.

## Upstream relacionado
- nenhum direto; padrões em `FlatNineOrg/ecommerce-skills` (inspiração).

## Status
Stub. Sem implementação.
