"""Gera plano de substituição para os 16 produtos com marca vazada.
Lê dos dumps em snapshots/2026-06-14-pre-fix/ e salva mapping GID + new descriptionHtml + new detalhes_do_produto.
"""
import json, re, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

SNAP = r"C:\projetos-incluo\commerce-agent-os\07_memory\vault\AUDITORIA-GMC-2026\snapshots\2026-06-14-pre-fix"
FILES = [
    f"{SNAP}/mcp-claude_ai_Shopify-graphql_query-1781475107178.txt",
    f"{SNAP}/mcp-claude_ai_Shopify-graphql_query-1781475171491.txt",
    f"{SNAP}/mcp-claude_ai_Shopify-graphql_query-1781475181969.txt",
]

# 16 produtos identificados no Eixo 6
TARGETS = [
    ("tapete-puzzle-eva-infantil-30x30cm-macio-antiderrapante-isolante-termico", ["DHDH"], []),
    ("flashcards-educativos-bilingues-50-pecas", ["Lee's Sharing", "Lee’s Sharing"], []),
    ("busy-board-montessori-led-painel-interativo-interruptores-luzes", ["macroupta", "Macroupta", "MACROUPTA"], []),
    ("jogo-vestir-roupas-montessori-autonomia-habilidades", ["Small Fire Child"], []),
    ("quadro-rotina-recompensas-magnetico-organizacao", ["AtushiBalang", "Atushibalang"], []),
    ("quadro-rotina-visual-bilingue-organizacao-infantil", ["MY Kraft Paper", "My Kraft Paper"], ["01655–01663", "01655-01663"]),
    ("pulseiras-pop-it-fidget-silicone-kit-12-unidades", ["JK-ZMM", "JK ZMM"], []),
    ("protetor-auricular-infantil-reducao-ruido-25db-bebe", ["YHKEMA", "Yhkema"], []),
    ("abafador-ruido-infantil-unicornio-nrr25db", ["ZOHAN", "Zohan"], []),
    ("prancha-equilibrio-curva-vinil-antiderrapante", ["APWIKOGER", "Apwikoger"], []),
    ("colar-mastigavel-silicone-bpa-free", ["OOTDTY", "Ootdty"], ["B03A7HH101434"]),
    ("caderno-caligrafia-reutilizavel-escrita", ["Art Farmer"], []),
    ("jogo-classificacao-animais-montessori-sensorial-cores", ["Monster Carnival"], ["STF00028"]),
    ("quadro-magnetico-desenho-contas-abs-atoxico", ["DSUE", "Dsue"], ["MC6601"]),
    ("trem-magnetico-madeira-numeros-coloridos", ["Tlewj", "TLEWJ"], []),
    ("balanca-montessori-macacos-jogo-matematica", ["Small Fire Child"], []),
]

products = {}
for f in FILES:
    for p in json.load(open(f, encoding='utf-8'))['data']['products']['nodes']:
        products[p['handle']] = p

def normalize_marca_in_text(text, brands):
    """Substitui 'Marca: <X>' por 'Marca: Incluo', e frases tipo 'da marca X' por 'Incluo'."""
    out = text
    for b in brands:
        # Padrão 1: "Marca: <X>"
        out = re.sub(r'(Marca\s*:\s*)' + re.escape(b) + r'\b', r'\1Incluo', out, flags=re.IGNORECASE)
        # Padrão 2: "marca <X>" (sem dois-pontos) — em frase
        out = re.sub(r'\bda marca\s+' + re.escape(b) + r'\b', 'Incluo', out, flags=re.IGNORECASE)
        out = re.sub(r'\bdo fabricante\s+' + re.escape(b) + r'\b', 'da Incluo', out, flags=re.IGNORECASE)
        # Padrão 3: "<X>" como nome próprio isolado
        # Cuidado: só substituir se vier precedido por algo que sinalize fabricante
        # Para outros padrões: substituir aspas finais
        out = re.sub(r'(?<![A-Za-z])' + re.escape(b) + r'(?![A-Za-z])', 'Incluo', out)
    return out

def remove_models(text, models):
    """Remove modelos ASIN e similares + linhas inteiras 'Modelo: <X>'."""
    out = text
    for m in models:
        # 'Modelo: <X>' inteiro
        out = re.sub(r'\s*[•·\-]?\s*Modelo\s*:\s*' + re.escape(m) + r'\b\s*', ' ', out, flags=re.IGNORECASE)
        # ocorrência isolada
        out = re.sub(r'(?<![A-Za-z0-9])' + re.escape(m) + r'(?![A-Za-z0-9])', '', out)
    # Compactar espaços duplos
    out = re.sub(r'  +', ' ', out)
    return out

plan = {}
for handle, brands, models in TARGETS:
    p = products.get(handle)
    if not p:
        print(f"[MISS] {handle}")
        continue
    gid = p['id']
    desc = p.get('descriptionHtml') or ''
    detalhes = ''
    mf_to_update = None
    for mf in p['metafields']['nodes']:
        if mf.get('namespace') == 'custom' and mf.get('key') == 'detalhes_do_produto':
            detalhes = mf.get('value') or ''
            mf_to_update = mf
            break

    new_desc = normalize_marca_in_text(desc, brands)
    new_desc = remove_models(new_desc, models)
    new_det = normalize_marca_in_text(detalhes, brands) if detalhes else ''
    new_det = remove_models(new_det, models) if detalhes else ''

    # Verifica se sobrou marca residual
    leftover = []
    for b in brands:
        if b.lower() in new_desc.lower() or (new_det and b.lower() in new_det.lower()):
            leftover.append(b)
    for m in models:
        if m.lower() in new_desc.lower() or (new_det and m.lower() in new_det.lower()):
            leftover.append(m)

    plan[handle] = {
        'gid': gid,
        'desc_changed': new_desc != desc,
        'det_changed': new_det != detalhes,
        'has_metafield': mf_to_update is not None,
        'new_desc': new_desc,
        'new_det': new_det,
        'leftover': leftover,
    }
    print(f"{handle}")
    print(f"  GID: {gid}")
    print(f"  desc len: {len(desc)} -> {len(new_desc)}  changed={new_desc!=desc}")
    if detalhes:
        print(f"  det  len: {len(detalhes)} -> {len(new_det)}  changed={new_det!=detalhes}")
    if leftover:
        print(f"  ⚠ LEFTOVER: {leftover}")

with open(f"{SNAP}/lote4-plan.json", 'w', encoding='utf-8') as f:
    json.dump(plan, f, ensure_ascii=False)
print(f"\n✓ Plano salvo em lote4-plan.json")
print(f"Total produtos: {len(plan)}")
print(f"Com metafield custom.detalhes_do_produto: {sum(1 for v in plan.values() if v['has_metafield'])}")
print(f"Com leftover: {sum(1 for v in plan.values() if v['leftover'])}")
