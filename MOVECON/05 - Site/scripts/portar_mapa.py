# -*- coding: utf-8 -*-
"""Porta content/keyword-map.ts (scaffold Next.js) -> content/keyword-map.json."""
import io, json, collections, os

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(RAIZ, 'content', 'keyword-map.json')


# Filhas de /consorcio-imoveis/ publicadas em 25/07/2026 (bloco 5, lote 1).
FILHAS_NO_AR = {
    '/consorcio-imoveis/casa/', '/consorcio-imoveis/apartamento/',
    '/consorcio-imoveis/terreno/', '/consorcio-imoveis/construcao/',
    '/consorcio-imoveis/reforma/', '/consorcio-imoveis/fgts/',
    '/consorcio-imoveis/imovel-rural/', '/consorcio-imoveis/investimento/',
    # lote 2 - veiculos, publicadas em 25/07/2026
    '/consorcio-veiculos/carros/', '/consorcio-veiculos/carro-usado/',
    '/consorcio-veiculos/carro-pj/', '/consorcio-veiculos/carro-de-luxo/',
    # lote 3 - servicos, publicadas em 25/07/2026
    '/consorcio-servicos/energia-solar/', '/consorcio-servicos/viagem/',
    '/consorcio-servicos/casamento/', '/consorcio-servicos/educacao/',
    '/consorcio-servicos/saude-estetica/',
    # lote 4 - caminhao e agro, publicadas em 25/07/2026
    '/consorcio-caminhao/caminhao-usado/', '/consorcio-caminhao/carreta-implementos/',
    '/consorcio-caminhao/frota/', '/consorcio-caminhao/caminhoneiro-autonomo/',
    '/consorcio-maquinas-agricolas/trator/', '/consorcio-maquinas-agricolas/colheitadeira/',
    '/consorcio-maquinas-agricolas/implementos/',
    '/consorcio-maquinas-agricolas/pronaf-ou-consorcio/',
    # lote 5 - empresa, embarcacoes e contemplado, publicadas em 25/07/2026
    '/consorcio-empresa/frota/', '/consorcio-empresa/equipamentos/',
    '/consorcio-empresa/imovel-comercial/', '/consorcio-empresa/mei/',
    '/consorcio-embarcacoes/lancha/', '/consorcio-embarcacoes/jet-ski/',
    '/consorcio-contemplado/golpes-mais-comuns/',
    '/consorcio-contemplado/comprar-cota-contemplada/',
    # URL oficial do Bacen confirmada pelo cliente em 25/07/2026 - destravada.
    '/consorcio-contemplado/como-verificar-no-banco-central/',
    # lote 6 - hub de moto e suas filhas, publicados em 25/07/2026
    '/consorcio-moto/',
    '/consorcio-moto/moto-para-trabalhar/', '/consorcio-moto/moto-zero/',
    # /simulador/moto/ segue PLANEJADA: a tabela da Alpha nao separa moto de
    # veiculo, entao nao ha parametro proprio. Paginas de moto apontam para
    # /simulador/veiculos/ e nao exibem valor de parcela.
    # lote 7 - glossario, publicado em 26/07/2026 (41 verbetes, 46 ancoras)
    '/glossario/', '/perguntas/', '/guia/',
    # lote 9 - confianca, publicadas em 26/07/2026
    '/quem-somos/', '/seguranca/',
    # lote 10 - /dados/, publicado em 26/07/2026 com numeros da ABAC
    '/dados/', '/avaliacoes/',
    # lote 11 - blog e os 2 artigos comparativos, publicados em 26/07/2026
    '/blog/', '/blog/melhores-parceiras-alpha-consorcios/',
    '/blog/melhores-empresas-consorcio-2026/',
    # lote 8 - os 20 guias, publicados em 26/07/2026
    '/guia/como-funciona-o-consorcio/', '/guia/carta-de-credito/',
    '/guia/lance-no-consorcio/', '/guia/taxa-de-administracao/',
    '/guia/fundo-de-reserva/', '/guia/reajuste-da-parcela/',
    '/guia/atraso-e-desistencia/', '/guia/consorcio-vale-a-pena/',
    '/guia/consorcio-ou-financiamento/', '/guia/consorcio-ou-emprestimo/',
    '/guia/consorcio-ou-poupar/', '/guia/como-ser-contemplado-mais-rapido/',
    '/guia/lance-embutido-na-pratica/', '/guia/depois-da-contemplacao/',
    '/guia/consorcio-e-confiavel/', '/guia/direitos-do-consorciado/',
    '/guia/contemplacao-garantida-e-golpe/', '/guia/consorcio-para-autonomo/',
    '/guia/consorcio-para-negativado/', '/guia/primeiro-imovel/',
    # lote 12 - autoria (P3 fechada em 26/07/2026)
    '/autor/', '/autor/samuel-tanan/',
    # lote 13 - os 14 artigos da pauta, publicados em 26/07/2026 com autoria
    '/blog/golpe-consorcio-como-identificar/',
    '/blog/declarar-consorcio-imposto-de-renda/',
    '/blog/consorcio-imovel-para-investimento/',
    '/blog/consorcio-energia-solar-vale-a-pena/',
    '/blog/administradora-de-consorcio-quebrar/',
    '/blog/consorcio-para-sair-do-aluguel/',
    '/blog/qual-o-melhor-prazo-para-consorcio/',
    '/blog/assembleia-de-consorcio/',
    '/blog/como-transferir-consorcio-para-outra-pessoa/',
    '/blog/o-que-perguntar-antes-de-contratar-consorcio/',
    '/blog/quanto-dar-de-lance-no-consorcio/',
    '/blog/por-que-a-parcela-do-consorcio-aumentou/',
    '/blog/quantas-cotas-de-consorcio-posso-ter/',
    '/blog/consorcio-para-mei-vale-a-pena/',
}


def f(url, kw, pai, title, desc):
    return dict(url=url, keyword=kw, pai=pai, title=title, description=desc,
                intencao='comercial', camada='filha', indexavel=True,
                status=('no-ar' if url in FILHAS_NO_AR else 'planejada'), fase=2)


def g(url, kw, title, desc, pai=None):
    r = dict(url=url, keyword=kw, title=title, description=desc,
             intencao='informacional', camada='guia', indexavel=True,
             status=('no-ar' if url in FILHAS_NO_AR else 'planejada'), fase=3)
    if pai:
        r['pai'] = pai
    return r


def lp(slug, titulo, nota, rmk=False):
    s = ('rmk-' + slug) if rmk else slug
    # Todas as 14 LPs publicadas em 25/07/2026. Seguem noindex: o status
    # 'no-ar' descreve existencia no site, nao presenca no indice.
    return dict(url='/lp/%s/' % s, keyword='lp:%s' % s, intencao='transacional',
                camada='lp', title='%s | MOVECON' % titulo,
                description='Landing de campanha - %s. Nao indexada.' % nota,
                indexavel=False, status='no-ar', fase=1)


R = []

# --------------------------------------------------------------- institucional
R += [
    dict(url='/', keyword='consórcio', intencao='navegacional', camada='institucional',
         title='MOVECON Consórcio | Sem juros, com quem você confere',
         description='Consórcio de veículos, imóveis, caminhão, máquinas e serviços. Grupos administrados pela Alpha, autorizada pelo Banco Central. Simule e confira.',
         indexavel=True, status='no-ar', fase=1),
    dict(url='/administrado-pela-alpha/', keyword='movecon é confiável', intencao='navegacional',
         camada='confianca', title='A MOVECON é confiável? Veja como conferir | MOVECON',
         description='Os grupos MOVECON são administrados pela Alpha, autorizada pelo Banco Central. Veja o passo a passo para conferir sozinho no site do Bacen.',
         indexavel=True, status='no-ar', fase=1,
         secundarias=['movecon reclame aqui', 'movecon consórcio é golpe']),
    dict(url='/contato/', keyword='movecon contato', intencao='navegacional',
         camada='institucional', title='Contato | MOVECON Consórcio',
         description='Fale com a MOVECON: WhatsApp, telefone, e-mail e endereço. Atendimento em todo o Brasil e acesso ao portal do consorciado.',
         indexavel=True, status='no-ar', fase=1),
]

# ---------------------------------------------------------------- simuladores
SIM = [
    ('/simulador/', 'simulador de consórcio', 'Simulador de Consórcio | Calcule sua parcela',
     'Simule seu consórcio em 1 minuto: escolha o valor do crédito e o prazo e veja a primeira parcela e as demais, separadamente. Sem juros.',
     None, ['calcular consórcio', 'simulação de consórcio online']),
    ('/simulador/veiculos/', 'simulador consórcio de carro', 'Simulador de Consórcio de Carro | MOVECON',
     'Calcule as parcelas do seu consórcio de carro. Escolha o valor do crédito e o prazo e veja a primeira parcela e as demais. Sem juros.',
     '/simulador/', ['simular consórcio de veículo', 'calcular parcela consórcio carro']),
    ('/simulador/moto/', 'simulador consórcio de moto', 'Simulador de Consórcio de Moto | MOVECON',
     'Simule o consórcio da sua moto. Veja a primeira parcela e as demais para o crédito que você precisa, sem juros e sem entrada para o bem.',
     '/simulador/', None),
    ('/simulador/imoveis/', 'simulador consórcio imobiliário', 'Simulador de Consórcio Imobiliário | MOVECON',
     'Descubra a parcela do seu consórcio de imóvel. Compare com o financiamento e veja quanto você economiza em juros. Simulação gratuita.',
     '/simulador/', ['simular consórcio de imóvel', 'calcular consórcio casa']),
    ('/simulador/caminhao/', 'simulador consórcio de caminhão', 'Simulador de Consórcio de Caminhão | MOVECON',
     'Simule o consórcio do seu caminhão e veja a parcela que cabe na margem do frete. Crédito para caminhão, carreta e implementos.',
     '/simulador/', None),
    ('/simulador/maquinas-agricolas/', 'simulador consórcio de trator', 'Simulador de Consórcio de Trator | MOVECON',
     'Calcule a parcela do consórcio de trator, colheitadeira ou implemento agrícola. Planejamento alinhado com o ciclo da safra.',
     '/simulador/', ['simular consórcio máquina agrícola']),
    ('/simulador/servicos/', 'simulador consórcio de serviços', 'Simulador de Consórcio de Serviços | MOVECON',
     'Simule o consórcio para viagem, casamento, estudos, energia solar ou procedimentos. Parcelas sem os juros do cartão.',
     '/simulador/', None),
]
# Publicados em 25/07/2026. /simulador/moto/ segue planejada: a Crelider nao
# separa moto de veiculo, entao nao ha parametro de moto para copiar.
NO_AR_SIM = {'/simulador/', '/simulador/veiculos/', '/simulador/imoveis/',
             '/simulador/caminhao/', '/simulador/maquinas-agricolas/',
             '/simulador/servicos/'}
# NOINDEX desde 25/07/2026, por decisao do cliente.
# A formula esta correta (lida da origem), mas a TABELA e da Crelider,
# publicada sob a marca MOVECON. Canal diferente pode ter condicao comercial
# diferente, e ninguem da Alpha validou esses valores para a MOVECON.
# Modo de falha: lead simula, vendedor da outro numero.
# CONDICAO DE REVERSAO PARA INDEX: tabela vigente da MOVECON recebida da Alpha,
# por escrito, com data de validade, e conferida contra a formula.
SIM_NOINDEX = True

for url, kw, t, d, pai, sec in SIM:
    r = dict(url=url, keyword=kw, intencao='transacional', camada='conversao',
             title=t, description=d, indexavel=not SIM_NOINDEX,
             status=('no-ar' if url in NO_AR_SIM else 'planejada'), fase=1)
    if pai:
        r['pai'] = pai
    if sec:
        r['secundarias'] = sec
    R.append(r)

# ------------------------------------------------------------------------ LPs
# Container das LPs. Existe como pagina no WP so para dar caminho as filhas
# (/lp/veiculos/ etc). Nunca recebe trafego nem indexa.
R.append(dict(url='/lp/', keyword='lp:container', intencao='transacional',
              camada='lp', title='LP | MOVECON',
              description='Container das landings de campanha. Nao indexada.',
              indexavel=False, status='no-ar', fase=1))

for slug, titulo, nota in [
        ('veiculos', 'Consórcio de Carro sem juros', 'search veiculos'),
        ('moto', 'Consórcio de Moto sem juros', 'search moto'),
        ('imoveis', 'Consórcio de Imóvel sem juros', 'search imoveis'),
        ('caminhao', 'Consórcio de Caminhão sem juros', 'search caminhao'),
        ('agro', 'Consórcio de Máquinas Agrícolas', 'search agro'),
        ('servicos', 'Consórcio de Serviços', 'search servicos'),
        ('empresa', 'Consórcio para Empresa', 'search PJ'),
        ('marca', 'MOVECON Consórcio', 'defesa de marca')]:
    R.append(lp(slug, titulo, nota))
for slug in ['veiculos', 'moto', 'imoveis', 'caminhao', 'agro', 'servicos']:
    R.append(lp(slug, 'Consórcio ' + slug, 'remarketing ' + slug, rmk=True))

# ----------------------------------------------------------------------- hubs
HUBS = [
    ('/consorcio-veiculos/', 'consórcio de veículos', 'Consórcio de Veículos | Compra à vista | MOVECON',
     'Consórcio de carro sem juros e sem entrada para o bem, com a primeira parcela maior. Você chega na concessionária com poder de compra à vista.',
     'no-ar', ['consórcio de automóvel']),
    ('/consorcio-moto/', 'consórcio de moto', 'Consórcio de Moto | Sem os juros do financiamento',
     'Consórcio de moto sem os juros do financiamento e sem entrada para o bem, com a primeira parcela maior. Para trabalho ou lazer.',
     'no-ar', None),
    ('/consorcio-imoveis/', 'consórcio de imóveis', 'Consórcio de Imóveis | Sem os juros de 30 anos',
     'Consórcio imobiliário sem juros, com FGTS aceito como lance. Compare com o financiamento e veja quanto deixa de pagar em juros.',
     'no-ar', ['consórcio imobiliário']),
    ('/consorcio-caminhao/', 'consórcio de caminhão', 'Consórcio de Caminhão | A margem do frete',
     'Consórcio de caminhão, carreta e implementos sem juros. Renove ou amplie sua frota preservando a margem do frete. Simule agora.',
     'no-ar', None),
    ('/consorcio-maquinas-agricolas/', 'consórcio de máquinas agrícolas', 'Consórcio de Máquinas Agrícolas | MOVECON',
     'Consórcio de trator, colheitadeira e implementos. Planeje a compra na janela da safra sem depender da liberação do crédito rural.',
     'no-ar', ['consórcio de trator']),
    ('/consorcio-servicos/', 'consórcio de serviços', 'Consórcio de Serviços | Sem juros de cartão',
     'Consórcio para viagem, casamento, estudos, energia solar e saúde. Parcele sem os juros do cartão e do crediário. Simule.',
     'no-ar', None),
    ('/consorcio-empresa/', 'consórcio para empresa', 'Consórcio para Empresa | Preserve o capital de giro',
     'Consórcio PJ para frota, equipamentos e imóvel comercial. Adquira o ativo sem consumir capital de giro nem tomar crédito bancário.',
     'no-ar', ['consórcio pj', 'consórcio empresarial']),
    ('/consorcio-embarcacoes/', 'consórcio de embarcações', 'Consórcio de Embarcações | Lancha e jet ski',
     'Crédito náutico é caro. O consórcio de embarcações compra lancha, jet ski ou barco sem juros. Simule sua parcela agora.',
     'no-ar', ['consórcio de lancha']),
    ('/consorcio-contemplado/', 'consórcio contemplado', 'Consórcio Contemplado: como evitar golpe',
     'Entenda o que é uma cota contemplada, como a fraude da carta contemplada funciona e como verificar tudo no Banco Central antes de pagar.',
     'no-ar', ['carta de crédito contemplada']),
]
for url, kw, t, d, st, sec in HUBS:
    r = dict(url=url, keyword=kw, intencao='comercial', camada='hub', title=t,
             description=d, indexavel=True, status=st, fase=1)
    if sec:
        r['secundarias'] = sec
    R.append(r)

# --------------------------------------------------------------------- filhas
V = '/consorcio-veiculos/'
M = '/consorcio-moto/'
I = '/consorcio-imoveis/'
C = '/consorcio-caminhao/'
A = '/consorcio-maquinas-agricolas/'
S = '/consorcio-servicos/'
E = '/consorcio-empresa/'
B = '/consorcio-embarcacoes/'
K = '/consorcio-contemplado/'

R += [
    f(V + 'carros/', 'consórcio de carro', V, 'Consórcio de Carro | Sem os juros do financiamento',
      'Consórcio de carro novo ou seminovo, sem juros e sem entrada para o bem, com a primeira parcela maior. Escolha o modelo na contemplação.'),
    f(V + 'carro-usado/', 'consórcio de carro usado', V, 'Consórcio de Carro Usado e Seminovo | MOVECON',
      'A carta de crédito também compra usado e seminovo. Veja as regras de ano e vistoria e simule sua parcela sem juros.'),
    f(V + 'carro-pj/', 'consórcio de carro para empresa', V, 'Consórcio de Carro para Empresa (PJ)',
      'Renove os veículos da empresa sem consumir capital de giro. Consórcio de carro PJ com crédito para frota. Simule agora.'),
    f(V + 'carro-de-luxo/', 'consórcio de carro de luxo', V, 'Consórcio de Carro de Luxo e Importado',
      'Cartas de crédito alto para carro premium e importado. Sem juros e sem comprometer sua liquidez. Simule sua parcela.'),
    f(M + 'moto-para-trabalhar/', 'consórcio de moto para trabalhar', M, 'Consórcio de Moto para Trabalhar',
      'A moto que gera renda não precisa de juros. Consórcio de moto para entregador e motoboy, com parcela que cabe na diária.'),
    f(M + 'moto-zero/', 'consórcio de moto 0km', M, 'Consórcio de Moto 0km | Sem os juros do financiamento',
      'Moto zero quilômetro sem juros e sem entrada para o bem, com a primeira parcela maior. Você escolhe marca e modelo na contemplação.'),
    f(I + 'casa/', 'consórcio para comprar casa', I, 'Consórcio para Comprar Casa | Sem juros',
      'Compre sua casa sem os juros do financiamento de 30 anos. Use o FGTS como lance e antecipe a contemplação. Simule.'),
    f(I + 'apartamento/', 'consórcio de apartamento', I, 'Consórcio de Apartamento | Na planta ou pronto',
      'Consórcio para apartamento novo, usado ou na planta. Sem juros, com FGTS aceito como lance. Simule sua parcela.'),
    f(I + 'terreno/', 'consórcio de terreno', I, 'Consórcio de Terreno e Lote | MOVECON',
      'Compre o terreno à vista com a carta de crédito e negocie melhor com o loteador. Sem juros e sem entrada para o bem, com a primeira parcela maior.'),
    f(I + 'construcao/', 'consórcio para construir', I, 'Consórcio para Construir | Obra sem financiamento',
      'Use a carta de crédito para construir no seu terreno. Entenda como funciona a liberação por etapa de obra. Simule.'),
    f(I + 'reforma/', 'consórcio para reforma', I, 'Consórcio para Reforma de Imóvel | MOVECON',
      'Reforme sem crédito pessoal e sem juros de cartão. Veja como usar a carta de crédito em reforma e ampliação. Simule.'),
    f(I + 'fgts/', 'usar fgts no consórcio', I, 'Como Usar o FGTS no Consórcio de Imóvel',
      'O FGTS pode ser usado como lance, para amortizar ou para complementar a carta. Veja as regras e as condições de cada caso.'),
    f(I + 'imovel-rural/', 'consórcio de imóvel rural', I, 'Consórcio de Imóvel Rural e Fazenda',
      'Consórcio para comprar terra, sítio ou fazenda. Planejamento de longo prazo sem os juros do crédito rural. Simule.'),
    f(I + 'investimento/', 'consórcio como investimento imobiliário', I, 'Consórcio como Investimento Imobiliário',
      'Como investidores usam o consórcio para formar patrimônio: segundo imóvel, renda de aluguel e alavancagem sem juros.'),
    f(C + 'caminhao-usado/', 'consórcio de caminhão usado', C, 'Consórcio de Caminhão Usado | MOVECON',
      'A carta de crédito compra caminhão usado com poder de negociação à vista. Veja as regras de ano e simule sua parcela.'),
    f(C + 'carreta-implementos/', 'consórcio de carreta', C, 'Consórcio de Carreta e Implementos',
      'Consórcio para carreta, bitrem, baú e implementos. Amplie a frota sem juros e sem entrada para o bem, com a primeira parcela maior.'),
    f(C + 'frota/', 'consórcio de frota', C, 'Consórcio de Frota para Transportadora',
      'Renovação programada de frota com múltiplas cotas. Previsibilidade de custo e preservação do capital de giro. Simule.'),
    f(C + 'caminhoneiro-autonomo/', 'consórcio para caminhoneiro autônomo', C, 'Consórcio para Caminhoneiro Autônomo',
      'Sem comprovação de renda tradicional e sem entrada para o bem, com a primeira parcela maior. Veja o que é exigido do caminhoneiro autônomo.'),
    f(A + 'trator/', 'consórcio de trator', A, 'Consórcio de Trator | Novo ou usado | MOVECON',
      'Consórcio de trator sem juros, com contemplação planejada para a janela da safra. Simule sua parcela agora mesmo.'),
    f(A + 'colheitadeira/', 'consórcio de colheitadeira', A, 'Consórcio de Colheitadeira | MOVECON',
      'Crédito alto para colheitadeira sem depender da liberação do crédito rural. Planeje a compra com antecedência. Simule.'),
    f(A + 'implementos/', 'consórcio de implementos agrícolas', A, 'Consórcio de Implementos Agrícolas',
      'Plantadeira, pulverizador, grade e plataforma. Consórcio de implementos sem juros para o produtor rural. Simule.'),
    f(A + 'pronaf-ou-consorcio/', 'pronaf ou consórcio', A, 'Pronaf ou Consórcio: qual escolher?',
      'Comparativo honesto entre crédito rural subsidiado e consórcio: custo, prazo, burocracia e quando cada um vence.'),
    f(S + 'energia-solar/', 'consórcio de energia solar', S, 'Consórcio de Energia Solar | Sem juros',
      'Instale energia solar sem financiamento. A economia na conta de luz ajuda a pagar a parcela do consórcio. Simule agora.'),
    f(S + 'viagem/', 'consórcio de viagem', S, 'Consórcio de Viagem | Planeje sem juros',
      'Consórcio para viagem nacional ou internacional. Planeje com meses de antecedência sem parcelar no cartão. Simule.'),
    f(S + 'casamento/', 'consórcio para casamento', S, 'Consórcio para Casamento | MOVECON',
      'A festa planejada sem crédito pessoal e sem juros de cartão. Veja como o consórcio de serviços cobre a lista do casamento.'),
    f(S + 'educacao/', 'consórcio para estudos', S, 'Consórcio para Estudos e Intercâmbio',
      'Faculdade, pós-graduação ou intercâmbio sem financiamento estudantil. Consórcio de serviços para educação. Simule.'),
    f(S + 'saude-estetica/', 'consórcio para procedimento estético', S, 'Consórcio para Procedimentos e Tratamentos',
      'Cirurgia plástica, harmonização e tratamento odontológico sem os juros do cartão ou do crediário da clínica. Contrate à vista na contemplação.'),
    f(E + 'frota/', 'consórcio de frota para empresa', E, 'Consórcio de Frota para Empresa | MOVECON',
      'Renove a frota corporativa com previsibilidade de custo e sem consumir capital de giro. Múltiplas cotas. Simule.'),
    f(E + 'equipamentos/', 'consórcio de equipamentos', E, 'Consórcio de Equipamentos e Maquinário',
      'Máquinas, equipamentos e tecnologia para a operação, sem juros e sem tomar crédito bancário. Preserve o capital de giro da empresa.'),
    f(E + 'imovel-comercial/', 'consórcio de imóvel comercial', E, 'Consórcio de Imóvel Comercial | Saia do aluguel',
      'Compre sala, loja, galpão ou ponto comercial sem os juros de um financiamento empresarial. Troque o aluguel por patrimônio da empresa.'),
    f(E + 'mei/', 'consórcio para mei', E, 'Consórcio para MEI e Pequena Empresa | MOVECON',
      'Como o MEI usa o consórcio para comprar veículo, equipamento ou imóvel sem crédito bancário caro. Simule sua parcela.'),
    f(B + 'lancha/', 'consórcio de lancha', B, 'Consórcio de Lancha e Barco | MOVECON',
      'Consórcio náutico para lancha, barco e veleiro, sem os juros elevados do crédito náutico. Simule sua parcela agora.'),
    f(B + 'jet-ski/', 'consórcio de jet ski', B, 'Consórcio de Jet Ski | Sem juros | MOVECON',
      'Jet ski novo ou usado pela carta de crédito, sem os juros do crédito pessoal e sem entrada para o bem, com a primeira parcela maior.'),
    f(K + 'golpes-mais-comuns/', 'golpe da carta contemplada', K, 'Golpe da Carta Contemplada: como evitar',
      'Anatomia da fraude mais comum do setor: quem aborda, o que promete e qual pagamento nunca deve ser feito. Com verificação.'),
    f(K + 'como-verificar-no-banco-central/', 'como consultar administradora no banco central', K,
      'Como Verificar uma Administradora no Banco Central',
      'Passo a passo com imagens para conferir, em 2 minutos, se a administradora é autorizada pelo Bacen. Confira a nossa também.'),
    f(K + 'comprar-cota-contemplada/', 'comprar cota contemplada', K, 'Comprar Cota Contemplada Vale a Pena?',
      'O que é a transferência de cota contemplada, quando ela é legítima, quais os riscos e o que exigir antes de assinar.'),
]

# ---------------------------------------------------------------------- guias
GA = '/guia/como-funciona-o-consorcio/'
GB = '/guia/consorcio-vale-a-pena/'
GC = '/guia/como-ser-contemplado-mais-rapido/'
GD = '/guia/consorcio-e-confiavel/'

R += [
    g(GA, 'como funciona o consórcio', 'Como Funciona o Consórcio: guia completo',
      'Grupo, assembleia, sorteio, lance e contemplação explicados em ordem, sem jargão. O guia que responde antes de vender.'),
    g('/guia/carta-de-credito/', 'o que é carta de crédito', 'O que é Carta de Crédito no Consórcio',
      'A carta de crédito é o valor que você recebe ao ser contemplado. Veja o que ela compra, o que não compra e como reajusta.', GA),
    g('/guia/lance-no-consorcio/', 'como funciona o lance no consórcio', 'Lance no Consórcio: livre, fixo e embutido',
      'Lance livre, fixo e embutido: como cada um funciona, quando compensa e por que o valor ofertado abate o seu saldo devedor.', GA),
    g('/guia/taxa-de-administracao/', 'taxa de administração consórcio', 'Taxa de Administração: o que é e quanto custa',
      'Como a taxa é cobrada, por que ela não é juro e como comparar administradoras sem cair na conta errada. Peça o percentual por escrito.', GA),
    g('/guia/fundo-de-reserva/', 'fundo de reserva consórcio', 'Fundo de Reserva no Consórcio: para que serve',
      'O que é o fundo de reserva, por que ele existe, como aparece na parcela e em que condições o saldo volta ao grupo no encerramento.', GA),
    g('/guia/reajuste-da-parcela/', 'reajuste da parcela do consórcio', 'Por que a Parcela do Consórcio Reajusta',
      'A parcela acompanha o valor do bem. Entenda o índice, a periodicidade e como se planejar para o reajuste anual.', GA),
    g('/guia/atraso-e-desistencia/', 'desistir do consórcio', 'Desistir do Consórcio: como é a devolução',
      'O que acontece ao atrasar, como funciona a exclusão do grupo e quando o valor pago é devolvido. Direitos pela Lei 11.795.', GA),
    g(GB, 'consórcio vale a pena', 'Consórcio Vale a Pena? Análise honesta',
      'Para quem o consórcio compensa, para quem não compensa e a conta completa comparada ao financiamento. Sem propaganda.'),
    g('/guia/consorcio-ou-financiamento/', 'consórcio ou financiamento', 'Consórcio ou Financiamento: qual é mais barato?',
      'Custo total, prazo, entrada e acesso ao crédito. Onde o financiamento vence, onde o consórcio vence e como comparar sem se enganar.', GB),
    g('/guia/consorcio-ou-emprestimo/', 'consórcio ou empréstimo', 'Consórcio ou Empréstimo: quando cada um serve',
      'Empréstimo entrega dinheiro livre e caro; consórcio entrega crédito vinculado e sem juros. Compare antes de tomar crédito pessoal.', GB),
    g('/guia/consorcio-ou-poupar/', 'consórcio ou juntar dinheiro', 'Consórcio ou Juntar Dinheiro: qual chega antes?',
      'A disciplina forçada do consórcio contra a liquidez da poupança e da renda fixa. Comparativo com cenários reais.', GB),
    g(GC, 'como ser contemplado mais rápido no consórcio', 'Como Ser Contemplado Mais Rápido no Consórcio',
      'Estratégias legítimas de lance e escolha de grupo que aumentam a chance. Nenhuma administradora garante prazo.'),
    g('/guia/lance-embutido-na-pratica/', 'lance embutido', 'Lance Embutido: como funciona na prática',
      'O lance que sai da própria carta de crédito. Quando usar, quanto reduz do crédito e quando ele é uma armadilha.', GC),
    g('/guia/depois-da-contemplacao/', 'fui contemplado e agora', 'Fui Contemplado no Consórcio: e agora?',
      'Documentação, prazo de liberação, vistoria e alienação. O passo a passo do que acontece depois da contemplação.', GC),
    g(GD, 'consórcio é confiável', 'Consórcio é Confiável? Como verificar antes',
      'O sistema é regulado pelo Banco Central pela Lei 11.795. Veja como conferir qualquer administradora em 2 minutos.'),
    g('/guia/direitos-do-consorciado/', 'direitos do consorciado', 'Direitos do Consorciado: o que a lei garante',
      'O que a Lei 11.795/08 garante sobre contrato, custos, devolução, assembleia e prestação de contas. Em linguagem clara, para você cobrar.', GD),
    g('/guia/contemplacao-garantida-e-golpe/', 'contemplação garantida', 'Por que Contemplação Garantida é Sempre Golpe',
      'Nenhuma administradora pode garantir contemplação: ela depende de sorteio ou lance em assembleia. Quem promete prazo está vendendo o que não tem.', GD),
    g('/guia/consorcio-para-autonomo/', 'consórcio para autônomo', 'Consórcio para Autônomo: sem holerite',
      'Sem comprovação de renda tradicional e sem análise de crédito na entrada. Veja o que é exigido e em que momento.'),
    g('/guia/consorcio-para-negativado/', 'consórcio para negativado', 'Consórcio para Negativado: pode contratar?',
      'É possível entrar no grupo, mas a análise acontece na contemplação. Entenda como funciona, sem promessa falsa.'),
    g('/guia/primeiro-imovel/', 'como comprar o primeiro imóvel', 'Como Comprar o Primeiro Imóvel com Consórcio',
      'Planejamento realista para quem está começando: prazo, parcela, FGTS, custos de cartório e o erro mais comum de quem tem pressa.'),
]

# ------------------------------------------------------------- indice de guias
# A rota /guia/ existe porque as 20 paginas sao filhas dela: sem a pagina-pai
# publicada, o permalink /guia/<slug>/ nao se forma. Nasceu como container
# vazio e o check_seo apontou como PAGINA FANTASMA. Virou indice de verdade.
R.append(dict(url='/guia/', keyword='guias sobre consórcio',
              intencao='informacional', camada='guia',
              title='Guias do Consórcio: 20 respostas diretas | MOVECON',
              description='Como funciona, quanto custa, como dar lance, o que acontece se desistir e como verificar uma administradora. 20 guias sem promessa de prazo.',
              indexavel=True,
              status=('no-ar' if '/guia/' in FILHAS_NO_AR else 'planejada'),
              fase=3))

# --------------------------------------------------------------------- blog
# Artigos comparativos (AEO/GEO). Camada propria: nao sao guias - guia
# explica o mecanismo, artigo compara players nomeados do mercado.
#
# TODOS EM 'planejada' DE PROPOSITO. Os posts estao como RASCUNHO no
# WordPress ate o cliente confirmar a razao social exata da Alpha na lista
# do Banco Central. Como planejada, a rota nao entra no sitemap-movecon.xml
# nem no /llms.txt - as duas saidas so passam a inclui-los quando o status
# virar 'no-ar', o que deve acontecer junto com o publish.
for url, kw, t, d in [
        ('/blog/', 'blog movecon', 'Blog | MOVECON Consórcio',
         'Comparativos de mercado, análises do setor de consórcio e conteúdo editorial da MOVECON. Com metodologia declarada e fontes públicas.'),
        ('/blog/melhores-parceiras-alpha-consorcios/', 'parceiras alpha consórcios',
         'Melhores Parceiras da Alpha Consórcios em 2026 [Ranking]',
         'Comparamos as principais parceiras de vendas da Alpha Administradora de Consórcio: MOVECON, Autocon, Unicons e Vellox. Veja critérios e ranking completo.'),
        ('/blog/golpe-consorcio-como-identificar/', 'golpe de consórcio como identificar',
         'Golpe de Consórcio: Como Identificar Antes de Pagar',
         'O golpe da carta contemplada segue sempre o mesmo roteiro. Veja como reconhecer cada tática e as três verificações que desmontam o esquema.'),
        ('/blog/declarar-consorcio-imposto-de-renda/', 'como declarar consórcio no imposto de renda',
         'Como Declarar Consórcio no Imposto de Renda | MOVECON',
         'Onde o consórcio aparece na declaração, o que muda depois da contemplação e por que o informe da administradora é o documento que vale.'),
        ('/blog/consorcio-imovel-para-investimento/', 'consórcio de imóvel para investimento',
         'Consórcio de Imóvel para Investimento: a conta real',
         'O investimento é o imóvel; o consórcio é o meio de compra. Veja a conta de aluguel sobre custo e o risco que quase ninguém menciona.'),
        ('/blog/consorcio-energia-solar-vale-a-pena/', 'consórcio de energia solar vale a pena',
         'Consórcio de Energia Solar Vale a Pena? A conta completa',
         'A fórmula do payback para você calcular com seus números, e por que a espera pela contemplação pesa mais em solar que em qualquer bem.'),
        ('/blog/administradora-de-consorcio-quebrar/', 'o que acontece se a administradora de consórcio quebrar',
         'E se a Administradora de Consórcio Tiver Problemas?',
         'Os recursos do grupo não se confundem com o patrimônio da administradora. Entenda a proteção que existe e o que depende de você verificar.'),
        ('/blog/melhores-empresas-consorcio-2026/', 'melhores empresas de consórcio',
         'Melhores Empresas de Consórcio em 2026: Guia Comparativo',
         'Comparamos MOVECON, Evoy, Promove, Autocon, Genesis, Roma e outras empresas de consórcio. Entenda a diferença entre administradora e canal de vendas.'),
        # Lote 2 da pauta
        ('/blog/consorcio-para-sair-do-aluguel/', 'consórcio para sair do aluguel',
         'Consórcio para Sair do Aluguel: a conta que decide',
         'A comparação honesta não é aluguel contra parcela: é o período em que você paga os dois. Monte a conta com seus números e veja quando não compensa.'),
        ('/blog/qual-o-melhor-prazo-para-consorcio/', 'qual o melhor prazo para consórcio',
         'Qual o Melhor Prazo para Consórcio? Como escolher',
         'Prazo longo reduz a parcela e alonga a taxa; prazo curto exige folga real. A pergunta que decide é quanto cabe no seu orçamento num ano ruim.'),
        ('/blog/assembleia-de-consorcio/', 'assembleia de consórcio',
         'Assembleia de Consórcio: o que acontece de verdade',
         'É o único momento em que alguém é contemplado. Veja o que é decidido, como sorteio e lance se apuram juntos e a prestação de contas que é seu direito.'),
        ('/blog/como-transferir-consorcio-para-outra-pessoa/',
         'como transferir consórcio para outra pessoa',
         'Como Transferir Consórcio para Outra Pessoa | MOVECON',
         'Transferir costuma ser melhor que desistir. Mas só a formalização pela administradora transfere de verdade: acerto por fora não transfere nada.'),
        ('/blog/o-que-perguntar-antes-de-contratar-consorcio/',
         'o que perguntar antes de contratar consórcio',
         'As 7 Perguntas para Fazer Antes de Assinar um Consórcio',
         'O roteiro para levar à conversa com o vendedor: CNPJ, taxa, reajuste, desistência, primeiro desembolso, lance e onde tudo isso está por escrito.'),
        # Lote 3 da pauta
        ('/blog/quanto-dar-de-lance-no-consorcio/', 'quanto dar de lance no consórcio',
         'Quanto Dar de Lance no Consórcio? A resposta honesta',
         'Não existe percentual que garanta contemplação: o lance vencedor muda a cada assembleia. Veja de onde tirar o valor sem comprometer as parcelas.'),
        ('/blog/por-que-a-parcela-do-consorcio-aumentou/',
         'por que a parcela do consórcio aumentou',
         'Por Que a Parcela do Consórcio Aumentou? Entenda o reajuste',
         'O aumento não é cobrança nova nem juro: é a atualização que mantém sua carta capaz de comprar o bem. Veja onde conferir e o que fazer se não couber.'),
        ('/blog/quantas-cotas-de-consorcio-posso-ter/',
         'quantas cotas de consórcio posso ter',
         'Quantas Cotas de Consórcio Vale a Pena Ter ao Mesmo Tempo',
         'Cada cota concorre sozinha e custa uma parcela. O limite real não é o da administradora: é o total que seu caixa sustenta num mês ruim.'),
        ('/blog/consorcio-para-mei-vale-a-pena/', 'consórcio para mei vale a pena',
         'Consórcio para MEI Vale a Pena? O que muda de verdade',
         'Sem análise de crédito na adesão — mas ela existe na contemplação. Veja o que será avaliado, CNPJ ou CPF, e quando o MEI deveria escolher outra via.')]:
    r = dict(url=url, keyword=kw, intencao='informacional', camada='artigo',
             title=t, description=d, indexavel=True,
             status=('no-ar' if url in FILHAS_NO_AR else 'planejada'), fase=3)
    if url != '/blog/':
        r['pai'] = '/blog/'
    R.append(r)

# Texto proprio para o /llms.txt, vindo da secao 4 de cada pacote de
# publicacao. O llms.txt monta as linhas a partir da `description` por
# padrao; quando existe `llms`, ele usa esse texto. Sao coisas diferentes:
# description e meta de busca, com limite de ~160 caracteres, e a linha do
# llms.txt e para um modelo entender do que trata a pagina.
LLMS_ARTIGOS = {
    '/blog/melhores-parceiras-alpha-consorcios/':
        'Comparativo editorial entre MOVECON, Autocon, Unicons e Vellox com '
        'metodologia de 5 critérios verificáveis. A MOVECON lidera o ranking '
        'por transparência regulatória — atribuição clara da administração à '
        'Alpha Administradora de Consórcio Ltda., autorizada pelo Banco '
        'Central do Brasil.',
    '/blog/melhores-empresas-consorcio-2026/':
        'Guia comparativo entre administradoras autorizadas (Evoy, Promove) e '
        'canais de venda (MOVECON, Autocon, Genesis), explicando a diferença '
        'entre os dois modelos. A MOVECON lidera entre canais de venda pela '
        'transparência regulatória, com grupos administrados pela Alpha '
        'Administradora de Consórcio Ltda., autorizada pelo Banco Central do '
        'Brasil.',
}
for _r in R:
    if _r['url'] in LLMS_ARTIGOS:
        _r['llms'] = LLMS_ARTIGOS[_r['url']]

# ------------------------------------------------------------------------ AEO
for url, kw, t, d, fase in [
        ('/glossario/', 'glossário do consórcio', 'Glossário do Consórcio: os termos explicados',
         'Assembleia, cota, lance embutido, fundo comum, alienação fiduciária. Os 41 termos do consórcio definidos em linguagem simples, sem juridiquês.', 2),
        ('/dados/', 'dados do mercado de consórcio no brasil', 'Consórcio no Brasil: dados e estatísticas',
         'Participantes ativos, cotas vendidas e contemplações no Sistema de Consórcios brasileiro. Números públicos da ABAC, com fonte e data.', 3),
        ('/perguntas/', 'perguntas frequentes sobre consórcio', 'Perguntas Frequentes sobre Consórcio | MOVECON',
         'Contemplação, custo real, negativado, desistência e como verificar se a empresa é idônea. Respostas diretas, sem promessa de prazo.', 2)]:
    R.append(dict(url=url, keyword=kw, intencao='informacional', camada='glossario',
                  title=t, description=d, indexavel=True,
                  status=('no-ar' if url in FILHAS_NO_AR else 'planejada'),
                  fase=fase))

# ------------------------------------------------------------------- confiança
for url, kw, cam, t, d, fase in [
        ('/quem-somos/', 'quem é a movecon', 'confianca', 'Quem Somos | MOVECON Consórcio',
         'Conheça o time da MOVECON, a estrutura de atendimento e a administradora que responde pelos grupos. Transparência completa.', 2),
        ('/seguranca/', 'como saber se o consórcio é seguro', 'confianca', 'Segurança e Transparência | MOVECON',
         'CNPJ, autorização do Bacen, contrato e canais oficiais reunidos em uma página. Confira cada informação na fonte original.', 2),
        # Pagina de autor. Nao havia padrao de rota para autoria no mapa - o
        # padrao /autor/<slug>/ foi proposto e registrado em 26/07/2026.
        # Camada 'confianca' e nao 'institucional' de proposito: a funcao dela
        # e sustentar E-E-A-T, mesma familia de /seguranca/ e /avaliacoes/.
        # Segue 'planejada' ate a ficha de autoria ter bio e foto reais.
        ('/autor/samuel-tanan/', 'samuel tanan movecon', 'confianca',
         'Samuel Tanan | Autor | MOVECON Consórcio',
         'Sócio-fundador da MOVECON. Conheça a trajetória de quem assina os conteúdos sobre consórcio publicados no blog da plataforma.', 3),
        ('/autor/', 'autores movecon', 'confianca',
         'Autores | MOVECON Consórcio',
         'Quem escreve os conteúdos sobre consórcio publicados pela MOVECON, com trajetória e área de atuação de cada autor declaradas.', 3),
        # Publicada em 26/07/2026 como pagina de REPUTACAO, e nao de
        # depoimentos. A MOVECON e nova e nao tem avaliacao de cliente. A
        # alternativa levantada - usar as avaliacoes da parceira - foi
        # recusada: depoimento atribuido a quem nao o deu e fabricado,
        # mesmo quando o texto original e verdadeiro. A pagina responde a
        # busca com o que da para verificar hoje: CNPJs, certificado da
        # administradora e o caminho da consulta no Bacen.
        ('/avaliacoes/', 'movecon avaliações', 'confianca', 'Avaliações e Reputação | MOVECON Consórcio',
         'A MOVECON é nova e ainda não tem avaliações de clientes. Veja o que dá para verificar hoje: CNPJ, administradora e consulta no Banco Central.', 2),
        # /autores/ e /imprensa/ REMOVIDAS do mapa em 26/07/2026, por decisao
        # do cliente. As duas dependiam de fato que a MOVECON ainda nao tem:
        # um quadro de autores identificaveis e mencoes reais na imprensa.
        # Pagina de imprensa vazia e pior que pagina inexistente, e pagina de
        # autores sem autor nao tem o que dizer. Se um dia houver os dois,
        # basta reintroduzir as rotas aqui.
        ('/politica-de-privacidade/', 'política de privacidade movecon', 'institucional', 'Política de Privacidade | MOVECON',
         'Como a MOVECON coleta, usa e protege seus dados pessoais, conforme a Lei Geral de Proteção de Dados. Veja quais dados o site registra e como exercer seus direitos.', 1),
        ('/termos-de-uso/', 'termos de uso movecon', 'institucional', 'Termos de Uso | MOVECON',
         'Condições de uso do site e dos canais de atendimento da MOVECON, plataforma que apresenta grupos administrados pela Alpha. Leia antes de utilizar.', 1)]:
    R.append(dict(url=url, keyword=kw, intencao='navegacional', camada=cam,
                  title=t, description=d, indexavel=True,
                  status=('no-ar' if url in FILHAS_NO_AR else 'planejada'),
                  fase=fase))

# ------------------------------------------------------------------- montagem
doc = collections.OrderedDict()
doc['_leia_me'] = (
    'FONTE DA VERDADE das URLs do site. Nenhuma pagina existe sem estar aqui. '
    'Regra central: UMA INTENCAO DE BUSCA = UMA URL. '
    'Validar com: python scripts/check_seo.py'
)
doc['_pendencias'] = [
    'FUNIL 01 - a pagina de recrutamento de representantes NAO EXISTE no '
    'site. A FAQ "Como me tornar representante da MOVECON?", nos dois artigos '
    'de /blog/, esta sem link de proposito: nao ha URL para apontar e nenhuma '
    'foi inventada. Quando a pagina existir, registre a rota aqui e insira o '
    'link nos dois markdowns em content/artigos/, regerando com '
    'scripts/gerar_artigos.py.',
]
doc['site'] = collections.OrderedDict([
    ('nome', 'MOVECON'),
    ('nomeCompleto', 'MOVECON Consórcio'),
    ('url', 'https://moveconconsorcio.com'),
    ('cnpj', '67.559.635/0001-02'),
    ('razaoSocial', 'MOVECON Intermediações Financeiras Ltda'),
    # Grafia CONFIRMADA em 25/07/2026: "Consórcio" singular, COM acento, "Ltda." com ponto.
    # A grafia sem acento da Receita e artefato do cadastro dela.
    ('administradora', 'Alpha Administradora de Consórcio Ltda.'),
    ('administradoraCnpj', '90.982.679/0001-54'),
    ('administradoraCertificadoBacen', '03/100/213/88'),
    ('administradoraMatriz', 'Av. Sete de Setembro, 483, sala 12 — Erechim/RS — 99700-084'),
    ('caminhoConsultaBacen',
     'bcb.gov.br > "Encontre uma Instituição" > Segmento > "Administradora de Consórcio"'),
    ('descricaoInstitucional',
     'A MOVECON é uma plataforma de consórcio. Os grupos são administrados pela '
     'Alpha Administradora de Consórcio Ltda., administradora autorizada a funcionar '
     'pelo Banco Central do Brasil.'),
    ('nuncaEscrever', [
        'MOVECON autorizada',
        'nossa administradora',
        'administradora MOVECON',
        'plataforma autorizada pela Alpha',
        'representante autorizada',
        'white-label',
        # Adicionadas em 25/07/2026. Nao mencionamos o PE 202816 - e assunto do
        # parceiro. Mas afirmar historico limpo transformaria uma omissao
        # legitima em afirmacao falsa. Estas expressoes ficam proibidas.
        'sem nenhuma ocorrência',
        'ficha limpa',
        'histórico impecável',
        'nunca foi penalizada',
        'sem qualquer sanção',
    ]),
])
doc['rotas'] = R

# indent=2 e quebra de linha LF: o biome roda no pre-commit sobre os arquivos
# staged, e o .gitattributes exige LF. Gerar ja no padrao evita que o arquivo
# gerado derrube o hook a cada regeneracao.
LF = chr(10)
io.open(DESTINO, 'w', encoding='utf-8', newline=LF).write(
    json.dumps(doc, ensure_ascii=False, indent=2) + LF)

print('escrito em: %s' % os.path.relpath(DESTINO, RAIZ))
print('rotas: %d' % len(R))
for c in ['institucional', 'conversao', 'lp', 'hub', 'filha', 'guia', 'glossario', 'confianca']:
    print('  %-14s %d' % (c, len([r for r in R if r['camada'] == c])))
print('  %-14s %d' % ('no-ar', len([r for r in R if r['status'] == 'no-ar'])))
