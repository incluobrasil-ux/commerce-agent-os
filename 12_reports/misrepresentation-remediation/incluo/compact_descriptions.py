"""Compact descriptions to core sections so we can fit more per MCP batch.

Strategy: keep H2 + intro <p> + Benefícios/Características <h3>+<ul> + Especificações <h3>+<ul>
+ first <img> (preserves at least one image) + Indicado/Cuidados + disclaimer.
Drop: Como Usar, Onde Usar, Diferenciais, Presente, marketing sub-sections, extra <img> blocks.
"""
import json, re
from pathlib import Path

OUT_DIR = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo")
INPUTS = OUT_DIR / "mutation-inputs.json"
COMPACT = OUT_DIR / "mutation-inputs-compact.json"

DISCLAIMER = '<hr><p><em>⚠ Aviso: Este produto é um brinquedo recreativo. Não é dispositivo médico, não trata, cura ou alivia condições de saúde, e não substitui acompanhamento profissional. Em caso de necessidade clínica, consulte um profissional de saúde qualificado.</em></p>'

# Sections we DROP (h3 headers + following block until next h3 or end)
DROP_SECTIONS = [
    "Como Usar", "Onde Usar", "Diferenciais", "Presente", "Atividades",
    "Funções Interativas", "Aviso de Segurança", "Qualidade Incluo",
    "Observações", "Cuidados e Manutenção", "Onde e Quando Usar",
    "Instruções de Uso", "Características Especiais", "Garantia",
    "Massagem e", "Canal para", "Uma Alternativa", "Entretenimento Tátil",
    "Compromisso", "Tamanhos Disponíveis", "Estimulação Dupla",
]


def compact(html):
    # Drop sections by header pattern
    for sec in DROP_SECTIONS:
        # Match: <h3...>...{sec}...</h3>...(content)...(before next <h3> or <hr> or end)
        pat = re.compile(
            r"<h3[^>]*>(?:<strong[^>]*>)?[^<]*?" + re.escape(sec) + r"[^<]*?(?:</strong>)?</h3>.*?(?=<h3|<hr|$)",
            re.DOTALL | re.IGNORECASE,
        )
        html = pat.sub("", html)
    # Remove extra <img> blocks: keep only first 1
    imgs = re.findall(r"<p>\s*<img[^>]*>\s*</p>", html)
    if len(imgs) > 1:
        for img in imgs[1:]:
            html = html.replace(img, "", 1)
    # Cleanup whitespace
    html = re.sub(r"\s{2,}", " ", html)
    html = re.sub(r"\n{2,}", "\n", html)
    # Ensure disclaimer is present
    if "brinquedo recreativo" not in html:
        html = html.rstrip() + "\n" + DISCLAIMER
    return html


data = json.loads(INPUTS.read_text(encoding="utf-8"))
total_before = 0
total_after = 0
for item in data:
    old = item["input"]["descriptionHtml"]
    new = compact(old)
    item["input"]["descriptionHtml"] = new
    total_before += len(old)
    total_after += len(new)

COMPACT.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
print(f"Products: {len(data)}")
print(f"Total description bytes before: {total_before}")
print(f"Total description bytes after: {total_after}")
print(f"Reduction: {(1 - total_after/total_before)*100:.1f}%")
print(f"Avg description size: {total_after // len(data)} bytes")
