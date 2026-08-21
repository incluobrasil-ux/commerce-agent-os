---
tipo: progresso
workstream: site
status: em-andamento
tags: [site, progresso, movecon]
atualizado: 2026-07-25
---

# 📊 Progresso do Site

> Controle do que **de fato** está no ar em `https://moveconconsorcio.com`.
> Atualizar a cada lote publicado. Fonte do plano: [[Mapa de Páginas]].

## Resumo

**11 de 70 páginas publicadas** (blog não contabilizado). Atualizado em 25/07/2026.

| Bloco | Previsto | Feito | Falta |
|---|---:|---:|---:|
| A — Institucional e confiança | 9 | 3 | 6 |
| B — Como funciona | 11 | 0 | 11 |
| C — Segmentos | 50 | **8 hubs** | 42 spokes |
| E — Blog (8 clusters) | — | 0 | — |
| F/G — LPs | 1+ | 0 | 1+ |
| **Total** | **70** | **11** | **59** |

### SEO técnico — resolvido em 25/07/2026
⚠️ O **Rank Math não renderiza nada no frontend** com o WordPress 7.0 (zero saída no `<head>`).
Solução: mu-plugin **`movecon-seo.php`**, que emite `<title>`, `description`, `canonical`, Open Graph
e o schema `Organization` + `FinancialService` lendo o postmeta `rank_math_*`.
→ Se o Rank Math voltar a funcionar numa atualização, **desativar o mu-plugin** para não duplicar tags.

> Bloco D (cidades) **fora do escopo** — decisão de atuação nacional.

---

## ✅ Fundação — pronta, não se repete

Infra (VPS, Docker, Caddy, HTTPS) · design system no Customizer · header e rodapé da marca ·
logo e favicon · padrão de página (`.mv-page` + bloco `wp:html`) · 11 plugins · regras de compliance.

→ Detalhes em [[Runbook - DNS e Infra]].

---

## Bloco A — Institucional e confiança

| Página | Status |
|---|---|
| `/` — Home | ✅ publicada |
| ⭐ `/administrado-pela-alpha` | ✅ publicada |
| `/contato` | ✅ publicada · ⏳ falta telefone, e-mail e WhatsApp reais |
| ⭐ `/seguranca/` | ✅ publicada — pilar diferenciador |
| `/sobre` | 🔲 depende de dados reais de equipe |
| `/regulamentacao` | 🔲 |
| `/politica-de-privacidade` | 🔲 obrigatório LGPD |
| `/termos-de-uso` | 🔲 |
| `/trabalhe-conosco` | 🔲 baixa prioridade |

## Bloco B — Como funciona (educacional)

| Página | Status |
|---|---|
| `/como-funciona` (hub) | 🔲 |
| `/o-que-e-consorcio` · `/tres-caminhos` · `/como-ser-contemplado` · `/consorcio-ou-financiamento` · `/vantagens-do-consorcio` · `/vale-a-pena-fazer-consorcio` · `/consorcio-e-seguro` · `/consorcio-sem-juros` | 🔲 8 spokes |
| `/simulacao-consorcio` | 🔲 conversão central |
| `/faq` | 🔲 |

## Bloco C — Segmentos

| Hub | Status | Spokes pendentes |
|---|---|---:|
| `/consorcio-veiculos` | ✅ publicado | 8 |
| `/consorcio-imoveis` | ✅ publicado | 9 |
| `/consorcio-caminhao` | ✅ publicado | 3 |
| `/consorcio-maquinas-agricolas` | ✅ publicado | 5 |
| `/consorcio-servicos` | ✅ publicado | 10 |
| `/consorcio-empresa` | ✅ publicado | 4 |
| `/consorcio-embarcacoes` | ✅ publicado | 2 |
| ⭐ `/consorcio-contemplado` | ✅ publicado — como a operação funciona | 1 |

Cada hub tem keyword própria, title e description únicos (anti-canibalização), 3 vantagens,
lista de cobertura, FAQ próprio e bloco de compliance.

**Links internos já ativos:** os 8 cards da Home apontam para os hubs, e os 8 hubs
aparecem no rodapé de **todas** as páginas.

> **Gerador:** `_codigo/gerar_hubs.py` — a estrutura de conteúdo fica num dicionário Python.
> Para ajustar copy de um hub, editar lá e republicar.

---

## Ordem sugerida de produção

1. ~~**Hubs de segmento** (8)~~ ✅ **concluído em 25/07/2026**
2. ⭐ `/seguranca/` — volume alto, concorrência séria baixa, é o diferencial da marca
3. **Bloco B** (11) — `/como-funciona` e spokes educacionais alimentam os hubs por link interno
4. **Spokes de segmento** (42) — cauda longa, em lotes por categoria
5. **Legais** — privacidade e termos (LGPD)
6. **Blog** — abrir pelo cluster Segurança e verificação

---

## Bloqueios de dado real (não inventar)

- [ ] Telefone comercial, e-mail `@moveconconsorcio.com`, WhatsApp, horário
- [ ] Equipe: nome, foto e certificação ABAC PCA-10 → trava `/sobre`
- [ ] Condições contratuais de desistência → trava parte do FAQ
- [ ] URL oficial da consulta de administradoras no Bacen
- [ ] Números de operação e depoimentos reais → travam blocos de prova social
