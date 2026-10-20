"""Save mutation input(s) for products by id_numeric to a file (UTF-8)."""
import json, sys
from pathlib import Path
OUT_DIR = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo")
INPUTS = OUT_DIR / "mutation-inputs.json"
OUT_FILE = OUT_DIR / "next-input.json"
data = json.loads(INPUTS.read_text(encoding="utf-8"))
targets = sys.argv[1:] if len(sys.argv) > 1 else [data[0]["id_numeric"]]
found = [item["input"] for item in data if item["id_numeric"] in targets]
if not found:
    print("NONE FOUND", file=sys.stderr); sys.exit(1)
# Write single input (when 1) or list
OUT_FILE.write_text(json.dumps(found[0] if len(found) == 1 else found, ensure_ascii=False), encoding="utf-8")
print(f"Wrote {len(found)} input(s) to {OUT_FILE}")
