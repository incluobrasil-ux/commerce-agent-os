"""
HTML-safe deterministic rewrite of Incluo PDPs for GMC Misrepresentation remediation.

Improvements over remediation-plan-20260527.json (which broke HTML):
- Only modifies TEXT nodes, never HTML attributes (preserves src/href/alt URLs)
- Phrase-level substitutions first (longer patterns), then word-level
- Post-substitution grammar cleanup (capitalization, hanging conjunctions, double spaces, empty parens)
- Title-specific rules (prefer deletion over substitution)
- Handle generation from cleaned title (slugify) when handle had forbidden terms
- Disclaimer append (skip if already present)

Outputs:
  - safe-rewrite-plan-20260527.json (full plan)
  - safe-rewrite-plan-20260527-summary.md (human summary + top 20 + 5 samples)
"""
import json
import re
import unicodedata
from pathlib import Path
from datetime import datetime, timezone

INPUT_PLAN = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo\remediation-plan-20260527.json")
OUT_JSON = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo\safe-rewrite-plan-20260527.json")
OUT_MD = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo\safe-rewrite-plan-20260527-summary.md")

DISCLAIMER_HTML = '<hr><p><em>⚠ Aviso: Este produto é um brinquedo recreativo. Não é dispositivo médico, não trata, cura ou alivia condições de saúde, e não substitui acompanhamento profissional. Em caso de necessidade clínica, consulte um profissional de saúde qualificado.</em></p>'
DISCLAIMER_MARKER = "brinquedo recreativo"

# ---------- forbidden token detection (acento-insensitive) ----------
FORBIDDEN_TOKENS = [
    "tdah", "tea", "adhd", "ocd", "autismo", "autista", "asperger", "neurodivergente", "neurodivergencia",
    "ansiedade", "depressao", "anti-depressao", "estresse cronico", "sobrecarga sensorial", "hipersensibilidade",
    "trata ", "cura ", "alivia", "alivio", "reduz sintoma", "combate", "melhora condicao",
    "autorregulacao", "gerenciamento de sobrecarga", "integracao sensorial", "processamento sensorial",
    "regulacao emocional", "organizacao emocional",
    "anti-estresse", "antiestresse", "antistress", "anti-ansiedade", "anti estresse", "anti ansiedade",
    "terapeutico", "terapeutica", "conforto sensorial",
]


def deaccent(s):
    return "".join(c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c))


def contains_forbidden(s):
    if not s:
        return []
    low = deaccent(s).lower()
    return sorted(set(t for t in FORBIDDEN_TOKENS if t in low))


# ---------- ordered substitution rules (longest/phrase first) ----------
# Each rule: (regex_pattern, replacement, flags). Use re.IGNORECASE always.
# Patterns intentionally cover acented + plain variants.
# IMPORTANT: only applied to TEXT nodes (never inside <...> tags).
PHRASE_RULES = [
    # full sentence/phrase deletions
    (r"Al[ií]vio de ansiedade:\s*manipula[cç][aã]o repetitiva acalma o sistema nervoso\.?", "", re.IGNORECASE),
    (r"Al[ií]vio de ansiedade:\s*manipula[cç][aã]o repetitiva acalma o sistema nervoso", "", re.IGNORECASE),
    (r"Alivia (a |o |as |os )?(ansiedade|estresse|tens[aã]o)\.?", "", re.IGNORECASE),
    (r"Trata (o |a |os |as )?(estresse|ansiedade|depress[aã]o|TDAH|TEA|autismo)\.?", "", re.IGNORECASE),
    # indication blocks listing clinical conditions
    (r"(Pessoas|crian[cç]as|adolescentes|adultos|profissionais)\s+com\s+(TDAH|TEA|ADHD|OCD|autismo|asperger|ansiedade|depress[aã]o|estresse cr[oô]nico|sobrecarga sensorial|hipersensibilidade)(,?\s*(TDAH|TEA|ADHD|OCD|autismo|asperger|ansiedade|depress[aã]o|estresse cr[oô]nico|sobrecarga sensorial|hipersensibilidade))*",
     r"\1", re.IGNORECASE),
    (r"Para (pessoas|crian[cç]as|adolescentes|adultos)\s+com\s+(TDAH|TEA|ADHD|OCD|autismo|asperger|ansiedade|depress[aã]o|estresse cr[oô]nico|sobrecarga sensorial|hipersensibilidade)(,?\s*(ou\s+)?(TDAH|TEA|ADHD|OCD|autismo|asperger|ansiedade|depress[aã]o|estresse cr[oô]nico|sobrecarga sensorial|hipersensibilidade))*",
     "Para pausas no trabalho ou estudos", re.IGNORECASE),
    (r"Para (autistas?|pessoas (autistas?|com autismo))", "", re.IGNORECASE),
    (r"(pessoas\s+)?neurodivergentes?(\s*\(.*?\))?", "públicos diversos", re.IGNORECASE),

    # therapeutic concepts - phrase level (longer first)
    (r"suporte\s+[aà]\s+autorregula[cç][aã]o(\s+sensorial)?", "suporte ao foco", re.IGNORECASE),
    (r"apoia(r)?\s+(a\s+)?autorregula[cç][aã]o(\s+sensorial)?", "apoia momentos de pausa", re.IGNORECASE),
    (r"ferramenta\s+de\s+autorregula[cç][aã]o(\s+sensorial)?", "brinquedo manipulativo", re.IGNORECASE),
    (r"brinquedo\s+terap[eê]utico", "brinquedo sensorial", re.IGNORECASE),
    (r"autorregula[cç][aã]o\s+sensorial", "conforto tátil", re.IGNORECASE),
    (r"gerenciamento\s+(da|de|do)\s+sobrecarga\s+sensorial", "conforto em ambientes movimentados", re.IGNORECASE),
    (r"gerenciamento\s+(da|de|do)\s+sobrecarga", "conforto em ambientes movimentados", re.IGNORECASE),
    (r"integra[cç][aã]o\s+sensorial", "estímulo tátil", re.IGNORECASE),
    (r"processamento\s+sensorial", "estímulo tátil", re.IGNORECASE),
    (r"regula[cç][aã]o\s+emocional", "", re.IGNORECASE),
    (r"organiza[cç][aã]o\s+emocional", "", re.IGNORECASE),
    (r"conforto\s+sensorial", "conforto tátil", re.IGNORECASE),

    # therapeutic verbs (phrase forms)
    (r"al[ií]vio\s+(do|da|de)\s+(estresse|ansiedade|tens[aã]o|tens[aã]o emocional)", "conforto durante o dia", re.IGNORECASE),
    (r"al[ií]vio\s+(do|da|de)\s+([\wáéíóúâêôãõç]+)", "conforto durante o dia", re.IGNORECASE),
    (r"al[ií]vio\s+imediato\s+(de|da|do)\s+([\wáéíóúâêôãõç]+)", "conforto imediato", re.IGNORECASE),
    (r"alivia\s+(a|o)?\s*(ansiedade|estresse|tens[aã]o)", "oferece conforto", re.IGNORECASE),

    # anti-stress family
    (r"anti[\s-]?(estresse|stress)", "para momentos de pausa", re.IGNORECASE),
    (r"antiestresse", "para momentos de pausa", re.IGNORECASE),
    (r"antistress", "para momentos de pausa", re.IGNORECASE),
    (r"anti[\s-]?ansiedade", "para momentos de pausa", re.IGNORECASE),
    (r"anti[\s-]?depress[aã]o", "para momentos de pausa", re.IGNORECASE),

    # word-level forbidden terms (no clean substitute)
    (r"\bautorregula[cç][aã]o\b", "foco e concentração", re.IGNORECASE),
    (r"\bTDAH\b", "", 0),
    (r"\bTEA\b", "", 0),
    (r"\bADHD\b", "", 0),
    (r"\bOCD\b", "", 0),
    (r"\bautismo\b", "", re.IGNORECASE),
    (r"\bautistas?\b", "", re.IGNORECASE),
    (r"\basperger\b", "", re.IGNORECASE),
    (r"\bneurodivergentes?\b", "", re.IGNORECASE),
    (r"\bneurodiverg[eê]ncia\b", "", re.IGNORECASE),
    (r"\bansiedade\b", "agitação", re.IGNORECASE),
    (r"\bdepress[aã]o\b", "", re.IGNORECASE),
    (r"\bhipersensibilidade\b", "sensibilidade aumentável", re.IGNORECASE),
    (r"\bestresse\s+cr[oô]nico\b", "estresse diário", re.IGNORECASE),
    (r"\bsobrecarga\s+sensorial\b", "estímulos intensos", re.IGNORECASE),
    (r"\bterap[eê]utic[oa]s?\b", "sensoriais", re.IGNORECASE),

    # therapy roles / phrases
    (r"terapia\s+ocupacional", "atividades pedagógicas", re.IGNORECASE),
    (r"terapeutas?\s+ocupacionais", "educadores", re.IGNORECASE),
    (r"consult[oó]rio\s+terap[eê]utico", "ambiente educativo", re.IGNORECASE),

    # leftover "alívio" alone
    (r"\bal[ií]vio\b", "conforto", re.IGNORECASE),
]


def split_html(html):
    """Split into [(is_tag, text), ...]"""
    return [(s.startswith("<"), s) for s in re.split(r"(<[^>]+>)", html) if s]


def apply_rules_to_text(text, rules):
    for pat, repl, flags in rules:
        text = re.sub(pat, repl, text, flags=flags)
    return text


def cleanup_text(text):
    """Post-substitution grammar cleanup."""
    # Empty parens / brackets
    text = re.sub(r"\(\s*[,;]?\s*\)", "", text)
    text = re.sub(r"\[\s*[,;]?\s*\]", "", text)
    # Hanging conjunctions/punct: ", ou ,", ", e ,", " , ", "  ,"
    text = re.sub(r",\s*(ou|e)\s*,", ",", text, flags=re.IGNORECASE)
    text = re.sub(r"\s+,", ",", text)
    text = re.sub(r"\s+;", ";", text)
    text = re.sub(r"\s+:", ":", text)
    text = re.sub(r",,+", ",", text)
    text = re.sub(r";;+", ";", text)
    text = re.sub(r"::+", ":", text)
    # Period followed by punctuation
    text = re.sub(r"\.\s*,", ".", text)
    text = re.sub(r",\s*\.", ".", text)
    # Trailing connector at end of sentence: ", ou." -> "."
    text = re.sub(r",\s*(ou|e)\s*\.", ".", text, flags=re.IGNORECASE)
    text = re.sub(r"\s+(ou|e)\s*\.", ".", text, flags=re.IGNORECASE)
    # Multiple spaces
    text = re.sub(r"[ \t]{2,}", " ", text)
    # Space before punctuation
    text = re.sub(r"\s+([.,;:!?])", r"\1", text)
    # Capitalize lowercased conjunction at sentence start
    text = re.sub(r"(^|[.!?]\s+)(para|com|ou|e)\s", lambda m: m.group(1) + m.group(2).capitalize() + " ", text)
    # Empty list items / paragraphs
    text = re.sub(r"<li>\s*</li>", "", text)
    text = re.sub(r"<li>\s*<strong>\s*</strong>\s*</li>", "", text)
    text = re.sub(r"<li>\s*<strong>:\s*</strong>[^<]*</li>", "", text)
    text = re.sub(r"<p>\s*</p>", "", text)
    text = re.sub(r"<h3>\s*</h3>", "", text)
    text = re.sub(r"<h3>\s*<strong>\s*</strong>\s*</h3>", "", text)
    # Dangling " - " at end / start
    text = re.sub(r"^[\s\-—–]+", "", text)
    text = re.sub(r"[\s\-—–]+$", "", text)
    return text.strip()


def cleanup_title(title):
    t = cleanup_text(title)
    # Title-specific: collapse repeat words like "Foco e Foco"
    t = re.sub(r"\b(\w+)(\s+\1\b)+", r"\1", t, flags=re.IGNORECASE)
    # Trailing " - " or " — "
    t = re.sub(r"\s*[-—–]\s*$", "", t)
    # Title capitalization: keep as-is mostly, but fix lowercased "para" after dash
    t = re.sub(r"([-—–])\s+([a-z])", lambda m: m.group(1) + " " + m.group(2).upper(), t)
    return t.strip()


def rewrite_html(html):
    parts = split_html(html)
    out = []
    for is_tag, segment in parts:
        if is_tag:
            # Only allow alt= rewrite (text-bearing), but be safe: do nothing
            out.append(segment)
        else:
            out.append(apply_rules_to_text(segment, PHRASE_RULES))
    result = "".join(out)
    # Now cleanup grammar on the whole thing (text + tags interleaved is fine)
    result = cleanup_text(result)
    # Append disclaimer if missing
    if DISCLAIMER_MARKER not in result:
        result = result.rstrip() + "\n" + DISCLAIMER_HTML
    return result


def rewrite_plain(text):
    if not text:
        return text
    t = apply_rules_to_text(text, PHRASE_RULES)
    return cleanup_text(t)


def slugify_handle(s):
    s = deaccent(s).lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s[:80]  # Shopify handle limit guidance


def rewrite_handle(handle, new_title_for_fallback):
    """Clean forbidden tokens from handle, fall back to slugified title if degraded."""
    h = handle.lower()
    # Token-based cleanup on slug
    forbidden_slug_parts = [
        "anti-estresse", "anti-stress", "antistress", "antiestresse",
        "anti-ansiedade", "anti-depressao",
        "autorregulacao", "autorregulacao-sensorial",
        "tdah", "tea", "adhd", "ocd",
        "autismo", "autista", "asperger", "neurodivergente",
        "ansiedade", "depressao",
        "sobrecarga-sensorial", "processamento-sensorial", "integracao-sensorial",
        "terapeutico", "terapeutica", "conforto-sensorial",
        "alivio", "alivio-de-ansiedade", "alivio-do-estresse",
    ]
    for token in sorted(forbidden_slug_parts, key=len, reverse=True):
        h = re.sub(rf"-?{re.escape(token)}-?", "-", h)
    h = re.sub(r"-+", "-", h).strip("-")
    # If degraded too much (< 8 chars), fall back to slugified new title
    if len(h) < 8 or h == "":
        h = slugify_handle(new_title_for_fallback)
    return h


def rewrite_title(title):
    t = apply_rules_to_text(title, PHRASE_RULES)
    t = cleanup_title(t)
    return t


def rewrite_seo_title(seo_title, fallback_title):
    if not seo_title:
        return seo_title
    t = rewrite_plain(seo_title)
    # If degraded, build from new title
    if not t or len(t) < 10:
        t = (fallback_title[:65] + " | Incluo")[:70]
    return t[:80]


def rewrite_seo_description(seo_desc):
    if not seo_desc:
        return seo_desc
    t = rewrite_plain(seo_desc)
    return t[:160]


# ---------- main ----------
def main():
    data = json.loads(INPUT_PLAN.read_text(encoding="utf-8"))
    items = data["changes"]
    plan = []
    for it in items:
        title_old = it["title_old"]
        handle_old = it["handle_old"]
        desc_old = it["description_html_old"]
        seo_t_old = it["seo_title_old"]
        seo_d_old = it["seo_description_old"]
        hits = it.get("hits_found", []) or contains_forbidden(title_old + " " + desc_old + " " + handle_old + " " + (seo_t_old or "") + " " + (seo_d_old or ""))

        title_new = rewrite_title(title_old)
        handle_new = rewrite_handle(handle_old, title_new)
        desc_new = rewrite_html(desc_old)
        seo_t_new = rewrite_seo_title(seo_t_old, title_new)
        seo_d_new = rewrite_seo_description(seo_d_old)

        # Residual forbidden check (text only, not URL tokens like "antistress" in alt=...)
        # We strip HTML for residual check on description AND remove the disclaimer block first
        desc_for_check = desc_new
        # Remove disclaimer paragraph (last <hr><p><em>...</em></p>)
        desc_for_check = re.sub(r"<hr>\s*<p><em>[^<]*brinquedo recreativo[^<]*</em></p>\s*$", "", desc_for_check, flags=re.IGNORECASE | re.DOTALL)
        desc_text_only = re.sub(r"<[^>]+>", " ", desc_for_check)
        residual = contains_forbidden(title_new + " " + desc_text_only + " " + handle_new + " " + (seo_t_new or "") + " " + (seo_d_new or ""))

        plan.append({
            "id_gid": it["id_gid"],
            "id_numeric": it["id_numeric"],
            "title_old": title_old,
            "title_new": title_new,
            "title_changed": title_old != title_new,
            "handle_old": handle_old,
            "handle_new": handle_new,
            "handle_changed": handle_old != handle_new,
            "description_html_old": desc_old,
            "description_html_new": desc_new,
            "description_changed": desc_old != desc_new,
            "seo_title_old": seo_t_old,
            "seo_title_new": seo_t_new,
            "seo_title_changed": seo_t_old != seo_t_new,
            "seo_description_old": seo_d_old,
            "seo_description_new": seo_d_new,
            "seo_description_changed": seo_d_old != seo_d_new,
            "disclaimer_appended": DISCLAIMER_MARKER in desc_new and DISCLAIMER_MARKER not in (desc_old or ""),
            "hits_found_input": hits,
            "residual_forbidden": residual,
            "manual_review_needed": len(residual) > 0,
        })

    # validate URLs preserved (src= and href=)
    url_breaks = 0
    for p in plan:
        old_urls = set(re.findall(r'(?:src|href)="([^"]+)"', p["description_html_old"]))
        new_urls = set(re.findall(r'(?:src|href)="([^"]+)"', p["description_html_new"]))
        if old_urls - new_urls:
            url_breaks += 1
            p["url_break"] = sorted(old_urls - new_urls)
        else:
            p["url_break"] = []

    # validate handles
    invalid_handles = [p["id_numeric"] for p in plan if not re.match(r"^[a-z0-9-]+$", p["handle_new"]) or "--" in p["handle_new"]]

    summary = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_products": len(plan),
        "title_changed": sum(1 for p in plan if p["title_changed"]),
        "handle_changed": sum(1 for p in plan if p["handle_changed"]),
        "description_changed": sum(1 for p in plan if p["description_changed"]),
        "seo_title_changed": sum(1 for p in plan if p["seo_title_changed"]),
        "seo_description_changed": sum(1 for p in plan if p["seo_description_changed"]),
        "disclaimer_appended": sum(1 for p in plan if p["disclaimer_appended"]),
        "products_with_residual_forbidden": sum(1 for p in plan if p["residual_forbidden"]),
        "products_with_url_break": url_breaks,
        "invalid_handles": invalid_handles,
    }

    OUT_JSON.write_text(json.dumps({"summary": summary, "changes": plan}, ensure_ascii=False, indent=2), encoding="utf-8")

    # Top 20 by hits_found_input length
    top = sorted(plan, key=lambda p: len(p.get("hits_found_input", [])), reverse=True)[:20]
    lines = [
        "# Plano de Reescrita HTML-Safe (sem LLM) — Incluo",
        "",
        f"_Gerado em: {summary['generated_at']}_",
        "",
        "## 1. Totais",
        "",
        f"- Total: {summary['total_products']}",
        f"- Title alterado: {summary['title_changed']}",
        f"- Handle alterado: {summary['handle_changed']}",
        f"- descriptionHtml alterado: {summary['description_changed']}",
        f"- SEO title alterado: {summary['seo_title_changed']}",
        f"- SEO description alterado: {summary['seo_description_changed']}",
        f"- Disclaimer anexado: {summary['disclaimer_appended']}",
        f"- **Produtos com termo PROIBIDO RESIDUAL: {summary['products_with_residual_forbidden']}** (requerem revisão manual)",
        f"- **Produtos com URL de imagem quebrada: {summary['products_with_url_break']}** (devem ser ZERO)",
        f"- **Handles inválidos: {len(summary['invalid_handles'])}** (devem ser ZERO)",
        "",
        "## 2. Top 20 produtos com mais hits originais",
        "",
        "| ID | Title old → new | Handle old → new | Hits |",
        "|---|---|---|---|",
    ]
    for p in top:
        to = (p["title_old"] or "")[:50].replace("|", "\\|")
        tn = (p["title_new"] or "")[:50].replace("|", "\\|")
        ho = (p["handle_old"] or "")[:40]
        hn = (p["handle_new"] or "")[:40]
        lines.append(f"| {p['id_numeric']} | {to} → {tn} | {ho} → {hn} | {len(p.get('hits_found_input', []))} |")

    lines += ["", "## 3. Produtos com residual / URL break (devem ser zero)", ""]
    res = [p for p in plan if p["residual_forbidden"] or p["url_break"]]
    if not res:
        lines.append("_Nenhum._")
    else:
        for p in res[:30]:
            lines.append(f"- **{p['id_numeric']}** — residual={p['residual_forbidden']}  url_break={p['url_break']}")

    lines += ["", "## 4. Amostras de diff (top 5)", ""]
    for i, p in enumerate(top[:5], 1):
        lines.append(f"### Sample {i} — {p['id_numeric']}")
        lines.append("")
        lines.append(f"**Title:** `{p['title_old']}` → `{p['title_new']}`")
        lines.append("")
        lines.append(f"**Handle:** `{p['handle_old']}` → `{p['handle_new']}`")
        lines.append("")
        lines.append(f"**SEO title:** `{p['seo_title_old']}` → `{p['seo_title_new']}`")
        lines.append("")
        lines.append(f"**SEO desc:** `{p['seo_description_old']}` → `{p['seo_description_new']}`")
        lines.append("")
        lines.append("**descriptionHtml ANTES (≤1000 chars):**")
        lines.append("```html")
        lines.append(p["description_html_old"][:1000])
        lines.append("```")
        lines.append("**descriptionHtml DEPOIS (≤1200 chars):**")
        lines.append("```html")
        lines.append(p["description_html_new"][:1200])
        lines.append("```")
        lines.append("")

    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(f"OK\nJSON: {OUT_JSON}\nMD: {OUT_MD}")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
