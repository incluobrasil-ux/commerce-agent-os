---
tipo: empresa
status: em-andamento
tags: [decisoes, log, movecon]
atualizado: 2026-07-20
---

# ✅ Decisões

#status/em-andamento

> **Log do que foi batido o martelo.** Se uma decisão não está aqui, ela **não foi decidida** — é premissa/placeholder.

| Data | Decisão | Contexto | Por quem |
|---|---|---|---|
| 2026-07-25 | **CMS = WordPress** | Reaproveita infra VPS/Docker, 15 plugins gratuitos, componentes e CPTs do projeto Crelider → [[Plano de Implementacao (base Crelider)]] | Samuel |
| 2026-07-25 | **Escopo geográfico = Nacional** | Sem camada programática de cidades. Schema `Organization` + `FinancialService` (não `LocalBusiness` como alvo). Ver impacto em [[Mapa de Páginas]] bloco D | Samuel |
| 2026-07-25 | **Modelo = Administradora pura** | Site 100% voltado ao cliente final. Recrutamento de representantes isolado em `/lp/seja-representante`, fora do menu, alimentado só por tráfego pago. Ver [[Mapa de Páginas]] bloco F | Samuel |
| 2026-07-25 | **Nomenclatura = "plataforma de consórcio. Os grupos são administrados pela Alpha Administradora de Consórcio Ltda."** | "Administradora" descartado: o objeto social registrado é intermediação/agenciamento/correspondente, sem CNAE de administração de consórcio → [[Dados Cadastrais]] | Samuel |
| 2026-07-25 | **Hospedagem = mesmo VPS da Crelider** (`2.24.220.21`) | Containers próprios em `/opt/movecon/`, SSL pelo `crm_caddy` existente → [[Runbook - DNS e Infra]] | Samuel |
| 2026-07-25 | **Portal do consorciado/representante = externo** | Portal único da Alpha (`portal.alphaconsorcio.com/portal`); não construir essas páginas no site | Samuel |
| — | *(demais itens no kickoff)* | Kickoff São Paulo → [[2026-07-XX - Kickoff São Paulo]] | Samuel |

## Premissas em aberto (a bater no kickoff)
- [ ] Divisão societária
- [ ] Nicho principal de consórcio
- [ ] Orçamento de tráfego
- [ ] Handle do Instagram
- [ ] Ferramenta de treinamento
- [ ] **Objetivo primário do Instagram = recrutamento** (premissa adotada em [[Agente Social Media (Instagram)]] — confirmar)

Ligações: [[00 - Dashboard]] · [[Modelo de Negócio]]
