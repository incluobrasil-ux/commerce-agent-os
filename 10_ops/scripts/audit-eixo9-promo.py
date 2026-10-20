"""Eixo 9 — Promoções enganosas via MCP (limites declarados)."""
import json, re, sys, io, unicodedata
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
# dumps com price/compareAt
FILES_PRICE = [
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781476557813.txt",
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781476569962.txt",
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781476581087.txt",
]
# dumps com descriptionHtml/title/tags/metafields
FILES_DESC = [
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781475107178.txt",
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781475171491.txt",
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781475181969.txt",
]
def norm(s): return ''.join(c for c in unicodedata.normalize('NFKD', s or '') if not unicodedata.combining(c)).lower()

prods_p = {}
for f in FILES_PRICE:
    for p in json.load(open(f,encoding='utf-8'))['data']['products']['nodes']:
        prods_p[p['handle']]=p
prods_d = {}
for f in FILES_DESC:
    for p in json.load(open(f,encoding='utf-8'))['data']['products']['nodes']:
        prods_d[p['handle']]=p

print(f"# EIXO 9 — Promo [LIVE] produtos com price: {len(prods_p)} / desc: {len(prods_d)}\n")

# A.1 compareAtPrice — quem tem
with_compare = []
inflated_suspect = []  # compareAt muito acima do price (>2.5x)
for h,p in prods_p.items():
    for v in p['variants']['nodes']:
        try:
            pr=float(v.get('price') or 0); cap=float(v.get('compareAtPrice') or 0)
        except: pr=0; cap=0
        if cap>0 and pr>0:
            with_compare.append((h, v.get('title') or '', pr, cap, cap/pr))
            if cap/pr >= 2.5:
                inflated_suspect.append((h, v.get('title') or '', pr, cap, cap/pr))
print(f"## A.1 — compareAtPrice")
print(f"Variantes com compareAtPrice declarado: {len(with_compare)}")
print(f"Razão compareAt/price ≥ 2.5x (preço 'de' inflado suspeito): {len(inflated_suspect)}")
for h,t,pr,cap,r in inflated_suspect[:20]:
    print(f"- {h} | {t} | de R$ {cap:.2f} por R$ {pr:.2f} ({r:.1f}x)")
print(f"\nAmostra compareAt presente (até 15):")
for h,t,pr,cap,r in with_compare[:15]:
    print(f"- {h} | {t} | de R$ {cap:.2f} por R$ {pr:.2f} ({r:.2f}x)")

# A.2 Superlativos / promo em title/descriptionHtml/tags
# CONAR: superlativo precisa comprovação. "melhor", "nº1", "primeiro", "único", "exclusivo"
patterns = {
    'melhor': r'\bmelhor\b',
    'menor preco': r'menor\s+pre[cç]o',
    'maior': r'\bmaior\b',
    'numero 1': r'(n[uú]?mero\s*1|n[º°]\s*1|#1|nº1)',
    'unico': r'\b[uú]nico\b',
    'exclusivo': r'\bexclusivo\b',
    'imperdivel': r'imperd[ií]vel',
    'imbativel': r'imbat[ií]vel',
    'so hoje': r's[oó]\s+hoje',
    'ultimas unidades': r'[uú]ltimas?\s+unidades?',
    'restam': r'restam?\s+\d+',
    'apenas': r'\bapenas\s+\d+\s+(restant|disponi)',
    'esgotando': r'esgota(ndo|r)',
    'oferta relampago': r'oferta\s+rel[aâ]mpago',
    'black friday': r'black\s*friday',
    'mega desconto': r'mega\s+desconto',
    'compre 1 leve': r'compre\s+\d+\s+leve\s+\d+',
    'leve N pague N': r'leve\s+\d+\s+pague\s+\d+',
    'frete gratis (claim)': r'frete\s+gr[aá]tis',  # mais comum, ainda assim — frete grátis é real (já confirmado)
    'recomendado por especialista': r'recomendado\s+por\s+(especialist|m[eé]dic)',
    'aprovado por': r'aprovado\s+por\s+(especialist|m[eé]dic)',
    'cientificamente comprovado': r'cientificamente\s+comprovad',
    'patenteado': r'patente(ado)?',
    'campeao de vendas': r'campe[aã]o\s+de\s+vendas',
    'best seller': r'best\s*seller',
    'top vendas': r'top\s+(vendas|de\s+vendas)',
}
hits = {}
for h,p in prods_d.items():
    blob = (p.get('title') or '') + ' ||T|| ' + (p.get('descriptionHtml') or '') + ' ||G|| ' + ' '.join(p.get('tags') or [])
    for mf in p['metafields']['nodes']:
        if mf.get('namespace')=='custom' and mf.get('key')=='detalhes_do_produto':
            blob += ' ||D|| ' + (mf.get('value') or '')
    bn = norm(blob)
    for name, pat in patterns.items():
        for m in re.finditer(pat, bn):
            field='other'
            # locate
            tnorm = norm(p.get('title') or '')
            if m.group(0) in tnorm: field='title'
            hits.setdefault(name, []).append((h, field, bn[max(0,m.start()-40):m.end()+40]))

print(f"\n## A.2 — Superlativos / claims promo")
for name, lst in hits.items():
    handles_uniq = sorted(set(x[0] for x in lst))
    print(f"\n### {name} — {len(lst)} ocorrências em {len(handles_uniq)} produtos")
    for h, fld, sn in lst[:8]:
        print(f"  - {h} ({fld}): \"…{sn.replace(chr(10),' ')[:110]}…\"")
    if len(lst)>8: print(f"  ... +{len(lst)-8}")
