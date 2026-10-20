---
tipo: recurso
status: em-andamento
tags: [movecon, materiais, pdf, branding]
atualizado: 2026-07-28
---

# 📄 Materiais PDF MOVECON

Kit de materiais institucionais e operacionais da MOVECON, gerados por código a partir do
sistema de design da marca. Referência de estrutura: material da ADECON (administradora
concorrente); identidade: **Manual da Marca MOVECON v1.0**.

## Estrutura

```
materiais-pdf/
├── brand/movecon_brand.py     ← sistema de design (paleta, fontes, componentes)
├── assets/
│   ├── fonts/                 ← Montserrat + Inter (estáticas, geradas da variable font)
│   ├── logo/                  ← logo real em PNG transparente (nunca redesenhar)
│   └── img/                   ← imagens do Nano Banana Pro entram AQUI
├── out/                       ← PDFs gerados
├── 01-apresentacao-institucional.py
└── PROMPTS-NANO-BANANA.md     ← prompts prontos para gerar as imagens
```

## Como gerar

```powershell
python "01-apresentacao-institucional.py"
```

O script avisa no fim quais slots de imagem ainda estão pendentes. Sem a imagem, ele desenha
um fundo procedural na identidade da marca — o PDF nunca quebra.

## Regras da marca aplicadas no código

| Regra | Onde |
|---|---|
| Logo sempre do arquivo original, nunca re-tipografada | `logo()` usa PNG vetorizado do `MOVECON.svg` |
| Turquesa nunca como texto sobre fundo claro (2,2:1 reprova) | eyebrow claro usa Petróleo; turquesa só em preenchimento |
| CTA = fundo turquesa + texto grafite (7,1:1) | `pill()` |
| Chevrons em cor única, baixa opacidade, fora de texto longo | `chevron_field()` |
| Montserrat em títulos, Inter em corpo | `H1/H2` vs `BODY` |

## Compliance embutido

Todo material carrega o enquadramento definido em [[Posicionamento & Credibilidade]]:

- MOVECON = **plataforma de consórcio**. Nunca "administradora" — em nenhum canal.
- Quem administra os grupos é a **Alpha Administradora de Consórcio Ltda.** — autorizada
  pelo Banco Central (Cert. BCB 03/100/213/88 · CNPJ 90.982.679/0001-54).
- Nunca "MOVECON autorizada pelo Bacen".
- Nunca promessa de contemplação, prazo ou renda.
- **"white label" só em peça B2B** (representantes e parceiros) — regra de escopo por
  audiência de 26/07/2026, em `05 - Site/docs/01-compliance.md`. Sempre com a atribuição na
  mesma tela: marca e venda = MOVECON, administração dos grupos = Alpha. Proibido no site
  público, em peça ao consumidor final e em qualquer texto legal/disclaimer. Nunca colado a
  "administradora". Grafia: duas palavras, sem hífen, sem aspas.

A constante `COMPLIANCE` em `movecon_brand.py` é o texto-padrão de rodapé legal.

## Kit — status

| # | Material | Formato | Status |
|---|---|---|---|
| 01 | Apresentação Institucional | Deck 16:9 · 11 pág. | ✅ gerado — aguardando imagens |
| 02 | Documentos Necessários | Deck 16:9 | ⏳ a fazer |
| 03 | Grade de Comissionamento | A4 retrato | ⏳ depende dos percentuais reais |
| 04 | Guia do Consórcio | A4 retrato | ⏳ a fazer |
| 05 | Síntese de Grupos | 16:9 tabela | ⏳ depende dos dados da Alpha |
| 06 | Calendário de Assembleias | A4 retrato | ⏳ depende dos dados da Alpha |

## Pendências de conteúdo (não inventar)

- [x] ~~E-mail, WhatsApp e Instagram~~ → `samuel@moveconconsorcio.com` · `+55 77 9170-8914` ·
      `@moveconconsorcio` (28/07/2026)
- [x] ~~Confirmar os 4 segmentos~~ → **a Alpha oferece todos** (imóvel, auto, pesados,
      serviços), confirmado em 28/07/2026
- [ ] ⚠️ **Confirmar o nono dígito do WhatsApp** — `9170-8914` tem 8 dígitos; celular BR tem 9.
      Provável `+55 77 99170-8914`. Verificar antes de imprimir.
- [ ] URL definitiva do formulário de cadastro de representante → pág. 9
- [ ] Percentuais da grade de comissionamento por nível e segmento
- [ ] Grupos, faixas de crédito e calendário de assembleias vigentes na Alpha

Ligações: [[Identidade & Marca]] · [[Posicionamento & Credibilidade]] · [[Dados Cadastrais]] · [[00 - Dashboard]]
