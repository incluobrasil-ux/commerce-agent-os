# -*- coding: utf-8 -*-
"""Gera as paginas de /guia/ a partir de content/guias-*.json.

Entra:
  content/guias-*.json      -> conteudo dos guias
  content/keyword-map.json  -> valida rota, keyword e status

Sai:
  build/guia-<slug>.html
  content/faq-map.json      -> atualizado com a FAQ de cada guia

SEM CAIXA DE AUTOR. Conteudo YMYL sobre dinheiro pede autor identificavel,
e o dado de autoria (nome completo, foto, anos de experiencia, credencial)
ainda nao chegou. A escolha aqui foi publicar o conteudo sem assinatura em
vez de assinar com dado inventado: guia sem autor e conteudo anonimo, guia
com autor falso e fraude. Quando o dado chegar, a caixa entra por aqui e
todas as 20 paginas sao regeneradas de uma vez.
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
       '        <p>%s</p>\n'
       '      </details>')

RELACIONADO = '      <a class="card card--link" href="%s">\n        <h3>%s</h3>\n      </a>'

RELACIONADOS = '''
<section class="sec">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">Continue por aqui</p>
      <h2>Guias relacionados</h2>
    </div>
    <div class="cards cards--3">
%s
    </div>
  </div>
</section>'''

TPL = '''<!-- wp:html -->
<div class="mv-page">

<nav class="migalhas" aria-label="Você está aqui">
  <a href="/">Início</a>
  <span aria-hidden="true">/</span>
  <a href="/perguntas/">Aprenda</a>
  <span aria-hidden="true">/</span>
  <span aria-current="page">%(h1)s</span>
</nav>

<section class="hero chevrons">
  <div class="wrap stack prosa">
    <p class="eyebrow">%(eyebrow)s</p>
    <h1>%(h1)s</h1>

    <!-- Data preenchida em tempo de requisicao pelo movecon-seo.php, a partir
         do post_modified. NAO assar a data aqui: HTML gerado hoje e editado
         depois passaria a exibir data falsa, e data errada e pior que data
         nenhuma numa pagina que se apresenta como referencia. -->
    <p class="mv-atualizado"><!--MV_DATA--></p>

    <!-- ANSWER-FIRST: responde a keyword antes de qualquer contexto.
         E este paragrafo que motores generativos extraem e citam.
         Nao mover, nao enfeitar, nao colocar storytelling antes. -->
    <p class="resposta-curta">%(respostaCurta)s</p>

    <p class="lead">%(lead)s</p>
  </div>
</section>

<section class="sec sec--alt">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">O essencial</p>
      <h2>%(secao)s</h2>
    </div>
    <div class="cards cards--3">
%(itens)s
    </div>
    <div class="nota prosa">
      <p><strong>%(notaTitulo)s</strong> %(nota)s</p>
    </div>
  </div>
</section>
%(relacionados)s

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

<section class="sec">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">Confira na origem</p>
      <h2>Onde verificar o que está nesta página</h2>
      <p>Consórcio é atividade regulada. Tudo o que esta página descreve sobre
      o funcionamento do sistema pode ser conferido direto na fonte — e é assim
      que deve ser lido: confira, não confie.</p>
    </div>
    <ul class="fontes prosa">
%(fontes)s
    </ul>
  </div>
</section>

<section class="sec sec--dark chevrons">
  <div class="wrap stack prosa">
    <h2>Quer conversar sobre o seu caso?</h2>
    <p class="lead">Um consultor explica os custos por escrito e responde o que você precisar, sem pressa e sem compromisso.</p>
    <div class="botoes">
      <a class="btn btn--cta" href="/contato/">Falar com um consultor</a>
      <a class="btn btn--ghost" href="/glossario/">Ver o glossário</a>
    </div>
  </div>
</section>

</div>
<!-- /wp:html -->
'''


# ---------------------------------------------------------------- fontes
# URLs CONFERIDAS em 27/07/2026, uma a uma, antes de entrarem aqui:
# HTTP 200 e - onde o HTML permite ler - conteudo batendo com a afirmacao.
# A Lei 11.795/08 foi lida no Planalto (decodificada em iso-8859-1) e a
# ementa confere: "Dispoe sobre o Sistema de Consorcio".
#
# DESCARTADAS, e o motivo importa:
#   abac.org.br/imprensa/numeros-do-setor .......... 404
#   Circular 3.432 do Bacen ........................ responde 200, mas o
#     conteudo e renderizado por JS e nao consigo comprovar que e o
#     normativo que eu afirmaria ser. Citar numero de norma sem conferir
#     e inventar credencial - a mesma regra que vale para taxa e prazo.
#
# As paginas do Bacen sao SPA: 200 sem texto no HTML cru. Entram porque o
# caminho corresponde ao que o cliente confirmou em 25/07/2026 (Bacen ->
# Estabilidade Financeira -> ... -> "Administradora de Consorcio").
FONTE = {
    'lei': ('Lei 11.795/2008 — texto integral no Planalto',
            'https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/lei/l11795.htm',
            'A lei que institui o Sistema de Consórcio e define o que a '
            'administradora pode e não pode fazer.'),
    'bacen': ('Banco Central — Sistema de Consórcios',
              'https://www.bcb.gov.br/estabilidadefinanceira/consorcio',
              'A página do regulador sobre o funcionamento e a fiscalização '
              'do setor.'),
    'consulta': ('Banco Central — consulta de instituições autorizadas',
                 'https://www.bcb.gov.br/estabilidadefinanceira/encontreinstituicao',
                 'Onde conferir, pelo CNPJ, se uma administradora está '
                 'autorizada a funcionar.'),
    'reclamacao': ('Banco Central — como registrar reclamação',
                   'https://www.bcb.gov.br/meubc/faqs/p/como-registrar-reclamacao-'
                   'contra-uma-instituicao-financeira',
                   'O caminho formal quando a administradora não resolve.'),
    'abac': ('ABAC — Associação Brasileira de Administradoras de Consórcios',
             'https://abac.org.br/',
             'Entidade do setor; publica os números consolidados de vendas e '
             'contemplações.'),
}

# Toda pagina recebe lei + bacen: os 20 guias descrevem o regime que a lei
# cria, e o rodape global ja cita a Lei 11.795/08 em todas elas - linkar e
# tornar verificavel uma citacao que ja existe, nao acrescentar enfeite.
# As demais fontes entram so onde a materia do guia as invoca.
FONTES_BASE = ('lei', 'bacen')
FONTES_EXTRA = {
    'consorcio-e-confiavel': ('consulta', 'reclamacao'),
    'contemplacao-garantida-e-golpe': ('consulta',),
    'direitos-do-consorciado': ('reclamacao',),
    'consorcio-vale-a-pena': ('abac',),
}


def montar_fontes(slug):
    chaves = list(FONTES_BASE) + list(FONTES_EXTRA.get(slug, ()))
    itens = []
    for k in chaves:
        titulo, url, porque = FONTE[k]
        itens.append(
            '      <li><a href="%s" rel="nofollow noopener" '
            'target="_blank">%s</a> — %s</li>' % (url, titulo, porque))
    return chr(10).join(itens)


def carregar(caminho):
    with io.open(caminho, encoding='utf-8') as fh:
        return json.load(fh)


def main():
    mapa = carregar(os.path.join(RAIZ, 'content', 'keyword-map.json'))
    rotas = {r['url']: r for r in mapa['rotas']}

    pedidos = [a for a in sys.argv[1:] if not a.startswith('-')]
    arquivos = pedidos or sorted(
        glob.glob(os.path.join(RAIZ, 'content', 'guias-*.json')))
    if not arquivos:
        print('nenhum content/guias-*.json encontrado')
        return 1

    caminho_faq = os.path.join(RAIZ, 'content', 'faq-map.json')
    faq_map = carregar(caminho_faq) if os.path.exists(caminho_faq) else {}

    if not os.path.isdir(BUILD):
        os.makedirs(BUILD)

    feitos = []
    for arq in arquivos:
        for g in carregar(arq)['guias']:
            url = '/guia/%s/' % g['slug']
            rota = rotas.get(url)
            if not rota:
                print('[X] %s nao esta no keyword-map. Registre antes de gerar.' % url)
                return 1
            if rota['keyword'] != g['keyword']:
                print('[X] keyword diverge em %s: mapa="%s" conteudo="%s"'
                      % (url, rota['keyword'], g['keyword']))
                return 1

            palavras = len(g['respostaCurta'].split())
            if palavras > 60:
                print('[!] %s: answer-first com %d palavras (alvo ~55)'
                      % (url, palavras))

            # Relacionados: so guia que existe no mapa. Guia planejada passa -
            # a rota existe e a pagina sai no mesmo lote. Rota inexistente nao.
            rel = []
            for outro in g.get('relacionados', []):
                if outro not in rotas:
                    print('[X] %s aponta para %s, que nao esta no keyword-map.'
                          % (url, outro))
                    return 1
                titulo = rotas[outro]['keyword']
                rel.append(RELACIONADO % (outro, titulo[0].upper() + titulo[1:]))

            html = TPL % dict(
                g,
                h1Low=g['h1'][0].lower() + g['h1'][1:],
                itens='\n'.join(ITEM % (t, d) for t, d in g['itens']),
                relacionados=RELACIONADOS % '\n'.join(rel) if rel else '',
                fontes=montar_fontes(g['slug']),
                faq='\n'.join(FAQ % (' open' if i == 0 else '', q, a)
                              for i, (q, a) in enumerate(g['faq'])))

            io.open(os.path.join(BUILD, 'guia-%s.html' % g['slug']), 'w',
                    encoding='utf-8', newline=chr(10)).write(html)

            faq_map[url] = [[q, a] for q, a in g['faq']]
            feitos.append((url, rota['status'], palavras, len(html)))

    io.open(caminho_faq, 'w', encoding='utf-8', newline=chr(10)).write(
        json.dumps(faq_map, ensure_ascii=False, indent=1) + chr(10))

    print('%-42s %-10s %-6s %s' % ('rota', 'status', 'palav', 'bytes'))
    for url, st, pal, tam in feitos:
        print('%-42s %-10s %-6d %d' % (url, st, pal, tam))
    print('\n%d guia(s) gerados · faq-map.json com %d rotas'
          % (len(feitos), len(faq_map)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
