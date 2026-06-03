---
created_at: 2026-05-30T00:00:00Z
type: run-summary
task: Round 2 — auditoria Shopify pós-reprovação GMC, scan completo via MCP
status: completed
mutations_applied: 0
errors: 0
---

# Run Summary — Round 2 Shopify Audit (2026-05-30)

**Motivo:** GMC reprovado em 28/05 — verificação manual, "Deturpação". Próxima análise: 4 jun.

---

## RESULTADO DA AUDITORIA LIVE

### ✅ China Mainland — LIMPO
Varredura de 250 produtos ativos via `shopify_list_products`.
**Nenhuma variante com "China Mainland" encontrada.**
As deleções do dia 28/05 estão em vigor. Feed GMC mostrando dados antigos — problema de sync do Simprosys/Shopify App API, não de dado real.

### ✅ Product types — OK
- Pebolim: `Jogos de Mesa` ✅
- Penico: `Produto de Higiene Infantil` ✅
- Temporizador: `Ferramentas de Gestão do Tempo e Organização` ✅

### 🔴 Coleção "Pranchas PECS" — PENDENTE MANUAL
**ID:** 326443630754
**Handle atual:** `pranchas-pecs-e-comunicacao-alternativa`
**Título atual:** `Pranchas PECS e Comunicação Alternativa`

O body foi limpo em 28/05, mas TÍTULO e HANDLE ainda contêm "PECS".
MCP principal (`claude.ai Shopify`) com token expirado — não foi possível executar via automação.

**Ação manual:** Shopify Admin → incluo.myshopify.com/admin/collections/326443630754
- Título → `Pranchas de Comunicação Visual Alternativa`
- Handle → `pranchas-comunicacao-visual-alternativa`
- Salvar (redirect 301 automático)

### 🟡 Taxonomy categories (3 produtos) — pendente GraphQL
Esses 3 produtos têm `product_type` correto mas taxonomy category errada no feed GMC:
- Pebolim (9219774677154): categoria → brinquedos de mesa/família
- Penico (9219762028706): categoria → acessórios infantis
- Temporizador (8928559300770): categoria → Temporizadores (node 3689)

Requerem GraphQL mutation com campo `category`. Fazer na próxima sessão com MCP disponível.

---

## PENDÊNCIAS PARA DIA 4 DE JUNHO

### Manual (você faz no browser):
- [ ] Renomear coleção Pranchas PECS (admin Shopify — 2 min)
- [ ] GMC: Verificação de identidade (documentos)
- [ ] GMC: Adicionar local de origem do envio
- [ ] GMC: Confirmar política de devolução
- [ ] GMC: Forçar resync Shopify App API + Simprosys

### Próxima sessão com MCP (GraphQL disponível):
- [ ] Taxonomy categories: Pebolim, Penico, Temporizador

### Dia 4 de junho:
- [ ] Submeter nova análise GMC

---

## INFO TÉCNICA

- **Domínio myshopify:** `v0ycj3-1u.myshopify.com`
- **MCP funcionando:** `shopify-mcp-v1_2` (REST, sem GraphQL)
- **MCP expirado:** `claude.ai Shopify` (precisa re-auth via claude.ai interface)
