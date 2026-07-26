# -*- coding: utf-8 -*-
"""
python scripts/gerar_simuladores.py [chave ...]

Gera o HTML dos simuladores a partir dos JSON:
  content/keyword-map.json   -> url, title, description (fonte da verdade)
  content/simuladores.json   -> parametros de calculo (planos Alpha)

Regras fixas (docs/prompts-execucao.md, bloco 3):
  - conteudo indexavel (H1, answer-first, FAQ) FORA do JavaScript
  - so o formulario e interativo; calculo roda no cliente
  - eventos GA4: sim_start, sim_result, lead_whatsapp
  - nenhum numero inventado: tudo sai de simuladores.json

Categoria sem parametro (ex.: moto) e PULADA, nao estimada.
Saida em build/simulador-<chave>.html
"""
import io
import json
import os
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(RAIZ, 'build')

# Texto por categoria. Answer-first responde "quanto fica a parcela" antes de
# qualquer contexto - e o trecho que motores generativos citam.
TEXTO = {
    'veiculos': dict(
        h1='Simulador de consórcio de carro',
        resposta='A parcela do consórcio de carro depende de dois fatores: o valor da carta de crédito e o prazo do grupo. Não há juros — o custo é a taxa de administração, diluída nas parcelas. Use o simulador abaixo para ver a estimativa do seu caso.',
        contexto='Financiamento cobra juros do primeiro ao último mês. No consórcio você paga parcelas e, na contemplação, compra à vista — chegando na concessionária como comprador à vista.',
        hub='/consorcio-veiculos/'),
    'imoveis': dict(
        h1='Simulador de consórcio imobiliário',
        resposta='A parcela do consórcio de imóvel depende do valor da carta de crédito e do prazo escolhido. Não há juros — o custo é a taxa de administração. Em prazos longos, a diferença para um financiamento costuma ser a maior economia de uma vida financeira.',
        contexto='Num financiamento de 30 anos é comum pagar mais de duas vezes o valor do imóvel só em juros. O FGTS pode ser usado como lance para antecipar a contemplação.',
        hub='/consorcio-imoveis/'),
    'caminhao': dict(
        h1='Simulador de consórcio de caminhão',
        resposta='A parcela do consórcio de caminhão depende do valor da carta e do prazo do grupo. Não há juros, o que mantém o custo previsível — importante para quem calcula frete e não pode absorver variação de taxa.',
        contexto='Serve para caminhão novo ou usado, carreta e implementos. Empresas costumam manter mais de uma cota para escalonar a renovação da frota.',
        hub='/consorcio-caminhao/'),
    'maquinas-agricolas': dict(
        h1='Simulador de consórcio de trator e máquinas agrícolas',
        resposta='A parcela do consórcio de máquinas agrícolas depende do valor da carta e do prazo. Não há juros, e a contemplação pode ser planejada para a janela da safra — sem depender da liberação do crédito rural.',
        contexto='Cobre trator, colheitadeira, pulverizador e implementos. Numa safra boa, o lance pode antecipar a contemplação para a próxima janela de plantio.',
        hub='/consorcio-maquinas-agricolas/'),
    'servicos': dict(
        h1='Simulador de consórcio de serviços',
        resposta='A parcela do consórcio de serviços depende do valor da carta e do prazo. Não há juros — diferente do cartão parcelado e do crediário, que são as formas mais caras de pagar por reforma, viagem, estudo ou tratamento.',
        contexto='Cobre energia solar, reforma, viagem, casamento, educação e procedimentos. Na contemplação você contrata o prestador à vista.',
        hub='/consorcio-servicos/'),
}

FAQ = [
    ('O valor simulado é o valor final?',
     'Não. A simulação é uma estimativa para você planejar. Os valores exatos — taxa de administração, fundo de reserva e prazo do grupo — são confirmados pela administradora e constam do contrato, que você lê antes de aderir.'),
    ('Por que existe uma primeira parcela maior?',
     'A primeira parcela concentra custos de adesão ao grupo. As parcelas seguintes são menores e constantes. O simulador mostra as duas separadamente, para você não ter surpresa.'),
    ('Simular me compromete com alguma coisa?',
     'Não. A simulação é gratuita e não gera cadastro nem obrigação. Você só fala com um consultor se quiser.'),
    ('Quando serei contemplado?',
     'Não há como prever nem prometer. A contemplação ocorre por sorteio ou por lance nas assembleias mensais do grupo. Qualquer promessa de data contraria as regras do consórcio.'),
]

TPL = '''<!-- wp:html -->
<div class="mv-page">

<section class="hero chevrons">
  <div class="wrap stack prosa">
    <p class="eyebrow">Simulador</p>
    <h1>%(h1)s</h1>
    <p class="resposta-curta">%(resposta)s</p>
    <p class="lead">%(contexto)s</p>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="mv-sim" id="mvSim"
         data-cat="%(chave)s" data-nome="%(nome)s"
         data-vmin="%(vMin)d" data-vmax="%(vMax)d" data-vstep="%(vStep)d" data-vdef="%(vDef)d"
         data-kfirst="%(kFirst)s" data-tot="%(tot)s"
         data-pmin="%(pMin)d" data-pmax="%(pMax)d" data-pdef="%(pDef)d"
         data-wa="%(whatsapp)s">

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
        <a class="btn btn--cta mv-sim__cta" id="mvWa" href="#" target="_blank" rel="noopener">Falar com um consultor</a>
        <p class="mv-sim__nota">%(disclaimer)s</p>
      </div>
    </div>
  </div>
</section>

<section class="sec sec--alt">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">Dúvidas frequentes</p>
      <h2>Sobre a simulação</h2>
    </div>
    <div class="faq prosa">
%(faq)s
    </div>
  </div>
</section>

<section class="sec sec--dark chevrons">
  <div class="wrap stack prosa">
    <h2>Quer entender antes de simular?</h2>
    <p class="lead">Veja como o consórcio funciona nesta categoria, o que a carta de crédito cobre e quais são as regras de contemplação.</p>
    <div class="botoes">
      <a class="btn btn--cta" href="%(hub)s">Ver %(nome_low)s</a>
      <a class="btn btn--ghost" href="/administrado-pela-alpha/">Quem administra os grupos</a>
    </div>
  </div>
</section>

</div>
<!-- /wp:html -->
'''

FAQ_TPL = ('      <details%s>\n'
           '        <summary>%s</summary>\n'
           '        <div class="resposta">%s</div>\n'
           '      </details>')


def carregar(nome):
    with io.open(os.path.join(RAIZ, 'content', nome), encoding='utf-8') as fh:
        return json.load(fh)


def main():
    mapa = carregar('keyword-map.json')
    sim = carregar('simuladores.json')
    rotas = {r['url']: r for r in mapa['rotas']}

    pedidos = [a for a in sys.argv[1:] if not a.startswith('-')]
    if not os.path.isdir(BUILD):
        os.makedirs(BUILD)

    feitos, pulados = [], []
    for chave, c in sim['categorias'].items():
        if pedidos and chave not in pedidos:
            continue
        if c.get('kFirst') is None or c.get('tot') is None:
            pulados.append((chave, c.get('_pendente', 'sem parametros')))
            continue
        if chave not in TEXTO:
            pulados.append((chave, 'sem texto definido em TEXTO'))
            continue
        if c['rota'] not in rotas:
            print('[X] %s nao esta no keyword-map.' % c['rota'])
            return 1

        t = TEXTO[chave]
        html = TPL % dict(
            c, chave=chave, whatsapp=sim['whatsapp'], disclaimer=sim['_disclaimer'],
            nome_low=c['nome'].lower(), h1=t['h1'], resposta=t['resposta'],
            contexto=t['contexto'], hub=t['hub'],
            faq='\n'.join(FAQ_TPL % (' open' if i == 0 else '', q, a)
                          for i, (q, a) in enumerate(FAQ)),
        )
        io.open(os.path.join(BUILD, 'simulador-%s.html' % chave), 'w',
                encoding='utf-8').write(html)
        pal = len(t['resposta'].split())
        if pal > 60:
            print('[!] %s: answer-first com %d palavras (alvo ~55)' % (chave, pal))
        feitos.append((chave, c['rota'], rotas[c['rota']]['status'], pal))

    print('%-20s %-34s %-10s %s' % ('chave', 'rota', 'status', 'answer-first'))
    for k, r, st, p in feitos:
        print('%-20s %-34s %-10s %d palavras' % (k, r, st, p))
    for k, motivo in pulados:
        print('%-20s PULADO: %s' % (k, motivo[:70]))
    print('\n%d simulador(es) gerados, %d pulado(s)' % (len(feitos), len(pulados)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
