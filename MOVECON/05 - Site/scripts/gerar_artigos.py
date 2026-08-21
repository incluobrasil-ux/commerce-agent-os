# -*- coding: utf-8 -*-
"""Converte content/artigos/*.md em blocos Gutenberg e escreve build/artigo-*.html.

Por que blocos Gutenberg e nao <!-- wp:html --> como o resto do site: o
restante das paginas e layout proprio, com classes do design system. Artigo
e texto corrido - vai ser editado no proprio WordPress depois, e travar isso
num bloco HTML unico tornaria qualquer correcao de virgula uma edicao de
codigo.

A tabela comparativa vira <!-- wp:table --> de verdade, nao imagem nem HTML
solto, para continuar legivel em leitor de tela e no mobile.

PENDENCIA CONHECIDA - a FAQ "Como me tornar representante da MOVECON?" fica
SEM LINK nos dois artigos. A pagina de recrutamento (Funil 01) nao existe no
site, e inventar URL seria pior que deixar sem. Registrado tambem em
`_pendencias` no keyword-map.json. Quando a pagina existir, o link entra no
markdown de origem e o artigo e regerado.

NAO ALTERA TEXTO. A unica transformacao e estrutural: markdown -> blocos.
Se este script comecar a "melhorar" redacao, ele quebrou o contrato de que
o conteudo foi revisado juridicamente e nao pode mudar sem aprovacao.
"""
import glob
import io
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from compliance import CTA_FINAL  # noqa: E402

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(RAIZ, 'build')
ARTIGOS = os.path.join(RAIZ, 'content', 'artigos')
# Autor unico do blog hoje. Quando houver mais de um, o slug passa a sair
# do front-matter de cada .md - nao de constante.
AUTOR_SLUG = 'samuel-tanan'


def inline(txt):
    """**negrito**, *italico* e [texto](url) -> HTML. Nada alem disso."""
    txt = txt.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    # Link externo leva rel="nofollow noopener" e abre em nova aba. Link
    # interno nao: nofollow no proprio site desperdicaria o silo. A regra e o
    # protocolo - href interno neste projeto e sempre relativo (/rota/).
    def _link(m):
        texto, url = m.group(1), m.group(2)
        if url.startswith('http'):
            return ('<a href="%s" rel="nofollow noopener" target="_blank">%s</a>'
                    % (url, texto))
        return '<a href="%s">%s</a>' % (url, texto)

    txt = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', _link, txt)
    txt = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', txt)
    txt = re.sub(r'(?<!\*)\*([^*]+?)\*(?!\*)', r'<em>\1</em>', txt)
    return txt


def tabela(linhas):
    """Tabela markdown -> wp:table. Primeira linha e cabecalho."""
    def celulas(l):
        return [c.strip() for c in l.strip().strip('|').split('|')]

    cab = celulas(linhas[0])
    corpo = [celulas(l) for l in linhas[2:]]  # linhas[1] e o separador

    out = ['<!-- wp:table {"className":"is-style-stripes"} -->',
           '<figure class="wp-block-table is-style-stripes"><table>',
           '<thead><tr>' +
           ''.join('<th>%s</th>' % inline(c) for c in cab) +
           '</tr></thead>', '<tbody>']
    for linha in corpo:
        out.append('<tr>' + ''.join('<td>%s</td>' % inline(c) for c in linha) + '</tr>')
    out += ['</tbody></table></figure>', '<!-- /wp:table -->']
    return '\n'.join(out)


def converter(md):
    blocos = []
    linhas = md.split('\n')
    i = 0
    h1 = None
    lista = []
    tipo_lista = None

    def fecha_lista():
        if not lista:
            return
        tag = 'ol' if tipo_lista == 'ol' else 'ul'
        attr = ' {"ordered":true}' if tipo_lista == 'ol' else ''
        blocos.append('<!-- wp:list%s -->\n<%s>%s</%s>\n<!-- /wp:list -->' % (
            attr, tag,
            ''.join('<!-- wp:list-item --><li>%s</li><!-- /wp:list-item -->' % x
                    for x in lista),
            tag))
        del lista[:]

    while i < len(linhas):
        l = linhas[i]
        s = l.strip()

        if not s:
            fecha_lista()
            i += 1
            continue

        # Separador horizontal: vira divisor
        if re.match(r'^-{3,}$', s):
            fecha_lista()
            blocos.append('<!-- wp:separator -->\n'
                          '<hr class="wp-block-separator has-alpha-channel-opacity"/>\n'
                          '<!-- /wp:separator -->')
            i += 1
            continue

        # Tabela
        if s.startswith('|'):
            fecha_lista()
            bloco = []
            while i < len(linhas) and linhas[i].strip().startswith('|'):
                bloco.append(linhas[i])
                i += 1
            blocos.append(tabela(bloco))
            continue

        # Citacao
        if s.startswith('>'):
            fecha_lista()
            partes = []
            while i < len(linhas) and linhas[i].strip().startswith('>'):
                partes.append(linhas[i].strip().lstrip('>').strip())
                i += 1
            blocos.append('<!-- wp:quote -->\n<blockquote class="wp-block-quote">'
                          '<!-- wp:paragraph --><p>%s</p><!-- /wp:paragraph -->'
                          '</blockquote>\n<!-- /wp:quote -->' % inline(' '.join(partes)))
            continue

        # Titulos
        m = re.match(r'^(#{1,6})\s+(.*)$', s)
        if m:
            fecha_lista()
            nivel = len(m.group(1))
            texto = m.group(2)
            if nivel == 1:
                # O H1 e o titulo do post. Nao entra no corpo, senao a
                # pagina fica com dois H1.
                h1 = texto
                i += 1
                continue
            blocos.append('<!-- wp:heading {"level":%d} -->\n<h%d>%s</h%d>\n'
                          '<!-- /wp:heading -->' % (nivel, nivel, inline(texto), nivel))
            i += 1
            continue

        # Lista ordenada
        m = re.match(r'^\d+\.\s+(.*)$', s)
        if m:
            if tipo_lista != 'ol':
                fecha_lista()
                tipo_lista = 'ol'
            lista.append(inline(m.group(1)))
            i += 1
            continue

        # Lista nao ordenada
        m = re.match(r'^[-*]\s+(.*)$', s)
        if m:
            if tipo_lista != 'ul':
                fecha_lista()
                tipo_lista = 'ul'
            lista.append(inline(m.group(1)))
            i += 1
            continue

        # Paragrafo
        fecha_lista()
        blocos.append('<!-- wp:paragraph -->\n<p>%s</p>\n<!-- /wp:paragraph -->'
                      % inline(s))
        i += 1

    fecha_lista()
    return h1, '\n\n'.join(blocos)


def main():
    pedidos = sys.argv[1:] or sorted(glob.glob(os.path.join(ARTIGOS, '*.md')))
    if not pedidos:
        print('nenhum content/artigos/*.md encontrado')
        return 1

    if not os.path.isdir(BUILD):
        os.makedirs(BUILD)

    for arq in pedidos:
        md = io.open(arq, encoding='utf-8').read()
        h1, html = converter(md)
        if not h1:
            print('[X] %s nao tem H1 (linha "# ...").' % arq)
            return 1
        slug = os.path.splitext(os.path.basename(arq))[0]

        # Caixa de autor no fim de todo artigo. Vem do build/ e nao de literal
        # aqui: nome, cargo e bio tem uma fonte so, content/autor.json. Se a
        # caixa nao existir, o artigo NAO e gerado - artigo sem autoria e
        # exatamente o que a regra da pauta proibe publicar.
        caixa = os.path.join(BUILD, 'caixa-autor-%s.html' % AUTOR_SLUG)
        if not os.path.isfile(caixa):
            print('[X] caixa de autor ausente: %s' % caixa)
            print('    rode scripts/gerar_autor.py antes.')
            return 1
        bloco_autor = io.open(caixa, encoding='utf-8').read().strip()
        html = html + '\n<!-- wp:html -->\n' + bloco_autor + '\n<!-- /wp:html -->'

        # Fecha o artigo com a mesma chamada do resto do site. Precisa do
        # wrapper .mv-page: dentro do Gutenberg nao existe outro, e sem ele
        # o h2 e os <p> do bloco caem no estilo do tema.
        html = (html + '\n<!-- wp:html -->\n<div class="mv-page">'
                + CTA_FINAL + '\n</div>\n<!-- /wp:html -->')

        destino = os.path.join(BUILD, 'artigo-%s.html' % slug)
        io.open(destino, 'w', encoding='utf-8', newline=chr(10)).write(html + '\n')

        n_bloco = html.count('<!-- wp:')
        n_tab = html.count('<!-- wp:table')
        n_h2 = html.count('<h2>')
        n_h3 = html.count('<h3>')
        print('%s' % slug)
        print('  H1: %s' % h1)
        print('  %d blocos · %d tabela(s) · %d H2 · %d H3 · %d bytes'
              % (n_bloco, n_tab, n_h2, n_h3, len(html)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
