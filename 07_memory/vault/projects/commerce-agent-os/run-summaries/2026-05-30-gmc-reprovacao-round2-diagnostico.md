---
created_at: 2026-05-30T00:00:00Z
type: run-summary
task: Diagnóstico GMC reprovação round 2 — auditoria de screenshots + plano de remediação
status: in_progress
mutations_applied: 0
errors: 0
---

# Run Summary — GMC Reprovação Round 2 — Diagnóstico e Plano

**Data:** 2026-05-30  
**Contexto:** GMC Request Review submetido em 28/05/2026 foi reprovado. Tipo: verificação MANUAL. Motivo: Deturpação. Próxima análise: 4 de junho de 2026.

---

## O QUE O GMC MOSTROU

| Painel | O que foi visto |
|---|---|
| Deturpação | Verificação MANUAL — "clientes sendo enganados" |
| Qualidade da loja | **Boa** — na média do mercado |
| Produtos | 448 total, 448 não aparecem — 100% reprovados |
| Requer atenção | "Conta suspensa por violação da política" — 448 produtos (100%) |
| Informações comerciais | ✅ Nome, endereço, email preenchidos. Site: Verificado + Reivindicado |
| Fontes de dados | Shopify App API (405) + Simprosys Feed (43) — última atualização: "-" (sem sync recente) |
| Entregas e devoluções — Frete | ✅ Gratuito, 4-7 dias, Brasil |
| Entregas e devoluções — Origem do envio | **🔴 VAZIO** — não configurado |
| Entregas e devoluções — Devolução | Não capturado — verificar |

---

## CAUSAS IDENTIFICADAS (por probabilidade)

### 1. 🔴 CRÍTICO — "China Mainland" ainda visível no feed GMC
Produtos aparecem com variantes "/China Mainland" no título dentro do GMC.
- Os 2 produtos corrigidos em 28/05 foram: Mordedor Sensorial Kit e Colete Sensorial
- Mas no feed GMC (Shopify App API) os produtos AINDA mostram "China Mainland"
- Provável causa: feed não sincronizou desde as mutations
- Ação: forçar resync imediato do Shopify App API + verificar se há variantes residuais

### 2. 🔴 CRÍTICO — Verificação de identidade NÃO realizada
Em 2026, Google exige verificação de identidade com documentos para reinstatement de Misrepresentation.
- Site verificado/reivindicado ≠ identidade verificada
- Sem documento = sem credibilidade para reviewer manual
- Ação: submeter CNH/RG + comprovante endereço + CNPJ via fluxo no GMC

### 3. 🔴 CRÍTICO — Local de origem do envio VAZIO
Seção "Locais de origem do envio" está completamente vazia.
- Agrava o problema China Mainland: Google não sabe de onde envia
- Ação: adicionar Av. Serrinha, 3262, Vitória da Conquista - BA

### 4. 🟠 IMPORTANTE — Título da coleção "Pranchas PECS" não renomeado
O body foi limpo em 28/05, mas o TÍTULO da coleção ainda é "Pranchas PECS e Comunicação Alternativa".
- Um reviewer manual navega o menu e vê esse nome imediatamente
- Ação: mutation para renomear via claude.ai

### 5. 🟠 IMPORTANTE — Dois feeds concorrentes, ambos desatualizados
- Shopify App API: 405 produtos, sem data de atualização
- Simprosys Feed: 43 produtos, sem data de atualização
- Conflito potencial de dados entre os dois feeds
- Ação: forçar sync dos dois, avaliar desativar Simprosys como fonte principal

---

## PLANO DE AÇÃO — ANTES DO DIA 4 DE JUNHO

### HOJE (usuário faz no GMC — ~30 min)
Ver instruções detalhadas em: `12_reports/misrepresentation-remediation/incluo/round2-fixes/gmc-manual-steps-round2.md`

1. **Verificação de identidade** — documentos no GMC
2. **Adicionar local de origem do envio** — Av. Serrinha
3. **Confirmar política de devolução** — aba Políticas de devolução
4. **Forçar resync Shopify App API** — Fontes de dados → sync
5. **Forçar resync Simprosys** — via app Simprosys
6. **Avaliar desativar Simprosys feed**

### HOJE (via claude.ai com MCP Shopify)
Ver mutations em: `12_reports/misrepresentation-remediation/incluo/round2-fixes/shopify-mutations-round2.md`

1. **Query: buscar variantes com "China Mainland" restantes**
2. **Deletar variantes encontradas**
3. **Renomear coleção 326443630754** → "Pranchas de Comunicação Visual Alternativa"
4. **Confirmar Sobre Nós limpa**

### DIA 4 DE JUNHO (após todas as correções acima)
1. Submeter nova análise no GMC
2. Preencher justificativa (template em gmc-manual-steps-round2.md)

---

## NOTA SOBRE GOOGLE ADS
Verificar: ads.google.com → Políticas → Centro de políticas
Se houver violações ativas de "alegações de saúde" em anúncios anteriores, isso pode influenciar o reviewer GMC.
Não é blocker direto, mas aumenta escrutínio.

---

## STATUS
- [ ] GMC identity verification
- [ ] Shipping origin adicionado
- [ ] Return policy confirmada
- [ ] Shopify App API sincronizado
- [ ] Simprosys sincronizado
- [ ] China Mainland variants auditadas/removidas (claude.ai)
- [ ] Pranchas PECS renomeado (claude.ai)
- [ ] Nova análise submetida em 4 jun.
