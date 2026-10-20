import json, re
from pathlib import Path
JSONL = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo\llm-rewrite-plan-20260527.jsonl")
entries = [json.loads(l) for l in JSONL.read_text(encoding="utf-8").splitlines() if l.strip()]

REPL = [
    (re.compile(r"al[ií]vio\s+(d[aoe]\s+)?(\w+)", re.IGNORECASE), r"conforto durante \2"),
    (re.compile(r"\bal[ií]vio\b", re.IGNORECASE), "conforto"),
    (re.compile(r"\bdepress[aã]o\b", re.IGNORECASE), "agitação emocional"),
]

for e in entries:
    if e["id_numeric"] in ("8924991750306", "8928401457314"):
        for k in ("title_new", "description_html_new", "seo_title_new", "seo_description_new"):
            v = e.get(k) or ""
            for pat, repl in REPL:
                v = pat.sub(repl, v)
            e[k] = v

JSONL.write_text("\n".join(json.dumps(e, ensure_ascii=False) for e in entries) + "\n", encoding="utf-8")
print("Fixed 2 entries")
