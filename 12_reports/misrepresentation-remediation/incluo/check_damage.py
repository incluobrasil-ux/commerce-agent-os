"""Compare what I sent vs what was planned for the last batch."""
import json
from pathlib import Path
PLAN = json.loads(Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo\final-plan-20260527.json").read_text(encoding="utf-8"))
ids = ["8924996436130", "8924997910690", "8924998828194", "8924999483554", "8925001515170"]
for e in PLAN["changes"]:
    if e["id_numeric"] in ids:
        print(f"=== {e['id_numeric']} ===")
        print(f"Planned title: {e['title_new']}")
        print(f"Planned handle: {e['handle_new']}")
        print(f"Planned desc len: {len(e['description_html_new'])}")
