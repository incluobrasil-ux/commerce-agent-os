---
tipo: runbook
workstream: site
status: pendente-de-aplicacao
tags: [site, redirect, movecon, seo]
atualizado: 2026-08-20
---

# Redirects 301 — reescrita de vocabulário de 20/08/2026

> **Estado: PENDENTE.** Os arquivos em `build/` já estão gerados com os slugs
> novos, mas o WordPress ainda serve os antigos. Enquanto os 301 não forem
> aplicados, as três URLs abaixo respondem 404 para quem chega pelo Google.

## Por que os slugs mudaram

Decisão do cliente em 20/08/2026: retirar do site o vocabulário de golpe/fraude
e o termo "plataforma". Três páginas tinham o termo no próprio slug, então a
mudança de conteúdo arrastou a mudança de URL.

## As três rotas

| # | URL antiga (no ar) | URL nova | Arquivo gerado |
|---|---|---|---|
| 1 | `/consorcio-contemplado/golpes-mais-comuns/` | `/consorcio-contemplado/o-que-conferir/` | `build/filha-contemplado-o-que-conferir.html` |
| 2 | `/guia/contemplacao-garantida-e-golpe/` | `/guia/como-a-contemplacao-acontece/` | `build/guia-como-a-contemplacao-acontece.html` |
| 3 | `/blog/golpe-consorcio-como-identificar/` | `/blog/como-verificar-uma-administradora/` | `build/artigo-como-verificar-uma-administradora.html` |

## Ordem de execução

A ordem importa: publicar antes de redirecionar, senão o 301 aponta para 404.

1. **Subir as três páginas novas** pelo fluxo padrão do HANDOFF (scp para
   `/tmp/`, depois `wpcli-movecon.sh post create ... --post_name=<slug novo>`).
   Lembrar do `wp post meta update <ID> site-post-title disabled` em cada uma.
2. **Conferir que as três respondem 200** antes de seguir.
3. **Aplicar os 301** no Rank Math (Painel → Rank Math → Redirecionamentos),
   um por linha da tabela, tipo 301 permanente.
4. **Despublicar as três páginas antigas** (mover para lixeira, não excluir
   definitivamente até o 301 estar confirmado).
5. **Reenviar o sitemap** no Search Console e pedir reindexação das três URLs
   novas.
6. Rodar `python scripts/auditar_onpage.py` — as três devem sair de 404.

## Páginas alteradas que NÃO mudam de URL

Estas mudaram de conteúdo e precisam ser republicadas no mesmo slug:

- `/` (home) — seção "Por que a MOVECON", eyebrow do hero, card do contemplado, FAQ
- `/quem-somos/`
- `/administrado-pela-alpha/`
- `/seguranca/`
- `/avaliacoes/`
- `/contato/`
- `/consorcio-contemplado/` (hub)
- `/perguntas/` · `/glossario/` · `/guia/` (índice) · `/blog/` (índice)
- `/autor/samuel-tanan/` e a caixa de autor de todos os artigos
- as 14 LPs de `/lp/` (FAQ "Como confiro a autorização da administradora?")
- os artigos que citavam as rotas antigas: `assembleia-de-consorcio`,
  `como-transferir-consorcio-para-outra-pessoa`, `consorcio-para-sair-do-aluguel`,
  `o-que-perguntar-antes-de-contratar-consorcio`,
  `por-que-a-parcela-do-consorcio-aumentou`, `quanto-dar-de-lance-no-consorcio`,
  `administradora-de-consorcio-quebrar`

## mu-plugins que mudaram (subir para `wp-content/mu-plugins/`)

- `movecon-header-footer.php` — rodapé global e rodapé de LP
- `movecon-seo.php` — bloco de contexto do `/llms.txt`
- `movecon-autor.json` — bio do schema `Person` (fica ao lado do
  `movecon-schema-artigos.php`)
