# Tests — product-feed-seo

Casos mínimos a cobrir:

- Char limit excedido → policy enforce trunca/regenera, nunca entrega over-limit.
- Palavra proibida → erro `PolicyViolation`.
- SKU inexistente → erro `SkuNotFound`.
- Toda mudança tem entrada em `signals_used` com `signal` não vazio.
- Diff explícito: `from != to` sempre.
- Quando `targets=[seo_pdp]`, não modifica campos específicos de GMC.
