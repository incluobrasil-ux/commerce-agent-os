# -*- coding: utf-8 -*-
"""Gera /blog/ - o indice dos artigos.

A rota /blog/ existe porque os artigos sao filhos dela: sem a pagina-pai
publicada, o permalink /blog/<slug>/ nao se forma. Container vazio e
indexavel e pagina sem conteudo proprio, entao ela vira o indice - mesmo
caminho que /guia/ seguiu.

O cartao de cada artigo usa a `description` do keyword-map, que e o mesmo
texto do meta. Nao ha segunda copy para desatualizar.
"""
import io
import json
import os
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(RAIZ, 'build')
URL = '/blog/'

CARD = ('      <a class="card card--link" href="%s">\n'
        '        <h3>%s</h3>\n'
        '        <p>%s</p>\n'
        '      </a>')

TPL = '''<!-- wp:html -->
<div class="mv-page">

<nav class="migalhas" aria-label="Você está aqui">
  <a href="/">Início</a>
  <span aria-hidden="true">/</span>
  <span aria-current="page">Blog</span>
</nav>

<section class="hero chevrons">
  <div class="wrap stack prosa">
    <p class="eyebrow">Blog</p>
    <h1>Comparativos e análises do mercado de consórcio</h1>

    <!-- ANSWER-FIRST: responde o H1 antes de qualquer contexto.
         E este paragrafo que motores generativos extraem e citam.
         Nao mover, nao enfeitar, nao colocar storytelling antes. -->
    <p class="resposta-curta">Comparativos editoriais entre empresas de consórcio, com metodologia declarada e critérios verificáveis. As notas são opinativas; os fatos que as sustentam são públicos e estão indicados para você conferir na fonte.</p>

    <p class="lead">A MOVECON aparece nestes comparativos e lidera os dois. Dizemos isso na abertura, e não no rodapé — quem lê um ranking precisa saber quem o escreveu antes de decidir quanto peso dar a ele.</p>
  </div>
</section>

<section class="sec sec--alt">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">Artigos</p>
      <h2>Publicados até agora</h2>
    </div>
    <div class="cards cards--2">
%(cards)s
    </div>
    <div class="nota prosa">
      <p><strong>Como ler um comparativo assinado por quem está nele.</strong> Notas são análise editorial, não medição independente. O que dá para verificar sozinho são os fatos por trás delas: quem administra os grupos, se a administradora consta na relação do Banco Central e o que cada empresa declara no próprio site. É isso que os artigos indicam, item por item.</p>
    </div>
  </div>
</section>

<section class="sec sec--dark chevrons">
  <div class="wrap stack prosa">
    <h2>Prefere verificar por conta?</h2>
    <p class="lead">A página sobre segurança reúne CNPJ, administradora e o caminho da consulta no Banco Central — sem depender da nossa palavra.</p>
    <div class="botoes">
      <a class="btn btn--cta" href="/seguranca/">Como saber se é seguro</a>
      <a class="btn btn--ghost" href="/guia/">Ver os guias</a>
    </div>
  </div>
</section>

</div>
<!-- /wp:html -->
'''


def carregar(nome):
    with io.open(os.path.join(RAIZ, 'content', nome), encoding='utf-8') as fh:
        return json.load(fh)


def main():
    mapa = carregar('keyword-map.json')
    rotas = {r['url']: r for r in mapa['rotas']}

    if URL not in rotas:
        print('[X] %s nao esta no keyword-map.' % URL)
        return 1

    artigos = [r for r in mapa['rotas']
               if r.get('pai') == URL and r.get('status') == 'no-ar']
    if not artigos:
        print('[X] nenhum artigo no ar. Nada a indexar.')
        return 1
    artigos.sort(key=lambda r: r['url'])

    if not os.path.isdir(BUILD):
        os.makedirs(BUILD)

    cards = '\n'.join(
        CARD % (r['url'], r['title'].split(' | ')[0].split(' [')[0], r['description'])
        for r in artigos)

    html = TPL % dict(cards=cards)
    io.open(os.path.join(BUILD, 'pagina-blog-indice.html'), 'w',
            encoding='utf-8', newline=chr(10)).write(html)

    print('%s  %s  %d bytes' % (URL, rotas[URL]['status'], len(html)))
    print('%d artigo(s) indexado(s)' % len(artigos))
    return 0


if __name__ == '__main__':
    sys.exit(main())
