"""Eixo 8 — amostra de preços por produto. Mostra range por produto."""
import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
FILES = [
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781476557813.txt",
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781476569962.txt",
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781476581087.txt",
]
all_p=[]
for f in FILES: all_p.extend(json.load(open(f,encoding='utf-8'))['data']['products']['nodes'])

# Distribuição de preços
print(f"# EIXO 8 — Preços [LIVE] {len(all_p)} produtos")
prices=[]
weird=[]  # range muito amplo dentro do mesmo produto
for p in all_p:
    vs=[float(v.get('price') or 0) for v in p['variants']['nodes'] if v.get('price')]
    if not vs: continue
    mn=min(vs); mx=max(vs)
    prices.extend(vs)
    if mn>0 and mx/mn > 3:
        weird.append((p['handle'], mn, mx, len(vs)))

print(f"Variantes com price>0: {len(prices)}")
if prices:
    prices.sort()
    print(f"Min: R$ {prices[0]:.2f} | Median: R$ {prices[len(prices)//2]:.2f} | Max: R$ {prices[-1]:.2f}")
    print(f"Sob R$ 5: {sum(1 for x in prices if x<5)}")
    print(f"Sob R$ 10: {sum(1 for x in prices if x<10)}")
    print(f"Acima R$ 200: {sum(1 for x in prices if x>200)}")

print(f"\n## Produtos com range de preço >3x (variants min×max)")
for h,mn,mx,n in sorted(weird, key=lambda x:-x[2]/x[1])[:15]:
    print(f"- {h}: R$ {mn:.2f} → R$ {mx:.2f} ({mx/mn:.1f}x) em {n} variantes")

# Amostra estratificada de 20 produtos
import random
random.seed(42)
sample = random.sample(all_p, 20)
print(f"\n## Amostra estratificada de 20 produtos — preço por variante")
for p in sample:
    print(f"\n### {p['handle']}")
    for v in p['variants']['nodes'][:5]:
        pr=v.get('price'); cap=v.get('compareAtPrice')
        print(f"  - {v.get('title','')[:50]}: price=R$ {pr} | compareAt=R$ {cap}")
    if len(p['variants']['nodes'])>5:
        print(f"  ... +{len(p['variants']['nodes'])-5} variantes")
