# -*- coding: utf-8 -*-
"""Auditoria on-page das rotas no ar, contra o padrao do plano mestre.

Mede o HTML SERVIDO, e nao o arquivo em build/. E a unica forma de auditar
o que o usuario e o Googlebot realmente recebem: mu-plugin, tema e cache
entram no meio do caminho.

O que ele NAO faz: julgar qualidade de texto. Contagem de palavra e
presenca de bloco sao proxy de completude, nao de qualidade. A nota serve
para priorizar o que olhar, nao para decidir sozinha.

Uso:
    python scripts/auditar_onpage.py            # tudo
    python scripts/auditar_onpage.py hub        # so uma camada
"""
import io
import json
import os
import re
import sys
import unicodedata
from urllib.request import urlopen, Request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = 'https://moveconconsorcio.com'

# Minimo de palavras por camada, conforme o plano mestre.
MINIMO = {'hub': 1200, 'filha': 600, 'guia': 800, 'artigo': 800}

FONTES_PRIMARIAS = ('planalto.gov.br', 'bcb.gov.br', 'abac.org.br',
                    'gov.br', 'alphadministradora.com.br')


def baixar(url):
    req = Request(BASE + url, headers={'User-Agent': 'movecon-auditoria/1.0'})
    return urlopen(req, timeout=30).read().decode('utf-8', 'replace')


def corpo(html):
    """So o conteudo da pagina: fora head, nav, header, footer e script."""
    h = re.sub(r'(?is)<(script|style|head|nav|header|footer)[^>]*>.*?</\1>', ' ', html)
    return h


def texto(html):
    return ' '.join(re.sub(r'(?s)<[^>]+>', ' ', html).split())


def palavras(t):
    return len(t.split())


def norm(t):
    t = unicodedata.normalize('NFD', t.lower())
    return ''.join(c for c in t if unicodedata.category(c) != 'Mn')


def medir(rota, html):
    c = corpo(html)
    txt = texto(c)
    m = {}

    m['palavras'] = palavras(txt)

    h1 = re.search(r'(?is)<h1[^>]*>(.*?)</h1>', c)
    m['h1'] = texto(h1.group(1)) if h1 else ''
    kw = rota.get('keyword', '')
    m['h1_tem_keyword'] = norm(kw) in norm(m['h1']) if kw else False

    af = re.search(r'(?is)class="resposta-curta"[^>]*>(.*?)</p>', c)
    m['answer_first'] = palavras(texto(af.group(1))) if af else 0
    m['answer_first_ok'] = 0 < m['answer_first'] <= 55

    m['tabela'] = len(re.findall(r'(?i)<table', c))
    m['faq'] = len(re.findall(r'(?i)<details', c))

    hrefs = re.findall(r'href="(/[^"]*)"', c)
    pai = rota['url']
    m['links_filhas'] = len([h for h in hrefs
                             if h.startswith(pai) and h != pai])
    m['link_simulador'] = any(h.startswith('/simulador') for h in hrefs)
    m['link_guia'] = any(h.startswith('/guia/') for h in hrefs)
    m['link_glossario'] = any(h.startswith('/glossario') for h in hrefs)
    m['link_pai'] = rota.get('pai', '') in hrefs if rota.get('pai') else False

    n = norm(txt)
    m['compliance'] = ('alpha administradora de consorcio ltda' in n
                       and 'banco central' in n)
    m['cta_duplo'] = ('/contato/' in hrefs or 'wa.me' in c) and (
        m['link_simulador'] or '/contato/' in hrefs)

    externos = re.findall(r'href="(https?://[^"]+)"', c)
    m['fontes_primarias'] = sorted({f for f in FONTES_PRIMARIAS
                                    for e in externos if f in e})

    h2s = re.findall(r'(?is)<h2[^>]*>(.*?)</h2>', c)
    m['h2_total'] = len(h2s)
    m['h2_pergunta'] = len([h for h in h2s if '?' in texto(h)])

    m['data_visivel'] = bool(re.search(r'(?i)(publicado|atualizado|vigente)\s+em', txt))
    return m


def nota_hub(m):
    """0-10 contra o padrao 1.1 do plano. Cada criterio vale o que pesa."""
    n = 0.0
    n += 2.5 * min(1.0, m['palavras'] / MINIMO['hub'])   # extensao
    n += 1.5 if m['answer_first_ok'] else 0              # answer-first
    n += 1.0 if m['h1_tem_keyword'] else 0               # H1 = keyword
    n += 1.5 if m['tabela'] else 0                       # tabela real
    n += 1.5 * min(1.0, m['faq'] / 5.0)                  # 5-7 perguntas
    n += 0.5 if m['links_filhas'] else 0
    n += 0.5 if m['link_simulador'] else 0
    n += 0.5 if m['link_guia'] else 0
    n += 0.25 if m['link_glossario'] else 0
    n += 0.25 if m['compliance'] else 0
    return round(min(10.0, n), 1)


def gaps_hub(m):
    g = []
    if m['palavras'] < MINIMO['hub']:
        g.append('conteudo raso: %d palavras (minimo %d)'
                 % (m['palavras'], MINIMO['hub']))
    if not m['tabela']:
        g.append('sem tabela HTML - tabela e o que ganha featured snippet')
    if m['faq'] < 5:
        g.append('FAQ com %d pergunta(s), padrao pede 5-7' % m['faq'])
    if not m['answer_first_ok']:
        g.append('answer-first ausente ou fora de 1-55 palavras (%d)'
                 % m['answer_first'])
    if not m['h1_tem_keyword']:
        g.append('H1 nao contem a keyword do mapa')
    if not m['link_glossario']:
        g.append('nao linka nenhum termo do glossario')
    if not m['link_guia']:
        g.append('nao linka guia pilar')
    return g


def main():
    mapa = json.load(io.open(os.path.join(RAIZ, 'content', 'keyword-map.json'),
                             encoding='utf-8'))
    filtro = sys.argv[1] if len(sys.argv) > 1 else None
    rotas = [r for r in mapa['rotas']
             if r['status'] == 'no-ar' and r.get('indexavel')
             and (not filtro or r['camada'] == filtro)]

    saida = {}
    for r in rotas:
        try:
            saida[r['url']] = medir(r, baixar(r['url']))
            saida[r['url']]['camada'] = r['camada']
            saida[r['url']]['keyword'] = r.get('keyword', '')
            saida[r['url']]['pai'] = r.get('pai', '')
        except Exception as e:
            print('[X] %s: %s' % (r['url'], e))

    destino = os.path.join(RAIZ, 'build', 'auditoria.json')
    io.open(destino, 'w', encoding='utf-8', newline=chr(10)).write(
        json.dumps(saida, ensure_ascii=False, indent=1) + chr(10))

    print('%d rotas medidas -> build/auditoria.json' % len(saida))

    hubs = {u: m for u, m in saida.items() if m['camada'] == 'hub'}
    if hubs:
        print()
        print('%-34s %5s %5s %3s %3s %4s %s' %
              ('hub', 'nota', 'palav', 'tab', 'faq', 'filh', 'compliance'))
        for u, m in sorted(hubs.items(), key=lambda x: nota_hub(x[1])):
            print('%-34s %5.1f %5d %3d %3d %4d %s' %
                  (u, nota_hub(m), m['palavras'], m['tabela'], m['faq'],
                   m['links_filhas'], 'ok' if m['compliance'] else 'FALTA'))
    return 0


if __name__ == '__main__':
    sys.exit(main())
