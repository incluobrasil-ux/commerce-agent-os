"""
Post-run validation + consolidation for llm-rewrite-plan-20260527.jsonl.

- Validates: residual forbidden terms, preserved src/href URLs, handle regex.
- Consolidates JSONL -> single JSON array.
- Writes a human-readable markdown summary.
"""
import json
import re
from pathlib import Path
from collections import Counter

BASE = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo")
JSONL = BASE / "llm-rewrite-plan-20260527.jsonl"
JSON_OUT = BASE / "llm-rewrite-plan-20260527.json"
MD_OUT = BASE / "llm-rewrite-plan-20260527-summary.md"

FORBIDDEN = [
    r"\bTDAH\b", r"\bTEA\b", r"\bADHD\b", r"\bOCD\b",
    r"\bautism[oa]s?\b", r"\bautist[ao]s?\b", r"\basperger\b",
    r"\bneurodivergen(te|cia|tes)\b",
    r"\bansiedade\b", r"\bdepress[aã]o\b", r"\banti-?depress",
    r"\bestresse cr[oô]nico\b", r"\bsobrecarga sensorial\b", r"\bhipersensibilidade\b",
    r"\btrata\b", r"\bcura\b", r"\balivia\b", r"\bal[ií]vio\b",
    r"\bautorregula[cç][aã]o\b",
    r"\bintegra[cç][aã]o sensorial\b", r"\bprocessamento sensorial\b",
    r"\bregula[cç][aã]o emocional\b", r"\borganiza[cç][aã]o emocional\b",
    r"anti-?estresse", r"antistress", r"anti-?ansiedade",
    r"\bterap[eê]utico\b", r"\bconforto sensorial\b", r"\bbrinquedo terap[eê]utico\b",
]
FORBIDDEN_RE = re.compile("|".join(FORBIDDEN), re.IGNORECASE)
URL_RE = re.compile(r'(?:src|href)="([^"]+)"', re.IGNORECASE)
HANDLE_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def main():
    if not JSONL.exists():
        print(f"ERROR: {JSONL} not found")
        return

    rows = []
    for line in JSONL.read_text(encoding="utf-8").splitlines():
        if line.strip():
            rows.append(json.loads(line))

    # consolidated array
    JSON_OUT.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")

    residual_hits = []
    url_diffs = []
    bad_handles = []
    manual_review = []
    term_remove_counter = Counter()

    for r in rows:
        title_new = r.get("title_new", "") or ""
        handle_new = r.get("handle_new", "") or ""
        desc_new = r.get("description_html_new", "") or ""
        seo_t_new = r.get("seo_title_new", "") or ""
        seo_d_new = r.get("seo_description_new", "") or ""

        # residual
        for field, val in [
            ("title", title_new),
            ("handle", handle_new),
            ("description_html", desc_new),
            ("seo_title", seo_t_new),
            ("seo_description", seo_d_new),
        ]:
            for m in FORBIDDEN_RE.finditer(val):
                residual_hits.append({
                    "id": r.get("id_numeric"),
                    "field": field,
                    "term": m.group(0),
                })

        # URL preservation (compare sets)
        old_urls = set(URL_RE.findall(r.get("description_html_old", "") or ""))
        new_urls = set(URL_RE.findall(desc_new))
        missing = old_urls - new_urls
        added = new_urls - old_urls
        if missing or added:
            url_diffs.append({
                "id": r.get("id_numeric"),
                "missing": sorted(missing),
                "added": sorted(added),
            })

        # handle regex
        if not HANDLE_RE.match(handle_new):
            bad_handles.append({"id": r.get("id_numeric"), "handle": handle_new})

        if r.get("manual_review_needed"):
            manual_review.append({
                "id": r.get("id_numeric"),
                "title_new": title_new,
                "notes": r.get("notes", ""),
            })

        for c in r.get("changes_made", []) or []:
            # extract term in quotes if any
            for m in re.findall(r"'([^']+)'", c):
                term_remove_counter[m.lower()] += 1

    # samples
    samples = []
    for r in rows[:5]:
        samples.append({
            "id": r.get("id_numeric"),
            "title_old": r.get("title_old"),
            "title_new": r.get("title_new"),
            "desc_old_head": (r.get("description_html_old") or "")[:800],
            "desc_new_head": (r.get("description_html_new") or "")[:800],
        })

    lines = []
    lines.append("# LLM Rewrite Plan - Incluo Misrepresentation Remediation")
    lines.append("")
    lines.append(f"- Date: 2026-05-27")
    lines.append(f"- Total products processed: {len(rows)}")
    lines.append(f"- Manual review needed: {len(manual_review)}")
    lines.append(f"- Residual forbidden-term hits: {len(residual_hits)}")
    lines.append(f"- Products with URL diffs (src/href): {len(url_diffs)}")
    lines.append(f"- Invalid handles: {len(bad_handles)}")
    lines.append("")
    lines.append("## Top terms removed (from changes_made)")
    lines.append("")
    for term, n in term_remove_counter.most_common(20):
        lines.append(f"- `{term}` x {n}")
    lines.append("")
    lines.append("## Sample diffs (first 5)")
    for s in samples:
        lines.append("")
        lines.append(f"### Product {s['id']}")
        lines.append(f"- **title_old**: {s['title_old']}")
        lines.append(f"- **title_new**: {s['title_new']}")
        lines.append("")
        lines.append("**desc_old (first 800 chars):**")
        lines.append("")
        lines.append("```html")
        lines.append(s["desc_old_head"])
        lines.append("```")
        lines.append("")
        lines.append("**desc_new (first 800 chars):**")
        lines.append("")
        lines.append("```html")
        lines.append(s["desc_new_head"])
        lines.append("```")
    lines.append("")
    lines.append("## Manual review needed")
    if not manual_review:
        lines.append("")
        lines.append("(none)")
    else:
        for m in manual_review:
            lines.append(f"- **{m['id']}** - {m['title_new']}")
            lines.append(f"  - notes: {m['notes']}")
    lines.append("")
    lines.append("## Validation details")
    lines.append("")
    lines.append("### Residual forbidden terms (first 30)")
    for h in residual_hits[:30]:
        lines.append(f"- id={h['id']} field={h['field']} term='{h['term']}'")
    if len(residual_hits) > 30:
        lines.append(f"... and {len(residual_hits)-30} more")
    lines.append("")
    lines.append("### URL diffs (first 20)")
    for d in url_diffs[:20]:
        lines.append(f"- id={d['id']} missing={d['missing']} added={d['added']}")
    if len(url_diffs) > 20:
        lines.append(f"... and {len(url_diffs)-20} more")
    lines.append("")
    lines.append("### Invalid handles")
    for b in bad_handles:
        lines.append(f"- id={b['id']} handle='{b['handle']}'")

    MD_OUT.write_text("\n".join(lines), encoding="utf-8")

    print(f"Consolidated  -> {JSON_OUT}  ({len(rows)} products)")
    print(f"Summary       -> {MD_OUT}")
    print(f"Residuals     : {len(residual_hits)}")
    print(f"URL diffs     : {len(url_diffs)}")
    print(f"Bad handles   : {len(bad_handles)}")
    print(f"Manual review : {len(manual_review)}")


if __name__ == "__main__":
    main()
