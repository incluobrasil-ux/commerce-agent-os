"""Direct mojibake substitution (Unicode escapes to avoid source encoding pitfalls)."""
import json
from pathlib import Path

JSONL = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo\llm-rewrite-plan-20260527.jsonl")

# Map: mojibake sequence -> correct char. Use unicode escapes.
PAIRS = [
    # Lowercase accented (most common in PT-BR)
    ("Ã¡", "á"),  # Ã¡ -> á
    ("Ã©", "é"),  # Ã© -> é
    ("Ã­", "í"),  # Ã­ -> í
    ("Ã³", "ó"),  # Ã³ -> ó
    ("Ãº", "ú"),  # Ãº -> ú
    ("Ã£", "ã"),  # Ã£ -> ã
    ("Ãµ", "õ"),  # Ãµ -> õ
    ("Ã§", "ç"),  # Ã§ -> ç
    ("Ã¢", "â"),  # Ã¢ -> â
    ("Ãª", "ê"),  # Ãª -> ê
    ("Ã´", "ô"),  # Ã´ -> ô
    ("Ã ", "à"),  # Ã  -> à
    ("Ã¼", "ü"),  # Ã¼ -> ü
    ("Ã±", "ñ"),  # Ã± -> ñ
    # Capitals (PT-BR common: Á, É, Í, Ó, Ú, Ã, Õ, Ç, Â, Ê, Ô)
    ("Ã", "Á"),  # Á
    ("Ã‰", "É"),  # É (mojibake: Ã‰)
    ("Ã", "Í"),  # Í
    ("Ã“", "Ó"),  # Ó (mojibake: Ã“)
    ("Ã", "Ú"),  # Ú
    ("Ã", "Â"),  # Â
    ("Ã", "Ã"),  # Ã (escaped Ã itself: Ãƒ)
    ("Ã", "Õ"),  # Õ
    ("Ã", "Ç"),  # Ç
    ("Ã", "Ô"),  # Ô
    ("Ã", "Ê"),  # Ê
    # Smart quotes & em-dashes via UTF-8-as-cp1252 mojibake
    ("â€™", "’"),  # right single quote
    ("â€˜", "‘"),  # left single quote
    ("â€œ", "“"),  # left double quote
    ("â€", "”"),  # right double quote
    ("â€”", "—"),  # em dash
    ("â€“", "–"),  # en dash
    ("â€¦", "…"),  # ellipsis
    ("â ", "☠"),  # skull (rare)
    ("â­•", "•"),  # bullet
    ("â…", "★"),  # star
    ("â ", "⚠"),  # warning sign
    # Cp1252 leftovers
    ("Â°", "°"),  # degree
    ("Â®", "®"),  # ®
    ("Â©", "©"),  # ©
    ("Â ", " "),  # nbsp
    ("Â·", "·"),  # middle dot
]


def fix(s):
    if not isinstance(s, str):
        return s
    for bad, good in PAIRS:
        if bad in s:
            s = s.replace(bad, good)
    return s


NEW_FIELDS = ["title_new", "handle_new", "description_html_new", "seo_title_new", "seo_description_new"]
OLD_FIELDS = ["title_old", "handle_old", "description_html_old", "seo_title_old", "seo_description_old"]

entries = []
fixed_count = 0
for line in JSONL.read_text(encoding="utf-8").splitlines():
    if not line.strip():
        continue
    e = json.loads(line)
    changed = False
    for k in NEW_FIELDS + OLD_FIELDS:
        v = e.get(k)
        nv = fix(v)
        if nv != v:
            e[k] = nv
            changed = True
    if changed:
        fixed_count += 1
    entries.append(e)

JSONL.write_text("\n".join(json.dumps(e, ensure_ascii=False) for e in entries) + "\n", encoding="utf-8")
print(f"Fixed {fixed_count} entries")

# Verify residual mojibake
b = JSONL.read_bytes()
text = b.decode("utf-8")
print(f"Ã (Ã) count remaining: {text.count(chr(0x00c3))}")
print(f"â (â) count remaining: {text.count(chr(0x00e2))}")
print(f"Â (Â) count remaining: {text.count(chr(0x00c2))}")
# Sample remaining Ã contexts
import re
for m in re.finditer(r".{0,15}Ã.{0,15}", text):
    print("  ctx:", repr(m.group(0)))
    if list(re.finditer(r"Ã", m.group(0))).__len__() > 3: break
