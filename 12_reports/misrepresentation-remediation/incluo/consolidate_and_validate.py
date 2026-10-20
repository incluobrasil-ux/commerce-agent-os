"""Consolidate JSONL → final JSON plan + summary MD with samples + validation report."""
import json
import re
import unicodedata
from pathlib import Path
from datetime import datetime, timezone

OUT_DIR = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo")
JSONL = OUT_DIR / "llm-rewrite-plan-20260527.jsonl"
PLAN = OUT_DIR / "final-plan-20260527.json"
SUMMARY = OUT_DIR / "final-plan-20260527-summary.md"

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


entries = []
for line in JSONL.read_text(encoding="utf-8").splitlines():
    if line.strip():
        entries.append(json.loads(line))

# Dedup by id_gid (keep last)
seen = {}
for e in entries:
    seen[e["id_gid"]] = e
entries = list(seen.values())

print(f"Total entries: {len(entries)}")

# Validate each
url_breaks = []
handles_bad = []
residuals = []
handle_collisions = {}

for e in entries:
    # URL preservation
    old_urls = set(re.findall(r'(?:src|href)="([^"]+)"', e["description_html_old"]))
    new_urls = set(re.findall(r'(?:src|href)="([^"]+)"', e["description_html_new"]))
    lost = sorted(old_urls - new_urls)
    if lost:
        url_breaks.append((e["id_numeric"], lost[:3]))
    # Handle validity
    h = e["handle_new"]
    if not re.match(r"^[a-z0-9-]+$", h) or "--" in h or len(h) < 3:
        handles_bad.append((e["id_numeric"], h))
    # Residuals (excluding disclaimer)
    desc_for_check = re.sub(r"<hr>\s*<p><em>[^<]*?(?:profissional de sa[uú]de|consulte um profissional)[^<]*?</em></p>\s*$", "", e["description_html_new"], flags=re.IGNORECASE | re.DOTALL)
    desc_text = re.sub(r"<[^>]+>", " ", desc_for_check)
    txt = " ".join([e["title_new"], h.replace("-", " "), desc_text, e["seo_title_new"] or "", e["seo_description_new"] or ""])
    matches = sorted(set(m.group(0).lower() for m in FORBIDDEN_RE.finditer(txt)))
    if matches:
        residuals.append((e["id_numeric"], matches))
    handle_collisions.setdefault(h, []).append(e["id_numeric"])

collisions = {h: ids for h, ids in handle_collisions.items() if len(ids) > 1}

# Counts
summary = {
    "generated_at": datetime.now(timezone.utc).isoformat(),
    "total_products": len(entries),
    "title_changed": sum(1 for e in entries if e["title_old"] != e["title_new"]),
    "handle_changed": sum(1 for e in entries if e["handle_old"] != e["handle_new"]),
    "description_changed": sum(1 for e in entries if e["description_html_old"] != e["description_html_new"]),
    "seo_title_changed": sum(1 for e in entries if (e["seo_title_old"] or "") != (e["seo_title_new"] or "")),
    "seo_description_changed": sum(1 for e in entries if (e["seo_description_old"] or "") != (e["seo_description_new"] or "")),
    "disclaimer_appended": sum(1 for e in entries if "brinquedo recreativo" in e["description_html_new"] and "brinquedo recreativo" not in (e["description_html_old"] or "")),
    "url_breaks": len(url_breaks),
    "invalid_handles": len(handles_bad),
    "residual_forbidden": len(residuals),
    "handle_collisions": len(collisions),
    "manual_review_flagged": sum(1 for e in entries if e.get("manual_review_needed")),
}

PLAN.write_text(json.dumps({"summary": summary, "changes": entries}, ensure_ascii=False, indent=2), encoding="utf-8")

# Build summary md
lines = [
    "# Plano Final de Remediação Misrepresentation — Incluo",
    "",
    f"_Gerado em: {summary['generated_at']}_",
    "",
    "## Totais",
    "",
    f"- Produtos no plano: **{summary['total_products']}**",
    f"- Title alterado: {summary['title_changed']}",
    f"- Handle alterado: {summary['handle_changed']}",
    f"- Description alterada: {summary['description_changed']}",
    f"- SEO title alterado: {summary['seo_title_changed']}",
    f"- SEO description alterada: {summary['seo_description_changed']}",
    f"- Disclaimer adicionado: {summary['disclaimer_appended']}",
    "",
    "## Validações",
    "",
    f"- URLs de imagem perdidas: **{summary['url_breaks']}** (deve ser 0)",
    f"- Handles inválidos: **{summary['invalid_handles']}** (deve ser 0)",
    f"- Termos proibidos residuais: **{summary['residual_forbidden']}** (deve ser 0)",
    f"- Colisões de handle: **{summary['handle_collisions']}** (deve ser 0)",
    f"- Produtos flagados pra review manual: {summary['manual_review_flagged']}",
    "",
]

if url_breaks:
    lines += ["### URL breaks", ""]
    for i, urls in url_breaks[:15]:
        lines.append(f"- {i}: {urls}")

if handles_bad:
    lines += ["", "### Handles inválidos", ""]
    for i, h in handles_bad[:15]:
        lines.append(f"- {i}: '{h}'")

if residuals:
    lines += ["", "### Residual forbidden", ""]
    for i, m in residuals[:15]:
        lines.append(f"- {i}: {m}")

if collisions:
    lines += ["", "### Handle collisions", ""]
    for h, ids in list(collisions.items())[:10]:
        lines.append(f"- '{h}': {ids}")

# Samples: 5 of high-hit, mix of LLM and structural
samples = []
# Pick 3 from LLM (high-hit indicators)
llm = [e for e in entries if "section-aware" not in " ".join(e.get("changes_made", []))]
struct = [e for e in entries if "section-aware" in " ".join(e.get("changes_made", []))]
samples = llm[:3] + struct[:3]

lines += ["", "## Amostras de diff (3 LLM + 3 structural)", ""]
for i, e in enumerate(samples, 1):
    kind = "LLM" if "section-aware" not in " ".join(e.get("changes_made", [])) else "STRUCTURAL"
    lines.append(f"### Sample {i} — {kind} — {e['id_numeric']}")
    lines.append("")
    lines.append(f"**Title:** `{e['title_old']}` → `{e['title_new']}`")
    lines.append("")
    lines.append(f"**Handle:** `{e['handle_old']}` → `{e['handle_new']}`")
    lines.append("")
    lines.append(f"**SEO title:** `{e['seo_title_old']}` → `{e['seo_title_new']}`")
    lines.append("")
    lines.append(f"**SEO desc:** `{e['seo_description_old']}` → `{e['seo_description_new']}`")
    lines.append("")
    lines.append("**ANTES (≤900 chars):**")
    lines.append("```html")
    lines.append(e["description_html_old"][:900])
    lines.append("```")
    lines.append("**DEPOIS (≤1200 chars):**")
    lines.append("```html")
    lines.append(e["description_html_new"][:1200])
    lines.append("```")
    lines.append("")

SUMMARY.write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote {PLAN}")
print(f"Wrote {SUMMARY}")
print(json.dumps(summary, ensure_ascii=False, indent=2))
