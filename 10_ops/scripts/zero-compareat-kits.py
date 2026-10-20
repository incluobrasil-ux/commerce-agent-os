"""Gera payloads para zerar compareAtPrice nos 6 produtos kit (todas as variantes)."""
import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 6 produtos kit (mesmos GIDs dos titles aplicados)
KITS = {
    'cubo-fidget-magnetico-botoes-clique': 'gid://shopify/Product/8924984311970',
    'fidget-slider-coruja-metal-premium-16-imas': 'gid://shopify/Product/8924992110754',
    'fidget-hexagono-girando-estimulo-visual-tatil': 'gid://shopify/Product/8925004497058',
    'brinquedo-estrela-mar-articulada-3d-decoracao': 'gid://shopify/Product/9229812105378',
    'bola-sensorial-engrenagem-3d-fidget-giratoria': 'gid://shopify/Product/9229813481634',
    'bola-giroscopio-3d-universal-foco-rotacao-gravidade': 'gid://shopify/Product/9229813809314',
}

# Dumps com variant ids + compareAtPrice (Eixo 7)
SNAP = r"C:\projetos-incluo\commerce-agent-os\07_memory\vault\AUDITORIA-GMC-2026\snapshots\2026-06-14-pre-fix"
FILES = [
    f"{SNAP}/mcp-claude_ai_Shopify-graphql_query-1781476557813.txt",
    f"{SNAP}/mcp-claude_ai_Shopify-graphql_query-1781476569962.txt",
    f"{SNAP}/mcp-claude_ai_Shopify-graphql_query-1781476581087.txt",
]

prods = {}
for f in FILES:
    for p in json.load(open(f, encoding='utf-8'))['data']['products']['nodes']:
        prods[p['handle']] = p

plan = {}
for handle, gid in KITS.items():
    p = prods.get(handle)
    if not p:
        print(f"[MISS] {handle}")
        continue
    # Listar todas as variantes com compareAtPrice > 0
    variants_to_zero = []
    total = 0
    with_compare = 0
    for v in p['variants']['nodes']:
        total += 1
        cap = v.get('compareAtPrice')
        if cap and str(cap) not in ('0', '0.00', 'None', ''):
            with_compare += 1
            variants_to_zero.append({'id': v['id'], 'compareAtPrice': None})
    plan[handle] = {
        'productId': gid,
        'variants': variants_to_zero,
        'total': total,
        'with_compare': with_compare,
    }
    print(f"{handle}: {with_compare}/{total} variantes com compareAt → zerar")

with open(f"{SNAP}/zero-compareat-plan.json", 'w', encoding='utf-8') as f:
    json.dump(plan, f, ensure_ascii=False)
print(f"\nSaved plan.")
print(f"Total variantes a zerar: {sum(v['with_compare'] for v in plan.values())}")
