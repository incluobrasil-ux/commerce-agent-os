---
tags: [site, sitemap, seo, status/em-andamento]
---
# 🗺️ Mapa de Páginas — MOVECON

Sitemap completo do site. ⭐ = página estratégica de confiança/administradora.
Relacionado: [[Arquitetura do Site]] · [[00 - Funil Cadastro de Representantes]] · [[Plano de Implementacao (base Crelider)]]

> [!success] Decisões de 2026-07-25 (ver [[Decisões]])
> - **CMS = WordPress** · **Escopo = Nacional** · **Modelo = Administradora pura**
> - → **Bloco D (local/programática) fica FORA do escopo.** Mantido no documento como opção futura, não entra no lançamento.
> - → **Bloco F (representantes) sai do site institucional.** Vira `/lp/seja-representante`, noindex, sem link no menu, alimentado só por tráfego pago (bloco G).
> - → Schema alvo: `Organization` + `FinancialService` (não `LocalBusiness`). Endereço e CNPJ continuam visíveis por E-E-A-T.

> [!info] Portal do consorciado / representante — é **externo** (25/07/2026)
> `https://portal.alphaconsorcio.com/portal` — **portal único** operado pela Alpha; o login define o perfil (consorciado ou representante).
> - **Não** construir `/area-do-consorciado`, `/segunda-via-boleto` nem `/area-do-representante` como páginas do site.
> - **Header:** apenas "Área do Consorciado" (o institucional fala com o cliente final).
> - **Rodapé:** os três acessos — Consorciado · Representante · 2ª via — todos para a mesma URL.
> - ⚠️ **Custo de SEO aceito:** abrimos mão de rankear "2ª via boleto movecon" e afins, que são buscas de marca com boa conversão. Se um dia interessar recuperar, a saída é criar páginas-ponte que expliquem o serviço e então mandem para o portal.

## A. Institucional & Confiança
| Página (URL) | Função | Intenção / tipo |
|---|---|---|
| `/` | Home: confiança + conversão | Navegacional/marca |
| `/sobre` | Quem Somos — autoridade E-E-A-T | Institucional |
| ⭐ `/administrado-pela-alpha` | Âncora Alpha/Bacen | Confiança/marca |
| `/regulamentacao` | Regulamentação e transparência (Lei 11.795/08) | Confiança/informacional |
| ⭐ `/seguranca-anti-golpe` | Como não cair em golpe | Confiança/informacional |
| ~~`/area-do-consorciado`~~ · ~~`/segunda-via-boleto`~~ | 🔗 **Link externo**, não são páginas | Retenção/marca |
| `/contato` | Contato + unidades | Local/navegacional |
| `/trabalhe-conosco` | Vagas institucionais (≠ representante) | Institucional |
| `/politica-de-privacidade` · `/termos-de-uso` | LGPD/legal | Institucional |

## B. Como Funciona (educacional — hub & spokes)
| Página (URL) | Função | Intenção / tipo |
|---|---|---|
| `/como-funciona` | Hub educacional | Informacional |
| `/o-que-e-consorcio` · `/tres-caminhos` · `/como-ser-contemplado` · `/consorcio-ou-financiamento` · `/vantagens-do-consorcio` · `/vale-a-pena-fazer-consorcio` · `/consorcio-e-seguro` · `/consorcio-sem-juros` | Spokes educacionais | Informacional |
| `/simulacao-consorcio` | Simulador (conversão central) | Conversão |
| `/faq` | Dúvidas (FAQ schema) | Informacional |

## C. Segmentos / Nichos (hub + spokes)
| Hub | Spokes | Intenção / tipo |
|---|---|---|
| `/consorcio-veiculos` | carro · carro-usado · suv-picape · carro-eletrico · primeiro-carro · moto · moto-eletrica · van-utilitario | Comercial/transacional |
| `/consorcio-imoveis` | residencial · sair-do-aluguel · primeiro-imovel · terreno · construcao · imovel-comercial · imovel-investimento · imovel-fgts · reforma | Comercial/transacional |
| `/consorcio-caminhao` | frota-empresarial · caminhao-usado · onibus-van | Comercial/transacional |
| `/consorcio-maquinas-agricolas` | trator · colheitadeira · equipamentos-agricolas · implementos-agricolas · pulverizador | Comercial/transacional |
| `/consorcio-servicos` | cirurgia-plastica · harmonizacao-estetica · odontologico · reforma-casa · energia-solar · viagem · casamento · festas-eventos · intercambio-educacao · moveis-planejados | Comercial/transacional |
| `/consorcio-empresa` | mei-autonomo · franquia · equipamentos-industriais · construcao-civil | Comercial/transacional |
| `/consorcio-embarcacoes` | jet-ski · lancha | Comercial/transacional |
| `/consorcio-contemplado` | ⭐ (página sensível: reforçar segurança) | Transacional |

## D. ~~Local / Programática~~ — 🚫 FORA DO ESCOPO (decisão: nacional, 2026-07-25)
*Mantido como referência caso a estratégia vire regional no futuro.*
| Padrão de URL | Função | Intenção / tipo |
|---|---|---|
| `/consorcio-em-[cidade]` | Página-mãe da cidade | Local |
| `/consorcio-[segmento]-em-[cidade]` | Programático cidade × segmento | Local |

Cidades candidatas: Vitória da Conquista · Jequié · Itabuna · Ilhéus · Itapetinga · Brumado · Guanambi · Caetité · Bom Jesus da Lapa · Feira de Santana · Porto Seguro · Poções · Cândido Sales · Montes Claros · Janaúba.

## E. Blog / Central de Conteúdo (topic clusters)
| Cluster | Intenção / tipo |
|---|---|
| O básico do consórcio | Informacional |
| Carro / veículos | Informacional |
| Imóvel | Informacional |
| Caminhão / agro | Informacional |
| Empresa / PJ | Informacional |
| Contemplação e lance | Informacional |
| Região | Informacional/local |
| ⭐ Segurança & golpe (pilar diferenciador) | Informacional |

## F. Representantes (recrutamento) — 🔁 MOVIDO PARA `/lp/` (decisão: administradora pura, 2026-07-25)
Fora do site institucional: **sem link no menu**, noindex, alimentado só por tráfego pago.

| Página (URL) | Função | Intenção / tipo |
|---|---|---|
| ⭐ `/lp/seja-representante` | LP de recrutamento (carreira séria) | Recrutamento pago |
| `/lp/seja-representante/cadastro` *(ou form na própria LP)* | Formulário → [[00 - Funil Cadastro de Representantes\|funil]] | Conversão |
| ~~`/representante/como-funciona`~~ · ~~`/representante/faq`~~ | Conteúdo absorvido como seções da LP | — |
| `/area-do-representante` | Portal do representante | Futuro (pós-lançamento) |

## G. Tráfego pago (separado do SEO)
| Padrão de URL | Função | Intenção / tipo |
|---|---|---|
| `/lp/[campanha]` | LPs dedicadas (noindex, 1 objetivo, form/WhatsApp) | Conversão paga |

## Resumo
7 blocos · ~10 institucionais · hub educacional (8 spokes + simulador + FAQ) · **7 hubs de segmento com ~41 spokes** · camada local · blog em 8 clusters · 5 páginas de representante · estrutura de LP paga.
