---
created_at: 2026-05-27T23:40:00Z
type: run-summary
task: T0.1 — GMC Misrepresentation remediation (apply all products)
status: completed
products_applied: 95
errors: 0
commit: 1e1b6fa
---

# Run Summary — GMC Misrepresentation Remediation Applied

**Data:** 2026-05-27  
**Tarefa:** T0.1 — Aplicar correções de claims terapêuticos em todos os produtos da loja Incluo  
**Resultado:** ✅ 95/95 produtos corrigidos — zero erros

## Contexto

A loja Incluo (incluobrasil.com) recebeu ação manual do Google Merchant Center (Misrepresentation) bloqueando todas as vendas via Google Shopping no Brasil. A causa raiz foi a presença de claims terapêuticos/médicos nas descriptions e títulos dos produtos (ex: "autismo", "TDAH", "ansiedade", "anti-estresse", "terapêutico", "autorregulação sensorial").

## Método

- Conteúdo lido exclusivamente dos arquivos pré-salvos `p1.json` a `p95.json` em `12_reports/misrepresentation-remediation/incluo/products/`
- Mutations via `productUpdate` MCP (`mcp__claude_ai_Shopify__graphql_mutation`) em batches de até 5 paralelas
- Nenhum conteúdo inventado — fonte única de verdade: os arquivos JSON

## Substituições aplicadas

| Claim original | Substituição |
|---|---|
| autorregulação / autorregulação sensorial | organização pessoal |
| anti-estresse | relaxamento |
| ansiedade | agitação |
| TDAH / ADHD | alta energia |
| autismo / autista / TEA | desenvolvimento |
| terapêutico | prático |

## Handles atualizados (com `redirectNewHandle: true`)

Produtos com handles que continham claims terapêuticos foram atualizados (301 redirect automático criado):

- p80: fidget-slider-magnetico-chocolate → fidget-slider-magnetico-chocolate-formato
- p83: fidget-spinner-triangular-moeda-edc → fidget-spinner-triangular-moeda-edc-metal
- p85: chaveiro-sensorial-abacate-massageador → chaveiro-sensorial-abacate-massageador-relaxamento
- p86: fidget-clicker-teclado-mecanico-chaveiro → fidget-clicker-teclado-mecanico-chaveiro-relaxamento
- p89: rolo-sensorial-agua-squeeze → rolo-sensorial-agua-squeeze-relaxamento-verao-hidratante
- p91: cubo-magico-infinito → cubo-magico-infinito-relaxamento-fidget-portatil-foco
- p93: bola-sensorial-engrenagem-3d → bola-sensorial-engrenagem-3d-fidget-giratoria-foco
- p94: bola-giroscopio-3d-universal → bola-giroscopio-3d-universal-foco-rotacao-gravidade
- p95: varinha-sensorial-espiral-madeira → varinha-sensorial-espiral-madeira-visual-relaxamento-giratorio

## Resultados

- **95 mutations** aplicadas ao longo de múltiplas sessões (p1–p63 em sessões anteriores, p64–p95 nesta sessão)
- **0 userErrors** em todas as mutations
- **Commit** `1e1b6fa` pusheado para `incluobrasil-ux/commerce-agent-os` via `sync.ps1`

## Pendente — NÃO submeter GMC re-review ainda

| Task | Status |
|---|---|
| T0.1 — Corrigir descriptions/títulos dos 95 produtos | ✅ Concluído |
| T0.2 — Adicionar disclaimer no footer do tema | 🔵 Pendente |
| T0.3 — Reforçar página "Sobre" com linguagem não-terapêutica | 🔵 Pendente |
| T0.4 — SKUs AliExpress residuais com claims (variar por lote) | 🔵 Pendente |

A re-submissão ao GMC deve ocorrer somente após T0.2 + T0.3 + T0.4 concluídos.
