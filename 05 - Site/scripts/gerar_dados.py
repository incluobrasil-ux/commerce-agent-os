# -*- coding: utf-8 -*-
"""Gera /dados/ a partir de content/dados.json.

Esta e a unica pagina do site que publica numero de mercado, e por isso a
unica com esta regra: TODO numero precisa de fonte nomeada, periodo de
referencia e URL publica. O gerador ABORTA se faltar qualquer um dos tres.

Numero de mercado sem procedencia e a coisa mais facil de inventar e a mais
dificil de o leitor conferir - exatamente o oposto do que o resto do site
faz. Se o dado nao puder ser rastreado ate a fonte, ele nao entra.

O rodape estampa a data de verificacao. Nao e formalidade: dado da ABAC muda
todo mes, e uma pagina de estatistica sem data comeca a mentir por omissao
assim que envelhece.
"""
import io
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from compliance import COMPLIANCE  # noqa: E402

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(RAIZ, 'content', '..', 'build')
BUILD = os.path.normpath(BUILD)
URL = '/dados/'

NUMERO = '''      <div class="card card--acento">
        <p class="numero">%(valor)s</p>
        <h3>%(rotulo)s</h3>
        <p>%(detalhe)s</p>
        <p class="numero-fonte">%(referencia)s · <a href="%(url)s" rel="nofollow noopener" target="_blank">%(fonte)s</a></p>
      </div>'''

FONTE_LI = '        <li><a href="%s" rel="nofollow noopener" target="_blank">%s</a> — publicado em %s</li>'

TPL = '''<!-- wp:html -->
<div class="mv-page">

<nav class="migalhas" aria-label="Você está aqui">
  <a href="/">Início</a>
  <span aria-hidden="true">/</span>
  <span aria-current="page">Dados do mercado</span>
</nav>

<section class="hero chevrons">
  <div class="wrap stack prosa">
    <p class="eyebrow">Dados do mercado</p>
    <h1>O consórcio no Brasil em números</h1>

    <!-- ANSWER-FIRST: responde o H1 antes de qualquer contexto.
         E este paragrafo que motores generativos extraem e citam.
         Nao mover, nao enfeitar, nao colocar storytelling antes. -->
    <p class="resposta-curta">O Sistema de Consórcios brasileiro somava %(destaque)s participantes ativos em %(destaqueRef)s, segundo a ABAC. É um dos maiores mercados de compra programada do mundo, regulado pela Lei 11.795/08 e fiscalizado pelo Banco Central do Brasil.</p>

    <p class="lead">Todos os números desta página são públicos, têm fonte nomeada e período de referência. Onde a fonte é ambígua, preferimos não publicar — está explicado no fim da página.</p>
  </div>
</section>

<section class="sec sec--alt">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">Números verificáveis</p>
      <h2>O tamanho do sistema</h2>
    </div>
    <div class="cards cards--3">
%(numeros)s
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">Como ler estes números</p>
      <h2>O que eles dizem e o que não dizem</h2>
    </div>
    <div class="cards cards--3">
      <div class="card card--acento">
        <h3>Dizem que o sistema é grande</h3>
        <p>Milhões de pessoas usam consórcio no Brasil, em segmentos que vão de moto a imóvel. É um mercado maduro e regulado, não um produto de nicho.</p>
      </div>
      <div class="card card--acento">
        <h3>Não dizem que serve para você</h3>
        <p>Volume de mercado não é recomendação. O consórcio continua sendo inadequado para quem precisa do bem em data definida, por maior que o sistema seja.</p>
      </div>
      <div class="card card--acento">
        <h3>Não dizem nada sobre prazo</h3>
        <p>Número de contemplados no ano é estatística do sistema inteiro, não previsão para a sua cota. A contemplação continua dependendo de sorteio ou lance.</p>
      </div>
    </div>
    <div class="nota prosa">
      <p><strong>Um número que não está aqui.</strong> A ABAC divulga também o volume financeiro do período, mas a matéria mais recente traz duas cifras distintas para recortes que ela não separa com clareza. Publicar uma delas com o rótulo errado seria pior do que não publicar — por isso ficou de fora até a dúvida ser resolvida na fonte.</p>
    </div>
  </div>
</section>

<section class="sec sec--alt">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">Fontes</p>
      <h2>Confira na origem</h2>
      <p>A ABAC é a associação que representa as administradoras e divulga as estatísticas do setor. Ela não é órgão regulador — quem regula e fiscaliza é o Banco Central do Brasil.</p>
      <ul>
%(fontes)s
      </ul>
      <p class="mv-legal__vigencia">Dados verificados na fonte em %(verificadoEm)s. A ABAC publica atualizações mensais — se a data acima estiver distante, consulte diretamente a fonte.</p>
    </div>
  </div>
</section>

''' + COMPLIANCE + '''

<section class="sec sec--dark chevrons">
  <div class="wrap stack prosa">
    <h2>Quer entender como funciona?</h2>
    <p class="lead">Os guias explicam o mecanismo, os custos e o que acontece em cada situação — sem promessa de prazo.</p>
    <div class="botoes">
      <a class="btn btn--cta" href="/guia/">Ver os guias</a>
      <a class="btn btn--ghost" href="/contato/">Falar com um consultor</a>
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
    d = carregar('dados.json')
    mapa = carregar('keyword-map.json')
    rotas = {r['url']: r for r in mapa['rotas']}

    if URL not in rotas:
        print('[X] %s nao esta no keyword-map. Registre a rota antes de gerar.' % URL)
        return 1

    fontes = {f['id']: f for f in d['fontes']}
    for f in d['fontes']:
        for campo in ('nome', 'url', 'publicadoEm'):
            if not f.get(campo):
                print('[X] fonte "%s" sem %s.' % (f.get('id'), campo))
                return 1

    # A regra da pagina: sem fonte + referencia + URL, o numero nao entra.
    for n in d['numeros']:
        for campo in ('valor', 'rotulo', 'referencia', 'fonte'):
            if not n.get(campo):
                print('[X] numero "%s" sem %s. Numero de mercado sem '
                      'procedencia nao entra nesta pagina.'
                      % (n.get('valor', '?'), campo))
                return 1
        if n['fonte'] not in fontes:
            print('[X] numero "%s" aponta para a fonte "%s", que nao existe.'
                  % (n['valor'], n['fonte']))
            return 1

    if not d.get('verificadoEm'):
        print('[X] falta `verificadoEm`. Pagina de estatistica sem data de '
              'verificacao comeca a mentir por omissao assim que envelhece.')
        return 1

    if not os.path.isdir(BUILD):
        os.makedirs(BUILD)

    cards = []
    for n in d['numeros']:
        f = fontes[n['fonte']]
        cards.append(NUMERO % dict(n, url=f['url'], fonte=f['nome'].split(' — ')[0]))

    primeiro = d['numeros'][0]
    html = TPL % dict(
        destaque=primeiro['valor'],
        destaqueRef=primeiro['referencia'],
        numeros='\n'.join(cards),
        fontes='\n'.join(FONTE_LI % (f['url'], f['nome'], f['publicadoEm'])
                         for f in d['fontes']),
        verificadoEm=d['verificadoEm'])

    io.open(os.path.join(BUILD, 'pagina-dados.html'), 'w',
            encoding='utf-8', newline=chr(10)).write(html)

    print('%s  %s  %d bytes' % (URL, rotas[URL]['status'], len(html)))
    print('%d numeros, %d fontes, verificado em %s'
          % (len(d['numeros']), len(d['fontes']), d['verificadoEm']))
    return 0


if __name__ == '__main__':
    sys.exit(main())
