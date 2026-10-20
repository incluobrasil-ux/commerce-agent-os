"""Build bulk operation JSONL: one input per line."""
import json
from pathlib import Path

OUT_DIR = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo")
INPUTS = OUT_DIR / "mutation-inputs.json"
BULK = OUT_DIR / "bulk-input.jsonl"

data = json.loads(INPUTS.read_text(encoding="utf-8"))
with BULK.open("w", encoding="utf-8") as f:
    for item in data:
        f.write(json.dumps({"input": item["input"]}, ensure_ascii=False) + "\n")

print(f"Wrote {len(data)} entries to {BULK}")
print(f"File size: {BULK.stat().st_size} bytes")
