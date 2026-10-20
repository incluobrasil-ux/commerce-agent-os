"""Analyze hits distribution: done vs pending."""
import json
from pathlib import Path

OUT_DIR = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo")
JSONL = OUT_DIR / "llm-rewrite-plan-20260527.jsonl"
plan = json.loads((OUT_DIR / "remediation-plan-20260527.json").read_text(encoding="utf-8"))

done = set()
for line in JSONL.read_text(encoding="utf-8").splitlines():
    if line.strip():
        done.add(json.loads(line)["id_gid"])

done_hits = []
pending_hits = []
for c in plan["changes"]:
    h = c.get("hits_count", 0) or len(c.get("hits_found", []))
    if c["id_gid"] in done:
        done_hits.append((h, c["id_numeric"], c["title_old"][:60]))
    else:
        pending_hits.append((h, c["id_numeric"], c["title_old"][:60]))

done_hits.sort(reverse=True)
pending_hits.sort(reverse=True)
print(f"DONE 78: hits min={min(h for h,_,_ in done_hits)} max={max(h for h,_,_ in done_hits)} avg={sum(h for h,_,_ in done_hits)/len(done_hits):.1f}")
print(f"PENDING 65: hits min={min(h for h,_,_ in pending_hits)} max={max(h for h,_,_ in pending_hits)} avg={sum(h for h,_,_ in pending_hits)/len(pending_hits):.1f}")
print("\nTOP 15 PENDING (highest hits — these need quality rewrites):")
for h, idn, title in pending_hits[:15]:
    print(f"  {h:2d} hits | {idn} | {title}")
print(f"\nPending with 0 hits: {sum(1 for h,_,_ in pending_hits if h == 0)}")
print(f"Pending with 1-2 hits: {sum(1 for h,_,_ in pending_hits if 1 <= h <= 2)}")
print(f"Pending with 3+ hits: {sum(1 for h,_,_ in pending_hits if h >= 3)}")
