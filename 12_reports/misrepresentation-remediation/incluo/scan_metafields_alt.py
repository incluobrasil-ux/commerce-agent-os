import json, re, unicodedata, html, glob, os

FILES = [
    r'C:\Users\samue\.claude\projects\c--projetos-incluo-commerce-agent-os\7ea5f4ae-f206-4fb8-8e5d-5762bb9d7765\tool-results\mcp-claude_ai_Shopify-graphql_query-1780534968310.txt',
    r'C:\Users\samue\.claude\projects\c--projetos-incluo-commerce-agent-os\7ea5f4ae-f206-4fb8-8e5d-5762bb9d7765\tool-results\mcp-claude_ai_Shopify-graphql_query-1780534991319.txt',
    r'C:\Users\samue\.claude\projects\c--projetos-incluo-commerce-agent-os\7ea5f4ae-f206-4fb8-8e5d-5762bb9d7765\tool-results\mcp-claude_ai_Shopify-graphql_query-1780535003556.txt',
]

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
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(s)
    s = s.lower()
    s = ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')
    s = s.replace('-', ' ')
    s = re.sub(r"\s+", " ", s)
    return s

def norm_term(t):
    t = t.lower()
    t = ''.join(c for c in unicodedata.normalize('NFD', t) if unicodedata.category(c) != 'Mn')
    t = t.replace('-', ' ')
    t = re.sub(r"\s+", " ", t).strip()
    return t

patterns = [(t, re.compile(r'\b' + re.escape(norm_term(t)) + r'\b')) for t in TERMS]

def snippet(raw, term):
    # find term in a cleaned-but-readable version for display
    clean = html.unescape(re.sub(r"<[^>]+>", " ", raw))
    clean = re.sub(r"\s+", " ", clean).strip()
    nt = norm_term(term)
    nc = norm(clean)
    m = re.search(r'\b'+re.escape(nt)+r'\b', nc)
    if not m:
        return clean[:120]
    # map approx: just take a window around char index (norm preserves length roughly except accents/tags)
    i = m.start()
    a = max(0, i-45); b = min(len(clean), i+len(nt)+45)
    return ('...' if a>0 else '') + clean[a:b].strip() + ('...' if b<len(clean) else '')

rows = []
total_products = 0
for f in FILES:
    d = json.load(open(f, encoding='utf-8'))
    for n in d['data']['products']['nodes']:
        total_products += 1
        handle = n.get('handle') or ''
        gid = n.get('id','')
        num = gid.rsplit('/',1)[-1]
        # --- SEO metafields (the two requested) ---
        sources = []
        st = (n.get('seoTitleMf') or {})
        sd = (n.get('seoDescMf') or {})
        if st.get('value'):
            sources.append(('metafield:global.title_tag', st['value'], None, None))
        if sd.get('value'):
            sources.append(('metafield:global.description_tag', sd['value'], None, None))
        # --- all other metafields (app descriptions etc.) ---
        for mf in (n.get('metafields') or {}).get('nodes', []):
            ns = mf.get('namespace'); key = mf.get('key'); typ = mf.get('type') or ''
            val = mf.get('value')
            if not val: continue
            # skip the two we already added explicitly
            if ns == 'global' and key in ('title_tag','description_tag'):
                continue
            # only scan textual metafields
            if typ.startswith(('multi_line_text','single_line_text','rich_text','json')) or 'text' in typ or typ=='':
                sources.append((f'metafield:{ns}.{key}', val, None, None))
        # --- image altText ---
        for img in (n.get('images') or {}).get('nodes', []):
            alt = img.get('altText')
            if alt:
                sources.append(('alt', alt, img.get('id'), None))
        # scan each source
        for src, raw, imgid, _ in sources:
            # rich_text/json values may be JSON-wrapped; norm strips tags but JSON keys could false-match? keep simple: scan raw text
            text = raw
            if isinstance(text, (dict, list)):
                text = json.dumps(text, ensure_ascii=False)
            nt_text = norm(text)
            for orig, pat in patterns:
                if pat.search(nt_text):
                    rows.append({
                        'handle': handle, 'num': num, 'source': src,
                        'imgid': imgid, 'term': orig,
                        'snippet': snippet(text, orig),
                    })

print("total_products", total_products)
print("total_hits", len(rows))
print("affected_handles", len(set(r['handle'] for r in rows)))
print("=== BY SOURCE ===")
import collections
c = collections.Counter(r['source'].split(':')[0]+(':'+r['source'].split(':')[1].split('.')[0] if ':' in r['source'] else '') for r in rows)
for k,v in c.most_common():
    print(k, v)
print("=== ROWS ===")
out = []
for r in rows:
    out.append(r)
json.dump(out, open(r'c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo\metafield-alt-hits.json','w',encoding='utf-8'), ensure_ascii=False, indent=2)
for r in rows:
    print(f"{r['handle']} | {r['source']} | {r['term']} | {r['snippet']}")
