# Tests — design-ux-localization

Casos mínimos a cobrir:

- Tema não tem section requerida → erro `ThemeIncompatible`.
- Locale fora da matriz suportada → erro `LocaleUnsupported`.
- `localized_copy` cobre todos os locales em `target_markets`.
- `media_brief` é compatível com schema de input de `creative-copy-assets`.
- Preço sempre como token formatável, nunca string fixa.
