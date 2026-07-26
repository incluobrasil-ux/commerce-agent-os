# GATE 0.2 — auditoria de /docs/

Executado em 26/07/2026. Checklist da seção 5.4 do manual de prompts.
**Auditor não corrige — apenas reporta.**

## Histórico das passagens

| Passagem | Veredito | Causa |
|---|---|---|
| 1ª | REPROVADO | 2 URLs fora do keyword-map |
| 2ª | REPROVADO | 1 URL fora do keyword-map |
| 3ª | ver abaixo | — |

As URLs acusadas **nunca foram criadas**: eram slugs de concorrente citados
como anti-padrão e o caminho `obrigado` do robots. O detector estava correto —
a notação é que era ambígua, escrevendo URL de terceiro igual a rota nossa.
Corrigidos os **documentos e o gerador**, nunca o gate.

| Arquivo | Item | Status | Evidência |
|---|---|---|---|
| `00-contexto.md` | Expressões proibidas | **OK** | menção explicativa, não uso: white-label |
| `01-compliance.md` | Expressões proibidas | **OK** | as 11 aparecem: é a tabela que as documenta |
| `02-mapeamento-blueprint.md` | Expressões proibidas | **OK** | nenhuma ocorrência |
| `04-padroes-onpage.md` | Expressões proibidas | **OK** | nenhuma ocorrência |
| `05-schema-specs.md` | Expressões proibidas | **OK** | nenhuma ocorrência |
| `06-pendencias.md` | Expressões proibidas | **OK** | menção explicativa, não uso: white-label |
| /docs/ | URLs novas | **OK** | 42 rotas citadas, todas no keyword-map |
| /docs/ | MOVECON como administradora | **OK** | toda menção nega ou atribui à Alpha |
| `06-pendencias.md` | Pendências | **OK** | 9 bloqueios + 5 propostas |
| /docs/ | Números sem origem | **OK** | CNPJ, certificado e 1981 conferidos na fonte |
| /docs/ | Arquivos previstos | **OK** | 6 de 6; 02-arquitetura.json e 03-keywords.json descartados por decisão |

## Veredito

**APROVADO PARA A FASE 1.**

Ressalvas que não reprovam e precisam de decisão:

- Troca de "white-label" por "marca branca" no relatório de origem —
  manter ou restaurar? Ver fim de `06-pendencias.md`.
- As 5 propostas PR1-PR5 seguem **não criadas**, aguardando aprovação.
