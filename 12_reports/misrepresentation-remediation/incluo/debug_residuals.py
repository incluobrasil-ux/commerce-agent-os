import json, re
from pathlib import Path
p = Path(r'c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo\final-plan-20260527.json')
d = json.loads(p.read_text(encoding='utf-8'))
F = re.compile(r'\b(tdah|tea|adhd|ocd|autism[oa]|autistas?|asperger|neurodivergent[ea]s?|neurodivergencia|ansiedade|depress[aã]o|estresse cr[oô]nico|sobrecarga sensorial|hipersensibilidade|alivia|al[ií]vio|trata\s|cura\s|combate\s|reduz sintoma|autorregula[cç][aã]o|gerenciamento de sobrecarga|integra[cç][aã]o sensorial|processamento sensorial|regula[cç][aã]o emocional|organiza[cç][aã]o emocional|anti[\s-]?estresse|antiestresse|antistress|anti[\s-]?ansiedade|anti[\s-]?depress[aã]o|terap[eê]utic[oa]s?|conforto sensorial)\b', re.IGNORECASE)
for e in d['changes']:
    desc = re.sub(r'<hr>\s*<p><em>[^<]*brinquedo recreativo[^<]*</em></p>\s*$', '', e['description_html_new'], flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r'<[^>]+>', ' ', desc)
    txt = ' '.join([e['title_new'], e['handle_new'].replace('-', ' '), text, e['seo_title_new'] or '', e['seo_description_new'] or ''])
    matches = sorted(set(m.group(0).lower() for m in F.finditer(txt)))
    if matches:
        kind = 'LLM' if 'section-aware' not in ' '.join(e.get('changes_made', [])) else 'STR'
        print(f'{kind} {e["id_numeric"]}: {matches}')
    old_urls = set(re.findall(r'(?:src|href)="([^"]+)"', e['description_html_old']))
    new_urls = set(re.findall(r'(?:src|href)="([^"]+)"', e['description_html_new']))
    lost = sorted(old_urls - new_urls)
    if lost:
        print(f'URLBREAK {e["id_numeric"]}: {lost[:2]}')
