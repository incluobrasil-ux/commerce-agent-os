---
tipo: site
workstream: site
status: em-andamento
tags: [site, implementacao, movecon, base-crelider]
atualizado: 2026-07-25
---

# 🏗️ Plano de Implementação do Site — MOVECON (base: projeto Crelider)

> Estratégia: **herdar a estrutura técnica e a metodologia** do site da Crelider (~81 páginas + 44 posts, no ar em `crelider.com`), trocando identidade visual e reescrevendo a copy no nível de posicionamento.
>
> ⚠️ **O projeto Crelider não é tocado.** Nova empresa, novo site, nova infra. A Crelider entra só como **fonte de referência**.
>
> Dossiê completo da referência: `C:\tmp\PROJETO-CRELIDER-BASE-MOVECON.md`
> Relacionado: [[Arquitetura do Site]] · [[Mapa de Páginas]] · [[Posicionamento & Credibilidade]] · [[Identidade & Marca]] · [[Decisões]]

---

## 1. A diferença que governa tudo: consultoria × administradora

Este é o ponto que impede um "copiar e trocar o logo".

| | **Crelider** | **MOVECON** |
|---|---|---|
| O que é | **Consultoria** de consórcio | **Administradora** de consórcio, com grupos administrados pela Alpha Administradora de Consórcio Ltda. |
| Proposta de valor | "**Comparamos** as administradoras e indicamos a melhor pra você" | "**Nossos grupos.** Conduzimos você da simulação à contemplação" |
| Relação com concorrente | Compara, é o diferencial | **Não compara nem lista** — a MOVECON é o produto |
| Autoridade | Experiência do consultor | **Autorizada pela Alpha Administradora de Consórcio Ltda.** (que é autorizada pelo Bacen) |
| Diferencial central | Sem juros, consultor dedicado | **Anti-golpe / transparência** |
| Público secundário | — | **Representantes** (prioridade nº1 do negócio) |

> **Consequência prática:** o léxico da Crelider — *"comparamos"*, *"indicamos a opção certa"*, *"administradoras parceiras"* — é **proibido** na Movecon. Está no tom de voz da Crelider como palavra-chave recorrente. Toda copy herdada precisa passar por esse filtro, não por find-and-replace.

### Regra de compliance (inegociável, de [[Posicionamento & Credibilidade]])
- ✅ MOVECON = *"**plataforma de consórcio. Os grupos são administrados pela Alpha Administradora de Consórcio Ltda.**"*
- ✅ Ao citar a Alpha = *"**Alpha Administradora de Consórcio Ltda.** — autorizada pelo Banco Central (Cert. BCB 03/100/213/88 · CNPJ 90.982.679/0001-54)"*
- ❌ **Nunca** "MOVECON autorizada pelo Bacen" · ❌ nunca "white-label"
- 📍 **Dosagem:** a menção ao Bacen aparece **só onde a Alpha é citada** — não é elemento recorrente do site. Sem selo no header, sem faixa repetida.
- ❌ Nunca: contemplação garantida/imediata · renda garantida · tabela de preço como isca · depoimento fabricado
- ✅ Contemplações e depoimentos **reais**, com autorização de imagem

---

## 2. O que transfere da Crelider (e o que não)

### ✅ Transfere quase intacto — ganho de semanas
| Ativo | Observação |
|---|---|
| **Infra**: VPS + Docker (WP+MariaDB) + Caddy/SSL | Subir par de containers novo no mesmo VPS |
| **Fluxo de edição** WP-CLI + as 5 regras de ouro | Inclui o embrulho `wp:html` e o fix de H1 duplicado |
| **Stack de 15 plugins** (100% gratuita) | Rank Math, Pods, Fluent Forms, Complianz, Joinchat… |
| **Padrão de CSS escopado por prefixo** | Trocar `cr*-` por `mv-` |
| **Os 30 componentes** (P1→P5) | Header, Hero, Cards, CTA, FAQ accordion, prova social |
| **6 CPTs no Pods** com campos prontos | Serviço, Depoimento, FAQ, Case, Equipe, Landing Page |
| **Metodologia de SEO** | Pillar+spoke, 1 keyword por URL, titles, schema, interlinking |
| **Estrutura de segmentos** | Hubs e spokes batem ~1:1 com o [[Mapa de Páginas]] |
| ~~**Camada de cidades**~~ | 🚫 Fora do escopo — decisão: nacional |
| **Operação comercial**: SLA, distribuição, motivos de perda | Adaptar para a rede Representante→Supervisor→Vendedor |
| **4 mu-plugins** (redirects, CTA de post, logo HD, WhatsApp) | Portar renomeando prefixo |

### 🔄 Transfere a estrutura, mas a copy é reescrita
- Home, Sobre, Contato, FAQ, Como Funciona, todos os hubs e spokes de segmento
- Páginas de cidade (o esqueleto `.cin-` serve; o texto muda)
- Motivo: posicionamento de administradora + âncora Alpha/Bacen em vez de "comparamos"

### 🆕 Construção nova — não existe na Crelider
| Página / bloco | Por quê |
|---|---|
| ⭐ `/administrado-pela-alpha` | **Página-âncora de confiança** — recebe link interno de todo o site, concentra autoridade |
| ⭐ `/seguranca-anti-golpe` | Diferencial central da marca; pilar de blog próprio |
| `/area-do-consorciado` + `/segunda-via-boleto` | Retenção + busca de marca — só administradora tem |
| **Camada Representantes** (5 páginas) | `/seja-representante` · `/representante/como-funciona` · `/representante/cadastro` · `/representante/faq` · `/area-do-representante` |
| CNPJ e endereço da MOVECON visíveis (footer) | Camada E-E-A-T fixa — **sem** selo Bacen no header |
| Equipe com rosto + nome + **ABAC PCA-10** | Sinal de E-E-A-T de YMYL |
| Schema `FinancialService` | Não vem no Rank Math free → JSON-LD manual no `<head>` |

### ❌ Não transfere
- Comparativo de administradoras / página "administradoras parceiras"
- Qualquer copy com "comparamos" / "indicamos a melhor administradora"
- Cores, fontes e todos os assets visuais da Crelider

---

## 3. Identidade visual — ponto de partida

**Achado importante:** a paleta da Movecon (navy/petróleo + dourado + cinzas) é praticamente o **design system original planejado para a Crelider** (navy `#1B3B6F` + âmbar `#E8972A`), que foi abandonado quando o site foi ao ar em vermelho.

→ **Herdar o `Design System.md` do plano da Crelider, não o CSS vermelho de produção.** A estrutura de tokens já está desenhada para uma marca navy+dourada.

### Ativos existentes
| Ativo | Local | Situação |
|---|---|---|
| `MOVECON.svg` | `~/Downloads/MOVECON.svg` | ✅ **Vetorial** (a Crelider só tem PNG) |
| Logo principal PNG | `~/Downloads/movecon_01_logo_principal.png` | ok |
| Brand board | `~/Downloads/movecon_05_bloco_tipografia_paleta.png` | ⚠️ ver ressalvas |
| Logo sem fundo | `commerce-agent-os/.claude-uploads/` | ok |
| Apresentação | `~/Downloads/MOVECON-Apresentacao.pptx` | não auditada |

### ✅ RESOLVIDO — Manual da Marca v1.0 recebido (25/07/2026)
Detalhes completos em [[Identidade & Marca]]. O brand board antigo (dourado + Avenir) está **descartado** — indicava cor e fonte erradas.

```
Primária    Azul MOVECON   #1A3A66   institucional
Primária    Turquesa       #2FC4B2   acento de movimento
Secundária  Petróleo       #2C7A8C
Secundária  Azul Grafite   #0F2444   fundos escuros
Tipografia  Montserrat (títulos) + Inter (corpo) — ambas Google Fonts, grátis
Grafismo    chevrons modulares, baixa opacidade, uma cor só
```

**Tokens prontos:** `05 - Site/tokens-movecon.css` — colar no Customizer → CSS adicional.

> **Regra de conversão adaptada ao contraste:** turquesa sobre branco dá apenas **2,2:1** (reprova). Por isso o `.mv-btn--cta` usa **fundo turquesa + texto Azul Grafite = 7,1:1**. Turquesa fica restrito a preenchimento, ícones, eyebrow sobre fundo escuro e grafismo — **nunca texto ou link em fundo claro**.

### Pendências residuais de marca
- [ ] Hex das **neutras** (não vieram legíveis na pág. 11 do manual) — provisórias no CSS
- [ ] SVGs das 4 assinaturas + versão negativa + grafismo de chevrons
- [ ] Confirmar registro de **moveconconsorcio.com** (domínio citado no manual)

---

## 4. Decisões batidas (2026-07-25 — ver [[Decisões]])

| Decisão | Escolha | Consequência direta |
|---|---|---|
| **CMS** | ✅ **WordPress** | Herda infra VPS/Docker, 15 plugins, 30 componentes, 6 CPTs, fluxo WP-CLI |
| **Escopo** | ✅ **Nacional** | Camada de cidades **fora do escopo**; schema `Organization` + `FinancialService` |
| **Modelo** | ✅ **Administradora pura** | Site 100% cliente final; representantes só em `/lp/seja-representante`, fora do menu |

### Defaults assumidos
- **Hospedagem:** mesmo VPS, containers `movecon_wp` + `movecon_db` em `/opt/movecon/`, bloco novo no `Caddyfile`
- **Prefixo CSS:** `mv-`
- **Domínio:** a definir

### ⚠️ Consequências que exigem atenção

**a) "Nacional" endurece o SEO.** Sem a camada local, some o atalho de baixa concorrência — as páginas de cidade eram o caminho mais barato para ranquear. A compensação tem de vir de **profundidade**: os ~41 spokes de segmento e o blog em 8 clusters deixam de ser "fase 3" e passam a ser o motor principal. O pilar **Segurança & golpe** ganha peso extra: é keyword de volume alto onde ninguém sério disputa, e casa com o diferencial da marca.

**b) Endereço e CNPJ continuam visíveis.** Mesmo sem alvo de SEO local, E-E-A-T em YMYL exige endereço físico, CNPJ e telefone no header/footer. Nacional muda o *schema alvo*, não a camada de confiança.

**c) Tensão a monitorar — recrutamento.** [[Modelo de Negócio]] define captar representantes como **prioridade nº1**, mas a decisão tira o recrutamento do site institucional. Na prática: todo o volume de representantes passa a depender de **tráfego pago** na `/lp/seja-representante`. É uma escolha viável e mantém o institucional limpo — só exige que a verba de mídia para recrutamento exista de fato. Se o pago não for aprovado no kickoff, essa decisão precisa voltar à mesa.

---

## 5. Roteiro proposto

**Fase 0 — Destravar (antes de qualquer código)**
- [x] ~~CMS, escopo e modelo~~ → decididos em 2026-07-25
- [x] ~~Manual de marca~~ → recebido v1.0 em 25/07/2026; tokens gerados
- [ ] Domínio + CNPJ, endereço e telefone da MOVECON (E-E-A-T exige visíveis)
- [ ] Coletar dados reais de credibilidade — **não inventar** (lição nº8 da Crelider: caixas vazias até hoje)

**Fase 1 — Infra** *(não depende de copy)*
- [ ] Containers `movecon_wp` + `movecon_db` no VPS, `/opt/movecon/`
- [ ] Bloco no `Caddyfile` do `crm_caddy` → SSL automático
- [ ] Wrapper `/root/wpcli-movecon.sh`
- [ ] Astra + permalink `/%postname%/` + os 15 plugins
- [ ] UpdraftPlus → Google Drive **antes** de qualquer conteúdo
- [ ] LiteSpeed **desligado** durante a obra

**Fase 2 — Fundação visual**
- [x] ~~`tokens.css`~~ → **pronto** em `05 - Site/tokens-movecon.css`; falta colar no Customizer
- [ ] Componentes P1: Header (limpo, sem selo), Footer (CNPJ + linha legal curta + link p/ `/administrado-pela-alpha`), SectionHeader, Hero, Button
- [ ] 6 CPTs no Pods
- [ ] Fluent Forms + FluentSMTP/Brevo + `/obrigado` noindex
- [ ] Joinchat com o WhatsApp da MOVECON

**Fase 3 — Conteúdo (ordem por valor estratégico — ajustada para escopo nacional)**
1. ⭐ `/administrado-pela-alpha` — âncora de autoridade, publicar **primeiro**
2. Home + `/sobre` + `/contato`
3. ⭐ `/seguranca-anti-golpe`
4. `/como-funciona` + spokes educacionais + `/simulacao-consorcio` + `/faq`
5. **Hubs de segmento + ~41 spokes** — com escopo nacional, este é o motor de SEO. Não é fase opcional.
6. **Blog em 8 clusters** — abrir pelo pilar **Segurança & golpe** (volume alto, concorrência séria baixa, casa com o diferencial)
7. `/area-do-consorciado` + `/segunda-via-boleto`
8. `/lp/seja-representante` (noindex, fora do menu) → [[00 - Funil Cadastro de Representantes]]
9. ~~Camada de cidades~~ — fora do escopo (decisão: nacional)

**Fase 4 — Lançamento**
- [ ] Schema por tipo de página + `FinancialService` manual no `<head>`
- [ ] Broken Link Checker → zerar quebrados
- [ ] mu-plugin `movecon-redirects.php`
- [ ] Ligar LiteSpeed · DNS · HTTPS
- [ ] **Só então:** Site Kit (GA4 + Search Console), PixelYourSite, Clarity
- [ ] Complianz: revarredura de cookies após os trackers
- [ ] 2FA no Wordfence + WAF otimizado
- [ ] Revisão jurídica de Termos/Privacidade + compliance Bacen/ABAC

---

## 6. Riscos herdados (armadilhas já pagas na Crelider)

| # | Risco | Mitigação |
|---|---|---|
| 1 | Tema indefinido trava tudo | Decidir CMS no kickoff — é o bloqueio nº1 |
| 2 | Site Kit em domínio temporário dá erro | Só configurar após o domínio final no ar |
| 3 | Contas Google espalhadas | Uma conta só para tudo desde o dia 1 |
| 4 | Complianz free não gera Política de Privacidade | Criar à mão e apontar em Documentos |
| 5 | Cache ligado durante a obra esconde edições | LiteSpeed off até o fim |
| 6 | **Rota `/api/auth/register` do CRM aberta na internet** | Se a MOVECON usar o mesmo CRM, **bloquear no Caddy desde o dia 1** |
| 7 | Dados de credibilidade inventados | Proibido — e aqui é YMYL + compliance Bacen, o risco é regulatório |
| 8 | Arquivos locais divergem do que está no ar | Fonte da verdade = banco do WP |

---

## Próximos passos
- [x] ~~Confirmar CMS, geografia e modelo~~ → decididos em 2026-07-25
- [ ] **Fechar manual de marca** (hex definitivos + fonte web) — único bloqueio da Fase 2
- [ ] **Definir o domínio** — bloqueia o Caddy e o Site Kit
- [ ] Rodar **Fase 1 (infra)** — não depende de marca nem de copy, pode começar já
- [ ] Em paralelo: escrever copy da **Home** e da ⭐ **`/administrado-pela-alpha`**
