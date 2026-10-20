---
created_at: 2026-05-27T20:45:00Z
tags: [misrepresentation, remediation, t0, incluo, gmc-re-review, template]
source: chat-session
kind: operational-template
related:
  - 07_memory/vault/projects/commerce-agent-os/run-summaries/2026-05-27-audit-gmc-misrepresentation-block-incluo.md
  - rewrite-guide-pdp-20260527.md
---

# Nota de Re-review GMC — Incluo (Misrepresentation)

**Para que serve:** texto pronto para colar em **Google Merchant Center → Diagnostics → Misrepresentation → "Solicitar nova análise"**.

**Pré-requisitos antes de enviar:**
- [ ] T0.1 completo (reescrita PDPs por [`rewrite-guide-pdp-20260527.md`](rewrite-guide-pdp-20260527.md))
- [ ] T0.2 completo (disclaimer em 100% das PDPs)
- [ ] T0.3 completo (página "Quem somos" reforçada com razão social, CNPJ, modelo de negócio)
- [ ] T0.4 completo (SKUs `14:XXX#YYY` substituídos por `INC-<slug>-<variante>` nas pgs 2/3)
- [ ] `pnpm merchant:audit` retornando 🟢 0 em `link:therapeutic-claim` e `content:therapeutic-claim`
- [ ] Feed Simprosys re-puxado e validado pós-edições

**Tom:** factual, sem desculpas extensas, sem promessas vagas. Revisor Google quer ver **mudanças concretas e verificáveis**, não compromisso futuro.

---

## Texto da nota (PT-BR, colar como está)

```
Prezada equipe de Política do Merchant Center,

Solicitamos nova análise após implementarmos quatro correções estruturais
que endereçam diretamente a sinalização de Deturpação:

1. REVISÃO DE LINGUAGEM EM 100% DO CATÁLOGO
   Removemos de todos os títulos, descrições e URLs (handles) qualquer
   terminologia clínica ou de diagnóstico (incluindo TDAH, TEA, autismo,
   ansiedade, depressão, "autorregulação sensorial", "anti-estresse",
   "anti-ansiedade", "alívio", "trata"). Substituímos por linguagem
   funcional neutra que descreve apenas o objeto físico (ex.: "brinquedo
   manipulativo", "conforto tátil", "objeto sensorial"). A loja não
   possui registro ANVISA e não comercializa dispositivos médicos —
   a linguagem agora reflete essa realidade.

2. DISCLAIMER PADRONIZADO EM TODAS AS PDPs
   Adicionamos em 100% das páginas de produto o aviso: "Este produto é
   um brinquedo recreativo. Não é dispositivo médico, não trata, cura
   ou alivia condições de saúde, e não substitui acompanhamento
   profissional."

3. IDENTIDADE DE NEGÓCIO REFORÇADA
   Atualizamos a página "Sobre" com razão social, CNPJ, endereço,
   modelo de negócio explícito (loja varejista de brinquedos sensoriais)
   e canais de contato. Políticas de privacidade, troca, devolução e
   termos seguem publicadas em incluobrasil.com/policies/.

4. NORMALIZAÇÃO DE SKUs
   Substituímos identificadores de SKU em padrão de marketplace externo
   (ex.: "14:200006152#VT03-GREEN") por SKUs internos padronizados
   (formato INC-<produto>-<variante>), eliminando ambiguidade sobre
   identidade da loja.

Todos os ajustes já estão refletidos no feed enviado via Simprosys e
podem ser verificados nas próprias PDPs em incluobrasil.com.

Permanecemos à disposição para esclarecimentos adicionais.

Atenciosamente,
Equipe Incluo Brasil
contato@incluobrasil.com
```

---

## Após envio

- Anotar data/hora do envio em [`07_memory/vault/projects/commerce-agent-os/next-actions.md`](../../../07_memory/vault/projects/commerce-agent-os/next-actions.md) (T0.5).
- Janela esperada de resposta: 3-7 dias úteis (pode chegar a 14).
- Se aprovado: liberar fila T1 (N26.c/d, N27 writeback real).
- Se negado novamente: capturar print do motivo, abrir run-summary novo, **não** reenviar antes de identificar o gap.
