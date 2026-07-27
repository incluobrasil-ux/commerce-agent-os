# -*- coding: utf-8 -*-
"""build/movecon-artigos.json — headline e FAQ de cada artigo, para o schema.

Extrai do PROPRIO markdown publicado, e nao de uma lista paralela. Assim o
FAQPage nao pode divergir do que a pagina mostra: sao a mesma fonte.

Divergencia entre schema e corpo visivel ja foi defeito aqui - um FAQPage
servia 3 perguntas enquanto a pagina exibia 6, porque o gerador do hub nunca
escrevia no faq-map. Marcacao que promete ao buscador o que o visitante nao
encontra e pior do que marcacao nenhuma.

Os dois comparativos NAO entram: eles tem ItemList nomeando concorrentes e
vivem no mapa fixo do plugin, onde a curadoria e humana.
"""
import glob
import io
import json
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(RAIZ)
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Curadoria humana, ItemList com concorrentes nomeados.
NO_MAPA_FIXO = {
    'melhores-parceiras-alpha-consorcios',
    'melhores-empresas-consorcio-2026',
}


def limpo(t):
    """Markdown inline -> texto puro. O schema quer texto, nao HTML."""
    t = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', t)
    t = re.sub(r'\*\*(.+?)\*\*', r'\1', t)
    t = re.sub(r'(?<!\*)\*([^*]+?)\*(?!\*)', r'\1', t)
    return ' '.join(t.split())


def extrair(md):
    linhas = md.split('\n')
    headline = None
    for l in linhas:
        m = re.match(r'^#\s+(.*)$', l.strip())
        if m:
            headline = limpo(m.group(1))
            break

    # FAQ: pares **pergunta?** seguidos do paragrafo de resposta, dentro da
    # secao "Perguntas frequentes". Fora dela nao se coleta nada - negrito no
    # meio do texto nao e pergunta.
    faq = []
    dentro = False
    pend = None
    for l in linhas:
        s = l.strip()
        if re.match(r'^##\s', s):
            dentro = 'perguntas frequentes' in s.lower()
            pend = None
            continue
        if not dentro or not s:
            continue
        if s.startswith('---'):
            break
        m = re.match(r'^\*\*(.+\?)\*\*$', s)
        if m:
            pend = limpo(m.group(1))
            continue
        if pend:
            faq.append([pend, limpo(s)])
            pend = None
    return headline, faq


def main():
    fichas = {}
    for arq in sorted(glob.glob('content/artigos/*.md')):
        slug = os.path.splitext(os.path.basename(arq))[0]
        if slug in NO_MAPA_FIXO:
            continue
        headline, faq = extrair(io.open(arq, encoding='utf-8').read())
        if not headline:
            print('[X] %s sem H1' % slug)
            return 1
        if not faq:
            print('[X] %s sem FAQ extraida - o artigo tem "## Perguntas '
                  'frequentes"?' % slug)
            return 1
        fichas['/blog/%s/' % slug] = {'headline': headline, 'faq': faq}
        print('  %-46s %d pergunta(s)' % (slug, len(faq)))

    if not os.path.isdir('build'):
        os.makedirs('build')
    io.open('build/movecon-artigos.json', 'w', encoding='utf-8',
            newline='\n').write(
        json.dumps(fichas, ensure_ascii=False, indent=1) + '\n')
    print()
    print('[OK] %d artigo(s) em build/movecon-artigos.json' % len(fichas))
    return 0


if __name__ == '__main__':
    sys.exit(main())
