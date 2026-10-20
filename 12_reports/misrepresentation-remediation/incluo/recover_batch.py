"""Build mutation inputs for specific IDs from the PLAN (not from compact)."""
import json, sys
from pathlib import Path
PLAN = json.loads(Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo\final-plan-20260527.json").read_text(encoding="utf-8"))
ids = sys.argv[1].split(",")
out_path = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo\recover-vars.json")

variables = {}
aliases = []
var_defs = []
for i, target_id in enumerate(ids):
    for e in PLAN["changes"]:
        if e["id_numeric"] == target_id:
            variables[f"i{i}"] = {
                "id": e["id_gid"],
                "title": e["title_new"],
                "descriptionHtml": e["description_html_new"],
                "handle": e["handle_new"],
                "redirectNewHandle": True,
                "seo": {"title": e["seo_title_new"] or "", "description": e["seo_description_new"] or ""},
            }
            aliases.append(f"  p{i}: productUpdate(input: $i{i}) {{ product {{ id title }} userErrors {{ field message }} }}")
            var_defs.append(f"$i{i}: ProductInput!")
            break

query = f"mutation Recover({', '.join(var_defs)}) {{\n" + "\n".join(aliases) + "\n}"
Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo\recover-query.graphql").write_text(query, encoding="utf-8")
out_path.write_text(json.dumps(variables, ensure_ascii=False), encoding="utf-8")
print(f"Built recover for {len(variables)} products")
print(f"Vars size: {out_path.stat().st_size}")
