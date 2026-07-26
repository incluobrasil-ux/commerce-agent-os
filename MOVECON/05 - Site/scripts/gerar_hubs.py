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
# Item de cobertura com descricao. O formato antigo (so o titulo) continua
# valendo: hub que ainda nao recebeu engorda passa string, e este passa lista.
ITEM_DESC = (
    '      <div class="card">' + chr(10) +
    '        <h3>%s</h3>' + chr(10) +
    '        <p>%s</p>' + chr(10) +
    '      </div>')
# Card de filha: o link envolve o card inteiro, entao a area de clique e a
# area visivel. O texto ancora e a keyword da filha, nao "saiba mais".
# Tabela comparativa do segmento. Tabela HTML de verdade, e nao imagem: e o
# formato que ganha featured snippet em consulta comparativa, e o unico que
# um leitor de tela consegue percorrer.
TABELA = """
<section class="sec">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">Comparativo</p>
      <h2>%(titulo)s</h2>
      <p>%(intro)s</p>
    </div>
    <div class="tabela-wrap">
      <table class="tabela">
        <thead>
          <tr><th scope="col">%(col0)s</th><th scope="col">%(col1)s</th><th scope="col">%(col2)s</th></tr>
        </thead>
        <tbody>
%(linhas)s
        </tbody>
      </table>
    </div>
    <p class="tabela-nota">%(nota)s</p>
  </div>
</section>"""

TABELA_LINHA = ('          <tr><th scope="row">%s</th><td>%s</td><td>%s</td></tr>')

# Bloco de compliance NO CORPO. O rodape global ja traz a atribuicao, mas
# rodape de site e descartado por quem extrai trecho - motor generativo
# recorta o conteudo da pagina. Sem isto, a pagina pode ser citada sem a
# informacao de quem administra os grupos.
COMPLIANCE = """
<section class="sec sec--alt">
  <div class="wrap stack prosa">
    <div class="nota">
      <p><strong>Quem administra os grupos.</strong> Os grupos de consórcio
      apresentados pela MOVECON são administrados pela Alpha Administradora de
      Consórcio Ltda., CNPJ 90.982.679/0001-54, administradora autorizada a
      funcionar pelo Banco Central do Brasil sob o certificado nº 03/100/213/88.
      A MOVECON é a plataforma que apresenta os grupos e acompanha o cliente.
      A contemplação ocorre por sorteio ou lance em assembleia: nenhuma data
      pode ser prometida.</p>
    </div>
  </div>
</section>"""

# Como funciona em 4 passos. A numeracao aqui NAO e decorativa: o
# consorcio e uma sequencia real, e trocar a ordem dos passos muda o que
# eles significam. So usar lista numerada quando a ordem carrega
# informacao - e neste bloco ela carrega.
PASSO = (
    '      <li class="passo">' + chr(10) +
    '        <h3>%s</h3>' + chr(10) +
    '        <p>%s</p>' + chr(10) +
    '      </li>')

PASSOS = (chr(10) +
  '<section class="sec">' + chr(10) +
  '  <div class="wrap stack-l">' + chr(10) +
  '    <div class="stack prosa">' + chr(10) +
  '      <p class="eyebrow">Passo a passo</p>' + chr(10) +
  '      <h2>%(titulo)s</h2>' + chr(10) +
  '    </div>' + chr(10) +
  '    <ol class="passos prosa">' + chr(10) +
  '%(itens)s' + chr(10) +
  '    </ol>' + chr(10) +
  '  </div>' + chr(10) +
  '</section>')

FILHA_CARD = ('      <a class="card card--link" href="%s">\n'
              '        <h3>%s</h3>\n'
              '        <p>%s</p>\n'
              '      </a>')
FILHAS_SEC = '''
<section class="sec">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">Por objetivo</p>
      <h2>Escolha o seu caso de %s</h2>
    </div>
    <div class="cards cards--3">
%s
    </div>
  </div>
</section>'''
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
%(cta_hero)s
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

%(tabela)s
%(passos)s
%(filhas)s

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

%(compliance)s

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

    # O FAQPage do hub sai daqui. Ver docstring de hub_faqmap.
    caminho_faq = os.path.join(RAIZ, 'content', 'faq-map.json')
    faq_map = {}
    if os.path.exists(caminho_faq):
        with io.open(caminho_faq, encoding='utf-8') as fh:
            faq_map = json.load(fh)

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

        # Links hub -> filha. Sem isso o silo nao existe: as filhas ficam
        # dependendo do menu-fallback do tema para serem alcancadas, o que
        # nao passa contexto nenhum. Sai do keyword-map para nao duplicar
        # fonte da verdade, e so entra filha que esta no ar.
        filhos = [r for r in mapa['rotas']
                  if r.get('pai') == url and r.get('camada') == 'filha'
                  and r.get('status') == 'no-ar']
        filhos.sort(key=lambda r: r['url'])
        if filhos:
            linhas = '\n'.join(
                FILHA_CARD % (r['url'], r['keyword'][0].upper() + r['keyword'][1:],
                              r['description'])
                for r in filhos)
            filhas_html = FILHAS_SEC % (s['nome'].lower(), linhas)
        else:
            filhas_html = ''

        # Tabela e compliance sao opcionais por hub: entram conforme cada
        # segmento recebe a engorda, sem quebrar os que ainda nao receberam.
        # CTA duplo do hero: simulador (frio) + consultor (quente).
        # O padrao 1.1 e o relatorio de concorrentes poem o simulador como
        # hub de conversao com o maior numero de links internos do site.
        # Hub sem rota propria de simulador cai no par antigo - nunca
        # inventar rota de simulador que nao existe.
        sim = s.get('simulador')
        if sim:
            cta_hero = (
                '      <a class="btn btn--cta" href="%s">'
                '%s</a>' % (sim, s.get('ctaSimulador', 'Simular minha parcela')) + chr(10) +
                '      <a class="btn btn--ghost" href="/contato/">'
                'Falar com um consultor</a>')
        else:
            cta_hero = (
                '      <a class="btn btn--cta" href="/contato/">'
                'Falar com um consultor</a>' + chr(10) +
                '      <a class="btn btn--ghost" '
                'href="/administrado-pela-alpha/">'
                'Quem administra os grupos</a>')

        # Bloco opcional, herdavel. Hub sem `passos` gera como antes.
        ps = s.get('passos')
        passos_html = '' if not ps else PASSOS % dict(
            titulo=ps['titulo'],
            itens=chr(10).join(PASSO % (a, b) for a, b in ps['itens']))

        tab = s.get('tabela')
        tabela_html = '' if not tab else TABELA % dict(
            tab,
            linhas=chr(10).join(TABELA_LINHA % (a, b, c)
                                for a, b, c in tab['linhas']))

        faq_map[url] = [[q, a] for q, a in s['faq']]

        html = TPL % dict(
            s,
            cta_hero=cta_hero,
            passos=passos_html,
            tabela=tabela_html,
            compliance=COMPLIANCE if s.get('compliance', True) else '',
            filhas=filhas_html,
            nome_low=s['nome'].lower(),
            porque='\n'.join(CARD % (t, d) for t, d in s['porque']),
            cobre=chr(10).join(
                (ITEM_DESC % (c[0], c[1])) if isinstance(c, list)
                else (ITEM % c) for c in s['cobre']),
            faq='\n'.join(FAQ % (' open' if i == 0 else '', q, a)
                          for i, (q, a) in enumerate(s['faq'])),
        )
        destino = os.path.join(BUILD, 'hub-%s.html' % s['slug'])
        io.open(destino, 'w', encoding='utf-8').write(html)
        saida.append((s['slug'], rota['status'], len(html), palavras))

    print('%-32s %-10s %8s %s' % ('slug', 'status', 'bytes', 'answer-first'))
    for slug, st, n, p in saida:
        print('%-32s %-10s %8d %d palavras' % (slug, st, n, p))
    io.open(caminho_faq, 'w', encoding='utf-8', newline=chr(10)).write(
        json.dumps(faq_map, ensure_ascii=False, indent=1) + chr(10))

    print('\n%d hub(s) gerados em build/' % len(saida))
    return 0


if __name__ == '__main__':
    sys.exit(main())
