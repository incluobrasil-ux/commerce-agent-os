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
            if p in blob:
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
            if p and p in texto:
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
    if '--wp' in sys.argv:
        validar_wp(doc)

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
