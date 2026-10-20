import json, re, unicodedata, html

FILES = [
    r'C:\Users\samue\.claude\projects\c--projetos-incluo-commerce-agent-os\7ea5f4ae-f206-4fb8-8e5d-5762bb9d7765\tool-results\mcp-claude_ai_Shopify-graphql_query-1780534968310.txt',
    r'C:\Users\samue\.claude\projects\c--projetos-incluo-commerce-agent-os\7ea5f4ae-f206-4fb8-8e5d-5762bb9d7765\tool-results\mcp-claude_ai_Shopify-graphql_query-1780534991319.txt',
    r'C:\Users\samue\.claude\projects\c--projetos-incluo-commerce-agent-os\7ea5f4ae-f206-4fb8-8e5d-5762bb9d7765\tool-results\mcp-claude_ai_Shopify-graphql_query-1780535003556.txt',
]
hits = json.load(open(r'c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo\metafield-alt-hits.json',encoding='utf-8'))
affected = sorted(set(h['handle'] for h in hits))

# build product index
idx = {}
imgcount = 0
imgwithalt = 0
altsample = []
for f in FILES:
    d = json.load(open(f, encoding='utf-8'))
    for n in d['data']['products']['nodes']:
        idx[n['handle']] = n
        for img in (n.get('images') or {}).get('nodes', []):
            imgcount += 1
            if img.get('altText'):
                imgwithalt += 1
                if len(altsample) < 8:
                    altsample.append(img['altText'])

out = open(r'c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo\hits-detail.txt','w',encoding='utf-8')
out.write(f"IMAGES total={imgcount} withAlt={imgwithalt}\n")
out.write("ALT SAMPLES:\n")
for a in altsample: out.write("  - "+a+"\n")
out.write("\n"+"="*80+"\n")

# Show full relevant metafields for affected products
KEYS_OF_INTEREST = ('seoking.settings','custom.detalhes_do_produto')
for h in affected:
    n = idx.get(h)
    if not n: continue
    out.write(f"\n### {h}  (id {n['id'].rsplit('/',1)[-1]})\n")
    out.write(f"title: {n.get('title')}\n")
    st=(n.get('seoTitleMf') or {}).get('value')
    sd=(n.get('seoDescMf') or {}).get('value')
    out.write(f"global.title_tag: {st!r}\n")
    out.write(f"global.description_tag: {sd!r}\n")
    for mf in (n.get('metafields') or {}).get('nodes', []):
        nk = f"{mf['namespace']}.{mf['key']}"
        if nk in KEYS_OF_INTEREST:
            v = mf.get('value') or ''
            out.write(f"--- {nk} (type={mf.get('type')}) ---\n")
            out.write(v[:4000]+("\n[TRUNC]\n" if len(v)>4000 else "\n"))
out.close()
print("written; affected handles:", len(affected))
print("images", imgcount, "withAlt", imgwithalt)
