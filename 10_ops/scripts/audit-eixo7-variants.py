"""Eixo 7 — Variantes/disponibilidade."""
import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

FILES = [
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781476557813.txt",
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781476569962.txt",
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781476581087.txt",
]
all_p=[]
for f in FILES:
    all_p.extend(json.load(open(f, encoding='utf-8'))['data']['products']['nodes'])

print(f"# EIXO 7 — Variantes/disponibilidade [LIVE]\nTotal produtos: {len(all_p)}")
tv=sum(len(p['variants']['nodes']) for p in all_p)
print(f"Total variantes: {tv}\n")

# A: price=0
price_zero=[]
for p in all_p:
    for v in p['variants']['nodes']:
        pr = v.get('price')
        try: pr_f=float(pr or 0)
        except: pr_f=0
        if pr_f == 0:
            price_zero.append((p['handle'], v.get('title') or '', v.get('sku') or '', pr))
print(f"## A — price=0")
print(f"Variantes com price=0: **{len(price_zero)}** em {len(set(x[0] for x in price_zero))} produtos")
for h,t,s,pr in price_zero:
    print(f"- {h} | {t} | sku=`{s}` | price={pr}")
print()

# B: duplicated SKUs and inv=0 sem imagem
print("## B — SKU duplicado dentro do mesmo produto + variante sem imagem")
sku_dups=[]
inv0_noimg=[]
big_var=[]
for p in all_p:
    h=p['handle']
    skus={}
    vars_p=p['variants']['nodes']
    if len(vars_p)>=10:
        big_var.append((h, len(vars_p)))
    for v in vars_p:
        sk=(v.get('sku') or '').strip()
        if sk:
            skus.setdefault(sk,[]).append(v.get('title') or '')
        inv = v.get('inventoryQuantity')
        img = v.get('image')
        if (inv is None or inv == 0) and not img:
            inv0_noimg.append((h, v.get('title') or '', sk, inv))
    for sk,titles in skus.items():
        if len(titles)>1:
            sku_dups.append((h, sk, titles))

print(f"\nProdutos com SKU duplicado dentro do produto: {len(sku_dups)}")
for h,sk,ts in sku_dups[:20]:
    print(f"- {h} | sku=`{sk}` repetido em variants: {ts}")

print(f"\nVariantes com inv<=0 SEM imagem: {len(inv0_noimg)}")
for h,t,sk,iq in inv0_noimg[:50]:
    print(f"- {h} | {t} | sku=`{sk}` | inv={iq}")
if len(inv0_noimg)>50: print(f"... +{len(inv0_noimg)-50} truncadas")

print(f"\nProdutos com ≥10 variantes:")
for h,c in sorted(big_var, key=lambda x:-x[1])[:20]:
    print(f"- {h}: {c} variantes")

# C: availableForSale x inv
print("\n## C — Coerência inventoryPolicy / availableForSale")
policy_counts={}
afs_counts={'true':0,'false':0}
oversell=[]
for p in all_p:
    for v in p['variants']['nodes']:
        pol=v.get('inventoryPolicy') or 'NONE'
        policy_counts[pol]=policy_counts.get(pol,0)+1
        afs=v.get('availableForSale')
        afs_counts[str(afs).lower()] = afs_counts.get(str(afs).lower(),0)+1
        inv=v.get('inventoryQuantity')
        # oversell: available=true mas inv<=0 e policy != CONTINUE
        if afs is True and (inv is None or inv <= 0) and pol != 'CONTINUE':
            oversell.append((p['handle'], v.get('title') or '', v.get('sku') or '', inv, pol))
print("inventoryPolicy:")
for k,v in policy_counts.items(): print(f"- {k}: {v}")
print("availableForSale:")
for k,v in afs_counts.items(): print(f"- {k}: {v}")
print(f"\nVariantes mismatch (available=true mas inv<=0 e policy != CONTINUE): {len(oversell)}")
for h,t,s,iq,pol in oversell[:30]:
    print(f"- {h} | {t} | sku=`{s}` | inv={iq} | policy={pol}")
if len(oversell)>30: print(f"... +{len(oversell)-30}")

# extra: compareAtPrice anomaly (compareAt < price = inverted)
print("\n## extra — compareAtPrice < price (preço 'de' menor que o atual = erro de preço de venda)")
inv_compare=[]
for p in all_p:
    for v in p['variants']['nodes']:
        try:
            pr=float(v.get('price') or 0)
            cap=float(v.get('compareAtPrice') or 0)
            if cap>0 and pr>0 and cap<pr:
                inv_compare.append((p['handle'], v.get('title') or '', pr, cap))
        except: pass
print(f"Variantes com compareAtPrice<price: {len(inv_compare)}")
for h,t,pr,cap in inv_compare[:20]:
    print(f"- {h} | {t} | price={pr} | compareAt={cap}")
