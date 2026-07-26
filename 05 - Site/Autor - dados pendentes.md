---
tipo: pendencia
workstream: site
status: aguardando-dados
tags: [site, autor, e-e-a-t, movecon]
atualizado: 2026-07-25
---

# ✍️ Página de autor — dados pendentes

> `/autores/samuel/` destrava a **Camada 3 (guias)**. O `CLAUDE.md` é explícito:
> sem autor real vinculado, guia não vai ao ar. São ~20 guias represados.

## O que já tenho (25/07/2026)

| Campo | Valor |
|---|---|
| Nome | Samuel |
| Cargo/papel | Consultor de consórcio |
| Vínculo | Sócio da Crelider |
| Experiência | Vendas e estruturação comercial no setor de consórcio |
| Declaração obrigatória | Vínculo **Crelider → MOVECON** explícito, sem omitir a relação comercial |

## O que falta — me manda que eu escrevo

**Bloqueiam a publicação da página:**

1. **Sobrenome.** `/autores/samuel/` sem sobrenome enfraquece o sinal de E-E-A-T:
   o Google avalia autoria de conteúdo financeiro por pessoa identificável, não
   por primeiro nome. Se preferir manter só "Samuel" na URL, tudo bem — mas o
   nome completo precisa aparecer no corpo da página e no `Person` schema.

2. **Foto.** Rosto real, enquadramento de retrato. É requisito de E-E-A-T em YMYL
   e entra no schema como `image`.

3. **Tempo de atuação.** "Desde 20XX" ou "X anos no setor". Sem isso a bio fica
   genérica e não sustenta expertise.

**Fortalecem bastante, mas não bloqueiam:**

4. **LinkedIn** — vira `sameAs` no schema. É o sinal de identidade verificável
   mais barato que existe.
5. **Certificação ABAC PCA-10** — se você tiver, é a credencial mais forte
   possível nesse nicho e deve estar em destaque. Já está citada em
   [[Posicionamento & Credibilidade]] como âncora, mas nunca foi confirmada.
6. **Formação** — curso e instituição, se fizer sentido citar.
7. **E-mail ou canal de contato** do autor.

## Como o vínculo Crelider será declarado

Rascunho para sua aprovação — a transparência aqui é ativo, não passivo:

> Samuel é sócio da **Crelider**, consultoria de consórcio em Vitória da Conquista (BA),
> e responde pelo conteúdo editorial da MOVECON. As duas empresas têm sócios em comum.
> Declaramos essa relação porque avaliar consórcio exige saber quem está escrevendo —
> e com que interesse.

⚠️ **Ponto a decidir com você:** a Crelider é **consultoria** e a MOVECON é
**plataforma** — no mesmo mercado. Um leitor atento pode ler isso como conflito
de interesse. Declarar de forma explícita neutraliza o problema; omitir e ser
descoberto depois seria pior. A frase acima assume a declaração explícita.

## Schema previsto

```
Person
  name, jobTitle, image, url (/autores/samuel/)
  worksFor      -> Organization MOVECON (@id /#organizacao)
  affiliation   -> Organization Crelider
  sameAs        -> [LinkedIn]
  knowsAbout    -> ["consórcio", "carta de crédito", "planejamento financeiro"]
```

Cada guia recebe `Article` com `author` apontando para esta página.

## Rotas afetadas

`/autores/` já está no [[keyword-map|content/keyword-map.json]] (camada `confianca`,
fase 2). Falta registrar `/autores/samuel/` — faço junto com a página, para o
`check_seo` não acusar página fantasma.
