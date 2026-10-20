"""Merge manually-crafted rewrites with source data and append to JSONL.

Usage: edit REWRITES below, then run.
Each entry needs: id_numeric, title_new, handle_new, description_html_new,
seo_title_new, seo_description_new, changes_made (list), manual_review_needed, notes.
The script looks up _old fields from pending-source.json and appends merged records.
"""
import json
import re
from pathlib import Path

OUT_DIR = Path(r"c:\projetos-incluo\commerce-agent-os\12_reports\misrepresentation-remediation\incluo")
PENDING = OUT_DIR / "pending-source.json"
JSONL = OUT_DIR / "llm-rewrite-plan-20260527.jsonl"

# ====== EDIT THIS LIST ======
REWRITES = [
    {
        "id_numeric": "9229804372130",
        "title_new": "Fidget Slider Magnético em Formato Chocolate - Metal Premium",
        "handle_new": "fidget-slider-magnetico-chocolate-metal-premium",
        "description_html_new": '<h2>Fidget Slider Magnético em Formato Chocolate — Metal Premium</h2>\n<p>O <strong>Fidget Slider Chocolate Magnético Incluo</strong> é um brinquedo sensorial em liga metálica premium com mecanismo magnético de alta resistência e formato ergonômico de barra de chocolate. Objeto manipulativo discreto para uso em mesa, reuniões ou estudos.</p>\n<p><img src="https://cdn.shopify.com/s/files/1/0708/4123/7666/files/Product_photography_on_white_bac__202605121354.jpg?v=1778604895" alt=""></p>\n<p><img src="https://cdn.shopify.com/s/files/1/0708/4123/7666/files/Product_photography_on_white_bac__202605121354.jpg?v=1778604895" alt="Fidget Slider Magnético em Formato Chocolate - Metal Premium - imagem 1" loading="lazy"></p><h3>Características</h3>\n<ul>\n<li><strong>Movimento magnético contínuo:</strong> mantém as mãos ativas durante atividades de foco</li>\n<li><strong>Retorno tátil satisfatório:</strong> deslize suave a cada manipulação</li>\n<li><strong>Discrição:</strong> uso silencioso em ambientes públicos, reuniões ou sala de aula</li>\n<li><strong>Substituição de hábitos motores:</strong> alternativa para tamborilar dedos ou agitar pernas</li>\n</ul>\n<p><img src="https://cdn.shopify.com/s/files/1/0708/4123/7666/files/Ultra-realistic_lifestyle_product_photography._A_202605121349.jpg?v=1778604896" alt=""></p>\n<p><img src="https://cdn.shopify.com/s/files/1/0708/4123/7666/files/Ultra-realistic_lifestyle_product_photography._A_202605121349.jpg?v=1778604896" alt="Fidget Slider Magnético em Formato Chocolate - Metal Premium - imagem 2" loading="lazy"></p><h3>Especificações Técnicas</h3>\n<ul>\n<li><strong>Material:</strong> Liga metálica com acabamento polido</li>\n<li><strong>Mecanismo:</strong> Sistema magnético de alta resistência</li>\n<li><strong>Variantes:</strong> Preto, Branco e Colorido</li>\n<li><strong>Faixa etária:</strong> 14+ anos</li>\n<li><strong>Alimentação:</strong> Não requer baterias</li>\n</ul>\n<p><img src="https://cdn.shopify.com/s/files/1/0708/4123/7666/files/Product_photography_studio_e-com__202605121353.jpg?v=1778604895" alt="Fidget Slider Magnético em Formato Chocolate - Metal Premium - imagem 3" loading="lazy"></p><h3>Indicado Para</h3>\n<p>Adultos, adolescentes, profissionais em ambientes de alta demanda cognitiva, estudantes universitários e quem aprecia objetos sensoriais discretos e portáteis.</p>\n<p><img src="https://cdn.shopify.com/s/files/1/0708/4123/7666/files/Adult_using_sensory_fidget_202605121349.jpg?v=1778604896" alt=""></p>\n<h3>Cuidados</h3>\n<p>Limpe com pano seco. Mantenha afastado de cartões magnéticos e dispositivos eletrônicos sensíveis. <strong>Contém ímãs</strong> — não recomendado para crianças menores de 14 anos.</p>\n<hr><p><em>⚠ Aviso: Este produto é um brinquedo recreativo. Não é dispositivo médico, não trata, cura ou alivia condições de saúde, e não substitui acompanhamento profissional. Em caso de necessidade clínica, consulte um profissional de saúde qualificado.</em></p>',
        "seo_title_new": "Fidget Slider Chocolate Magnético Metal | Incluo",
        "seo_description_new": "Fidget slider em formato chocolate, metal magnético premium. Brinquedo sensorial para foco e momentos de pausa. Frete grátis Brasil + 5% Pix.",
        "changes_made": [
            "title: removed 'Anti-Estresse'",
            "handle: removed 'anti-estresse', recomposed",
            "description: removed claims (anti-estresse, alívio da ansiedade, gerenciamento da sobrecarga sensorial, TDAH, autismo, TEA, autorregulação, ansiedade, neurodivergente); replaced 'Benefícios Funcionais' with neutral 'Características'; rewrote 'Indicado Para' without clinical conditions; appended disclaimer",
            "seo description: removed 'Anti-estresse', 'TDAH', 'ansiedade'",
            "alt attributes updated to new title (no 'Anti-Estresse')",
        ],
        "manual_review_needed": False,
        "notes": "",
    },
    {
        "id_numeric": "9229808926882",
        "title_new": "Brinquedo Sensorial Rabanete Elástico Squishy 3D - Telescópico",
        "handle_new": "brinquedo-sensorial-rabanete-elastico-squishy-3d-telescopico",
        "description_html_new": '<h2>Brinquedo Sensorial Rabanete Elástico Squishy 3D — Telescópico</h2><p>O <strong>Brinquedo Sensorial Rabanete Elástico Incluo</strong> é um brinquedo manipulativo com formato de rabanete em malha elástica telescópica. Oferece estímulo tátil único com textura responsiva e movimento de esticar e contrair, divertido para crianças e adultos.</p><h3>Características</h3><ul><li><strong>Estímulo tátil:</strong> malha elástica com textura responsiva e variada</li><li><strong>Movimento telescópico:</strong> esticar e contrair como exercício de manipulação</li><li><strong>Design kawaii:</strong> formato de rabanete em 3D atraente</li><li><strong>Versatilidade:</strong> kits com 1, 2 ou 3 peças</li></ul><h3>Indicado Para</h3><p>Crianças (3+ anos com supervisão), adolescentes, adultos, salas de aula e atividades pedagógicas.</p>\n<hr><p><em>⚠ Aviso: Este produto é um brinquedo recreativo. Não é dispositivo médico, não trata, cura ou alivia condições de saúde, e não substitui acompanhamento profissional. Em caso de necessidade clínica, consulte um profissional de saúde qualificado.</em></p>',
        "seo_title_new": "Brinquedo Rabanete Sensorial Elástico Squishy 3D | Incluo",
        "seo_description_new": "Brinquedo sensorial 3D rabanete elástico telescópico. Estímulo tátil para crianças e adultos. Kits 1, 2 ou 3 peças. Frete grátis Brasil.",
        "changes_made": [
            "title: removed 'Anti-Ansiedade'",
            "description: removed claims (Anti-Ansiedade, alívio do estresse, autorregulação sensorial, TEA, TDAH, ansiedade, terapia ocupacional); rewrote 'Indicado Para' sem condições clínicas; appended disclaimer",
            "seo description: removed 'Anti-estresse e ansiedade'",
        ],
        "manual_review_needed": False,
        "notes": "",
    },
    {
        "id_numeric": "9229806895266",
        "title_new": "Fidget Slider EDC Metal Magnético - Premium para Adultos",
        "handle_new": "fidget-slider-edc-metal-magnetico-premium-adulto",
        "description_html_new": '<h2>Fidget Slider EDC Metal Magnético — Premium para Adultos</h2><p>O <strong>Fidget Slider EDC Metal Magnético Incluo</strong> é um brinquedo sensorial premium em metal sólido com mecanismo magnético de alta precisão. Desenvolvido como objeto <strong>EDC (Every Day Carry)</strong> para adultos: peso, textura metálica e operação silenciosa para uso em escritório e reuniões.</p><h3>Características</h3><ul><li><strong>Mecanismo magnético de precisão:</strong> deslize suave e contínuo</li><li><strong>Acabamento premium:</strong> 5 opções com peso e textura metálicos</li><li><strong>Discrição:</strong> operação silenciosa para ambientes profissionais</li><li><strong>Substituição de hábitos:</strong> alternativa elegante para tamborilar dedos</li></ul><h3>Indicado Para</h3><p>Adultos, profissionais, executivos, colecionadores de fidget premium e entusiastas de EDC que valorizam objetos manipulativos de alta qualidade.</p>\n<hr><p><em>⚠ Aviso: Este produto é um brinquedo recreativo. Não é dispositivo médico, não trata, cura ou alivia condições de saúde, e não substitui acompanhamento profissional. Em caso de necessidade clínica, consulte um profissional de saúde qualificado.</em></p>',
        "seo_title_new": "Fidget Slider EDC Metal Magnético Premium | Incluo",
        "seo_description_new": "Fidget slider EDC em metal magnético premium para adultos. 5 acabamentos. Brinquedo sensorial de alta qualidade. Frete grátis Brasil.",
        "changes_made": [
            "title: removed 'Anti-Estresse'",
            "description: removed claims (Anti-Estresse, alívio do estresse, gerenciamento da ansiedade, TDAH, ansiedade, estresse crônico, autorregulação); rewrote 'Indicado Para' sem condições clínicas; appended disclaimer",
            "seo description: removed 'Anti-estresse', 'alívio de ansiedade e estresse'",
        ],
        "manual_review_needed": False,
        "notes": "",
    },
    {
        "id_numeric": "9229805584546",
        "title_new": "Kit Bolas Sensoriais Kawaii Squishy Slow Rising - Estímulo Tátil",
        "handle_new": "kit-bolas-sensoriais-kawaii-squishy-slow-rising",
        "description_html_new": '<h2>Kit Bolas Sensoriais Kawaii Squishy — Estímulo Tátil e Conforto</h2><p>O <strong>Kit Bolas Sensoriais Kawaii Squishy Incluo</strong> reúne bolinhas squishy com design kawaii de animais e mecanismo <strong>slow rising</strong> (recuperação lenta). Brinquedo manipulativo para estímulo tátil e momentos de pausa em diferentes ambientes.</p><p><img src="https://cdn.shopify.com/s/files/1/0708/4123/7666/files/Ultra-realistic_studio_product_photography_of_202605121409.jpg?v=1778606295" alt="Kit Bolas Sensoriais Kawaii Squishy Slow Rising - Estímulo Tátil - imagem 1" loading="lazy"></p><h3>Características</h3><ul>\n<li>\n<strong>Conforto tátil:</strong> textura macia e responsiva ao toque</li>\n<li>\n<strong>Movimento de apertar e soltar:</strong> manipulação repetitiva agradável</li>\n<li>\n<strong>Slow rising:</strong> recuperação lenta proporciona experiência hipnotizante</li>\n<li>\n<strong>Versatilidade:</strong> kits com 1, 4 ou 8 peças para uso individual ou coletivo</li>\n</ul><p><img src="https://cdn.shopify.com/s/files/1/0708/4123/7666/files/Diminuir_tamanho_brinquedo_crianca_202605121421.jpg?v=1778606487" alt="Kit Bolas Sensoriais Kawaii Squishy Slow Rising - Estímulo Tátil - imagem 2" loading="lazy"></p><h3>Especificações Técnicas</h3><ul>\n<li>\n<strong>Material:</strong> Espuma macia atóxica</li>\n<li>\n<strong>Mecanismo:</strong> Slow rising (recuperação lenta)</li>\n<li>\n<strong>Kits disponíveis:</strong> 1, 4 ou 8 peças (designs kawaii sortidos)</li>\n<li>\n<strong>Faixa etária:</strong> 3+ anos com supervisão</li>\n</ul><p><img src="https://cdn.shopify.com/s/files/1/0708/4123/7666/files/Product_in_sensory_room_202605121416.jpg?v=1778606295" alt="Kit Bolas Sensoriais Kawaii Squishy Slow Rising - Estímulo Tátil - imagem 3" loading="lazy"></p><h3>Indicado Para</h3><p>Crianças (3+ anos com supervisão), adolescentes, adultos, salas de aula e atividades pedagógicas.</p><h3>Cuidados</h3><p>Limpe com pano úmido. Evite cortes ou perfurações. Mantenha longe de calor extremo. Supervisione crianças pequenas devido às peças.</p>\n<hr><p><em>⚠ Aviso: Este produto é um brinquedo recreativo. Não é dispositivo médico, não trata, cura ou alivia condições de saúde, e não substitui acompanhamento profissional. Em caso de necessidade clínica, consulte um profissional de saúde qualificado.</em></p>',
        "seo_title_new": "Bolas Sensoriais Kawaii Squishy Slow Rising | Incluo",
        "seo_description_new": "Kit bolas squishy kawaii com recuperação lenta. Estímulo tátil. Kits de 1, 4 ou 8 peças. Frete grátis Brasil + 5% Pix.",
        "changes_made": [
            "title: removed 'Anti-Estresse'",
            "description: removed claims (anti-estresse, autorregulação sensorial, alívio do estresse, neurodivergentes, TEA, TDAH); rewrote 'Indicado Para' sem condições clínicas; updated alt= attributes; appended disclaimer",
            "seo description: removed 'Anti-estresse'",
            "alt attributes updated to new title",
        ],
        "manual_review_needed": False,
        "notes": "",
    },
    {
        "id_numeric": "9229814202530",
        "title_new": "Varinha Sensorial Espiral em Madeira - Brinquedo Visual Giratório",
        "handle_new": "varinha-sensorial-espiral-madeira-visual-giratorio",
        "description_html_new": '<h2>Varinha Sensorial Espiral em Madeira — Brinquedo Visual Giratório</h2><p>A <strong>Varinha Sensorial Espiral de Madeira Incluo</strong> é um brinquedo sensorial artesanal em madeira natural com design espiral em formato de pirulito. Quando girada, cria efeito visual hipnotizante — brinquedo + objeto decorativo.</p><h3>Características</h3><ul><li><strong>Efeito visual hipnotizante:</strong> espiral girando produz padrão calmante</li><li><strong>Madeira natural:</strong> acabamento artesanal com pigmentos atóxicos</li><li><strong>Função dupla:</strong> brinquedo manipulativo e item decorativo</li><li><strong>Variantes:</strong> Modelo A e Modelo B (designs distintos)</li></ul><h3>Indicado Para</h3><p>Crianças (6+ anos), adolescentes, adultos, fãs de brinquedos sensoriais visuais e quem busca um presente original.</p><h3>Cuidados</h3><p>Limpe com pano seco. Evite contato com água (pode danificar a madeira). Mantenha longe de calor extremo.</p>\n<hr><p><em>⚠ Aviso: Este produto é um brinquedo recreativo. Não é dispositivo médico, não trata, cura ou alivia condições de saúde, e não substitui acompanhamento profissional. Em caso de necessidade clínica, consulte um profissional de saúde qualificado.</em></p>',
        "seo_title_new": "Varinha Sensorial Espiral Madeira Visual | Incluo",
        "seo_description_new": "Varinha mágica giratória pirulito espiral em madeira. Brinquedo sensorial visual artesanal. Frete grátis Brasil + 5% Pix.",
        "changes_made": [
            "title: removed 'Anti-Estresse'",
            "handle: removed 'anti-estresse'",
            "description: removed claims (Anti-Estresse, alívio do estresse, descompressão mental, TEA, TDAH, ansiedade); rewrote 'Indicado Para' sem condições clínicas; appended disclaimer",
            "seo description: removed 'anti-estresse'",
        ],
        "manual_review_needed": False,
        "notes": "",
    },
]
# ====== END EDIT ======

pending = {p["id_numeric"]: p for p in json.loads(PENDING.read_text(encoding="utf-8"))}

FORBIDDEN = [
    "tdah", "tea", "adhd", "ocd", "autismo", "autista", "asperger", "neurodivergente", "neurodivergencia",
    "ansiedade", "depressao", "anti-depressao", "estresse cronico", "sobrecarga sensorial", "hipersensibilidade",
    "autorregulacao", "gerenciamento de sobrecarga", "integracao sensorial", "processamento sensorial",
    "regulacao emocional", "organizacao emocional",
    "anti-estresse", "antiestresse", "antistress", "anti-ansiedade",
    "terapeutico", "terapeutica", "conforto sensorial",
    "alivio de", "alivio do", "alivio da",
]
import unicodedata
def deaccent(s):
    return "".join(c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c))


def scan(text):
    if not text: return []
    low = deaccent(text).lower()
    return sorted(set(t for t in FORBIDDEN if t in low))


already_done = set()
for line in JSONL.read_text(encoding="utf-8").splitlines():
    if line.strip():
        already_done.add(json.loads(line)["id_gid"])

appended = 0
skipped = 0
errors = []
for r in REWRITES:
    src = pending.get(r["id_numeric"])
    if not src:
        errors.append(f"ID not in pending: {r['id_numeric']}")
        continue
    if src["id_gid"] in already_done:
        skipped += 1
        continue
    # validate handle
    h = r["handle_new"]
    if not re.match(r"^[a-z0-9-]+$", h) or "--" in h:
        errors.append(f"{r['id_numeric']}: invalid handle '{h}'")
        continue
    # validate URLs preserved
    old_urls = set(re.findall(r'(?:src|href)="([^"]+)"', src["descriptionHtml"]))
    new_urls = set(re.findall(r'(?:src|href)="([^"]+)"', r["description_html_new"]))
    if old_urls - new_urls:
        errors.append(f"{r['id_numeric']}: lost URLs {sorted(old_urls - new_urls)[:3]}")
        continue
    # scan residual
    desc_text = re.sub(r"<[^>]+>", " ", r["description_html_new"])
    desc_text = re.sub(r"brinquedo recreativo.*?profissional de sa[uú]de qualificado\.?", "", desc_text, flags=re.IGNORECASE)
    res = scan(r["title_new"] + " " + r["handle_new"] + " " + desc_text + " " + r["seo_title_new"] + " " + r["seo_description_new"])
    if res:
        errors.append(f"{r['id_numeric']}: RESIDUAL forbidden {res}")
        # still write but flag
        r["manual_review_needed"] = True
        r["notes"] = (r.get("notes") or "") + f" residual={res}"

    entry = {
        "id_gid": src["id_gid"],
        "id_numeric": r["id_numeric"],
        "title_old": src["title"],
        "title_new": r["title_new"],
        "handle_old": src["handle"],
        "handle_new": r["handle_new"],
        "description_html_old": src["descriptionHtml"],
        "description_html_new": r["description_html_new"],
        "seo_title_old": src["seo"]["title"],
        "seo_title_new": r["seo_title_new"],
        "seo_description_old": src["seo"]["description"],
        "seo_description_new": r["seo_description_new"],
        "changes_made": r["changes_made"],
        "manual_review_needed": r.get("manual_review_needed", False),
        "notes": r.get("notes", ""),
    }
    with JSONL.open("a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    appended += 1

print(f"appended={appended} skipped={skipped} errors={len(errors)}")
for e in errors:
    print(" -", e)
