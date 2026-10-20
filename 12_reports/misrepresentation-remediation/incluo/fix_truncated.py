"""
Fix truncated descriptions for the 13 products from pages 14-15.
1. Load the fresh full data fetched from Shopify (saved below).
2. Update pending-source.json with full descriptions for any still pending.
3. Remove entries for those 13 IDs from llm-rewrite-plan-20260527.jsonl (will be reprocessed).
"""
import json
import re
from pathlib import Path

OUT_DIR = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo")
FRESH_FILE = OUT_DIR / "fresh-13-products.json"
PENDING_FILE = OUT_DIR / "pending-source.json"
JSONL = OUT_DIR / "llm-rewrite-plan-20260527.jsonl"

fresh = json.loads(FRESH_FILE.read_text(encoding="utf-8"))
fresh_by_gid = {p["id"]: p for p in fresh}
print(f"Fresh products: {len(fresh)}")

# Update pending source
pending = json.loads(PENDING_FILE.read_text(encoding="utf-8"))
updated = 0
for p in pending:
    if p["id_gid"] in fresh_by_gid:
        f = fresh_by_gid[p["id_gid"]]
        old_len = len(p["descriptionHtml"])
        p["title"] = f["title"]
        p["handle"] = f["handle"]
        p["descriptionHtml"] = f["descriptionHtml"]
        p["seo"] = f["seo"]
        new_len = len(p["descriptionHtml"])
        print(f"  Updated {p['id_numeric']}: desc {old_len} -> {new_len} chars")
        updated += 1
PENDING_FILE.write_text(json.dumps(pending, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"\npending-source.json: updated {updated} entries")

# Strip entries for these 13 from JSONL (will be reprocessed)
ids_to_strip = set(fresh_by_gid.keys())
lines = JSONL.read_text(encoding="utf-8").splitlines()
kept = []
stripped = 0
for line in lines:
    if not line.strip():
        continue
    obj = json.loads(line)
    if obj["id_gid"] in ids_to_strip:
        stripped += 1
        continue
    kept.append(line)
JSONL.write_text("\n".join(kept) + "\n", encoding="utf-8")
print(f"JSONL: stripped {stripped} entries, kept {len(kept)}")
