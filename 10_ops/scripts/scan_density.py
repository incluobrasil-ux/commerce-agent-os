#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Densidade de termos genericos: marca frases/paragrafos com 3+ ocorrencias."""
import json
import re
import unicodedata
import html
import glob
import os

FILES = [
    "mcp-claude_ai_Shopify-graphql_query-1780535599536.txt",  # page1
    "mcp-claude_ai_Shopify-graphql_query-1780535614699.txt",  # page2
    "mcp-claude_ai_Shopify-graphql_query-1780535628594.txt",  # page3
]
BASE = r"C:\Users\samue\.claude\projects\c--projetos-incluo-commerce-agent-os\a43b65e1-b10a-4b9e-84cd-823c2b8267e4\tool-results"

# raizes (sem acento, lowercase)
ROOTS = ["sensorial", "tatil", "estimul", "cognitiv", "desenvolv"]


def strip_accents(s):
    nfkd = unicodedata.normalize("NFKD", s)
    return "".join(c for c in nfkd if not unicodedata.combining(c))


def norm(s):
    return strip_accents(s).lower()


def split_into_blocks(html_text):
    """Quebra HTML em paragrafos/itens por tags de bloco e <br>, depois em frases."""
    if not html_text:
        return []
    t = html_text
    # normaliza quebras de bloco em delimitador
    t = re.sub(r"(?i)<\s*br\s*/?\s*>", "\n", t)
    t = re.sub(r"(?i)</\s*(p|li|div|h[1-6]|ul|ol|tr|td|section|article)\s*>", "\n", t)
    t = re.sub(r"(?i)<\s*(p|li|div|h[1-6]|ul|ol|tr|td|section|article)[^>]*>", "\n", t)
    # remove tags restantes
    t = re.sub(r"<[^>]+>", " ", t)
    t = html.unescape(t)
    # paragrafos por quebra de linha
    paragraphs = [p.strip() for p in t.split("\n") if p.strip()]
    blocks = []
    for p in paragraphs:
        # frases por . ! ? ;
        sentences = re.split(r"[.!?;]+", p)
        for s in sentences:
            s = re.sub(r"\s+", " ", s).strip()
            if s:
                blocks.append(s)
    return blocks


def count_terms(text):
    n = norm(text)
    hits = []
    for r in ROOTS:
        for _ in re.finditer(re.escape(r), n):
            hits.append(r)
    return hits


def scan_field(value, fieldname, results, handle, is_html=False, is_tags=False):
    if not value:
        return
    if is_tags:
        # trata a lista de tags como um bloco unico (concatenada)
        joined = ", ".join(value) if isinstance(value, list) else str(value)
        blocks = [joined]
    elif is_html:
        blocks = split_into_blocks(value)
    else:
        # title / seo: quebra por frases tambem
        blocks = []
        for p in re.split(r"\n+", value):
            for s in re.split(r"[.!?;]+", p):
                s = re.sub(r"\s+", " ", s).strip()
                if s:
                    blocks.append(s)
    for b in blocks:
        hits = count_terms(b)
        if len(hits) >= 3:
            results.append({
                "handle": handle,
                "field": fieldname,
                "count": len(hits),
                "terms": hits,
                "text": b,
            })


def main():
    all_nodes = []
    for f in FILES:
        path = os.path.join(BASE, f)
        d = json.load(open(path, encoding="utf-8"))
        all_nodes.extend(d["data"]["products"]["nodes"])

    total = len(all_nodes)
    results = []
    for node in all_nodes:
        h = node.get("handle", "")
        scan_field(node.get("title"), "title", results, h, is_html=False)
        scan_field(node.get("descriptionHtml"), "descriptionHtml", results, h, is_html=True)
        seo = node.get("seo") or {}
        scan_field(seo.get("title"), "seo.title", results, h, is_html=False)
        scan_field(seo.get("description"), "seo.description", results, h, is_html=False)
        scan_field(node.get("tags"), "tags", results, h, is_tags=True)

    # ordena por count desc
    results.sort(key=lambda x: x["count"], reverse=True)

    products_with_hits = len(set(r["handle"] for r in results))

    print("TOTAL_PRODUCTS", total)
    print("PRODUCTS_WITH_DENSITY", products_with_hits)
    print("TOTAL_FLAGGED_BLOCKS", len(results))
    out = {
        "total": total,
        "products_with_hits": products_with_hits,
        "results": results,
    }
    json.dump(out, open(os.path.join(BASE, "density_results.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
