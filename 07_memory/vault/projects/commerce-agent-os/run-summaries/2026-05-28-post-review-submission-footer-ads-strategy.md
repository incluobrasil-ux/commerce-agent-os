---
created_at: 2026-05-28T23:59:00Z
type: run-summary
task: Auditoria pós-final, footer fix, GMC review submetido, Google Ads strategy
status: completed
mutations_applied: 2
errors: 0
---

# Run Summary — Footer Fix + GMC Review Submitted + Google Ads Strategy

**Data:** 2026-05-28  
**Tarefa:** Sessão final: 2 handles residuais encontrados e corrigidos, footer redesenhado, GMC review submetido, pesquisa e planejamento de Google Ads para R$1.000/dia.  
**Resultado:** ✅ GMC Request Review enviado. 2 mutations extras, 0 erros.

---

## 1. Handle Fixes Residuais (2 mutations — encontradas na auditoria final)

Dois produtos do range `9229xxx` não tinham sido cobertos no batch original de handles porque foram adicionados depois. Encontrados via query `handle:*antiestresse*` em produtos ACTIVE.

| Produto | ID | Handle antigo | Handle novo |
|---|---|---|---|
| Chaveiro Antiestresse (?) | 9229808074914 | `chaveiro-antiestresse` | `chaveiro-relaxamento` |
| Brinquedo Antiestresse (?) | 9229812105378 | `brinquedo-antiestresse` | `brinquedo-relaxamento` |

Mutation usada: `productUpdate` com `redirectNewHandle: true` → 301 redirect automático criado.

**Total do projeto atualizado:** 345+ mutations, 0 erros.

---

## 2. Footer Redesign — Endereço para Coluna Contato

### Problema detectado
O endereço estava inserido no `bottom_text` (barra de copyright) sem separador visual adequado: "CEP 45.075-220Os produtos..." — texto concatenado, visualmente ruim.

### Solução implementada
- **Endereço removido** do `bottom_text`
- **Endereço adicionado** ao topo do bloco `text_y3qDPH` (coluna Contato)
- Executado pelo usuário via sessão separada com prompt fornecido

### Novo subtext do bloco Contato (`text_y3qDPH`)
```html
<p><strong>Endereço:</strong> Av. Serrinha, 3262, Ibirapuera, Vitória da Conquista - BA, CEP 45.075-220</p>
<p><strong>SAC:</strong> contato@incluobrasil.com</p>
<p><strong>WhatsApp:</strong> +55 (77) 99820-5841</p>
<p><strong>Horário:</strong> Seg. a Sex. das 09h às 18h</p>
```

### Novo `bottom_text`
```
65.393.441 ROBERTO DOS SANTOS MEDRADO | CNPJ: 65.393.441/0001-46 | Os produtos da Incluo são brinquedos sensoriais para uso recreativo e educacional. Não substituem avaliação ou tratamento de profissional de saúde.
```

### Observação técnica
MCP `themeFilesUpsert` bloqueia escrita em tema MAIN publicado. Solução: prompt self-contained para sessão Shopify AI separada com contexto completo.

---

## 3. GMC Diagnostics — Confirmação Zero Erros

Antes de submeter o review, verificado:
- **Simprosys:** erros mostrados ("Your products are not showing", "Suspended account") são consequência da suspensão da conta, não erros independentes de produto
- **GMC Diagnostics:** zero erros críticos na lista de produtos
- **Simprosys reinstatement form:** NÃO usado — Simprosys adverte que lojas dropshipping têm baixa taxa de sucesso pelo serviço deles. Review feito diretamente no GMC.

---

## 4. GMC Request Review — SUBMETIDO

**Data:** 2026-05-28  
**Status:** ✅ Enviado para análise — aguardando resposta Google (1-7 dias úteis)

Sequência concluída antes da submissão:
1. ✅ Business Info preenchido (CNPJ 65.393.441/0001-46, endereço, telefone)
2. ✅ Phone Verification concluída
3. ✅ Shipping Service configurado (Brasil, BRL)
4. ✅ Return Policy configurada (7 dias, sem custo)
5. ✅ Simprosys force sync executado
6. ✅ GMC Diagnostics — zero erros críticos
7. ✅ Request Review submetido

---

## 5. Auditoria de Loja — Outros Pontos Identificados

Pontos de otimização além do GMC (não-blockers, para fase pós-aprovação):

| Área | Situação | Prioridade |
|---|---|---|
| Pebolim de Mesa (9219774677154) | Categoria "Brinquedos para bebês" — incorreta | Baixa |
| Penico Portátil (9219762028706) | Categoria "Acessórios para grades" — incorreta | Baixa |
| Temporizador Visual (8928559300770) | Categoria "Relógios de ponto" — deveria ser Temporizadores (3689) | Baixa |
| Simprosys feed titles | Títulos no feed podem ser otimizados para P.Max | Pós-aprovação |

> Não corrigir categorias antes da aprovação do review para não reintroduzir variáveis.

---

## 6. Google Ads Strategy Research — R$1.000/dia

Pesquisa aprofundada concluída. Documento completo em:
`07_memory/vault/global/google-ads-strategy-incluo.md`

### Resumo executivo
- **Campanha ativa** pré-aprovação GMC: 4 vendas nos primeiros 2 dias (algumas de ticket alto)
- **Estrutura recomendada:** Feed-only P.Max (60%) + Standard Shopping top SKUs (30%) + Search remarketing/alta intenção (10%)
- **Meta:** R$1.000/dia de lucro líquido com ROAS 4x e margem ~25%
- **Fase 1 (semanas 1-2):** Feed-only P.Max sem metas de ROAS, aprender o algoritmo
- **Fase 2 (semanas 3-4):** Adicionar assets criativos, segmentar por asset group
- **Fase 3 (mês 2+):** Target ROAS 3x, escalar orçamento, Customer Match com emails Shopify
- **Facebook integration:** Customer Match para Google Ads com compradores do Facebook

---

## Status Final da Sessão

| Item | Status |
|---|---|
| 2 handles residuais antiestresse | ✅ Corrigidos |
| Footer redesign — endereço no lugar certo | ✅ Implementado pelo usuário |
| GMC Request Review | ✅ Submetido 2026-05-28 |
| Google Ads strategy documentada | ✅ vault/global/google-ads-strategy-incluo.md |
| Obsidian atualizado | ✅ Esta sessão |

**Próxima ação:** Aguardar aprovação GMC (1-7 dias). Quando aprovado → subir P.Max feed-only imediatamente.
