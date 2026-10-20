"""Eixo 10 — nomes de arquivo de imagem (sinais de IA)."""
import json, re, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
FILES = [
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781477145699.txt",
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781477158758.txt",
    r"C:\Users\samue\.claude\projects\C--projetos-incluo-commerce-agent-os\3241db6a-37b2-44d9-b03d-1e1693d01260\tool-results\mcp-claude_ai_Shopify-graphql_query-1781477167177.txt",
]
all_p=[]
for f in FILES: all_p.extend(json.load(open(f,encoding='utf-8'))['data']['products']['nodes'])

# Tells de IA
ia_patterns = {
    'whisk': r'whisk_',
    'chatgpt': r'chatgpt_image',
    'professional_studio': r'professional_studio_product_photography',
    'midjourney': r'midjourney',
    'dalle': r'dalle|dall-e|dall_e',
    'flux': r'flux_',
    'stable_diffusion': r'stable[_\-]?diffusion|sd[_\-]?xl',
    'leonardo': r'leonardo[_\-]?ai',
    'imagen': r'imagen[_\-]?\d',
    'gpt': r'gpt[_\-]?4',
    'firefly': r'firefly[_\-]?',
    'genai': r'(genai|gen_ai|generated)',
    'aigen': r'ai[_\-]?generated',
    'untitled': r'untitled[_\-]?\d*\.',
    'screenshot': r'screenshot[_\-]?\d',
    'image_n_n': r'^image[_\-]?\d+\.',  # nome muito genérico
}

ia_hits = []
total_imgs = 0
clean_imgs = 0
sample_urls = []
for p in all_p:
    h = p['handle']
    for m in p['media']['nodes']:
        if not m or not m.get('image'): continue
        url = m['image'].get('url') or ''
        total_imgs += 1
        # extract filename from URL (Shopify CDN)
        m_re = re.search(r'/files/([^?]+)', url)
        fname = m_re.group(1) if m_re else url.split('/')[-1].split('?')[0]
        fname_lower = fname.lower()
        ia_match = None
        for name, pat in ia_patterns.items():
            if re.search(pat, fname_lower):
                ia_match = name; break
        if ia_match:
            ia_hits.append((h, fname, ia_match))
        else:
            clean_imgs += 1
        if len(sample_urls)<20:
            sample_urls.append((h, fname))

print(f"# EIXO 10 — Imagens [LIVE]\nTotal produtos com mídia: {len(all_p)}")
print(f"Total imagens (MediaImage): {total_imgs}")
print(f"Imagens com filename LIMPO (sem tell de IA): {clean_imgs}")
print(f"Imagens com tell de IA no filename público: {len(ia_hits)}")
if ia_hits:
    print("\nLista de hits IA:")
    for h, f, k in ia_hits[:30]: print(f"- {h} | {k} | `{f}`")
print("\nAmostra dos 20 primeiros filenames públicos:")
for h, f in sample_urls: print(f"- {h} | `{f}`")
