# shopify-theme

App de tema/storefront Shopify (Liquid + JS). **Não é package pnpm** — gerenciado pelo Shopify CLI (`shopify theme ...`).

## Stack

- Shopify Liquid (engine de template do Shopify)
- Vanilla JS / Web Components no `assets/`
- CSS sem framework por padrão (Tailwind opcional — a decidir)

## Relação com Dawn (upstream)

Este tema **não é um fork** de [Shopify/dawn](https://github.com/Shopify/dawn). Quando `01_upstreams/dawn/` estiver presente:

- Usar como **referência conceitual** de seções, snippets e padrões de acessibilidade.
- Copiar **ideia**, não código. Reescrever em nossa estrutura.
- Decidir caso a caso: alguns blocos genéricos (header, footer, cart drawer) podem ser quase idênticos por convenção Shopify — manter atribuição em comentário do arquivo.

## Estrutura

```
shopify-theme/
├─ assets/             JS, CSS, imagens, fontes (referenciados via {{ 'foo.css' | asset_url }})
├─ config/
│  ├─ settings_schema.json   contrato de configuração do tema (visível no Theme Editor)
│  └─ settings_data.json     valores atuais (versionado, mas sobrescrito pelo Editor)
├─ layout/
│  └─ theme.liquid           layout raiz; contém {{ content_for_layout }}
├─ locales/
│  ├─ en.default.json        locale default
│  └─ pt-BR.json
├─ sections/                 blocos reutilizáveis (com schema para o Theme Editor)
├─ snippets/                 partials sem schema (incluídos via {% render %})
├─ templates/                templates por tipo de página
│  ├─ index.json             home
│  ├─ product.json           PDP
│  ├─ collection.json
│  ├─ cart.json
│  ├─ search.json
│  ├─ page.json
│  ├─ blog.json
│  ├─ article.json
│  ├─ 404.json
│  └─ customers/
│     ├─ account.json
│     ├─ login.json
│     └─ register.json
├─ shopify.theme.toml        metadados do tema para o Shopify CLI
└─ .shopifyignore            arquivos ignorados no push
```

## Convenções autorais

- **Sections com schema** vivem em `sections/`. Cada arquivo `.liquid` termina com bloco `{% schema %}...{% endschema %}` em JSON. Nome do arquivo = nome da section (kebab-case).
- **Snippets sem schema** vivem em `snippets/`. Incluídos via `{% render 'name', arg: value %}`.
- **Templates** preferencialmente em **JSON** (não `.liquid`) — facilita customização via Theme Editor.
- **Assets** versionados; nada gerado em build aqui (Shopify CLI faz upload direto).
- **Locales** em JSON flat por idioma; chave em camelCase.

## Como rodar (quando configurado)

```
cd 04_apps/shopify-theme
shopify theme dev      # túnel local + preview
shopify theme push     # publicar em loja de dev
```

Requer Shopify CLI + autenticação em uma loja Shopify de desenvolvimento.

## Conexão com agentes/apps

- `design-ux-localization` produz **blueprints** que este tema implementa (mapeia para sections existentes).
- `shopify-admin-app` instala/atualiza este tema via Theme API quando aplicável.
- Storefront público **não chama nossos serviços diretamente** — toda lógica de domínio mora no admin-app.

## Status

Esqueleto criado. Sections, snippets e templates são placeholders. Implementação real depende de:
- Clonar `01_upstreams/dawn` para referência (Fase 6).
- Definir loja Shopify de desenvolvimento.
- Decidir uso (ou não) de Tailwind.
