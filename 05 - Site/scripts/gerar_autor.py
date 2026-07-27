# -*- coding: utf-8 -*-
"""Pagina de autor e caixa de autor, a partir de content/autor.json.

A ficha e fonte unica: a pagina, a caixa que vai no rodape de cada artigo e o
`author` do Article schema leem daqui. Assim nome e cargo nao divergem entre os
tres lugares, que e como esse tipo de dado costuma apodrecer.

TRAVA: se algum campo obrigatorio ainda estiver [PENDENTE], o gerador aborta com
exit 1 e NAO escreve nada. A regra permanente do gate proibe pagina publica com
placeholder renderizado, e caixa de autor entra em toda pagina de artigo - um
pendente aqui vazaria para o site inteiro de uma vez.
"""
import io
import json
import os
import re
import sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(BASE)
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SAIDA = 'build'


def esc(t):
    return (t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            .replace('"', '&quot;'))


def pendentes(a):
    """Campos obrigatorios ainda nao preenchidos."""
    faltam = []
    for campo in a['_obrigatorios']:
        v = a.get(campo, '')
        if not isinstance(v, str) or not v.strip():
            faltam.append((campo, '(vazio)'))
        elif re.search(r'\[PENDENTE', v) or re.search(r'\[COLAR|\[anexar', v, re.I):
            faltam.append((campo, v[:60]))
    return faltam


def foto_tag(a, classe, lado, lazy=True):
    """<img> da foto, ou string vazia enquanto ela nao existir.

    Campo vazio OMITE a tag inteira. Nunca renderizar src="" nem imagem
    generica: src vazio faz o navegador requisitar a propria pagina, e foto
    generica de pessoa e pior que foto nenhuma numa caixa que existe
    justamente para dizer quem assina.
    """
    src = (a.get('foto') or '').strip()
    if not src or src.startswith('['):
        return ''
    return ('<img class="%s" src="%s" alt="%s" width="%d" height="%d"%s>'
            % (classe, esc(src), esc(a['fotoAlt']), lado, lado,
               ' loading="lazy"' if lazy else ''))


def caixa(a):
    """Caixa de autor: vai no fim de cada artigo."""
    link = ''
    ext = a.get('linkExterno', '').strip()
    if ext and ext.lower() != 'nenhum' and not ext.startswith('['):
        link = ('<p class="autor-caixa__link">'
                '<a href="%s" rel="author noopener" target="_blank">Perfil'
                '</a></p>' % esc(ext))
    img = foto_tag(a, 'autor-caixa__foto', 96)
    return (
        '<aside class="autor-caixa%s">'
        '%s'
        '<div class="autor-caixa__texto">'
        '<p class="autor-caixa__rotulo">Escrito por</p>'
        '<p class="autor-caixa__nome">'
        '<a href="%s" rel="author">%s</a></p>'
        '<p class="autor-caixa__cargo">%s</p>'
        '<p class="autor-caixa__bio">%s</p>'
        '%s'
        '</div></aside>'
    ) % ('' if img else ' autor-caixa--sem-foto', img, esc(a['url']),
         esc(a['nome']), esc(a['cargo']), esc(a['bioCurta']), link)


def pagina(a):
    """Pagina de autor: bio longa, foto e link."""
    paras = ''.join('<p>%s</p>' % esc(p.strip())
                    for p in a['bioLonga'].split('\n\n') if p.strip())
    ext = a.get('linkExterno', '').strip()
    link = ''
    if ext and ext.lower() != 'nenhum' and not ext.startswith('['):
        link = ('<p class="autor-perfil__link">'
                '<a href="%s" rel="me noopener" target="_blank">'
                'Perfil externo</a></p>' % esc(ext))
    img = foto_tag(a, 'autor-perfil__foto', 160, lazy=False)
    return (
        '<div class="mv-page mv-autor">'
        '<header class="autor-perfil__topo%s">'
        '%s'
        '<div><h1>%s</h1><p class="autor-perfil__cargo">%s</p>%s</div>'
        '</header>'
        '<div class="autor-perfil__bio">%s</div>'
        '<section class="autor-perfil__artigos">'
        '<h2>Artigos de %s</h2>'
        '<p>Todos os textos publicados no '
        '<a href="/blog/">blog da MOVECON</a>.</p>'
        '</section>'
        '</div>'
    ) % ('' if img else ' autor-perfil__topo--sem-foto', img, esc(a['nome']),
         esc(a['cargo']), link, paras, esc(a['nome']))


def main():
    ficha = json.load(io.open('content/autor.json', encoding='utf-8'))
    bloqueado = False

    for a in ficha['autores']:
        faltam = pendentes(a)
        if faltam:
            bloqueado = True
            print('[X] %s: %d campo(s) obrigatorio(s) pendente(s)'
                  % (a['slug'], len(faltam)))
            for campo, valor in faltam:
                print('      %-10s %s' % (campo, valor))

    if bloqueado:
        print()
        print('    Nada foi gerado. A caixa de autor entra em TODA pagina de')
        print('    artigo - publicar com pendente vazaria o placeholder para o')
        print('    site inteiro de uma vez.')
        return 1

    if not os.path.isdir(SAIDA):
        os.makedirs(SAIDA)
    for a in ficha['autores']:
        io.open('%s/autor-%s.html' % (SAIDA, a['slug']), 'w',
                encoding='utf-8', newline='\n').write(pagina(a))
        io.open('%s/caixa-autor-%s.html' % (SAIDA, a['slug']), 'w',
                encoding='utf-8', newline='\n').write(caixa(a))
        print('[OK] %s: pagina e caixa gerados' % a['slug'])
    return 0


if __name__ == '__main__':
    sys.exit(main())
