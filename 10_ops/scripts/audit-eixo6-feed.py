"""Eixo 6 — Feed: SKUs ALI, marcas vazadas, atributos de feed, namespaces."""
import json, re, unicodedata

FILES = [
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781475107178.txt",
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781475171491.txt",
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781475181969.txt",
]
def norm(s): return ''.join(c for c in unicodedata.normalize('NFKD', s or '') if not unicodedata.combining(c)).lower()

all_p = []
for f in FILES:
    with open(f, encoding='utf-8') as fh: all_p.extend(json.load(fh)['data']['products']['nodes'])

print(f"# EIXO 6 — Qualidade do feed [LIVE] {len(all_p)} produtos\n")

# ====== A: SKUs padrão AliExpress ======
# Padrão: contém ':' E '#' (ex: 14:200006152#VT03)
# Padrão B: começa com digits:digits (ex: 200001034:203027829)
ali_re = re.compile(r'^\d+:\d+(#.*)?$')
ali_re_loose = re.compile(r'\d+:\d+#')

ali_variants = []  # (handle, variant_title, sku)
total_variants = 0
products_with_ali = set()
for p in all_p:
    for v in p['variants']['nodes']:
        total_variants += 1
        sku = (v.get('sku') or '').strip()
        if not sku: continue
        if ali_re.match(sku) or ali_re_loose.search(sku):
            ali_variants.append((p['handle'], v.get('title') or '', sku))
            products_with_ali.add(p['handle'])

print(f"## A — SKUs padrão AliExpress")
print(f"Total variantes lidas: {total_variants}")
print(f"Variantes com SKU padrão ALI: **{len(ali_variants)}** em **{len(products_with_ali)}** produtos\n")
print(f"### Lista completa (handle | variant | sku)")
for h, vt, sk in ali_variants[:500]:
    print(f"- {h} | {vt} | `{sk}`")
if len(ali_variants) > 500:
    print(f"... +{len(ali_variants)-500} truncadas")

# ====== B: Marcas vazadas no metafield custom.detalhes_do_produto ======
# Pista: "Modelo: B0..." ou "Marca: <X>" onde X != Incluo, ou nomes conhecidos de fornecedores
known_supplier_brands = [
    "zohan","ootdty","macroupta","yhkema","aiboully","bohs","montessori brand",
    "alibaba","aliexpress","temu","shein","xinda","baby einstein","tomy",
    "fisher-price","fisher price","mattel","bandai","disney","melissa & doug",
    "lego","duplo","playmobil","yiwu","ningbo","shenzhen","guangzhou",
]
brand_pattern_b0 = re.compile(r'\bb0[a-z0-9]{8,}\b', re.IGNORECASE)  # ASIN-like B0XXXXXX
marca_re = re.compile(r'marca\s*[:\-]?\s*([a-z0-9\-\&\s]{2,30})', re.IGNORECASE)
modelo_re = re.compile(r'modelo\s*[:\-]?\s*([a-z0-9\-\#]{3,30})', re.IGNORECASE)

leaks = []  # (handle, kind, value, snippet)
for p in all_p:
    h = p['handle']
    blob_raw = (p.get('descriptionHtml') or '')
    for mf in p['metafields']['nodes']:
        if (mf.get('namespace') or '') == 'custom' and (mf.get('key') or '') == 'detalhes_do_produto':
            blob_raw += " ||DET|| " + (mf.get('value') or '')
    blob_n = norm(blob_raw)
    # marca conhecida de fornecedor
    for sb in known_supplier_brands:
        if sb in blob_n:
            idx = blob_n.find(sb)
            snip = blob_raw[max(0,idx-50):idx+len(sb)+50].replace('\n',' ')
            leaks.append((h, 'supplier-brand', sb, snip))
    # B0ASIN
    for m in brand_pattern_b0.finditer(blob_raw):
        snip = blob_raw[max(0,m.start()-50):m.end()+50].replace('\n',' ')
        leaks.append((h, 'b0-asin', m.group(0), snip))
    # marca <X> != incluo
    for m in marca_re.finditer(blob_raw):
        val = m.group(1).strip().lower()
        if val and not val.startswith('incluo') and val != '' and val != 'n/a':
            # filtrar valores genéricos comuns
            if val in ['marca','sem','generica','generico','generic']: continue
            snip = blob_raw[max(0,m.start()-30):m.end()+80].replace('\n',' ')
            leaks.append((h, 'marca-field', val, snip))
    # modelo B0...
    for m in modelo_re.finditer(blob_raw):
        val = m.group(1).strip()
        if val.lower().startswith('b0') and len(val) >= 8:
            snip = blob_raw[max(0,m.start()-30):m.end()+80].replace('\n',' ')
            leaks.append((h, 'modelo-asin', val, snip))

# dedup
seen = set(); leaks_u = []
for r in leaks:
    k = (r[0], r[1], r[2].lower())
    if k in seen: continue
    seen.add(k); leaks_u.append(r)

handles_leaks = sorted(set(r[0] for r in leaks_u))
print(f"\n## B — Marcas/Modelos de fornecedor vazados")
print(f"Total achados uniq: {len(leaks_u)} em {len(handles_leaks)} produtos\n")
for r in leaks_u:
    print(f"- **{r[0]}** | tipo={r[1]} | valor=`{r[2][:40]}` | trecho: \"…{r[3][:120]}…\"")

# ====== C: atributos de feed ======
ns_count = {}
products_missing_gpc = []
products_gpc_wrong_ns = []
products_gpc_correct = []
condition_values = {}
age_group_values = {}
identifier_exists_values = {}

for p in all_p:
    h = p['handle']
    has_gpc_correct = False; has_gpc_wrong = False
    cond = ''; age = ''; ie = ''
    for mf in p['metafields']['nodes']:
        ns = mf.get('namespace') or ''
        key = mf.get('key') or ''
        val = (mf.get('value') or '').strip()
        ns_count[f"{ns}.{key}"] = ns_count.get(f"{ns}.{key}",0)+1
        if key == 'google_product_category':
            if ns == 'mm-google-shopping': has_gpc_correct = True; products_gpc_correct.append((h,val))
            elif ns == 'mc-facebook': has_gpc_wrong = True; products_gpc_wrong_ns.append((h,val))
        if ns == 'mm-google-shopping' and key == 'condition':
            cond = val; condition_values[val] = condition_values.get(val,0)+1
        if ns == 'mm-google-shopping' and key == 'age_group':
            age = val; age_group_values[val] = age_group_values.get(val,0)+1
        if ns == 'mm-google-shopping' and key == 'identifier_exists':
            ie = val; identifier_exists_values[val] = identifier_exists_values.get(val,0)+1
    if not has_gpc_correct:
        products_missing_gpc.append((h, 'wrong-ns' if has_gpc_wrong else 'none'))

print(f"\n## C — Atributos de feed")
print(f"### condition (namespace mm-google-shopping)")
for k,v in condition_values.items(): print(f"- `{k}`: {v} produtos")
print(f"Produtos SEM condition definida: {len(all_p) - sum(condition_values.values())}")
print(f"\n### age_group")
for k,v in age_group_values.items(): print(f"- `{k}`: {v} produtos")
print(f"Produtos SEM age_group: {len(all_p) - sum(age_group_values.values())}")
print(f"\n### identifier_exists")
for k,v in identifier_exists_values.items(): print(f"- `{k}`: {v} produtos")
print(f"Produtos SEM identifier_exists: {len(all_p) - sum(identifier_exists_values.values())}")
print(f"\n### google_product_category")
print(f"- mm-google-shopping (✓ visível Google): **{len(products_gpc_correct)} produtos**")
print(f"- mc-facebook (✗ namespace errado, invisível ao Google): **{len(products_gpc_wrong_ns)} produtos**")
print(f"- SEM google_product_category em nenhum namespace: **{sum(1 for h,k in products_missing_gpc if k=='none')} produtos**")
if products_gpc_wrong_ns[:30]:
    print(f"\n### Produtos com google_product_category SÓ em mc-facebook (lista)")
    for h,v in products_gpc_wrong_ns[:30]:
        print(f"- {h} → `{v}`")

# ====== D: Título promocional ======
promo_re = re.compile(r'(kit\s+leve\s+\d+\s+pague\s+\d+|leve\s+\d+\s+pague\s+\d+|2x1|3x2|frete\s+gr[aá]tis|desconto|promo[cç][aã]o|imperd[ií]vel|black\s*friday)', re.IGNORECASE)
promo_in_title = []
for p in all_p:
    t = p.get('title') or ''
    for m in promo_re.finditer(t):
        promo_in_title.append((p['handle'], t, m.group(0)))

print(f"\n## D — Títulos promocionais no Shopify (deveria aparecer no feed via remap Simprosys, não aqui)")
print(f"Total títulos com termo promo: {len(promo_in_title)}")
for h,t,m in promo_in_title:
    print(f"- {h} | match=`{m}` | title=\"{t}\"")
if not promo_in_title:
    print("Nenhum título Shopify contém termo promocional → remap promocional está no Simprosys (não auditável via MCP).")

# ====== sumário namespaces ======
print(f"\n## Namespaces de metafield observados (top 30)")
for ns, c in sorted(ns_count.items(), key=lambda x:-x[1])[:30]:
    print(f"- {ns}: {c}")
