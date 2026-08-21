# 00 — Contexto

## Cortado por falta de qualificação — georreferenciamento (imóvel rural)

**Decisão do cliente em 27/07/2026.** O bloco sobre georreferenciamento foi
**cortado** de `/consorcio-imoveis/imovel-rural/` antes de ser escrito.

**Por quê.** A exigência existe em lei, mas é **escalonada por área do imóvel**,
segundo calendário do INCRA. Afirmá-la sem essa qualificação estaria **errada
para parte dos casos** — e uma página sobre dinheiro não pode acertar só na
média.

**O que ficou no lugar:** a base já registrada — matrícula e documentação apta à
transferência, com as exigências específicas do rural verificadas na análise da
administradora.

**Para reavaliar no futuro** é preciso uma fonte que sustente o escalonamento:
o calendário do INCRA por faixa de área, com data de vigência. Sem isso, o
assunto continua fora.

Este registro existe para que a próxima página que tocar em imóvel rural não
reintroduza o tema achando que foi esquecimento.

## Regra de produto — pagamento na modalidade serviços

**Confirmado pelo cliente em 27/07/2026 como regra da MODALIDADE, não do nicho.**
Vale para educação, casamento, viagem, energia solar e saúde/estética.

> A administradora paga o **fornecedor diretamente, contra nota fiscal**. A carta
> **não vira saldo em conta** e não quita dívida. O cliente escolhe o prestador,
> dentro do que a modalidade contratada cobre.

**Fonte:** o próprio hub `/consorcio-servicos/`, onde a regra está publicada e
aprovada — card "O que a carta não faz" e FAQ "A carta vira dinheiro na minha
conta?". Replicar nas filhas é aplicar regra existente, não criar claim.

A segunda metade importa tanto quanto a primeira: *"não existe consórcio que
vire saldo livre — e quem oferecer isso está fora das regras"* é frase
protetiva de quem lê, e não deve ser separada da primeira ao replicar.

## Regra de produto — garantia e exigência de registro (imóveis)

**Base confirmada pelo cliente em 27/07/2026.** Registrada aqui porque outras
páginas vão precisar dela: a filha de terreno e o guia do contemplado
provavelmente tocam no tema.

> O imóvel adquirido com a carta de crédito fica **alienado fiduciariamente à
> administradora até a quitação** do plano. Como a alienação fiduciária se
> constitui por registro, o imóvel precisa ter **matrícula no cartório de
> registro de imóveis e documentação apta à transferência**.

**Consequência prática:** imóvel sem matrícula, ou com pendência que impeça o
registro, não passa na análise de liberação do crédito.

**Limite do que se pode afirmar:** os **critérios específicos** de avaliação e
de documentação são da administradora e constam do contrato. Nenhuma página
lista requisito documental específico — a regra acima é o regime; a lista é do
contrato.

### Onde já está aplicada

| Página | Uso |
|---|---|
| `/consorcio-imoveis/` | FAQ "O imóvel precisa estar regularizado?" |

### Fatos correlatos já estabelecidos no site

Não são novos — ficam aqui para que a próxima página não os reintroduza como
se fossem, nem os contradiga:

| Fato | Onde foi estabelecido |
|---|---|
| ITBI, registro e escritura **não entram na carta** | FAQ "E se o imóvel custar mais que a carta?" em `/consorcio-imoveis/` |
| Na construção, a liberação é **por etapa, mediante vistoria** | `/consorcio-imoveis/construcao/` |
| A carta é de **abrangência nacional**, respeitadas avaliação e documentação | FAQ "Posso comprar imóvel em outra cidade?" |

## O que a MOVECON é

Autorizada pela Alpha a apresentar os grupos dela. Apresenta os grupos, explica os custos por escrito e
acompanha o cliente até a carta de crédito.

**Não administra grupos, não gere recursos, não realiza assembleias e não
libera crédito.** Isso é da administradora, e por lei só pode ser feito por
empresa autorizada pelo Banco Central.

| | |
|---|---|
| Razão social | MOVECON Intermediações Financeiras Ltda. |
| CNPJ | 67.559.635/0001-02 |
| Site | moveconconsorcio.com |
| Administradora dos grupos | Alpha Administradora de Consórcio Ltda. |
| CNPJ da administradora | 90.982.679/0001-54 |
| Certificado Bacen da administradora | 03/100/213/88 |

O contrato social registra objeto de intermediação, agenciamento e
correspondente, com CNAE 74.90-1-04, 66.19-3-02 e 66.19-3-99. **Não há CNAE de
administração de consórcio.** É por isso que a MOVECON não pode se chamar
administradora — não é escolha de marketing, é o que a empresa é.

O termo "white-label", que aparece em material antigo, **está na lista de
expressões proibidas** e não descreve a relação. Ver `01-compliance.md`.

## Posicionamento

**"A gente te ensina a verificar tudo, inclusive a gente."**

O relatório de concorrentes mostra que nenhum dos 6 players analisados defende
a própria SERP de marca — "[marca] é confiável" é dominado por terceiros. E
nenhum ensina o consumidor a conferir a autorização no Banco Central.

A MOVECON faz o oposto: publica CNPJ, certificado e o caminho da consulta, e
cita literalmente a ressalva do próprio Bacen de que autorização não é atestado
de idoneidade. Isso é diferencial competitivo, não formalidade.

## Tom de voz

- **Direto antes de bonito.** Answer-first responde a pergunta em ≤55 palavras,
  antes de qualquer contexto.
- **Admite onde perde.** Os comparativos dizem que empréstimo vence na urgência,
  que poupar sozinho tende a sair mais barato para quem tem disciplina, e que o
  Pronaf costuma ser mais barato que consórcio para quem se enquadra.
- **Nunca promete prazo.** Nem quando isso custa lead.
- **"Depende do contrato" é resposta válida** e está escrita assim onde é a
  verdade.
- Português brasileiro, segunda pessoa ("você"), sem jargão financeiro sem
  tradução.

## O que já existe

99 páginas no ar em 26/07/2026. Inventário por camada em
`02-mapeamento-blueprint.md`. Fonte da verdade das URLs:
`content/keyword-map.json`.

## Stack

WordPress 7.0 + tema Astra, sem child-theme. Docker em VPS compartilhado,
Caddy como proxy reverso. Deploy por WP-CLI (`wp post create/update`) a partir
de HTML gerado por scripts Python.

**O Rank Math está ativo e não renderiza nada** — zero ocorrência no documento
servido. Todo metadado sai de `mu-plugins/movecon-seo.php`, dirigido pelo
keyword-map e casado por URL. Ver `05-schema-specs.md`.
