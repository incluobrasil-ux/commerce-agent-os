# 01 — Compliance

> **Este arquivo não é a fonte da verdade.** A fonte é o bloco `site` de
> `content/keyword-map.json`, aplicado por `scripts/check_seo.py` no pre-commit.
> Aqui está a versão legível do que o validador impõe. **Em qualquer conflito
> entre este documento e o validador, o validador vence** — inclusive contra o
> manual de prompts.

## Custo de adesão — a primeira parcela é maior

**Esta é a correção de produto de 26/07/2026. Toda afirmação de "sem entrada"
sem esta ressalva está factualmente desalinhada.**

### O que é verdade

Não há entrada destinada ao bem: **100% do crédito continua disponível para a
compra**. Isso segue sendo diferencial real contra o financiamento, onde a
entrada sai do seu bolso e abate o preço do bem antes de você tê-lo.

O que existe é **antecipação de parte da taxa de administração na adesão**, o
que torna **a primeira parcela maior que as demais**.

### Magnitude, por modalidade

Da fonte `content/simuladores.json`, campo `kFirst`, sobre o valor da carta:

| Modalidade | 1ª parcela | Em carta de R$ 100 mil | Demais | Proporção |
|---|---|---|---|---|
| Imóveis | 19,21% | R$ 19.210 | R$ 676 × 200 | 28,4× |
| Caminhão e agro | 19,31% | R$ 19.313 | R$ 908 × 150 | 21,3× |
| Veículos | 14,12% | R$ 14.115 | R$ 1.261 × 80 | 11,2× |
| Serviços | 13,89% | R$ 13.887 | R$ 2.113 × 60 | 6,6× |
| Moto | — | **sem parâmetro na tabela** | — | — |

**Nenhum destes percentuais vai para o site.** Eles orientam a redação e
sustentam a ressalva; quem mostra número ao visitante é o simulador, que já
exibe "1ª parcela" e "Demais parcelas" separadamente.

### Log de decisão de produto

| | |
|---|---|
| **O que** | A primeira parcela maior é antecipação da taxa de administração — padrão da Alpha, comparável ao praticado no mercado |
| **Fonte da tabela** | `content/simuladores.json`, fornecida pela Alpha |
| **Quem confirmou** | Samuel, sócio da operação, diretamente com o proprietário da Alpha |
| **Quando** | semana de 20/07/2026 |
| **O que autoriza** | uso desta descrição na comunicação pública |
| **Reforço pendente** | confirmação por escrito da Alpha, por e-mail — **não bloqueante** |

### A regra

**Nunca escrever "sem entrada" sozinho.** Sempre acompanhado da primeira
parcela maior, **no mesmo bloco de texto** — não em nota de rodapé, não em outra
seção, não em outra página.

Proibidas quando o bloco não revela a antecipação: `sem entrada`, `sem entrada
obrigatória`, `começa pela parcela`, `só a parcela`, `sem desembolso inicial`,
`sem precisar de entrada`, `não há entrada`.

Codificado em `SEM_ENTRADA` no `check_seo.py`, com exit 1.

**A FAQ "Preciso dar entrada?" é o lugar da explicação por extenso**, em toda
página que a tiver. A resposta honesta é o diferencial — não o obstáculo.

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
| 6 | white-label | **Regra de escopo desde 26/07/2026 — ver seção abaixo** |
| 7 | sem nenhuma ocorrência | Existe processo administrativo público envolvendo a Alpha |
| 8 | ficha limpa | idem |
| 9 | histórico impecável | idem |
| 10 | nunca foi penalizada | idem |
| 11 | sem qualquer sanção | idem |

As cinco últimas existem porque há processo administrativo público do Banco
Central envolvendo a Alpha. A decisão do projeto é **não mencionar o processo**
e **nunca afirmar histórico limpo**. Silêncio é permitido; afirmação falsa não.

## "white-label" — de proibição absoluta a regra de escopo

**Decisão do cliente em 26/07/2026.** O termo deixa de ser proibição absoluta e
passa a valer por audiência da página.

### Permitido, sem ênfase e em uso pontual

- `/seja-um-representante/`
- `/quem-somos/`
- Página de autor (`/autor/<slug>/`)
- Materiais de recrutamento B2B

Nesses contextos o leitor já opera no mercado e o termo descreve a operação de
forma econômica.

### Proibido, como antes

Hubs, filhas, guias, artigos de blog, LPs de venda, simulador e **qualquer
página de audiência consumidor**. Nelas a construção segue sendo:

> plataforma que comercializa grupos administrados pela Alpha

Para o consumidor o termo não informa nada e embaralha justamente o ponto que
precisa ficar claro: **quem administra o grupo é a Alpha, não a MOVECON.**

### Na bio do autor

A **bio longa** usa o termo uma vez ("operação white-label em parceria com a
Alpha..."). A **bio curta não usa** — ela é renderizada na caixa de autor ao fim
de cada artigo, ou seja, em página de consumidor.

Por isso `caixa-autor-*` **não** entra na allow-list de arquivos, embora
`autor-*` entre. Manter o prefixo lá abriria na varredura de arquivo a porta que
o validador fecha no campo.

### Implementação

`ESCOPO_TERMO` no `check_seo.py`, mesmo mecanismo já usado na `PARCELA_FIXA`:
valor = onde o termo **pode** aparecer. O escopo é aplicado nos três pontos em
que as 11 expressões são varridas — `validar_mapa` (title/description, por
rota), `validar_prosa` (HTML/PHP, por arquivo) e `validar_autoria` (ficha, por
campo).

Testado nos dois sentidos, 9 casos: hub, guia, LP, caixa de autor e `bioCurta`
falham; `/quem-somos/`, `/seja-um-representante/`, página de autor e `bioLonga`
passam.

### Ressalva registrada — ponto não resolvido pela mudança

O motivo original da proibição **não era audiência**. Era: *"descreve relação
contratual que não foi documentada"*.

A regra de escopo não resolve esse ponto. Em `/quem-somos/` a afirmação continua
sendo sobre um contrato, apenas dirigida a outro público. Duas situações
possíveis:

1. **A relação foi documentada** desde o registro original — nesse caso o
   motivo caducou e vale substituir a justificativa da linha 6 pela nova regra,
   registrando qual documento a sustenta.
2. **A relação segue sem documentação** — nesse caso o uso do termo, mesmo em
   página B2B, é uma afirmação contratual sem lastro, e o risco mudou de público
   mas não desapareceu.

**Pendente de confirmação do cliente.** A regra de escopo está implementada e
ativa conforme determinado; esta ressalva não a bloqueia, apenas registra que a
questão documental permanece aberta.

### Rota ainda inexistente

`/seja-um-representante/` está na allow-list mas **não existe no keyword-map**.
Foi incluída de propósito, para que a regra já esteja correta quando a página
for criada — allow-list que só se ajusta depois do fato é allow-list que chega
tarde.

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
