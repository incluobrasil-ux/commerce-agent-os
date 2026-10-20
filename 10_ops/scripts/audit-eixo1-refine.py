"""Refinamento Eixo 1: separa violações reais de falsos positivos."""
import json, re, unicodedata

FILES = [
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781475107178.txt",
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781475171491.txt",
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781475181969.txt",
]
def norm(s): return ''.join(c for c in unicodedata.normalize('NFKD', s or '') if not unicodedata.combining(c)).lower()
DISC = ["nao e dispositivo medico","nao trata, cura ou alivia","nao trata cura ou alivia",
        "nao substitui acompanhamento profissional","brinquedo recreativo"]
def has_disc(t): return any(m in t for m in DISC)

# Lista FOCO — termos pesados que se aparecerem em USO afirmativo são reprovação
HARD = ["autismo","autista","tea","espectro autista","tdah","tda","adhd","asperger","dislexia",
        "deficit de atencao","sindrome","transtorno","ansiedade","ansioso","depressao","panico",
        "angustia","nervosismo","hiperatividade","insonia","autorregulacao","autorregular",
        "regulacao emocional","propriocepcao","proprioceptivo","vestibular","integracao sensorial",
        "sobrecarga sensorial","processamento sensorial","terapeutico","terapia","terapeuta",
        "fonoaudiologo","psicologo","reabilitacao","tratar","trata","curar","cura","alivia","alivio",
        "aliviar","dispositivo medico","uso clinico","grau medico","recomendado por medicos","tensao muscular"]
# Médios — uso afirmativo em tags/títulos vira tarefa
MEDIO = ["stress","estresse","agitacao","agitação","medo","ocd","toc","tod"]

all_p = []
for f in FILES:
    with open(f,encoding='utf-8') as fh: all_p.extend(json.load(fh)['data']['products']['nodes'])

def in_disc_window(t, pos): return any(m in t[max(0,pos-180):pos+180] for m in DISC)

hard_violations = []
medio_violations = []
sem_disclaimer = []
disclaimer_present = []
indicado_para_uses = []  # categoria informativa
stress_tag_only = []     # categoria informativa

for p in all_p:
    h = p['handle']
    desc = p.get('descriptionHtml') or ''
    title = p.get('title') or ''
    seo_t = (p.get('seo') or {}).get('title') or ''
    seo_d = (p.get('seo') or {}).get('description') or ''
    tags = p.get('tags') or []
    mfs = {f"{m['namespace']}.{m['key']}": m.get('value','') for m in p['metafields']['nodes']}
    detalhes = mfs.get('custom.detalhes_do_produto','')

    full = norm(desc) + " ||DET|| " + norm(detalhes)
    has_d = has_disc(full)
    if has_d: disclaimer_present.append(h)
    else: sem_disclaimer.append(h)

    # HARD scan em todos os campos textuais públicos
    fields = {'title': title, 'descriptionHtml': desc, 'seo.title': seo_t,
              'seo.description': seo_d, 'tags': ' '.join(tags),
              'custom.detalhes_do_produto': detalhes}
    for fname, fval in fields.items():
        tn = norm(fval)
        if not tn: continue
        for term in HARD:
            pat = r'\b'+re.escape(term)+r'\b' if len(term)<=4 else re.escape(term)
            for m in re.finditer(pat, tn):
                if not in_disc_window(tn, m.start()):
                    sn = tn[max(0,m.start()-50):m.end()+50].replace('\n',' ')
                    hard_violations.append((h, term, fname, sn))
        for term in MEDIO:
            pat = r'\b'+re.escape(term)+r'\b'
            for m in re.finditer(pat, tn):
                if not in_disc_window(tn, m.start()):
                    sn = tn[max(0,m.start()-50):m.end()+50].replace('\n',' ')
                    medio_violations.append((h, term, fname, sn))
        # informativo: indicado para
        for m in re.finditer(r'indicado para', tn):
            sn = tn[max(0,m.start()-30):m.end()+50].replace('\n',' ')
            indicado_para_uses.append((h, fname, sn))

# dedup hard/medio
def dedup(L):
    s=set(); o=[]
    for r in L:
        k=(r[0],r[1],r[2])
        if k in s: continue
        s.add(k); o.append(r)
    return o
hard_u = dedup(hard_violations)
medio_u = dedup(medio_violations)

print("=== HARD VIOLATIONS (claims pesados em uso afirmativo) ===")
print(f"total uniq: {len(hard_u)}")
for r in hard_u: print(" -", r[0], "|", r[1], "|", r[2], "|", r[3][:120])

print("\n=== MEDIO VIOLATIONS (stress/agitacao/medo em uso afirmativo) ===")
print(f"total uniq: {len(medio_u)}")
for r in medio_u: print(" -", r[0], "|", r[1], "|", r[2], "|", r[3][:120])

print(f"\n=== DISCLAIMER ===")
print(f"COM disclaimer: {len(disclaimer_present)}/{len(all_p)}")
print(f"SEM disclaimer: {len(sem_disclaimer)}/{len(all_p)}")

print(f"\n=== 'indicado para' (informativo, não-clínico em contexto de idade) ===")
print(f"total ocorrências: {len(indicado_para_uses)} em {len(set(x[0] for x in indicado_para_uses))} handles")
