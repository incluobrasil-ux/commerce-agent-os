import json, re, collections, unicodedata, html

P = r'C:\Users\samue\.claude\projects\c--projetos-incluo-commerce-agent-os\6af05995-e7d8-445f-a781-5fffe4c84057\tool-results\mcp-claude_ai_Shopify-graphql_query-1779916422740.txt'

TERMS = [
    "TDAH","TEA","ADHD","OCD","autismo","autista","asperger","neurodivergente","neurodivergência",
    "ansiedade","depressão","anti-depressão","estresse crônico","sobrecarga sensorial","hipersensibilidade",
    "trata","cura","alivia","alívio","reduz sintoma","combate","melhora condição",
    "autorregulação","gerenciamento de sobrecarga","integração sensorial","processamento sensorial",
    "anti-estresse","antistress","anti-ansiedade",
    "terapêutico","terapeutico","organização emocional","regulação emocional",
]

def norm(s):
    if not s: return ""
    # remove HTML tags
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(s)
    s = s.lower()
    # strip accents
    s = ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')
    # normalize hyphens/spaces
    s = s.replace('-', ' ')
    s = re.sub(r"\s+", " ", s)
    return s

def norm_term(t):
    t = t.lower()
    t = ''.join(c for c in unicodedata.normalize('NFD', t) if unicodedata.category(c) != 'Mn')
    t = t.replace('-', ' ')
    t = re.sub(r"\s+", " ", t).strip()
    return t

# Build regex per term with word boundaries (looser for short acronyms)
patterns = []
for t in TERMS:
    nt = norm_term(t)
    # word boundary
    patterns.append((t, re.compile(r'\b' + re.escape(nt) + r'\b')))

with open(P, 'r', encoding='utf-8') as f:
    data = json.load(f)

prods = data['data']['products']
nodes = prods['nodes']
page = prods['pageInfo']

field_hit_counts = collections.Counter()
term_counts = collections.Counter()
prod_results = []
any_hit_count = 0

FIELDS = ['title','handle','descriptionHtml','seo.title','seo.description']

for n in nodes:
    seo = n.get('seo') or {}
    fields = {
        'title': n.get('title') or '',
        'handle': n.get('handle') or '',
        'descriptionHtml': n.get('descriptionHtml') or '',
        'seo.title': seo.get('title') or '',
        'seo.description': seo.get('description') or '',
    }
    norm_fields = {k: norm(v) for k,v in fields.items()}
    hits_by_field = {}
    all_hits = []
    for fname, ntxt in norm_fields.items():
        fhits = []
        for orig, pat in patterns:
            m = pat.findall(ntxt)
            if m:
                fhits.append((orig, len(m)))
        if fhits:
            hits_by_field[fname] = fhits
    if hits_by_field:
        any_hit_count += 1
        for fn, fh in hits_by_field.items():
            field_hit_counts[fn] += 1
            for t,c in fh:
                term_counts[t] += c
                all_hits.append(t)
    gid = n.get('id','')
    num = gid.rsplit('/',1)[-1]
    prod_results.append({
        'num': num,
        'title': fields['title'],
        'handle': fields['handle'],
        'hits_by_field': hits_by_field,
        'total_unique_terms': len(set(all_hits)),
        'total_hits': sum(c for fh in hits_by_field.values() for _,c in fh),
        'all_hits': all_hits,
    })

print("=== SUMMARY ===")
print("total_products:", len(nodes))
print("hasNextPage:", page['hasNextPage'])
print("endCursor:", page['endCursor'])
print("products_with_any_hit:", any_hit_count)
print()
print("=== PER FIELD (products with hit) ===")
for f in FIELDS:
    print(f, field_hit_counts[f])
print()
print("=== TOP TERMS ===")
for t,c in term_counts.most_common(15):
    print(f"{t}\t{c}")
print()
print("=== TOP 20 PRODUCTS ===")
problematic = [p for p in prod_results if p['hits_by_field']]
problematic.sort(key=lambda x: (x['total_hits'], x['total_unique_terms']), reverse=True)
for p in problematic[:20]:
    short = ", ".join(sorted(set(p['all_hits'])))
    print(f"{p['num']} | {p['title'][:60]} | {p['handle'][:50]} | hits={p['total_hits']} | {short}")
