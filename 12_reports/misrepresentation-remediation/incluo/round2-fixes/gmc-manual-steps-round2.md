# GMC Manual Steps — Round 2 (fazer HOJE antes de 4 jun.)

**Próxima análise disponível: 4 de junho de 2026**  
**Tempo estimado total: 30-45 minutos**

---

## PASSO 1 — Verificação de Identidade (MAIS IMPORTANTE — ~10 min)

Este é o fix mais eficaz para Misrepresentation em 2026. O Google exige prova de identidade do responsável e da empresa.

**Onde encontrar:**
1. No GMC, clique em "Corrigir problema" (botão vermelho no topo)
2. OU vá em: Configurações → Gerais → rolar até "Verificação da empresa"
3. OU acesse: merchants.google.com → clique no ícone de conta (canto sup. direito) → "Verificação da empresa"

**O que submeter:**
- CNH ou RG do responsável (Roberto dos Santos Medrado)
- Comprovante de endereço: conta de luz/água/telefone com o endereço da Av. Serrinha, 3262, Vitória da Conquista - BA
- Cartão CNPJ da Receita Federal (imprimir em: servicos.receita.fazenda.gov.br → Emitir comprovante CNPJ → 65.393.441/0001-46)

> Se a opção de verificação não aparecer no painel: no banner de Deturpação, clique em "Discordo desse problema" — isso abre um fluxo onde a verificação de identidade aparece como opção.

---

## PASSO 2 — Adicionar Local de Origem do Envio (~2 min)

**Onde:** GMC → Entregas e devoluções → Políticas de frete → editar `flat_0.00_BRL_490_grátis` (ícone de lápis)

**O que adicionar em "Locais de origem do envio":**
- Clique "Adicionar local de origem do envio"
- Nome: `Vitória da Conquista - BA`
- Endereço: Av. Serrinha, 3262
- Cidade: Vitória da Conquista
- Estado: Bahia
- CEP: 45075-220
- País: Brasil

Salvar.

---

## PASSO 3 — Verificar Política de Devolução (~3 min)

**Onde:** GMC → Entregas e devoluções → aba "Políticas de devolução"

**Verificar se existe política ativa. Se não existir, criar:**
- Clique "Adicionar política de devolução"
- Nome: "Devolução 7 dias"
- País: Brasil
- Prazo: 7 dias após recebimento
- Custo de devolução: Gratuito (sem custo para o cliente)
- Método: Correios / logística reversa
- Salvar

---

## PASSO 4 — Forçar Sincronização do Feed (~2 min)

**Feed Shopify App API (405 produtos):**
1. GMC → Configurações → Fontes de dados
2. Clique nos 3 pontos (...) ao lado de "Shopify App API"
3. Selecione "Sincronizar agora" ou "Buscar agora"
4. Aguardar confirmação de sincronização

**Feed Simprosys (43 produtos):**
1. Abrir app Simprosys no Shopify Admin
2. Ir em Settings ou Dashboard
3. Procurar "Sync now" ou "Force fetch"
4. Executar resync completo

> **IMPORTANTE:** Depois da sincronização, verificar em GMC → Produtos → Todos os produtos se os itens com "China Mainland" no título ainda aparecem. Se ainda aparecerem após sync, significa que ainda existem variantes ativas no Shopify com esse nome — reportar para corrigir via mutations no claude.ai.

---

## PASSO 5 — Avaliar desativar o feed Simprosys (~5 min)

Existem 2 feeds ativos ao mesmo tempo para Brasil:
- Shopify App API: 405 produtos (fonte principal)
- Simprosys Feed: 43 produtos (sobreposição)

Tendo os dois ativos, há risco de dados conflitantes. O Simprosys pode estar enviando dados antigos (pré-mutations).

**Opção A (recomendada): Deixar só o Shopify App API**
1. GMC → Fontes de dados → Simprosys Feed → 3 pontos → Pausar ou Remover

**Opção B: Manter os dois, mas verificar o que o Simprosys está enviando**
1. Clicar em "Simprosys Feed" → ver quais 43 produtos são esses
2. Verificar se esses 43 produtos têm dados atualizados

---

## PASSO 6 — Verificar "Informações comerciais" completas (~3 min)

**Onde:** GMC → Configurações → Informações comerciais

Confirmar que está preenchido:
- [x] Nome: Incluo Brasil
- [x] Endereço: Av. Serrinha, 3262, Vitória da Conquista, Bahia, 45075-220
- [x] Email: contato@incluobrasil.com
- [ ] **Telefone/WhatsApp:** (77) 99820-5841 — verificar se está listado
- [ ] **Categoria do negócio:** Brinquedos e Jogos / Produtos para crianças
- [ ] **CNPJ:** 65.393.441/0001-46 — verificar se está no campo de identificação fiscal

---

## PASSO 7 — Verificar Google Ads (~5 min)

**Onde:** ads.google.com → Políticas → Centro de políticas

Verificar se há alguma violação ativa de política que possa estar sinalizando Misrepresentation para o reviewer GMC.

Se existir violação de "Conteúdo enganoso" ou "Alegações de saúde" em anúncios anteriores → reportar para remediação separada.

---

## CHECKLIST FINAL ANTES DO DIA 4 DE JUNHO

- [ ] Verificação de identidade submetida no GMC
- [ ] Local de origem do envio adicionado
- [ ] Política de devolução confirmada/criada
- [ ] Feed Shopify App API sincronizado manualmente
- [ ] Simprosys resync executado
- [ ] Simprosys feed avaliado (manter ou remover)
- [ ] Mutations Shopify (China Mainland + Pranchas PECS) executadas via claude.ai
- [ ] Verificação visual: nenhum produto com "China Mainland" no título no GMC
- [ ] Verificação visual: coleção "Pranchas PECS" renomeada na loja
- [ ] Submeter nova análise em 4 de junho

---

## O QUE DIZER NO FORMULÁRIO DE REVISÃO (se houver campo de texto)

> "Realizamos uma remediação completa de 345+ campos do catálogo (títulos, descrições, meta tags, URLs, coleções, artigos de blog) removendo qualquer linguagem terapêutica ou clínica. A loja vende brinquedos sensoriais para uso recreativo e educacional, com disclaimers explícitos em múltiplas páginas (FAQ, Sobre Nós, Aviso Legal, Footer) de que os produtos não substituem terapia ou tratamento médico. Todos os preços, políticas de frete e devolução estão atualizados. Submetemos verificação de identidade da empresa (CNPJ 65.393.441/0001-46)."
