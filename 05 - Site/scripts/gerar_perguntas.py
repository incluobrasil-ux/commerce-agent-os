# -*- coding: utf-8 -*-
"""Gera /perguntas/ a partir de content/perguntas.json + content/faq-map.json.

A pagina tem duas partes, e a distincao entre elas e o ponto do desenho:

  1. PERGUNTAS TRANSVERSAIS - escritas em perguntas.json. Valem para
     consorcio inteiro e nao pertencem a nenhum silo. Sao conteudo novo
     e entram no schema FAQPage desta rota.

  2. INDICE DAS JA RESPONDIDAS - montado do faq-map.json. Lista o TEXTO
     das perguntas que ja vivem nas paginas de silo e linka para elas.
     NAO repete a resposta: isso e navegacao, nao conteudo.

Despejar as 110 respostas aqui duplicaria conteudo que ja existe em
outras 36 URLs do proprio site, e faria o FAQPage sair duas vezes para
o mesmo par pergunta/resposta. Por isso o gerador ABORTA se uma pergunta
transversal colidir com uma ja existente no faq-map.
"""
import io, json, os, re, sys, unicodedata

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(RAIZ, 'build')
URL = '/perguntas/'


def normalizar(txt):
    """Minusculas, sem acento, sem pontuacao - para comparar perguntas."""
    t = unicodedata.normalize('NFD', txt.lower())
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9 ]', '', t).strip()


FAQ = ('      <details%s>\n'
       '        <summary>%s</summary>\n'
       '        <p>%s</p>\n'
       '      </details>')

ITEM_INDICE = '        <li><a href="%s">%s</a></li>'

BLOCO_INDICE = '''      <div class="indice-grupo">
        <h3><a href="%s">%s</a></h3>
        <ul>
%s
        </ul>
      </div>'''

TPL = '''<!-- wp:html -->
<div class="mv-page">

<nav class="migalhas" aria-label="Você está aqui">
  <a href="/">Início</a>
  <span aria-hidden="true">/</span>
  <span aria-current="page">Perguntas frequentes</span>
</nav>

<section class="hero chevrons">
  <div class="wrap stack prosa">
    <p class="eyebrow">Perguntas frequentes</p>
    <h1>Perguntas frequentes sobre consórcio</h1>

    <!-- ANSWER-FIRST: responde o H1 antes de qualquer contexto.
         E este paragrafo que motores generativos extraem e citam.
         Nao mover, nao enfeitar, nao colocar storytelling antes. -->
    <p class="resposta-curta">As %(n_gerais)d dúvidas que valem para qualquer consórcio, respondidas de forma direta: prazo de contemplação, custo real, o que acontece se você não puder pagar e como verificar se uma empresa é idônea. Abaixo, um índice de %(n_indice)d perguntas específicas por tipo de bem.</p>

    <p class="lead">Nenhuma resposta aqui promete data de contemplação, porque ninguém pode prometer. Onde a resposta honesta é "depende do contrato", está escrito "depende do contrato".</p>
  </div>
</section>

<section class="sec sec--alt">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">Vale para qualquer consórcio</p>
      <h2>As dúvidas mais comuns</h2>
    </div>
    <div class="faq prosa">
%(faq)s
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">Por tipo de bem</p>
      <h2>Perguntas específicas, respondidas na página de cada tema</h2>
      <p>Estas %(n_indice)d perguntas são respondidas onde elas fazem sentido — na página do bem a que se referem, junto do contexto que a resposta exige.</p>
    </div>
    <div class="indice">
%(indice)s
    </div>
  </div>
</section>

<section class="sec sec--dark chevrons">
  <div class="wrap stack prosa">
    <h2>Sua dúvida não está aqui?</h2>
    <p class="lead">Um consultor responde o que você precisar, sem pressa e sem compromisso. Se algo não estiver claro por escrito, não assine.</p>
    <div class="botoes">
      <a class="btn btn--cta" href="/contato/">Falar com um consultor</a>
      <a class="btn btn--ghost" href="/glossario/">Ver o glossário</a>
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
    dados = carregar(os.path.join(RAIZ, 'content', 'perguntas.json'))
    caminho_faq = os.path.join(RAIZ, 'content', 'faq-map.json')
    faq_map = carregar(caminho_faq)
    mapa = carregar(os.path.join(RAIZ, 'content', 'keyword-map.json'))
    rotas = {r['url']: r for r in mapa['rotas']}

    if URL not in rotas:
        print('[X] %s nao esta no keyword-map. Registre a rota antes de gerar.' % URL)
        return 1

    gerais = dados['perguntas']

    # Colisao com pergunta ja respondida em silo = duplicacao interna e
    # FAQPage duplicado para o mesmo par. Aborta.
    ja_existe = {}
    for url, pares in faq_map.items():
        if url == URL:
            continue
        for q, _ in pares:
            ja_existe.setdefault(normalizar(q), url)

    for p in gerais:
        chave = normalizar(p['pergunta'])
        if chave in ja_existe:
            print('[X] "%s" ja e respondida em %s.' % (p['pergunta'], ja_existe[chave]))
            print('    Duas URLs com o mesmo par P/R e duplicacao interna.')
            return 1

    # Indice: so rota que esta no ar. Linkar para pagina nao publicada
    # produz 404 no proprio site.
    grupos = []
    n_indice = 0
    for url in sorted(faq_map):
        if url == URL:
            continue
        rota = rotas.get(url)
        if not rota or rota['status'] != 'no-ar':
            continue
        # Sem fragmento: as paginas de silo nao tem id="faq" na secao de
        # duvidas. Linkar para #faq levaria ao topo do mesmo jeito, mas a
        # ancora seria mentira. Quando as 45 paginas forem regeneradas com
        # o id, da para voltar a apontar direto para a resposta.
        itens = [ITEM_INDICE % (url, q) for q, _ in faq_map[url]]
        n_indice += len(itens)
        titulo = rota['keyword'][0].upper() + rota['keyword'][1:]
        grupos.append(BLOCO_INDICE % (url, titulo, '\n'.join(itens)))

    if not os.path.isdir(BUILD):
        os.makedirs(BUILD)

    html = TPL % dict(
        n_gerais=len(gerais), n_indice=n_indice,
        faq='\n'.join(FAQ % (' open' if i == 0 else '', p['pergunta'], p['resposta'])
                      for i, p in enumerate(gerais)),
        indice='\n'.join(grupos))

    io.open(os.path.join(BUILD, 'pagina-perguntas.html'), 'w',
            encoding='utf-8', newline=chr(10)).write(html)

    # Schema FAQPage desta rota sai daqui.
    faq_map[URL] = [[p['pergunta'], p['resposta']] for p in gerais]
    io.open(caminho_faq, 'w', encoding='utf-8', newline=chr(10)).write(
        json.dumps(faq_map, ensure_ascii=False, indent=1) + chr(10))

    print('%s  %s  %d bytes' % (URL, rotas[URL]['status'], len(html)))
    print('%d perguntas transversais + indice de %d em %d paginas'
          % (len(gerais), n_indice, len(grupos)))
    print('faq-map.json com %d rotas' % len(faq_map))
    return 0


if __name__ == '__main__':
    sys.exit(main())
