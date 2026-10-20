"""Fix double-encoded UTF-8 in LLM-produced JSONL entries.

Heuristic: if a field contains 'Ã' AND the latin-1->utf-8 round-trip yields
a valid string with fewer 'Ã' chars, use the fixed version.
"""
import json, re
from pathlib import Path

JSONL = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo\llm-rewrite-plan-20260527.jsonl")

def try_fix(s):
    if not isinstance(s, str) or "Ã" not in s:
        return s
    try:
        fixed = s.encode("latin-1").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return s
    if fixed.count("Ã") < s.count("Ã"):
        return fixed
    return s

NEW_FIELDS = ["title_new", "handle_new", "description_html_new", "seo_title_new", "seo_description_new"]
OLD_FIELDS = ["title_old", "handle_old", "description_html_old", "seo_title_old", "seo_description_old"]

fixed_count = 0
entries = []
for line in JSONL.read_text(encoding="utf-8").splitlines():
    if not line.strip():
        continue
    e = json.loads(line)
    changed = False
    for k in NEW_FIELDS + OLD_FIELDS:
        v = e.get(k)
        new_v = try_fix(v)
        if new_v != v:
            e[k] = new_v
            changed = True
    if changed:
        fixed_count += 1
    entries.append(e)

JSONL.write_text("\n".join(json.dumps(e, ensure_ascii=False) for e in entries) + "\n", encoding="utf-8")
print(f"Entries: {len(entries)}; fixed (had double-encoding in some field): {fixed_count}")

# verify
b = JSONL.read_bytes()
print(f"Proper 'á' bytes (c3 a1): {b.count(b'\\xc3\\xa1')}")
print(f"Double 'á' bytes (c3 83 c2 a1): {b.count(b'\\xc3\\x83\\xc2\\xa1')}")
