"""Plano Lote 3: append disclaimer médico nos produtos que ainda não têm."""
import json, unicodedata, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

FILES = [
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781481267010.txt",
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781481283929.txt",
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781481296508.txt",
]
def norm(s): return ''.join(c for c in unicodedata.normalize('NFKD', s or '') if not unicodedata.combining(c)).lower()

DISC_MARKERS = [
    "nao e dispositivo medico",
    "nao trata, cura ou alivia",
    "nao trata cura ou alivia",
    "nao substitui acompanhamento profissional",
    "brinquedo recreativo",
]

DISCLAIMER_BLOCK = '\n<hr><p><em>⚠ Aviso: Este produto é um brinquedo recreativo. Não é dispositivo médico, não trata, cura ou alivia condições de saúde, e não substitui acompanhamento profissional.</em></p>'

def has_disclaimer(html):
    n = norm(html)
    return any(m in n for m in DISC_MARKERS)

all_prods = []
for f in FILES:
    all_prods.extend(json.load(open(f, encoding='utf-8'))['data']['products']['nodes'])

print(f"Total produtos: {len(all_prods)}")
to_update = []
already_ok = []
for p in all_prods:
    desc = p.get('descriptionHtml') or ''
    if has_disclaimer(desc):
        already_ok.append(p['handle'])
    else:
        new_desc = desc.rstrip() + DISCLAIMER_BLOCK
        to_update.append({'gid': p['id'], 'handle': p['handle'], 'new_desc': new_desc})

print(f"Já têm disclaimer: {len(already_ok)}")
print(f"Precisam append:   {len(to_update)}")

# salvar plano
out = r"C:\projetos-incluo\commerce-agent-os\07_memory\vault\AUDITORIA-GMC-2026\snapshots\2026-06-14-pre-fix"
with open(f"{out}/lote3-plan.json", 'w', encoding='utf-8') as f:
    json.dump({'to_update': to_update, 'already_ok': already_ok}, f, ensure_ascii=False)
print(f"\nPlano salvo: lote3-plan.json")
print(f"\nHandles a atualizar (primeiros 10):")
for x in to_update[:10]:
    print(f"  - {x['handle']}")
