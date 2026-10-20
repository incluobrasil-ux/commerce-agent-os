"""
Eixo 1 — Claims clínicos. Aplica BLOCKLIST nas 3 páginas Shopify e gera relatório.
Regra: case-insensitive, sem acento (NFKD). Disclaimer-aware.
"""
import json, re, unicodedata, sys, os

FILES = [
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781475107178.txt",
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781475171491.txt",
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781475181969.txt",
]

def strip_accents(s):
    return ''.join(c for c in unicodedata.normalize('NFKD', s) if not unicodedata.combining(c))

def norm(s):
    return strip_accents((s or '').lower())

# DURA -- termos que em uso afirmativo violam
DURA = {
    "diagnosticos": ["autismo","autista","tea","espectro autista","tdah","tda","adhd","asperger",
                     "dislexia","dislexico","deficit de atencao","tod","toc","ocd","sindrome",
                     "transtorno","deficiencia","necessidades especiais","necessidades especificas"],
    "estados": ["ansiedade","ansioso","ansiosa","estresse","stress","depressao","anti-depressao",
                "panico","angustia","medo","nervosismo","agitacao","hiperatividade","hiperativo",
                "insonia"],
    "neuro": ["autorregulacao","autorregular","regulacao emocional","propriocepcao","proprioceptivo",
              "vestibular","integracao sensorial","sensorial integrativ","sobrecarga sensorial",
              "disfuncao","processamento sensorial"],
    "terapia": ["terapeutico","terapia","terapeuta","fonoaudiologo","psicologo","terapia ocupacional",
                "reabilitacao","tratamento","tratar","trata","curar","cura","alivio","alivia","aliviar"],
    "medico": ["dispositivo medico","uso clinico","indicado para","recomendado por medicos",
               "grau medico","dor","dores","tensao muscular"],
}

SOFT = ["acalma","acalmar","calmante","relaxa","relaxar","relaxamento","concentracao","foco",
        "atencao","desenvolve","desenvolvimento","estimula","estimulo","melhora","reduz",
        "sensorial","tatil","cognitiv"]

# token-isolated terms (need word-boundary)
TOKEN_ONLY = {"tea","tda","tod","toc","tdah","adhd","ocd","dor","dores","cura","trata","foco",
              "medo","stress","cognitiv"}
# substrings to ignore false positives
IGNORE_IN = {
    "tatil": ["portatil"],
    "dor": ["dormi","dormir","ador","sabedor","redor","valor","cor","amor","menor","maior","interior","superior","inferior","gerador","operador","leitor","monitor","editor","conjunto","sensor","fator","autor","setor","ator","colaborador","comprador","vencedor","corredor","computador","educador"],
    "trata": ["tratamentoxxxxx"],  # placeholder
    "cura": ["curar"],  # 'cura' must not match within 'curar' since curar is separate
}

DISCLAIMER_MARKERS = [
    "nao e dispositivo medico",
    "nao trata, cura ou alivia",
    "nao trata cura ou alivia",
    "nao substitui acompanhamento profissional",
    "brinquedo recreativo",
    "aviso: este produto e um brinquedo",
]

def has_disclaimer(text_norm):
    return any(m in text_norm for m in DISCLAIMER_MARKERS)

def find_term(text_norm, term):
    """Retorna lista de (start,end,snippet) das ocorrências, com filtros."""
    hits = []
    if term in TOKEN_ONLY:
        pattern = r'\b' + re.escape(term) + r'\b'
    else:
        pattern = re.escape(term)
    for m in re.finditer(pattern, text_norm):
        s, e = m.span()
        # false-positive ignore
        ignore = False
        for ig in IGNORE_IN.get(term, []):
            # check window
            window = text_norm[max(0,s-15):min(len(text_norm),e+15)]
            if ig in window and term in ig:
                ignore = True; break
        if ignore: continue
        hits.append((s,e,text_norm[max(0,s-40):min(len(text_norm),e+40)]))
    return hits

def classify_hit_in_disclaimer(text_norm, pos):
    """O hit cai dentro de uma frase de disclaimer?"""
    # Janela de ~120 chars ao redor
    start = max(0, pos-150); end = min(len(text_norm), pos+150)
    window = text_norm[start:end]
    return any(m in window for m in DISCLAIMER_MARKERS)

# Carregar todos os produtos
all_products = []
for f in FILES:
    with open(f, encoding='utf-8') as fh:
        d = json.load(fh)
        all_products.extend(d['data']['products']['nodes'])

print(f"# Eixo 1 — Auditoria LIVE")
print(f"Total produtos lidos: {len(all_products)}")
total_variants = sum(len(p['variants']['nodes']) for p in all_products)
print(f"Total variantes lidas: {total_variants}")
print()

violations = []          # (handle, term, campo, snippet)
conforme_disclaim = []   # (handle, term, campo)
soft_hits = {}           # term -> count
sem_disclaimer = []      # handles
metafield_namespaces = set()

for p in all_products:
    handle = p['handle']
    fields = {
        'title': p.get('title') or '',
        'descriptionHtml': p.get('descriptionHtml') or '',
        'seo.title': (p.get('seo') or {}).get('title') or '',
        'seo.description': (p.get('seo') or {}).get('description') or '',
        'tags': ' '.join(p.get('tags') or []),
        'handle': handle or '',
        'productType': p.get('productType') or '',
    }
    # variant titles
    var_titles = ' || '.join(v.get('title') or '' for v in p['variants']['nodes'])
    fields['variant_titles'] = var_titles
    # metafields
    for mf in p['metafields']['nodes']:
        ns = mf.get('namespace') or ''
        key = mf.get('key') or ''
        metafield_namespaces.add(f"{ns}.{key}")
        val = mf.get('value') or ''
        fields[f"mf:{ns}.{key}"] = val

    # Concatenated text for disclaimer check
    full_desc_norm = norm(fields['descriptionHtml'])
    # also some custom metafields
    for k,v in list(fields.items()):
        if k.startswith('mf:') and isinstance(v,str):
            full_desc_norm += " || " + norm(v)
    if not has_disclaimer(full_desc_norm):
        sem_disclaimer.append(handle)

    # Scan each field
    for fname, fval in fields.items():
        if not fval: continue
        tn = norm(fval)
        # DURA
        for cat, terms in DURA.items():
            for term in terms:
                for (s,e,snip) in find_term(tn, term):
                    in_disc = classify_hit_in_disclaimer(tn, s)
                    rec = (handle, term, cat, fname, snip, in_disc)
                    if in_disc:
                        conforme_disclaim.append(rec)
                    else:
                        violations.append(rec)
        # SOFT
        for term in SOFT:
            for (s,e,snip) in find_term(tn, term):
                soft_hits[term] = soft_hits.get(term,0)+1

# Dedup violations by (handle, term, field)
seen = set()
uniq_viol = []
for v in violations:
    key = (v[0], v[1], v[3])
    if key in seen: continue
    seen.add(key); uniq_viol.append(v)

seen2 = set(); uniq_conf = []
for v in conforme_disclaim:
    key = (v[0], v[1], v[3])
    if key in seen2: continue
    seen2.add(key); uniq_conf.append(v)

print(f"## Resumo")
print(f"- Violações reais (DURA, fora de disclaimer): {len(uniq_viol)} (uniq por handle×termo×campo)")
print(f"- Ocorrências conformes (DURA dentro de disclaimer): {len(uniq_conf)}")
print(f"- Produtos SEM disclaimer integrado: {len(sem_disclaimer)} de {len(all_products)}")
print()

# Group violations by handle
by_handle = {}
for v in uniq_viol:
    by_handle.setdefault(v[0], []).append(v)

print(f"## Produtos com violações reais ({len(by_handle)} handles)")
for handle, lst in sorted(by_handle.items()):
    print(f"\n### {handle}  ({len(lst)} achados)")
    for (_, term, cat, fname, snip, _) in lst[:20]:
        snip_clean = snip.replace('\n',' ').replace('  ',' ')[:120]
        print(f"  - [{cat}] `{term}` em **{fname}**: \"…{snip_clean}…\"")

print(f"\n## Produtos SEM disclaimer ({len(sem_disclaimer)})")
for h in sem_disclaimer:
    print(f"- {h}")

print(f"\n## Top SOFT hits (densidade)")
for t,c in sorted(soft_hits.items(), key=lambda x:-x[1])[:20]:
    print(f"- {t}: {c}")

print(f"\n## Metafield namespaces vistos (amostra)")
for ns in sorted(metafield_namespaces)[:30]:
    print(f"- {ns}")
