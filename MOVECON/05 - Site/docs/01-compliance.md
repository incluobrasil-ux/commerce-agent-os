# 01 — Compliance

> **Este arquivo não é a fonte da verdade.** A fonte é o bloco `site` de
> `content/keyword-map.json`, aplicado por `scripts/check_seo.py` no pre-commit.
> Aqui está a versão legível do que o validador impõe. **Em qualquer conflito
> entre este documento e o validador, o validador vence** — inclusive contra o
> manual de prompts.

## O bloco obrigatório

Construção aprovada do projeto, usada em toda página que precise atribuir a
administração:

> A MOVECON é uma plataforma de consórcio. Os grupos são administrados pela
> Alpha Administradora de Consórcio Ltda., administradora autorizada a
> funcionar pelo Banco Central do Brasil.

Quando houver espaço para a forma completa, acrescentar os identificadores:

> Alpha Administradora de Consórcio Ltda., CNPJ 90.982.679/0001-54,
> administradora autorizada a funcionar pelo Banco Central do Brasil sob o
> certificado nº 03/100/213/88.

**Razão social exata:** `Alpha Administradora de Consórcio Ltda.` — sempre com
`Ltda.`. É o valor de `site.administradora` no keyword-map.

**Descartado do manual de prompts:** a construção *"A MOVECON é canal
autorizado de comercialização"*. Ela aproxima "autorizado" da MOVECON, que é
exatamente o que a trava existe para impedir. Decisão do cliente em 26/07/2026.

## Menção temporal à Alpha

Única forma permitida:

> fundada em 1981, segundo informações institucionais da própria Alpha

Com link externo `rel="nofollow noopener"` para a página institucional, apenas
na primeira ocorrência de cada documento. Nas demais, remover a menção temporal
e deixar só a atribuição de autorização.

**Proibido:** "há mais de 40 anos", "quatro décadas", "40+ anos" ou qualquer
variação sem fonte. Foram removidas dos dois artigos comparativos em 26/07/2026.

## As 11 expressões proibidas

Lista literal em `site.nuncaEscrever` no keyword-map. O `check_seo.py` varre
`_codigo/` e `build/` atrás delas — **inclusive dentro de comentário HTML**,
porque comentário também vai no documento servido.

| # | Expressão | Por quê |
|---|---|---|
| 1 | MOVECON autorizada | A autorização é da administradora, não da plataforma |
| 2 | nossa administradora | Sugere propriedade ou controle sobre a Alpha |
| 3 | administradora MOVECON | Afirma o que o contrato social não permite |
| 4 | plataforma autorizada pela Alpha | Autorização não é algo que a Alpha concede |
| 5 | representante autorizada | Mesma confusão de papel |
| 6 | white-label | Descreve relação contratual que não foi documentada |
| 7 | sem nenhuma ocorrência | Existe processo administrativo público envolvendo a Alpha |
| 8 | ficha limpa | idem |
| 9 | histórico impecável | idem |
| 10 | nunca foi penalizada | idem |
| 11 | sem qualquer sanção | idem |

As cinco últimas existem porque há processo administrativo público do Banco
Central envolvendo a Alpha. A decisão do projeto é **não mencionar o processo**
e **nunca afirmar histórico limpo**. Silêncio é permitido; afirmação falsa não.

## Proibições de conteúdo

- **Nenhum número inventado.** Taxa de administração, fundo de reserva, prazo,
  valor de carta, estatística de mercado, tempo de operação. Sem fonte, usar
  `{{DADO_PENDENTE}}` e registrar em `06-pendencias.md`.
- **Nenhuma promessa de contemplação ou prazo.** A contemplação ocorre por
  sorteio ou lance em assembleia. Vale inclusive para a MOVECON: o guia
  `/guia/contemplacao-garantida-e-golpe/` diz isso explicitamente.
- **Consórcio não é investimento** e não gera rendimento.
- **Não mencionar a Crelider** em documento público. A política de privacidade
  descreve o fluxo de dados sem nomeá-la.
- **Sem linguagem de vínculo empregatício** em texto sobre representantes. Usar
  "parceria de negócio" ou "representação comercial".

## Ressalva do Banco Central — citação verbatim

Onde a página tratar de verificação, citar literalmente:

> O sistema não garante que a instituição é confiável, somente que ela é
> autorizada.

Não parafrasear. A frase vale porque quem a diz é o regulador. Ela já está em
`/consorcio-contemplado/como-verificar-no-banco-central/`, `/seguranca/`,
`/avaliacoes/` e `/guia/consorcio-e-confiavel/`.

## Como validar

```
python scripts/check_seo.py --wp
```

Roda no pre-commit, depois de `secret-scan` e `test:smoke`. Bloqueia o commit.
