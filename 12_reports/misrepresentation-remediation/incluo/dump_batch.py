"""Print N pending products by ID list as compact JSON."""
import json, sys
from pathlib import Path

OUT_DIR = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo")
pending = json.loads((OUT_DIR / "pending-source.json").read_text(encoding="utf-8"))
ids = sys.argv[1].split(",")
by_id = {p["id_numeric"]: p for p in pending}
out = [by_id[i] for i in ids if i in by_id]
print(json.dumps(out, ensure_ascii=False))
