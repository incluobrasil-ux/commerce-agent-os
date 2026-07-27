# GATE — correção de produto: antecipação da taxa

Executado em 26/07/2026. Formato da seção 5.4 do manual.
**Auditor não corrige — apenas reporta.** Medido no HTML servido.

| Item | Resultado |
|---|---|
| Rotas indexáveis auditadas | 78 |
| Rotas que alegam ausência de entrada | 13 |
| Delas, com a ressalva no mesmo documento | **13** |
| Percentual de `kFirst` vazando para o site | 0 |
| Expressões proibidas | 0 |
| Placeholders renderizados | 0 |

## Veredito

**APROVADO.**

Nenhuma rota alega ausência de entrada sem revelar que a primeira
parcela é maior. Nenhum percentual de `kFirst` vazou para o site —
os números vivem no `/docs/`, e quem mostra valor ao visitante é o
simulador, que sempre separou "1ª parcela" de "Demais parcelas".
