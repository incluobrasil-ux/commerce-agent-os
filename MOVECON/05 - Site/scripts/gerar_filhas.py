# -*- coding: utf-8 -*-
"""
python scripts/gerar_filhas.py [arquivo-de-filhas.json ...]

Gera as paginas-filha de silo. Sem argumento, processa todo content/filhas-*.json.

Cada pagina: breadcrumb visivel, answer-first, corpo, FAQ, link para o hub pai
e para o simulador, bloco de compliance.

Tambem escreve content/faq-map.json (url -> perguntas), que o mu-plugin
movecon-seo.php le para emitir o FAQPage schema. Sem isso, o FAQ existiria no
HTML e nao no dado estruturado - e o schema e o que faz motor generativo citar.

Saida em build/filha-<slug>.html
"""
import glob
import io
import json
import os
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(RAIZ, 'build')

ITEM = ('      <div class="card card--acento">\n'
        '        <h3>%s</h3>\n'
        '        <p>%s</p>\n'
        '      </div>')
FAQ = ('      <details%s>\n'
       '        <summary>%s</summary>\n'
       '        <div class="resposta">%s</div>\n'
       '      </details>')

TPL = '''<!-- wp:html -->
<div class="mv-page">

<nav class="mv-trilha" aria-label="Você está em">
  <a href="/">Início</a> <span>/</span>
  <a href="%(pai)s">%(paiNome)s</a> <span>/</span>
  <span aria-current="page">%(h1)s</span>
</nav>

<section class="hero chevrons">
  <div class="wrap stack prosa">
    <p class="eyebrow">%(eyebrow)s</p>
    <h1>%(h1)s</h1>

    <!-- ANSWER-FIRST: responde a keyword antes de qualquer contexto. -->
    <p class="resposta-curta">%(respostaCurta)s</p>

    <p class="lead">%(lead)s</p>
    <div class="botoes">
      <a class="btn btn--cta" href="%(simulador)s">Simular minha parcela</a>
      <a class="btn btn--ghost" href="%(pai)s">Ver %(paiNome)s</a>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">Como funciona</p>
      <h2>%(secao)s</h2>
    </div>
    <div class="cards cards--3">
%(itens)s
    </div>
    <div class="nota prosa">
      <p><strong>Sem juros — mas com custo.</strong> Você paga taxa de administração e, quando previsto em contrato, fundo de reserva. Os dois são informados antes da adesão. E a contemplação ocorre por sorteio ou lance: ninguém pode prometer data.</p>
    </div>
  </div>
</section>

<section class="sec sec--alt">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">Dúvidas frequentes</p>
      <h2>Sobre %(h1Low)s</h2>
    </div>
    <div class="faq prosa">
%(faq)s
    </div>
  </div>
</section>

<section class="sec sec--dark chevrons">
  <div class="wrap stack prosa">
    <h2>Vamos calcular a sua parcela?</h2>
    <p class="lead">Sem pressa e sem compromisso. Um consultor apresenta os grupos disponíveis, explica os custos por escrito e responde o que você precisar.</p>
    <div class="botoes">
      <a class="btn btn--cta" href="%(simulador)s">Simular minha parcela</a>
      <a class="btn btn--ghost" href="/administrado-pela-alpha/">Quem administra os grupos</a>
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

    arquivos = sys.argv[1:] or sorted(glob.glob(os.path.join(RAIZ, 'content', 'filhas-*.json')))
    if not os.path.isdir(BUILD):
        os.makedirs(BUILD)

    faq_map = {}
    caminho_faq = os.path.join(RAIZ, 'content', 'faq-map.json')
    if os.path.exists(caminho_faq):
        faq_map = carregar(caminho_faq)

    feitos = []
    for arq in arquivos:
        d = carregar(arq)
        pai = d['pai']
        if pai not in rotas:
            print('[X] pai %s nao esta no keyword-map.' % pai); return 1
        pai_nome = rotas[pai]['title'].split('|')[0].split('—')[0].strip()

        for f in d['filhas']:
            url = '%s%s/' % (pai, f['slug'])
            r = rotas.get(url)
            if not r:
                print('[X] %s nao esta no keyword-map. Registre antes de gerar.' % url); return 1
            if r['keyword'] != f['keyword']:
                print('[X] keyword diverge em %s: mapa="%s" conteudo="%s"'
                      % (url, r['keyword'], f['keyword'])); return 1

            pal = len(f['respostaCurta'].split())
            if pal > 60:
                print('[!] %s: answer-first com %d palavras (alvo ~55)' % (url, pal))

            html = TPL % dict(
                f, pai=pai, paiNome=pai_nome, simulador=d['simulador'],
                h1Low=f['h1'][0].lower() + f['h1'][1:],
                itens='\n'.join(ITEM % (t, x) for t, x in f['itens']),
                faq='\n'.join(FAQ % (' open' if i == 0 else '', q, a)
                              for i, (q, a) in enumerate(f['faq'])))
            io.open(os.path.join(BUILD, 'filha-%s.html' % f['slug']), 'w',
                    encoding='utf-8').write(html)

            faq_map[url] = f['faq']
            feitos.append((url, r['status'], pal, len(html)))

    io.open(caminho_faq, 'w', encoding='utf-8').write(
        json.dumps(faq_map, ensure_ascii=False, indent=1))

    print('%-42s %-10s %6s %s' % ('rota', 'status', 'a-first', 'bytes'))
    for u, st, p, n in feitos:
        print('%-42s %-10s %4d p %6d' % (u, st, p, n))
    print('\n%d filha(s) geradas · faq-map.json com %d rotas' % (len(feitos), len(faq_map)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
