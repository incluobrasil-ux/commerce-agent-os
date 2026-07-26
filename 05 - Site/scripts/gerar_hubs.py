# -*- coding: utf-8 -*-
"""
python scripts/gerar_hubs.py [slug ...]

Gera o HTML dos hubs de segmento a partir dos JSON. Nenhum conteudo hardcoded:
  content/keyword-map.json  -> url, title, description, keyword, status
  content/segmentos.json    -> respostaCurta (answer-first), copy, FAQ

Sem argumento, gera todos. Com slug(s), gera so os indicados.
Saida em build/hub-<slug>.html, pronta para `wp post create/update`.
"""
import io
import json
import os
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(RAIZ, 'build')

CARD = ('      <div class="card card--acento">\n'
        '        <h3>%s</h3>\n'
        '        <p>%s</p>\n'
        '      </div>')
ITEM = '      <div class="card"><h3>%s</h3></div>'
FAQ = ('      <details%s>\n'
       '        <summary>%s</summary>\n'
       '        <div class="resposta">%s</div>\n'
       '      </details>')

TPL = '''<!-- wp:html -->
<div class="mv-page">

<section class="hero chevrons">
  <div class="wrap stack prosa">
    <p class="eyebrow">%(eyebrow)s</p>
    <h1>%(h1)s</h1>

    <!-- ANSWER-FIRST: responde o H1 antes de qualquer contexto.
         E este paragrafo que motores generativos extraem e citam.
         Nao mover, nao enfeitar, nao colocar storytelling antes. -->
    <p class="resposta-curta">%(respostaCurta)s</p>

    <p class="lead">%(lead)s</p>
    <div class="botoes">
      <a class="btn btn--cta" href="/contato/">Falar com um consultor</a>
      <a class="btn btn--ghost" href="/administrado-pela-alpha/">Quem administra os grupos</a>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">Vantagens</p>
      <h2>%(porque_titulo)s</h2>
    </div>
    <div class="cards cards--3">
%(porque)s
    </div>
  </div>
</section>

<section class="sec sec--alt">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">Cobertura</p>
      <h2>%(cobre_titulo)s</h2>
    </div>
    <div class="cards cards--3">
%(cobre)s
    </div>
    <div class="nota prosa">
      <p><strong>Sem juros — mas com custo.</strong> Você paga taxa de administração e, quando previsto em contrato, fundo de reserva. Os dois são informados antes da adesão. E a contemplação ocorre por sorteio ou lance: ninguém pode prometer data.</p>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">Dúvidas frequentes</p>
      <h2>Perguntas sobre %(nome_low)s</h2>
    </div>
    <div class="faq prosa">
%(faq)s
    </div>
  </div>
</section>

<section class="sec sec--dark chevrons">
  <div class="wrap stack prosa">
    <h2>Vamos conversar sobre o seu objetivo?</h2>
    <p class="lead">Sem pressa e sem compromisso. Um consultor apresenta os grupos disponíveis, explica os custos por escrito e responde o que você precisar.</p>
    <div class="botoes">
      <a class="btn btn--cta" href="/contato/">Falar com um consultor</a>
      <a class="btn btn--ghost" href="/administrado-pela-alpha/">Quem administra os grupos</a>
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
    segs = carregar('segmentos.json')['segmentos']
    rotas = {r['url']: r for r in mapa['rotas']}

    pedidos = [a for a in sys.argv[1:] if not a.startswith('-')]
    if pedidos:
        segs = [s for s in segs if s['slug'] in pedidos]
        if not segs:
            print('nenhum segmento com esse slug'); return 1

    if not os.path.isdir(BUILD):
        os.makedirs(BUILD)

    saida = []
    for s in segs:
        url = '/%s/' % s['slug']
        rota = rotas.get(url)
        if not rota:
            print('[X] %s nao esta no keyword-map. Registre a rota antes de gerar.' % url)
            return 1

        # answer-first tem limite: e citacao, nao paragrafo de abertura
        palavras = len(s['respostaCurta'].split())
        if palavras > 60:
            print('[!] %s: respostaCurta com %d palavras (alvo max. ~55)' % (url, palavras))

        html = TPL % dict(
            s,
            nome_low=s['nome'].lower(),
            porque='\n'.join(CARD % (t, d) for t, d in s['porque']),
            cobre='\n'.join(ITEM % c for c in s['cobre']),
            faq='\n'.join(FAQ % (' open' if i == 0 else '', q, a)
                          for i, (q, a) in enumerate(s['faq'])),
        )
        destino = os.path.join(BUILD, 'hub-%s.html' % s['slug'])
        io.open(destino, 'w', encoding='utf-8').write(html)
        saida.append((s['slug'], rota['status'], len(html), palavras))

    print('%-32s %-10s %8s %s' % ('slug', 'status', 'bytes', 'answer-first'))
    for slug, st, n, p in saida:
        print('%-32s %-10s %8d %d palavras' % (slug, st, n, p))
    print('\n%d hub(s) gerados em build/' % len(saida))
    return 0


if __name__ == '__main__':
    sys.exit(main())
