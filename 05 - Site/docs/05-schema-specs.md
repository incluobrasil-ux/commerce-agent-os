# 05 — Schema e metadados

> **Correção 3 do cliente (26/07/2026): ignorar a instrução do manual sobre
> Rank Math.** Este documento registra o mecanismo real, verificado no
> documento servido.

## O Rank Math não renderiza nada

O plugin está ativo. `grep -ci "rank math"` no HTML servido retorna **0**.

Escrever metadado ou schema nos campos dele **não chega ao usuário nem ao
Googlebot**. Nunca escrever lá.

## Quem emite o quê

| Arquivo | Emite |
|---|---|
| `mu-plugins/movecon-seo.php` | `<title>`, `<meta description>`, noindex, `Organization` + `parentOrganization` (FinancialService), `BreadcrumbList`, `FAQPage`, `/llms.txt`, `/sitemap-movecon.xml`, `robots.txt` |
| `mu-plugins/movecon-schema-artigos.php` | `Article` + `ItemList` + `FAQPage` das rotas de `/blog/` |
| WordPress core | `rel="canonical"` |

**Canonical é do core.** O mu-plugin já emitiu o dele uma vez e duplicou a tag.
Não reintroduzir.

## Como o metadado é resolvido

`movecon-seo.php` casa a **URL atual** contra `content/keyword-map.json`:

```
mv_path_atual()  ->  '/consorcio-imoveis/'
mv_rota(url)     ->  a entrada do mapa
                 ->  title, description, indexavel, pai, camada
```

**Consequência:** página que não está no keyword-map sai sem title e sem
description próprios. Registrar a rota em `scripts/portar_mapa.py` **antes** de
criar a página no WordPress.

## Schema servido hoje, por tipo de página

Verificado em 26/07/2026:

| Página | Tipos emitidos |
|---|---|
| `/` | Organization, FinancialService, PostalAddress, PropertyValue, Country |
| Hub e filha | BreadcrumbList, FAQPage, Question, Answer, ListItem |
| Guia | BreadcrumbList, FAQPage, Question, Answer, ListItem |
| `/glossario/` | BreadcrumbList, ListItem |
| `/blog/<artigo>/` | Article, ItemList, FAQPage, BreadcrumbList, Organization |

## Organization — a regra que não muda

```json
{
  "@type": "Organization",
  "name": "MOVECON",
  "parentOrganization": {
    "@type": "FinancialService",
    "name": "Alpha Administradora de Consórcio Ltda.",
    "identifier": { "@type": "PropertyValue", "name": "Certificado Bacen", "value": "03/100/213/88" }
  }
}
```

A MOVECON é `Organization`. **Nunca `FinancialService`** — esse tipo descreve
quem presta serviço financeiro, e atribuí-lo à MOVECON afirmaria em dados
estruturados o que o contrato social não permite. Só a Alpha é
`FinancialService`.

## FAQPage — uma por página

A FAQ vem de `content/faq-map.json`, chaveado por URL, gerado pelos scripts.
As rotas de `/blog/` **não estão no faq-map** de propósito: o FAQPage delas sai
do `movecon-schema-artigos.php`. Sem isso sairiam duas.

## `DefinedTerm` — não existe

O plano mestre afirma que o mu-plugin já suporta `DefinedTerm` no glossário.
**Não suporta:** zero ocorrência no código e zero no HTML de `/glossario/`.

Implementar é trabalho não previsto. Os 41 verbetes têm âncora própria e
estrutura pronta para receber o schema quando for feito.

## Sitemap e llms.txt

Os dois saem de `mv_indexaveis()`: rota com `indexavel: true` **e** `status`
diferente de `planejada`. Página em rascunho ou planejada nunca vaza.

- `/sitemap-movecon.xml` — 78 URLs, zero LP
- `/llms.txt` — 7 seções, abrindo com a frase de compliance
- `robots.txt` — reescrito por filtro. `Disallow` em `/lp/` e no caminho
  `obrigado` (que **não existe como página**: foi antecipado para um destino
  pós-conversão que nunca foi criado — ver P4 e o item de formulários)

## Regra de ouro

**Rota nova só existe depois de registrada no keyword-map.** O `check_seo.py`
detecta os dois sentidos da divergência: página publicada e ausente do mapa
("página fantasma") e rota marcada `no-ar` sem página publicada.
