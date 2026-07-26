# -*- coding: utf-8 -*-
"""
python scripts/gerar_legais.py

Gera /politica-de-privacidade/ e /termos-de-uso/.

Os dados da empresa saem de content/keyword-map.json (bloco `site`), nunca
hardcoded aqui: CNPJ e endereco errados num documento legal sao pior que
ausencia de documento.

A politica descreve o que o site DE FATO coleta hoje, apurado em 25/07/2026:
  - sem analytics ativo (Site Kit instalado, nao conectado)
  - sem plugin de consentimento (Complianz DESINSTALADO em 25/07/2026)
  - sem formulario publicado em nenhuma pagina
  - sem cookie proprio na home
  - fontes AUTOHOSPEDADAS: zero recurso de terceiro no HTML
  - links de saida para o portal da administradora e para o WhatsApp

########################################################################
# TRAVA — NENHUM DESTES QUATRO VAI AO AR SEM QUE, NA MESMA TAREFA:      #
#   (a) esta politica seja reescrita, e                                 #
#   (b) exista banner de consentimento FUNCIONANDO                      #
#                                                                       #
#   1. Google Analytics / GA4                                           #
#   2. tag de conversao do Google Ads                                   #
#   3. pixel do Meta                                                    #
#   4. simulador ou formulario que CAPTURE dado (o simulador atual      #
#      calcula no navegador e nao envia nada; se isso mudar, conta)     #
#                                                                       #
# O banner e PRE-REQUISITO DE CAMPANHA, nao item de compliance para     #
# depois. Sem ele, o dia 1 de trafego pago roda irregular.              #
########################################################################

Saida em build/legal-privacidade.html e build/legal-termos.html
"""
import io
import json
import os
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(RAIZ, 'build')

SEC = '''<section class="sec%(alt)s">
  <div class="wrap stack-l">
    <div class="stack prosa">
      <p class="eyebrow">%(eyebrow)s</p>
      <h2>%(titulo)s</h2>
%(corpo)s
    </div>
  </div>
</section>'''

TPL = '''<!-- wp:html -->
<div class="mv-page mv-legal">

<section class="hero chevrons">
  <div class="wrap stack prosa">
    <p class="eyebrow">%(eyebrow)s</p>
    <h1>%(h1)s</h1>
    <p class="lead">%(lead)s</p>
    <p class="mv-legal__vigencia">Vigente desde 25 de julho de 2026 · última atualização em 25 de julho de 2026</p>
  </div>
</section>

%(secoes)s

<section class="sec sec--dark chevrons">
  <div class="wrap stack prosa">
    <h2>Dúvidas sobre este documento?</h2>
    <p class="lead">%(fecho)s</p>
    <div class="botoes">
      <a class="btn btn--cta" href="/contato/">Falar com a MOVECON</a>
    </div>
  </div>
</section>

</div>
<!-- /wp:html -->
'''


def p(*paragrafos):
    return '\n'.join('      <p>%s</p>' % x for x in paragrafos)


def ul(titulo, itens):
    li = '\n'.join('        <li>%s</li>' % x for x in itens)
    return '      <p><strong>%s</strong></p>\n      <ul class="mv-legal__lista">\n%s\n      </ul>' % (titulo, li)


def montar(site):
    ident = ('%s, inscrita no CNPJ sob o nº %s, com sede na %s'
             % (site['razaoSocial'], site['cnpj'],
                'Av. Rosa Cruz, 926, Candeias, Vitória da Conquista/BA, CEP 45.028-045'))
    adm = site['administradora']

    # ---------------------------------------------------------- PRIVACIDADE
    priv = [
        ('alt', 'Quem é o controlador', 'Quem responde pelos seus dados', p(
            'O controlador dos dados pessoais tratados neste site é a %s.' % ident,
            'Este documento explica quais dados o site coleta, por que coleta, com quem compartilha '
            'e o que você pode exigir a respeito. Ele segue a Lei nº 13.709/2018 (LGPD).')),

        ('', 'O que coletamos', 'Quais dados são tratados', p(
            'Hoje, a navegação neste site não exige cadastro e não cria conta. O tratamento se resume ao seguinte:'
        ) + '\n' + ul('Dados de navegação, coletados automaticamente', [
            'endereço IP, tipo de navegador e sistema operacional, registrados nos logs do servidor por '
            'necessidade técnica e de segurança;',
            'páginas acessadas e horário do acesso, nos mesmos registros.',
        ]) + '\n' + ul('Dados que você fornece, quando escolhe fornecer', [
            'ao clicar em um botão de WhatsApp, você é levado ao aplicativo e passa a conversar conosco. '
            'O conteúdo dessa conversa e o seu número são tratados a partir daí;',
            'ao usar um simulador, os valores que você escolhe são processados no seu próprio navegador '
            'e não são enviados nem armazenados por nós. Eles só saem do seu dispositivo se você optar '
            'por enviá-los pelo WhatsApp.',
        ]) + '\n' + p(
            '<strong>O que não fazemos hoje:</strong> este site não possui formulário de cadastro publicado, '
            'não utiliza ferramenta de análise de audiência ativa e não grava sessões de navegação. '
            'Se algum desses pontos mudar, esta política será atualizada antes da mudança entrar em vigor.')),

        ('alt', 'Por que tratamos', 'Bases legais', p(
            'Cada tratamento tem uma base legal prevista no art. 7º da LGPD:'
        ) + '\n' + ul('', [
            '<strong>Legítimo interesse</strong> — registros de servidor, para manter o site funcionando '
            'e protegido contra abuso;',
            '<strong>Procedimentos preliminares de contrato</strong> — quando você nos procura para '
            'saber sobre consórcio, tratamos seus dados para responder e apresentar condições;',
            '<strong>Consentimento</strong> — para qualquer finalidade que dependa da sua escolha ativa, '
            'como receber comunicações. Você pode retirá-lo a qualquer momento.',
        ])),

        ('', 'Com quem compartilhamos', 'Compartilhamento e transferência internacional', p(
            'Não vendemos dados pessoais. Este site <strong>não carrega nenhum recurso de terceiro</strong> '
            '— as fontes tipográficas são servidas do nosso próprio domínio, justamente para que a sua '
            'visita não seja informada a ninguém. O compartilhamento acontece apenas nestas situações:'
        ) + '\n' + ul('', [
            '<strong>%s</strong> — administradora dos grupos de consórcio. Se você avançar para uma '
            'adesão, seus dados são tratados por ela para a formalização e a gestão do contrato;' % adm,
            '<strong>WhatsApp / Meta</strong> — apenas se você clicar em um botão de WhatsApp. '
            'Ao fazê-lo, o seu número e o conteúdo da conversa passam a ser tratados também segundo '
            'as políticas do aplicativo. <strong>O atendimento comercial pode ser operado por parceiro '
            'contratado pela MOVECON</strong>, que trata esses dados exclusivamente para atender você '
            'e responde pelos mesmos deveres de sigilo;',
            '<strong>Autoridades públicas</strong> — quando houver obrigação legal ou ordem judicial.',
        ])),

        ('alt', 'Por quanto tempo', 'Retenção', p(
            'Registros de servidor são mantidos pelo período necessário à segurança e às obrigações '
            'legais aplicáveis. Dados de atendimento comercial são mantidos enquanto durar a relação '
            'e pelos prazos legais posteriores. Dados vinculados a contrato de consórcio seguem os '
            'prazos definidos pela administradora e pela regulação do setor.')),

        ('', 'Seus direitos', 'O que você pode exigir', p(
            'O art. 18 da LGPD garante a você o direito de:'
        ) + '\n' + ul('', [
            'confirmar se tratamos dados seus e acessá-los;',
            'corrigir dados incompletos, inexatos ou desatualizados;',
            'pedir anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em '
            'desconformidade com a lei;',
            'solicitar a portabilidade a outro fornecedor;',
            'ser informado sobre com quem compartilhamos seus dados;',
            'revogar o consentimento e saber o que acontece se não consentir.',
        ]) + '\n' + p(
            'Para exercer qualquer um desses direitos, fale conosco pelos canais da '
            '<a href="/contato/">página de contato</a>. Responderemos no prazo legal.')),

        ('alt', 'Cookies', 'Cookies e tecnologias semelhantes', p(
            'Este site não utiliza cookies de publicidade nem de rastreamento de terceiros. '
            'O WordPress pode gravar cookies estritamente necessários ao funcionamento, como os de '
            'sessão administrativa — que só existem para quem faz login no painel.',
            'Também não carregamos fontes, scripts ou imagens de servidores de terceiros, o que '
            'evita que a sua visita seja registrada por outra empresa.',
            'Se passarmos a utilizar medição de audiência, tag de conversão de anúncios ou pixel de '
            'rede social, um aviso de consentimento será apresentado <strong>antes</strong> de qualquer '
            'coleta, e esta política será atualizada na mesma ocasião.')),

        ('', 'Segurança e mudanças', 'Segurança, alterações e foro', p(
            'Adotamos medidas técnicas e administrativas para proteger os dados, incluindo tráfego '
            'criptografado (HTTPS), controle de acesso ao servidor e backups.',
            'Esta política pode ser alterada. A data de última atualização aparece no topo. '
            'Mudanças relevantes serão comunicadas nesta página.',
            'Fica eleito o foro da Comarca de Vitória da Conquista/BA para dirimir questões '
            'decorrentes deste documento.')),
    ]

    # --------------------------------------------------------------- TERMOS
    termos = [
        ('alt', 'Objeto', 'O que este site é', p(
            'Este site é operado pela %s.' % ident,
            'Ele existe para apresentar informações sobre consórcio e sobre os grupos oferecidos, '
            'e para colocar você em contato com um consultor. <strong>Nada aqui constitui proposta, '
            'oferta vinculante ou contrato.</strong>')),

        ('', 'Papéis', 'Quem faz o quê', p(
            'A MOVECON é uma plataforma de consórcio. Os grupos são administrados pela '
            '<strong>%s</strong>, administradora autorizada a funcionar pelo Banco Central do Brasil.' % adm,
            'A relação contratual de consórcio é firmada com a administradora e regida pela '
            'Lei nº 11.795/2008, pelas normas do Banco Central e pelo contrato de adesão do grupo, '
            'que você recebe e lê antes de aderir.')),

        ('alt', 'Simulações', 'Simulações e valores', p(
            'Os simuladores deste site produzem <strong>estimativas</strong>, calculadas no seu próprio '
            'navegador a partir de parâmetros de referência. Eles servem para planejamento.',
            '<strong>Os valores exatos</strong> — taxa de administração, fundo de reserva, prazo e valor '
            'da parcela — são os que constam do contrato do grupo, confirmados pela administradora no '
            'momento da adesão. Em caso de divergência, prevalece sempre o contrato.',
            'Nenhuma informação deste site garante contemplação, prazo de contemplação ou liberação de '
            'crédito. A contemplação ocorre por sorteio ou por lance nas assembleias do grupo.')),

        ('', 'Uso do site', 'Como você pode usar', p(
            'Você pode navegar, ler e compartilhar o conteúdo deste site livremente, citando a fonte. '
            'É vedado:'
        ) + '\n' + ul('', [
            'reproduzir o conteúdo como se fosse seu, ou remover a atribuição;',
            'usar o site para qualquer finalidade ilícita ou que viole direitos de terceiros;',
            'tentar obter acesso não autorizado a áreas restritas, ou interferir no funcionamento do site;',
            'utilizar a marca, o logotipo ou a identidade visual da MOVECON sem autorização por escrito.',
        ])),

        ('alt', 'Conteúdo', 'Propriedade intelectual e links externos', p(
            'Textos, layout, identidade visual e código deste site pertencem à MOVECON ou são usados '
            'sob licença. A marca MOVECON e seus elementos visuais são protegidos.',
            'Este site contém links para serviços de terceiros, como o portal do consorciado operado '
            'pela administradora e o WhatsApp. Não controlamos esses serviços e não respondemos por '
            'seu conteúdo, disponibilidade ou políticas.')),

        ('', 'Limites', 'Limitação de responsabilidade', p(
            'Empregamos esforços para manter as informações corretas e atualizadas, mas o conteúdo é '
            'de caráter informativo e pode conter imprecisões ou desatualizações.',
            'Não respondemos por decisões tomadas exclusivamente com base no conteúdo deste site, sem '
            'a leitura do contrato e sem orientação de um consultor. Consórcio é uma decisão financeira '
            'de longo prazo: leia o contrato antes de assinar.')),

        ('alt', 'Alterações', 'Alterações e foro', p(
            'Estes termos podem ser alterados a qualquer momento. A data de última atualização aparece '
            'no topo desta página, e o uso continuado do site após a alteração significa concordância.',
            'Aplica-se a legislação brasileira. Fica eleito o foro da Comarca de Vitória da Conquista/BA '
            'para dirimir questões decorrentes destes termos.')),
    ]

    return priv, termos


def render(h1, eyebrow, lead, fecho, secoes):
    blocos = []
    for alt, eb, tit, corpo in secoes:
        blocos.append(SEC % dict(alt=(' sec--alt' if alt else ''),
                                 eyebrow=eb, titulo=tit, corpo=corpo))
    return TPL % dict(h1=h1, eyebrow=eyebrow, lead=lead, fecho=fecho,
                      secoes='\n\n'.join(blocos))


def main():
    with io.open(os.path.join(RAIZ, 'content', 'keyword-map.json'), encoding='utf-8') as fh:
        mapa = json.load(fh)
    site = mapa['site']
    rotas = {r['url']: r for r in mapa['rotas']}

    for u in ('/politica-de-privacidade/', '/termos-de-uso/'):
        if u not in rotas:
            print('[X] %s nao esta no keyword-map.' % u); return 1

    if not os.path.isdir(BUILD):
        os.makedirs(BUILD)

    priv, termos = montar(site)

    io.open(os.path.join(BUILD, 'legal-privacidade.html'), 'w', encoding='utf-8').write(
        render('Política de Privacidade', 'LGPD',
               'Este documento descreve, em linguagem direta, quais dados este site coleta, por que, '
               'com quem compartilha e o que você pode exigir. Sem cláusula genérica: só o que '
               'realmente acontece aqui.',
               'Se algo neste documento não estiver claro, ou se você quiser exercer um direito '
               'previsto na LGPD, fale conosco.',
               priv))

    io.open(os.path.join(BUILD, 'legal-termos.html'), 'w', encoding='utf-8').write(
        render('Termos de Uso', 'Condições de uso',
               'As condições para usar este site, o que ele é e o que ele não é. Em especial: nada '
               'aqui constitui proposta, e simulação não é contrato.',
               'Ficou alguma dúvida sobre estes termos? Fale com a gente antes de aderir a qualquer grupo.',
               termos))

    for f in ('legal-privacidade.html', 'legal-termos.html'):
        n = os.path.getsize(os.path.join(BUILD, f))
        print('  build/%-26s %d bytes' % (f, n))
    print('\n2 paginas legais geradas. NAO publicadas: exigem revisao juridica.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
