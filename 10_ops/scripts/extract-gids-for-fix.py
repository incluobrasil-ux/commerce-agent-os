"""Extrai GIDs e bodies dos produtos a corrigir nos lotes."""
import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

FILES_DESC = [
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781475107178.txt",
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781475171491.txt",
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781475181969.txt",
]
products = {}
for f in FILES_DESC:
    for p in json.load(open(f,encoding='utf-8'))['data']['products']['nodes']:
        products[p['handle']] = p

# Lote 1A — 6 titles Kit Leve
KIT_LEVE = [
    ('cubo-fidget-magnetico-botoes-clique', 'Cubo Fidget Magnético com Botões de Clique - Incluo'),
    ('fidget-slider-coruja-metal-premium-16-imas', 'Fidget Slider Coruja Metal Premium 16 Ímãs - Incluo'),
    ('fidget-hexagono-girando-estimulo-visual-tatil', 'Fidget Hexágono Girando 8,7cm - Incluo'),
    ('brinquedo-estrela-mar-articulada-3d-decoracao', 'Estrela-do-Mar Articulada 3D Fidget - Incluo'),
    ('bola-sensorial-engrenagem-3d-fidget-giratoria', 'Bola Sensorial de Engrenagem 3D - Fidget Esfera Giratória - Incluo'),
    ('bola-giroscopio-3d-universal-foco-rotacao-gravidade', 'Bola Giroscópio 3D Universal Rotação por Gravidade - Incluo'),
]
print("# LOTE 1A — T6-003 — Drop 'Kit Leve 2 Pague 1 |' (6 produtos)")
for h, new_title in KIT_LEVE:
    p = products[h]
    print(f"\n## {h}")
    print(f"GID: {p['id']}")
    print(f"TITLE ATUAL: {p['title']}")
    print(f"TITLE NOVO:  {new_title}")

# Lote 1B — 9 produtos com tag 'bolas sensoriais e stress balls'
STRESS = [
    'kit-6-bolas-sensoriais-texturizadas-tpu-mordedor-chocalho-bebes',
    'bolas-magneticas-fidget-silicone-4-texturas',
    'squishy-mochi-morango-slow-rising',
    'bola-sensorial-gel-texturizada-squeeze-macio',
    'bola-apertar-expressoes-faciais-borracha',
    'bola-sensorial-3-em-1-mordedor-chocalho-desenvolvimento',
    'kit-bolas-sensoriais-kawaii-squishy-slow-rising',
    'rolo-sensorial-agua-squeeze-verao-hidratante',
    'bola-sensorial-engrenagem-3d-fidget-giratoria',
]
print("\n\n# LOTE 1B — T1-002 — Remover tag 'bolas sensoriais e stress balls' (9 produtos)")
for h in STRESS:
    p = products[h]
    new_tags = [t for t in p['tags'] if t.lower() != 'bolas sensoriais e stress balls']
    has_target = any(t.lower()=='bolas sensoriais e stress balls' for t in p['tags'])
    print(f"\n## {h}")
    print(f"GID: {p['id']}")
    print(f"TAGS ATUAIS ({len(p['tags'])}): {p['tags']}")
    print(f"NOVAS  TAGS ({len(new_tags)}): {new_tags}")
    print(f"REMOVIDO: {'sim' if has_target else 'NÃO ENCONTROU (verificar)'}")

# Lote 1C — agitacao em 2 desc
print("\n\n# LOTE 1C — T1-003 — Reescrever 'agitacao' (2 produtos)")
AGITACAO = {
    'bolas-magneticas-fidget-silicone-4-texturas': [
        ('agitacao das maos', 'movimento das mãos'),
        ('agitação das mãos', 'movimento das mãos'),
    ],
    'bola-apertar-expressoes-faciais-borracha': [
        ('situacoes de agitacao ou ambientes movimentados', 'ambientes movimentados ou que pedem foco'),
        ('situações de agitação ou ambientes movimentados', 'ambientes movimentados ou que pedem foco'),
    ],
}
for h, repls in AGITACAO.items():
    p = products[h]
    desc = p['descriptionHtml']
    new_desc = desc
    for old, new in repls:
        if old in new_desc:
            new_desc = new_desc.replace(old, new)
    print(f"\n## {h}")
    print(f"GID: {p['id']}")
    print(f"Substituições aplicadas: {sum(1 for o,_ in repls if o in desc)}")
    print(f"NEW_DESC LEN: {len(new_desc)} (era {len(desc)})")
    print(f"Contém 'agitacao' antes: {'agitacao' in desc.lower()}")
    print(f"Contém 'agitacao' depois: {'agitacao' in new_desc.lower()}")
    print(f"---NEW_DESC_SNIPPET (200ch):---")
    # find region around old word in new
    for old,new in repls:
        idx = new_desc.find(new)
        if idx>=0:
            print(new_desc[max(0,idx-30):idx+len(new)+60])
            break

# Lote 1D — penico
print("\n\n# LOTE 1D — T9-002 — Reescrever 'últimas unidades' no penico")
h = 'penico-portatil-3-em-1-dobravel'
p = products[h]
desc = p['descriptionHtml']
# substituir "⚡ últimas unidades – 3 cores disponíveis!" por "🎨 3 cores disponíveis – escolha a sua preferida."
candidates = [
    '⚡ <strong>últimas unidades – 3 cores disponíveis!</strong>',
    '⚡ <strong>ultimas unidades – 3 cores disponiveis!</strong>',
    '⚡ últimas unidades – 3 cores disponíveis!',
    '⚡ ultimas unidades – 3 cores disponiveis!',
    'últimas unidades – 3 cores disponíveis',
    'ultimas unidades – 3 cores disponiveis',
]
new_desc = desc
replaced = False
for cand in candidates:
    if cand in new_desc:
        new_desc = new_desc.replace(cand, '🎨 <strong>3 cores disponíveis</strong> – escolha a sua preferida.' if '<strong>' in cand else '🎨 3 cores disponíveis – escolha a sua preferida.')
        replaced = True
        print(f"Match em: {cand!r}")
print(f"## {h}")
print(f"GID: {p['id']}")
print(f"Replaced: {replaced}")
print(f"Contém 'últimas unidades' depois: {'últimas unidades' in new_desc.lower() or 'ultimas unidades' in new_desc.lower()}")
# Salvar new desc para uso
with open(r"C:\projetos-incluo\commerce-agent-os\07_memory\vault\AUDITORIA-GMC-2026\snapshots\2026-06-14-pre-fix\penico-new-desc.html","w",encoding='utf-8') as fh:
    fh.write(new_desc)
print(f"new_desc salvo")
