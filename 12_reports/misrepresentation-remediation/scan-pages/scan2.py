import json, glob, re, unicodedata
from urllib.parse import unquote

def strip_accents(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')
def norm(s):
    if s is None: return ''
    return strip_accents(s).lower()

ALTO = [
 "autismo","autista","espectro autista","tdah"," tda "," tea ","hiperatividade",
 "deficit de atencao","sindrome de down","dislexia","disgrafia","discalculia",
 "proprioceptiv","propriocepcao","oral motor","oral-motor","reflexologia",
 "acupressao","acupress","acupuntura","integracao sensorial","terapia","terapeutic",
 "terapeuta","fonoaudiolog","psicolog","psicopedagog","terapia ocupacional",
 "deficiencia","deficiente","necessidades especiais","necessidades sensoriais",
 "transtorno","diagnostic","tratamento","sintoma","neurologic","neurodivergente",
 "neuroatipic","reabilitacao","paralisia"," avc ","estimulo-proprioceptivo",
 "estimulo proprioceptivo","estimulo-tatil","estimulo-sensorial","estimulo-cognitivo",
 "pecs",
]
MEDIO = ["regulacao emocional","autorregulacao","ansiedade","calmante"]
# Note: bare 'sensorial','estimulo','desenvolvimento','foco' are pervasive generic
# toy-marketing terms in this catalog; tracked separately as INFO only.

def fields_of(node):
    out = []
    out.append(("title", node.get("title") or ""))
    out.append(("descriptionHtml", node.get("descriptionHtml") or ""))
    out.append(("productType", node.get("productType") or ""))
    out.append(("tags", " | ".join(node.get("tags") or [])))
    seo = node.get("seo") or {}
    out.append(("seo.title", seo.get("title") or ""))
    out.append(("seo.description", seo.get("description") or ""))
    media = (node.get("media") or {}).get("nodes") or []
    for i,m in enumerate(media):
        if not m: continue
        out.append((f"media[{i}].alt", m.get("alt") or ""))
        url = (m.get("image") or {}).get("url") or ""
        out.append((f"media[{i}].url", unquote(url)))
    return out

def snippet(text, idx, tlen):
    s = text[max(0,idx-40):min(len(text),idx+tlen+40)]
    return re.sub(r"\s+"," ", s.replace("\n"," ")).strip()

# alto: dedupe by (handle, field-group, term). field-group collapses media[N] -> media
alto = {}   # key -> snippet
medio = {}

for f in sorted(glob.glob('page*.json')):
    d = json.load(open(f, encoding='utf-8'))
    for node in d['data']['products']['nodes']:
        h = node.get("handle")
        for fname, raw in fields_of(node):
            n = " " + norm(raw) + " "
            grp = re.sub(r"\[\d+\]", "", fname)  # media[3].url -> media.url
            for term in ALTO:
                pos = n.find(term)
                if pos>=0:
                    key=(h,grp,term.strip())
                    if key not in alto:
                        alto[key]=snippet(raw, max(0,pos-1), len(term))
            for term in MEDIO:
                pos=n.find(term)
                if pos>=0:
                    key=(h,grp,term.strip())
                    if key not in medio:
                        medio[key]=snippet(raw, max(0,pos-1), len(term))

print("### ALTO (distinct handle/fieldgroup/term):", len(alto))
print("distinct ALTO products:", len(set(k[0] for k in alto)))
for k in sorted(alto):
    print(f"| {k[0]} | {k[1]} | {k[2]} | {alto[k][:80]} |")
print()
print("### MEDIO (strict list only):", len(medio))
print("distinct MEDIO products:", len(set(k[0] for k in medio)))
for k in sorted(medio):
    print(f"| {k[0]} | {k[1]} | {k[2]} | {medio[k][:80]} |")
