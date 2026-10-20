import json, glob, unicodedata
from urllib.parse import unquote
def norm(s):
    if not s: return ''
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c)!='Mn').lower()
# CLINICAL blocklist (ALTO) - terms that must NOT appear in image filenames
CLIN = ["proprioceptiv","propriocepcao","estimulo-proprioceptivo","estimulo proprioceptivo",
 "estimulo-tatil","estimulo tatil","estimulo-sensorial","estimulo sensorial",
 "estimulo-cognitivo","estimulo cognitivo","integracao sensorial","integracao-sensorial",
 "terapeutic","terapia","sensorial-e-autorregulacao","autorregulacao",
 "autismo","autista","tdah"," tea ","oral-motor","oral motor","reflexolog","acupress",
 "regulacao-emocional","regulacao emocional","necessidades-sensoriais","necessidades sensoriais",
 "estimulacao-sensorial","estimulacao sensorial"]
prod = {}
for f in sorted(glob.glob('page*.json')):
    d = json.load(open(f,encoding='utf-8'))
    for node in d['data']['products']['nodes']:
        h = node.get('handle'); t = node.get('title') or ''
        media = (node.get('media') or {}).get('nodes') or []
        for i,m in enumerate(media):
            if not m: continue
            url = unquote((m.get('image') or {}).get('url') or '')
            fn = url.split('/')[-1].split('?')[0]
            nfn = norm(fn)
            hits = [c for c in CLIN if c in nfn]
            if hits:
                prod.setdefault(h, {'title':t,'imgs':[]})
                prod[h]['imgs'].append((i, fn, sorted(set(hits))))
print("=== GROUP A (clinical image filenames):", len(prod), "products ===\n")
for h,info in sorted(prod.items(), key=lambda x:-len(x[1]['imgs'])):
    print(f"## {h}\n   title: {info['title']}\n   affected images: {len(info['imgs'])}")
    for i,fn,hits in info['imgs']:
        print(f"     [{i}] {fn}  <- {hits}")
    print()
