#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Deterministic remediation plan for GMC Misrepresentation manual action.
Reads 15 Shopify GraphQL dump files, applies term-substitution rules,
emits remediation-plan-20260527.json + remediation-plan-20260527-summary.md.
Idempotent.
"""
import json, os, re, glob, html
from datetime import datetime, timezone
from collections import Counter

INPUT_DIR = r"C:\Users\samue\.claude\projects\c--projetos-incluo-commerce-agent-os\6af05995-e7d8-445f-a781-5fffe4c84057\tool-results"
OUT_DIR = r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo"
OUT_JSON = os.path.join(OUT_DIR, "remediation-plan-20260527.json")
OUT_MD = os.path.join(OUT_DIR, "remediation-plan-20260527-summary.md")

DISCLAIMER_HTML = '<hr><p><em>⚠ Aviso: Este produto é um brinquedo recreativo. Não é dispositivo médico, não trata, cura ou alivia condições de saúde, e não substitui acompanhamento profissional. Em caso de necessidade clínica, consulte um profissional de saúde qualificado.</em></p>'

# Regex flags
FI = re.IGNORECASE

# ---------- Substitution rules ----------
# (pattern, replacement, label). Order MATTERS. Applied in sequence.
# Use accent-tolerant variants where useful.

# Helper to make accent-tolerant variants
def aa(s):  # accent-agnostic chars
    repl = {
        'a':'[aáàâã]', 'A':'[aáàâã]',
        'e':'[eéê]',  'E':'[eéê]',
        'i':'[ií]',   'I':'[ií]',
        'o':'[oóôõ]', 'O':'[oóôõ]',
        'u':'[uú]',   'U':'[uú]',
        'c':'[cç]',   'C':'[cç]',
    }
    out=[]
    for ch in s:
        out.append(repl.get(ch, re.escape(ch)))
    return ''.join(out)

# Word boundary helper that works with accented chars
WB = r'(?<![\wáéíóúâêôãõçÁÉÍÓÚÂÊÔÃÕÇ])'
WE = r'(?![\wáéíóúâêôãõçÁÉÍÓÚÂÊÔÃÕÇ])'

# Conceptual substitutions FIRST (multi-word phrases before single-words)
PHRASE_RULES = [
    # delete frases inteiras (sem substituto)
    (re.compile(r'Al[íi]vio de ansiedade:?\s*manipula[çc][ãa]o repetitiva acalma o sistema nervoso\.?', FI), '', 'frase_alivio_ansiedade_sistema_nervoso'),

    # "Para pessoas com TDAH, TEA ou ansiedade" -> "Para pausas no trabalho ou estudos"
    (re.compile(r'Para (pessoas|crian[çc]as|adultos|jovens|adolescentes)\s+com\s+(TDAH|TEA|ADHD|autismo|asperger|ansiedade|depress[ãa]o|neurodiverg[êe]ncia|neurodivergentes?)(\s*[,/eou]+\s*(TDAH|TEA|ADHD|autismo|asperger|ansiedade|depress[ãa]o|neurodiverg[êe]ncia|neurodivergentes?))*', FI),
     'Para pausas no trabalho ou estudos', 'para_pessoas_com_X'),

    # Indicado/Recomendado para X com TDAH/TEA/...
    (re.compile(r'(Indicado|Recomendado|Ideal)\s+para\s+([^.<\n]*?)\s+com\s+(TDAH|TEA|ADHD|autismo|asperger|ansiedade|depress[ãa]o|neurodiverg[êe]ncia|neurodivergentes?)(\s*[,/eou]+\s*(TDAH|TEA|ADHD|autismo|asperger|ansiedade|depress[ãa]o|neurodiverg[êe]ncia|neurodivergentes?))*', FI),
     r'\1 para \2', 'indicado_para_X_com_condicoes'),

    # autorregulação sensorial / autorregulacao sensorial
    (re.compile(r'autorregula[çc][ãa]o\s+sensorial', FI), 'conforto tátil', 'autorregulacao_sensorial'),
    # autorregulação emocional
    (re.compile(r'autorregula[çc][ãa]o\s+emocional', FI), 'momentos de pausa', 'autorregulacao_emocional'),
    # autorregulação
    (re.compile(r'autorregula[çc][ãa]o', FI), 'foco e concentração', 'autorregulacao'),
    # auto-regulação
    (re.compile(r'auto[-\s]regula[çc][ãa]o', FI), 'foco e concentração', 'auto_regulacao'),

    # gerenciamento de sobrecarga sensorial / gerenciamento de sobrecarga
    (re.compile(r'gerenciamento\s+de\s+sobrecarga(\s+sensorial)?', FI), 'conforto em ambientes movimentados', 'gerenciamento_sobrecarga'),
    (re.compile(r'sobrecarga\s+sensorial', FI), 'estímulos intensos', 'sobrecarga_sensorial'),

    # integração sensorial, processamento sensorial
    (re.compile(r'integra[çc][ãa]o\s+sensorial', FI), 'estímulo tátil', 'integracao_sensorial'),
    (re.compile(r'processamento\s+sensorial', FI), 'estímulo tátil', 'processamento_sensorial'),

    # anti-* (must come before generic 'ansiedade'/'estresse' removal)
    (re.compile(r'anti[-\s]?(estresse|estress|stress)', FI), 'para momentos de pausa', 'anti_estresse'),
    (re.compile(r'antiestresse', FI), 'para momentos de pausa', 'antiestresse'),
    (re.compile(r'antistress', FI), 'para momentos de pausa', 'antistress'),
    (re.compile(r'anti[-\s]?ansiedade', FI), 'para momentos de pausa', 'anti_ansiedade'),
    (re.compile(r'anti[-\s]?depress[ãa]o', FI), 'para momentos de pausa', 'anti_depressao'),

    # frases delete sem substituto
    (re.compile(r'organiza[çc][ãa]o\s+emocional', FI), '', 'organizacao_emocional'),
    (re.compile(r'regula[çc][ãa]o\s+emocional', FI), '', 'regulacao_emocional'),

    # conforto sensorial -> conforto tátil
    (re.compile(r'conforto\s+sensorial', FI), 'conforto tátil', 'conforto_sensorial'),

    # brinquedo terapêutico -> brinquedo sensorial
    (re.compile(r'brinquedo\s+terap[êe]utico', FI), 'brinquedo sensorial', 'brinquedo_terapeutico'),
    (re.compile(r'brinquedos\s+terap[êe]uticos', FI), 'brinquedos sensoriais', 'brinquedos_terapeuticos'),

    # suporte/apoio à autorregulação
    (re.compile(r'suporte\s+[àa]\s+autorregula[çc][ãa]o', FI), 'suporte ao foco', 'suporte_autorregulacao'),
    (re.compile(r'apoia\s+a\s+autorregula[çc][ãa]o', FI), 'apoia momentos de pausa', 'apoia_autorregulacao'),

    # terapêutico/terapeutico (genérico) -> sensorial
    (re.compile(r'terap[êe]utico', FI), 'sensorial', 'terapeutico'),
    (re.compile(r'terap[êe]uticos', FI), 'sensoriais', 'terapeuticos'),
    (re.compile(r'terap[êe]utica', FI), 'sensorial', 'terapeutica'),
    (re.compile(r'terap[êe]uticas', FI), 'sensoriais', 'terapeuticas'),

    # verbos terapêuticos
    (re.compile(r'al[íi]vio\s+(de|do|da)\s+(estresse|ansiedade|tens[ãa]o|depress[ãa]o|sintomas?)', FI), 'para momentos de pausa', 'alivio_de_X'),
    (re.compile(r'al[íi]vio\s+sensorial', FI), 'conforto tátil', 'alivio_sensorial'),
    (re.compile(r'reduz\s+sintomas?', FI), 'oferece pausa', 'reduz_sintoma'),
    (re.compile(r'reduzir\s+sintomas?', FI), 'oferecer pausa', 'reduzir_sintoma'),
    (re.compile(r'combate\s+(ao?\s+|à\s+)?(estresse|ansiedade|depress[ãa]o|tens[ãa]o)', FI), 'oferece pausa', 'combate_X'),
    (re.compile(r'melhora\s+condi[çc][ãa]o', FI), 'apoia o foco', 'melhora_condicao'),

    # trata, cura, alivia (verbos como ações terapêuticas)
    (re.compile(r'\btrata\s+(o\s+|a\s+)?(estresse|ansiedade|depress[ãa]o|TDAH|TEA|autismo|sintomas?)', FI), 'oferece pausa para', 'trata_X'),
    (re.compile(r'\bcura\s+(o\s+|a\s+)?(estresse|ansiedade|depress[ãa]o|TDAH|TEA|autismo|sintomas?)', FI), 'oferece pausa para', 'cura_X'),
    (re.compile(r'\balivia\s+(o\s+|a\s+)?(estresse|ansiedade|depress[ãa]o|tens[ãa]o|sintomas?|sobrecarga)', FI), 'oferece pausa para', 'alivia_X'),
    (re.compile(r'\baliviar\s+(o\s+|a\s+)?(estresse|ansiedade|depress[ãa]o|tens[ãa]o|sintomas?|sobrecarga)', FI), 'oferecer pausa para', 'aliviar_X'),

    # estresse crônico
    (re.compile(r'estresse\s+cr[ôo]nico', FI), 'momentos de tensão', 'estresse_cronico'),

    # hipersensibilidade
    (re.compile(r'hipersensibilidade', FI), 'sensibilidade tátil', 'hipersensibilidade'),

    # Para autistas / pessoas com autismo (delete)
    (re.compile(r'Para\s+(autistas|pessoas\s+com\s+autismo)\b\.?', FI), '', 'para_autistas'),
]

# Single-term removals (after phrases). These are CLINICAL DIAGNOSES — remove word.
TERM_REMOVE = [
    'TDAH', 'TEA', 'ADHD', 'OCD',
    'autismo', 'autista', 'autistas', 'asperger',
    'neurodivergente', 'neurodivergentes', 'neurodivergência', 'neurodivergencia',
]

# Symptoms — remove word (but careful with "anti-X" already handled)
SYMPTOM_REMOVE = [
    'ansiedade', 'depressão', 'depressao',
]

def build_term_pattern(terms):
    parts=[]
    for t in terms:
        # accent-tolerant
        pat = aa(t)
        parts.append(pat)
    return re.compile(WB + r'(?:' + '|'.join(parts) + r')' + WE, FI)

CLINICAL_RE = build_term_pattern(TERM_REMOVE)
SYMPTOM_RE = build_term_pattern(SYMPTOM_REMOVE)

# Detect a "hit" for reporting (case-insensitive list of canonical terms found in original)
HIT_PATTERNS = {
    'TDAH': re.compile(WB + r'TDAH' + WE, FI),
    'TEA': re.compile(WB + r'TEA' + WE, FI),
    'ADHD': re.compile(WB + r'ADHD' + WE, FI),
    'OCD': re.compile(WB + r'OCD' + WE, FI),
    'autismo': re.compile(WB + r'autis(mo|ta|tas)' + WE, FI),
    'asperger': re.compile(WB + r'asperger' + WE, FI),
    'neurodivergente': re.compile(WB + r'neurodiverg[êe]nc?(ia|ente|entes)' + WE, FI),
    'ansiedade': re.compile(WB + r'ansiedade' + WE, FI),
    'depressão': re.compile(WB + r'depress[ãa]o' + WE, FI),
    'estresse crônico': re.compile(r'estresse\s+cr[ôo]nico', FI),
    'sobrecarga sensorial': re.compile(r'sobrecarga\s+sensorial', FI),
    'hipersensibilidade': re.compile(r'hipersensibilidade', FI),
    'autorregulação': re.compile(r'autorregula[çc][ãa]o', FI),
    'auto-regulação': re.compile(r'auto[-\s]regula[çc][ãa]o', FI),
    'integração sensorial': re.compile(r'integra[çc][ãa]o\s+sensorial', FI),
    'processamento sensorial': re.compile(r'processamento\s+sensorial', FI),
    'conforto sensorial': re.compile(r'conforto\s+sensorial', FI),
    'terapêutico': re.compile(r'terap[êe]utic[oaos]', FI),
    'anti-estresse': re.compile(r'anti[-\s]?(estresse|estress|stress)|antiestresse|antistress', FI),
    'anti-ansiedade': re.compile(r'anti[-\s]?ansiedade', FI),
    'trata': re.compile(WB + r'trata' + WE, FI),
    'cura': re.compile(WB + r'cura' + WE, FI),
    'alivia': re.compile(WB + r'alivia|aliviar' + WE, FI),
    'alívio': re.compile(r'al[íi]vio', FI),
    'organização emocional': re.compile(r'organiza[çc][ãa]o\s+emocional', FI),
    'regulação emocional': re.compile(r'regula[çc][ãa]o\s+emocional', FI),
    'gerenciamento de sobrecarga': re.compile(r'gerenciamento\s+de\s+sobrecarga', FI),
}

def detect_hits(text):
    found = []
    for name, pat in HIT_PATTERNS.items():
        if pat.search(text):
            found.append(name)
    return found

def apply_phrase_rules(text):
    for pat, repl, label in PHRASE_RULES:
        text = pat.sub(repl, text)
    return text

def remove_clinical_terms(text):
    text = CLINICAL_RE.sub('', text)
    return text

def remove_symptom_terms(text):
    # Remove standalone symptom words (after phrase rules handled "anti-X")
    text = SYMPTOM_RE.sub('', text)
    return text

# Cleanup leftovers
def cleanup_punctuation(text):
    # Multiple commas/spaces, dangling separators
    # ", ," / ",,"
    text = re.sub(r',\s*,+', ',', text)
    # "( , " etc.
    text = re.sub(r'\(\s*,\s*', '(', text)
    text = re.sub(r'\s*,\s*\)', ')', text)
    # empty parens
    text = re.sub(r'\s*\(\s*\)\s*', ' ', text)
    # leading "," in phrase
    text = re.sub(r'(?<=[.>\n])\s*,\s*', ' ', text)
    # " ," -> ","
    text = re.sub(r'\s+,', ',', text)
    # " ." -> "."
    text = re.sub(r'\s+\.', '.', text)
    # multiple spaces
    text = re.sub(r'[ \t]{2,}', ' ', text)
    # " ou ou ", " e e "
    text = re.sub(r'\b(ou|e)\s+\1\b', r'\1', text, flags=FI)
    # ", ou X" / ", e X" hanging — keep simple
    # "para  " etc handled by 2+spaces
    # "Para , crianças" -> "Para crianças"
    text = re.sub(r'\b(com|para|e|ou)\s+,', r'\1', text, flags=FI)
    text = re.sub(r',\s*(\.|;|<)', r'\1', text)
    # " com ." / " com<" -> remove dangling "com"
    text = re.sub(r'\s+com\s*(?=[.<])', '', text, flags=FI)
    # "para ." -> "."
    text = re.sub(r'\s+para\s*(?=[.<])', '', text, flags=FI)
    # double space again
    text = re.sub(r'[ \t]{2,}', ' ', text)
    # Title-level dedup: "Foco, X e foco e concentração" -> "Foco e concentração, X"
    # Generic: collapse "<phrase> e foco e concentração" when "foco" already present nearby
    text = re.sub(r'\bFoco,\s*([^,<\n]+?)\s+e\s+foco\s+e\s+concentra[çc][ãa]o', r'Foco e concentração, \1', text, flags=FI)
    # "X e foco e concentração" where X already contains foco
    text = re.sub(r'(Foco[^,<\n]{0,30}?)\s+e\s+foco\s+e\s+concentra[çc][ãa]o', r'\1', text, flags=FI)
    # Repeated "para momentos de pausa para momentos de pausa"
    text = re.sub(r'(para momentos de pausa)(\s+\1)+', r'\1', text, flags=FI)
    return text

def clean_text_field(text):
    """Apply full pipeline to title/seo title/seo description."""
    if not text:
        return text
    new = apply_phrase_rules(text)
    new = remove_clinical_terms(new)
    new = remove_symptom_terms(new)
    new = cleanup_punctuation(new)
    new = new.strip()
    # remove leading/trailing separators
    new = re.sub(r'^[\s\-,;:]+', '', new)
    new = re.sub(r'[\s\-,;:]+$', '', new)
    # remove "- -" or "-  -"
    new = re.sub(r'-\s*-+', '-', new)
    new = re.sub(r'[ \t]{2,}', ' ', new)
    return new.strip()

def clean_html_field(html_text):
    if not html_text:
        return html_text
    new = apply_phrase_rules(html_text)
    new = remove_clinical_terms(new)
    new = remove_symptom_terms(new)
    new = cleanup_punctuation(new)
    # tag-content cleanup: empty <strong></strong>, "<strong> </strong>"
    new = re.sub(r'<(strong|em|b|i)>\s*</\1>', '', new)
    # empty <li></li>
    new = re.sub(r'<li>\s*</li>\s*', '', new)
    # "<strong></strong>" residual
    new = re.sub(r'<strong>\s*,?\s*</strong>', '', new)
    # multiple blank lines
    new = re.sub(r'\n{3,}', '\n\n', new)
    return new

# Handle/slug cleanup
SLUG_REMOVE_TOKENS = [
    'anti-estresse', 'anti-ansiedade', 'antiestresse', 'antiansiedade',
    'anti-stress', 'antistress', 'anti-estress', 'antiestress',
    'tdah', 'tea', 'adhd', 'ocd', 'autismo', 'autista', 'asperger',
    'ansiedade', 'depressao', 'depressão',
    'autorregulacao', 'autorregulação', 'auto-regulacao',
    'terapeutico', 'terapeutica', 'terapêutico', 'terapêutica',
    'neurodivergente', 'neurodivergencia',
]

# Multi-token slug fragments to fix BEFORE generic token removal in handle
SLUG_PHRASE_FIXES = [
    (re.compile(r'(^|-)autorregulacao(?=-|$)'), r'\1foco-concentracao'),
    (re.compile(r'(^|-)gerenciamento-de-sobrecarga(-sensorial)?(?=-|$)'), r'\1conforto-ambientes-movimentados'),
    (re.compile(r'(^|-)sobrecarga-sensorial(?=-|$)'), r'\1estimulos-intensos'),
]

def clean_handle(handle):
    if not handle:
        return handle
    h = handle.lower()
    for pat, repl in SLUG_PHRASE_FIXES:
        h = pat.sub(repl, h)
    for tok in SLUG_REMOVE_TOKENS:
        h = re.sub(r'(^|-)' + re.escape(tok) + r'(?=-|$)', '-', h)
    # "conforto-sensorial" -> "conforto-tatil"
    h = re.sub(r'(^|-)conforto-sensorial(?=-|$)', r'\1conforto-tatil', h)
    # "integracao-sensorial" / "processamento-sensorial" -> "estimulo-tatil"
    h = re.sub(r'(^|-)(integracao|processamento)-sensorial(?=-|$)', r'\1estimulo-tatil', h)
    # collapse dashes
    h = re.sub(r'-{2,}', '-', h)
    h = h.strip('-')
    return h

def append_disclaimer(html_text):
    if not html_text:
        html_text = ''
    if 'brinquedo recreativo' in html_text and 'dispositivo médico' in html_text:
        return html_text, False
    sep = '\n\n' if html_text and not html_text.endswith('\n') else ''
    return html_text + sep + DISCLAIMER_HTML, True

# Sanity: residual forbidden terms after cleaning?
RESIDUAL_PATTERNS = {
    'TDAH': re.compile(WB+'TDAH'+WE, FI),
    'TEA': re.compile(WB+'TEA'+WE, FI),
    'autismo': re.compile(WB+r'autis(mo|ta|tas)'+WE, FI),
    'asperger': re.compile(WB+'asperger'+WE, FI),
    'autorregulação': re.compile(r'autorregula[çc][ãa]o', FI),
    'anti-estresse': re.compile(r'anti[-\s]?(estresse|stress)|antiestresse|antistress', FI),
    'anti-ansiedade': re.compile(r'anti[-\s]?ansiedade', FI),
    'terapêutico': re.compile(r'terap[êe]utic', FI),
    'ansiedade': re.compile(WB+'ansiedade'+WE, FI),
    'depressão': re.compile(WB+r'depress[ãa]o'+WE, FI),
    'sobrecarga sensorial': re.compile(r'sobrecarga\s+sensorial', FI),
    'integração sensorial': re.compile(r'integra[çc][ãa]o\s+sensorial', FI),
    'processamento sensorial': re.compile(r'processamento\s+sensorial', FI),
    'organização emocional': re.compile(r'organiza[çc][ãa]o\s+emocional', FI),
    'regulação emocional': re.compile(r'regula[çc][ãa]o\s+emocional', FI),
}

def detect_residual(*texts):
    found=set()
    for t in texts:
        if not t: continue
        for name, pat in RESIDUAL_PATTERNS.items():
            if pat.search(t):
                found.add(name)
    return sorted(found)

# Detect gramatically broken phrases (heuristic)
NONSENSE_PATTERNS = [
    re.compile(r'\bcom\s+[.,;]', FI),
    re.compile(r'\bpara\s+[.,;]', FI),
    re.compile(r'\bou\s+[.,;]', FI),
    re.compile(r',\s*,', FI),
    re.compile(r'\(\s*\)', FI),
    re.compile(r'<li>\s*</li>', FI),
    re.compile(r'<strong>\s*</strong>', FI),
    re.compile(r'\be\s+e\b', FI),
]
def looks_broken(text):
    if not text: return False
    for p in NONSENSE_PATTERNS:
        if p.search(text): return True
    return False

# ---------- Main ----------
def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    files = sorted(glob.glob(os.path.join(INPUT_DIR, 'mcp-claude_ai_Shopify-graphql_query-*.txt')))
    print(f"[scan] found {len(files)} input files")
    all_nodes = []
    for f in files:
        with open(f, 'r', encoding='utf-8') as fh:
            d = json.load(fh)
        nodes = d['data']['products']['nodes']
        all_nodes.extend(nodes)
    print(f"[scan] total products: {len(all_nodes)}")

    changes = []
    total_term_counter = Counter()
    counters = {'title':0,'handle':0,'desc':0,'seo_title':0,'seo_desc':0,'disclaimer':0,'manual_review':0}

    for n in all_nodes:
        gid = n.get('id','')
        id_numeric = gid.rsplit('/',1)[-1]
        title_old = n.get('title','') or ''
        handle_old = n.get('handle','') or ''
        desc_old = n.get('descriptionHtml','') or ''
        seo = n.get('seo') or {}
        seo_title_old = (seo.get('title') or '') if seo else ''
        seo_desc_old = (seo.get('description') or '') if seo else ''

        # Detect hits across all fields (using ORIGINAL)
        combined_original = ' '.join([title_old, handle_old, desc_old, seo_title_old, seo_desc_old])
        hits = detect_hits(combined_original)
        for h in hits:
            total_term_counter[h] += 1

        # Apply rules
        title_new = clean_text_field(title_old)
        handle_new = clean_handle(handle_old)
        desc_new = clean_html_field(desc_old)
        seo_title_new = clean_text_field(seo_title_old)
        seo_desc_new = clean_text_field(seo_desc_old)

        # length constraints for SEO
        if seo_title_new and len(seo_title_new) > 70:
            seo_title_new = seo_title_new[:70].rstrip(' ,-;:')
        if seo_desc_new and len(seo_desc_new) > 160:
            seo_desc_new = seo_desc_new[:160].rstrip(' ,-;:')

        # disclaimer
        desc_with_disclaimer, disc_appended = append_disclaimer(desc_new)
        desc_final = desc_with_disclaimer

        title_changed = title_new != title_old
        handle_changed = handle_new != handle_old
        desc_changed = desc_final != desc_old
        seo_title_changed = seo_title_new != seo_title_old
        seo_desc_changed = seo_desc_new != seo_desc_old

        # Determine manual review
        residual = detect_residual(title_new, handle_new, desc_new, seo_title_new, seo_desc_new)
        broken = any(looks_broken(t) for t in [title_new, desc_new, seo_title_new, seo_desc_new])
        manual_review = bool(residual) or broken

        notes = []
        if residual:
            notes.append('Residual terms: ' + ', '.join(residual))
        if broken:
            notes.append('Possible broken phrasing after substitution')

        if title_changed: counters['title']+=1
        if handle_changed: counters['handle']+=1
        if desc_changed: counters['desc']+=1
        if seo_title_changed: counters['seo_title']+=1
        if seo_desc_changed: counters['seo_desc']+=1
        if disc_appended: counters['disclaimer']+=1
        if manual_review: counters['manual_review']+=1

        changes.append({
            'id_numeric': id_numeric,
            'id_gid': gid,
            'title_old': title_old,
            'title_new': title_new,
            'title_changed': title_changed,
            'handle_old': handle_old,
            'handle_new': handle_new,
            'handle_changed': handle_changed,
            'description_html_old': desc_old,
            'description_html_new': desc_final,
            'description_changed': desc_changed,
            'seo_title_old': seo_title_old,
            'seo_title_new': seo_title_new,
            'seo_title_changed': seo_title_changed,
            'seo_description_old': seo_desc_old,
            'seo_description_new': seo_desc_new,
            'seo_description_changed': seo_desc_changed,
            'disclaimer_appended': disc_appended,
            'hits_found': hits,
            'hits_count': len(hits),
            'manual_review_needed': manual_review,
            'notes': '; '.join(notes) if notes else '',
        })

    products_with_changes = sum(1 for c in changes if c['title_changed'] or c['handle_changed'] or c['description_changed'] or c['seo_title_changed'] or c['seo_description_changed'])
    products_unchanged = len(changes) - products_with_changes

    output = {
        'generated_at': datetime.now(timezone.utc).isoformat(),
        'total_products': len(changes),
        'products_with_changes': products_with_changes,
        'products_unchanged': products_unchanged,
        'counters': counters,
        'top_terms': total_term_counter.most_common(20),
        'changes': changes,
    }

    with open(OUT_JSON, 'w', encoding='utf-8') as fh:
        json.dump(output, fh, ensure_ascii=False, indent=2)
    print(f"[write] {OUT_JSON}")

    # ---------- Summary MD ----------
    md = []
    md.append('# Plano de Remediação Misrepresentation — Incluo')
    md.append('')
    md.append(f'_Gerado em: {output["generated_at"]}_')
    md.append('')
    md.append('## 1. Totais')
    md.append('')
    md.append(f'- Total de produtos analisados: **{len(changes)}**')
    md.append(f'- Produtos com mudança em qualquer campo: **{products_with_changes}**')
    md.append(f'- Produtos sem mudança em campos (apenas disclaimer): **{products_unchanged}**')
    md.append('')
    md.append('### Breakdown de mudanças por campo')
    md.append('')
    md.append('| Campo | Quantidade |')
    md.append('|---|---|')
    md.append(f'| Title alterado | {counters["title"]} |')
    md.append(f'| Handle alterado | {counters["handle"]} |')
    md.append(f'| descriptionHtml alterado | {counters["desc"]} |')
    md.append(f'| SEO title alterado | {counters["seo_title"]} |')
    md.append(f'| SEO description alterado | {counters["seo_desc"]} |')
    md.append(f'| Disclaimer anexado | {counters["disclaimer"]} |')
    md.append(f'| Manual review necessário | {counters["manual_review"]} |')
    md.append('')
    md.append('## 2. Top 5 termos proibidos encontrados (originais)')
    md.append('')
    md.append('| Termo | Produtos atingidos |')
    md.append('|---|---|')
    for t, c in total_term_counter.most_common(10):
        md.append(f'| {t} | {c} |')
    md.append('')

    md.append('## 3. Top 20 produtos com mais hits')
    md.append('')
    md.append('| ID | Title old → new | Handle old → new | Hits |')
    md.append('|---|---|---|---|')
    top20 = sorted(changes, key=lambda c: c['hits_count'], reverse=True)[:20]
    for c in top20:
        t_old = (c['title_old'] or '')[:60]
        t_new = (c['title_new'] or '')[:60]
        h_old = (c['handle_old'] or '')[:50]
        h_new = (c['handle_new'] or '')[:50]
        md.append(f'| {c["id_numeric"]} | {t_old} → {t_new} | {h_old} → {h_new} | {c["hits_count"]} |')
    md.append('')

    md.append('## 4. Produtos marcados como manual_review_needed')
    md.append('')
    mr = [c for c in changes if c['manual_review_needed']]
    if not mr:
        md.append('_Nenhum produto requer revisão manual._')
    else:
        md.append('| ID | Title (new) | Motivo |')
        md.append('|---|---|---|')
        for c in mr:
            md.append(f'| {c["id_numeric"]} | {(c["title_new"] or "")[:60]} | {c["notes"]} |')
    md.append('')

    md.append('## 5. Sample de 5 diffs ANTES/DEPOIS (descriptionHtml)')
    md.append('')
    # pick the 5 with most changes (longest delta) that have desc_changed
    desc_changed_list = [c for c in changes if c['description_changed']]
    desc_changed_list.sort(key=lambda c: c['hits_count'], reverse=True)
    samples = desc_changed_list[:5]
    for i, c in enumerate(samples, 1):
        md.append(f'### Sample {i} — {c["id_numeric"]} — {c["title_new"][:80]}')
        md.append('')
        md.append('**ANTES (trecho ≤1200 chars):**')
        md.append('')
        md.append('```html')
        md.append(c['description_html_old'][:1200])
        md.append('```')
        md.append('')
        md.append('**DEPOIS (trecho ≤1200 chars):**')
        md.append('')
        md.append('```html')
        md.append(c['description_html_new'][:1200])
        md.append('```')
        md.append('')

    md.append('## 6. Termos residuais (não cobertos por regras)')
    md.append('')
    residual_counter = Counter()
    for c in changes:
        if c['manual_review_needed']:
            for tok in c['notes'].split(';'):
                tok = tok.strip()
                if tok.startswith('Residual terms:'):
                    for t in tok.replace('Residual terms:','').split(','):
                        t=t.strip()
                        if t: residual_counter[t]+=1
    if not residual_counter:
        md.append('_Nenhum termo proibido restou após a passada determinística._')
    else:
        md.append('| Termo residual | Ocorrências em produtos |')
        md.append('|---|---|')
        for t,n in residual_counter.most_common():
            md.append(f'| {t} | {n} |')
    md.append('')

    with open(OUT_MD, 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(md))
    print(f"[write] {OUT_MD}")

    # Print short summary to stdout
    print(f"\n=== SUMMARY ===")
    print(f"Total: {len(changes)}; with changes: {products_with_changes}; unchanged: {products_unchanged}")
    print(f"Counters: {counters}")
    print(f"Top terms: {total_term_counter.most_common(5)}")
    print(f"Manual review: {[c['id_numeric'] for c in mr]}")

if __name__ == '__main__':
    main()
