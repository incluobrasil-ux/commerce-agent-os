"""Prepare mutation inputs from final plan + track progress."""
import json
from pathlib import Path

OUT_DIR = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo")
PLAN = OUT_DIR / "final-plan-20260527.json"
PROGRESS = OUT_DIR / "apply-progress.jsonl"
INPUTS = OUT_DIR / "mutation-inputs.json"

plan = json.loads(PLAN.read_text(encoding="utf-8"))
done = set()
if PROGRESS.exists():
    for line in PROGRESS.read_text(encoding="utf-8").splitlines():
        if line.strip():
            done.add(json.loads(line)["id_gid"])

inputs = []
for e in plan["changes"]:
    if e["id_gid"] in done:
        continue
    inp = {
        "id": e["id_gid"],
        "title": e["title_new"],
        "descriptionHtml": e["description_html_new"],
        "handle": e["handle_new"],
        "redirectNewHandle": True,
        "seo": {
            "title": e["seo_title_new"] or "",
            "description": e["seo_description_new"] or "",
        },
    }
    inputs.append({"id_numeric": e["id_numeric"], "input": inp})

INPUTS.write_text(json.dumps(inputs, ensure_ascii=False), encoding="utf-8")
print(f"Total in plan: {len(plan['changes'])}")
print(f"Already applied: {len(done)}")
print(f"Pending: {len(inputs)}")
print(f"First pending: {inputs[0]['id_numeric'] if inputs else 'none'}")
