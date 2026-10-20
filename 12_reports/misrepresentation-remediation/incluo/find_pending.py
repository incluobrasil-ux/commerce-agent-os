"""List pending products (not in JSONL) with their full source data."""
import json
from pathlib import Path

OUT_DIR = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo")
JSONL = OUT_DIR / "llm-rewrite-plan-20260527.jsonl"
PENDING = OUT_DIR / "pending-source.json"

# Done ids
done = set()
for line in JSONL.read_text(encoding="utf-8").splitlines():
    if line.strip():
        done.add(json.loads(line)["id_gid"])

# Source: deterministic plan has full _old data for all 143
plan = json.loads((OUT_DIR / "remediation-plan-20260527.json").read_text(encoding="utf-8"))
pending = []
for c in plan["changes"]:
    if c["id_gid"] not in done:
        pending.append({
            "id_gid": c["id_gid"],
            "id_numeric": c["id_numeric"],
            "title": c["title_old"],
            "handle": c["handle_old"],
            "descriptionHtml": c["description_html_old"],
            "seo": {"title": c["seo_title_old"], "description": c["seo_description_old"]},
        })

PENDING.write_text(json.dumps(pending, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"done={len(done)} pending={len(pending)}")
print(f"Sizes (chars): min={min(len(p['descriptionHtml']) for p in pending)} max={max(len(p['descriptionHtml']) for p in pending)} sum={sum(len(p['descriptionHtml']) for p in pending)}")
print(f"Saved to {PENDING}")
