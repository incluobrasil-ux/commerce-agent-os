# -*- coding: utf-8 -*-
"""Gera /guia/ - o indice dos guias.

A rota /guia/ existe no WordPress porque as 20 paginas sao filhas dela: sem
a pagina-pai publicada, o permalink /guia/<slug>/ nao se forma. Ela nasceu
como container vazio e o check_seo apontou como PAGINA FANTASMA - publicada
no WP e ausente do mapa.

Container vazio indexavel e pagina sem conteudo proprio. Em vez de esconder
com noindex, ela vira o que deveria ser desde o comeco: o indice navegavel
dos 20 guias, agrupados por intencao.

Os grupos saem do campo `eyebrow` de cada guia - a mesma etiqueta que
aparece na propria pagina. Sem lista duplicada para desatualizar.
"""
import glob
import io
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from compliance import COMPLIANCE  # noqa: E402

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(RAIZ, 'build')
URL = '/guia/'

CARD = ('      <a class="card card--link" href="/guia/%s/">\n'
        '        <h3>%s</h3>\n'
        '        <p>%s</p>\n'
        '      </a>')

GRUPO = '''
<section class="sec%(alt)s">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">%(nome)s</p>
      <h2>%(titulo)s</h2>
    </div>
    <div class="cards cards--3">
%(cards)s
    </div>
  </div>
</section>'''

# Titulo humano de cada grupo. Se um eyebrow novo aparecer e nao estiver
# aqui, o gerador para: melhor falhar do que publicar "Perfil" como titulo.
TITULOS = {
    'Fundamentos':      'Como o consórcio funciona',
    'Contemplação':     'Contemplação e lance',
    'Custos':           'Quanto custa de verdade',
    'Contrato':         'Contrato, direitos e saída',
    'Decisão':          'Vale a pena para você?',
    'Comparativo':      'Consórcio comparado a outras vias',
    'Planejamento':     'Planejamento de compra',
    'Pós-contemplação': 'Depois de ser contemplado',
    'Confiança':        'Segurança e verificação',
    'Anti-golpe':       'Como não cair em golpe',
    'Perfil':           'Para o seu perfil',
}

ORDEM = ['Fundamentos', 'Contemplação', 'Custos', 'Contrato', 'Decisão',
         'Comparativo', 'Planejamento', 'Pós-contemplação', 'Confiança',
         'Anti-golpe', 'Perfil']

TPL = '''<!-- wp:html -->
<div class="mv-page">

<nav class="migalhas" aria-label="Você está aqui">
  <a href="/">Início</a>
  <span aria-hidden="true">/</span>
  <span aria-current="page">Guias</span>
</nav>

<section class="hero chevrons">
  <div class="wrap stack prosa">
    <p class="eyebrow">Guias</p>
    <h1>Guias do consórcio</h1>

    <!-- ANSWER-FIRST: responde o H1 antes de qualquer contexto.
         E este paragrafo que motores generativos extraem e citam.
         Nao mover, nao enfeitar, nao colocar storytelling antes. -->
    <p class="resposta-curta">São %(total)d guias que explicam o consórcio do mecanismo ao contrato: como funciona, quanto custa, como funciona o lance, o que acontece se você desistir e como verificar se uma empresa é idônea. Cada um responde uma dúvida específica, sem rodeio.</p>

    <p class="lead">Nenhum deles promete data de contemplação, porque ninguém pode prometer. Onde a resposta honesta é "depende do contrato", está escrito "depende do contrato" — inclusive quando isso não ajuda a vender.</p>
  </div>
</section>
%(grupos)s

''' + COMPLIANCE + '''

<section class="sec sec--dark chevrons">
  <div class="wrap stack prosa">
    <h2>Ainda com dúvida?</h2>
    <p class="lead">Um consultor explica o que aparece no seu contrato, sem pressa e sem compromisso. Se algo não estiver claro por escrito, não assine.</p>
    <div class="botoes">
      <a class="btn btn--cta" href="/contato/">Falar com um consultor</a>
      <a class="btn btn--ghost" href="/perguntas/">Ver as perguntas frequentes</a>
    </div>
  </div>
</section>

</div>
<!-- /wp:html -->
'''


def carregar(caminho):
    with io.open(caminho, encoding='utf-8') as fh:
        return json.load(fh)


def main():
    mapa = carregar(os.path.join(RAIZ, 'content', 'keyword-map.json'))
    rotas = {r['url']: r for r in mapa['rotas']}

    if URL not in rotas:
        print('[X] %s nao esta no keyword-map. Registre a rota antes de gerar.' % URL)
        return 1

    guias = []
    for arq in sorted(glob.glob(os.path.join(RAIZ, 'content', 'guias-*.json'))):
        guias.extend(carregar(arq)['guias'])

    por_grupo = {}
    for g in guias:
        rota = rotas.get('/guia/%s/' % g['slug'])
        if not rota or rota['status'] != 'no-ar':
            continue
        if g['eyebrow'] not in TITULOS:
            print('[X] eyebrow "%s" sem titulo definido em TITULOS.' % g['eyebrow'])
            return 1
        por_grupo.setdefault(g['eyebrow'], []).append(g)

    if not por_grupo:
        print('[X] nenhum guia no ar. Nada a indexar.')
        return 1

    blocos = []
    n = 0
    for i, nome in enumerate([x for x in ORDEM if x in por_grupo]):
        itens = sorted(por_grupo[nome], key=lambda g: g['h1'])
        n += len(itens)
        cards = '\n'.join(
            CARD % (g['slug'], g['h1'], rotas['/guia/%s/' % g['slug']]['description'])
            for g in itens)
        blocos.append(GRUPO % dict(alt=' sec--alt' if i % 2 == 0 else '',
                                   nome=nome, titulo=TITULOS[nome], cards=cards))

    if not os.path.isdir(BUILD):
        os.makedirs(BUILD)

    html = TPL % dict(total=n, grupos='\n'.join(blocos))
    io.open(os.path.join(BUILD, 'pagina-guia-indice.html'), 'w',
            encoding='utf-8', newline=chr(10)).write(html)

    print('%s  %s  %d bytes' % (URL, rotas[URL]['status'], len(html)))
    print('%d guias em %d grupos' % (n, len(blocos)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
