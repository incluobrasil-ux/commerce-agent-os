import json
from pathlib import Path
JSONL = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo\llm-rewrite-plan-20260527.jsonl")
for line in JSONL.read_text(encoding="utf-8").splitlines():
    if not line.strip(): continue
    e = json.loads(line)
    if "Ã" in (e.get("title_new") or ""):
        print(e["id_numeric"], "TITLE:", e["title_new"][:120])
        print("  type:", type(e["title_new"]))
        try:
            fixed = e["title_new"].encode("latin-1").decode("utf-8")
            print("  latin1->utf8:", fixed[:120])
        except Exception as ex:
            print("  latin1 fail:", ex)
        print("  desc[:200]:", e["description_html_new"][:200])
        print()
        break
