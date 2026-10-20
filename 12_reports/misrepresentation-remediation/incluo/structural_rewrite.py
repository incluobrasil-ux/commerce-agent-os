"""
Structure-aware rewriter for pending Incluo PDPs.

Strategy: instead of word-level regex (which broke grammar), operate at SECTION level:
- <h2>: strip clinical claims from title-like heading
- Intro <p> after <h2>: remove sentences containing forbidden tokens; keep sentences that
  describe the physical/functional aspects
- <ul> after "Benefícios Funcionais" header: filter out <li> whose <strong>label:</strong>
  contains forbidden tokens; the others survive intact
- <p> after "Indicado Para" header: replace ENTIRELY with neutral audience list
- All other content (specs, cuidados, images) untouched
- Append disclaimer

Run only on PENDING products (not in JSONL). Append results to JSONL in script schema.
"""
import json
import re
import unicodedata
from pathlib import Path
from datetime import datetime, timezone

OUT_DIR = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo")
PENDING_FILE = OUT_DIR / "pending-source.json"
JSONL = OUT_DIR / "llm-rewrite-plan-20260527.jsonl"

DISCLAIMER_HTML = '<hr><p><em>⚠ Aviso: Este produto é um brinquedo recreativo. Não é dispositivo médico, não trata, cura ou alivia condições de saúde, e não substitui acompanhamento profissional. Em caso de necessidade clínica, consulte um profissional de saúde qualificado.</em></p>'

# ---------- forbidden detection ----------
FORBIDDEN_RE = re.compile(
    r"\b(tdah|tea|adhd|ocd|autism[oa]|autistas?|asperger|neurodivergent[ea]s?|neurodivergencia|"
    r"ansiedade|depress[aã]o|estresse cr[oô]nico|sobrecarga sensorial|hipersensibilidade|"
    r"alivia|al[ií]vio|trata\s|cura\s|combate\s|reduz sintoma|"
    r"autorregula[cç][aã]o|gerenciamento de sobrecarga|integra[cç][aã]o sensorial|"
    r"processamento sensorial|regula[cç][aã]o emocional|organiza[cç][aã]o emocional|"
    r"anti[\s-]?estresse|antiestresse|antistress|anti[\s-]?ansiedade|anti[\s-]?depress[aã]o|"
    r"terap[eê]utic[oa]s?|conforto sensorial)\b",
    re.IGNORECASE,
)


def deaccent(s):
    return "".join(c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c))


def has_forbidden(text):
    return bool(FORBIDDEN_RE.search(text))


# ---------- title cleanup (conservative) ----------
TITLE_REPLACERS = [
    # Remove inline " - Anti-Estresse Premium para Adultos" suffix patterns
    (re.compile(r"\s*[-—–]\s*Anti[\s-]?(Estresse|Ansiedade|Depress[aã]o)(\s+\w+)*\s*$", re.IGNORECASE), ""),
    (re.compile(r"\s*[-—–]\s*Antiestresse(\s+\w+)*\s*$", re.IGNORECASE), ""),
    # Mid-title Anti-X word with surrounding pieces — replace by " - " trim
    (re.compile(r"(\s*[-—–]\s*)?Anti[\s-]?(Estresse|Ansiedade|Depress[aã]o)\s*", re.IGNORECASE), " "),
    (re.compile(r"(\s*[-—–]\s*)?Antiestresse\s*", re.IGNORECASE), " "),
    # Autorregulação in title
    (re.compile(r"\s*,?\s*(e\s+)?Autorregula[cç][aã]o(\s+\w+)?", re.IGNORECASE), ""),
    (re.compile(r"\s*Conforto Sensorial", re.IGNORECASE), " Conforto Tátil"),
    # Other clinical words in title (rare but possible)
    (re.compile(r"\s*(para\s+)?(TDAH|TEA|ADHD|OCD|Ansiedade|Depress[aã]o)\b", re.IGNORECASE), ""),
    # Cleanup
    (re.compile(r"\s{2,}"), " "),
    (re.compile(r"\s*[-—–]\s*[-—–]\s*"), " - "),
    (re.compile(r"\s*[-—–]\s*$"), ""),
    (re.compile(r"^\s*[-—–]\s*"), ""),
]


def rewrite_title(title):
    t = title
    for pat, repl in TITLE_REPLACERS:
        t = pat.sub(repl, t)
    return t.strip()


# ---------- handle cleanup ----------
def slugify(s):
    s = deaccent(s).lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s


FORBIDDEN_SLUG_TOKENS = [
    "anti-estresse", "anti-stress", "antistress", "antiestresse",
    "anti-ansiedade", "anti-depressao",
    "autorregulacao", "autorregulacao-sensorial",
    "tdah", "tea", "adhd", "ocd",
    "autismo", "autista", "asperger", "neurodivergente",
    "ansiedade", "depressao",
    "sobrecarga-sensorial", "processamento-sensorial", "integracao-sensorial",
    "terapeutico", "terapeutica", "conforto-sensorial",
    "alivio-de-ansiedade", "alivio-do-estresse", "alivio",
]


def rewrite_handle(handle, new_title):
    h = handle.lower()
    for token in sorted(FORBIDDEN_SLUG_TOKENS, key=len, reverse=True):
        h = re.sub(rf"-?{re.escape(token)}-?", "-", h)
    h = re.sub(r"-+", "-", h).strip("-")
    if len(h) < 8 or not h:
        h = slugify(new_title)
    return h[:80]


# ---------- SEO ----------
SEO_REPLACERS = [
    (re.compile(r"Anti[\s-]?(Estresse|Ansiedade|Depress[aã]o)", re.IGNORECASE), "para momentos de pausa"),
    (re.compile(r"Antiestresse", re.IGNORECASE), "para momentos de pausa"),
    (re.compile(r"Antistress", re.IGNORECASE), "para momentos de pausa"),
    (re.compile(r"(para\s+)?(pessoas\s+com\s+)?(TDAH|TEA|ADHD|OCD|autismo|autistas?|asperger|neurodivergentes?)", re.IGNORECASE), ""),
    (re.compile(r"al[ií]vio\s+(d[aoe]\s+)?(ansiedade|estresse|tens[aã]o)", re.IGNORECASE), "momentos de pausa"),
    (re.compile(r"\bansiedade\b", re.IGNORECASE), ""),
    (re.compile(r"\bdepress[aã]o\b", re.IGNORECASE), ""),
    (re.compile(r"\bestresse\s+cr[oô]nico\b", re.IGNORECASE), ""),
    (re.compile(r"autorregula[cç][aã]o(\s+sensorial)?", re.IGNORECASE), "conforto tátil"),
    (re.compile(r"sobrecarga sensorial", re.IGNORECASE), "estímulos intensos"),
    (re.compile(r"processamento sensorial", re.IGNORECASE), "estímulo tátil"),
    (re.compile(r"terap[eê]utic[oa]s?", re.IGNORECASE), "sensorial"),
    (re.compile(r"conforto sensorial", re.IGNORECASE), "conforto tátil"),
    # cleanups
    (re.compile(r"\s+,"), ","),
    (re.compile(r",,+"), ","),
    (re.compile(r"\s+\."), "."),
    (re.compile(r"\.\.+"), "."),
    (re.compile(r"\s{2,}"), " "),
    (re.compile(r"\s*,\s*\."), "."),
    (re.compile(r",\s*$"), "."),
]


def rewrite_seo_text(s, max_len):
    if not s:
        return s
    for pat, repl in SEO_REPLACERS:
        s = pat.sub(repl, s)
    s = s.strip(" ,;:-—–").strip()
    # collapse if degraded
    return s[:max_len]


# ---------- description HTML rewrite (section-aware) ----------
def split_sentences(text):
    return re.split(r"(?<=[.!?])\s+", text)


def rewrite_intro_paragraph(html_p):
    """Rewrite content of a <p>...</p> with section-level care.
    Keep sentences without forbidden terms. Sentences WITH forbidden terms get word-replaced
    using a conservative set focused on description bodies.
    """
    # Apply targeted replacements that produce reasonable Portuguese
    repls = [
        # composite phrases first
        (re.compile(r"suporte\s+ao\s+foco,?\s+al[ií]vio\s+(d[aoe]\s+)?(ansiedade|estresse|tens[aã]o)(\s+e\s+gerenciamento\s+(d[aoe]\s+)?(sobrecarga sensorial|sobrecarga|ansiedade|estresse))?", re.IGNORECASE), "suporte ao foco e momentos de pausa"),
        (re.compile(r"al[ií]vio\s+(d[aoe]\s+)?(ansiedade|estresse|tens[aã]o)(\s+muscular)?", re.IGNORECASE), "conforto durante o dia"),
        (re.compile(r"gerenciamento\s+(d[aoe]\s+)?(sobrecarga sensorial|sobrecarga|ansiedade|estresse|inquieta[cç][aã]o motora)", re.IGNORECASE), "conforto em ambientes movimentados"),
        (re.compile(r"suporte\s+[aà]\s+autorregula[cç][aã]o(\s+sensorial)?", re.IGNORECASE), "suporte ao foco"),
        (re.compile(r"ferramenta\s+de\s+autorregula[cç][aã]o(\s+\w+)?", re.IGNORECASE), "objeto manipulativo"),
        (re.compile(r"autorregula[cç][aã]o\s+sensorial", re.IGNORECASE), "conforto tátil"),
        (re.compile(r"autorregula[cç][aã]o", re.IGNORECASE), "foco"),
        (re.compile(r"sobrecarga\s+sensorial", re.IGNORECASE), "estímulos intensos"),
        (re.compile(r"processamento\s+sensorial", re.IGNORECASE), "estímulo tátil"),
        (re.compile(r"integra[cç][aã]o\s+sensorial", re.IGNORECASE), "estímulo tátil"),
        (re.compile(r"regula[cç][aã]o\s+emocional", re.IGNORECASE), "momentos de pausa"),
        (re.compile(r"organiza[cç][aã]o\s+emocional", re.IGNORECASE), "momentos de pausa"),
        (re.compile(r"conforto\s+sensorial", re.IGNORECASE), "conforto tátil"),
        (re.compile(r"brinquedo\s+terap[eê]utico", re.IGNORECASE), "brinquedo sensorial"),
        (re.compile(r"terap[eê]utic[oa]s?", re.IGNORECASE), "sensorial"),
        # phrases listing clinical conditions in indication-like sentence within intro
        (re.compile(r"para\s+(crian[cç]as|adultos|pessoas|adolescentes)(\s+e\s+adultos)?\s+com\s+(TEA|TDAH|ADHD|OCD|autismo|autistas?|asperger|ansiedade|depress[aã]o|estresse cr[oô]nico|sobrecarga sensorial|hipersensibilidade)(\s*,?\s*(e\s+)?(TEA|TDAH|ADHD|OCD|autismo|autistas?|asperger|ansiedade|depress[aã]o|estresse cr[oô]nico|sobrecarga sensorial|hipersensibilidade))*", re.IGNORECASE),
         lambda m: f"para {m.group(1).lower()}"),
        (re.compile(r"pessoas\s+com\s+(TEA|TDAH|ADHD|OCD|autismo|autistas?|asperger|ansiedade|depress[aã]o)(\s*,?\s*(e\s+|ou\s+)?(TEA|TDAH|ADHD|OCD|autismo|autistas?|asperger|ansiedade|depress[aã]o|estresse cr[oô]nico|sobrecarga sensorial|hipersensibilidade))*", re.IGNORECASE),
         "diferentes públicos"),
        # anti-* family
        (re.compile(r"anti[\s-]?estresse", re.IGNORECASE), "para momentos de pausa"),
        (re.compile(r"antiestresse", re.IGNORECASE), "para momentos de pausa"),
        (re.compile(r"antistress", re.IGNORECASE), "para momentos de pausa"),
        (re.compile(r"anti[\s-]?ansiedade", re.IGNORECASE), "para momentos de pausa"),
        (re.compile(r"anti[\s-]?depress[aã]o", re.IGNORECASE), "para momentos de pausa"),
        # remaining standalone clinical words
        (re.compile(r"\(TEA\)", re.IGNORECASE), ""),
        (re.compile(r"\(TDAH\)", re.IGNORECASE), ""),
        (re.compile(r"\b(TDAH|TEA|ADHD|OCD)\b"), ""),
        (re.compile(r"\bautism[oa]\b", re.IGNORECASE), ""),
        (re.compile(r"\bautistas?\b", re.IGNORECASE), ""),
        (re.compile(r"\basperger\b", re.IGNORECASE), ""),
        (re.compile(r"\bneurodivergentes?\b", re.IGNORECASE), "públicos diversos"),
        (re.compile(r"\bansiedade\b", re.IGNORECASE), "agitação"),
        (re.compile(r"\bdepress[aã]o\b", re.IGNORECASE), ""),
        (re.compile(r"\bhipersensibilidade\b", re.IGNORECASE), "sensibilidade"),
        (re.compile(r"\bestresse\s+cr[oô]nico\b", re.IGNORECASE), "estresse diário"),
        (re.compile(r"alivia(r)?", re.IGNORECASE), "oferece conforto"),
        (re.compile(r"trata(r)?\s+(o|a|os|as)?\s*(estresse|ansiedade|depress[aã]o|condi[cç][oõ]es)", re.IGNORECASE), "ajuda em momentos de pausa"),
        # cleanups
        (re.compile(r"\s+,"), ","),
        (re.compile(r"\s+;"), ";"),
        (re.compile(r"\s+:"), ":"),
        (re.compile(r"\s+\."), "."),
        (re.compile(r",\s*,"), ","),
        (re.compile(r",\s*(e|ou)\s*,", re.IGNORECASE), ","),
        (re.compile(r",\s*(e|ou)\s*\.", re.IGNORECASE), "."),
        (re.compile(r"\(\s*,?\s*\)"), ""),
        (re.compile(r"\(\s+"), "("),
        (re.compile(r"\s+\)"), ")"),
        (re.compile(r"\s{2,}"), " "),
        (re.compile(r"\s*,\s*\."), "."),
        (re.compile(r"\.\s*\."), "."),
    ]
    text = html_p
    for pat, repl in repls:
        text = pat.sub(repl, text)
    return text


def filter_benefits_list(ul_html):
    """Drop <li> items whose <strong>label:</strong> contains forbidden tokens; keep others."""
    # Items: <li>...</li> possibly multi-line
    parts = re.split(r"(<li[^>]*>.*?</li>)", ul_html, flags=re.DOTALL)
    out = []
    dropped = 0
    for part in parts:
        if part.startswith("<li"):
            # extract the <strong>...</strong> label text
            m = re.search(r"<strong[^>]*>([^<]+)</strong>", part)
            label = m.group(1) if m else part
            # also check whole li text content
            text_content = re.sub(r"<[^>]+>", " ", part)
            if has_forbidden(label) or has_forbidden(text_content):
                # rewrite this li using the intro rewriter
                rewritten = rewrite_intro_paragraph(part)
                # If still has forbidden after rewrite, drop entirely
                rewritten_text = re.sub(r"<[^>]+>", " ", rewritten)
                if has_forbidden(rewritten_text):
                    dropped += 1
                    continue
                out.append(rewritten)
            else:
                out.append(part)
        else:
            out.append(part)
    return "".join(out), dropped


def rewrite_indicado_para(p_html):
    """Replace the inner text of an 'Indicado Para' <p> with neutral audience."""
    # Detect product audience: child-friendly keywords -> include children
    lower = deaccent(p_html).lower()
    has_kid = bool(re.search(r"\b(crianc|kid|kawaii|infantil|3\+|6\+|8\+)", lower))
    has_office = bool(re.search(r"\b(escritorio|executiv|profissional|adult|estudante|edc|14\+)", lower))
    if has_kid and has_office:
        neutral = "Crianças (com supervisão), adolescentes, adultos, estudantes e profissionais."
    elif has_kid:
        neutral = "Crianças (com supervisão), adolescentes e adultos."
    elif has_office:
        neutral = "Adultos, profissionais, estudantes universitários e quem aprecia objetos manipulativos."
    else:
        neutral = "Crianças, adolescentes e adultos."
    # Replace innerHTML of the <p>
    return re.sub(r"(<p[^>]*>)(.*?)(</p>)", lambda m: f"{m.group(1)}{neutral}{m.group(3)}", p_html, count=1, flags=re.DOTALL)


def rewrite_description(html):
    """Walk through structured sections of the PDP."""
    out = html
    # Strip out forbidden words from <h2> headings
    def fix_h2(m):
        inner = m.group(1)
        cleaned = rewrite_intro_paragraph(inner)
        cleaned = re.sub(r"\s*[—–-]\s*$", "", cleaned).strip()
        return f"<h2>{cleaned}</h2>"
    out = re.sub(r"<h2[^>]*>(.*?)</h2>", fix_h2, out, flags=re.DOTALL)

    # Rewrite intro <p> right after <h2>
    def fix_intro(m):
        return m.group(1) + rewrite_intro_paragraph(m.group(2)) + m.group(3)
    out = re.sub(r"(</h2>\s*<p[^>]*>)(.*?)(</p>)", fix_intro, out, count=1, flags=re.DOTALL)

    # Find "Benefícios Funcionais" or similar bullet sections and filter
    # Pattern: <h3>...Benefícios...</h3><ul>...</ul>
    def fix_benefits(m):
        h3, ul = m.group(1), m.group(2)
        filtered, dropped = filter_benefits_list(ul)
        return h3 + filtered
    out = re.sub(r"(<h3[^>]*>[^<]*?Benef[ií]cios[^<]*?</h3>\s*)(<ul[^>]*>.*?</ul>)", fix_benefits, out, flags=re.DOTALL | re.IGNORECASE)

    # Find "Indicado Para" <h3>...</h3><p>...</p> and replace with neutral
    def fix_indicado(m):
        h3, p = m.group(1), m.group(2)
        return h3 + rewrite_indicado_para(p)
    out = re.sub(r"(<h3[^>]*>[^<]*?Indicado[^<]*?</h3>\s*)(<p[^>]*>.*?</p>)", fix_indicado, out, flags=re.DOTALL | re.IGNORECASE)

    # Final sweep: any remaining sentences in <p> blocks (e.g., Cuidados, others) — gentle pass
    # Only operate on text inside <p> tags; preserve attributes/URLs
    def fix_any_p(m):
        inner = m.group(2)
        if has_forbidden(inner):
            inner = rewrite_intro_paragraph(inner)
        return m.group(1) + inner + m.group(3)
    out = re.sub(r"(<p[^>]*>)(.*?)(</p>)", fix_any_p, out, flags=re.DOTALL)

    # And alt= attributes — strip forbidden tokens
    def fix_alt(m):
        text = m.group(1)
        for pat, repl in [
            (re.compile(r"\s*[-—–]\s*Anti[\s-]?(Estresse|Ansiedade|Depress[aã]o)(\s+\w+)*", re.IGNORECASE), ""),
            (re.compile(r"\s*[-—–]\s*Antiestresse(\s+\w+)*", re.IGNORECASE), ""),
            (re.compile(r"\s*Anti[\s-]?(Estresse|Ansiedade|Depress[aã]o)", re.IGNORECASE), ""),
            (re.compile(r"\s*Antiestresse", re.IGNORECASE), ""),
            (re.compile(r"\s*[-—–]\s*$"), ""),
            (re.compile(r"\s{2,}"), " "),
        ]:
            text = pat.sub(repl, text).strip()
        return f'alt="{text}"'
    out = re.sub(r'alt="([^"]*)"', fix_alt, out)

    # Final safety net: apply same text-only substitutions to ALL text nodes (between tags)
    # This catches forbidden terms in <h3>, <span>, loose text, etc. that section-aware passes missed.
    parts = re.split(r"(<[^>]+>)", out)
    for i, seg in enumerate(parts):
        if not seg.startswith("<") and has_forbidden(seg):
            parts[i] = rewrite_intro_paragraph(seg)
    out = "".join(parts)

    # Final whitespace cleanup
    out = re.sub(r"\s{2,}", " ", out)
    out = out.replace(" </", "</").replace(" </p>", "</p>").replace(" </li>", "</li>").replace(" </h2>", "</h2>").replace(" </h3>", "</h3>")

    # Append disclaimer if missing
    if "brinquedo recreativo" not in out:
        out = out.rstrip() + "\n" + DISCLAIMER_HTML
    return out


# ---------- main ----------
def main():
    pending = json.loads(PENDING_FILE.read_text(encoding="utf-8"))
    done_ids = set()
    for line in JSONL.read_text(encoding="utf-8").splitlines():
        if line.strip():
            done_ids.add(json.loads(line)["id_gid"])
    todo = [p for p in pending if p["id_gid"] not in done_ids]
    print(f"Pending to process: {len(todo)}")

    appended = 0
    residuals = []
    with JSONL.open("a", encoding="utf-8") as f:
        for p in todo:
            title_new = rewrite_title(p["title"])
            handle_new = rewrite_handle(p["handle"], title_new)
            desc_new = rewrite_description(p["descriptionHtml"])
            seo_t = rewrite_seo_text(p["seo"]["title"] or "", 70)
            seo_d = rewrite_seo_text(p["seo"]["description"] or "", 160)

            # Validate URLs preserved
            old_urls = set(re.findall(r'(?:src|href)="([^"]+)"', p["descriptionHtml"]))
            new_urls = set(re.findall(r'(?:src|href)="([^"]+)"', desc_new))
            url_lost = sorted(old_urls - new_urls)

            # Check residuals (excluding disclaimer)
            desc_for_check = re.sub(r"<hr>\s*<p><em>[^<]*brinquedo recreativo[^<]*</em></p>\s*$", "", desc_new, flags=re.IGNORECASE | re.DOTALL)
            desc_text = re.sub(r"<[^>]+>", " ", desc_for_check)
            all_text = " ".join([title_new, handle_new.replace("-", " "), desc_text, seo_t, seo_d])
            matches = sorted(set(m.group(0).lower() for m in FORBIDDEN_RE.finditer(all_text)))
            manual_flag = bool(matches) or bool(url_lost)
            if matches:
                residuals.append((p["id_numeric"], matches))

            entry = {
                "id_gid": p["id_gid"],
                "id_numeric": p["id_numeric"],
                "title_old": p["title"],
                "title_new": title_new,
                "handle_old": p["handle"],
                "handle_new": handle_new,
                "description_html_old": p["descriptionHtml"],
                "description_html_new": desc_new,
                "seo_title_old": p["seo"]["title"],
                "seo_title_new": seo_t,
                "seo_description_old": p["seo"]["description"],
                "seo_description_new": seo_d,
                "changes_made": [
                    "title cleaned (anti-*/clinical removed)",
                    "handle cleaned (forbidden tokens stripped)",
                    "description: section-aware rewrite (intro/benefits/indicado-para)",
                    "alt attributes cleaned of anti-* terms",
                    "seo cleaned",
                    "disclaimer appended",
                ],
                "manual_review_needed": manual_flag,
                "notes": (f"residual: {matches}; " if matches else "") + (f"url_lost: {url_lost}" if url_lost else ""),
            }
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
            appended += 1

    print(f"Appended {appended}")
    print(f"Products with residual forbidden tokens: {len(residuals)}")
    for idn, m in residuals[:15]:
        print(f"  {idn}: {m}")


if __name__ == "__main__":
    main()
