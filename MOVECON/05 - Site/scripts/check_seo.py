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
import json
import os
import subprocess
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAPA = os.path.join(RAIZ, 'content', 'keyword-map.json')

SSH_HOST = 'root@2.24.220.21'
SSH_KEY = os.path.expanduser('~/.ssh/id_ed25519')
WP = 'bash /root/wpcli-movecon.sh'

CAMADAS = {'institucional', 'conversao', 'lp', 'hub', 'filha',
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


def validar_wp(doc):
    """Sincronia mapa <-> WordPress. Exige SSH."""
    if not os.path.exists(SSH_KEY):
        avisos.append('Chave SSH nao encontrada - checagem --wp pulada.')
        return

    cmd = ['ssh', '-i', SSH_KEY, '-o', 'StrictHostKeyChecking=no',
           '-o', 'ConnectTimeout=15', '-o', 'BatchMode=yes', SSH_HOST,
           '%s post list --post_type=page --post_status=publish --field=post_name' % WP]
    try:
        saida = subprocess.check_output(cmd, stderr=subprocess.STDOUT, timeout=90)
    except Exception as exc:                                   # noqa: BLE001
        avisos.append('Nao consegui consultar o WordPress (%s) - checagem --wp pulada.'
                      % type(exc).__name__)
        return

    slugs = [s.strip() for s in saida.decode('utf-8', 'replace').splitlines() if s.strip()]
    # a home tem slug proprio no WP, mas responde por "/"
    publicadas = set()
    for s in slugs:
        publicadas.add('/' if s in ('home', 'inicio') else '/%s/' % s)

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
