# -*- coding: utf-8 -*-
"""
python scripts/check_seo.py [--wp]

Quebra o build quando a arquitetura de URLs e violada. Roda no pre-commit.
A disciplina de nao canibalizar keyword nao pode depender de memoria: com 99
rotas, memoria sempre perde.

ERRO  = violacao de arquitetura, ou problema em pagina que JA esta no ar.
AVISO = pendencia de copy em pagina ainda planejada (resolve na fase de conteudo).

--wp  consulta o WordPress via SSH e valida a sincronia mapa <-> site:
      toda pagina publicada existe no mapa, e toda rota 'no-ar' existe no site.
      Sem a flag, o script roda offline (util no pre-commit sem rede).
"""
import io
import re
import json
import os
import subprocess
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAPA = os.path.join(RAIZ, 'content', 'keyword-map.json')

SSH_HOST = 'root@2.24.220.21'
SSH_KEY = os.path.expanduser('~/.ssh/id_ed25519')
WP = 'bash /root/wpcli-movecon.sh'

# 'artigo' e a camada do /blog/: comparativos editoriais que citam
# concorrentes nomeados. Separada de 'guia' de proposito - guia explica
# o mecanismo do consorcio, artigo compara players do mercado, e as duas
# coisas tem exposicao juridica bem diferente.
CAMADAS = {'institucional', 'conversao', 'lp', 'hub', 'filha', 'artigo',
           'guia', 'glossario', 'confianca', 'local'}
INTENCOES = {'transacional', 'comercial', 'informacional', 'navegacional'}
STATUS = {'no-ar', 'em-producao', 'planejada'}

erros, avisos = [], []


def carregar():
    with io.open(MAPA, encoding='utf-8') as fh:
        return json.load(fh)


def validar_mapa(doc):
    rotas = doc['rotas']
    por_url = {r['url']: r for r in rotas}
    urls, keywords = set(), {}

    for r in rotas:
        url = r.get('url', '<sem url>')
        rascunho = r.get('status') == 'planejada'
        destino = avisos if rascunho else erros

        # --- unicidade -------------------------------------------------
        if url in urls:
            erros.append('URL duplicada: %s' % url)
        urls.add(url)

        k = r.get('keyword', '').lower().strip()
        if not k:
            erros.append('Rota sem keyword: %s' % url)
        elif k in keywords:
            erros.append('CANIBALIZACAO - keyword "%s" em %s e %s'
                         % (r['keyword'], keywords[k], url))
        else:
            keywords[k] = url

        # --- formato de URL --------------------------------------------
        if not url.startswith('/') or not url.endswith('/'):
            erros.append('URL fora do padrao (precisa abrir e fechar com "/"): %s' % url)
        if url != url.lower():
            erros.append('URL com maiuscula: %s' % url)

        # --- hierarquia -------------------------------------------------
        pai = r.get('pai')
        if pai and pai not in por_url:
            erros.append('Pai inexistente em %s: %s' % (url, pai))
        if pai == url:
            erros.append('Rota e pai de si mesma: %s' % url)

        # --- enums ------------------------------------------------------
        if r.get('camada') not in CAMADAS:
            erros.append('Camada invalida em %s: %s' % (url, r.get('camada')))
        if r.get('intencao') not in INTENCOES:
            erros.append('Intencao invalida em %s: %s' % (url, r.get('intencao')))
        if r.get('status') not in STATUS:
            erros.append('Status invalido em %s: %s' % (url, r.get('status')))

        # --- copy -------------------------------------------------------
        if r.get('indexavel'):
            t = r.get('title', '')
            d = r.get('description', '')
            if len(t) > 60:
                destino.append('Title com %d caracteres (max. 60): %s' % (len(t), url))
            if not 110 <= len(d) <= 165:
                destino.append('Description com %d caracteres (ideal 120-160): %s' % (len(d), url))

        # --- regra de arquitetura: LP nunca indexa ----------------------
        if r.get('camada') == 'lp' and r.get('indexavel'):
            erros.append('LP marcada como indexavel: %s' % url)
        if url.startswith('/lp/') and r.get('indexavel'):
            erros.append('Rota /lp/ indexavel: %s' % url)

    # --- compliance de nomenclatura -------------------------------------
    proibidas = [p.lower() for p in doc['site'].get('nuncaEscrever', [])]
    for r in rotas:
        blob = ('%s %s' % (r.get('title', ''), r.get('description', ''))).lower()
        for p in proibidas:
            if p not in blob:
                continue
            if permitido_em_rota(p, r['url']):
                continue
            erros.append('COMPLIANCE - expressao proibida "%s" em %s' % (p, r['url']))


# Termo -> prefixos de rota onde ele PODE aparecer. Fora disso e erro.
#
# FGTS so existe para imovel residencial: a lei do fundo nao permite usar em
# veiculo, servico, maquina ou embarcacao. Citar em outra modalidade nao e
# imprecisao de copy, e informacao falsa numa pagina sobre dinheiro.
#
# ITBI, escritura e registro sao custos de transmissao de imovel. Emplacamento
# e transferencia sao de veiculo. Trocar um pelo outro entrega ao leitor uma
# conta que ele nao vai ter - ou esconde uma que vai.
# Construcoes que prometem parcela que nao muda. A parcela MUDA: e reajustada
# pelo indice do contrato, e o proprio /guia/reajuste-da-parcela/ explica isso.
#
# "Sem juros e sem variacao de taxa, a parcela entra no planejamento anual sem
# surpresa" nasceu num card de vantagem e se espalhou por 12 lugares antes de
# alguem notar. Em pagina sobre dinheiro isso e informacao falsa, nao
# imprecisao de copy - e o erro nasceu duas vezes em card de vantagem, que e
# onde a tentacao de simplificar e maior.
#
# O que E previsivel: a ausencia de juros e a regra estar no contrato. O valor
# em reais, nao.
#
# Valor = rotas onde o padrao PODE aparecer, porque ali ele nega o conceito
# em vez de prometer.
PARCELA_FIXA = {
    'sem variacao': (),
    'sem variacao de taxa': (),
    'parcela fixa': (),
    'valor fixo': (),
    'sem surpresa': (),
    'sem sobressalto': (),
    'sem reajuste': ('/guia/reajuste-da-parcela/',),
}


# Expressoes que deixaram de ser proibicao absoluta e viraram regra de ESCOPO.
# Mesmo mecanismo da PARCELA_FIXA: valor = onde o termo PODE aparecer.
#
# "white-label" (decisao do cliente em 26/07/2026): descreve a operacao para
# quem ja opera no mercado - candidato a representante, parceiro, leitor da
# pagina institucional. Para o CONSUMIDOR o termo nao informa nada e embaralha
# o unico ponto que precisa ficar claro: quem administra o grupo e a Alpha, nao
# a MOVECON. Em pagina de audiencia consumidor a construcao segue sendo
# "plataforma que comercializa grupos administrados pela Alpha".
#
# RESSALVA REGISTRADA: o motivo original da proibicao no 01-compliance.md nao
# era audiencia, era "descreve relacao contratual que nao foi documentada".
# Mudar o escopo nao resolve esse ponto - em /quem-somos/ a afirmacao continua
# sendo sobre um contrato. Ver 01-compliance.md, secao da decisao datada.
ESCOPO_TERMO = {
    'white-label': {
        'rotas': ('/seja-um-representante/', '/quem-somos/', '/autor/'),
        # validar_prosa varre arquivo, nao rota: os prefixos abaixo sao os
        # nomes de arquivo que correspondem as rotas acima.
        # 'caixa-autor-' NAO entra: a caixa e renderizada no rodape de TODO
        # artigo, ou seja, em pagina de audiencia consumidor. Ela carrega a
        # bioCurta, que pela mesma decisao nao usa o termo. Manter o prefixo
        # aqui seria abrir na varredura de arquivo a porta que validar_autoria
        # fecha no campo.
        'arquivos': ('pagina-quem-somos', 'pagina-seja-um-representante',
                     'autor-'),
        'campos_autor': ('bioLonga',),
    },
}


def com_escopo(termo):
    """Regra de escopo do termo, ou None se ele for proibicao absoluta."""
    return ESCOPO_TERMO.get(termo.lower().strip())


def permitido_em_rota(termo, rota):
    reg = com_escopo(termo)
    return bool(reg) and any(rota.startswith(p) for p in reg['rotas'])


def permitido_em_arquivo(termo, caminho_rel):
    reg = com_escopo(termo)
    if not reg:
        return False
    nome = os.path.basename(caminho_rel).lower()
    return any(nome.startswith(p.lower()) for p in reg['arquivos'])


TERMOS_MODALIDADE = {
    'fgts': ('/consorcio-imoveis', '/guia/primeiro-imovel/', '/glossario/',
             '/guia/lance-no-consorcio/', '/perguntas/'),
    'itbi': ('/consorcio-imoveis', '/guia/primeiro-imovel/'),
    'escritura': ('/consorcio-imoveis', '/guia/primeiro-imovel/'),
    'emplacamento': ('/consorcio-veiculos', '/consorcio-moto',
                     '/consorcio-caminhao', '/consorcio-maquinas-agricolas'),
    'licenciamento': ('/consorcio-veiculos', '/consorcio-moto',
                      '/consorcio-caminhao', '/consorcio-maquinas-agricolas'),
}


def validar_modalidade():
    """
    Nenhuma pagina menciona beneficio ou custo de outra modalidade.

    Regra do cliente: FGTS fora de imoveis e FALHA, nao aviso. Existe porque
    a replicacao de molde carrega o texto junto com a estrutura, e o erro so
    aparece quando um leitor tenta usar FGTS num consorcio de carro.
    """
    import unicodedata

    def norm(t):
        t = unicodedata.normalize('NFD', t.lower())
        return ''.join(c for c in t
                       if unicodedata.category(c) != 'Mn')

    erros = []
    conteudo = os.path.join(RAIZ, 'content')

    def checar(rota, blob, origem):
        texto = json.dumps(blob, ensure_ascii=False).lower()
        for termo, permitidos in TERMOS_MODALIDADE.items():
            if termo not in texto:
                continue
            if not any(rota.startswith(p) for p in permitidos):
                erros.append('MODALIDADE - "%s" em %s (%s). Esse termo so se '
                             'aplica a: %s'
                             % (termo, rota, origem, ', '.join(permitidos)))

        # Mesma mecanica, outra regra: promessa de parcela que nao muda.
        for termo, permitidos in PARCELA_FIXA.items():
            if termo not in norm(texto):
                continue
            if not any(rota.startswith(p) for p in permitidos):
                erros.append('PARCELA FIXA - "%s" em %s (%s). A parcela e '
                             'reajustada pelo indice do contrato; prometer que '
                             'ela nao muda e informacao falsa.'
                             % (termo, rota, origem))

    caminho = os.path.join(conteudo, 'segmentos.json')
    if os.path.exists(caminho):
        with io.open(caminho, encoding='utf-8') as fh:
            for seg in json.load(fh)['segmentos']:
                checar('/%s/' % seg['slug'], seg, 'segmentos.json')

    for nome in sorted(os.listdir(conteudo)):
        if nome.startswith('filhas-') and nome.endswith('.json'):
            with io.open(os.path.join(conteudo, nome), encoding='utf-8') as fh:
                d = json.load(fh)
            for x in d.get('filhas', []):
                checar('%s%s/' % (d['pai'], x['slug']), x, nome)
        if nome.startswith('guias-') and nome.endswith('.json'):
            with io.open(os.path.join(conteudo, nome), encoding='utf-8') as fh:
                d = json.load(fh)
            for x in d.get('guias', []):
                checar('/guia/%s/' % x['slug'], x, nome)

    return erros


# Construcoes que afirmam ausencia de desembolso inicial.
SEM_ENTRADA = (
    'sem entrada',
    'sem entrada obrigatoria',
    'comeca pela parcela',
    'comeca a pagar a parcela',
    'so a parcela',
    'sem desembolso inicial',
    'sem precisar de entrada',
    'sem dar entrada',
    'nao ha entrada',
    'nao precisa de entrada',
    'nenhuma entrada',
)

# Marcadores que, no MESMO bloco, tornam a afirmacao honesta.
REVELA_ANTECIPACAO = (
    'primeira parcela',
    # o indicador ordinal feminino nao e acento: NFD nao o decompoe, entao
    # "1a parcela" nunca casaria com "1a parcela" escrito com o ordinal.
    '1ª parcela',
    '1a parcela',
    'antecipa',
    'antecipacao',
    'maior que as demais',
    'maior que as seguintes',
)


def validar_sem_entrada():
    """
    "Sem entrada" nunca aparece sozinho.

    O produto tem antecipacao de taxa de administracao: a primeira parcela e
    maior que as demais. Afirmar "sem entrada" sem essa ressalva no mesmo
    bloco de texto e factualmente desalinhado - ver 01-compliance.md, secao
    "Custo de adesao".

    A regra e de CO-OCORRENCIA, nao de proibicao: "sem entrada" e verdade
    quanto ao bem, e continua sendo diferencial contra o financiamento. So
    nao pode vir desacompanhado.
    """
    import unicodedata

    def norm(t):
        t = unicodedata.normalize('NFD', t.lower())
        return ''.join(c for c in t if unicodedata.category(c) != 'Mn')

    erros = []
    conteudo = os.path.join(RAIZ, 'content')

    def checar(rota, valor, origem, campo):
        if not isinstance(valor, str):
            return
        n = norm(valor)
        # Fronteira de palavra: sem isso, "compromisso a parcela" casa com
        # "so a parcela" e a regra acusa texto que nao fala de entrada.
        achado = next(
            (p for p in SEM_ENTRADA if re.search(r'\b%s\b' % re.escape(p), n)),
            None)
        if not achado:
            return
        if any(m in n for m in REVELA_ANTECIPACAO):
            return
        erros.append('SEM_ENTRADA - "%s" sem a ressalva da primeira parcela '
                     'maior, em %s (%s / %s): "%s"'
                     % (achado, rota, origem, campo, valor[:70]))

    def varrer(rota, obj, origem, campo='?'):
        if isinstance(obj, str):
            checar(rota, obj, origem, campo)
        elif isinstance(obj, list):
            # Par [titulo, descricao] de card ou FAQ e UM bloco: os dois
            # renderizam juntos, um debaixo do outro. Avaliar separado
            # acusaria o titulo de um card cuja descricao ja traz a ressalva.
            if (len(obj) == 2 and all(isinstance(x, str) for x in obj)):
                checar(rota, ' '.join(obj), origem, campo)
                return
            for x in obj:
                varrer(rota, x, origem, campo)
        elif isinstance(obj, dict):
            for k, v in obj.items():
                if k.startswith('_'):
                    continue
                varrer(rota, v, origem, k)

    # keyword-map: title e description sao blocos por si so
    mapa = carregar()
    for r in mapa['rotas']:
        for campo in ('title', 'description'):
            checar(r['url'], r.get(campo, ''), 'keyword-map.json', campo)

    caminho = os.path.join(conteudo, 'segmentos.json')
    if os.path.exists(caminho):
        with io.open(caminho, encoding='utf-8') as fh:
            for seg in json.load(fh)['segmentos']:
                varrer('/%s/' % seg['slug'], seg, 'segmentos.json')

    for nome in sorted(os.listdir(conteudo)):
        if nome in ('keyword-map.json', 'faq-map.json', 'segmentos.json'):
            continue
        if not nome.endswith('.json'):
            continue
        with io.open(os.path.join(conteudo, nome), encoding='utf-8') as fh:
            d = json.load(fh)
        if nome.startswith('filhas-'):
            for x in d.get('filhas', []):
                varrer('%s%s/' % (d['pai'], x['slug']), x, nome)
        elif nome.startswith('guias-'):
            for x in d.get('guias', []):
                varrer('/guia/%s/' % x['slug'], x, nome)
        else:
            varrer('(%s)' % nome, d, nome)

    return erros


def validar_autoria(doc):
    """
    A bio publica do autor passa pelas mesmas 11 expressoes proibidas.

    Existe porque bio de autor e o unico texto do site escrito por uma pessoa
    sobre si mesma, e e exatamente ali que "socio da administradora" ou
    "white-label" entram sem malicia. O texto vem de fora do projeto e nao
    passa pelos geradores, entao nenhum outro validador o alcanca.

    Nao reclama de campo [PENDENTE]: quem barra pendente e o gerador, que se
    recusa a escrever. Aqui so se verifica o que ja tem texto real.
    """
    import unicodedata

    def norm(t):
        t = unicodedata.normalize('NFD', t.lower())
        return ''.join(c for c in t if unicodedata.category(c) != 'Mn')

    caminho = os.path.join(RAIZ, 'content', 'autor.json')
    if not os.path.isfile(caminho):
        return []
    ficha = json.load(io.open(caminho, encoding='utf-8'))
    proibidas = [p.lower() for p in doc['site'].get('nuncaEscrever', [])]
    extras = ['socio da administradora', 'socia da administradora',
              'dono da administradora', 'da alpha administradora',
              'administrador de consorcio', 'administradora movecon']
    achados = []
    for a in ficha.get('autores', []):
        for campo in ('nome', 'cargo', 'bioCurta', 'bioLonga'):
            txt = a.get(campo, '')
            if not isinstance(txt, str) or txt.startswith('[PENDENTE'):
                continue
            n = norm(txt)
            for p in proibidas + extras:
                if norm(p) not in n:
                    continue
                # Termo com escopo: na ficha de autoria ele so vale nos campos
                # declarados. "white-label" entra na bio longa, onde ha espaco
                # para a frase inteira; nao entra na bio curta, que aparece ao
                # fim de cada artigo - ou seja, em pagina de consumidor.
                reg = com_escopo(p)
                if reg and campo in reg.get('campos_autor', ()):
                    continue
                achados.append(
                    'AUTORIA - expressao proibida "%s" em %s / %s'
                    % (p, a.get('slug', '?'), campo))
    return achados


def validar_prosa(doc):
    """
    Varre o HTML/PHP das paginas atras das expressoes proibidas.

    Existe porque validar so o keyword-map nao pega dano em prosa: uma
    substituicao mal feita pode injetar "MOVECON autorizada" no corpo de uma
    pagina sem tocar em title nem description, e o site vai ao ar violando
    compliance com o validador dando OK.
    """
    proibidas = [p.lower() for p in doc['site'].get('nuncaEscrever', [])]
    # variacoes que a regra proibe mas a string exata nao cobre
    padroes = proibidas + [
        'movecon é autorizada', 'movecon e autorizada',
        'autorizada pela alpha', 'somos uma administradora',
        'quem autoriza a movecon',
    ]
    alvos = []
    for pasta in ('_codigo', 'build'):
        base = os.path.join(RAIZ, pasta)
        if not os.path.isdir(base):
            continue
        for nome in sorted(os.listdir(base)):
            if nome.endswith(('.html', '.php')):
                alvos.append(os.path.join(base, nome))

    for caminho in alvos:
        with io.open(caminho, encoding='utf-8') as fh:
            texto = fh.read().lower()
        rel = os.path.relpath(caminho, RAIZ).replace('\\', '/')
        for p in padroes:
            if not p or p not in texto:
                continue
            if permitido_em_arquivo(p, rel):
                continue
            erros.append('COMPLIANCE NA PROSA - "%s" em %s' % (p, rel))

    # REGRA PERMANENTE: nenhuma pagina publica com placeholder renderizado.
    #
    # O marcador {{...}} existe para segurar dado que ainda nao chegou -
    # taxa, prazo, valor de carta. Ele e util no rascunho e catastrofico no
    # ar: o visitante le "{{DADO_PENDENTE}}" numa pagina que fala de dinheiro,
    # e a pagina perde exatamente a credibilidade que o resto do site tenta
    # construir.
    #
    # Por isso o placeholder nao e aviso, e ERRO: ou o dado chega, ou a frase
    # e reescrita sem ele, ou a pagina nao vai ao ar.
    for caminho in alvos:
        with io.open(caminho, encoding='utf-8') as fh:
            texto = fh.read()
        rel = os.path.relpath(caminho, RAIZ).replace(os.sep, '/')
        marcadores = sorted(set(re.findall(r'\{\{[^}]{1,60}\}\}', texto)))
        for m in marcadores:
            erros.append('PLACEHOLDER NAO RESOLVIDO - %s em %s' % (m, rel))

    # sintaxe quebrada por substituicao encadeada
    for caminho in alvos:
        with io.open(caminho, encoding='utf-8') as fh:
            texto = fh.read()
        rel = os.path.relpath(caminho, RAIZ).replace('\\', '/')
        for ruim, rotulo in [('Ltda..', 'ponto duplicado'),
                             ('Ltda. de Consórcio', 'nome duplicado'),
                             ('Ltda. ,', 'virgula solta'),
                             ('Ltda. Ltda', 'sufixo duplicado')]:
            if ruim in texto:
                erros.append('SINTAXE (%s) - "%s" em %s' % (rotulo, ruim, rel))


# PAGINA_VAZIA — rota indexavel servindo corpo vazio.
#
# SEGUNDA OCORRENCIA DA MESMA FAMILIA. /lp/ foi ao ar com 1 byte de conteudo
# e H1 "LP", cru, porque existia so para o permalink /lp/<slug>/ se formar.
# Corrigido. Semanas depois criei /autor/ pelo MESMO motivo - pai de
# /autor/<slug>/ - e ela foi ao ar com 0 caractere de corpo e nenhum H1.
#
# A causa nao e descuido, e estrutural: pagina-pai de permalink e criada por
# necessidade tecnica, sem conteudo previsto, e nada no fluxo pergunta se ela
# tem corpo. Vai continuar acontecendo toda vez que um silo novo precisar de
# pai - por isso vira detector, e nao lembrete.
#
# POR QUE SO NO --wp: nenhuma das duas passou por gerador. Foram criadas
# direto no wp-cli, entao nao existe arquivo em build/ para inspecionar. O
# unico lugar onde o defeito aparece e o HTML SERVIDO. Checar build/ daria a
# sensacao de cobertura sem cobrir nenhum dos dois casos reais.
MIN_CORPO = 250   # caracteres de texto visivel, fora de nav/header/footer


def medir_corpo(html):
    """(caracteres de texto visivel, quantidade de H1) do conteudo da pagina.

    Descarta script, style, nav, header e footer: o rodape global do site tem
    centenas de caracteres e faria qualquer pagina vazia parecer cheia. Foi
    exatamente assim que /autor/ passou desapercebida - "a pagina tem 178 KB".
    """
    corpo = re.sub(r'(?is)<(script|style|nav|footer)[^>]*>.*?</\1>', ' ', html)

    # <header> NAO e descartado. Parece chrome do site, mas no Astra o titulo
    # do post vive em <header class="entry-header"> - descarta-lo fazia 17
    # artigos com H1 legitimo aparecerem como "sem H1". O menu do topo, que era
    # a razao de querer descartar header, ja sai junto com <nav>.
    h1 = len(re.findall(r'(?is)<h1[^>]*>.*?</h1>', corpo))

    m = re.search(r'(?is)<main[^>]*>(.*?)</main>', corpo)
    if m:
        corpo = m.group(1)
    texto = ' '.join(re.sub(r'(?s)<[^>]+>', ' ', corpo).split())
    return len(texto), h1


def _baixar(url):
    from urllib.request import urlopen, Request
    req = Request(url, headers={'User-Agent': 'movecon-check/1.0'})
    return urlopen(req, timeout=45).read().decode('utf-8', 'replace')


def validar_pagina_vazia(doc, baixar=None):
    """Nenhuma rota indexavel no ar serve corpo vazio ou sem H1.

    `baixar` e injetavel para teste - assim a regressao percorre o caminho
    real do validador sem publicar pagina vazia em producao para testa-la.
    """
    baixar = baixar or _baixar
    base = doc.get('site', {}).get('url', 'https://moveconconsorcio.com')
    base = base.rstrip('/')
    achados = []
    alvo = [r for r in doc['rotas']
            if r.get('status') == 'no-ar' and r.get('indexavel')]
    for r in alvo:
        try:
            html = baixar(base + r['url'])
        except Exception as exc:                               # noqa: BLE001
            achados.append('PAGINA VAZIA - nao consegui ler %s (%s)'
                           % (r['url'], type(exc).__name__))
            continue
        chars, h1 = medir_corpo(html)
        if h1 == 0:
            achados.append('PAGINA VAZIA - %s nao tem H1' % r['url'])
        if chars < MIN_CORPO:
            achados.append('PAGINA VAZIA - %s serve %d caractere(s) de corpo '
                           '(minimo %d)' % (r['url'], chars, MIN_CORPO))
    return achados


def validar_wp(doc):
    """Sincronia mapa <-> WordPress. Exige SSH."""
    if not os.path.exists(SSH_KEY):
        avisos.append('Chave SSH nao encontrada - checagem --wp pulada.')
        return

    # `--field=url` devolve o permalink completo. Usar post_name quebraria em
    # pagina filha: /simulador/veiculos/ viraria /veiculos/ e o check acusaria
    # "mapa mente" numa pagina que existe.
    cmd = ['ssh', '-i', SSH_KEY, '-o', 'StrictHostKeyChecking=no',
           '-o', 'ConnectTimeout=15', '-o', 'BatchMode=yes', SSH_HOST,
           '%s post list --post_type=page --post_status=publish --field=url' % WP]
    try:
        saida = subprocess.check_output(cmd, stderr=subprocess.STDOUT, timeout=90)
    except Exception as exc:                                   # noqa: BLE001
        avisos.append('Nao consegui consultar o WordPress (%s) - checagem --wp pulada.'
                      % type(exc).__name__)
        return

    publicadas = set()
    for linha in saida.decode('utf-8', 'replace').splitlines():
        linha = linha.strip()
        if not linha.startswith('http'):
            continue
        caminho = linha.split('//', 1)[-1]
        caminho = caminho[caminho.find('/'):] if '/' in caminho else '/'
        publicadas.add('/' + caminho.strip('/') + '/' if caminho.strip('/') else '/')

    no_mapa = {r['url'] for r in doc['rotas']}
    no_ar = {r['url'] for r in doc['rotas'] if r.get('status') == 'no-ar'}

    for url in sorted(publicadas - no_mapa):
        erros.append('PAGINA FANTASMA - publicada no WP e ausente do mapa: %s' % url)
    for url in sorted(no_ar - publicadas):
        erros.append('MAPA MENTE - marcada "no-ar" mas nao existe no WP: %s' % url)
    for url in sorted(publicadas & no_mapa - no_ar):
        erros.append('STATUS DESATUALIZADO - publicada no WP mas nao marcada "no-ar": %s' % url)


def main():
    doc = carregar()
    validar_mapa(doc)
    validar_prosa(doc)
    erros.extend(validar_modalidade())
    erros.extend(validar_sem_entrada())
    erros.extend(validar_autoria(doc))
    if '--wp' in sys.argv:
        validar_wp(doc)
        erros.extend(validar_pagina_vazia(doc))

    rotas = doc['rotas']
    if avisos:
        print('\n[!] %d pendencia(s) de copy em paginas planejadas:' % len(avisos))
        for a in avisos[:10]:
            print('    - %s' % a)
        if len(avisos) > 10:
            print('    ... e mais %d' % (len(avisos) - 10))

    if erros:
        print('\n[X] %d problema(s) na arquitetura de URLs:\n' % len(erros))
        for e in erros:
            print('    - %s' % e)
        print('\nCorrija content/keyword-map.json antes de commitar.\n')
        return 1

    no_ar = len([r for r in rotas if r['status'] == 'no-ar'])
    planejadas = len([r for r in rotas if r['status'] == 'planejada'])
    print('\n[OK] Arquitetura integra - nenhuma canibalizacao de keyword.')
    print('     %d rotas mapeadas - %d no ar - %d planejadas\n' % (len(rotas), no_ar, planejadas))
    return 0


if __name__ == '__main__':
    sys.exit(main())
