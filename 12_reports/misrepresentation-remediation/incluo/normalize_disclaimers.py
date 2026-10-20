"""Normalize all disclaimers to the standard one."""
import json, re
from pathlib import Path

OUT_DIR = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo")
JSONL = OUT_DIR / "llm-rewrite-plan-20260527.jsonl"

STANDARD = '<hr><p><em>⚠ Aviso: Este produto é um brinquedo recreativo. Não é dispositivo médico, não trata, cura ou alivia condições de saúde, e não substitui acompanhamento profissional. Em caso de necessidade clínica, consulte um profissional de saúde qualificado.</em></p>'

# Any disclaimer = <hr><p><em>...consulte um profissional...</em></p> at or near the end
DISCLAIMER_RE = re.compile(
    r"<hr>\s*<p><em>[^<]*?(?:profissional de sa[uú]de|consulte um profissional)[^<]*?</em></p>\s*$",
    re.IGNORECASE | re.DOTALL,
)

entries = []
for line in JSONL.read_text(encoding="utf-8").splitlines():
    if line.strip():
        entries.append(json.loads(line))

normalized = 0
appended = 0
for e in entries:
    desc = e["description_html_new"]
    m = DISCLAIMER_RE.search(desc)
    if m:
        # Replace existing disclaimer with standard
        new_desc = desc[: m.start()].rstrip() + "\n" + STANDARD
        if new_desc != desc:
            e["description_html_new"] = new_desc
            normalized += 1
    else:
        # No disclaimer found — append standard
        e["description_html_new"] = desc.rstrip() + "\n" + STANDARD
        appended += 1

JSONL.write_text("\n".join(json.dumps(e, ensure_ascii=False) for e in entries) + "\n", encoding="utf-8")
print(f"Normalized existing: {normalized}")
print(f"Appended new (no disclaimer): {appended}")
print(f"Total: {len(entries)}")
