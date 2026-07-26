# -*- coding: utf-8 -*-
"""
python scripts/gerar_lps.py

Gera as landing pages de midia paga a partir dos JSON:
  content/keyword-map.json  -> valida que a rota existe e NAO e indexavel
  content/lps.json          -> copy
  content/simuladores.json  -> parametros do calculo, quando a LP tem simulador

Regras estruturais (noindex, sem menu, sem rodape de navegacao) NAO sao geradas
aqui: moram no mu-plugin, via mv_e_lp(). Assim uma LP nova nao pode esquecer.

LP sem simulador (moto, empresa, marca) usa CTA direto de WhatsApp: ou nao ha
parametro de calculo, ou a pagina nao e de calculo.

Saida em build/lp-<slug>.html e build/lp-rmk-<slug>.html
"""
import io
import json
import os
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(RAIZ, 'build')

SIM_BLOCO = '''    <div class="mv-sim" id="mvSim"
         data-cat="%(cat)s" data-nome="%(nome)s"
         data-vmin="%(vMin)d" data-vmax="%(vMax)d" data-vstep="%(vStep)d" data-vdef="%(vDef)d"
         data-kfirst="%(kFirst)s" data-tot="%(tot)s"
         data-pmin="%(pMin)d" data-pmax="%(pMax)d" data-pdef="%(pDef)d"
         data-wa="%(wa)s">
      <div class="mv-sim__campos">
        <label class="mv-sim__campo">
          <span>Valor da carta de crédito</span>
          <input type="text" id="mvValTxt" inputmode="numeric" autocomplete="off">
          <input type="range" id="mvVal" min="%(vMin)d" max="%(vMax)d" step="%(vStep)d" value="%(vDef)d">
          <small><span id="mvValMin"></span> a <span id="mvValMax"></span></small>
        </label>
        <label class="mv-sim__campo">
          <span>Prazo</span>
          <output id="mvPrazoNum">%(pDef)d meses</output>
          <input type="range" id="mvPrazo" min="%(pMin)d" max="%(pMax)d" step="1" value="%(pDef)d">
          <small>%(pMin)d a %(pMax)d meses</small>
        </label>
      </div>
      <div class="mv-sim__res" aria-live="polite">
        <div class="mv-sim__linha"><span>1ª parcela</span><strong id="mvFirst">—</strong></div>
        <div class="mv-sim__linha mv-sim__linha--destaque"><span>Demais parcelas</span><strong id="mvParcela">—</strong></div>
        <div class="mv-sim__linha"><span>Total estimado</span><strong id="mvTotal">—</strong></div>
        <a class="btn btn--cta mv-sim__cta" id="mvWa" href="#" target="_blank" rel="noopener">%(cta)s</a>
        <p class="mv-sim__nota">%(disclaimer)s</p>
      </div>
    </div>'''

WA_BLOCO = '''    <div class="mv-sim">
      <div class="mv-sim__res" style="grid-column:1/-1">
        <div class="mv-sim__linha mv-sim__linha--destaque"><span>Fale agora</span><strong>Sem compromisso</strong></div>
        <a class="btn btn--cta mv-sim__cta" href="https://wa.me/%(wa)s?text=%(msg)s" target="_blank" rel="noopener" data-evento="lead_whatsapp">%(cta)s</a>
        <p class="mv-sim__nota">%(disclaimer)s</p>
      </div>
    </div>'''

TPL_AQ = '''<!-- wp:html -->
<div class="mv-page mv-lp">

<section class="hero chevrons">
  <div class="wrap hero-grid">
    <div class="stack">
      <p class="eyebrow">%(eyebrow)s</p>
      <h1>%(h1)s</h1>
      <p class="lead">%(lead)s</p>
      <div class="botoes"><a class="btn btn--cta btn--lg" href="#agir">%(cta)s</a></div>
      <p class="mv-lp__micro">Sem cadastro · sem compromisso</p>
    </div>
    <div class="dados"><dl>
%(bullets)s
    </dl></div>
  </div>
</section>

<section class="sec" id="agir">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">%(eyebrow2)s</p>
      <h2>%(titulo2)s</h2>
    </div>
%(acao)s
  </div>
</section>

<section class="sec sec--dark chevrons">
  <div class="wrap stack prosa">
    <h2>%(fecho)s</h2>
    <p class="lead">Sem pressa e sem compromisso. Um consultor explica os custos por escrito e responde o que você precisar — inclusive as perguntas difíceis.</p>
    <div class="botoes"><a class="btn btn--cta btn--lg" href="#agir">%(cta)s</a></div>
  </div>
</section>

</div>
<!-- /wp:html -->
'''

TPL_RMK = '''<!-- wp:html -->
<div class="mv-page mv-lp">

<section class="hero chevrons">
  <div class="wrap stack prosa">
    <p class="eyebrow">Você já esteve aqui</p>
    <h1>Ficou uma dúvida sobre o consórcio de %(nome)s?</h1>
    <p class="lead">Quem pesquisa consórcio quase sempre trava numa destas quatro perguntas. Respondemos as quatro abaixo, sem rodeio — inclusive as que não nos favorecem.</p>
  </div>
</section>

<section class="sec">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">As objeções reais</p>
      <h2>O que costuma travar a decisão</h2>
    </div>
    <div class="cards cards--2">
%(objecoes)s
    </div>
    <div class="nota prosa">
      <p><strong>Para quem o consórcio não serve.</strong> %(naoServe)s</p>
    </div>
  </div>
</section>

<section class="sec sec--alt" id="agir">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">Sem compromisso</p>
      <h2>%(titulo2)s</h2>
    </div>
%(acao)s
  </div>
</section>

<section class="sec sec--dark chevrons">
  <div class="wrap stack prosa">
    <h2>Prefere conferir antes de conversar?</h2>
    <p class="lead">A gente ensina como verificar a administradora na fonte oficial, em dois minutos. Vale para qualquer empresa de consórcio — inclusive para nós.</p>
    <div class="botoes"><a class="btn btn--cta btn--lg" href="#agir">%(cta)s</a></div>
  </div>
</section>

</div>
<!-- /wp:html -->
'''


def carregar(nome):
    with io.open(os.path.join(RAIZ, 'content', nome), encoding='utf-8') as fh:
        return json.load(fh)


def bloco_acao(chave_sim, sims, cta, nome_fallback):
    """Simulador quando ha parametro; senao, CTA direto de WhatsApp."""
    wa = sims['whatsapp']
    disc = sims['_disclaimer']
    if chave_sim and sims['categorias'].get(chave_sim, {}).get('kFirst') is not None:
        c = sims['categorias'][chave_sim]
        return SIM_BLOCO % dict(c, cat=chave_sim, nome=c['nome'], wa=wa, cta=cta, disclaimer=disc), True
    from urllib.parse import quote
    msg = quote('Ola! Vim do site da MOVECON e quero falar sobre consorcio de %s.' % nome_fallback)
    return WA_BLOCO % dict(wa=wa, msg=msg, cta=cta, disclaimer=disc), False


def main():
    mapa = carregar('keyword-map.json')
    lps = carregar('lps.json')
    sims = carregar('simuladores.json')
    rotas = {r['url']: r for r in mapa['rotas']}

    if not os.path.isdir(BUILD):
        os.makedirs(BUILD)

    feitos = []

    for lp in lps['aquisicao']:
        url = '/lp/%s/' % lp['slug']
        r = rotas.get(url)
        if not r:
            print('[X] %s nao esta no keyword-map.' % url); return 1
        if r.get('indexavel'):
            print('[X] %s marcada como indexavel no mapa. LP nunca indexa.' % url); return 1

        cta = 'Simular minha parcela' if lp['simulador'] else 'Falar no WhatsApp'
        acao, tem_sim = bloco_acao(lp['simulador'], sims, cta, lp['eyebrow'])
        html = TPL_AQ % dict(
            lp, cta=cta, acao=acao,
            eyebrow2='Simule' if tem_sim else 'Fale conosco',
            titulo2='Quanto fica a sua parcela' if tem_sim else 'Fale com um consultor agora',
            fecho='Vamos calcular a sua parcela?' if tem_sim else 'Vamos conversar?',
            bullets='\n'.join('      <div><dt>%s</dt><dd>%s</dd></div>' % (t, d)
                              for t, d in lp['bullets']))
        io.open(os.path.join(BUILD, 'lp-%s.html' % lp['slug']), 'w', encoding='utf-8').write(html)
        feitos.append((url, 'aquisicao', 'simulador' if tem_sim else 'whatsapp', len(html)))

    for lp in lps['remarketing']:
        url = '/lp/rmk-%s/' % lp['slug']
        r = rotas.get(url)
        if not r:
            print('[X] %s nao esta no keyword-map.' % url); return 1
        if r.get('indexavel'):
            print('[X] %s marcada como indexavel no mapa.' % url); return 1

        cta = 'Refazer minha simulação' if lp['simulador'] else 'Tirar minha dúvida'
        acao, tem_sim = bloco_acao(lp['simulador'], sims, cta, lp['nome'])
        html = TPL_RMK % dict(
            lp, cta=cta, acao=acao,
            titulo2='Refaça a conta com calma' if tem_sim else 'Fale com um consultor',
            objecoes='\n'.join(
                '      <div class="card card--acento">\n        <h3>%s</h3>\n        <p>%s</p>\n      </div>'
                % (q, a) for q, a in lp['objecoes']))
        io.open(os.path.join(BUILD, 'lp-rmk-%s.html' % lp['slug']), 'w', encoding='utf-8').write(html)
        feitos.append((url, 'remarketing', 'simulador' if tem_sim else 'whatsapp', len(html)))

    print('%-24s %-13s %-11s %s' % ('rota', 'tipo', 'acao', 'bytes'))
    for u, t, a, n in feitos:
        print('%-24s %-13s %-11s %d' % (u, t, a, n))
    print('\n%d LPs geradas' % len(feitos))
    return 0


if __name__ == '__main__':
    sys.exit(main())
