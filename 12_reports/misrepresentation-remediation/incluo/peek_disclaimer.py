import json, re
from pathlib import Path
p = Path(r'c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo\final-plan-20260527.json')
d = json.loads(p.read_text(encoding='utf-8'))
ids = ['8925008593058', '8928401457314']
for e in d['changes']:
    if e['id_numeric'] in ids:
        print(f"=== {e['id_numeric']} ===")
        print('Last 400 chars:', repr(e['description_html_new'][-400:]))
        print()
