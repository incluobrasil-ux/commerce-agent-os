# 00 — Contexto

## O que a MOVECON é

Plataforma de consórcio. Apresenta os grupos, explica os custos por escrito e
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
