import json, glob, re, unicodedata
from urllib.parse import unquote

def strip_accents(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')

def norm(s):
    if s is None: return ''
    return strip_accents(s).lower()

# ALTO terms (normalized, no accents, lowercase). Use word-boundary-ish matching.
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
# 'aba' handled specially (too short/ambiguous), skip unless contexto claro
# MEDIO terms
MEDIO = [
 "sensorial","estimulo","estimulacao","regulacao emocional","autorregulacao",
 "desenvolvimento","concentracao"," foco ","ansiedade","calmante",
]

FIELDS = ["title","descriptionHtml","productType","tags","seo.title","seo.description"]

def get_fields(node):
    out = []
    out.append(("title", node.get("title") or ""))
    out.append(("descriptionHtml", node.get("descriptionHtml") or ""))
    out.append(("productType", node.get("productType") or ""))
    tags = node.get("tags") or []
    out.append(("tags", " | ".join(tags)))
    seo = node.get("seo") or {}
    out.append(("seo.title", (seo.get("title") or "")))
    out.append(("seo.description", (seo.get("description") or "")))
    media = (node.get("media") or {}).get("nodes") or []
    for i,m in enumerate(media):
        if not m: continue
        alt = m.get("alt") or ""
        out.append((f"media[{i}].alt", alt))
        img = m.get("image") or {}
        url = img.get("url") or ""
        # decode url-encoding so filename terms surface
        out.append((f"media[{i}].url", unquote(url)))
    return out

def snippet(text, idx, term_len):
    start = max(0, idx-40)
    end = min(len(text), idx+term_len+40)
    s = text[start:end].replace("\n"," ").replace("\r"," ")
    return re.sub(r"\s+"," ", s).strip()

alto_hits = []
medio_hits = []

for f in sorted(glob.glob('page*.json')):
    d = json.load(open(f, encoding='utf-8'))
    for node in d['data']['products']['nodes']:
        handle = node.get("handle")
        for fname, raw in get_fields(node):
            n = norm(raw)
            n_padded = " " + n + " "
            for term in ALTO:
                # for url/filename fields also match hyphenated
                pos = n_padded.find(term)
                if pos >= 0:
                    real_idx = max(0, pos-1)
                    alto_hits.append((handle, fname, term.strip(), snippet(raw, real_idx, len(term))))
            for term in MEDIO:
                pos = n_padded.find(term)
                if pos >= 0:
                    real_idx = max(0, pos-1)
                    medio_hits.append((handle, fname, term.strip(), snippet(raw, real_idx, len(term))))

print("=== ALTO HITS:", len(alto_hits), "===")
for h in alto_hits:
    print(f"| {h[0]} | {h[1]} | {h[2]} | {h[3][:90]} |")
print()
print("=== MEDIO HITS:", len(medio_hits), "===")
for h in medio_hits:
    print(f"| {h[0]} | {h[1]} | {h[2]} | {h[3][:90]} |")
