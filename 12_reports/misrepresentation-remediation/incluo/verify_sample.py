"""Verify a sample of products - print titles and short snippets."""
import json
from pathlib import Path
JSONL = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo\llm-rewrite-plan-20260527.jsonl")
sample_ids = ["8924974350498", "8924985065634", "9229804372130", "8924979953826", "8927594152098"]
for line in JSONL.read_text(encoding="utf-8").splitlines():
    if not line.strip(): continue
    e = json.loads(line)
    if e["id_numeric"] in sample_ids:
        print(f"=== {e['id_numeric']} ===")
        print(f"title: {e['title_new']}")
        print(f"handle: {e['handle_new']}")
        print(f"seo_title: {e['seo_title_new']}")
        print(f"seo_desc: {e['seo_description_new']}")
        # Check for any Ã chars
        for fname in ["title_new", "description_html_new", "seo_title_new", "seo_description_new"]:
            v = e.get(fname) or ""
            for bad in ["Ã¡", "Ã©", "Ã­", "Ã³", "Ãº", "Ã£", "Ã§", "â€"]:
                if bad in v:
                    print(f"  ! still has mojibake '{bad}' in {fname}")
        print()
