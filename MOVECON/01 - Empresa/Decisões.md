---
tipo: empresa
status: em-andamento
tags: [decisoes, log, movecon]
atualizado: 2026-08-20
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
| 2026-07-26 | **"White label" deixa de ser proibição absoluta e passa a valer por audiência** | Permitido, sem ênfase e em uso pontual, em `/seja-um-representante/`, `/quem-somos/`, página de autor e **materiais de recrutamento B2B**. Proibido em qualquer página de audiência consumidor, onde vale "plataforma que comercializa grupos administrados pela Alpha". Regra detalhada e implementada no gate: `05 - Site/docs/01-compliance.md` + `ESCOPO_TERMO` em `scripts/check_seo.py` → [[Posicionamento & Credibilidade]] | Samuel |
| 2026-07-28 | **Aplicação da regra de escopo ao kit de materiais PDF** | A Apresentação Institucional (peça B2B) passa a nomear o modelo **white label**, com slide dedicado "Quem faz o quê na sua operação". Sempre com a atribuição na mesma tela: marca e venda = MOVECON, administração dos grupos = Alpha. Não é decisão nova de mérito — é aplicação da regra de 26/07. **"Administradora" segue vetado para a MOVECON em todos os públicos** → [[Posicionamento & Credibilidade]] | Samuel |
| 2026-08-20 | **Nomenclatura revista = "autorizada pela Alpha Administradora de Consórcio Ltda., que administra os grupos"** | O termo **"plataforma"** sai de todo o site. A atribuição da administração e da autorização do Bacen à Alpha continua obrigatória na mesma tela. `nuncaEscrever` reescrito: a proibição genérica `MOVECON autorizada` virou específica ao Bacen (`MOVECON autorizada pelo Banco Central`, `...pelo Bacen`, `...a funcionar`), e `plataforma autorizada pela Alpha` saiu da lista. ⚠️ **Pendente de confirmação jurídica** da qualificação formal do vínculo MOVECON↔Alpha → [[Dados Cadastrais]] · [[Posicionamento & Credibilidade]] | Samuel |
| 2026-08-20 | **Site deixa de citar golpe e fraude** | Todo o vocabulário de golpe/fraude/golpista sai das páginas; a informação de proteção continua, em enquadramento positivo ("como a operação regular funciona", "o que conferir"). Três páginas mudaram de slug e exigem 301: `/consorcio-contemplado/golpes-mais-comuns/` → `/o-que-conferir/`, `/guia/contemplacao-garantida-e-golpe/` → `/guia/como-a-contemplacao-acontece/`, `/blog/golpe-consorcio-como-identificar/` → `/blog/como-verificar-uma-administradora/`. ⚠️ **Consequência a decidir:** o pilar de SEO "Segurança & golpe" era o diferencial declarado da marca e o cluster de blog planejado → `05 - Site/docs/redirects-2026-08-20.md` | Samuel |
| — | *(demais itens no kickoff)* | Kickoff São Paulo → [[2026-07-XX - Kickoff São Paulo]] | Samuel |

## Premissas em aberto (a bater no kickoff)
- [ ] Divisão societária
- [ ] Nicho principal de consórcio
- [ ] Orçamento de tráfego
- [ ] Handle do Instagram
- [ ] Ferramenta de treinamento
- [ ] **Objetivo primário do Instagram = recrutamento** (premissa adotada em [[Agente Social Media (Instagram)]] — confirmar)

Ligações: [[00 - Dashboard]] · [[Modelo de Negócio]]
