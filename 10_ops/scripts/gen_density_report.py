# -*- coding: utf-8 -*-
import json
import os

BASE = r"C:\Users\samue\.claude\projects\c--projetos-incluo-commerce-agent-os\a43b65e1-b10a-4b9e-84cd-823c2b8267e4\tool-results"
OUT = r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\densidade-genericos.md"

d = json.load(open(os.path.join(BASE, "density_results.json"), encoding="utf-8"))
results = d["results"]


def esc(s):
    s = s.replace("|", "\\|").replace("\n", " ").strip()
    if len(s) > 240:
        s = s[:237] + "..."
    return s


def termlist(terms):
    # mostra com contagem por termo
    from collections import Counter
    c = Counter(terms)
    return ", ".join(f"{k}×{v}" if v > 1 else k for k, v in sorted(c.items(), key=lambda x: -x[1]))


lines = []
lines.append("# Densidade de termos genericos (varredura clinica latente)")
lines.append("")
lines.append("Loja: incluobrasil.com (Shopify). Modo somente-leitura.")
lines.append("")
lines.append("Termos genericos (raiz, sem acento, case-insensitive): `sensorial`, `tatil`, `estimul`, `cognitiv`, `desenvolv`.")
lines.append("")
lines.append("Criterio: frase ou paragrafo com **3 ou mais** ocorrencias desses termos (repeticoes contam). Varredura sobre title / descriptionHtml / seo.title / seo.description / tags. Filename de imagem e altText NAO foram contados.")
lines.append("")
lines.append(f"- Total de produtos varridos: **{d['total']}**")
lines.append(f"- Produtos com pelo menos 1 frase de densidade 3+: **{d['products_with_hits']}**")
lines.append(f"- Total de blocos (frases/paragrafos/tags) sinalizados: **{len(results)}**")
lines.append("")
lines.append("Ordenado por n de termos decrescente.")
lines.append("")
lines.append("| # | handle | campo | n de termos | termos (lista) | frase/paragrafo exato (trecho) |")
lines.append("|---|--------|-------|-------------|----------------|--------------------------------|")
for i, r in enumerate(results, 1):
    lines.append(f"| {i} | {r['handle']} | {r['field']} | {r['count']} | {termlist(r['terms'])} | {esc(r['text'])} |")

os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, "w", encoding="utf-8").write("\n".join(lines) + "\n")
print("written", OUT, "rows", len(results))
