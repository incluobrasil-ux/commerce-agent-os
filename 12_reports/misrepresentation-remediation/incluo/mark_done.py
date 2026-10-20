"""Mark product as applied (append to apply-progress.jsonl)."""
import json, sys
from pathlib import Path
from datetime import datetime, timezone
PROGRESS = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo\apply-progress.jsonl")
gid = sys.argv[1]
with PROGRESS.open("a", encoding="utf-8") as f:
    f.write(json.dumps({"id_gid": gid, "applied_at": datetime.now(timezone.utc).isoformat()}) + "\n")
print(f"marked {gid}")
