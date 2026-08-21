# -*- coding: utf-8 -*-
"""Gera /consorcio-contemplado/ — hub com estrutura própria.

POR QUE ESTE HUB NÃO USA O MOLDE DOS OUTROS OITO

Os outros hubs vendem uma modalidade. Este não vende nada. Ele existe porque
"carta contemplada" é o cluster de maior volume do setor, dominado por
corretoras, e é onde o leitor chega com mais pressa e menos informação sobre
como a operação realmente funciona.

O molde padrão seria ativamente errado aqui:

  - a tabela "consórcio × financiamento" não faz sentido: quem busca isso já
    decidiu por consórcio;
  - os "4 passos" virariam um roteiro de COMO COMPRAR cota contemplada — e a
    MOVECON não comercializa cota contemplada. Publicar o roteiro seria vender
    o que não vendemos;
  - o CTA "Simular minha parcela" é dissonante numa página cuja função é
    desacelerar quem está com pressa.

No lugar deles: disclaimer acima da dobra, as três formas legítimas de chegar
a uma cota contemplada, como a transferência é formalizada e o caminho de
verificação.

O CTA fecha com a ponte honesta para a velocidade que este leitor procura:
contemplação garantida não existe à venda, mas o lance existe e é legítimo.

Reescrito em 20/08/2026 a pedido do cliente: a mesma informação de proteção
continua na página, em enquadramento positivo ("como a operação regular
funciona") em vez do enquadramento anterior, de alerta.

Conteúdo em content/contemplado.json. Saída em build/hub-consorcio-contemplado.html.
"""
import io
import json
import os
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(RAIZ, 'build')
URL = '/consorcio-contemplado/'

CARD = ('      <div class="card card--acento">\n'
        '        <h3>%s</h3>\n'
        '        <p>%s</p>\n'
        '      </div>')

PASSO = ('      <li class="passo">\n'
         '        <h3>%s</h3>\n'
         '        <p>%s</p>\n'
         '      </li>')

FILHA = ('      <a class="card card--link" href="%s">\n'
         '        <h3>%s</h3>\n'
         '        <p>%s</p>\n'
         '      </a>')

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
  </div>
</section>

<!-- DISCLAIMER ACIMA DA DOBRA, e nao no rodape. Quem chega aqui por
     "comprar carta contemplada" precisa ler isto antes de qualquer
     outra coisa - inclusive antes de decidir continuar na pagina. -->
<section class="sec">
  <div class="wrap stack prosa">
    <div class="destaque destaque--regulador">
      <h3>%(disclaimerTitulo)s</h3>
      <p>%(disclaimer)s</p>
    </div>
  </div>
</section>

<section class="sec sec--alt">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">O que é legítimo</p>
      <h2>%(formasTitulo)s</h2>
    </div>
    <ol class="passos prosa">
%(formas)s
    </ol>
  </div>
</section>

<section class="sec">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">Transferência de cota</p>
      <h2>%(legitimoTitulo)s</h2>
      <p>%(legitimoIntro)s</p>
    </div>
    <div class="cards cards--3">
%(legitimo)s
    </div>
  </div>
</section>

<section class="sec sec--alt">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">Antes de pagar</p>
      <h2>%(verificarTitulo)s</h2>
    </div>
    <ol class="passos prosa">
%(verificar)s
    </ol>
    <div class="nota prosa">
      <p>%(verificarNota)s</p>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">Por objetivo</p>
      <h2>%(filhasTitulo)s</h2>
    </div>
    <div class="cards cards--3">
%(filhas)s
    </div>
  </div>
</section>

<section class="sec sec--alt">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">Dúvidas frequentes</p>
      <h2>Sobre consórcio contemplado</h2>
    </div>
    <div class="faq prosa">
%(faq)s
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap stack prosa">
    <div class="nota">
      <p><strong>Quem administra os grupos.</strong> Os grupos de consórcio
      apresentados pela MOVECON são administrados pela Alpha Administradora de
      Consórcio Ltda., CNPJ 90.982.679/0001-54, administradora autorizada a
      funcionar pelo Banco Central do Brasil sob o certificado nº 03/100/213/88.
      A MOVECON é autorizada pela Alpha a apresentar esses grupos e acompanha o cliente.
      A contemplação ocorre por sorteio ou lance em assembleia: nenhuma data
      pode ser prometida.</p>
    </div>
  </div>
</section>

<section class="sec sec--dark chevrons">
  <div class="wrap stack prosa">
    <h2>%(ctaTitulo)s</h2>
    <p class="lead">%(ctaTexto)s</p>
    <div class="botoes">
      <a class="btn btn--cta" href="%(ctaRota)s">%(ctaLabel)s</a>
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
    c = carregar('contemplado.json')
    mapa = carregar('keyword-map.json')
    rotas = {r['url']: r for r in mapa['rotas']}

    if URL not in rotas:
        print('[X] %s nao esta no keyword-map.' % URL)
        return 1

    # A rota do CTA precisa existir. Se o guia for renomeado, o gerador para
    # em vez de publicar link quebrado.
    if c['ctaRota'] not in rotas:
        print('[X] ctaRota %s nao esta no keyword-map.' % c['ctaRota'])
        return 1

    palavras = len(c['respostaCurta'].split())
    if palavras > 55:
        print('[!] answer-first com %d palavras (limite 55)' % palavras)

    filhos = [r for r in mapa['rotas']
              if r.get('pai') == URL and r.get('camada') == 'filha'
              and r.get('status') == 'no-ar']
    filhos.sort(key=lambda r: r['url'])

    if not os.path.isdir(BUILD):
        os.makedirs(BUILD)

    html = TPL % dict(
        c,
        formas='\n'.join(PASSO % (a, b) for a, b in c['formas']),
        legitimo='\n'.join(CARD % (a, b) for a, b in c['legitimo']),
        verificar='\n'.join(PASSO % (a, b) for a, b in c['verificar']),
        filhas='\n'.join(
            FILHA % (r['url'], r['keyword'][0].upper() + r['keyword'][1:],
                     r['description']) for r in filhos),
        faq='\n'.join(FAQ % (' open' if i == 0 else '', q, a)
                      for i, (q, a) in enumerate(c['faq'])))

    io.open(os.path.join(BUILD, 'hub-consorcio-contemplado.html'), 'w',
            encoding='utf-8', newline=chr(10)).write(html)

    # A FAQ deste hub tambem alimenta o FAQPage do mu-plugin.
    caminho_faq = os.path.join(RAIZ, 'content', 'faq-map.json')
    faq_map = carregar('faq-map.json') if os.path.exists(caminho_faq) else {}
    faq_map[URL] = [[q, a] for q, a in c['faq']]
    io.open(caminho_faq, 'w', encoding='utf-8', newline=chr(10)).write(
        json.dumps(faq_map, ensure_ascii=False, indent=1) + chr(10))

    print('%s  %s  %d bytes' % (URL, rotas[URL]['status'], len(html)))
    print('%d formas · %d marcas de transferencia legitima · %d passos de '
          'verificacao · %d filhas · %d perguntas'
          % (len(c['formas']), len(c['legitimo']), len(c['verificar']),
             len(filhos), len(c['faq'])))
    print('CTA -> %s' % c['ctaRota'])
    return 0


if __name__ == '__main__':
    sys.exit(main())
