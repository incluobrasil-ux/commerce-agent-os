# -*- coding: utf-8 -*-
"""Gera /glossario/ a partir de content/glossario.json.

Entra:
  content/glossario.json   -> grupos e verbetes
  content/keyword-map.json -> valida que a rota existe e esta registrada

Sai:
  build/pagina-glossario.html

Os 41 verbetes NAO viram pagina cada um: sao ancoras dentro de /glossario/.
Uma pagina por termo canibalizaria os guias - "taxa de administracao" ja e
/guia/taxa-de-administracao/. Verbete que colide com guia e curto e linka
o guia; verbete sem guia segura a intencao sozinho.
"""
import io, json, os, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(RAIZ, 'build')
URL = '/glossario/'

VERBETE = (
    '      <div class="verbete%(alerta)s" id="%(slug)s">\n'
    '        <h3>%(termo)s</h3>\n'
    '        <p>%(definicao)s</p>\n'
    '%(link)s'
    '      </div>')

LINK_GUIA = ('        <p class="verbete-guia">'
             '<a href="%s">Ver o guia completo</a></p>\n')

GRUPO = '''
<section class="sec%(alt)s">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">%(indice)s de %(total)s</p>
      <h2 id="%(id)s">%(nome)s</h2>
    </div>
    <div class="verbetes prosa">
%(verbetes)s
    </div>
  </div>
</section>'''

NAV = '      <a class="chip" href="#%s">%s</a>'

TPL = '''<!-- wp:html -->
<div class="mv-page">

<nav class="migalhas" aria-label="Você está aqui">
  <a href="/">Início</a>
  <span aria-hidden="true">/</span>
  <span aria-current="page">Glossário</span>
</nav>

<section class="hero chevrons">
  <div class="wrap stack prosa">
    <p class="eyebrow">Glossário</p>
    <h1>Glossário do consórcio</h1>

    <!-- ANSWER-FIRST: responde o H1 antes de qualquer contexto.
         E este paragrafo que motores generativos extraem e citam.
         Nao mover, nao enfeitar, nao colocar storytelling antes. -->
    <p class="resposta-curta">Este glossário reúne %(total_termos)d termos do consórcio explicados em linguagem simples: o que significam no contrato, quando aparecem e o que mudam para você. Estão organizados em %(total_grupos)d grupos — contrato, custos, crédito, situações do consorciado e regulatório.</p>

    <p class="lead">Contrato de consórcio é cheio de palavra que parece óbvia e não é. Fundo comum não é fundo de reserva; contemplação não é liberação de crédito. Confundir os dois muda a sua expectativa sobre quando o dinheiro chega.</p>

    <div class="chips" aria-label="Ir para um grupo de termos">
%(nav)s
    </div>
  </div>
</section>
%(grupos)s

<section class="sec sec--dark chevrons">
  <div class="wrap stack prosa">
    <h2>Ficou com dúvida em algum termo?</h2>
    <p class="lead">Um consultor explica o que aparece no seu contrato, sem pressa e sem compromisso. Se algo não estiver claro por escrito, não assine.</p>
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
    dados = carregar('glossario.json')
    mapa = carregar('keyword-map.json')
    rotas = {r['url']: r for r in mapa['rotas']}

    if URL not in rotas:
        print('[X] %s nao esta no keyword-map. Registre a rota antes de gerar.' % URL)
        return 1

    grupos = dados['grupos']
    termos = [t for g in grupos for t in g['termos']]

    # Um slug repetido vira ancora duplicada: dois #lance na mesma pagina,
    # e o navegador so acha o primeiro.
    slugs = [t['slug'] for t in termos]
    dup = sorted({s for s in slugs if slugs.count(s) > 1})
    if dup:
        print('[X] slug repetido em glossario.json: %s' % ', '.join(dup))
        return 1

    # Verbete que aponta para guia inexistente no mapa e link quebrado
    # esperando acontecer. Guia planejada pode: a rota existe, a pagina sai
    # depois. Rota que nem existe, nao.
    for t in termos:
        if 'guia' in t and t['guia'] not in rotas:
            print('[X] %s aponta para %s, que nao esta no keyword-map.'
                  % (t['termo'], t['guia']))
            return 1

    if not os.path.isdir(BUILD):
        os.makedirs(BUILD)

    blocos = []
    for i, g in enumerate(grupos):
        vs = []
        for t in g['termos']:
            link = LINK_GUIA % t['guia'] if t.get('guia') else ''
            # 'contemplacao garantida' nega o proprio termo: precisa ler
            # como aviso, e nao como definicao neutra ao lado das outras.
            alerta = ' verbete--alerta' if t.get('alerta') else ''
            vs.append(VERBETE % dict(t, link=link, alerta=alerta))
        blocos.append(GRUPO % dict(
            alt=' sec--alt' if i % 2 == 0 else '',
            indice=i + 1, total=len(grupos), id=g['id'], nome=g['nome'],
            verbetes='\n'.join(vs)))

    html = TPL % dict(
        total_termos=len(termos), total_grupos=len(grupos),
        nav='\n'.join(NAV % (g['id'], g['nome']) for g in grupos),
        grupos='\n'.join(blocos))

    destino = os.path.join(BUILD, 'pagina-glossario.html')
    io.open(destino, 'w', encoding='utf-8', newline=chr(10)).write(html)

    com_guia = sum(1 for t in termos if t.get('guia'))
    print('%s  %s  %d bytes' % (URL, rotas[URL]['status'], len(html)))
    print('%d verbetes em %d grupos, %d linkando guia'
          % (len(termos), len(grupos), com_guia))
    print('escrito em build/pagina-glossario.html')
    return 0


if __name__ == '__main__':
    sys.exit(main())
