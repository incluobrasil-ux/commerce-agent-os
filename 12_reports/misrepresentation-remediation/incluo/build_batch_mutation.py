"""Build a batched GraphQL mutation (10 productUpdate aliased) + variables JSON.

Outputs:
- batch-query.graphql
- batch-vars.json
- batch-ids.txt  (id_gids in this batch for later mark_done)
"""
import json, sys
from pathlib import Path

OUT_DIR = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo")
INPUTS = OUT_DIR / "mutation-inputs-compact.json"
if not INPUTS.exists():
    INPUTS = OUT_DIR / "mutation-inputs.json"
QUERY = OUT_DIR / "batch-query.graphql"
VARS = OUT_DIR / "batch-vars.json"
IDS = OUT_DIR / "batch-ids.txt"

N = int(sys.argv[1]) if len(sys.argv) > 1 else 10

data = json.loads(INPUTS.read_text(encoding="utf-8"))
batch = data[:N]
if not batch:
    print("No pending inputs.", file=sys.stderr); sys.exit(1)

aliases = []
var_defs = []
variables = {}
for i, item in enumerate(batch):
    aliases.append(f"  p{i}: productUpdate(input: $i{i}) {{ product {{ id title handle }} userErrors {{ field message }} }}")
    var_defs.append(f"$i{i}: ProductInput!")
    variables[f"i{i}"] = item["input"]

query = f"mutation BulkUpdate({', '.join(var_defs)}) {{\n" + "\n".join(aliases) + "\n}"
QUERY.write_text(query, encoding="utf-8")
VARS.write_text(json.dumps(variables, ensure_ascii=False), encoding="utf-8")
IDS.write_text("\n".join(item["input"]["id"] for item in batch), encoding="utf-8")

print(f"Built batch with {len(batch)} mutations")
print(f"Query bytes: {QUERY.stat().st_size}, Vars bytes: {VARS.stat().st_size}")
print(f"IDs: {[item['input']['id'].split('/')[-1] for item in batch]}")
